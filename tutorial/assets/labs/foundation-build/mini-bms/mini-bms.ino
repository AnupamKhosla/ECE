#include <Arduino.h>
#include "ventilation.h"

const uint8_t tempPin = 34;
const uint8_t fanLamp = 25;
const uint8_t proofLamp = 26;
const uint8_t alarmLamp = 27;
const uint8_t proofPin = 33;

// Leave false for the P189 switch. Set true for the P190 fan tachometer.
constexpr bool useFanTach = false;
portMUX_TYPE tachLock = portMUX_INITIALIZER_UNLOCKED;
volatile uint32_t tachEdges = 0;
uint32_t tachWindowStarted = 0;
uint32_t tachHz = 0;

void ARDUINO_ISR_ATTR countTachEdge() {
  portENTER_CRITICAL_ISR(&tachLock);
  ++tachEdges;
  portEXIT_CRITICAL_ISR(&tachLock);
}

void updateTach(uint32_t now) {
  const uint32_t elapsed = now - tachWindowStarted;
  if (elapsed < 250) return;

  portENTER_CRITICAL(&tachLock);
  const uint32_t edges = tachEdges;
  tachEdges = 0;
  portEXIT_CRITICAL(&tachLock);

  tachWindowStarted = now;
  tachHz = (edges * 1000UL) / elapsed;
}

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
Contact proof(proofPin);
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
  if (useFanTach) {
    pinMode(proofPin, INPUT);  // P190 has an external 4.7 kΩ pull-up to 3.3 V.
    tachWindowStarted = millis();
    attachInterrupt(digitalPinToInterrupt(proofPin), countTachEdge, FALLING);
  } else {
    proof.begin();
  }
  reset.begin();
  lastReset = reset.closed;
  analogReadResolution(12);
  analogSetPinAttenuation(tempPin, ADC_11db);
  Serial.begin(115200);
  Serial.print("ms,simulated_temp_C,door_shut,proof,fan_command,mode,fault");
  Serial.println(useFanTach ? ",tach_Hz" : "");
}

void loop() {
  const uint32_t now = millis();
  door.update(now);
  if (useFanTach) updateTach(now);
  else proof.update(now);
  const bool rotationProven = useFanTach ? (tachHz >= 100 && tachHz <= 350) : proof.closed;
  reset.update(now);

  unsigned int samples = 0;
  for (int i = 0; i < 8; ++i) samples += analogRead(tempPin);
  const int temperature = map(samples / 8, 0, 4095, 180, 300);
  panel.update(now, temperature, door.closed, rotationProven, reset.closed && !lastReset);
  lastReset = reset.closed;

  digitalWrite(fanLamp, panel.fanCommand());
  digitalWrite(proofLamp, rotationProven);
  digitalWrite(alarmLamp, !door.closed || panel.fault != Fault::None);
  if (now - lastReport >= 500) {
    lastReport = now;
    Serial.printf("%lu,%.1f,%d,%d,%d,%s,%s", static_cast<unsigned long>(now),
                  temperature / 10.0, door.closed, rotationProven, panel.fanCommand(),
                  modeName(panel.mode), faultName(panel.fault));
    if (useFanTach) Serial.printf(",%lu", static_cast<unsigned long>(tachHz));
    Serial.println();
  }
  delay(10);
}
