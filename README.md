**Live site: https://anupamkhosla.github.io/ECE/**

# ECE Workbench

A practical electronics course with a shared foundation for repair work, building controls and electronics projects. Start with the [ECE foundation roadmap](tutorial/practice/p00-foundation-roadmap.html), then choose a route once you can predict, measure and explain the bench results.

- **Practice Book** covers the bench, measurement, soldering and diagnostics. It includes Arduino, Raspberry Pi, ESP32, Modbus, networks and cabling. Each new lab links to the theory behind the parts and readings.
- **Theory Book** covers circuits, device physics, feedback and signals. [T24–T32](tutorial/theory/t24-measurement-datasheets.html) add measurement loading, filters, board rework, startup sequencing, battery charging, USB-C, firmware timing, control and RF.
- **Laptop and phone repair** covers symptom triage, documented module replacement and board-level measurements on a trainer or donor. Start with [P32 for laptops](tutorial/practice/p32-laptop-service.html) or [P34 for phones](tutorial/practice/p34-phone-module-service.html).
- **BMS and Australia Job Track** covers BMS, HVAC, fire, CCTV, access control, cabling, NBN, PLCs and licences. Build the [simulated air handler](tutorial/practice/p29-bms-commissioning-lab.html) to practise point checks, fault tests and handover.
- **Embedded and RF projects** include [a timed controller](tutorial/practice/p27-firmware-state-machine.html), [a line-following robot](tutorial/practice/p28-line-following-robot.html), [an IoT reliability lab](tutorial/practice/p30-iot-reliability.html) and [an indoor receive antenna](tutorial/practice/p31-antenna-receive-lab.html).
- **Welding Repair Track** starts at [W00](tutorial/welding/w00-start-here.html). Eight chapters cover machine families, a battery rectifier lab, unpowered diagnosis, a [5 V switching and oscilloscope lab](tutorial/welding/w04-switches-drivers.html#scope-a-pwm-switch), worked faults, parts and return to service.
- **Power-electronics physics**: T20–T23 add IGBTs, switching converters and feedback, fast rectifiers, capacitor ageing and thermal failure. Repair chapters also link to the existing diode, MOSFET, transformer and circuit lessons.
- **Repair work and portfolio** covers intake, quotes, verification and case records in [C16](tutorial/career/c16-repair-work-portfolio.html). The [parts index](tutorial/reference/r03-symbols-parts.html) connects individual parts and symbols to theory lessons and bench work.

Construction labs use batteries or isolated extra-low-voltage supplies. Actual welding equipment contains hazardous mains-connected circuits and stored energy. Inside-machine work requires a competent repair mentor, model-specific isolation/discharge verification and appropriate service equipment; energised diagnosis and return-to-service checks are supervised technician work. Australian equipment-repair licensing depends on the state and scope.

The welding track includes a bridge-rectifier meter trainer, an illustrative IGBT loss calculator, a PWM timing model and a [fillable, printable repair job sheet](tutorial/reference/r04-welding-job-sheet.html). All run locally with no backend. Job-sheet entries are not saved across page reloads.

Review scope (5 November 2026): spot-checked the existing diode, MOSFET, rectifier and safety explanations used by this track. Corrected threshold-based MOSFET selection, the fixed diode-drop explanation, an overbroad reverse-blocking claim and blanket Australian licensing statements. This is not an exhaustive audit of every chapter. W07 distinguishes checked manufacturer documents from description-verified video links; no claim is made that the full videos were watched or safety-audited.

From the project folder, run `python3 -m http.server 8765` and open [the local course](http://localhost:8765/tutorial/).

Light mode is the default regardless of the system theme. The Light / Dark switch remembers an explicit choice. Dark-mode design references, contrast targets and verification notes are in [Reading themes](docs/theme-readability.md).
