let fontRegular;
let fontItalic;

let vid = null;
let detector;
let detections = [];

let capture;
let handPose;
let hands = [];

let displayW = 720;
let displayH = 480;

let isVideoFinished = false;

let font;
let letters = [];
let interactionDist = 100;
let previousFinger = null;

let prevPinchDist = null;
let prevGraspDist = null;
let prevHandSize = null;
let prevFlipState = null;
let completionStartTime = null;

const modeInstructions = {
  zoom: "Zoom in slowly. (Pinch)",
  hold: "Slowly clench your fist. (Grasp)",
  farAway: "Slowly move your hand away from the screen. (Move Away)",
  close: "Slowly bring your hand closer to the screen.  (Move Closer)",
  flip: "Slowly turn your hand over. (Flip)",
  write: "Slowly move your index finger. (Move Finger)",
};

let currentSceneIdx = 0;
let scenes = [];

function preload() {
  detector = ml5.objectDetection("cocossd");
  handPose = ml5.handPose();
  fontRegular = loadFont("assets/Sanchezregular.otf");
  fontItalic = loadFont("assets/Sanchezregular-ita.otf");
  fontAurora = loadFont("assets/Aurora.otf");
  fontJuni = loadFont("assets/JunigardenSerif.otf");
  fontEmp = loadFont("assets/AmericanCaptain.otf");
}

function setup() {
  createCanvas(720, 480);

  capture = createCapture(VIDEO, { flipped: true });
  capture.hide();

  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont(fontRegular);

  scenes = [
    {
      videoPath: null,
      text: `SLOWLY \nFIRST`,
      mode: "write",
      fontSize: 20,
      font: fontAurora,
      highlights: [
        { word: "SLOWLY", size: 24 },
        { word: "FIRST", size: 24 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-1.mp4",
      text: `“ Oh Harold, \nIt would just break my heart \nif you failed ——— ”`,
      mode: "hold",
      fontSize: 28,
      lineHeight: 50 * 1.5,
      yOffset: 10,
      font: fontAurora,
      highlights: [
        { word: "Oh", size: 50 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
        { word: `,`, size: 50 },
        { word: "Harold", size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-2.mp4",
      text: `After a few months_ \n“ Limpy Bill, “ the Boy’s pal. \nOne pocketbook between them \n— usually empty —`,
      mode: "farAway",
      fontSize: 28,
      lineHeight: 28 * 1.6,
      font: fontJuni,
    },
    {
      videoPath: "assets/SafetyLast-3.mp4",
      text: `“ Oh, Pal — She’s just \ngot to believe that I’m \nsuccessful — until I am. ”`,
      mode: "close",
      fontSize: 28,
      font: fontItalic,
      highlights: [
        { word: "Oh", size: 50 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
        { word: `,`, size: 50 },
        { word: "Pal", size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-4.mp4",
      text: `There were certain days \nof the week when she could \nbe sure of a letter from him.`,
      mode: "write",
      fontSize: 40,
      font: fontJuni,
      highlights: [{ word: "T", size: 70 }],
    },
    {
      videoPath: "assets/SafetyLast-5.mp4",
      text: `The Boy was always \nearly — He couldn’t have \ncared more for his job if \nit had been a position —`,
      mode: "flip",
      fontSize: 40,
      font: fontJuni,
      highlights: [{ word: "T", size: 80 }],
    },
    {
      videoPath: "assets/SafetyLast-6.mp4",
      text: `The most wonderful \ncity The Girl has ever \nseen — expect Great Bend.`,
      mode: "close",
      fontSize: 40,
      font: fontJuni,
      highlights: [{ word: "T", size: 80 }],
    },
    {
      videoPath: "assets/SafetyLast-7.mp4",
      text: `“ But Harold, I DID \nwant to see your office. ”`,
      mode: "hold",
      fontSize: 28,
      font: fontAurora,
      highlights: [
        { word: "DID", size: 40 },
        { word: `“`, size: 40 },
        { word: `”`, size: 40 },
        { word: `,`, size: 40 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-8.mp4",
      text: `“ STUBBS`,
      mode: "zoom",
      fontSize: 100,
      font: fontEmp,
    },
    {
      videoPath: "assets/SafetyLast-9.mp4",
      text: `——— I don’t wish to be annoyed by \nany more of your petty complaints \nabout personal appearance ———`,
      mode: "write",
      fontSize: 28,
      lineHeight: 35,
      font: fontEmp,
    },
    {
      videoPath: "assets/SafetyLast-10.mp4",
      text: `That will be all ”`,
      mode: "write",
      fontSize: 28,
      lineHeight: 35,
      font: fontEmp,
    },
    {
      videoPath: "assets/SafetyLast-11.mp4",
      text: `“ And just think — You’ve \nmade money enough already \nfor our little home. ”`,
      mode: "close",
      fontSize: 30,
      font: fontAurora,
      highlights: [
        { word: "A", size: 50 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-12.mp4",
      text: `“ Will you give me a thousand \ndollars, sir - if - if I can \ndraw hundreds of people \nto our store? ”`,
      mode: "hold",
      fontSize: 30,
      font: fontJuni,
      highlights: [
        { word: "W", size: 50 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-13.mp4",
      text: `“ Come on. Just this one floor, \nand you’ll be through. ”`,
      mode: "flip",
      fontSize: 25,
      font: fontItalic,
      highlights: [
        { word: "C", size: 50 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
        { word: `,`, size: 50 },
        { word: `.`, size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-14.mp4",
      text: `“ Great ! You got the right idea, \nkid. That’s the best one \nyou’ve pulled yet. ”`,
      mode: "hold",
      fontSize: 28,
      font: fontItalic,
      highlights: [
        { word: "G", size: 40 },
        { word: `“`, size: 30 },
        { word: `”`, size: 30 },
        { word: `,`, size: 30 },
        { word: "Pal", size: 30 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-15.mp4",
      text: `“ Get out of here ! \nDon’t you know \nthe dog might fall ? ”`,
      mode: "hold",
      fontSize: 35,
      font: fontEmp,
      highlights: [
        { word: "Get out of here !", size: 60 },
        { word: `“`, size: 50 },
        { word: `”`, size: 50 },
        { word: `,`, size: 50 },
      ],
    },
    {
      videoPath: "assets/SafetyLast-16.mp4",
      text: `“ I’ll be right back … Soon as I ditch the cop. ”`,
      mode: "farAway",
      fontSize: 28,
      lineHeight: 35,
      font: fontItalic,
    },
    {
      videoPath: "assets/SafetyLast-17.mp4",
      text: `The end`,
      mode: "write",
      fontSize: 40,
      yOffset: 0,
      font: fontRegular,
    },
  ];

  loadSceneVideo(currentSceneIdx);
}

function mousePressed() {
  if (!scenes || scenes.length === 0) return;

  if (isVideoFinished === false) {
    if (vid) vid.stop();
    videoDone();
  } else {
    goToNextScene();
  }
}

function loadSceneVideo(idx) {
  if (idx >= scenes.length) {
    console.log("All scenes finished!");
    return;
  }

  if (vid) {
    vid.remove();
    vid = null;
  }

  isVideoFinished = false;
  completionStartTime = null;

  let currentScene = scenes[idx];

  if (!currentScene.videoPath) {
    videoDone();
    return;
  }

  vid = createVideo(currentScene.videoPath, videoLoaded);
  vid.hide();
  vid.onended(videoDone);
}

function setupIntertitle(sceneData) {
  letters = [];

  let msgStr = sceneData.text;
  let fonts = sceneData.font || fontRegular;
  let baseFontSize = sceneData.fontSize || 36;
  let yOffset = sceneData.yOffset || 0;

  let charSizes = new Array(msgStr.length).fill(baseFontSize);

  if (sceneData.highlights) {
    for (let h of sceneData.highlights) {
      let word = h.word;
      let targetSize = h.size;
      let index = msgStr.indexOf(word);
      if (index !== -1) {
        for (let k = 0; k < word.length; k++) {
          charSizes[index + k] = targetSize;
        }
      }
    }
  }

  let maxFontSizeInText = baseFontSize;
  for (let s of charSizes) {
    if (s > maxFontSizeInText) {
      maxFontSizeInText = s;
    }
  }

  let globalLineHeight = sceneData.lineHeight || maxFontSizeInText * 1.1;

  textFont(fonts);

  let space = 1;
  let maxWidth = displayW - 80;

  let lines = [];
  let currentLine = [];
  let currentLineWidth = 0;

  for (let i = 0; i < msgStr.length; i++) {
    let char = msgStr.charAt(i);
    let mySize = charSizes[i];

    textSize(mySize);

    let charW = textWidth(char) * 0.95;

    if (char === "\n") {
      lines.push({ chars: currentLine, width: currentLineWidth });
      currentLine = [];
      currentLineWidth = 0;
      continue;
    }

    if (currentLineWidth + charW > maxWidth && currentLine.length > 0) {
      lines.push({ chars: currentLine, width: currentLineWidth });
      currentLine = [];
      currentLineWidth = 0;
    }

    currentLine.push({
      char: char,
      index: i,
      size: mySize,
      width: charW,
    });

    currentLineWidth += charW + space;
  }

  if (currentLine.length > 0) {
    lines.push({ chars: currentLine, width: currentLineWidth });
  }

  let totalBlockHeight = lines.length * globalLineHeight;
  let startY = height / 2 - totalBlockHeight / 2 + yOffset;

  let totalLength = msgStr.length;

  for (let line of lines) {
    let startX = (width - line.width) / 2;
    let lineCenterY = startY + globalLineHeight / 2;

    for (let item of line.chars) {
      letters.push(
        new IntertitleChar(
          item.char,
          startX,
          lineCenterY,
          item.index,
          totalLength,
          item.size
        )
      );
      startX += item.width + space;
    }
    startY += globalLineHeight;
  }
}

function videoLoaded() {
  vid.volume(0);
  vid.play();
}

function videoDone() {
  isVideoFinished = true;
  setupIntertitle(scenes[currentSceneIdx]);
  handPose.detectStart(capture, gotHands);
}

function gotDetections(results) {
  detections = results;
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(0);

  if (isVideoFinished === false) {
    if (vid && vid.width > 0 && vid.height > 0) {
      image(vid, width / 2, height / 2, displayW, displayH);
    }
  } else {
    background(10);

    let inputX = -1000;
    let inputY = -1000;
    let inputSpeed = 0;

    let pinchDelta = 0;
    let graspDelta = 0;
    let handSizeDelta = 0;
    let flipDelta = 0;

    let currentMode = scenes[currentSceneIdx].mode;

    if (capture.width > 0) {
      let scaleX = displayW / capture.width;
      let scaleY = displayH / capture.height;
      let startX = (width - displayW) / 2;
      let startY = (height - displayH) / 2;

      if (hands.length > 0) {
        let hand = hands[0];
        let indexFinger = hand.keypoints[8];
        let thumbFinger = hand.keypoints[4];
        let middleFinger = hand.keypoints[12];
        let pinkyFinger = hand.keypoints[20];
        let wrist = hand.keypoints[0];
        let indexMCP = hand.keypoints[5];

        let flippedIndexX = capture.width - indexFinger.x;
        inputX = flippedIndexX * scaleX + startX;
        inputY = indexFinger.y * scaleY + startY;

        let flippedThumbX = capture.width - thumbFinger.x;
        let thumbX = flippedThumbX * scaleX + startX;
        let thumbY = thumbFinger.y * scaleY + startY;

        let wristX = (capture.width - wrist.x) * scaleX + startX;
        let wristY = wrist.y * scaleY + startY;
        let midX = (capture.width - middleFinger.x) * scaleX + startX;
        let midY = middleFinger.y * scaleY + startY;

        let idxMcpX = (capture.width - indexMCP.x) * scaleX + startX;
        let idxMcpY = indexMCP.y * scaleY + startY;

        let pinkyX = (capture.width - pinkyFinger.x) * scaleX + startX;
        let pinkyY = pinkyFinger.y * scaleY + startY;

        let currentPos = createVector(indexFinger.x, indexFinger.y);
        if (previousFinger) {
          let delta = p5.Vector.sub(currentPos, previousFinger);
          inputSpeed = delta.mag();
        }
        previousFinger = currentPos;

        let currentPinchDist = dist(inputX, inputY, thumbX, thumbY);
        if (prevPinchDist !== null)
          pinchDelta = currentPinchDist - prevPinchDist;
        prevPinchDist = currentPinchDist;

        let currentGraspDist = dist(wristX, wristY, midX, midY);
        if (prevGraspDist !== null)
          graspDelta = prevGraspDist - currentGraspDist;
        prevGraspDist = currentGraspDist;

        let currentHandSize = dist(wristX, wristY, idxMcpX, idxMcpY);
        if (prevHandSize !== null)
          handSizeDelta = prevHandSize - currentHandSize;
        prevHandSize = currentHandSize;

        let currentFlipState = thumbX - pinkyX;
        if (prevFlipState !== null)
          flipDelta = currentFlipState - prevFlipState;
        prevFlipState = currentFlipState;

        noFill();
        strokeWeight(2);

        if (currentMode === "zoom") {
          stroke(255, 50);
          line(inputX, inputY, thumbX, thumbY);
          circle(inputX, inputY, 20);
          circle(thumbX, thumbY, 20);
        } else if (currentMode === "write") {
          stroke(255, 50);
          circle(inputX, inputY, 50);
        } else if (currentMode === "hold") {
          stroke(255, 50);
          line(wristX, wristY, midX, midY);
          circle(wristX, wristY, 15);
          circle(midX, midY, 15);
        } else if (currentMode === "farAway") {
          stroke(255, 50);
          circle(wristX, wristY, 10);
          stroke(255, 50);
          circle(wristX, wristY, 50 + sin(frameCount * 0.1) * 10);
        } else if (currentMode === "close") {
          stroke(255, 50);
          circle(wristX, wristY, 10);
          stroke(255, 50);
          circle(wristX, wristY, 50 - sin(frameCount * 0.1) * 10);
        } else if (currentMode === "flip") {
          stroke(255, 50);
          line(thumbX, thumbY, pinkyX, pinkyY);
          stroke(255, 50);
          circle(thumbX, thumbY, 10);
          circle(pinkyX, pinkyY, 10);
        }
      } else {
        previousFinger = null;
        prevPinchDist = null;
        prevGraspDist = null;
        prevHandSize = null;
        prevFlipState = null;
      }
    }

    for (let letter of letters) {
      letter.update(
        inputX,
        inputY,
        inputSpeed,
        currentMode,
        pinchDelta,
        graspDelta,
        handSizeDelta,
        flipDelta,
        currentSceneIdx
      );
      letter.display(currentMode, currentSceneIdx);
    }

    checkNextSceneCondition();

    push();
    fill(255, 50);
    noStroke();
    textSize(12);
    textAlign(CENTER);
    textFont(fontRegular);
    let guideText = modeInstructions[currentMode] || currentMode.toUpperCase();
    text(guideText, width / 2, 30);
    pop();
  }
}

function checkNextSceneCondition() {
  if (letters.length === 0) return;

  let currentMode = scenes[currentSceneIdx].mode;

  let threshold = 0.85;
  if (
    currentSceneIdx === 0 ||
    currentMode === "zoom" ||
    currentMode === "hold" ||
    currentMode === "farAway" ||
    currentMode === "close" ||
    currentMode === "flip"
  ) {
    threshold = 0.95;
  }

  let allClear = true;
  for (let letter of letters) {
    if (
      letter.char !== " " &&
      letter.char !== "\n" &&
      letter.clarity < threshold
    ) {
      allClear = false;
      break;
    }
  }

  if (allClear) {
    if (completionStartTime === null) {
      completionStartTime = millis();
    } else {
      let elapsedTime = millis() - completionStartTime;

      if (elapsedTime > 2000) {
        goToNextScene();
      }
    }
  } else {
    completionStartTime = null;
  }
}

function goToNextScene() {
  currentSceneIdx++;
  completionStartTime = null;

  if (currentSceneIdx < scenes.length) {
    loadSceneVideo(currentSceneIdx);
  } else {
    console.log("End of Movie");
  }
}

class IntertitleChar {
  constructor(char, x, y, index, total, size) {
    this.char = char;
    this.targetX = x;
    this.targetY = y;
    this.clarity = 0;
    this.scatterRange = 5;
    this.baseSize = size;
    this.index = index;
    this.total = total;
  }

  update(
    inputX,
    inputY,
    speed,
    mode,
    pinchDelta,
    graspDelta,
    handSizeDelta,
    flipDelta,
    sceneIdx
  ) {
    let d = dist(inputX, inputY, this.targetX, this.targetY);
    let recoverFactor = 0;

    if (mode === "zoom") {
      if (pinchDelta > 1.0)
        recoverFactor = map(pinchDelta, 0.1, 5, 0, 0.03, true);
      this.clarity += recoverFactor;
    } else if (mode === "hold") {
      if (graspDelta > 0) {
        if (graspDelta > 0.1 && graspDelta < 5.0) recoverFactor = 0.01;
        else if (graspDelta >= 5.0) recoverFactor = -0.05;
      }
      this.clarity += recoverFactor;
    } else if (mode === "farAway") {
      if (handSizeDelta > 0 && handSizeDelta > 0.8 && handSizeDelta < 8.0)
        recoverFactor = 0.012;
      this.clarity += recoverFactor;
    } else if (mode === "close") {
      if (handSizeDelta < 0 && handSizeDelta < -0.8 && handSizeDelta > -8.0)
        recoverFactor = 0.012;
      this.clarity += recoverFactor;
    } else if (mode === "flip") {
      let absDelta = abs(flipDelta);

      if (absDelta > 0.5 && absDelta < 15.0) {
        recoverFactor = 0.005;
      } else if (absDelta >= 15.0) {
        recoverFactor = -0.05;
      } else {
        recoverFactor = -0.001;
      }

      this.clarity += recoverFactor;
    } else if (d < interactionDist) {
      if (mode === "write" && speed > 1) {
        recoverFactor = map(speed, 0, 5, 0, 0.03, true);
        this.clarity += recoverFactor;
      }
    }

    if (speed > 30 && mode !== "flip") {
      this.clarity = lerp(this.clarity, 0, 0.3);
    }

    if (
      (mode === "hold" || mode === "farAway" || mode === "close") &&
      speed > 30
    ) {
      this.clarity = lerp(this.clarity, 0, 0.3);
    }

    this.clarity = constrain(this.clarity, 0, 1);
  }

  display(mode, sceneIdx) {
    push();
    textAlign(LEFT, CENTER);

    if (mode === "write") {
      let activeVal = this.clarity;
      let currentSize = map(activeVal, 0, 1, 5, this.baseSize);
      let alpha = map(activeVal, 0, 1, 20, 255);
      let scatter = map(activeVal, 0, 1, 50, 0);

      let drawX = this.targetX + random(-scatter, scatter);
      let drawY = this.targetY + random(-scatter, scatter);

      textSize(currentSize);
      fill(255, alpha);
      noStroke();
      text(this.char, drawX, drawY);
    } else {
      let jitterAmount = (1 - this.clarity) * this.scatterRange;
      let drawX = this.targetX + random(-jitterAmount, jitterAmount);
      let drawY = this.targetY + random(-jitterAmount, jitterAmount);
      let alpha = map(this.clarity, 0, 1, 50, 255);

      if (mode === "flip") {
        let startThreshold = (this.index / this.total) * 0.7;
        let endThreshold = startThreshold + 0.3;
        let waveScale = map(
          this.clarity,
          startThreshold,
          endThreshold,
          0,
          1,
          true
        );
        waveScale = pow(waveScale, 2);
        let currentSize = this.baseSize * waveScale;
        currentSize = constrain(currentSize, 0, this.baseSize + 5);
        textSize(currentSize);
      } else if (
        mode === "zoom" ||
        mode === "hold" ||
        mode === "farAway" ||
        mode === "close"
      ) {
        let zoomScale = pow(this.clarity, 3);
        let currentSize = this.baseSize * zoomScale;
        currentSize = constrain(currentSize, 5, this.baseSize + 5);
        textSize(currentSize);
      } else {
        textSize(this.baseSize);
      }

      fill(255, alpha);
      noStroke();
      text(this.char, drawX, drawY);
    }

    pop();
  }
}
