**Live site: https://anupamkhosla.github.io/ECE/**

# ECE Workbench

A free, practical electronics course for an Australia technician pathway and a welding-machine repair pathway for a family power-tools shop in India.

- **Practice Book**: bench labs, from a breadboard LED up to Arduino, Raspberry Pi, ESP32, Modbus, networking and Cat6.
- **Theory Book**: the physics behind each part: voltage, capacitors, transformers, semiconductors, transistors, op-amps, logic, 4–20 mA.
- **Australia Job Track**: BMS, HVAC, fire, CCTV, access control, cabling, NBN, PLCs, licences and a 12-week plan.
- **Welding Repair Track**: [start at W00](tutorial/welding/w00-start-here.html). Eight chapters cover machine families, a battery rectifier lab, unpowered diagnosis, switches/drivers, worked faults, parts and return to service, plus annotated videos and manufacturer references.
- **Power-electronics physics**: T20–T23 add IGBTs, switching converters and feedback, fast rectifiers, capacitor ageing and thermal failure. Repair chapters also link to the existing diode, MOSFET, transformer and circuit lessons.
- **Reference Shelf**: glossary, formula sheet, symbols and parts.

Construction labs use batteries or isolated extra-low-voltage supplies. Actual welding equipment contains hazardous mains-connected circuits and stored energy. Inside-machine work requires a competent repair mentor, model-specific isolation/discharge verification and appropriate service equipment; energised diagnosis and return-to-service checks are supervised technician work. Australian equipment-repair licensing depends on the state and scope.

The welding track includes a bridge-rectifier meter trainer, an illustrative IGBT loss calculator, a PWM timing model and a [fillable, printable repair job sheet](tutorial/reference/r04-welding-job-sheet.html). All run locally with no backend. Job-sheet entries are not saved across page reloads.

Review scope (5 November 2026): spot-checked the existing diode, MOSFET, rectifier and safety explanations used by this track. Corrected threshold-based MOSFET selection, the fixed diode-drop explanation, an overbroad reverse-blocking claim and blanket Australian licensing statements. This is not an exhaustive audit of every chapter. W07 distinguishes checked manufacturer documents from description-verified video links; no claim is made that the full videos were watched or safety-audited.

Run it locally: `cd tutorial && python3 -m http.server 8765`, then open http://localhost:8765.
