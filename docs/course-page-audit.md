# ECE Workbench page audit

## Board repair, LCD televisions and industrial cables · 20 November 2026

- [P97](../tutorial/practice/p97-laptop-board-short-isolation.html) adds a protected 5 V branch-isolation exercise and a documented donor-board example. [P98](../tutorial/practice/p98-laptop-motherboard-replacement.html) covers a T480 motherboard swap, FRU matching and acceptance tests.
- [P99](../tutorial/practice/p99-lcd-tv-fault-diagnosis.html) adds closed-case TV tests. [P100](../tutorial/practice/p100-tv-backlight-panel-service.html) uses a 5 V LED trainer and a separated display stack. [T51](../tutorial/theory/t51-lcd-panel-backlight.html) explains LCD image and light paths.
- [P101](../tutorial/practice/p101-industrial-sensor-cable-repair.html) reproduces an intermittent dropout in a detached industrial sensor lead. [C19](../tutorial/career/c19-ludhiana-repair-shop.html) now includes bench jobs and public Ludhiana evidence. Service availability and demand still need to be checked with the shop's customers.
- [P92](../tutorial/practice/p92-inspect-repair-damaged-ram.html) now cites dated Indian price observations and compares repair economics against a tested replacement. All new chapters have annotated photos and video demonstrations.

## Laptop salvage and component decisions · 20 November 2026

Added seven practice chapters and two theory chapters. [Benchtop route](../tutorial/index.html#laptop-salvage)

- Use [P90](../tutorial/practice/p90-laptop-donor-lot.html) for lot intake and safe parts sorting before paying. The revenue example uses fictional prices and test yield.
- Use [P91](../tutorial/practice/p91-test-used-laptop-ram.html) for a bootable module and socket comparison. [P92](../tutorial/practice/p92-inspect-repair-damaged-ram.html) covers contacts, support components, SPD and BGA decision-making. [T49](../tutorial/theory/t49-dram-chips-memory-faults.html) explains which faults a row spare, ECC or address exclusion can address.
- Use [P93](../tutorial/practice/p93-qualify-used-ssd.html) and [T50](../tutorial/theory/t50-ssd-health-and-bad-blocks.html) for SSD identification and health evidence. [P94](../tutorial/practice/p94-salvage-laptop-cooling.html) compares matching fan and thermal assemblies.
- [P95](../tutorial/practice/p95-salvage-laptop-display.html) proves panel and cable faults with one change at a time. [P96](../tutorial/practice/p96-laptop-dc-input-harness.html) checks a removable charging jack and uses BIOS to confirm adapter recognition. All seven practice chapters have annotated photographs and existing demonstrations.

## Device service and foundations · 20 November 2026

Reviewed all 174 chapter pages at the device-service release. The audit counted distinct inline raster images and identified direct video links. Counts identify where to review the media by hand. A raster image may be a diagram or a screenshot, and a video link may need a more precise demonstration.

### Changes published after the scan

- Device service now covers Android vibration and call audio, liquid exposure, laptop USB-C charging, VAV airflow and photoelectric sensing. Each of the six practical pages has two inline photos, a video and a test record to keep. The new theory explains phone acoustics, haptics and liquid-related failures. [Device diagnosis route](../tutorial/index.html#device-diagnostics) · [Commercial controls route](../tutorial/index.html#commercial-devices)
- P04 now shows the divider midpoint, rail and separate probe contacts. P07 compares real capacitor packages and shows ceramic construction under magnification. P10 shows a real regulator package and corrects load-resistor power and thermal test instructions. P21 adds a repeatable source-to-load comparison. [P04](../tutorial/practice/p04-series-parallel-dividers.html) · [P07](../tutorial/practice/p07-capacitors-rc.html) · [P10](../tutorial/practice/p10-power-supplies.html) · [P21](../tutorial/practice/p21-fault-finding.html)
- T45, T46 and T48 have now added direct video links. C19 and C20 had no inline raster image or directly linked video in the scan. Their current content is business and job research. Add role or equipment media only where it illustrates the action described by the chapter.
- P15 now shows the scope and logic analyser connections and adds a calibration capture. P16 pictures both sides of a Pi 5 and adds a boot and network check. P17 shows the temperature sensor package and how to distinguish a GPIO wiring fault from a failed sensor read. [P15](../tutorial/practice/p15-oscilloscope-logic-analyser.html) · [P16](../tutorial/practice/p16-raspberry-pi-linux.html) · [P17](../tutorial/practice/p17-pi-gpio-python.html)
- P70 now shows a water flowmeter and compares it with level and switch indication. P82 adds a model-specific port identification and mapping exercise using ifm’s AL1100. [P70](../tutorial/practice/p70-machine-chiller-flow.html) · [P82](../tutorial/practice/p82-io-link-sensor-replacement.html)

### Next practical pages with one inline raster image

| Chapter | What to show when revising the lab |
| --- | --- |

| [P00 Your ECE foundation and learning routes](../tutorial/practice/p00-foundation-roadmap.html) | A completed first circuit beside the first field-style work record, so the route has visible examples of the two difficulty levels. |
| [P11 Arduino first steps](../tutorial/practice/p11-arduino-first-steps.html) | Board variants and two states of the upload path, with the power, activity and reset indicators named. |
| [P14 Talking to devices: UART, I²C, SPI, RS-485 and Modbus](../tutorial/practice/p14-serial-buses-modbus.html) | Real UART, I²C, SPI and RS-485 hardware. Show the pins or terminals before comparing a good and a failed transaction. |
| [P18 ESP32 and IoT: Wi-Fi, MQTT and dashboards](../tutorial/practice/p18-esp32-iot-mqtt.html) | ESP32 power and boot controls, the sensor wired to the actual board, and a dashboard showing live versus stale data. |
| [P19 Networking hands-on: IP, subnets, switches, PoE, VLANs](../tutorial/practice/p19-networking-hands-on.html) | Patch lead, switch port indicator and a captured local topology for the small network lab. |
| [P22 Read a site drawing and label a cable](../tutorial/practice/p22-reading-drawings.html) | Separate highlighted parts of a real drawing, cable label and termination it points to. |
| [P24 Predict a reading before touching the board](../tutorial/practice/p24-datasheets-measurement.html) | The same test points photographed with a meter, and the predicted-versus-measured entries from the comparison. |
| [P25 Measure an RC filter on the oscilloscope](../tutorial/practice/p25-scope-filters.html) | Probe attachment and the bench RC network, with adjacent input and output traces on a real screen. |
| [P27 Program a timed controller that can stop](../tutorial/practice/p27-firmware-state-machine.html) | Controller wiring and an independent stop input, then the observed signal at a stop transition. |
| [P28 Build a two-sensor line-following robot](../tutorial/practice/p28-line-following-robot.html) | Underside sensor clearance and route material, with the wheels and motor connections located. |
| [P29 Commission a simulated air handler](../tutorial/practice/p29-bms-commissioning-lab.html) | Air-handler and controller views that identify the points in the simulator sequence. |
| [P30 Make an IoT sensor show stale data clearly](../tutorial/practice/p30-iot-reliability.html) | Bench sensor hookup and two dashboard states with timestamps, using captured test data. |
| [P82 Replace an IO-Link sensor and verify its data](../tutorial/practice/p82-io-link-sensor-replacement.html) | The connector, master port LEDs, and actual side-by-side displays of parameter restore and current process data. |

## Practical course comparison and route revision · 20 November 2026

The current catalogue has 150 chapters. The India repair-shop route adds seven repair labs and a Ludhiana market guide. The job track adds a Ludhiana and Melbourne comparison based on reviewed employer ads. The previous expansion added component-level audio diagnosis and theory, laptop display and cooling, Android camera diagnosis, network camera commissioning and BMS point-to-point checks. See the [India repair-shop research](india-repair-shop-research.md), the [local job research](ludhiana-melbourne-job-market.md) and the [course and competency comparison](practical-course-crosswalk.md).

## Practical curriculum expansion · 20 November 2026

Added 22 practical chapters, 10 theory articles, an Australian career chapter and a practical learning library. The new routes cover physical BMS installation, industrial controls, pneumatics, robot service and positioning, ROS 2, 2D and stereo vision, AI inspection, board design and production test, CAN, RF and fibre test, sensor calibration, Pico debugging and DC power logging. Each new practical chapter links to theory and finishes with evidence a learner can keep. Start from the [course hub](../tutorial/index.html) or look up the [source comparison and job research](curriculum-research.md). The Android revision and earlier page-by-page baseline remain below.

The catalogue now lists 135 chapters. Each has an inline image and a direct video link. The expansion added 28 media files, and all 248 inline local image references in the catalogue resolve. Each of the 25 distinct YouTube links used in the new chapters returned video metadata. That check establishes link availability at review time. Topic coverage and placement were checked separately against the work described in each new lab.

## Android repair revision · 20 November 2026

- **P34, Pixel 4a.** Rebuilt around one Android model. Start outside the handset and separate display, touch, earpiece, loudspeaker, headphone and microphone symptoms. The screen, bottom loudspeaker and jack each have their own procedure, close-ups, model-matched video and closing tests. [P34](../tutorial/practice/p34-phone-module-service.html)
- **P35, Galaxy A54 5G.** Added a known-good cable and two-orientation charge comparison, a real meter readout and a photo sequence for replacing the USB-C daughterboard. The sequence shows the rear cover, lower board cover, flexes, coax and removed board. [P35](../tutorial/practice/p35-phone-board-triage.html)
- **P36, Pixel 4a battery.** Added a lesson on draining fast versus charging intermittently, where the two battery tabs sit and how to repeat the intake checks after replacement. The photo sequence shows the tabs and the removed pack. [P36](../tutorial/practice/p36-android-battery-service.html)
- **PC and bench foundation.** P32 now identifies desktop and laptop parts before asking the learner to remove an SSD or RAM module. P33 shows how to reason from input power to startup rails. P03 and P05 have new close-ups of actual probe placements and solder joint faults. [P32](../tutorial/practice/p32-laptop-service.html) · [P33](../tutorial/practice/p33-laptop-power-diagnostics.html) · [P03](../tutorial/practice/p03-multimeter-mastery.html) · [P05](../tutorial/practice/p05-soldering-wiring.html)
- **Further Android lessons to develop.** Add a camera fault comparison and replacement, picture a torn connector or lifted pad through a microscope, and source cold-measurement photos for a documented training board. The historical tables still list the wider course work.

## First media pass · 20 November 2026

The **100 chapters at the time** received a real photo and at least one direct YouTube link. This table records media coverage. The lesson-by-lesson review under it records where a practical sequence needs more photos, instruction or a more specific video. [Live course hub](https://anupamkhosla.github.io/ECE/tutorial/)

| Area | Chapters | Chapters with photos | Chapters with direct videos |
| --- | ---: | ---: | ---: |
| Practice Book | 36 | 36 | 36 |
| Theory Book | 34 | 34 | 34 |
| Welding Repair Track | 8 | 8 | 8 |
| Australia Job Track | 18 | 18 | 18 |
| Reference Shelf | 4 | 4 | 4 |
| **Total** | **100** | **100** | **100** |

- **Bench and welding.** P06 now has labelled loose diodes, a packaged bridge, a hand-wired four-diode bridge and a PCB close-up. W01 links to labelled photos of the Weldarc 200’s actual internal layout. W02 has the probe exercise and videos on bridge behaviour and the welder input stage. [P06](../tutorial/practice/p06-diodes-rectifiers.html), [W01](../tutorial/welding/w01-machine-map-safety.html), [W02](../tutorial/welding/w02-rectifier-bench-lab.html)
- **Beginner routes.** The hub links straight to Raspberry Pi setup, GPIO and the first IoT build. The chapter sidebar has an accordion and a search field that opens matching lessons on the hub. The building-controls installation route starts with finding a room sensor and labelling its cable. [Hub](../tutorial/index.html), [P22](../tutorial/practice/p22-reading-drawings.html#first-site-task), [C17](../tutorial/career/c17-bms-fieldwork.html)
- **Next photos to source.** Look for a reusable cutaway of a moulded bridge, probe placements with real meter readings, and comparison shots of a finished ferrule, an opened phone charging port and a BMS input on a controller. The page-by-page tables record the additional views and activities to look for. YouTube metadata was available for all 74 distinct links at the time of the update. Full playback and timestamps still warrant review when revising specific lessons.

## Baseline scan · 19 November 2026

The original scan reviewed all **99 course chapters** and **four other HTML pages** then published. All 103 URLs returned HTTP 200 and their HTML matched the checked-out files byte for byte. C17 was added after this scan. The historical tables below preserve its observations and the suggested improvements for each page.

## What the scan found

| Area | Chapters | With inline photos | With YouTube links |
| --- | ---: | ---: | ---: |
| Practice Book | 36 | 5 | 3 |
| Theory Book | 34 | 0 | 0 |
| Welding Repair Track | 8 | 1 | 2 |
| Australia Job Track | 17 | 1 | 0 |
| Reference Shelf | 4 | 0 | 0 |
| **Total** | **99** | **7** | **5** |

The page tables count image tags and direct YouTube links in the chapter HTML. Existing diagrams, interactive illustrations and external reference links are outside those counts. Playback, licensing and the quality of each future asset need checking during selection.

- **Rectifiers.** P06 uses diagrams for the bridge and its terminals. The missing views are the case markings, internal construction and position on a real PCB. [Live P06 lesson](https://anupamkhosla.github.io/ECE/tutorial/practice/p06-diodes-rectifiers.html)
- **Search.** Full-text search appears only on the hub. The current search downloads the available chapter pages on the first query before it can display matches. [Hub markup](../tutorial/index.html), [shared site script](../tutorial/assets/app.js)
- **Left menu.** The sidebar shows every book, part and chapter expanded in one list. Desktop and the mobile drawer use the same list. [Sidebar code](../tutorial/assets/app.js)
- **Raspberry Pi.** P16 covers Pi setup, Linux and SSH. P17 builds a Python GPIO data logger. Both sit under Microcontrollers and computers and have no inline photos or YouTube links. P18 uses a Pi as an MQTT broker and dashboard host. The route needs a visible entry point and board photos. [P16](../tutorial/practice/p16-raspberry-pi-linux.html), [P17](../tutorial/practice/p17-pi-gpio-python.html), [P18](../tutorial/practice/p18-esp32-iot-mqtt.html)

## Site-wide changes

1. **Put search on every chapter.** Add a shared search field to the sidebar and make it reachable on mobile without scrolling the menu. Generate one compact index for titles, chapter IDs, headings, descriptions and lesson text. Return the chapter name, a matching excerpt and a link to the section when available. Account for terms learners actually type, such as `jack`, `bridge rectifier`, `BMS`, `Pi GPIO` and `USB C`. Include keyboard access, clear and empty states, and verify results from directly opened chapter URLs under `/ECE/`.
2. **Make the left menu a collapsed accordion.** Use expandable book and part headings. Open the current chapter’s book and part on entry and keep other sections closed by default. Remember learner choices across pages, preserve the active chapter and progress indicators, and test the same behaviour on mobile. Keep search results visible without expanding every book.
3. **Give Raspberry Pi its own starting point.** Add a named Raspberry Pi and Linux route on the hub and in the Practice menu. Sequence P16 setup → P17 GPIO and logging → P18 MQTT and dashboards → P30 reliability. Add a short photo guide to the Pi single-board computer, Pico microcontroller and ESP32, with links to the relevant first lab. Use the official Pi setup guide and its video as starting points. [Raspberry Pi getting started](https://www.raspberrypi.com/documentation/computers/getting-started.html)
4. **Make the foundation lead into real jobs.** On P00 and the hub, point each branch to a first practical exercise and an observable output. For example, use P06 → W02 for welding, P23 → P29 for building automation, P32 → P33 for laptop repair, P34 → P35 for phone repair, and P11 → P27 → P28 for embedded systems and robotics. Keep links from each practice step to the relevant theory and part identification.
5. **Add and verify media on every learner page.** Place a real photo near the first point where the learner needs to identify hardware. Add close-ups when they must read markings, choose a port or put probes on specific nodes. Show the outside, inside and board location when those views teach different things. Give each visual a model or part number where known, readable arrows, a caption and alt text. For abstract theory, use an actual part, instrument reading, waveform, sourced micrograph or field photo tied to the explanation. Keep hardware and the corresponding circuit symbol together.
6. **Use existing photos and videos.** Reuse the same credited photos across related lessons when the labels apply. Record the original URL, author, licence and any annotation changes, and link out to copyrighted material unless reuse is permitted. Place direct links to reviewed YouTube or manufacturer demonstrations next to the step they explain. Include topic, language and useful timestamps where available. Use photos and videos of qualified work for enclosed or hazardous equipment and use extra-low-voltage trainers for learner exercises. Use a published cross-section, X-ray or teardown for sealed parts. No generated photos or videos are needed.

## P06 and the welding rectifier pages

P06 should take a learner from recognising the object to interpreting its output. Add the following in lesson order.

1. **What you need.** Show the two ends of an actual axial diode and mark the cathode stripe. Show the top and pin side of an actual four-terminal bridge. Point arrows to both `~` AC inputs and the `+` and `−` DC outputs. Verify the layout against the exact part’s datasheet and place both the model number and datasheet next to the image. [Vishay GBPC bridge datasheet](https://www.vishay.com/docs/88612/gbpc12.pdf)
2. **What is inside.** Use a sourced cutaway or X-ray that shows the four diode elements. Label them against the four-diode schematic and show an equivalent bridge made from four loose diodes. A package diagram can support the explanation while a usable real interior image is being sourced.
3. **Where to find it.** Use a wide interior photo of a real power supply or welder and a close-up of the same bridge on the PCB or heatsink. Mark the bridge and nearby bulk capacitor. On W01 and T22, show a fast output rectifier separately and identify which stage each part serves.
4. **What to measure.** Photograph the leads on the low-voltage breadboard and show captured input AC, half-wave, full-wave and smoothed output. Add a direct link to an existing demonstration that shows the setup and scope traces. On W02, add meter-probe photos for the four internal junctions checked in both directions and show real example readings. Cross-link P06, W02, T22 and R03.

## Page-by-page improvements

Photo and YouTube counts are from the baseline scan, with the C17 row recorded when that chapter was added. The last column describes the media or exercise proposed for the lesson.

### Practice Book

#### Part A · Your bench

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P00 Your ECE foundation and learning routes](../tutorial/practice/p00-foundation-roadmap.html) | 0 | 0 | Show a real starter bench and finished outputs from the diode, Pi GPIO, BMS and repair labs. Give each foundation checkpoint a link to its first lab and the later jobs it supports. |
| [P01 Your bench: kit, budget and safety](../tutorial/practice/p01-bench-kit-safety.html) | 0 | 0 | Add a labelled starter bench with the DMM, probes, current-limited supply, cutters and eye protection, plus a close-up of a power supply’s current-limit controls. Link an existing beginner bench setup walkthrough. |
| [P02 Breadboard and your first LED circuit](../tutorial/practice/p02-breadboard-first-led.html) | 0 | 0 | Photograph the breadboard top and underside or removed backing, mark rail breaks and connected rows, then show the wired LED and resistor. Link a video tracing the circuit on a real breadboard. |
| [P03 Multimeter mastery](../tutorial/practice/p03-multimeter-mastery.html) | 1 | 1 | Keep the labelled DMM photo. Add probe placement photos and displayed readings for voltage, series current, continuity and diode mode, including the jack change when returning to voltage. Cross-link the relevant parts of the existing video. |
| [P04 Series, parallel and voltage dividers](../tutorial/practice/p04-series-parallel-dividers.html) | 0 | 0 | Show the same breadboard wired in series, parallel and as a divider. Label the nodes and both probe points, then compare the measured output with and without a load. |
| [P05 Soldering, crimping and wiring like a tradie](../tutorial/practice/p05-soldering-wiring.html) | 3 | 1 | Keep the existing photos and video. Add good, cold and bridged joints under magnification and side-by-side ferrule and crimp close-ups before and after compression. Link separate videos for soldering and making a crimp that passes a pull check. |

#### Part B · Components at work

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P06 Diodes on the bench: rectifiers and protection](../tutorial/practice/p06-diodes-rectifiers.html) | 0 | 0 | Show an axial diode, a four-diode breadboard bridge, a packaged bridge from both sides and a real bridge on a PCB or heatsink. Use the detailed request below for pins, internal construction, measurements and video. |
| [P07 Capacitors: timing, smoothing and decoupling](../tutorial/practice/p07-capacitors-rc.html) | 0 | 0 | Show an electrolytic stripe, a capacitor’s board footprint and a ceramic capacitor next to an IC supply pin. Add actual scope captures for RC charge and rectifier ripple before and after smoothing. |
| [P08 Transistors as switches: BJT, MOSFET, relays](../tutorial/practice/p08-transistor-switches.html) | 0 | 0 | Show a small BJT, a power MOSFET and an opened or clear-case relay. Label part-specific terminals and show where the flyback diode sits on the working relay circuit. Link a low-voltage switching demo. |
| [P09 The 555 timer: blinkers and PWM](../tutorial/practice/p09-555-timer.html) | 0 | 0 | Show the 555 package notch and pin 1, then the wired LED and PWM circuits. Label the timing capacitor and probe points and add a scope capture of duty-cycle adjustment. |
| [P10 Power supplies: regulators, buck converters, batteries](../tutorial/practice/p10-power-supplies.html) | 0 | 0 | Show the 7805, LM317 and a working buck module from both sides. Label input, output, grounds and the adjustment screw, and link a low-voltage demonstration that sets the output before connecting a load. |

#### Part C · Microcontrollers and computers

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P11 Arduino first steps](../tutorial/practice/p11-arduino-first-steps.html) | 0 | 0 | Add a labelled Arduino board and a photo of the connected USB cable and first LED setup. Show the IDE board, port and upload steps with screenshots and link the official first-program walkthrough. |
| [P12 Sensors and the ADC](../tutorial/practice/p12-sensors-adc.html) | 0 | 0 | Put each actual sensor beside its circuit photo. Label LDR divider connections, PIR controls and ultrasonic pins, and show real serial output at two known input conditions. |
| [P13 Actuators: motors, servos and relays](../tutorial/practice/p13-actuators-motors.html) | 0 | 0 | Photograph a motor, servo, stepper, TB6612FNG and ULN2003 boards. Label logic and motor power, common ground and connectors. Link a video showing one motor running and how to check its response. |
| [P14 Talking to devices: UART, I²C, SPI, RS-485 and Modbus](../tutorial/practice/p14-serial-buses-modbus.html) | 0 | 0 | Show the actual USB-to-serial adapter, sensor breakout and RS-485 terminals. Label Tx/Rx/GND and the adapter’s printed differential labels, and add captured UART and Modbus frames tied to the same demo. |
| [P18 ESP32 and IoT: Wi-Fi, MQTT and dashboards](../tutorial/practice/p18-esp32-iot-mqtt.html) | 0 | 0 | Show the ESP32 and sensor on the bench and the Pi broker beside them. Capture a publish, subscription and live Node-RED reading. Link an existing walkthrough that traces one message end to end. |

#### Part D · Networks and cabling on the bench

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P19 Networking hands-on: IP, subnets, switches, PoE, VLANs](../tutorial/practice/p19-networking-hands-on.html) | 0 | 0 | Annotate a real switch, PoE port and Ethernet cable path. Add a managed-switch VLAN screen and one lab with captured results for a working connection and a wrong VLAN. |
| [P20 Cat6 termination and testing](../tutorial/practice/p20-cat6-termination.html) | 0 | 0 | Photograph plug orientation, T568B conductors at a keystone, the punch-down tool and tester outputs for pass and crossed pair. Link a video showing both the keystone termination and the test. |

#### Part E · Working like a technician

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P21 Fault-finding: a technician's troubleshooting method](../tutorial/practice/p21-fault-finding.html) | 0 | 0 | Show the same training board before and after a planted open or short, with measured probe points and an actual meter display. Include a short worked fault demonstration and a record of the decisions it supports. |
| [P22 Reading drawings: schematics, wiring diagrams and as-builts](../tutorial/practice/p22-reading-drawings.html) | 0 | 0 | Pair a schematic, terminal strip photo and marked-up wiring drawing for one low-voltage assembly. Identify connector pins on the real board and show one marked-up change carried into the as-built drawing. |
| [P23 Build a DIN-rail control panel (12/24 V)](../tutorial/practice/p23-din-rail-panel-build.html) | 0 | 0 | Show a complete 12/24 V DIN-rail trainer, plus detail photos of ferrules, terminal numbering and labelled conductors. Link a verified demo of a de-energised assembly and ELV commissioning checks. |

#### Part F · Measurements and board craft

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P24 Predict a reading before touching the board](../tutorial/practice/p24-datasheets-measurement.html) | 0 | 0 | Show the TLV755P package or evaluation board, pin 1 and the nodes being measured. Pair a datasheet excerpt with the instrument’s actual readout, then explain a measured difference from the prediction. |
| [P25 Measure an RC filter on the oscilloscope](../tutorial/practice/p25-scope-filters.html) | 0 | 0 | Show the actual RC layout and probe points. Provide low-, near- and high-cutoff scope captures from the same setup and link a walkthrough for measuring gain and phase. |
| [P26 Surface-mount soldering and inspection](../tutorial/practice/p26-smd-rework.html) | 1 | 1 | Keep the inspection photo and video. Add before, during and after macros of a resistor and a fine-pitch joint, label bridges and lifted pads, and show what proper wetting looks like under magnification. |

#### Part G · Embedded systems, automation and RF

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P27 Program a timed controller that can stop](../tutorial/practice/p27-firmware-state-machine.html) | 0 | 0 | Show the physical start and stop inputs, board and safe load alongside a timestamped serial trace. Link a demo of the stop input being pressed in each state and during restart. |
| [P28 Build a two-sensor line-following robot](../tutorial/practice/p28-line-following-robot.html) | 0 | 0 | Photograph a finished line follower from above and below. Mark sensor orientation, motor wiring and battery connector, and link a clip showing calibration, a run and recovery when it loses the line. |
| [P29 Commission a simulated air handler](../tutorial/practice/p29-bms-commissioning-lab.html) | 0 | 0 | Show the tabletop AHU simulator with all inputs and outputs labelled. Pair the bench photo with a point list and trend capture that shows normal startup and an interlock preventing the fan command. |
| [P30 Make an IoT sensor show stale data clearly](../tutorial/practice/p30-iot-reliability.html) | 0 | 0 | Show the ESP32 sensor, Pi broker and the live dashboard for normal updates, stale data and recovery. Link a clip showing an induced disconnect, the timeout and the next valid update. |
| [P31 Build and compare an indoor receive antenna](../tutorial/practice/p31-antenna-receive-lab.html) | 0 | 0 | Show the built receive antenna laid next to a ruler and a close-up of the SDR and coax connectors. Add matched waterfall captures for two orientations under comparable conditions and link a receive-only walkthrough. |

#### Part H · Laptop and phone repair

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [P32 Laptop repair from intake to module replacement](../tutorial/practice/p32-laptop-service.html) | 1 | 0 | Keep the existing interior photo. Add a model-specific sequence from case screws and battery connector to SSD, RAM and fan. Include a connector-latch macro and link the same model’s service guide or video. |
| [P33 Laptop board diagnosis and power rails](../tutorial/practice/p33-laptop-power-diagnostics.html) | 0 | 0 | Put a real labelled motherboard beside its rail diagram. Identify the input jack, protection MOSFETs, standby coils and safe test pads. Add a worked no-power case with a table of documented readings. |
| [P34 Phone repair, module replacement and final tests](../tutorial/practice/p34-phone-module-service.html) | 1 | 0 | Keep the pentalobe photo. Add a model-specific photo sequence showing the opening edge, battery connector, display flex and retaining plates. Link a teardown video for that model and show the final functional test screen. |
| [P35 Phone charging faults and board-level triage](../tutorial/practice/p35-phone-board-triage.html) | 0 | 0 | Show a daughterboard, interconnect flex, USB-C receptacle and inline USB meter. Label the pictured probe points and add one walkthrough that distinguishes a bad cable or port from a board fault. |

### Theory Book

#### Part 1 · Electricity from the ground up

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T00 Maths toolkit: the school maths electronics uses](../tutorial/theory/t00-maths-toolkit.html) | 0 | 0 | Put actual resistor markings and DMM readings next to the unit conversions and significant figures. Use one real datasheet plot to teach axis scales and how to read a point. |
| [T01 Charge, current and voltage](../tutorial/theory/t01-charge-current-voltage.html) | 0 | 0 | Show a battery, switch and lamp circuit. Label two voltage probe points and where the meter goes for current. Link a demonstration that measures both across one working circuit. |
| [T02 Resistance and Ohm's law, physically](../tutorial/theory/t02-resistance-ohms-law.html) | 0 | 0 | Show a strip of resistors with visible bands and a real resistance reading. Add a photo sequence that compares the same part measured in circuit and with one leg lifted. |
| [T03 Power, energy and heat](../tutorial/theory/t03-power-energy-heat.html) | 0 | 0 | Pair a power resistor photo with a thermal image and the measured voltage and current under two loads. Annotate the visible hot spot and explain how it relates to power dissipation. |
| [T04 Circuit laws: Kirchhoff, Thevenin and superposition](../tutorial/theory/t04-circuit-laws.html) | 0 | 0 | Label nodes and loops on an actual breadboard and match them to its schematic. Show meter readings for the original circuit and its Thevenin equivalent driving the same load. |
| [T05 Electric fields and capacitors](../tutorial/theory/t05-capacitors-fields.html) | 0 | 0 | Compare a real film, ceramic and electrolytic capacitor with a manufacturer cross-section. Include an RC charge capture and point to P07 for the measured lab. |

#### Part 2 · Magnetism and AC

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T06 Magnetism and inductors](../tutorial/theory/t06-magnetism-inductors.html) | 0 | 0 | Show an air-core coil, ferrite inductor and a characterised power choke on a PCB. Label winding and core and include a real current or switching transient capture linked to P08. |
| [T07 AC: sine waves, RMS, phase and impedance](../tutorial/theory/t07-ac-fundamentals.html) | 0 | 0 | Use actual scope captures of a low-voltage sine wave and an RC phase shift, with probe locations visible. Pair the RMS calculation with that same signal’s meter readout. |
| [T08 Transformers](../tutorial/theory/t08-transformers.html) | 0 | 0 | Photograph a laminated transformer and a ferrite transformer with their marked windings. Use a sourced construction cutaway and link a low-voltage turns-ratio demonstration. |
| [T09 Mains, three-phase, earthing and RCDs (Australia)](../tutorial/theory/t09-mains-earthing-safety.html) | 0 | 0 | Show a real Australian switchboard photo with protective devices and markings identified by a qualified source. Link a regulator or manufacturer overview of earthing and RCDs and date-check the Australian references. |
| [T10 Electromagnetic waves, antennas and optical fibre](../tutorial/theory/t10-em-waves-antennas-fibre.html) | 0 | 0 | Show an antenna element and feed point, a coax cross-section and a real fibre termination. Use a scope, SDR or link test capture to tie the pictures to a measured signal. |

#### Part 3 · Semiconductors and active devices

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T11 Semiconductors and the diode family](../tutorial/theory/t11-semiconductors-diodes.html) | 0 | 0 | Add loose and PCB-mounted diode photos covering axial, SMD, LED and Zener packages. Match their markings to symbols and datasheets, then link a real DMM diode-test demonstration. |
| [T11+ Deep dive: why a diode has polarity (our earlier session)](../tutorial/theory/pn-junction-deep-dive.html) | 0 | 0 | Pair the junction diagrams with a credited diode die micrograph or manufacturer cross-section and an actual measured I–V curve. Link back to the parts and polarity photos in T11 and P06. |
| [T12 How a bipolar transistor really works](../tutorial/theory/t12-bjt-physics.html) | 0 | 0 | Photograph a TO-92 BJT and a board-mounted equivalent, with pins labelled from the exact datasheet. Add a measured low-voltage switching trace and link to the P08 circuit. |
| [T13 How a MOSFET works](../tutorial/theory/t13-mosfet-physics.html) | 0 | 0 | Show a power MOSFET next to its datasheet pinout and a marked board footprint. Add a measured low-voltage gate and drain capture and show the package-specific body-diode test. |
| [T14 Op-amps: the golden rules](../tutorial/theory/t14-op-amps.html) | 0 | 0 | Label pin 1, input, output and supply pins on a real op-amp and its breakout. Include scope captures of normal gain and clipping from the same circuit. |

#### Part 4 · Digital, computers and signals

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T15 Digital logic and how a microcontroller works](../tutorial/theory/t15-digital-logic-microcontrollers.html) | 0 | 0 | Compare a logic IC and a microcontroller package on real boards, label power and I/O, and add a captured button-to-GPIO transition with the matching firmware. |
| [T16 Signals: sampling, decibels, noise and 4–20 mA loops](../tutorial/theory/t16-signals-noise-loops.html) | 0 | 0 | Show a twisted pair, an actual 4–20 mA transmitter and a labelled isolated bench loop. Pair a loop reading with a real before-and-after noise capture and sample-rate example. |

#### Part 5 · Systems theory for the field

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T17 How networks really work: Ethernet, IP, TCP/UDP](../tutorial/theory/t17-networking-theory.html) | 0 | 0 | Show a real switch, NIC and router with the test path labelled. Use a redacted packet capture from that bench to point out Ethernet, IP and TCP/UDP fields. |
| [T18 Sensor physics: how sensors turn the world into signals](../tutorial/theory/t18-sensor-physics.html) | 0 | 0 | Photograph the sensing element and wiring for a thermistor, Hall device and pressure sensor. Pair each with an actual calibration reading and link to the relevant hands-on setup. |
| [T19 Motors and variable speed drives](../tutorial/theory/t19-motors-vsds.html) | 0 | 0 | Use a real induction-motor nameplate and sourced VSD enclosure photo with terminals identified. Link a qualified-source explanation of the drive stages and show a low-voltage trainer waveform. |

#### Part 6 · Power electronics for repair

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T20 IGBTs: a MOS gate controlling bipolar conduction](../tutorial/theory/t20-igbt-physics.html) | 0 | 0 | Show a discrete IGBT and a power module with gate, collector and emitter identified from the actual datasheet. Include a measured low-voltage switching capture or a clearly credited manufacturer trace. |
| [T21 Switching converters, gate drivers and feedback](../tutorial/theory/t21-switching-converters-control.html) | 0 | 0 | Map switch, inductor, controller and feedback divider on an actual low-voltage converter PCB. Label probe points and pair two scope captures with the relevant stages from the diagram. |
| [T22 Power rectifiers: reverse recovery and real ratings](../tutorial/theory/t22-power-rectifiers-recovery.html) | 0 | 0 | Compare a packaged mains bridge with a fast secondary rectifier mounted on a real heatsink. Add a manufacturer recovery waveform annotated with time and current, and tie the exact ratings to the photographed part. |
| [T23 Capacitor ageing, heat and failure chains](../tutorial/theory/t23-capacitor-thermal-failure.html) | 0 | 0 | Show real electrolytic vent and sleeve markings, a heat-affected board and a visibly failed part. Include a measured ESR or capacitance comparison that also demonstrates a fault with no obvious visual cue. |

#### Part 7 · Measuring and repairing boards

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T24 Measurement loading, tolerance and datasheets](../tutorial/theory/t24-measurement-datasheets.html) | 0 | 0 | Photograph the probe and its attenuation switch, then show a high-impedance test point. Compare two measured readouts from the same circuit so loading can be seen directly. |
| [T25 Filters, frequency response and resonance](../tutorial/theory/t25-filters-resonance.html) | 0 | 0 | Show actual RC and LC filters on boards, label parts and probe points, and add a measured frequency sweep with cutoff and resonance identified. |
| [T26 PCB construction, solder joints and ESD](../tutorial/theory/t26-pcb-rework-esd.html) | 0 | 0 | Add real PCB layer or via cross-sections and microscope photos of good pads, lifted pads and damaged traces. Link a published ESD and rework demonstration. |
| [T27 Board power rails, enables and startup sequencing](../tutorial/theory/t27-board-power-sequencing.html) | 0 | 0 | Show a labelled laptop or embedded power board with regulator, enable and power-good pins. Add a real or manufacturer-provided timing capture tied to those nodes. |
| [T28 Lithium-ion cells, charging and protection](../tutorial/theory/t28-lithium-batteries.html) | 0 | 0 | Compare pouch and cylindrical cells and a protection PCB in credited photos. Label connector and safety markings and link an existing vendor video on identifying damage and safe handling. |
| [T29 USB-C attachment, power delivery and diagnosis](../tutorial/theory/t29-usb-c-power-delivery.html) | 0 | 0 | Photograph plug, receptacle, inline meter and an open charger or sink board from a published teardown. Label CC/VBUS reference points and show a captured fixed-voltage PD request and response. |

#### Part 8 · Embedded control and radio

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [T30 Firmware timing, state machines and recovery](../tutorial/theory/t30-embedded-timing-states.html) | 0 | 0 | Pair a real controller and its physical input with captured switch bounce, debounce and reset timestamps. Link to the P27 exercise so the sequence can be repeated. |
| [T31 Feedback, interlocks and control loops](../tutorial/theory/t31-feedback-control.html) | 0 | 0 | Show a real sensor-actuator trainer and its limit switch. Add a genuine setpoint and response trend, plus a hard interlock trip captured on the same rig. |
| [T32 RF transmission lines, antenna matching and link budget](../tutorial/theory/t32-rf-transmission-lines.html) | 0 | 0 | Show coax with exposed layers, an SMA connection and a real antenna feed point. Include a labelled VNA trace from a matched and mismatched load, with the calibration plane stated. |

### Welding Repair Track

#### Part A · Start and understand

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [W00 Welding-set repair: your learning and shop plan](../tutorial/welding/w00-start-here.html) | 0 | 0 | Add photos of actual stick, MIG and TIG machines with front connectors labelled. Show the safe training bench and link to the repair order, first rectifier lab and return-to-service checklist. |
| [W01 Identify the machine, map the stages, prepare the bench](../tutorial/welding/w01-machine-map-safety.html) | 2 | 2 | Keep the current machine and transformer interior photos. Add matched front, back and interior photos of one identified inverter welder, plus PCB close-ups mapping the input bridge, DC bus, switches, transformer and output rectifiers. |
| [W02 Rectifier testing: the first repair skill](../tutorial/welding/w02-rectifier-bench-lab.html) | 0 | 0 | Photograph the loose bridge, markings, heatsink mount and its PCB location. Add lead-on-terminal close-ups or a short low-voltage demo tied to the eight expected diode-mode readings and a table for good, open and shorted examples. |

#### Part B · Diagnose and repair

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [W03 Unpowered diagnosis: inspect, isolate, measure](../tutorial/welding/w03-unpowered-diagnosis.html) | 0 | 0 | Show PCB photos of a blown fuse, damaged connector, cracked joint and visibly healthy comparison. Label the unpowered test points and pair each symptom with the expected and actual readings from a training case. |
| [W04 MOSFETs, IGBTs and the gate-driver neighbourhood](../tutorial/welding/w04-switches-drivers.html) | 0 | 0 | Photograph a power device, isolation pad, driver IC and gate resistor on a board. Show that same part’s legs and part number, then link a low-voltage bench driver demo with a measured gate trace. |
| [W05 Worked faults: dead, tripping, weak and overheating](../tutorial/welding/w05-fault-cases.html) | 0 | 0 | Give each fault case a real model and matching board or parts photo when available, with probe locations, readings and outcome. Mark illustrative cases explicitly and link to real repair walkthroughs with matching symptoms. |

#### Part C · Complete the job

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [W06 Parts, first power-up and return to service](../tutorial/welding/w06-repair-return-to-service.html) | 0 | 0 | Add manufacturer-sourced images of the correct mount, insulation pad and connector routing. Show a completed example inspection record and link a qualified-source return-to-service demonstration for the relevant machine class. |
| [W07 Video tutorials, service manuals and a study workbook](../tutorial/welding/w07-tutorials-manuals.html) | 0 | 2 | Locate the video and manual examples with a still or permitted photo of each machine model when possible. Check playback, model, language, chapter relevance and timestamps, and link individual resources beside the lesson steps they explain. |

### Australia Job Track

#### Part 0 · The market

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [C00 What Australian job ads actually ask for](../tutorial/career/c00-what-job-ads-ask-for.html) | 0 | 0 | Show a redacted screenshot from the historical job-ad sample beside a traceable count table. Flag its sample date, then map a requirement from each job family to portfolio evidence and the corresponding chapter. |

#### Part I · Building services

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [C01 BMS fundamentals: what a building management system does](../tutorial/career/c01-bms-fundamentals.html) | 1 | 0 | Keep the controller photo. Add real panel, room sensor, actuator and relay close-ups, then map one point from the device terminal to the supervisor screen with a trend or alarm screenshot. |
| [C02 BMS protocols and commissioning: BACnet, Modbus, Niagara](../tutorial/career/c02-bms-protocols-commissioning.html) | 0 | 0 | Show wired 485 terminals and a BACnet/IP controller, then capture point discovery and read/write checks in a real trainer. Link a vendor training video that demonstrates the same checks. |
| [C03 HVAC for electronics people](../tutorial/career/c03-hvac-for-technicians.html) | 0 | 0 | Include an actual AHU and VAV box with filter, damper, actuator and sensor locations labelled. Pair the photo with a trend snapshot and a walkthrough of how one airflow command reaches the actuator. |
| [C17 BMS fieldwork: diagnose and commission a damper](../tutorial/career/c17-bms-fieldwork.html) | 3 | 3 | Show the installation work before commissioning, including the device mount, intended cable route and identification at handover. Compare the commanded value, feedback and shaft position on the same installed device. |
| [C04 Fire detection and EWIS basics](../tutorial/career/c04-fire-detection-ewis.html) | 0 | 0 | Use identified photos of a panel, detector bases, manual call point and isolator module. Link a vendor training demo of indications and acknowledge controls on a training panel. |

#### Part II · Security systems

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [C05 CCTV and IP camera installation](../tutorial/career/c05-cctv-ip-cameras.html) | 0 | 0 | Show actual dome and turret cameras, PoE connection and a finished weatherproof cable entry. Pair day and night test captures from the same location with an installation video. |
| [C06 Access control and intruder alarms](../tutorial/career/c06-access-control-alarms.html) | 0 | 0 | Photograph a training door’s reader, reed contact, lock and request-to-exit hardware from both sides. Map wires to the actual controller terminals and show the resulting event log. |
| [C14 Security platforms: how Gallagher, Genetec, Integriti and Milestone think](../tutorial/career/c14-security-platforms.html) | 0 | 0 | Add vendor-approved screens or training screenshots for the four platforms, each showing a comparable operator task. Link an official overview and identify which parts of the workflow transfer between products. |

#### Part III · Telecommunications

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [C07 Telecom cabling in Australia: ACMA rules and structured cabling](../tutorial/career/c07-telecom-cabling-acma.html) | 0 | 0 | Show a real patch bay, punch-down tool and marked cable ends. Add a sanitised certification result and link directly to the regulator’s registration guidance and the practical P20 lab. |
| [C08 The NBN and access networks](../tutorial/career/c08-nbn-technologies.html) | 0 | 0 | Show representative NBN equipment and cable entry points with model labels sourced from NBN. Match pictures to access types and link the operator’s consumer equipment guide for each type. |
| [C09 Fibre optics in the field: splicing, connectors and OTDR](../tutorial/career/c09-fibre-splicing-otdr.html) | 0 | 0 | Show an actual fusion splicer, cleaned connector end face and splice tray. Add a labelled OTDR trace with a connector and splice event, and link an existing vendor demo. |

#### Part IV · Industrial and the path in

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [C10 PLCs and industrial instrumentation](../tutorial/career/c10-plc-instrumentation.html) | 0 | 0 | Label the real PLC input and output terminals and a 4–20 mA transmitter on a trainer. Pair the photo with an online ladder view and current measurement during one input change. |
| [C15 Solar, batteries and EV chargers for technicians](../tutorial/career/c15-solar-batteries.html) | 0 | 0 | Show identified inverter, battery and EV charger enclosures with their external labels and connections from manufacturer sources. Link a vendor system overview and date-check the Australian training and authorisation references. |
| [C11 Licences, tickets and pathways in Australia](../tutorial/career/c11-licences-pathways.html) | 0 | 0 | Use a redacted sample credential or official register screen. Add job requirement examples by state or territory with dates and direct regulator links, and distinguish the registrations relevant to each career route. |
| [C12 Portfolio projects, interviews and a 12-week plan](../tutorial/career/c12-portfolio-study-plan.html) | 0 | 0 | Show anonymised sample portfolio evidence such as a wired panel, scope screen and completed test sheet. Link a finished example and state the expected output for each study week. |
| [C13 Your first day on an Australian site](../tutorial/career/c13-first-day-on-site.html) | 0 | 0 | Show site induction and labelling examples with permissions and no site identifiers. Include a redacted handover form and a photo of the labelled tools and equipment a first-day technician should recognise. |
| [C16 Build a repair portfolio and a shop workflow](../tutorial/career/c16-repair-work-portfolio.html) | 0 | 0 | Show anonymised before-and-after photos of a welder, laptop and phone job, with the matching test record, model and fault outcome. Add a redacted example shop record that preserves the evidence an employer would ask for. |

### Reference Shelf

| Page | Photos | YouTube links | What to improve |
| --- | ---: | ---: | --- |
| [R01 Glossary: every term in plain English](../tutorial/reference/r01-glossary.html) | 0 | 0 | Add real thumbnails and links to the source chapters for terms easily confused in hardware, such as terminal, jack, header, ferrule and rectifier. Expand aliases for search. |
| [R02 Formula sheet with worked numbers](../tutorial/reference/r02-formula-sheet.html) | 0 | 0 | Pair each formula family with a real meter, waveform or instrument screenshot that matches one worked example. Link to the lab where the values can be reproduced. |
| [R03 Schematic symbols and part identification](../tutorial/reference/r03-symbols-parts.html) | 0 | 0 | Put a real loose part beside its symbol and a PCB-mounted example. Label bodies, polarity, pin 1, pads and silkscreen, with a larger image on tap and a link to the matched theory or test. |
| [R04 Welding repair job sheet](../tutorial/reference/r04-welding-job-sheet.html) | 0 | 0 | Add an annotated, fictional completed job sheet with real example machine and test-point photos, and a printable blank. Verify the print layout and show where the evidence for each field goes. |

## Other HTML pages

| Page | What to improve |
| --- | --- |
| [Site root](../index.html) | Check that the GitHub Pages redirect works under `/ECE/`, including the visible fallback link for browsers where the redirect is blocked. |
| [Course hub](../tutorial/index.html) | Give the Raspberry Pi, repair and building automation routes named entry points. Use real examples of a starter bench, a Pi and a training panel to show what each route leads to. Use the same search control and menu as the chapters. |
| [Lesson template](../tutorial/_template.html) | Add a reusable figure with caption and source credit, a place to link a relevant video beside the step, and a practice-to-theory link. Check that authoring placeholders stay out of the public search index. |
| [Standalone semiconductor lesson](../semiconductor-explained.html) | Link clearly to the Theory Book version and the real diode photos in T11 and P06. Preserve the existing direct section links if the standalone page is later consolidated into the book. |

## Order of work and completion checks

1. Implement shared search and the accordion once for every page. Verify desktop and mobile by opening a deep link, finding a lesson, expanding a different book, changing chapter and returning.
2. Add the shared photo format and the first complete examples in P06, W01/W02 and P16/P17. Use those examples to set the standard for captions, terminal arrows, close-ups and video placement.
3. Work through the foundation and the welding, BMS, laptop and phone paths. Then complete the remaining theory, field work, embedded, RF and reference pages using the tables above.
4. Check each chapter at its live URL after deployment. Open the images on a phone, check that labels remain legible in light and dark themes, play each recommended video, and follow the practice-to-theory links. Verify each media item’s attribution and that its identifiers match the caption, pinout and lab. Use the chapter rows to track completion.
