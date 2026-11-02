/* The whole curriculum. Chapters whose file does not exist yet show as "writing…". */
window.TOC = {
  books: [
    {
      id: "practice", title: "Practice Book", short: "Practice",
      blurb: "Hands on. Build it, measure it, break it safely, fix it. Every lab links to the theory behind it.",
      parts: [
        { title: "Part A · Your bench", blurb: "Tools, safety and the first circuits.", chapters: [
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
          { n: "P20", file: "practice/p20-cat6-termination.html", title: "Cat6 termination and testing", d: "T568A/B, RJ45 plugs, keystones, patch panels, testers, and the faults you will find." }
        ]},
        { title: "Part E · Working like a technician", blurb: "Method skills every employer tests.", chapters: [
          { n: "P21", file: "practice/p21-fault-finding.html", title: "Fault-finding: a technician's troubleshooting method", d: "Half-splitting, measure-don't-guess, and worked faults on power, signals, networks and field devices." },
          { n: "P22", file: "practice/p22-reading-drawings.html", title: "Reading drawings: schematics, wiring diagrams and as-builts", d: "Schematics vs wiring diagrams, riser and block diagrams, cable schedules, points lists and marking up as-builts." },
          { n: "P23", file: "practice/p23-din-rail-panel-build.html", title: "Build a DIN-rail control panel (12/24 V)", d: "Power supply, fusing, terminals, relays and labels: a mini security/BMS panel on your bench." }
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
          { n: "T14", file: "theory/t14-op-amps.html", title: "Op-amps: the golden rules", d: "Comparators, followers, amplifiers and the feedback idea behind them." }
        ]},
        { title: "Part 4 · Digital, computers and signals", blurb: "From logic gates to sensors, current loops and decibels.", chapters: [
          { n: "T15", file: "theory/t15-digital-logic-microcontrollers.html", title: "Digital logic and how a microcontroller works", d: "Binary, gates, flip-flops, clocks, memory, registers and the ADC." },
          { n: "T16", file: "theory/t16-signals-noise-loops.html", title: "Signals: sampling, decibels, noise and 4–20 mA loops", d: "Why industry sends current not voltage, and how to read a dB figure." }
        ]},
        { title: "Part 5 · Systems theory for the field", blurb: "Networks, sensors and motors: the theory under building and security systems.", chapters: [
          { n: "T17", file: "theory/t17-networking-theory.html", title: "How networks really work: Ethernet, IP, TCP/UDP", d: "Layers, frames, MAC and IP addresses, ARP, switching vs routing, ports, multicast and why cameras flood networks." },
          { n: "T18", file: "theory/t18-sensor-physics.html", title: "Sensor physics: how sensors turn the world into signals", d: "Thermistors, RTDs, thermocouples, PIR, Hall effect, pressure, humidity, CO₂ and photoelectric smoke." },
          { n: "T19", file: "theory/t19-motors-vsds.html", title: "Motors and variable speed drives", d: "DC, stepper and induction motors, slip, VSDs and the fan affinity laws behind every AHU." }
        ]}
      ]
    },
    {
      id: "career", title: "Australia Job Track", short: "Career",
      blurb: "The systems Australian employers hire for: BMS, security, telecom, fibre, industrial. Plus licences and the path in.",
      parts: [
        { title: "Part 0 · The market", blurb: "Start with the evidence from real Australian job ads.", chapters: [
          { n: "C00", file: "career/c00-what-job-ads-ask-for.html", title: "What Australian job ads actually ask for", d: "2,764 SEEK ads from your research: competition, tickets, tools and pay for each technician family." }
        ]},
        { title: "Part I · Building services", blurb: "The building systems trades.", chapters: [
          { n: "C01", file: "career/c01-bms-fundamentals.html", title: "BMS fundamentals: what a building management system does", d: "HVAC plant, points (AI/AO/DI/DO), controllers, front ends and alarms." },
          { n: "C02", file: "career/c02-bms-protocols-commissioning.html", title: "BMS protocols and commissioning: BACnet, Modbus, Niagara", d: "Device addressing, point mapping, trend logs, and a commissioning checklist." },
          { n: "C03", file: "career/c03-hvac-for-technicians.html", title: "HVAC for electronics people", d: "Chillers, AHUs, VAV boxes, FCUs, sensors and the control loops a BMS tech tunes." },
          { n: "C04", file: "career/c04-fire-detection-ewis.html", title: "Fire detection and EWIS basics", d: "Detectors, panels, loops, EOL resistors and the Australian standards around them." }
        ]},
        { title: "Part II · Security systems", blurb: "Cameras, access control and alarms.", chapters: [
          { n: "C05", file: "career/c05-cctv-ip-cameras.html", title: "CCTV and IP camera installation", d: "Camera types, lenses and field of view, PoE, NVRs, storage maths and a job walkthrough." },
          { n: "C06", file: "career/c06-access-control-alarms.html", title: "Access control and intruder alarms", d: "Readers, Wiegand and OSDP, locks, REX, fail-safe vs fail-secure, sensors and EOL." },
          { n: "C14", file: "career/c14-security-platforms.html", title: "Security platforms: how Gallagher, Genetec, Integriti and Milestone think", d: "Cardholders, access levels, schedules, doors, VMS recording rules and integrations, explained vendor-neutrally." }
        ]},
        { title: "Part III · Telecommunications", blurb: "Structured cabling, NBN, fibre and wireless.", chapters: [
          { n: "C07", file: "career/c07-telecom-cabling-acma.html", title: "Telecom cabling in Australia: ACMA rules and structured cabling", d: "Cabling registration, AS/CA S009, comms rooms, labelling and testing." },
          { n: "C08", file: "career/c08-nbn-technologies.html", title: "The NBN and access networks", d: "FTTP, FTTC, FTTN, HFC, fixed wireless and satellite, and the tech roles around them." },
          { n: "C09", file: "career/c09-fibre-splicing-otdr.html", title: "Fibre optics in the field: splicing, connectors and OTDR", d: "Single-mode vs multimode, fusion splicing, loss budgets and reading an OTDR trace." }
        ]},
        { title: "Part IV · Industrial and the path in", blurb: "Instrumentation, PLCs, licences and getting hired.", chapters: [
          { n: "C10", file: "career/c10-plc-instrumentation.html", title: "PLCs and industrial instrumentation", d: "Ladder logic, 4–20 mA transmitters, HART, and the control panel you will wire." },
          { n: "C15", file: "career/c15-solar-batteries.html", title: "Solar, batteries and EV chargers for technicians", d: "How PV and battery systems work, what needs an electrician, and the monitoring and support roles that don't." },
          { n: "C11", file: "career/c11-licences-pathways.html", title: "Licences, tickets and pathways in Australia", d: "White Card, ACMA, security licences, electrical licensing, skills assessment and visas." },
          { n: "C12", file: "career/c12-portfolio-study-plan.html", title: "Portfolio projects, interviews and a 12-week plan", d: "What to build, how to show it, and a weekly plan that uses this whole tutorial." },
          { n: "C13", file: "career/c13-first-day-on-site.html", title: "Your first day on an Australian site", d: "Inductions, SWMS and JSAs, PPE, permits, isolation and lock-out, site etiquette, your tool bag and job notes." }
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
          { n: "R03", file: "reference/r03-symbols-parts.html", title: "Schematic symbols and part identification", d: "Read a schematic, identify a part by its body, and decode resistor, capacitor and SMD markings." }
        ]}
      ]
    }
  ]
};
