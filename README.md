# ECE Workbench

A practical electronics course in two books plus a job track, built for someone with Class 12 (non-medical) and an old ECE diploma who wants a hands-on technical job in Australia.

- **Practice Book**: hands-on labs, from a breadboard LED up to Arduino, Raspberry Pi, ESP32, Modbus, networking and Cat6 termination.
- **Theory Book**: the physics under each component, intuition first: charge and voltage, capacitors, inductors, AC, transformers, mains safety, semiconductors, transistors, op-amps, digital logic, signals and 4–20 mA loops.
- **Australia Job Track**: BMS, HVAC, fire detection, CCTV, access control, ACMA cabling, NBN, fibre splicing, PLCs, licences, and a 12-week plan.

Everything stays at extra-low voltage. Mains work in Australia is for licensed electricians only.

## Read it

Open `tutorial/index.html`, or serve the folder so the live progress features work:

```sh
cd tutorial
python3 -m http.server 8765
# then open http://localhost:8765
```

`semiconductor-explained.html` is the original diode deep dive; a copy lives in the Theory Book as T11+.
