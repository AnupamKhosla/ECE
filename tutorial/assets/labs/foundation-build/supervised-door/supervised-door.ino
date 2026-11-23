#include <Arduino.h>

constexpr uint8_t sensePin = 34;
constexpr uint8_t alarmPin = 27;

enum class Zone { CableShort, DoorShut, DoorOpen, CableOpen, CheckWiring };

Zone classify(uint32_t millivolts) {
  if (millivolts <= 250) return Zone::CableShort;
  if (millivolts >= 2800) return Zone::CableOpen;
  if (millivolts >= 1400 && millivolts <= 1900) return Zone::DoorShut;
  if (millivolts >= 1950 && millivolts <= 2450) return Zone::DoorOpen;
  return Zone::CheckWiring;
}

const char* zoneName(Zone zone) {
  switch (zone) {
    case Zone::CableShort: return "cable_short";
    case Zone::DoorShut: return "door_shut";
    case Zone::DoorOpen: return "door_open";
    case Zone::CableOpen: return "cable_open";
    case Zone::CheckWiring: return "check_wiring";
  }
  return "check_wiring";
}

Zone candidate = Zone::CheckWiring;
Zone stable = Zone::CheckWiring;
uint32_t candidateSince = 0;
uint32_t lastLog = 0;

void setup() {
  analogReadResolution(12);
  analogSetPinAttenuation(sensePin, ADC_11db);
  pinMode(alarmPin, OUTPUT);
  digitalWrite(alarmPin, HIGH);
  Serial.begin(115200);
  Serial.println("ms,sense_mV,zone");
}

void loop() {
  uint32_t total = 0;
  for (int i = 0; i < 16; ++i) total += analogReadMilliVolts(sensePin);
  const uint32_t millivolts = total / 16;
  const uint32_t now = millis();
  const Zone reading = classify(millivolts);

  if (reading != candidate) {
    candidate = reading;
    candidateSince = now;
  }
  if (now - candidateSince >= 80) stable = candidate;

  digitalWrite(alarmPin, stable != Zone::DoorShut);
  if (now - lastLog >= 500) {
    lastLog = now;
    Serial.printf("%lu,%lu,%s\n", static_cast<unsigned long>(now),
                  static_cast<unsigned long>(millivolts), zoneName(stable));
  }
  delay(10);
}
