import test from 'node:test';
import assert from 'node:assert/strict';
import trainers from '../tutorial/assets/robotics.js';

function near(actual, expected, tolerance = 0.001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} near ${expected}`);
}

test('wheel control rejects a load and clamps duty through saturation', () => {
  const { simulateWheel } = trainers;
  near(simulateWheel('open', 'load', false, true).at(-1).speed, 60, 0.01);
  near(simulateWheel('p', 'load', false, true).at(-1).speed, 77.78, 0.01);
  near(simulateWheel('pi', 'load', false, true).at(-1).speed, 100, 0.1);
  const delayed = simulateWheel('high', 'load', true, true).slice(-25).map(sample => sample.speed);
  assert.ok(Math.max(...delayed) - Math.min(...delayed) > 40);

  const withClamp = simulateWheel('pi', 'saturation', false, true);
  const withoutClamp = simulateWheel('pi', 'saturation', false, false);
  assert.ok(withClamp[100].duty < 0.1);
  assert.ok(withoutClamp[100].requested > 3);
  assert.equal(withoutClamp[100].duty, 1);
  assert.ok([...withClamp, ...withoutClamp].every(sample => sample.duty >= 0 && sample.duty <= 1));
});

test('wheel replay preserves straight distance and exposes wrong track or sign', () => {
  const { replayOdometry } = trainers;
  const nominal = replayOdometry(65, 150, 'normal');
  near(nominal.at(-1).x, 1);
  near(nominal.at(-1).y, 0.5);
  near(nominal.at(-1).heading, Math.PI / 2);
  const wide = replayOdometry(65, 165, 'normal');
  assert.deepEqual(wide[0], nominal[0]);
  assert.ok(wide[1].heading < nominal[1].heading);
  const wrongSign = replayOdometry(65, 150, 'sign');
  assert.equal(wrongSign[0].x, 0);
  assert.ok(wrongSign[0].heading > 0);
  const slip = replayOdometry(65, 150, 'slip');
  assert.deepEqual(slip.slice(0, 2), nominal.slice(0, 2));
  assert.ok(slip[2].heading > nominal[2].heading);
});

test('position fusion propagates uncertainty and handles rejected and missing landmarks', () => {
  const { replayPositionFusion } = trainers;
  const normal = replayPositionFusion('normal', 0.05, 0.20, true);
  near(normal[1].prediction, 1.050);
  near(normal[1].estimate, 1.042);
  near(normal[1].sigma, 0.104, 0.001);
  assert.equal(normal[1].decision, 'Accepted');
  near(normal.at(-1).wheelOnly, 4.3);
  assert.ok(Math.abs(normal.at(-1).estimate - 4) < 0.3);

  const blackout = replayPositionFusion('blackout', 0.05, 0.20, true);
  assert.equal(blackout[3].decision, 'Missing');
  assert.equal(blackout[5].decision, 'Missing');
  assert.ok(blackout[5].sigma > blackout[3].sigma);
  assert.ok(blackout[7].sigma < blackout[6].sigma);

  const gated = replayPositionFusion('outlier', 0.05, 0.20, true)[3];
  const ungated = replayPositionFusion('outlier', 0.05, 0.20, false)[3];
  assert.ok(gated.normalizedInnovation > 3);
  assert.equal(gated.decision, 'Rejected');
  assert.equal(gated.estimate, gated.prediction);
  assert.equal(ungated.decision, 'Accepted');
  assert.ok(ungated.estimate > gated.estimate);
  assert.ok(ungated.sigma < gated.sigma);
  const looser = replayPositionFusion('outlier', 0.15, 0.40, true)[3];
  assert.equal(looser.decision, 'Accepted');
});

test('aisle planning responds to the envelope and clears marks only with new evidence', () => {
  const { planAisleRoute } = trainers;
  const empty = planAisleRoute(0.10, 'clear');
  assert.equal(empty.metres, 2);
  assert.deepEqual(empty.path.find(([x]) => x === 6), [6, 4]);
  const loaded = planAisleRoute(0.23, 'clear');
  assert.equal(loaded.metres, 4);
  assert.deepEqual(loaded.path.find(([x]) => x === 6), [6, 8]);
  assert.equal(loaded.map[4][6], 'blocked');

  const marked = planAisleRoute(0.23, 'marked');
  assert.equal(marked.metres, null);
  assert.equal(marked.map[8][6], 'crate');
  assert.deepEqual(planAisleRoute(0.23, 'stale'), marked);
  assert.deepEqual(planAisleRoute(0.23, 'cleared'), loaded);
  assert.equal(planAisleRoute(0.10, 'marked').metres, 2);
  assert.equal(planAisleRoute(0.125, 'clear').map[4][6], 'blocked');
});

test('joint trajectory synchronization respects axis limits and changes intermediate positions', () => {
  const { planJointTrajectory } = trainers;
  const shared = planJointTrajectory(90, -30, 'shared');
  assert.equal(shared.duration, 2);
  near(shared.at(1)[0].position, 45);
  near(shared.at(1)[1].position, -15);
  near(shared.at(1)[0].velocity, 60);
  near(shared.at(1)[1].velocity, -20);
  const independent = planJointTrajectory(90, -30, 'independent');
  assert.equal(independent.duration, 2);
  near(independent.axes[1].duration, Math.sqrt(30 / 180) * 2);
  near(independent.at(1)[1].position, -30);
  assert.equal(independent.axes[1].label, 'triangular');

  const smooth = planJointTrajectory(90, -30, 'smooth');
  near(smooth.duration, 2.8125);
  near(smooth.at(smooth.duration / 2)[0].velocity, 60);
  near(smooth.at(0)[0].acceleration, 0);
  near(smooth.at(smooth.duration)[1].position, -30);
  near(smooth.at(smooth.duration)[1].acceleration, 0);
  assert.equal(smooth.axes[0].label, 'speed-limited quintic');
  const short = planJointTrajectory(18, -6, 'smooth');
  assert.equal(short.axes[0].label, 'jerk-limited quintic');
  near(short.duration, Math.cbrt(60 * 18 / 480));
  assert.equal(planJointTrajectory(0, 0, 'smooth').duration, 0);
  assert.equal(planJointTrajectory(0, 90, 'smooth').axes[0].label, 'stationary');
});

test('arm check distinguishes fixture collision, reach and singularity on both branches', () => {
  const { checkArm, solveArm } = trainers;
  for (const branch of [1, -1]) {
    const { q1, q2, elbow } = solveArm([180, 75], branch);
    near(elbow[0] + 100 * Math.cos(q1 + q2), 180);
    near(elbow[1] + 100 * Math.sin(q1 + q2), 75);
    assert.equal(checkArm('direct', branch).status, 'Link intersects the fixture');
    const joint = checkArm('joint', branch);
    assert.equal(joint.status, 'Link intersects the fixture');
    near(Math.max(...joint.points.map(([x]) => x)), 195, 0.04);
    near(joint.points.at(-1)[0], 180);
    near(joint.points.at(-1)[1], 75);
    assert.equal(checkArm('detour', branch).status, 'All sampled poses clear');
    assert.equal(checkArm('extension', branch).status, 'Singular configuration');
    assert.equal(checkArm('outside', branch).status, 'Unreachable');
  }
  assert.notDeepEqual(checkArm('direct', 1).point, checkArm('direct', -1).point);
});

test('handshake commits each proved part once and observes the acknowledgment boundary', () => {
  const { replayHandshake } = trainers;
  for (const scenario of ['normal', 'duplicate', 'boundary', 'stale', 'disconnect']) {
    const result = replayHandshake(scenario);
    assert.equal(result.phase, 'Complete', scenario);
    assert.equal(result.starts, 1, scenario);
    assert.equal(result.committed, 1, scenario);
  }
  const recovered = replayHandshake('disconnect');
  assert.equal(recovered.rows.find(([time]) => time === 900)[3], 'Hold for reconciliation');
  assert.match(recovered.rows.at(-1)[2], /already consumed/);
  const oldResult = replayHandshake('stale').rows.find(([time]) => time === 240);
  assert.equal(oldResult[3], 'Busy');
  const late = replayHandshake('late');
  assert.equal(late.starts, 0);
  assert.equal(late.committed, 0);
  assert.equal(late.phase, 'Hold for reconciliation');
  const missingProof = replayHandshake('no-proof');
  assert.equal(missingProof.starts, 1);
  assert.equal(missingProof.committed, 0);
  assert.equal(missingProof.phase, 'Hold for reconciliation');
});
