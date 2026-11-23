#include <Arduino.h>
#include <NetworkUdp.h>
#include <WiFi.h>
#include <ctype.h>

const char *const networkName = "ECE-Queue-Light";
// Replace this public example before uploading. Use 8 to 63 characters.
const char *const labPassphrase = "change-this-lab";
const uint16_t commandPort = 4210;
const uint32_t commandTimeoutMs = 5000;
const uint8_t greenPin = 25;
const uint8_t redPin = 26;

enum class Light { Off, Green, Red };
NetworkUDP udp;
Light light = Light::Off;
uint32_t lastCommandMs = 0;
bool listening = false;

void setLight(Light next);

void setLight(Light next) {
  // Turn the old light off before energising the other branch.
  if (next != Light::Green) digitalWrite(greenPin, LOW);
  if (next != Light::Red) digitalWrite(redPin, LOW);
  if (next == Light::Green) digitalWrite(greenPin, HIGH);
  if (next == Light::Red) digitalWrite(redPin, HIGH);
  light = next;
}

const char *currentLightName() {
  switch (light) {
    case Light::Green: return "green";
    case Light::Red: return "red";
    default: return "off";
  }
}

void servePacket() {
  int size = udp.parsePacket();
  if (size <= 0) return;

  // Eight hex characters, a space, and a command of three to six letters.
  char request[16] = {};
  if (size < 12 || size > 15 || udp.read(request, size) != size) {
    udp.clear();
    return;
  }
  if (request[8] != ' ') return;
  for (int i = 0; i < 8; ++i) {
    if (!isxdigit(static_cast<unsigned char>(request[i]))) return;
  }

  const char *command = request + 9;
  const char *reply = "error";
  if (size == 14 && memcmp(command, "green", 5) == 0) {
    setLight(Light::Green);
    lastCommandMs = millis();
    reply = currentLightName();
  } else if (size == 12 && memcmp(command, "red", 3) == 0) {
    setLight(Light::Red);
    lastCommandMs = millis();
    reply = currentLightName();
  } else if (size == 12 && memcmp(command, "off", 3) == 0) {
    setLight(Light::Off);
    reply = currentLightName();
  } else if (size == 15 && memcmp(command, "status", 6) == 0) {
    reply = currentLightName();
  }

  if (udp.beginPacket(udp.remoteIP(), udp.remotePort())) {
    udp.printf("%.8s %s", request, reply);
    udp.endPacket();
  }
}

void setup() {
  pinMode(greenPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  setLight(Light::Off);
  Serial.begin(115200);
  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(networkName, labPassphrase)) {
    Serial.println("Couldn't start Wi-Fi. Check the passphrase length, then reset.");
    return;
  }
  if (!udp.begin(WiFi.softAPIP(), commandPort)) {
    Serial.println("Couldn't open the command port. Reset the board.");
    return;
  }
  listening = true;
  Serial.print("Queue light ready at ");
  Serial.println(WiFi.softAPIP());
}

void loop() {
  if (light != Light::Off && millis() - lastCommandMs >= commandTimeoutMs) {
    setLight(Light::Off);
  }
  if (listening) servePacket();
  delay(2);
}
