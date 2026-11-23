#include <Arduino.h>
#include "ventilation.h"

const uint8_t tempPin = 34;
const uint8_t fanLamp = 25;
const uint8_t proofLamp = 26;
const uint8_t alarmLamp = 27;

// A contact connects its input to GND when it closes.
class Contact {
 public:
  explicit Contact(uint8_t gpio) : pin(gpio) {}

  void begin() {
    pinMode(pin, INPUT_PULLUP);
    closed = sample = digitalRead(pin) == LOW;
    changedAt = millis();
  }

  void update(uint32_t now) {
    const bool reading = digitalRead(pin) == LOW;
    if (reading != sample) {
      sample = reading;
      changedAt = now;
    }
    if (now - changedAt >= 40) closed = sample;
  }

  bool closed = false;

 private:
  uint8_t pin;
  bool sample = false;
  uint32_t changedAt = 0;
};

Contact door(32);
Contact proof(33);
Contact reset(23);
Ventilation panel;
bool lastReset = false;
uint32_t lastReport = 0;

const char* modeName(Mode mode) {
  switch (mode) {
    case Mode::Idle: return "idle";
    case Mode::Waiting: return "awaiting_proof";
    case Mode::Running: return "running";
    case Mode::Coast: return "stopping";
    case Mode::Fault: return "fault";
  }
  return "unknown";
}

const char* faultName(Fault fault) {
  switch (fault) {
    case Fault::None: return "none";
    case Fault::MissingProof: return "missing_proof";
    case Fault::LostProof: return "lost_proof";
    case Fault::UnexpectedProof: return "unexpected_proof";
  }
  return "unknown";
}

void setup() {
  pinMode(fanLamp, OUTPUT);
  pinMode(proofLamp, OUTPUT);
  pinMode(alarmLamp, OUTPUT);
  digitalWrite(fanLamp, LOW);
  digitalWrite(proofLamp, LOW);
  digitalWrite(alarmLamp, LOW);
  door.begin();
  proof.begin();
  reset.begin();
  lastReset = reset.closed;
  analogReadResolution(12);
  analogSetPinAttenuation(tempPin, ADC_11db);
  Serial.begin(115200);
  Serial.println("ms,simulated_temp_C,door_shut,proof,fan_command,mode,fault");
}

void loop() {
  const uint32_t now = millis();
  door.update(now);
  proof.update(now);
  reset.update(now);

  unsigned int samples = 0;
  for (int i = 0; i < 8; ++i) samples += analogRead(tempPin);
  const int temperature = map(samples / 8, 0, 4095, 180, 300);
  panel.update(now, temperature, door.closed, proof.closed, reset.closed && !lastReset);
  lastReset = reset.closed;

  digitalWrite(fanLamp, panel.fanCommand());
  digitalWrite(proofLamp, proof.closed);
  digitalWrite(alarmLamp, !door.closed || panel.fault != Fault::None);
  if (now - lastReport >= 500) {
    lastReport = now;
    Serial.printf("%lu,%.1f,%d,%d,%d,%s,%s\n", static_cast<unsigned long>(now),
                  temperature / 10.0, door.closed, proof.closed, panel.fanCommand(),
                  modeName(panel.mode), faultName(panel.fault));
  }
  delay(10);
}
