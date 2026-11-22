/* The whole curriculum. Chapters whose file does not exist yet show as "writing…". */
window.TOC = {
  books: [
    {
      id: "practice", title: "Practice Book", short: "Practice",
      blurb: "Hands on. Build it, measure it, break it safely, fix it. Every lab links to the theory behind it.",
      parts: [
        { title: "Part A · Your bench", blurb: "Tools, safety and the first circuits.", chapters: [
          { n: "P00", file: "practice/p00-foundation-roadmap.html", title: "Your ECE foundation and learning routes", d: "A first-session plan, four foundation checkpoints and routes into welding, BMS, repair, embedded systems and RF." },
          { n: "P01", file: "practice/p01-bench-kit-safety.html", title: "Your bench: kit, budget and safety", d: "What to buy in Australia, what each tool is for, and the ELV safety line you must not cross." },
          { n: "P02", file: "practice/p02-breadboard-first-led.html", title: "Breadboard and your first LED circuit", d: "How a breadboard is wired inside, resistor colour codes, and Ohm's law you can measure." },
          { n: "P03", file: "practice/p03-multimeter-mastery.html", title: "Multimeter mastery", d: "Volts, amps, ohms, continuity and diode test, and the mistakes that blow fuses." },
          { n: "P04", file: "practice/p04-series-parallel-dividers.html", title: "Series, parallel and voltage dividers", d: "Prove Kirchhoff's laws with a meter, then use dividers the way sensors do." },
          { n: "P05", file: "practice/p05-soldering-wiring.html", title: "Soldering, crimping and wiring like a tradie", d: "Through-hole soldering, stripboard, ferrules, crimps, heatshrink and cable management." }
        ]},
        { title: "Part B · Components at work", blurb: "Diodes, capacitors, transistors, timers and power supplies.", chapters: [
          { n: "P06", file: "practice/p06-diodes-rectifiers.html", title: "Diodes on the bench: rectifiers and protection", d: "LED on AC, half-wave and bridge rectifiers, reverse-polarity protection, Zener regulators." },
          { n: "P07", file: "practice/p07-capacitors-rc.html", title: "Capacitors: timing, smoothing and decoupling", d: "Watch an RC charge, smooth a rectifier, and learn why every chip has a 100 nF next to it." },
          { n: "P08", file: "practice/p08-transistor-switches.html", title: "Transistors as switches: BJT, MOSFET, relays", d: "Drive a motor or a relay from a tiny signal, with the flyback diode that saves your circuit." },
          { n: "P09", file: "practice/p09-555-timer.html", title: "The 555 timer: blinkers and PWM", d: "Astable and monostable circuits, duty cycle, and dimming an LED with PWM." },
          { n: "P10", file: "practice/p10-power-supplies.html", title: "Power supplies: regulators, buck converters, batteries", d: "7805 vs buck converter, 12 V and 24 V DC in buildings, battery types and fusing." }
        ]},
        { title: "Part C · Microcontrollers and computers", blurb: "Arduino, sensors, buses, Raspberry Pi, ESP32 and instruments.", chapters: [
          { n: "P11", file: "practice/p11-arduino-first-steps.html", title: "Arduino first steps", d: "Install, blink, digital inputs with pull-ups, the serial monitor, and debouncing." },
          { n: "P12", file: "practice/p12-sensors-adc.html", title: "Sensors and the ADC", d: "Temperature, light, PIR and distance sensors; how analogue becomes a number." },
          { n: "P13", file: "practice/p13-actuators-motors.html", title: "Actuators: motors, servos and relays", d: "DC motors with drivers, servos, steppers and switching real loads safely." },
          { n: "P14", file: "practice/p14-serial-buses-modbus.html", title: "Talking to devices: UART, I²C, SPI, RS-485 and Modbus", d: "The buses inside gadgets and the field bus inside every building plant room." },
          { n: "P15", file: "practice/p15-oscilloscope-logic-analyser.html", title: "Seeing signals: oscilloscope and logic analyser", d: "Cheap scopes, probes, triggering, and decoding a serial bus on screen." },
          { n: "P16", file: "practice/p16-raspberry-pi-linux.html", title: "Raspberry Pi and the Linux you need", d: "Flash, SSH, the terminal, files, services and networking commands." },
          { n: "P17", file: "practice/p17-pi-gpio-python.html", title: "Raspberry Pi GPIO with Python: a data logger", d: "Read a sensor, log to CSV, serve a web page, and run it as a service." },
          { n: "P18", file: "practice/p18-esp32-iot-mqtt.html", title: "ESP32 and IoT: Wi-Fi, MQTT and dashboards", d: "Build a small sensor network the way building IoT systems do it." }
        ]},
        { title: "Part D · Networks and cabling on the bench", blurb: "The skills every installer job ad assumes.", chapters: [
          { n: "P19", file: "practice/p19-networking-hands-on.html", title: "Networking hands-on: IP, subnets, switches, PoE, VLANs", d: "Set static IPs, find devices, budget PoE, and segment cameras from office PCs." },
          { n: "P20", file: "practice/p20-cat6-termination.html", title: "Cat6 termination and testing", d: "T568A/B, RJ45 plugs, keystones, patch panels, testers, and the faults you will find." },
          { n: "P62", file: "practice/p62-ip-camera-commissioning.html", title: "Commission an IP camera and verify recorded video", d: "Prove PoE, the local link, live view, recorded playback and recovery after a disconnected cable." }
        ]},
        { title: "Part E · Working like a technician", blurb: "Method skills every employer tests.", chapters: [
          { n: "P21", file: "practice/p21-fault-finding.html", title: "Fault-finding: a technician's troubleshooting method", d: "Half-splitting, measure-don't-guess, and worked faults on power, signals, networks and field devices." },
          { n: "P22", file: "practice/p22-reading-drawings.html", title: "Read a site drawing and label a cable", d: "Start by finding a room sensor and preparing its cable labels. Look up floor plans, schematics, wiring diagrams and as-builts when needed." },
          { n: "P23", file: "practice/p23-din-rail-panel-build.html", title: "Build a DIN-rail control panel (12/24 V)", d: "Power supply, fusing, terminals, relays and labels: a mini security/BMS panel on your bench." }
        ]},
        { title: "Part F · Measurements and board craft", blurb: "Predict readings, measure waveforms and build reliable joints.", chapters: [
          { n: "P24", file: "practice/p24-datasheets-measurement.html", title: "Predict a reading before touching the board", d: "Measure loading with two resistor dividers and read operating conditions in a regulator datasheet." },
          { n: "P25", file: "practice/p25-scope-filters.html", title: "Measure an RC filter on the oscilloscope", d: "Measure a capacitor’s rise time, then measure gain and phase across frequency." },
          { n: "P26", file: "practice/p26-smd-rework.html", title: "Surface-mount soldering and inspection", d: "Solder, inspect, remove and refit chip resistors on a training board, with photos and video." },
          { n: "P59", file: "practice/p59-audio-signal-tracing.html", title: "Trace an audio amplifier from input to speaker", d: "Build an LM386 stage and locate a quiet output by comparing bias, waveforms and coupling." }
        ]},
        { title: "Part G · Embedded systems, automation and RF", blurb: "Build and verify an embedded controller, robot, BMS sequence, IoT monitor and indoor antenna.", chapters: [
          { n: "P27", file: "practice/p27-firmware-state-machine.html", title: "Program a timed controller that can stop", d: "Arduino firmware with non-blocking timing, debounce and a stop permissive." },
          { n: "P28", file: "practice/p28-line-following-robot.html", title: "Build a two-sensor line-following robot", d: "Wiring and an Arduino sketch for reflectance sensors, motor PWM and steering feedback." },
          { n: "P29", file: "practice/p29-bms-commissioning-lab.html", title: "Commission a simulated air handler", d: "BMS points, temperature scaling, hysteresis, fan proof, faults and a CSV trend for handover." },
          { n: "P30", file: "practice/p30-iot-reliability.html", title: "Make an IoT sensor show stale data clearly", d: "Use MQTT and Node-RED to distinguish device status, broker outage and stale telemetry." },
          { n: "P31", file: "practice/p31-antenna-receive-lab.html", title: "Build and compare an indoor receive antenna", d: "Assemble an FM dipole and compare reception as you change orientation and placement." }
        ]},
        { title: "Part H · Laptop and Android repair", blurb: "Identify parts, test symptoms and replace documented modules.", chapters: [
          { n: "P32", file: "practice/p32-laptop-service.html", title: "Laptop repair from intake to module replacement", d: "Learn the startup path and use independent tests to choose your next step before servicing a module." },
          { n: "P33", file: "practice/p33-laptop-power-diagnostics.html", title: "Laptop board diagnosis and power rails", d: "Build a two-rail trainer and trace input, standby, enable and run voltages." },
          { n: "P60", file: "practice/p60-laptop-display-cooling-input.html", title: "Diagnose a laptop’s screen, cooling and inputs", d: "Compare preboot, external display, fan behaviour and keyboard tests before opening a working spare or donor." },
          { n: "P87", file: "practice/p87-laptop-usb-c-charging.html", title: "Find why a USB-C laptop will not charge", d: "Identify the required charger profile and test ports, cable power rating, detection and battery behaviour separately." },
          { n: "P34", file: "practice/p34-phone-module-service.html", title: "Android screen, speaker and headphone jack repair", d: "Learn phone parts and work through three photo-led repairs on a Google Pixel 4a." },
          { n: "P35", file: "practice/p35-phone-board-triage.html", title: "Android charging faults and board-level triage", d: "Test USB-C charging and diagnose the flex and removable port board in a Galaxy A54 5G." },
          { n: "P36", file: "practice/p36-android-battery-service.html", title: "Diagnose and replace an Android battery", d: "Find the Pixel 4a battery and adhesive tabs, then compare charging and runtime before and after repair." },
          { n: "P61", file: "practice/p61-android-camera-diagnosis.html", title: "Diagnose an Android camera and service its module", d: "Compare front and rear capture, app and optics faults. Follow a Pixel 4a teardown to the rear-camera connector." },
          { n: "P84", file: "practice/p84-android-haptic-motor.html", title: "Diagnose weak vibration and replace a Pixel 8a haptic motor", d: "Compare several vibration sources, locate the module on a Pixel 8a and repeat the tests after restoration." },
          { n: "P85", file: "practice/p85-android-microphone-call-audio.html", title: "Find why callers cannot hear an Android phone", d: "Compare local recording, audio routes and calls, then inspect the microphone mouth and gasket before selecting a module." },
          { n: "P86", file: "practice/p86-liquid-exposure-intake.html", title: "Triage a phone or laptop after liquid exposure", d: "Keep power off, distinguish a port alert from internal exposure, and identify corrosion and repair limits." }
        ]},
        { title: "Part I · Building controls and industrial service", blurb: "Calibrate a point, test the controller sequence and hand over the diagnosis.", chapters: [
          { n: "P54", file: "practice/p54-install-a-room-sensor.html", title: "Mount, label and check a BMS room sensor", d: "Practise a first installation task on a mock wall, then identify an open circuit, misplaced sensor or mismatched profile." },
          { n: "P63", file: "practice/p63-bms-point-to-point.html", title: "Prove a BMS point from the room to the screen", d: "Match two devices to cable tags and terminal numbers, then identify a swapped screen point with a directed test." },
          { n: "P37", file: "practice/p37-current-loop-calibration.html", title: "Calibrate a 4–20 mA pressure input", d: "Wire a current source and 250 Ω receiver, record five up/down points, then diagnose a scaling error." },
          { n: "P38", file: "practice/p38-bacnet-point-commissioning.html", title: "Commission a BACnet room-controller point", d: "Read a BACnet point list and a discovery capture before diagnosing bad values, duplicate instances and overrides." },
          { n: "P175", file: "practice/p175-verify-a-modbus-register-snapshot.html", title: "Verify a Modbus register snapshot before using it", d: "Read real loopback transactions and detect split-word, in-progress and prior-generation values." },
          { n: "P39", file: "practice/p39-plc-ladder-simulation.html", title: "Build and test a start–stop PLC sequence", d: "Trace I/O, simulate a seal-in rung and prove stop, proof feedback, a timeout and restart behavior." },
          { n: "P40", file: "practice/p40-scada-trend-handover.html", title: "Read a SCADA trend and write a fault handover", d: "Use a worked time series to separate a fan proof alarm, a stale value and a front-end mapping fault." },
          { n: "P41", file: "practice/p41-drive-and-condition-checks.html", title: "Diagnose a drive trip and trend motor condition", d: "Read a simulated drive trip, separate load from electrical causes and build a repeatable vibration record." },
          { n: "P56", file: "practice/p56-electropneumatic-sequence.html", title: "Diagnose a pneumatic actuator from command to position", d: "Map a directional valve and cylinder, then separate logic, valve, air and feedback faults." }
        ]},
        { title: "Part J · Robotics, machine vision and edge AI", blurb: "Repair a robot, reason about its motion, and prove camera or model output before using it.", chapters: [
          { n: "P42", file: "practice/p42-mobile-robot-fault-finding.html", title: "Repair a mobile robot’s motor, wiring or encoder", d: "Use a secured two-wheel trainer to distinguish a jam, a failed driver, a motor fault and lost encoder feedback." },
          { n: "P43", file: "practice/p43-robot-arm-position-calibration.html", title: "Calibrate a two-joint arm and check its reach", d: "Map joint angles to tool position, compare measured and predicted points, and diagnose a displaced joint zero." },
          { n: "P44", file: "practice/p44-ros2-simulation-diagnostics.html", title: "Trace a ROS 2 robot command in simulation", d: "Use turtlesim, inspect publisher and subscriber endpoints, then distinguish no command from no feedback." },
          { n: "P45", file: "practice/p45-2d-machine-vision.html", title: "Build a 2D inspection station with controlled light", d: "Make a camera fixture, calibrate pixels to millimetres and reject a part using measured geometry." },
          { n: "P46", file: "practice/p46-stereo-depth-and-robot-vision.html", title: "Check depth accuracy before a robot uses it", d: "Compare stereo disparity and physical distance, then identify invalid depth, poor texture and calibration errors." },
          { n: "P47", file: "practice/p47-edge-ai-inspection.html", title: "Test an AI inspection model on unseen parts", d: "Collect independent capture sessions, compare model and rule-based decisions, and design an uncertain result." },
          { n: "P57", file: "practice/p57-robot-inspection-cell.html", title: "Commission a simulated robot inspection cell", d: "Combine fixture signals, 3D depth and AI inspection, then simulate faults before a robot uses the decision." }
        ]},
        { title: "Part K · Design, test and communications", blurb: "Build a board that can be tested and measure buses, RF, sensors, power and fibre.", chapters: [
          { n: "P48", file: "practice/p48-kicad-testable-pcb.html", title: "Design a PCB you can probe and repair", d: "Turn the tested LED circuit into a KiCad board with footprints, accessible test points, and a first-power plan." },
          { n: "P49", file: "practice/p49-can-bus-and-telemetry.html", title: "Log a CAN bus and verify the frame data", d: "Use an isolated virtual CAN interface, decode a published training frame and check physical termination on your own unpowered trainer." },
          { n: "P50", file: "practice/p50-vna-reflection-calibration.html", title: "Calibrate a VNA and measure RF reflections", d: "Make a one-port calibration, move the reference plane, and compare a 50 Ω load, an open and a terminated cable." },
          { n: "P51", file: "practice/p51-load-cell-data-acquisition.html", title: "Calibrate a load cell and test for drift", d: "Wire a bridge amplifier, fit a two-point scale, and check accuracy with a reference weight you did not fit." },
          { n: "P172", file: "practice/p172-measure-an-adc-acquisition-error.html", title: "Measure ADC acquisition error after a channel change", d: "Simulate sampling memory, source impedance and a filter capacitor that slows a real sensor step." },
          { n: "P52", file: "practice/p52-dc-power-logging.html", title: "Log DC power and explain a short battery runtime", d: "Measure voltage and current together, estimate energy over an on/off duty cycle, and check a short runtime against a battery rating." },
          { n: "P53", file: "practice/p53-fibre-loss-and-otdr.html", title: "Check a fibre loss budget and read an OTDR trace", d: "Calculate allowable link loss, inspect a real trace and distinguish a bad connector from distributed fibre loss." },
          { n: "P55", file: "practice/p55-pico-boot-and-swd-debugging.html", title: "Find where a Raspberry Pi Pico program stops", d: "Check power, USB and serial logging, then use SWD and GDB to distinguish a boot problem from a blocking program." },
          { n: "P58", file: "practice/p58-board-production-test.html", title: "Build a repeatable board test fixture", d: "Prove a low-voltage board test with a known-good reference, two known faults and a closing retest." }
        ]},
        { title: "Part L · Specialist repair and shop products", blurb: "Train for bench repair in fabrication, packaging, label printing and cooling. Prototype an air mover you can test and service.", chapters: [
          { n: "P66", file: "practice/p66-sewing-servo-pedal.html", title: "Diagnose an industrial sewing machine that ignores the pedal", d: "Check the treadle linkage, neutral position, harness signal and motor feedback." },
          { n: "P64", file: "practice/p64-plasma-cutter-triage.html", title: "Triage a plasma cutter that will not start", d: "Record the exact fault and distinguish consumables, air and trigger conditions." },
          { n: "P65", file: "practice/p65-packaging-sealer-diagnostics.html", title: "Diagnose a packaging sealer with a weak or uneven seam", d: "Distinguish band and impulse sealers. Compare heater command, load, film and jaw pressure." },
          { n: "P67", file: "practice/p67-barcode-printer-service.html", title: "Repair a barcode printer that skips labels or prints streaks", d: "Identify the thermal head and platen, print a standalone report and confirm the result with a scanner." },
          { n: "P68", file: "practice/p68-cold-room-probe.html", title: "Check a cold-room temperature probe and alarm", d: "Compare a reference thermometer, NTC curve and controller display. Distinguish warm, open and shorted." },
          { n: "P70", file: "practice/p70-machine-chiller-flow.html", title: "Trace a machine chiller’s low-flow alarm", d: "Use a timed volume test to tell a hydraulic restriction from a flow indicator fault." },
          { n: "P133", file: "practice/p133-hand-build-a-bench-blower.html", title: "Hand-build a 12 V bench blower", d: "Cut and drill a guarded housing, wire and test it, then use a drill jig to make a second unit in an Indian workshop." },
          { n: "P134", file: "practice/p134-build-a-battery-powered-blower.html", title: "Build a battery-powered workshop blower", d: "Fit a protected rechargeable pack and measure startup, runtime and cutoff." },
          { n: "P135", file: "practice/p135-build-a-corded-mains-blower.html", title: "Build a 230 V corded workshop blower", d: "Fabricate a case around a direct-mains centrifugal blower and test the finished Class I assembly." },
          { n: "P136", file: "practice/p136-build-a-workbench-blower-and-particle-filter.html", title: "Build a low-voltage bench blower and particle-filter prototype", d: "Measure installed airflow, compare restrictions, and work out what it would take to sell a serviceable unit in India." }
        ]},
        { title: "Part M · Telecommunications service", blurb: "Troubleshoot broadband, fibre, mobile and business voice services and practise fault handovers.", chapters: [
          { n: "P71", file: "practice/p71-nbn-service-desk-triage.html", title: "Find where an NBN broadband service stops", d: "Use a router, wired test, optical indicator and outage record to separate a local fault from the access service." },
          { n: "P72", file: "practice/p72-fibre-cross-connect.html", title: "Patch and prove a duplex fibre cross-connect", d: "Read a data-centre work order, trace fibre strands and verify optical link and traffic at both ends." },
          { n: "P73", file: "practice/p73-network-operations-outage.html", title: "Triage an outage in a network operations centre", d: "Use link and service probes to identify a branch outage, test the recovery and write the next shift's handover." },
          { n: "P74", file: "practice/p74-mobile-network-triage.html", title: "Triage a mobile coverage or activation fault", d: "Compare LTE and 5G readings, SIM or eSIM activation, data and voice at repeatable locations." },
          { n: "P75", file: "practice/p75-voip-one-way-audio.html", title: "Diagnose one-way audio on an IP phone call", d: "Check SIP call setup and both RTP media paths, then report where the missing audio was last seen." },
          { n: "P76", file: "practice/p76-hfc-coax-diagnosis.html", title: "Find a fault on an HFC coax trainer", d: "Identify cable modem ports, check spare coax with a meter and interpret a DOCSIS signal report." }
        ]},
        { title: "Part N · Commercial building and machine devices", blurb: "Identify and test the actual sensors, actuators, meters and protectors used in commercial controls.", chapters: [
          { n: "P77", file: "practice/p77-duct-differential-pressure.html", title: "Find a fault in a duct pressure measurement", d: "Trace HIGH and LOW tubes, calculate Pa from a water manometer, then verify transmitter and BMS scaling." },
          { n: "P78", file: "practice/p78-hydronic-valve-stroke.html", title: "Prove a heating or cooling valve moves and flows", d: "Distinguish an actuator command, physical valve stroke, fail state and independent water flow." },
          { n: "P79", file: "practice/p79-fan-run-proof.html", title: "Distinguish a fan command from proof of airflow", d: "Identify a current switch and air-pressure proof. Reproduce a missing or stuck status with an ELV simulator." },
          { n: "P80", file: "practice/p80-room-air-quality-sensor.html", title: "Check a room CO₂ sensor against a second meter", d: "Compare true CO₂, temperature and humidity and locate drift, placement or a stale BMS point." },
          { n: "P81", file: "practice/p81-commercial-power-meter.html", title: "Check a commercial power meter reading", d: "Use CT ratios, phase pairing, Modbus units and kWh differences to diagnose a meter and BMS mismatch." },
          { n: "P82", file: "practice/p82-io-link-sensor-replacement.html", title: "Replace an IO-Link sensor and verify its data", d: "Identify a sensor, select its IODD, check parameter storage and prove live data and validity." },
          { n: "P83", file: "practice/p83-24v-branch-protection.html", title: "Find why a 24 V panel resets when a load switches", d: "Reproduce a shared voltage drop and distinguish a supply dropout from a single electronic branch trip." },
          { n: "P88", file: "practice/p88-vav-airflow-commissioning.html", title: "Find why a VAV box misses its airflow setpoint", d: "Compare demand, box pickup pressure, reported airflow, actuator travel and an independent reference reading." },
          { n: "P89", file: "practice/p89-photoelectric-sensor-alignment.html", title: "Find why a photoelectric sensor misses a carton", d: "Compare opposed, retroreflective and diffuse sensing, then separate optical, output and counter faults." }
        ]},
        { title: "Part O · Salvage and test used laptop parts", blurb: "Assess a lot, prove a memory fault, qualify recovered parts and isolate a motherboard failure.", chapters: [
          { n: "P90", file: "practice/p90-laptop-donor-lot.html", title: "Sort an old laptop lot and qualify donor parts", d: "Price an untested donor lot, set up a reference machine, and trace each recovered part through inspection and retest." },
          { n: "P91", file: "practice/p91-test-used-laptop-ram.html", title: "Test a used laptop RAM module and its slot", d: "Use a known-good SO-DIMM and a bootable test to distinguish a bad module, socket, incompatible pair and memory-controller fault." },
          { n: "P92", file: "practice/p92-inspect-repair-damaged-ram.html", title: "Inspect damaged laptop RAM and decide what is repairable", d: "Separate edge contacts, small support components, SPD and BGA memory packages. Practise cold inspection before attempting board rework." },
          { n: "P93", file: "practice/p93-qualify-used-ssd.html", title: "Qualify a used SATA or NVMe SSD without reading files", d: "Identify the drive interface, run read-only health checks on blank training media, and interpret wear, error counters and intermittent detection." },
          { n: "P94", file: "practice/p94-salvage-laptop-cooling.html", title: "Qualify a donor laptop fan and heatsink", d: "Separate a blocked air path, failing blower, worn connection and poor heat transfer with a known-good assembly and repeatable load." },
          { n: "P95", file: "practice/p95-salvage-laptop-display.html", title: "Diagnose a blank laptop screen and qualify a donor panel", d: "Separate a no-boot fault, a panel fault and an internal display cable fault before swapping a matched donor part." },
          { n: "P96", file: "practice/p96-laptop-dc-input-harness.html", title: "Test and replace a removable laptop charging jack", d: "Separate an adapter fault from a worn barrel jack or laptop-side charging fault using a known-good charger and a removable DC-in harness." },
          { n: "P97", file: "practice/p97-laptop-board-short-isolation.html", title: "Find which branch is shorted on a laptop board", d: "Compare cold resistance against a reference, then split a 5 V trainer to isolate a failed branch before you touch a donor motherboard." },
          { n: "P98", file: "practice/p98-laptop-motherboard-replacement.html", title: "Qualify and replace a ThinkPad T480 motherboard", d: "Prove what needs replacing, match a donor board by service part number and verify ports, power and memory after the swap." }
        ]},
        { title: "Part P · Display and industrial bench repairs", blurb: "Diagnose LCD TVs, model a backlight fault and prove a cable dropout under load.", chapters: [
          { n: "P99", file: "practice/p99-lcd-tv-fault-diagnosis.html", title: "Find why an LCD television has sound but no picture", d: "Use the TV’s own picture test, a reference HDMI source and a flashlight to separate external input, image and backlight faults." },
          { n: "P100", file: "practice/p100-tv-backlight-panel-service.html", title: "Learn LED backlight fault isolation and panel handling", d: "Reproduce an open LED string at 5 V, identify exact TV strip revisions and rehearse the fragile display stack before real service." },
          { n: "P101", file: "practice/p101-industrial-sensor-cable-repair.html", title: "Find an intermittent fault in a machine sensor cable", d: "Map a detached industrial harness pin by pin and reproduce a dropout under load while keeping the machine isolated." }
        ]},
        { title: "Part Q · Specialist repair jobs", blurb: "Service plasma consumables, label printers, sensor cables, protected laptop rails and television timing boards.", chapters: [
          { n: "P102", file: "practice/p102-plasma-gas-torch-service.html", title: "Test plasma-cutter gas delivery and service torch consumables", d: "Work through a Powermax45 XP gas-test case, inspect a cold Duramax Lock torch and prove whether the fault follows the air supply or torch." },
          { n: "P103", file: "practice/p103-zebra-label-printer-service.html", title: "Clean and replace a Zebra ZD421 platen roller", d: "Use the printer's own samples to tell a media calibration problem from a repeating platen defect, then service the correct direct-thermal model." },
          { n: "P104", file: "practice/p104-m12-sensor-cable-termination.html", title: "Re-terminate a passive four-pin M12 sensor cable", d: "Fit a documented screw-terminal plug, verify its complete pin map and prove the repair under load before returning it to a machine installer." },
          { n: "P105", file: "practice/p105-laptop-board-input-fuse.html", title: "Prove and replace an open surface-mount board fuse", d: "Distinguish a missing source, an open fuse and a downstream fault. Practise replacing a documented 1206 fuse on a 5 V board." },
          { n: "P106", file: "practice/p106-tv-tcon-panel-diagnosis.html", title: "Separate a TV timing-board fault from a panel fault", d: "Compare picture patterns and parts, practise ribbon handling on detached boards and learn when an exact T-Con swap is justified." }
        ]},
        { title: "Part R · Electronics foundations", blurb: "Progress from the first circuit to reproducible analog and digital fault isolation.", chapters: [
          { n: "P126", file: "practice/p126-electronics-foundation-mastery-route.html", title: "Electronics foundations from first circuit to fault isolation", d: "Work through electricity, measurement, components, analog and digital signals, assembly and system diagnosis with practical checkpoints." },
          { n: "P107", file: "practice/p107-source-impedance-and-bench-measurements.html", title: "Find a weak supply with a load and a meter", d: "Measure source resistance, check the meter’s influence and distinguish a weak connection from current limiting." },
          { n: "P108", file: "practice/p108-op-amp-sensor-buffer.html", title: "Buffer a weak sensor signal and find the limits", d: "Build a unity-gain op-amp buffer, compare its drive against a plain divider and measure a gain stage before it clips." },
          { n: "P109", file: "practice/p109-inductive-load-switch-and-flyback.html", title: "Switch a relay coil and inspect its turn-off pulse", d: "Measure a low-voltage coil, select a transistor and clamp, then confirm the output and relay contacts on a protected trainer." },
          { n: "P110", file: "practice/p110-digital-edges-bounce-and-logic-thresholds.html", title: "See a bouncing switch and clean up a digital edge", d: "Capture a raw switch and a Schmitt-trigger output on the same timebase, then separate electrical filtering from software timing." },
          { n: "P124", file: "practice/p124-foundation-mixed-signal-capstone.html", title: "Commission a complete low-voltage sensor and alarm", d: "Combine a loaded source, analog filter, threshold and visible output in one circuit, then locate a hidden fault using the first bad measurement." }
        ]},
        { title: "Part S · BMS commissioning and platforms", blurb: "Follow field signals through HVAC sequences, BACnet, Niagara, Desigo and other vendor systems.", chapters: [
          { n: "P127", file: "practice/p127-bms-technician-to-platform-commissioning-route.html", title: "BMS from field installation to platform commissioning", d: "Learn the physical job, signals, HVAC sequences, integration, Niagara, Siemens and other vendor tools, then prove commissioning and handover." },
          { n: "P111", file: "practice/p111-ahu-sequence-trends-and-commissioning.html", title: "Commission one complete air-handler sequence", d: "Run a browser-based air-handler simulation, then prove a schedule, a fan, an alarm and a command priority using a timed functional test." },
          { n: "P125", file: "practice/p125-bms-bacnet-modbus-integration-diagnostics.html", title: "Diagnose a stale or wrongly scaled point across two protocols", d: "Distinguish field wiring, controller identity, BACnet freshness and Modbus register interpretation on an isolated BMS trainer." },
          { n: "P112", file: "practice/p112-niagara-four-workbench-integration.html", title: "Build and commission a Niagara 4 station on a training system", d: "Separate platform and station tasks, import a point, wire a training sequence and demonstrate trends, alarms, scheduling and relinquishment." },
          { n: "P113", file: "practice/p113-siemens-desigo-pxc-and-desigo-cc.html", title: "Trace a Siemens Desigo point from PXC to Desigo CC", d: "Use a PXC or DXR training project to compare hardware I/O, BACnet objects and the management station at three different layers." },
          { n: "P114", file: "practice/p114-schneider-metasys-honeywell-webctrl.html", title: "Transfer commissioning skills across four BMS ecosystems", d: "Trace the same fan and temperature points through Schneider EcoStruxure, Johnson Controls Metasys, Honeywell Optimizer and Automated Logic WebCTRL." },
          { n: "P115", file: "practice/p115-building-plant-hydronics-and-trend-diagnosis.html", title: "Diagnose a heating-water loop from command, proof and trend", d: "Use flow, differential pressure and supply/return temperatures to distinguish a closed valve, a pump problem and a scaling fault." }
        ]},
        { title: "Part T · Laptop and peripheral repair by platform", blurb: "Work across Lenovo, Dell, HP, ASUS, Samsung, Acer, Framework, Apple and the common operating systems, then diagnose keyboards and mice.", chapters: [
          { n: "P128", file: "practice/p128-laptop-repair-multiplatform-mastery-route.html", title: "Laptop repair across hardware brands and operating systems", d: "Follow one complete repair from intake through preboot diagnostics, OS tests, board and module work, and customer handover." },
          { n: "P116", file: "practice/p116-laptop-models-and-oem-diagnostics.html", title: "Find the exact laptop manual and run preboot diagnostics", d: "Compare Lenovo, Dell, HP, ASUS, Samsung, Acer and Framework by model, removable parts and diagnostic tools." },
          { n: "P129", file: "practice/p129-lenovo-yoga-book-dual-screen-and-halo-repair.html", title: "Diagnose Lenovo Yoga Book display and keyboard faults", d: "Work a dual-screen Yoga Book 9i case and distinguish it from the original Halo keyboard Yoga Book before ordering boards, cables or displays." },
          { n: "P130", file: "practice/p130-dell-latitude-5420-preboot-and-module-repair.html", title: "Triage and service a Dell Latitude 5420", d: "Run Dell’s no-power, no-POST, no-video and no-boot comparisons, then complete a model-matched repair using service and diagnostics documentation." },
          { n: "P117", file: "practice/p117-windows-laptop-startup-and-driver-diagnosis.html", title: "Diagnose a Windows laptop that reaches firmware but fails to boot", d: "Work through UEFI, drive detection, Windows Recovery Environment, Safe Mode and logged errors while preserving customer data." },
          { n: "P118", file: "practice/p118-linux-live-usb-hardware-diagnostics.html", title: "Use a Linux live USB to isolate a laptop hardware fault", d: "Compare the same peripheral across installed and live systems, then collect readable kernel evidence without writing to the internal drive." },
          { n: "P119", file: "practice/p119-macbook-diagnostics-and-repair-assistant.html", title: "Triage a MacBook and prove which module needs service", d: "Differentiate Intel and Apple silicon startup paths, service a model-specific USB-C board and verify calibration, data and port functions." },
          { n: "P120", file: "practice/p120-chromebook-diagnostics-and-recovery-triage.html", title: "Troubleshoot a Chromebook with its model and management context", d: "Use ChromeOS Diagnostics to test a charging, wireless or boot complaint and distinguish hardware work from data-erasing recovery." },
          { n: "P121", file: "practice/p121-laptop-ports-audio-and-small-module-service.html", title: "Isolate laptop port, headphone and speaker faults", d: "Build a port capability matrix and use Framework and MacBook examples to distinguish replaceable modules from board or software faults." },
          { n: "P131", file: "practice/p131-iclever-and-keyboard-repair.html", title: "Diagnose and repair iClever and other keyboards", d: "Separate Bluetooth, USB and receiver faults from bad switches, damaged ribbons, matrix rows and mechanical sticking." },
          { n: "P132", file: "practice/p132-mouse-repair-tracking-clicks-and-scroll.html", title: "Find and repair a mouse click, tracking or wheel fault", d: "Separate USB and wireless reports from button switches, optical tracking, scroll encoders and cracked wheel mechanisms." },
          { n: "P123", file: "practice/p123-laptop-board-power-good-sequence-trainer.html", title: "Find a missing enable or power-good signal before swapping a board", d: "Model standby, an enable and a power-good signal at safe voltage, then compare the first failed transition on a documented donor board." },
          { n: "P122", file: "practice/p122-laptop-data-safe-intake-and-handover.html", title: "Protect laptop data and run a repeatable handover test", d: "Separate diagnosis from destructive work, record owner authorization and deliver acceptance tests for storage, firmware, repairs and peripherals." }
        ]},
        { title: "Part U · Robotics from bench to production", blurb: "Size and tune a drive, bring up mobile navigation, plan an arm path and prove a commercial deployment.", chapters: [
          { n: "P137", file: "practice/p137-robotics-roadmap.html", title: "Learn robotics from the first motor to a production cell", d: "Choose a practical route through robot drives, ROS 2 navigation, arms, vision and factory integration." },
          { n: "P138", file: "practice/p138-robot-drive-sizing.html", title: "Size a robot drive and trace a startup fault", d: "Calculate wheel torque, speed and current, then find the startup voltage drop under load." },
          { n: "P139", file: "practice/p139-wheel-speed-control.html", title: "Tune wheel speed and test recovery from saturation", d: "Simulate a loaded motor, compare P and PI, and test sensor delay and anti-windup." },
          { n: "P140", file: "practice/p140-wheel-odometry.html", title: "Calibrate wheel odometry against floor measurements", d: "Fit wheel scale and track width, replay an encoder log and diagnose wheel slip or reversed sign." },
          { n: "P141", file: "practice/p141-ros2-mobile-bringup.html", title: "Bring up and diagnose a ROS 2 navigation stack", d: "Trace a Nav2 goal, simulated clock, localization and TF frames in a recorded case or Gazebo." },
          { n: "P142", file: "practice/p142-robot-arm-path-planning.html", title: "Plan an arm path around a fixture", d: "Compare inverse kinematics branches, fixture collisions, singularities and joint motion timing." },
          { n: "P143", file: "practice/p143-camera-to-robot-calibration.html", title: "Calibrate a fixed camera to a robot work frame", d: "Fit a camera-to-base transform and prove its accuracy with independent targets." },
          { n: "P144", file: "practice/p144-robot-plc-handshake.html", title: "Prove a robot-to-PLC handshake through faults and restart", d: "Replay stale completion, duplicate requests, missing proof and link loss with a current job ID." },
          { n: "P145", file: "practice/p145-mobile-robot-fleet.html", title: "Commission a mobile robot fleet on a paper warehouse", d: "Size an AMR fleet and check aisle reservations, docking, charging and mission recovery." },
          { n: "P146", file: "practice/p146-robot-cell-acceptance.html", title: "Accept, hand over and troubleshoot a commercial robot cell", d: "Check payload and reach, design FAT and SAT, calculate OEE and payback, then diagnose a post-handover fault." },
          { n: "P147", file: "practice/p147-gripper-and-vacuum-diagnostics.html", title: "Prove a gripper can pick, keep and release a part", d: "Calculate jaw and suction forces. Diagnose seal failure, dropped grip, stale proof and failed release." },
          { n: "P148", file: "practice/p148-servo-axis-fault-traces.html", title: "Diagnose a servo axis from following error and tool motion", d: "Compare command, encoder, independent measured position and torque through a reversal or a drive fault." },
          { n: "P149", file: "practice/p149-cnc-machine-tending-recovery.html", title: "Recover a CNC tending cycle with a part between the gripper and chuck", d: "Prove part ownership through handoff. Rehearse empty closure, restart during shared hold and stale clearance." },
          { n: "P150", file: "practice/p150-ros2-navigation-trace.html", title: "Find the first failing boundary in a ROS 2 navigation trace", d: "Use a trace to separate scan and TF timing, a paused clock and failure to move after a command." },
          { n: "P151", file: "practice/p151-offline-industrial-robot-program.html", title: "Build and prove a pick path on a virtual industrial controller", d: "Compare MoveJ and MoveL in an offline PolyScope simulation and verify stopping points and grip proof." },
          { n: "P152", file: "practice/p152-conveyor-robot-tracking.html", title: "Track a moving part from camera trigger to robot pick", d: "Use encoder travel after exposure and test a missed pick deadline on a moving conveyor." },
          { n: "P153", file: "practice/p153-close-the-loop-on-a-real-wheel.html", title: "Close the speed loop on a small geared motor", d: "Count a real encoder on an Uno and compare logged open-loop and PI motor speed." },
          { n: "P154", file: "practice/p154-encoder-signal-integrity.html", title: "Measure an encoder input before tuning the loop", d: "Measure a pulled-up encoder edge, verify receiver timing and distinguish signal faults from wrong count settings." },
          { n: "P155", file: "practice/p155-review-a-robot-stop-test.html", title: "Review a robot stop and restart test", d: "Review stop timing, uncertainty and reset behavior against a training cell's acceptance criteria." },
          { n: "P156", file: "practice/p156-fuse-wheel-and-landmark-position.html", title: "Fuse wheel travel with a landmark position", d: "Replay wheel odometry and sparse landmarks with a missing observation, a wrong position and an innovation gate." },
          { n: "P157", file: "practice/p157-route-around-a-blocked-aisle.html", title: "Route a mobile robot through a changing aisle", d: "Compare a robot’s empty and loaded footprints, a stale obstacle mark and a fresh clearing observation." },
          { n: "P158", file: "practice/p158-map-a-robot-work-area.html", title: "Build, save and reload a mobile robot map", d: "Compare measured SLAM grids and verify a saved map in a fresh map server." },
          { n: "P159", file: "practice/p159-time-a-two-axis-robot-move.html", title: "Time a two-axis robot move", d: "Compare synchronized and independent axis timing, jerk limits, settling and grip proof." },
          { n: "P160", file: "practice/p160-debug-a-joint-trajectory-controller.html", title: "Run and diagnose a ROS 2 joint trajectory", d: "Start a real software-only controller, then distinguish an invalid goal from a path tolerance abort." },
          { n: "P161", file: "practice/p161-compile-and-replay-a-plc-robot-station.html", title: "Compile and replay a PLC robot station", d: "Translate actual Structured Text and test acknowledgment deadlines, mismatched proof, disconnects and clock wrap." },
          { n: "P162", file: "practice/p162-recover-a-robot-station-journal.html", title: "Recover a robot station journal after interruption", d: "Test duplicate delivery, stale evidence and process failure on either side of a good-part commit." },
          { n: "P163", file: "practice/p163-compare-solenoid-release-clamps.html", title: "Compare two ways to switch off a robot valve coil", d: "Measure coil-current decay and switch-node voltage in ngspice, then repeat at a supply and winding corner." },
          { n: "P164", file: "practice/p164-test-hand-eye-calibration.html", title: "Test a robot camera calibration on unseen poses", d: "Fit wrist and fixed camera mounts in OpenCV, then expose bad image-to-pose pairing with held-out data." },
          { n: "P165", file: "practice/p165-audit-a-robot-cell-pilot.html", title: "Audit a robot cell trial before signing acceptance", d: "Reconcile production and losses, then check recipe-specific cycle time and placement evidence." },
          { n: "P166", file: "practice/p166-check-a-moveit-planning-scene.html", title: "Plan around a fixture in a live MoveIt simulation", d: "Compare a partial Cartesian move, a validated joint-space detour and a rejected timed route." },
          { n: "P167", file: "practice/p167-measure-motor-braking-and-bus-rise.html", title: "Measure motor braking current and DC bus rise", d: "Use ngspice to compare coast, short braking and regeneration from a back-driven motor." },
          { n: "P168", file: "practice/p168-measure-a-freertos-control-task-delay.html", title: "Measure a control task waiting on FreeRTOS", d: "Compare a binary semaphore and a mutex using task order, inherited priority and a measured wait." },
          { n: "P169", file: "practice/p169-check-a-can-sample-freshness-timeout.html", title: "Check CAN data freshness through dropouts and restart", d: "Send a training encoder stream through SocketCAN and track validity, sample progress and expiry." },
          { n: "P170", file: "practice/p170-check-a-fleet-crossing-with-open-rmf.html", title: "Check a fleet crossing with Open-RMF", d: "Run live Open-RMF conflict queries with changed footprints, arrival delays and unknown occupancy." },
          { n: "P171", file: "practice/p171-rehearse-a-robot-cell-restore.html", title: "Rehearse a robot cell restore before handover", d: "Restore a configuration and SQLite backup, then catch an old cutoff or mismatched calibration before release." },
          { n: "P173", file: "practice/p173-test-compiled-wheel-firmware-in-an-emulator.html", title: "Test compiled wheel firmware against a motor model", d: "Run both Uno builds with emulated PWM, encoder failure, loading and release-to-restart logic." },
          { n: "P174", file: "practice/p174-debug-ros2-topic-delivery-and-qos.html", title: "Debug ROS 2 topic delivery with QoS evidence", d: "Use two real Jazzy middleware implementations to check matching, history, deadline and lifespan." },
          { n: "P176", file: "practice/p176-test-machine-vision-on-a-moving-belt.html", title: "Test machine vision at conveyor speed", d: "Measure exposure blur, rolling-shutter shear and detection errors on repeatable synthetic images." },
          { n: "P177", file: "practice/p177-wait-for-a-durable-station-receipt.html", title: "Wait for a durable station receipt before clearing a result", d: "Run compiled PLC scans and a real journal through two kinds of lost acknowledgment." },
          { n: "P178", file: "practice/p178-qualify-a-production-measurement-fixture.html", title: "Qualify a production measurement fixture", d: "Separate operator, fixture and part effects and test classification near tolerance limits." },
          { n: "P179", file: "practice/p179-find-a-motor-start-brownout.html", title: "Find a motor-start brownout at the power rail", d: "Simulate six power paths and distinguish a controller reset, a low driver rail and a weak source." }
        ]}
      ]
    },
    {
      id: "theory", title: "Theory Book", short: "Theory",
      blurb: "The physics under each component, from Class 12 up. Intuition first, then the numbers.",
      parts: [
        { title: "Part 1 · Electricity from the ground up", blurb: "Charge, fields, resistance, power and circuit laws.", chapters: [
          { n: "T00", file: "theory/t00-maths-toolkit.html", title: "Maths toolkit: the school maths electronics uses", d: "SI prefixes, scientific notation, rearranging formulas, graphs, logs and dB, trig and sine waves, refreshed with circuit examples." },
          { n: "T01", file: "theory/t01-charge-current-voltage.html", title: "Charge, current and voltage", d: "What actually moves in a wire, how fast, and what a volt really is." },
          { n: "T02", file: "theory/t02-resistance-ohms-law.html", title: "Resistance and Ohm's law, physically", d: "Collisions, resistivity, temperature, and why Ohm's law is a material property." },
          { n: "T03", file: "theory/t03-power-energy-heat.html", title: "Power, energy and heat", d: "P = VI, I²R heating, kWh on your power bill, and why cables get hot." },
          { n: "T04", file: "theory/t04-circuit-laws.html", title: "Circuit laws: Kirchhoff, Thevenin and superposition", d: "Charge and energy bookkeeping that solves any DC circuit." },
          { n: "T05", file: "theory/t05-capacitors-fields.html", title: "Electric fields and capacitors", d: "Where the energy sits, dielectrics, and the RC time constant derived." }
        ]},
        { title: "Part 2 · Magnetism and AC", blurb: "Inductors, alternating current, transformers, mains and waves.", chapters: [
          { n: "T06", file: "theory/t06-magnetism-inductors.html", title: "Magnetism and inductors", d: "Faraday and Lenz, back-EMF, why relays kick, and stored magnetic energy." },
          { n: "T07", file: "theory/t07-ac-fundamentals.html", title: "AC: sine waves, RMS, phase and impedance", d: "230 V 50 Hz explained, reactance, impedance, and power factor." },
          { n: "T08", file: "theory/t08-transformers.html", title: "Transformers", d: "Flux linkage, turns ratio, losses, isolation, and why the grid is AC." },
          { n: "T09", file: "theory/t09-mains-earthing-safety.html", title: "Mains, three-phase, earthing and RCDs (Australia)", d: "The MEN system, why RCDs save lives, and what LV and ELV mean legally." },
          { n: "T10", file: "theory/t10-em-waves-antennas-fibre.html", title: "Electromagnetic waves, antennas and optical fibre", d: "Radio, Wi-Fi, 4G/5G, and light trapped in glass by total internal reflection." }
        ]},
        { title: "Part 3 · Semiconductors and active devices", blurb: "Diodes, transistors, op-amps.", chapters: [
          { n: "T11", file: "theory/t11-semiconductors-diodes.html", title: "Semiconductors and the diode family", d: "Bands, doping and the p–n junction in brief, then LED, Zener, Schottky and photodiode." },
          { n: "T11+", file: "theory/pn-junction-deep-dive.html", title: "Deep dive: why a diode has polarity (our earlier session)", d: "Your original diode questions answered from the physics up, with a numerical model." },
          { n: "T12", file: "theory/t12-bjt-physics.html", title: "How a bipolar transistor really works", d: "Two junctions, a thin base, and why a small base current controls a big one." },
          { n: "T13", file: "theory/t13-mosfet-physics.html", title: "How a MOSFET works", d: "Field effect, the inversion channel, threshold voltage and on-resistance." },
          { n: "T14", file: "theory/t14-op-amps.html", title: "Op-amps: the golden rules", d: "Comparators, followers, amplifiers and the feedback idea behind them." },
          { n: "T43", file: "theory/t43-audio-amplifier-signal-path.html", title: "Audio amplifiers, coupling and output limits", d: "Explain DC bias, AC voltage gain, speaker power, unwanted clipping and coupling losses." }
        ]},
        { title: "Part 4 · Digital, computers and signals", blurb: "From logic gates to sensors, current loops and decibels.", chapters: [
          { n: "T15", file: "theory/t15-digital-logic-microcontrollers.html", title: "Digital logic and how a microcontroller works", d: "Binary, gates, flip-flops, clocks, memory, registers and the ADC." },
          { n: "T16", file: "theory/t16-signals-noise-loops.html", title: "Signals: sampling, decibels, noise and 4–20 mA loops", d: "Why industry sends current not voltage, and how to read a dB figure." }
        ]},
        { title: "Part 5 · Systems theory for the field", blurb: "Networks, sensors and motors: the theory under building and security systems.", chapters: [
          { n: "T17", file: "theory/t17-networking-theory.html", title: "How networks really work: Ethernet, IP, TCP/UDP", d: "Layers, frames, MAC and IP addresses, ARP, switching vs routing, ports, multicast and why cameras flood networks." },
          { n: "T18", file: "theory/t18-sensor-physics.html", title: "Sensor physics: how sensors turn the world into signals", d: "Thermistors, RTDs, thermocouples, PIR, Hall effect, pressure, humidity, CO₂ and photoelectric smoke." },
          { n: "T19", file: "theory/t19-motors-vsds.html", title: "Motors and variable speed drives", d: "DC, stepper and induction motors, slip, VSDs and the fan affinity laws behind every AHU." }
        ]},
        { title: "Part 6 · Power electronics for repair", blurb: "The device physics behind welding power supplies, with links back to bench diagnosis.", chapters: [
          { n: "T20", file: "theory/t20-igbt-physics.html", title: "IGBTs: a MOS gate controlling bipolar conduction", d: "Drift regions, conductivity modulation, tail current, losses and reading a replacement datasheet." },
          { n: "T21", file: "theory/t21-switching-converters-control.html", title: "Switching converters, gate drivers and feedback", d: "PWM, transformer reset, dead time, gate charge, current sensing and protection." },
          { n: "T22", file: "theory/t22-power-rectifiers-recovery.html", title: "Power rectifiers: reverse recovery and real ratings", d: "Why an input bridge and an output rectifier are different; stored charge, Schottky diodes and snubbers." },
          { n: "T23", file: "theory/t23-capacitor-thermal-failure.html", title: "Capacitor ageing, heat and failure chains", d: "ESR, ripple heating, inrush, thermal resistance and why the visibly broken component may be a victim." }
        ]},
        { title: "Part 7 · Measuring and repairing boards", blurb: "Read specifications, understand real instruments and follow the board’s power path.", chapters: [
          { n: "T24", file: "theory/t24-measurement-datasheets.html", title: "Measurement loading, tolerance and datasheets", d: "Meter impedance, burden voltage, accuracy and guaranteed operating conditions." },
          { n: "T25", file: "theory/t25-filters-resonance.html", title: "Filters, frequency response and resonance", d: "RC gain and phase, step response, RLC resonance and damping." },
          { n: "T26", file: "theory/t26-pcb-rework-esd.html", title: "PCB construction, solder joints and ESD", d: "Pads, vias and planes, solder wetting, electrostatic discharge and TVS protection." },
          { n: "T27", file: "theory/t27-board-power-sequencing.html", title: "Board power rails, enables and startup sequencing", d: "Standby rails, laptop embedded controllers, phone PMICs, EN, power-good and reset." },
          { n: "T28", file: "theory/t28-lithium-batteries.html", title: "Lithium-ion cells, charging and protection", d: "Pack protection, fuel gauges, charge controllers, energy and runtime." },
          { n: "T29", file: "theory/t29-usb-c-power-delivery.html", title: "USB-C attachment, power delivery and diagnosis", d: "CC, VBUS, power contracts, cables and charging tests." }
        ]},
        { title: "Part 8 · Embedded control, radio and telecom", blurb: "Time, feedback, propagation and shared service paths.", chapters: [
          { n: "T30", file: "theory/t30-embedded-timing-states.html", title: "Firmware timing, state machines and recovery", d: "Debounce, millis rollover, watchdogs, brownouts and safe startup." },
          { n: "T31", file: "theory/t31-feedback-control.html", title: "Feedback, interlocks and control loops", d: "Open and closed loops, PID, hysteresis, permissives and independent proof." },
          { n: "T32", file: "theory/t32-rf-transmission-lines.html", title: "RF transmission lines, antenna matching and link budget", d: "Characteristic impedance, S11, SWR, antenna dimensions, polarisation and RSSI." },
          { n: "T44", file: "theory/t44-telecom-networks.html", title: "How broadband, mobile and voice services share a network", d: "Access media, aggregation, backhaul, DOCSIS, cellular signal units and SIP/RTP." }
        ]},
        { title: "Part 9 · Robotics, sensing and perception", blurb: "Motion and feedback, control I/O, calibration, camera geometry and learned inspection.", chapters: [
          { n: "T33", file: "theory/t33-robot-motion-and-feedback.html", title: "Robot motion, coordinate frames and encoder feedback", d: "Joint space, task space, repeatability and the encoder readings that support a robot’s control loop." },
          { n: "T34", file: "theory/t34-industrial-control-signals.html", title: "Control signals, PLC scans and independent proof", d: "Field I/O, scans, priorities, quality, interlocks and timing in building and industrial controllers." },
          { n: "T35", file: "theory/t35-calibration-and-condition-data.html", title: "Calibration, uncertainty and condition measurements", d: "Separate accuracy, precision, drift, hysteresis and resolution in sensors and maintenance trends." },
          { n: "T36", file: "theory/t36-camera-optics-and-depth.html", title: "Camera optics, calibration and stereo depth", d: "Perspective, pixels, distortion, focal length, lighting and the uncertainty of triangulated depth." },
          { n: "T37", file: "theory/t37-edge-ai-evaluation.html", title: "Edge AI, dataset leakage and inspection metrics", d: "Train, validate and test with independent captures. Understand false acceptance, confidence, drift and latency." },
          { n: "T42", file: "theory/t42-pneumatic-force-and-feedback.html", title: "Pneumatic force, directional valves and independent feedback", d: "Relate pressure and piston area to motion and distinguish air routing from electrical control." },
          { n: "T58", file: "theory/t58-robot-actuators-and-loads.html", title: "Robot actuators, loads and drive limits", d: "Translate task force into driver and motor requirements. Check gearing, heat, payload and feedback." },
          { n: "T59", file: "theory/t59-localization-and-navigation.html", title: "Wheel odometry, localization and mobile navigation", d: "Derive differential-drive motion and separate drifty local odometry from map-based corrections." },
          { n: "T60", file: "theory/t60-industrial-robot-integration.html", title: "Industrial robot cells, interfaces and acceptance", d: "Compare industrial robot types, assign part ownership and specify evidence for production acceptance." },
          { n: "T61", file: "theory/t61-servo-dynamics-and-axis-sizing.html", title: "Industrial servo dynamics, sizing and feedback", d: "Reflect load inertia, calculate peak and RMS torque, and trace nested position, velocity and current loops." },
          { n: "T62", file: "theory/t62-robot-stop-functions-and-evidence.html", title: "Robot stop functions and validation evidence", d: "Distinguish process, protective and emergency stops, safe torque off and energy isolation." },
          { n: "T63", file: "theory/t63-robot-state-estimation.html", title: "Robot state estimation and sensor uncertainty", d: "Calculate a Kalman update, evaluate an innovation and check local and map frame ownership." },
          { n: "T64", file: "theory/t64-robot-maps-costmaps-and-route-search.html", title: "Robot maps, costmaps and route search", d: "Convert positions to grid cells, identify marking and clearing evidence and account for the loaded footprint." },
          { n: "T65", file: "theory/t65-robot-trajectory-timing.html", title: "Robot trajectories, acceleration and synchronized axes", d: "Calculate triangular, trapezoidal and smooth time profiles subject to joint speed, acceleration and jerk limits." },
          { n: "T66", file: "theory/t66-robot-station-identity-and-durable-completion.html", title: "Robot station identity, evidence and durable completion", d: "Verify job, part and recipe identity. Keep production decisions correct through retries and restarts." },
          { n: "T67", file: "theory/t67-robot-hand-eye-calibration.html", title: "Hand-eye calibration for wrist and fixed cameras", d: "Derive frame chains and explain why low pixel error can coexist with a bad robot-space result." },
          { n: "T68", file: "theory/t68-robot-cell-acceptance-evidence.html", title: "How much evidence supports a robot cell acceptance decision?", d: "Agree on throughput and cycle denominators, then bound the failure rate for each sampled condition." },
          { n: "T69", file: "theory/t69-robot-paths-collisions-and-planning-scenes.html", title: "Robot paths, collision checks and planning scenes", d: "Separate endpoint validity, swept paths, scene revisions and final trajectory checks." },
          { n: "T70", file: "theory/t70-rtos-priorities-blocking-and-deadlines.html", title: "Task priority, blocking and control deadlines", d: "Apply priority inheritance and fixed-priority response-time bounds to shared resources." },
          { n: "T71", file: "theory/t71-fleet-traffic-and-timed-clearance.html", title: "Fleet traffic, timed clearance and uncertain occupancy", d: "Calculate clearance between two timed paths and decide when to hold a shared zone." },
          { n: "T72", file: "theory/t72-robot-cell-backup-and-recovery.html", title: "Robot cell backups, software rollback and production recovery", d: "Validate configuration, event cutoff and physical state before returning a cell to service." }
        ]},
        { title: "Part 10 · Measurement and design for service", blurb: "Timing and bus evidence, optical testing, PCB layout and EMC.", chapters: [
          { n: "T38", file: "theory/t38-time-series-and-digital-buses.html", title: "Time series, bus layers and evidence quality", d: "Sampling, aliasing, latency, stale values, frame decoding and timestamps across instruments and networks." },
          { n: "T39", file: "theory/t39-optical-link-loss-and-reflectometry.html", title: "Optical loss, reflections and fibre test limits", d: "Convert dBm to dB loss, understand backscatter distance and account for launch and receive dead zones." },
          { n: "T40", file: "theory/t40-pcb-layout-and-emc.html", title: "PCB return paths, decoupling and EMC", d: "Why current follows real loops, how edges couple into other circuits, and what layout choices make boards easier to test." },
          { n: "T41", file: "theory/t41-embedded-boot-and-debug.html", title: "Microcontroller boot, symbols and debug interfaces", d: "Distinguish ROM boot, firmware startup, USB, UART and SWD faults using observable boundaries." }
        ]},
        { title: "Part 11 · Commercial field equipment", blurb: "Pressure, airflow, actuator commands, energy measurement and industrial device data.", chapters: [
          { n: "T45", file: "theory/t45-commercial-hvac-device-signals.html", title: "Commercial HVAC devices, signals and independent proof", d: "Differential pressure, VAV pickup, actuator signals, fan proof and CO₂ sensor readings." },
          { n: "T46", file: "theory/t46-commercial-power-and-device-data.html", title: "Commercial power measurement, 24 V distribution and smart sensor data", d: "CT scaling, energy metering, selective branch protection and IO-Link process data, identities and validity." }
        ]},
        { title: "Part 12 · Device service and failure analysis", blurb: "How audio, haptics, liquid exposure, memory, storage and LCD construction shape diagnostic tests.", chapters: [
          { n: "T47", file: "theory/t47-phone-acoustics-and-haptics.html", title: "Phone microphones, speakers and haptics", d: "MEMS microphone ports, seals, audio routing, speaker enclosures and ERM or LRA haptic drives." },
          { n: "T48", file: "theory/t48-electronics-liquid-corrosion.html", title: "How liquid exposure damages electronics", d: "Moisture and ionic leakage, electrochemical migration, contact corrosion, capillary paths and cold inspection." },
          { n: "T49", file: "theory/t49-dram-chips-memory-faults.html", title: "Inside laptop RAM: cells, chips, ranks and spare rows", d: "Trace a DRAM cell and read a SO-DIMM label. Explain why removing a failed chip or limiting usable memory cannot normally restore a module." },
          { n: "T50", file: "theory/t50-ssd-health-and-bad-blocks.html", title: "Inside SSDs: flash wear, spare blocks and health reports", d: "Follow a logical block into NAND flash, distinguish remapped blocks from interface errors, and interpret NVMe and SATA health evidence." },
          { n: "T51", file: "theory/t51-lcd-panel-backlight.html", title: "How an LCD panel makes an image and lights it", d: "Follow the video and light paths through the mainboard, display timing, glass, optical layers and LED driver." }
        ]},
        { title: "Part 13 · Workshop equipment and consumables", blurb: "Use airflow, thermal printing and optical sensing to diagnose equipment brought to the bench.", chapters: [
          { n: "T52", file: "theory/t52-airflow-and-pressure.html", title: "Why a pneumatic gauge can read normally when air delivery fails", d: "Understand static pressure, pressure drop, regulation and stored air. Use readings taken under the same demand to localise a restriction." },
          { n: "T53", file: "theory/t53-thermal-printing-and-barcode-quality.html", title: "Thermal printheads, media sensing and barcode quality", d: "Follow a moving label past the sensor and printhead, then explain print defects using dot pitch, heat and contrast." }
        ]},
        { title: "Part 14 · Foundations, controls and laptop architecture", blurb: "Find the principles behind loaded supplies, digital thresholds, BMS sequences and laptop diagnosis.", chapters: [
          { n: "T54", file: "theory/t54-source-resistance-loading-and-uncertainty.html", title: "Source resistance, loading and measurement uncertainty", d: "Learn why voltage changes under load and how a meter, amplifier input or tolerance changes the result." },
          { n: "T55", file: "theory/t55-signal-levels-thresholds-and-time.html", title: "Logic thresholds, hysteresis and signal timing", d: "Read a logic data sheet to explain noise margin, input thresholds, debounce, probe loading and edge detection." },
          { n: "T56", file: "theory/t56-building-controls-commands-quality-and-sequences.html", title: "Building control sequences, command priorities and point quality", d: "Understand schedules, permissions, feedback, alarms and timestamps independently of a vendor’s interface." },
          { n: "T57", file: "theory/t57-laptop-firmware-boot-and-board-architecture.html", title: "How laptop power, firmware, storage and operating systems meet", d: "Separate hardware families from operating systems and trace the transitions from standby power to firmware, boot, drivers and repair calibration." }
        ]}
      ]
    },
    {
      id: "welding", title: "Welding Equipment", short: "Welding",
      blurb: "Build, qualify and service welding power sources for a small Indian workshop.",
      parts: [
        { title: "Part A · Start and understand", blurb: "Know the machine and build the small experiments before working on customer equipment.", chapters: [
          { n: "W00", file: "welding/w00-start-here.html", title: "Welding-set repair: your learning and shop plan", d: "Start here: scope, a six-stage study route, a device-to-physics map and practical milestones." },
          { n: "W01", file: "welding/w01-machine-map-safety.html", title: "Identify the machine, map the stages, prepare the bench", d: "Transformer vs inverter, two rectifiers, isolation boundaries, stored energy and supervised workshop access." },
          { n: "W02", file: "welding/w02-rectifier-bench-lab.html", title: "Rectifier testing: the first repair skill", d: "A battery bridge lab, an interactive meter trainer, eight junction readings and dual-diode packages." }
        ]},
        { title: "Part B · Diagnose and repair", blurb: "A repeatable evidence trail from the customer's complaint to the failure's cause.", chapters: [
          { n: "W03", file: "welding/w03-unpowered-diagnosis.html", title: "Unpowered diagnosis: inspect, isolate, measure", d: "A cold-test workflow, diode and switch screening, capacitor limitations and a complete worked bridge fault." },
          { n: "W04", file: "welding/w04-switches-drivers.html", title: "MOSFETs, IGBTs and the gate-driver neighbourhood", d: "Test loose switches, scope a 5 V PWM trainer and trace a missing gate pulse before working with equipment." },
          { n: "W05", file: "welding/w05-fault-cases.html", title: "Worked faults: dead, tripping, weak and overheating", d: "Five training cases with measurements, alternative explanations and repair verification." }
        ]},
        { title: "Part C · Return to service and design a set", blurb: "Document a repair, then build a low-voltage trainer for the current-control stage of a stick welder.", chapters: [
          { n: "W06", file: "welding/w06-repair-return-to-service.html", title: "Parts, first power-up and return to service", d: "Replacement criteria, insulation and cooling, model-specific recommissioning and a shop handover record." },
          { n: "W07", file: "welding/w07-tutorials-manuals.html", title: "Video tutorials, service manuals and a study workbook", d: "Practical English and Hindi/Urdu videos, manufacturer references and exercises for learning scientifically." },
          { n: "W08", file: "welding/w08-build-a-stick-welder-current-source-trainer.html", title: "Design a DC stick welding set and build its current-control trainer", d: "Wire a 9 V current regulator, measure its limits, and turn the results into a production power-source design brief." }
        ]},
        { title: "Part D · Make and sell a welding set", blurb: "Design one inverter stick welder, assemble the first units by hand and qualify the model for sale.", chapters: [
          { n: "W09", file: "welding/w09-build-a-shop-made-stick-welding-set.html", title: "Build a shop-made DC stick welding set", d: "Specify the 230 V inverter, fabricate the steel chassis and assemble the first unit." },
          { n: "W10", file: "welding/w10-qualify-and-sell-a-stick-welding-set.html", title: "Qualify and sell a stick welding set in India", d: "Load-test, qualify and cost a manual pilot with evidence for every serial number." },
          { n: "W11", file: "welding/w11-make-and-test-welding-leads.html", title: "Make and test a welding lead set", d: "Cut 25 mm² copper, fit the holder and work clamp, and screen milliohm resistance on a bench jig." },
          { n: "W12", file: "welding/w12-hand-wind-a-ferrite-transformer.html", title: "Hand-wind and test a ferrite transformer", d: "Wind a 24-to-12-turn trainer, then measure inductance, ratio and polarity on a low-voltage bench." }
        ]}
      ]
    },
    {
      id: "career", title: "Jobs and Repair Shops", short: "Career",
      blurb: "Australian technician careers and service businesses you can test locally in India.",
      parts: [
        { title: "Part 0 · The market", blurb: "Start with the evidence from real Australian job ads.", chapters: [
          { n: "C00", file: "career/c00-what-job-ads-ask-for.html", title: "What Australian job ads actually ask for", d: "2,764 SEEK ads from your research: competition, tickets, tools and pay for each technician family." },
          { n: "C18", file: "career/c18-controls-robotics-and-service-careers.html", title: "Choose a path into controls, electronics test or automation", d: "Compare Australian entry routes, actual employer tasks and portfolio evidence for hands-on technician roles." },
          { n: "C20", file: "career/c20-ludhiana-melbourne-technician-jobs.html", title: "Find hands-on technician work in Melbourne", d: "Compare local ads, entry requirements and training pathways for repair, instrumentation, controls and HVAC site work." }
        ]},
        { title: "Part I · Building services", blurb: "The building systems trades.", chapters: [
          { n: "C01", file: "career/c01-bms-fundamentals.html", title: "BMS fundamentals: what a building management system does", d: "HVAC plant, points (AI/AO/DI/DO), controllers, front ends and alarms." },
          { n: "C02", file: "career/c02-bms-protocols-commissioning.html", title: "BMS protocols and commissioning: BACnet, Modbus, Niagara", d: "Device addressing, point mapping, trend logs, and a commissioning checklist." },
          { n: "C03", file: "career/c03-hvac-for-technicians.html", title: "HVAC for electronics people", d: "Chillers, AHUs, VAV boxes, FCUs, sensors and the control loops a BMS tech tunes." },
          { n: "C17", file: "career/c17-bms-fieldwork.html", title: "BMS fieldwork: diagnose and commission a damper", d: "Trace a BMS command to a real actuator, check why the shaft stays closed, and reproduce the fault on a 5 V bench." },
          { n: "C04", file: "career/c04-fire-detection-ewis.html", title: "Fire detection and EWIS basics", d: "Detectors, panels, loops, EOL resistors and the Australian standards around them." }
        ]},
        { title: "Part II · Security systems", blurb: "Cameras, access control and alarms.", chapters: [
          { n: "C05", file: "career/c05-cctv-ip-cameras.html", title: "CCTV and IP camera installation", d: "Camera types, lenses and field of view, PoE, NVRs, storage maths and a job walkthrough." },
          { n: "C06", file: "career/c06-access-control-alarms.html", title: "Access control and intruder alarms", d: "Readers, Wiegand and OSDP, locks, REX, fail-safe vs fail-secure, sensors and EOL." },
          { n: "C14", file: "career/c14-security-platforms.html", title: "Security platforms: how Gallagher, Genetec, Integriti and Milestone think", d: "Cardholders, access levels, schedules, doors, VMS recording rules and integrations, explained vendor-neutrally." }
        ]},
        { title: "Part III · Telecommunications", blurb: "Melbourne career routes, regulated cabling, NBN, fibre and wireless.", chapters: [
          { n: "C21", file: "career/c21-melbourne-telecom-jobs.html", title: "Find a first telecom job in Melbourne", d: "Compare ISP support, mobile and network operations, data-centre patching and field trainee roles." },
          { n: "C07", file: "career/c07-telecom-cabling-acma.html", title: "Telecom cabling in Australia: ACMA rules and structured cabling", d: "Cabling registration, AS/CA S009, comms rooms, labelling and testing." },
          { n: "C08", file: "career/c08-nbn-technologies.html", title: "The NBN and access networks", d: "FTTP, FTTC, FTTN, HFC, fixed wireless and satellite, and the tech roles around them." },
          { n: "C09", file: "career/c09-fibre-splicing-otdr.html", title: "Fibre optics in the field: splicing, connectors and OTDR", d: "Single-mode vs multimode, fusion splicing, loss budgets and reading an OTDR trace." }
        ]},
        { title: "Part IV · Industrial and the path in", blurb: "Instrumentation, PLCs, licences and getting hired.", chapters: [
          { n: "C10", file: "career/c10-plc-instrumentation.html", title: "PLCs and industrial instrumentation", d: "Ladder logic, 4–20 mA transmitters, HART, and the control panel you will wire." },
          { n: "C15", file: "career/c15-solar-batteries.html", title: "Solar, batteries and EV chargers for technicians", d: "How PV and battery systems work, what needs an electrician, and the monitoring and support roles that don't." },
          { n: "C11", file: "career/c11-licences-pathways.html", title: "Licences, tickets and pathways in Australia", d: "White Card, ACMA, security licences, electrical licensing, skills assessment and visas." },
          { n: "C12", file: "career/c12-portfolio-study-plan.html", title: "Portfolio projects, interviews and a 12-week plan", d: "What to build, how to show it, and a weekly plan that uses this whole tutorial." },
          { n: "C13", file: "career/c13-first-day-on-site.html", title: "Your first day on an Australian site", d: "Inductions, SWMS and JSAs, PPE, permits, isolation and lock-out, site etiquette, your tool bag and job notes." },
          { n: "C16", file: "career/c16-repair-work-portfolio.html", title: "Build a repair portfolio and a shop workflow", d: "Case records for BMS and repair, with intake, assessment, quoting, retesting and handover." }
        ]},
        { title: "India · Start a specialist repair service", blurb: "Evaluate local customers, turnaround, parts and the bench tests behind a paid repair.", chapters: [
          { n: "C19", file: "career/c19-ludhiana-repair-shop.html", title: "Choose a specialist repair service in Ludhiana", d: "Use the existing counter to validate paid jobs in plasma, packaging, temperature controls and portable electronics." }
        ]}
      ]
    },
    {
      id: "reference", title: "Reference Shelf", short: "Reference",
      blurb: "Look-up pages to keep open on the bench: words, formulas, symbols and part markings.",
      parts: [
        { title: "Look-up pages", blurb: "Quick answers while you build.", chapters: [
          { n: "R01", file: "reference/r01-glossary.html", title: "Glossary: every term in plain English", d: "From ampere to Zener, BACnet to VLAN, with a link to where each one is taught." },
          { n: "R02", file: "reference/r02-formula-sheet.html", title: "Formula sheet with worked numbers", d: "Every formula in the course, what each symbol means, and a typical-value example." },
          { n: "R03", file: "reference/r03-symbols-parts.html", title: "Schematic symbols and part identification", d: "Read a schematic, identify a part by its body, decode markings and find theory and bench links." },
          { n: "R04", file: "reference/r04-welding-job-sheet.html", title: "Welding repair job sheet", d: "A printable, fillable record for intake, cold tests, replacement parts and supervised return-to-service checks." },
          { n: "R05", file: "reference/r05-practical-learning-library.html", title: "Practical learning library for electronics and automation", d: "Use trusted electronics labs, field training, robotics exercises and manufacturer guides alongside your Workbench labs." }
        ]}
      ]
    }
  ]
};
