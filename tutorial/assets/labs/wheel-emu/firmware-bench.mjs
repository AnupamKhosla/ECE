import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import avr from "avr8js";

const {
  CPU, AVRIOPort, AVRTimer, AVRUSART, PinState, avrInstruction,
  portBConfig, portDConfig, timer0Config, timer1Config, timer2Config, usart0Config,
} = avr;

const clockHz = 16_000_000;
const cyclesPerMs = clockHz / 1000;
const edgesPerTurn = 3 * 100.37;
const durationMs = 11_700;
const motorTimeConstantMs = 220;

function loadFlash(path) {
  const flash = new Uint8Array(32 * 1024).fill(255);
  let upper = 0;
  let sawEnd = false;
  for (const line of readFileSync(path, "utf8").trim().split(/\r?\n/)) {
    assert(!sawEnd && /^:(?:[0-9a-fA-F]{2}){5,}$/.test(line), "Malformed Intel HEX record");
    const bytes = Buffer.from(line.slice(1), "hex");
    const [count, high, low, record] = bytes;
    const data = bytes.subarray(4, 4 + count);
    const address = (high << 8) | low;
    assert.equal(bytes.length, count + 5, "Invalid HEX record length");
    assert.equal(bytes.reduce((sum, byte) => sum + byte, 0) % 256, 0, "Invalid HEX checksum");
    switch (record) {
      case 0: {
        assert(upper + address + count <= flash.length, "Flash image is larger than an Uno");
        flash.set(data, upper + address);
        break;
      }
      case 1:
        assert.equal(count, 0, "Unexpected EOF payload");
        sawEnd = true;
        break;
      case 4:
        assert.equal(count, 2, "Unexpected extended address length");
        upper = (data[0] * 256 + data[1]) * 65536;
        break;
      default:
        throw new Error(`HEX record type ${record} is outside this Arduino build format`);
    }
  }
  assert(sawEnd, "Missing Intel HEX end record");
  return Uint16Array.from(
    { length: flash.length / 2 }, (_, address) => flash[address * 2] | (flash[address * 2 + 1] << 8)
  );
}

function scenario(ms) {
  const run = ms < 180 || (ms >= 350 && ms < 370)
    || (ms >= 550 && ms < 10_000) || (ms >= 10_250 && ms < 11_150);
  const encoderOnline = ms < 8_500 || ms >= 9_650;
  const loadRpm = ms >= 2_100 && ms < 5_500 ? 18 : ms >= 5_500 && ms < 6_800 ? 40 : 0;
  return { run, encoderOnline, loadRpm };
}

function runFirmware(flash) {
  const cpu = new CPU(flash, 2048);
  const portB = new AVRIOPort(cpu, portBConfig);
  const portD = new AVRIOPort(cpu, portDConfig);
  for (const config of [timer0Config, timer1Config, timer2Config]) new AVRTimer(cpu, config);
  const usart = new AVRUSART(cpu, usart0Config, clockHz);
  const serial = [];
  usart.onLineTransmit = (line) => serial.push(line.trim());

  let lastRead = 0;
  let lastModelCycle = 0;
  let enabled = false;
  let powering = false;
  let activeCycles = 0;
  let recentPoweredCycles = 0;
  let recentCycles = 0;
  const transitions = [];
  const samples = [];

  function readBridgePins() {
    if (powering) activeCycles += cpu.cycles - lastRead;
    lastRead = cpu.cycles;
    const standby = portD.pinState(4) === PinState.High;
    if (standby !== enabled) {
      transitions.push({ ms: cpu.cycles / cyclesPerMs, enabled: standby });
      enabled = standby;
    }
    const forward = portD.pinState(7) === PinState.High && portB.pinState(0) === PinState.Low;
    powering = standby && forward && portD.pinState(5) === PinState.High;
  }

  portD.addListener(readBridgePins);
  portB.addListener(readBridgePins);
  let speedRpm = 0;
  let encoderPhase = 0;
  let pulse = false;

  for (let ms = 0; ms < durationMs; ms++) {
    const { run, encoderOnline, loadRpm } = scenario(ms);
    portB.setPin(4, !run); // Uno D12
    portB.setPin(3, false); // Uno D11 selects the high target.
    portD.setPin(2, pulse && encoderOnline); // Uno D2 is the encoder input.
    const end = (ms + 1) * cyclesPerMs;
    while (cpu.cycles < end) {
      avrInstruction(cpu);
      cpu.tick();
    }
    readBridgePins();
    const elapsedCycles = cpu.cycles - lastModelCycle;
    const dtMs = elapsedCycles / cyclesPerMs;
    const effectiveDuty = activeCycles / elapsedCycles;
    const steadySpeed = Math.max(0, 130 * effectiveDuty - loadRpm);
    speedRpm += (steadySpeed - speedRpm) * (1 - Math.exp(-dtMs / motorTimeConstantMs));

    // Increment the shaft phase whether the feedback wire is connected or not.
    encoderPhase += speedRpm / 60 * edgesPerTurn * dtMs / 1000;
    pulse = encoderPhase >= 1;
    if (pulse) encoderPhase -= 1;
    assert(encoderPhase < 1 && (!pulse || speedRpm < 99),
      "The plant step must resolve separate encoder rising edges");

    recentPoweredCycles += activeCycles;
    recentCycles += elapsedCycles;
    activeCycles = 0;
    lastModelCycle = cpu.cycles;
    if ((ms + 1) % 25 === 0) {
      samples.push({
        ms: ms + 1,
        rpm: speedRpm,
        duty: recentPoweredCycles / recentCycles,
        loadRpm,
        encoderOnline,
        run,
      });
      recentPoweredCycles = 0;
      recentCycles = 0;
    }
  }
  return { samples, serial, transitions };
}

function checkOutputs(label, result) {
  const { samples, serial, transitions } = result;
  assert.equal(serial[0], "time_ms,target_rpm,measured_rpm,duty,edges");
  assert.equal(serial.filter((line) => line.startsWith("# no_encoder_edges")).length, 1);
  assert.deepEqual(transitions.map(({ enabled }) => enabled), [true, false, true, false]);
  const [firstOn, faultOff, secondOn, releasedOff] = transitions.map(({ ms }) => ms);
  assert(firstOn >= 588 && firstOn <= 593, "Drive must wait for a released, debounced press");
  assert(faultOff >= 9_100 && faultOff <= 9_300, "Missing edges must turn off the bridge");
  assert(secondOn >= 10_288 && secondOn <= 10_293, "Drive requires a new press after release");
  assert(releasedOff >= 11_150 && releasedOff < 11_152, "Release must disable without a speed sample");

  const loaded = samples.filter(({ ms }) => ms >= 5_000 && ms <= 5_475);
  const loadedMean = loaded.reduce((total, sample) => total + sample.rpm, 0) / loaded.length;
  const heavy = samples.filter(({ ms }) => ms >= 6_300 && ms <= 6_775);
  const maxHeavyDuty = Math.max(...heavy.map(({ duty }) => duty));
  const feedbackFault = samples.filter(({ ms }) => ms >= 8_500 && ms < faultOff);
  const maxFaultRpm = Math.max(...feedbackFault.map(({ rpm }) => rpm));
  if (label !== "open") {
    assert(loadedMean > 52 && loadedMean < 58, "PI should approach target with moderate load");
    assert(maxHeavyDuty >= 0.59 && maxHeavyDuty <= 0.62, "PI should reach the configured duty limit");
  } else {
    assert(loadedMean > 35 && loadedMean < 40, "Open loop should lose speed under load");
  }
  const maxExpectedFaultRpm = label === "pi-prior-policy" ? 80 : 60;
  assert(maxFaultRpm < maxExpectedFaultRpm, "Motor model exceeded this fixture's fault-speed expectation");
  if (label === "pi-prior-policy") {
    assert(maxFaultRpm > 72, "The prior policy should reveal acceleration without valid feedback");
  }
  return { firstOn, faultOff, secondOn, releasedOff, loadedMean, maxHeavyDuty, maxFaultRpm };
}

function saveRun(path, name, { samples, serial, transitions }) {
  const rows = samples.map(({ ms, rpm, duty, loadRpm, encoderOnline, run }) =>
    [ms, rpm.toFixed(3), duty.toFixed(5), loadRpm, Number(encoderOnline), Number(run)].join(","));
  writeFileSync(join(path, `${name}-plant.csv`),
    ["time_ms,model_rpm,bridge_duty,load_rpm_equivalent,encoder_online,run_pressed", ...rows, ""].join("\n"));
  writeFileSync(join(path, `${name}-serial.txt`), serial.join("\n") + "\n");
  const edges = transitions.map(({ ms, enabled }) => `${ms.toFixed(4)},${Number(enabled)}`);
  writeFileSync(join(path, `${name}-enable.csv`), ["time_ms,standby_enabled", ...edges, ""].join("\n"));
}

const [openPath, piPath, destination, priorPolicyPath] = process.argv.slice(2);
if (!openPath || !piPath || !destination || process.argv.length > 6) {
  console.error("Usage: node firmware-bench.mjs OPEN.hex PI.hex NEW_OUTPUT_DIRECTORY [PRIOR_PI.hex]");
  process.exit(2);
}

mkdirSync(destination);
const exercises = [["open", openPath], ["pi", piPath]];
if (priorPolicyPath) exercises.push(["pi-prior-policy", priorPolicyPath]);
for (const [name, path] of exercises) {
  const result = runFirmware(loadFlash(path));
  const summary = checkOutputs(name, result);
  saveRun(destination, name, result);
  console.log(name, JSON.stringify(summary));
}
