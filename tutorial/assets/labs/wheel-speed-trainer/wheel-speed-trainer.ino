#include <Arduino.h>

#ifndef WHEEL_ALLOW_OLD_PI_UPDATE
#define WHEEL_ALLOW_OLD_PI_UPDATE 0
#endif

const uint8_t encoderPin = 2;
const uint8_t standbyPin = 4;
const uint8_t pwmPin = 5;
const uint8_t in1Pin = 7;
const uint8_t in2Pin = 8;
const uint8_t targetPin = 11;
const uint8_t runPin = 12;

const bool closedLoop = false;
const float edgesPerOutputTurn = 3.0f * 100.37f;
const float maxDuty = 0.60f;
const float kp = 0.004f;
const float ki = 0.015f;
const uint32_t holdMs = 40;
const uint32_t sampleMs = 100;
const uint32_t noMotionMs = 700;
const uint32_t reportMs = 250;
const uint32_t maxFeedbackEdgeAgeUs = 30000;

enum class State { AwaitRelease, Ready, Debouncing, Running, NoFeedback };
State state = State::AwaitRelease;
volatile uint32_t encoderEdges = 0;
volatile uint32_t encoderLastEdgeUs = 0;
uint32_t pressedAt = 0;
uint32_t sampledAt = 0;
uint32_t lastMotionAt = 0;
uint32_t lastReportAt = 0;
uint32_t lastCount = 0;
float integralDuty = 0;
float appliedDuty = 0;

struct EncoderSample {
  uint32_t edges;
  uint32_t lastEdgeUs;
};

void onEncoderEdge() {
  ++encoderEdges;
  encoderLastEdgeUs = micros();
}

EncoderSample readEncoder() {
  noInterrupts();
  const EncoderSample snapshot{encoderEdges, encoderLastEdgeUs};
  interrupts();
  return snapshot;
}

float targetRpm() {
  return digitalRead(targetPin) == LOW ? 55.0f : 35.0f;
}

void stopMotor() {
  digitalWrite(standbyPin, LOW);
  analogWrite(pwmPin, 0);
  integralDuty = 0;
  appliedDuty = 0;
}

float clampDuty(float request) {
  if (request < 0) return 0;
  if (request > maxDuty) return maxDuty;
  return request;
}

void applyDuty(float duty) {
  analogWrite(pwmPin, static_cast<int>(duty * 255.0f + 0.5f));
  digitalWrite(standbyPin, duty > 0 ? HIGH : LOW);
  appliedDuty = duty;
}

void setup() {
  pinMode(standbyPin, OUTPUT);
  pinMode(pwmPin, OUTPUT);
  stopMotor();
  pinMode(in1Pin, OUTPUT);
  pinMode(in2Pin, OUTPUT);
  digitalWrite(in1Pin, HIGH);
  digitalWrite(in2Pin, LOW);
  pinMode(runPin, INPUT_PULLUP);
  pinMode(targetPin, INPUT_PULLUP);
  pinMode(encoderPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(encoderPin), onEncoderEdge, RISING);
  Serial.begin(115200);
  Serial.println(F("time_ms,target_rpm,measured_rpm,duty,edges"));
}

void loop() {
  const uint32_t now = millis();

  // A released switch removes drive without waiting for the next speed sample.
  if (digitalRead(runPin) == HIGH) {
    if (state == State::Running) stopMotor();
    state = State::Ready;
    return;
  }
  if (state == State::AwaitRelease || state == State::NoFeedback) return;

  if (state == State::Ready) {
    pressedAt = now;
    state = State::Debouncing;
    return;
  }
  if (state == State::Debouncing) {
    if (now - pressedAt < holdMs) return;
    sampledAt = lastMotionAt = lastReportAt = now;
    lastCount = readEncoder().edges;
    state = State::Running;
    applyDuty(clampDuty(targetRpm() / 130.0f));
    return;
  }

  const uint32_t elapsed = now - sampledAt;
  if (elapsed < sampleMs) return;
  sampledAt = now;
  const EncoderSample sample = readEncoder();
  const uint32_t edges = sample.edges - lastCount;
  lastCount = sample.edges;
  if (edges > 0) lastMotionAt = now;
  if (now - lastMotionAt >= noMotionMs) {
    stopMotor();
    state = State::NoFeedback;
    Serial.println(F("# no_encoder_edges; release run before restarting"));
    return;
  }

  const float rpm = edges * 60000.0f / (edgesPerOutputTurn * elapsed);
  const float target = targetRpm();
  const float feedforward = target / 130.0f;
  float duty = clampDuty(feedforward);
  const bool recentFeedback = edges > 0 && micros() - sample.lastEdgeUs <= maxFeedbackEdgeAgeUs;
  if (closedLoop && (recentFeedback || WHEEL_ALLOW_OLD_PI_UPDATE)) {
    const float error = target - rpm;
    const float proportional = feedforward + kp * error;
    const float candidate = integralDuty + ki * error * elapsed / 1000.0f;
    const bool upperWindup = proportional + candidate > maxDuty && error > 0;
    const bool lowerWindup = proportional + candidate < 0 && error < 0;
    if (!upperWindup && !lowerWindup) integralDuty = candidate;
    duty = clampDuty(proportional + integralDuty);
  } else if (closedLoop) {
    duty = appliedDuty;
  }
  applyDuty(duty);

  if (now - lastReportAt >= reportMs) {
    lastReportAt = now;
    Serial.print(now);
    Serial.print(',');
    Serial.print(target, 1);
    Serial.print(',');
    Serial.print(rpm, 1);
    Serial.print(',');
    Serial.print(duty, 3);
    Serial.print(',');
    Serial.println(edges);
  }
}
