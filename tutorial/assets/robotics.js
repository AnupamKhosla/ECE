/* Models and controls for the robotics practice labs. */
(function () {
  "use strict";

  function simulateWheel(mode, scenario, delayEnabled, antiWindup) {
    const gains = { open: [0, 0], p: [0.004, 0], pi: [0.004, 0.018], high: [0.020, 0.040] };
    const [kp, ki] = gains[mode];
    const dt = 0.02;
    const lag = delayEnabled ? 6 : 0;
    const response = 1 - Math.exp(-dt / 0.22);
    let speed = 0;
    let integral = 0;
    const samples = [];

    for (let step = 0; step <= 250; step++) {
      const target = scenario === "saturation" && step < 100 ? 260 : 100;
      const load = scenario === "load" && step >= 125 ? 40 : 0;
      const feedback = lag ? samples[step - lag]?.speed ?? 0 : speed;
      const error = target - feedback;
      const demand = target / 200 + kp * error;
      const candidate = integral + ki * error * dt;
      const upperWindup = demand + candidate > 1 && error > 0;
      const lowerWindup = demand + candidate < 0 && error < 0;
      if (!antiWindup || (!upperWindup && !lowerWindup)) integral = candidate;
      const requested = demand + integral;
      const duty = Math.max(0, Math.min(1, requested));
      samples.push({ time: step * dt, target, speed, feedback, requested, duty });
      const steadySpeed = Math.max(0, 200 * duty - load);
      speed += response * (steadySpeed - speed);
    }
    return samples;
  }

  function replayOdometry(diameterMm, trackMm, fault) {
    const countsPerTurn = 2400;
    const metresPerCount = Math.PI * (diameterMm / 1000) / countsPerTurn;
    const track = trackMm / 1000;
    const log = [[11753, 11753], [-1385, 1385], [5876, fault === "slip" ? 7100 : 5876]];
    let x = 0;
    let y = 0;
    let heading = 0;
    return log.map(([rawLeft, right]) => {
      const left = fault === "sign" ? -rawLeft : rawLeft;
      const distance = (right + left) * metresPerCount / 2;
      const turn = (right - left) * metresPerCount / track;
      // Constant-curvature arc. The sinc factor tends to one for straight travel.
      const halfTurn = turn / 2;
      const chord = halfTurn === 0 ? distance : distance * Math.sin(halfTurn) / halfTurn;
      x += chord * Math.cos(heading + halfTurn);
      y += chord * Math.sin(heading + halfTurn);
      heading += turn;
      return { left, right, x, y, heading };
    });
  }

  function replayPositionFusion(scenario, wheelSigma, landmarkSigma, gateEnabled) {
    const increments = [0.52, 0.53, 0.51, 0.60, 0.59, 0.52, 0.51, 0.52];
    const landmarks = {
      normal: { 2: 1.02, 4: 2.01, 6: 3.01, 8: 3.98 },
      blackout: { 2: 1.02, 8: 3.98 },
      outlier: { 2: 1.02, 4: 3.10, 6: 3.01, 8: 3.98 }
    }[scenario];
    const processVariance = wheelSigma ** 2;
    const observationVariance = landmarkSigma ** 2;
    let wheelOnly = 0;
    let estimate = 0;
    let variance = 0.10 ** 2;
    return increments.map((increment, index) => {
      const leg = index + 1;
      const survey = 0.5 * leg;
      const prediction = estimate + increment;
      const predictedVariance = variance + processVariance;
      const position = landmarks[leg];
      wheelOnly += increment;
      estimate = prediction;
      variance = predictedVariance;
      let normalizedInnovation;
      let decision = "Missing";
      if (position !== undefined) {
        const innovation = position - prediction;
        const innovationVariance = predictedVariance + observationVariance;
        normalizedInnovation = innovation / Math.sqrt(innovationVariance);
        decision = "Rejected";
        if (!gateEnabled || Math.abs(normalizedInnovation) <= 3) {
          const gain = predictedVariance / innovationVariance;
          estimate += gain * innovation;
          variance = (1 - gain) * predictedVariance;
          decision = "Accepted";
        }
      }
      return { leg, survey, increment, wheelOnly, position, prediction, normalizedInnovation,
        decision, estimate, sigma: Math.sqrt(variance) };
    });
  }

  function planAisleRoute(radius, observation) {
    const width = 13;
    const height = 11;
    const cellSize = 0.25;
    const indexOf = (x, y) => y * width + x;
    const pointFor = (index) => [index % width, Math.floor(index / width)];
    const startIndex = indexOf(2, 4);
    const endIndex = indexOf(10, 4);
    const crateIndex = indexOf(6, 8);
    const hasMark = observation === "marked" || observation === "stale";
    const cells = Array.from({ length: width * height }, (_, index) => {
      const [x, y] = pointFor(index);
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) return "wall";
      if (x === 6 && y <= 6 && y !== 4) return "wall";
      if (hasMark && index === crateIndex) return "crate";
      return "open";
    });
    const obstacles = cells.flatMap((cell, index) => cell === "open" ? [] : [pointFor(index)]);
    cells.forEach((cell, index) => {
      if (cell !== "open") return;
      const [x, y] = pointFor(index);
      const touchesObstacle = obstacles.some(([ox, oy]) => {
        const dx = Math.max(0, Math.abs(x - ox) - 0.5) * cellSize;
        const dy = Math.max(0, Math.abs(y - oy) - 0.5) * cellSize;
        return Math.hypot(dx, dy) <= radius;
      });
      if (touchesObstacle) cells[index] = "blocked";
    });

    // Breadth-first search gives a shortest route when each cardinal step has the same cost.
    const parents = new Map([[startIndex, null]]);
    const frontier = cells[startIndex] === "open" ? [startIndex] : [];
    for (let i = 0; i < frontier.length && !parents.has(endIndex); i++) {
      const current = frontier[i];
      const [x, y] = pointFor(current);
      const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of neighbors) {
        const next = indexOf(nx, ny);
        if (cells[next] !== "open" || parents.has(next)) continue;
        parents.set(next, current);
        frontier.push(next);
      }
    }
    const path = [];
    if (parents.has(endIndex)) {
      for (let step = endIndex; step !== null; step = parents.get(step)) {
        path.push(pointFor(step));
        cells[step] = "route";
      }
      path.reverse();
    }
    cells[startIndex] = "start";
    cells[endIndex] = "goal";
    const map = Array.from({ length: height }, (_, row) => cells.slice(row * width, (row + 1) * width));
    return { map, path, metres: path.length ? (path.length - 1) * cellSize : null };
  }

  function timeScaling(distance, speed, acceleration, jerk, smooth) {
    const atRest = (position) => ({ position, velocity: 0, acceleration: 0 });
    if (distance === 0) return { duration: 0, label: "stationary", at: () => atRest(0) };

    if (smooth) {
      const bounds = [
        { label: "speed", time: 1.875 * distance / speed },
        { label: "acceleration", time: Math.sqrt((10 * Math.sqrt(3) / 3) * distance / acceleration) },
        { label: "jerk", time: Math.cbrt(60 * distance / jerk) }
      ];
      const limiting = bounds.reduce((longest, bound) => bound.time > longest.time ? bound : longest);
      const duration = limiting.time;
      function at(time) {
        if (time <= 0) return atRest(0);
        if (time >= duration) return atRest(distance);
        const u = time / duration;
        return {
          position: distance * u ** 3 * (10 - 15 * u + 6 * u * u),
          velocity: distance * 30 * (u * (1 - u)) ** 2 / duration,
          acceleration: distance * 60 * u * (1 - u) * (1 - 2 * u) / duration ** 2
        };
      }
      return { duration, label: limiting.label + "-limited quintic", at };
    }

    const ramp = Math.min(speed / acceleration, Math.sqrt(distance / acceleration));
    const peakSpeed = ramp * acceleration;
    const cruise = Math.max(0, distance / peakSpeed - ramp);
    const duration = ramp + cruise + ramp;
    const rampDistance = 0.5 * acceleration * ramp ** 2;
    function at(time) {
      if (time < 0) return atRest(0);
      if (time >= duration) return atRest(distance);
      if (time < ramp) return { position: 0.5 * acceleration * time ** 2, velocity: acceleration * time, acceleration };
      if (time < ramp + cruise) {
        return { position: rampDistance + peakSpeed * (time - ramp), velocity: peakSpeed, acceleration: 0 };
      }
      const remaining = duration - time;
      return { position: distance - 0.5 * acceleration * remaining ** 2,
        velocity: acceleration * remaining, acceleration: -acceleration };
    }
    return { duration, label: distance > speed ** 2 / acceleration ? "trapezoidal" : "triangular", at };
  }

  function planJointTrajectory(first, second, mode) {
    const axes = [
      { travel: first, speed: 60, acceleration: 120, jerk: 480 },
      { travel: second, speed: 90, acceleration: 180, jerk: 720 }
    ];
    const moving = axes.filter((axis) => axis.travel !== 0);
    const limit = (key) => Math.min(...moving.map((axis) => axis[key] / Math.abs(axis.travel)));
    let profiles;
    if (mode === "independent" || !moving.length) {
      profiles = axes.map((axis) => ({
        ...timeScaling(Math.abs(axis.travel), axis.speed, axis.acceleration, axis.jerk, false),
        multiplier: Math.sign(axis.travel)
      }));
    } else {
      const shared = timeScaling(1, limit("speed"), limit("acceleration"), limit("jerk"), mode === "smooth");
      const stationary = timeScaling(0, 0, 0, 0, false);
      profiles = axes.map((axis) => ({ ...(axis.travel ? shared : stationary), multiplier: axis.travel }));
    }
    const duration = Math.max(...profiles.map((profile) => profile.duration));
    function at(time) {
      return profiles.map((profile) => {
        const { position, velocity, acceleration } = profile.at(time);
        const scale = profile.multiplier;
        return { position: position * scale, velocity: velocity * scale, acceleration: acceleration * scale };
      });
    }
    return { duration, axes: profiles.map(({ duration, label }) => ({ duration, label })), at };
  }

  const fixture = { left: 170, right: 195, bottom: -20, top: 20 };
  const upperArm = 150;
  const forearm = 100;
  const start = [180, -75];
  const goal = [180, 75];
  const routes = {
    direct: [start, goal],
    detour: [start, [145, -75], [145, 75], goal],
    extension: [start, [0, -250]],
    outside: [start, [0, -260]]
  };

  function solveArm([x, y], branch) {
    const a = upperArm;
    const b = forearm;
    const cosine = (x * x + y * y - a * a - b * b) / (2 * a * b);
    if (Math.abs(cosine) > 1 + 1e-10) return null;
    const q2 = branch * Math.acos(Math.max(-1, Math.min(1, cosine)));
    const q1 = Math.atan2(y, x) - Math.atan2(b * Math.sin(q2), a + b * Math.cos(q2));
    return armPose(q1, q2);
  }

  function armPose(q1, q2) {
    const elbow = [upperArm * Math.cos(q1), upperArm * Math.sin(q1)];
    const point = [elbow[0] + forearm * Math.cos(q1 + q2), elbow[1] + forearm * Math.sin(q1 + q2)];
    return { q1, q2, elbow, point };
  }

  function intersectsFixture(from, to) {
    let entry = 0;
    let exit = 1;
    const limits = [[fixture.left, fixture.right], [fixture.bottom, fixture.top]];
    // Clip the line segment's parameter interval to the rectangle along each axis.
    for (let axis = 0; axis < 2; axis++) {
      const [low, high] = limits[axis];
      const delta = to[axis] - from[axis];
      if (delta === 0) {
        if (from[axis] < low || from[axis] > high) return false;
        continue;
      }
      const a = (low - from[axis]) / delta;
      const b = (high - from[axis]) / delta;
      entry = Math.max(entry, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
      if (entry > exit) return false;
    }
    return true;
  }

  function sampleToolPath(points, branch) {
    const targets = [points[0]];
    for (let segment = 1; segment < points.length; segment++) {
      const [x, y] = points[segment - 1];
      const [endX, endY] = points[segment];
      const steps = Math.ceil(Math.hypot(endX - x, endY - y) / 5);
      for (let step = 1; step <= steps; step++) {
        const fraction = step / steps;
        targets.push([x + (endX - x) * fraction, y + (endY - y) * fraction]);
      }
    }
    return targets.map((point) => ({ point, arm: solveArm(point, branch) }));
  }

  function sampleJointMove(branch) {
    const first = solveArm(start, branch);
    const last = solveArm(goal, branch);
    const delta1 = last.q1 - first.q1;
    const delta2 = last.q2 - first.q2;
    const steps = Math.ceil(Math.max(Math.abs(delta1), Math.abs(delta2)) / (Math.PI / 90));
    return Array.from({ length: steps + 1 }, (_, i) => {
      const fraction = i / steps;
      const arm = armPose(first.q1 + fraction * delta1, first.q2 + fraction * delta2);
      return { point: arm.point, arm };
    });
  }

  function checkArm(route, branch) {
    const samples = route === "joint" ? sampleJointMove(branch) : sampleToolPath(routes[route], branch);
    const points = samples.map((sample) => sample.point);

    let visiblePose;
    for (const [index, { point, arm }] of samples.entries()) {
      if (!arm) return { status: "Unreachable", point, visiblePose, points, checked: index + 1 };
      visiblePose = { ...arm, point };
      const collision = intersectsFixture([0, 0], arm.elbow) || intersectsFixture(arm.elbow, point);
      if (collision) return { status: "Link intersects the fixture", point, visiblePose, points, checked: index + 1 };
      if (Math.abs(Math.sin(arm.q2)) < 1e-8) {
        return { status: "Singular configuration", point, visiblePose, points, checked: index + 1 };
      }
    }
    return { status: "All sampled poses clear", point: points.at(-1), visiblePose, points, checked: samples.length };
  }

  function replayHandshake(scenario) {
    const accept = { time: 80, kind: "ack", id: 42 };
    const proof = { time: 820, kind: "proof" };
    const done = { time: 850, kind: "result", id: 42 };
    const cases = {
      normal: [accept, proof, done],
      duplicate: [accept, { time: 90, kind: "repeat" }, proof, done, { ...done, time: 930 }],
      boundary: [{ ...accept, time: 250 }, proof, done],
      late: [{ time: 250, kind: "timeout" }, { ...accept, time: 251 }],
      stale: [accept, { ...done, time: 240, id: 41 }, proof, done],
      "no-proof": [accept, done],
      disconnect: [accept, { time: 400, kind: "offline" }, { time: 900, kind: "online" },
        { time: 940, kind: "reconcile", id: 42 }, { ...done, time: 1000 }]
    };
    const names = {
      repeat: "PLC repeats request 42",
      timeout: "Acknowledgment window elapsed",
      proof: "New placement proof for job 42",
      offline: "Heartbeat expired",
      online: "Link restored",
      reconcile: "Verified retained result and placement for job 42"
    };
    const state = { phase: "Await acknowledgment", starts: 0, committed: 0, placed: false };
    const rows = [[0, "PLC requests job 42", "Wait for acknowledgment with matching ID", state.phase]];

    function advance(event) {
      switch (event.kind) {
        case "timeout":
          state.phase = "Hold for reconciliation";
          return "Acknowledgment missing. Execution unknown.";
        case "ack":
          if (state.phase !== "Await acknowledgment" || event.time > 250 || event.id !== 42) {
            return "Ignore delayed or mismatched acknowledgment.";
          }
          state.phase = "Busy";
          state.starts++;
          return "Record one confirmed start.";
        case "repeat":
          return "Keep the same job. Start count stays at one.";
        case "proof":
          state.placed = state.phase === "Busy";
          return "Keep independent placement evidence for this job.";
        case "offline":
          state.phase = "Hold for reconciliation";
          state.placed = false;
          return "Remove new requests. Current part disposition is unknown.";
        case "online":
          return "Keep the hold until the observations agree.";
        case "reconcile":
          state.placed = true;
          state.phase = "Busy";
          // Fall through to the normal completion rule with independently verified evidence.
        case "result":
          if (event.id !== 42) return "Ignore the result for the previous job.";
          if (state.committed) return "Result already consumed. Keep the same count.";
          if (state.phase !== "Busy") return "Keep the hold and reconcile the active job.";
          if (!state.placed) {
            state.phase = "Hold for reconciliation";
            return "Completion reported without placement proof.";
          }
          state.committed++;
          state.phase = "Complete";
          return "Commit one confirmed good part and acknowledge consumption.";
      }
    }

    for (const event of cases[scenario]) {
      const description = names[event.kind] || (event.kind === "ack" ? "Acknowledgment " : "Result for job ") + event.id;
      const decision = advance(event);
      rows.push([event.time, description, decision, state.phase]);
    }
    return { ...state, rows };
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { simulateWheel, replayOdometry, replayPositionFusion, planAisleRoute, planJointTrajectory,
      solveArm, checkArm, replayHandshake };
  }
  if (typeof document === "undefined") return;

  const get = (id) => document.getElementById(id);
  const degrees = (radians) => radians * 180 / Math.PI;
  const percent = (ratio) => (100 * ratio).toFixed(1);

  function fillTable(id, rows) {
    const container = get(id);
    const body = container.querySelector("tbody");
    body.replaceChildren(...rows.map((cells) => {
      const row = document.createElement("tr");
      cells.forEach((value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        cell.textContent = value;
        row.append(cell);
      });
      return row;
    }));
    container.hidden = false;
  }

  function stroke(ctx, points, color, dash = [], width = 2) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    points.slice(1).forEach((point) => ctx.lineTo(...point));
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function showPlot(id, legendId, draw) {
    const canvas = get(id);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.hidden = false;
    get(legendId).hidden = false;
    function render() {
      const style = getComputedStyle(canvas);
      const color = (name) => style.getPropertyValue("--" + name).trim();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color("ink");
      ctx.font = "14px sans-serif";
      draw(ctx, color);
    }
    render();
    return render;
  }

  let redrawPlot;
  if (get("run-wheel") || get("run-arm") || get("run-fusion") || get("run-trajectory")) {
    const observer = new MutationObserver(() => redrawPlot?.());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  get("run-wheel")?.addEventListener("click", () => {
    const scenario = get("wheel-scenario").value;
    const samples = simulateWheel(get("wheel-control").value, scenario,
      get("wheel-delay").checked, get("wheel-windup").checked);
    const final = samples.at(-1);
    const peak = Math.max(...samples.map((sample) => sample.speed));
    const detail = scenario === "load"
      ? "Peak speed " + peak.toFixed(1) + " rpm."
      : "Requested duty when the target drops at 2 s is " + percent(samples[100].requested) + "%.";
    get("wheel-summary").textContent = "At 5 s: " + final.speed.toFixed(1) + " rpm at " +
      percent(final.duty) + "% applied duty. " + detail;
    fillTable("wheel-readings", samples.filter((_, step) => step % 25 === 0).map((s) =>
      [s.time.toFixed(1), s.target, s.speed.toFixed(1), s.feedback.toFixed(1), percent(s.requested), percent(s.duty)]));
    redrawPlot = showPlot("wheel-plot", "wheel-legend", (ctx, color) => {
      const left = 48;
      const right = 406;
      const top = 32;
      const bottom = 214;
      const x = (time) => left + (right - left) * time / 5;
      const y = (fraction) => bottom - (bottom - top) * fraction;
      for (let fraction = 0; fraction <= 1; fraction += 0.25) {
        const ordinate = y(fraction);
        stroke(ctx, [[left, ordinate], [right, ordinate]], color("line"));
        ctx.fillText(String(fraction * 280), 10, ordinate + 4);
        ctx.fillText(String(fraction * 100), right + 10, ordinate + 4);
      }
      ctx.fillText("rpm", 10, 18);
      ctx.fillText("duty %", right + 4, 18);
      for (let second = 0; second <= 5; second++) ctx.fillText(second + " s", x(second) - 8, 237);
      stroke(ctx, samples.map((s) => [x(s.time), y(s.target / 280)]), color("muted"), [7, 4]);
      stroke(ctx, samples.map((s) => [x(s.time), y(s.duty)]), color("theory"), [2, 4]);
      stroke(ctx, samples.map((s) => [x(s.time), y(s.speed / 280)]), color("practice"));
    });
  });

  get("run-odometry")?.addEventListener("click", () => {
    const diameter = get("odom-diameter");
    const track = get("odom-track");
    if (!diameter.reportValidity() || !track.reportValidity()) return;
    const path = replayOdometry(diameter.valueAsNumber, track.valueAsNumber, get("odom-fault").value);
    const end = path.at(-1);
    const errorMm = 1000 * Math.hypot(end.x - 1, end.y - 0.5);
    const angleError = degrees(Math.atan2(Math.sin(end.heading - Math.PI / 2), Math.cos(end.heading - Math.PI / 2)));
    get("odom-summary").textContent = "End position error: " + errorMm.toFixed(1) +
      " mm. Heading error: " + angleError.toFixed(2) + "°. Reference: (1.000 m, 0.500 m), +90°.";
    fillTable("odom-readings", path.map((p, i) =>
      [i + 1, p.left, p.right, p.x.toFixed(3), p.y.toFixed(3), degrees(p.heading).toFixed(2)]));
  });

  get("run-fusion")?.addEventListener("click", () => {
    const wheels = get("fusion-wheel");
    const landmark = get("fusion-landmark");
    if (!wheels.reportValidity() || !landmark.reportValidity()) return;
    const rows = replayPositionFusion(get("fusion-case").value, wheels.valueAsNumber,
      landmark.valueAsNumber, get("fusion-gate").checked);
    const last = rows.at(-1);
    const rejected = rows.filter((row) => row.decision === "Rejected").map((row) => row.leg);
    const rejectedText = rejected.length ? "Rejected landmark legs: " + rejected.join(", ") + "." : "No landmarks rejected.";
    get("fusion-summary").textContent = "Final wheel error " + (last.wheelOnly - last.survey).toFixed(3) +
      " m. Final fused error " + (last.estimate - last.survey).toFixed(3) + " m with reported σ of " +
      last.sigma.toFixed(3) + " m. " + rejectedText;
    fillTable("fusion-readings", rows.map((row) => [row.leg, row.survey.toFixed(3),
      row.increment.toFixed(3), row.wheelOnly.toFixed(3), row.position?.toFixed(3) ?? "—",
      row.prediction.toFixed(3), row.normalizedInnovation?.toFixed(2) ?? "—", row.decision,
      row.estimate.toFixed(3), row.sigma.toFixed(3)]));
    redrawPlot = showPlot("fusion-plot", "fusion-legend", (ctx, color) => {
      const left = 58;
      const right = 437;
      const top = 35;
      const bottom = 216;
      const x = (leg) => left + (right - left) * leg / last.leg;
      const points = [{ leg: 0, survey: 0, wheelOnly: 0, estimate: 0, sigma: 0.10 }, ...rows];
      const fusedError = (row) => row.estimate - row.survey;
      const maximum = Math.max(...points.map((row) =>
        Math.max(Math.abs(row.wheelOnly - row.survey), Math.abs(fusedError(row)) + row.sigma)));
      const limit = Math.ceil(maximum * 5) / 5;
      const y = (error) => top + (bottom - top) * (1 - error / limit) / 2;
      const upper = points.map((row) => [x(row.leg), y(fusedError(row) + row.sigma)]);
      const lower = points.map((row) => [x(row.leg), y(fusedError(row) - row.sigma)]).reverse();
      for (const ratio of [-1, -0.5, 0, 0.5, 1]) {
        const error = ratio * limit;
        stroke(ctx, [[left, y(error)], [right, y(error)]], color("line"));
        ctx.fillText(error.toFixed(1), 11, y(error) + 4);
      }
      ctx.fillText("Position error (m)", left, 20);
      ctx.fillText("Leg", 12, 238);
      points.forEach((row) => ctx.fillText(String(row.leg), x(row.leg) - 4, 238));
      ctx.save();
      ctx.fillStyle = color("practice");
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(...upper[0]);
      [...upper.slice(1), ...lower].forEach((point) => ctx.lineTo(...point));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      stroke(ctx, points.map((row) => [x(row.leg), y(row.wheelOnly - row.survey)]), color("ink"), [6, 4]);
      stroke(ctx, points.map((row) => [x(row.leg), y(fusedError(row))]), color("practice"));
    });
  });

  get("run-arm")?.addEventListener("click", () => {
    const result = checkArm(get("arm-route").value, Number(get("arm-branch").value));
    const { status, point, visiblePose, points, checked } = result;
    const position = point.map((value) => value.toFixed(1)).join(", ");
    const jointText = status === "Unreachable" ? "" : " Joint angles: " +
      degrees(visiblePose.q1).toFixed(1) + "° and " + degrees(visiblePose.q2).toFixed(1) + "°.";
    const maxX = Math.max(...points.map(([x]) => x)).toFixed(1);
    get("arm-summary").textContent = status + " at (" + position + ") mm after " +
      checked + " pose checks." + jointText + " Planned maximum x: " + maxX + " mm.";
    redrawPlot = showPlot("arm-path-plot", "arm-path-legend", (ctx, color) => {
      const scale = 0.46;
      const xy = ([x, y]) => [135 + scale * x, 135 - scale * y];
      stroke(ctx, [[18, 135], [322, 135]], color("control-border"));
      stroke(ctx, [[135, 15], [135, 255]], color("control-border"));
      ctx.fillText("+x", 303, 127);
      ctx.fillText("+y", 140, 19);
      const [left, top] = xy([fixture.left, fixture.top]);
      ctx.fillStyle = color("warn");
      ctx.fillRect(left, top, scale * (fixture.right - fixture.left), scale * (fixture.top - fixture.bottom));
      stroke(ctx, points.map(xy), color("theory"), [6, 4]);
      stroke(ctx, [[0, 0], visiblePose.elbow, visiblePose.point].map(xy), color("practice"), [], 4);
      const [x, y] = xy(point);
      ctx.fillStyle = color("ink");
      ctx.fillRect(x - 3, y - 3, 6, 6);
    });
  });

  get("run-aisle")?.addEventListener("click", () => {
    const scene = get("aisle-scene").value;
    const { map, path, metres } = planAisleRoute(Number(get("aisle-radius").value), scene);
    const crossing = path.find(([col]) => col === 6);
    const evidence = {
      clear: "No crate mark.", marked: "Crate mark at column 6, row 8.",
      stale: "Crate removed. The previous mark at column 6, row 8 is still active.",
      cleared: "Fresh observation cleared column 6, row 8."
    };
    get("aisle-summary").textContent = (crossing
      ? "Route found. " + metres.toFixed(2) + " m through row " + crossing[1] + ". "
      : "No route for the configured envelope. ") + evidence[scene];
    const symbols = { wall: "#", crate: "X", blocked: "×", open: "·", route: "+", start: "S", goal: "G" };
    fillTable("aisle-map", map.map((row, index) => [index, ...row.map((cell) => symbols[cell])]));
    const rows = get("aisle-map").querySelector("tbody").rows;
    map.forEach((row, y) => row.forEach((kind, x) => {
      const cell = rows[y].cells[x + 1];
      cell.dataset.kind = kind;
      cell.setAttribute("aria-label", kind === "blocked" ? "Footprint blocked" : kind);
    }));
  });

  get("run-trajectory")?.addEventListener("click", () => {
    const first = get("trajectory-first");
    const second = get("trajectory-second");
    if (!first.reportValidity() || !second.reportValidity()) return;
    const result = planJointTrajectory(first.valueAsNumber, second.valueAsNumber, get("trajectory-profile").value);
    const { axes, duration } = result;
    const toTime = (time) => time.toFixed(3);
    get("trajectory-summary").textContent = "Move time " + toTime(duration) + " s. " + axes.map((axis, i) =>
      "J" + (i + 1) + ": " + axis.label + ", ends at " + toTime(axis.duration) + " s.").join(" ");
    const times = new Map();
    [0, duration / 8, duration / 4, duration / 2, duration * 3 / 4, duration, ...axes.map((axis) => axis.duration)]
      .forEach((time) => times.set(toTime(time), time));
    fillTable("trajectory-readings", [...times.values()].sort((a, b) => a - b).map((time) => [toTime(time),
      ...result.at(time).flatMap(({ position, velocity, acceleration }) =>
        [position.toFixed(2), velocity.toFixed(2), acceleration.toFixed(2)])]));
    if (duration === 0) {
      get("trajectory-plot").hidden = true;
      get("trajectory-legend").hidden = true;
      redrawPlot = undefined;
      return;
    }
    const samples = Array.from({ length: 121 }, (_, i) => result.at(duration * i / 120));
    redrawPlot = showPlot("trajectory-plot", "trajectory-legend", (ctx, color) => {
      const left = 51;
      const right = 437;
      const top = 32;
      const bottom = 211;
      const x = (fraction) => left + (right - left) * fraction;
      const y = (speed) => top + (bottom - top) * (90 - speed) / 180;
      for (const speed of [-90, -45, 0, 45, 90]) {
        stroke(ctx, [[left, y(speed)], [right, y(speed)]], color("line"));
        ctx.fillText(String(speed), 13, y(speed) + 5);
      }
      ctx.fillText("Joint speed (°/s)", left, 19);
      ctx.fillText("Time (s)", left, 247);
      for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
        ctx.fillText((duration * fraction).toFixed(2), x(fraction) - 13, 230);
      }
      stroke(ctx, samples.map((sample, i) => [x(i / 120), y(sample[0].velocity)]), color("practice"));
      stroke(ctx, samples.map((sample, i) => [x(i / 120), y(sample[1].velocity)]), color("theory"), [6, 4]);
    });
  });

  get("run-handshake")?.addEventListener("click", () => {
    const result = replayHandshake(get("handshake-case").value);
    get("handshake-summary").textContent = "Final state: " + result.phase + ". Confirmed starts: " +
      result.starts + ". Good parts counted: " + result.committed + ".";
    fillTable("handshake-readings", result.rows);
  });
})();
