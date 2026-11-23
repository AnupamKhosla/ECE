#pragma once

#include <stdint.h>

enum class Mode { Idle, Waiting, Running, Coast, Fault };
enum class Fault { None, MissingProof, LostProof, UnexpectedProof };

class Ventilation {
 public:
  Mode mode = Mode::Idle;
  Fault fault = Fault::None;
  bool callsForCooling = false;

  bool fanCommand() const {
    return mode == Mode::Waiting || mode == Mode::Running;
  }

  void update(uint32_t now, int temperatureTenths, bool doorShut,
              bool proof, bool resetPressed) {
    if (temperatureTenths >= 250) callsForCooling = true;
    if (temperatureTenths <= 230) callsForCooling = false;
    const bool request = callsForCooling && doorShut;
    const bool elapsed = now - enteredAt >= proofWaitMs;

    switch (mode) {
      case Mode::Idle:
        if (proof) fail(Fault::UnexpectedProof, now);
        else if (request) enter(Mode::Waiting, now);
        break;
      case Mode::Waiting:
        if (!request) enter(Mode::Coast, now);
        else if (proof) enter(Mode::Running, now);
        else if (elapsed) fail(Fault::MissingProof, now);
        break;
      case Mode::Running:
        if (!request) enter(Mode::Coast, now);
        else if (!proof) fail(Fault::LostProof, now);
        break;
      case Mode::Coast:
        if (!proof) enter(Mode::Idle, now);
        else if (now - enteredAt >= coastMs) fail(Fault::UnexpectedProof, now);
        break;
      case Mode::Fault:
        if (resetPressed && temperatureTenths <= 230 && doorShut && !proof) {
          fault = Fault::None;
          enter(Mode::Idle, now);
        }
        break;
    }
  }

 private:
  static constexpr uint32_t proofWaitMs = 8000;
  static constexpr uint32_t coastMs = 3000;
  uint32_t enteredAt = 0;

  void enter(Mode newMode, uint32_t now) {
    mode = newMode;
    enteredAt = now;
  }

  void fail(Fault reason, uint32_t now) {
    fault = reason;
    enter(Mode::Fault, now);
  }
};
