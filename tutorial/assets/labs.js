const plc = document.querySelector("[data-plc-trainer]");
if (plc) {
  const stop = plc.querySelector("[name=stop-ok]");
  const guard = plc.querySelector("[name=guard-ok]");
  const proof = plc.querySelector("[name=run-proof]");
  const command = plc.querySelector("[data-command]");
  const timeout = plc.querySelector("[data-timeout]");
  const elapsedDisplay = plc.querySelector("[data-elapsed]");
  const status = plc.querySelector("[data-status]");
  let running = false;
  let fault = false;
  let elapsed = 0;

  function permissivesReady() {
    return stop.checked && guard.checked;
  }

  function render(message) {
    command.textContent = running ? "On" : "Off";
    timeout.textContent = fault ? "Latched" : "Clear";
    elapsedDisplay.textContent = elapsed + " s";
    status.textContent = message;
  }

  plc.addEventListener("change", () => {
    if (!permissivesReady()) {
      running = false;
      if (!fault) elapsed = 0;
      render("A permissive is missing. The run command is off.");
      return;
    }
    if (running && proof.checked) elapsed = 0;
    render(running ? "Inputs updated. Check the proof switch before advancing time." : "Inputs updated. A new Start request is needed to run.");
  });

  plc.querySelector("[data-start]").addEventListener("click", () => {
    if (!permissivesReady() || fault) {
      render("Start rejected. Check the permissives and any latched fault.");
      return;
    }
    running = true;
    render(proof.checked ? "Run command on. Proof is present." : "Run command on. Waiting for proof.");
  });

  plc.querySelector("[data-tick]").addEventListener("click", () => {
    if (!running) {
      render("The proof timer starts when the run command is on.");
      return;
    }
    if (proof.checked) {
      elapsed = 0;
      render("Proof is present. The timer is clear.");
      return;
    }
    elapsed += 1;
    if (elapsed === 3) {
      fault = true;
      running = false;
      render("Proof timed out. The command is off and the fault is latched.");
      return;
    }
    render("Still waiting for proof.");
  });

  plc.querySelector("[data-reset]").addEventListener("click", () => {
    if (running || !permissivesReady()) {
      render("Reset requires the run command off and both permissives true.");
      return;
    }
    elapsed = 0;
    fault = false;
    render("Fault cleared. The command stays off until a new Start request.");
  });
}

const arm = document.querySelector("[data-arm-trainer]");
if (arm) {
  const first = arm.querySelector("[name=shoulder]");
  const second = arm.querySelector("[name=elbow]");
  const firstAngle = arm.querySelector("[data-shoulder-angle]");
  const secondAngle = arm.querySelector("[data-elbow-angle]");
  const position = arm.querySelector("[data-arm-position]");
  const links = arm.querySelector("[data-links]");
  const tip = arm.querySelector("[data-tip]");
  const radians = Math.PI / 180;
  const origin = 220;

  function distanceReading(value) {
    return (Math.round(value * 10) / 10).toFixed(1);
  }

  function drawArm() {
    const angle1 = first.valueAsNumber * radians;
    const angle2 = angle1 + second.valueAsNumber * radians;
    const jointX = 120 * Math.cos(angle1);
    const jointY = 120 * Math.sin(angle1);
    const tipX = jointX + 80 * Math.cos(angle2);
    const tipY = jointY + 80 * Math.sin(angle2);
    firstAngle.textContent = first.value + "°";
    secondAngle.textContent = second.value + "°";
    position.textContent = "x " + distanceReading(tipX) + " mm, y " + distanceReading(tipY) + " mm";
    const drawX = origin + tipX;
    const drawY = origin - tipY;
    links.setAttribute("points", origin + "," + origin + " " + (origin + jointX) + "," + (origin - jointY) + " " + drawX + "," + drawY);
    tip.setAttribute("cx", drawX);
    tip.setAttribute("cy", drawY);
  }

  arm.addEventListener("input", drawArm);
  drawArm();
}

const stereo = document.querySelector("[data-depth-trainer]");
if (stereo) {
  const disparity = stereo.querySelector("[name=disparity]");
  const distance = stereo.querySelector("[data-distance]");
  const nextPixel = stereo.querySelector("[data-next-pixel]");

  function measureDepth() {
    const pixels = disparity.valueAsNumber;
    if (!disparity.validity.valid || !(pixels > 0)) {
      distance.textContent = "No valid depth";
      nextPixel.textContent = "—";
      return;
    }
    distance.textContent = (45000 / pixels).toFixed(1) + " mm";
    nextPixel.textContent = (45000 / (pixels + 1)).toFixed(1) + " mm";
  }

  disparity.addEventListener("input", measureDepth);
  measureDepth();
}

function findDarkRegions(mask, width, height, minimumArea) {
  const seen = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  const regions = [];
  let tail = 0;

  function visit(index) {
    if (!mask[index] || seen[index]) return;
    seen[index] = 1;
    queue[tail++] = index;
  }

  for (let index = 0; index < mask.length; index++) {
    if (!mask[index] || seen[index]) continue;
    tail = 0;
    visit(index);
    let left = width;
    let right = 0;
    let touchesBorder = false;
    for (let head = 0; head < tail; head++) {
      const pixel = queue[head];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      touchesBorder ||= x === 0 || x === width - 1 || y === 0 || y === height - 1;
      if (x > 0) visit(pixel - 1);
      if (x < width - 1) visit(pixel + 1);
      if (y > 0) visit(pixel - width);
      if (y < height - 1) visit(pixel + width);
    }
    if (tail >= minimumArea) regions.push({ width: right - left + 1, touchesBorder });
  }
  return regions;
}

const vision = document.querySelector("[data-vision-trainer]");
if (vision) {
  const fileInput = vision.querySelector("[type=file]");
  const scale = vision.querySelector("[name=sample-scale]");
  const threshold = vision.querySelector("[name=threshold]");
  const cutoff = vision.querySelector("[data-threshold-value]");
  const canvas = vision.querySelector("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const result = vision.querySelector("[data-vision-result]");
  let source = null;
  let resizeRatio = 1;
  let selection = 0;

  function inspectImage() {
    cutoff.textContent = threshold.value;
    if (!source) return;
    const mask = new Uint8Array(canvas.width * canvas.height);
    const output = context.createImageData(canvas.width, canvas.height);
    for (let pixel = 0; pixel < mask.length; pixel++) {
      const i = pixel * 4;
      const luminance = .2126 * source.data[i] + .7152 * source.data[i + 1] + .0722 * source.data[i + 2];
      mask[pixel] = luminance < threshold.valueAsNumber ? 1 : 0;
      output.data[i] = output.data[i + 1] = output.data[i + 2] = mask[pixel] * 255;
      output.data[i + 3] = 255;
    }
    context.putImageData(output, 0, 0);

    if (!scale.validity.valid) {
      result.textContent = "Enter a positive pixel scale to measure the width.";
      return;
    }
    const regions = findDarkRegions(mask, canvas.width, canvas.height, 30);
    if (regions.length !== 1 || regions[0].touchesBorder) {
      result.textContent = "Review. The image needs one complete silhouette with space around it.";
      return;
    }
    const width = regions[0].width / (resizeRatio * scale.valueAsNumber);
    const decision = width >= 15.5 && width <= 16.5 ? "Within training limits" : "Outside training limits";
    result.textContent = decision + ". Measured width " + width.toFixed(1) + " mm.";
  }

  fileInput.addEventListener("change", async () => {
    const current = ++selection;
    const file = fileInput.files[0];
    source = null;
    canvas.hidden = true;
    result.textContent = file ? "Reading the selected image…" : "Choose a photo to see its mask and test the width.";
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (current !== selection) return;
      const shrink = Math.min(1, 480 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * shrink));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * shrink));
      resizeRatio = canvas.width / image.naturalWidth;
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      source = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.hidden = false;
      inspectImage();
    } catch {
      if (current === selection) result.textContent = "This file could not be read as an image. Try a JPG or PNG.";
    } finally {
      URL.revokeObjectURL(url);
    }
  });
  threshold.addEventListener("input", inspectImage);
  scale.addEventListener("input", inspectImage);
}
