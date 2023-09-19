import COLORS from "./colors";
import Color from "@lxweb/color";
import { gameSetting } from "../gameSetting";

const canvasSetting = gameSetting.canvas;

export const drawGameState = {
	letsGo: drawLetsGo,
	pause: drawPause,
	gameOver: animGameOver,
};

// Intro text display :
function drawLetsGo(context) {
	context.clearRect(0, 0, canvasSetting.width, canvasSetting.height);
	context.fillStyle = COLORS.green;
	context.font = canvasSetting.getFontStyle();
	context.textBaseline = "middle";
	context.textAlign = "center";

	context.fillText("Let's go !", canvasSetting.width / 2, canvasSetting.height / 2);
}

// Pause state display :
function drawPause(context) {
	context.save();
	context.beginPath();
	context.fillStyle = "#333a";
	context.fillRect(0, 0, canvasSetting.width, canvasSetting.height);
	context.fillStyle = COLORS.oldWhite;
	context.font = canvasSetting.getFontStyle();
	context.fillText("|| Pause ||", canvasSetting.width / 2, canvasSetting.height / 2);
	context.restore();
}

// Game-Over state display :
function drawGameOver(context, delay, backgroundColor) {
	const { width, height } = canvasSetting;

	context.save();
	context.beginPath();

	context.fillStyle = backgroundColor.toHsl();
	context.fillRect(0, 0, width, height);

	const fontSize = 80;
	context.fillStyle = COLORS.oldWhite;
	context.font = canvasSetting.getFontStyle({ fontSize });

	delay >= 200 && context.fillText("> <", width / 2, height / 2 - 0.8 * fontSize * gameSetting.resolution);
	delay >= 500 && context.fillText("GAME", width / 2, height / 2);
	delay >= 700 && context.fillText("OVER", width / 2, height / 2 + 0.65 * fontSize * gameSetting.resolution);

	context.restore();
}

// Animate Game-Over state display :
function animGameOver(context, drawGameSnapshot) {
	let stopAnimation = false;
	let timeStampAtStart = null;
	const gray = new Color({ saturation: 0, light: 40, alpha: 0 });

	function animLoop(timeStamp) {
		if (!stopAnimation) {
			if (timeStampAtStart !== null) gray.alpha = 0;
			timeStampAtStart ??= timeStamp;
			const delay = timeStamp - timeStampAtStart;
			if (gray.alpha < 70) gray.alpha = delay / 15; // 70 * 15 = 1050ms to animate in opacity

			drawGameSnapshot();
			drawGameOver(context, delay, gray);

			delay <= 800 && requestAnimationFrame(animLoop);
		}
	}

	return {
		animGameOver: () => {
			stopAnimation = false;
			timeStampAtStart = null;
			requestAnimationFrame(animLoop);
		},
		stopAnimGameOver: () => {
			stopAnimation = true;
		},
	};
}
