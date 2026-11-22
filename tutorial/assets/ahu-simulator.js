(() => {
  "use strict";
  const stepSeconds = 10;
  const proofDelay = 30;
  const lowTemperatureLimit = 5;
  const form = document.querySelector("#ahu-simulator");
  const status = document.querySelector("#ahu-status");
  const trend = document.querySelector("#ahu-trend");
  let time = 0;
  let unprovedSeconds = 0;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const { occupied, safety, proof, override, quality, temperature } = form.elements;
    time += stepSeconds;
    const requested = override.value === "released" ? occupied.checked : override.value === "start";
    const commanded = requested && safety.checked;
    const proven = commanded && proof.value === "normal";
    const airTemperature = temperature.valueAsNumber;
    const cold = quality.checked && airTemperature < lowTemperatureLimit;
    const loopEnabled = proven && quality.checked && !cold;
    unprovedSeconds = commanded && !proven ? unprovedSeconds + stepSeconds : 0;

    const alarms = [];
    if (unprovedSeconds >= proofDelay) alarms.push("Fan failed to prove");
    if (!quality.checked) alarms.push("Temperature quality bad");
    if (cold) alarms.push("Training low temperature");
    const source = override.value === "released" ? "Schedule" : "Operator " + override.value;
    const alarmText = alarms.join(", ") || "None";
    const row = trend.insertRow(0);
    for (const value of [
      time + " s",
      safety.checked ? source : source + " (safety veto)",
      commanded ? "On" : "Off",
      proven ? "On" : "Off",
      quality.checked ? airTemperature.toFixed(1) + " °C" : "Bad quality",
      loopEnabled ? "Enabled" : "Disabled",
      alarmText,
    ]) {
      row.insertCell().textContent = value;
    }
    if (trend.rows.length > 12) trend.deleteRow(-1);
    status.textContent = time + " seconds. Fan " + (commanded ? "on command" : "off command")
      + ", " + (proven ? "proven" : "not proven") + ". Active alarms: " + alarmText + ".";
  });

  form.addEventListener("reset", () => {
    time = 0;
    unprovedSeconds = 0;
    trend.replaceChildren();
    status.textContent = "Simulation reset. Advance one scan to begin again.";
  });
})();
