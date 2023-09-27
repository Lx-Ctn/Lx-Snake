import { appElements, gameAssets, gameState, pauseOrReload } from "..";
import { toggleSetting, isSettingOpen } from "./handleGameOptions";

export function handleControls() {
	document.body.addEventListener("click", handleClick, { passive: false });
	document.body.addEventListener("keydown", handleKeyDown, { passive: false });
	document.body.addEventListener("touchstart", handleTouchStart, { passive: false });
	document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
	document.body.addEventListener("touchend", handleTouchEnd, { passive: false });
}
/*


*/
// Handle pause or reload if click in the game zone :

function isInGameZone(event) {
	const { mainElement, canvas, footerElement } = appElements;
	return event.target === canvas || event.target === footerElement || event.target === mainElement;
}

function handleClick(event) {
	!isSettingOpen() && isInGameZone(event) && pauseOrReload();
}
/*


*/
// Handle keybord navigation :
const isKeyboardSelectElement = {
	A: true,
	BUTTON: true,
	INPUT: true,
};

function handleKeyDown(event) {
	if (!isSettingOpen()) {
		const key = event.key;
		let newDirection;
		switch (key) {
			case "d":
			case "Right":
			case "ArrowRight":
				newDirection = "right";
				break;
			case "q":
			case "Left":
			case "ArrowLeft":
				newDirection = "left";
				break;
			case "z":
			case "Up":
			case "ArrowUp":
				newDirection = "up";
				break;
			case "s":
			case "Down":
			case "ArrowDown":
				newDirection = "down";
				break;
			case "Enter":
			case " ": // space bar
				if (!isKeyboardSelectElement[event.target.tagName]) {
					event.preventDefault(); // Prevent scroll down (spacebar default)
					pauseOrReload();
				}
				break;
			default:
				return;
		}
		if (newDirection && !isKeyboardSelectElement[event.target.tagName]) event.preventDefault(); // Prevent scroll when using direction
		gameState.pause || gameAssets.snake.setDirection(newDirection);
	} else {
		event.key === "Escape" && toggleSetting(event);
	}
}

/*


*/
// Handle touch gestures :

let startCoor;
let waitForMoveDelay = false;
let nextDirectionUpdate;

function setNewDirection(moveDelta) {
	let newDirection;
	const { x, y } = moveDelta;

	if (x > 0 && x >= Math.abs(y)) newDirection = "right";
	else if (y > 0 && y > Math.abs(x)) newDirection = "down";
	else if (x < 0 && -x >= Math.abs(y)) newDirection = "left";
	else newDirection = "up";

	gameAssets.snake.setDirection(newDirection);
}

function getCurrentCoor(event) {
	return { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function updateDirection(event) {
	const currentCoor = getCurrentCoor(event);
	const moveDelta = { x: currentCoor.x - startCoor.x, y: currentCoor.y - startCoor.y };
	setNewDirection(moveDelta);
}

function initLoop(event) {
	startCoor = getCurrentCoor(event);
	waitForMoveDelay = false;
}

function isGameOn() {
	return !gameState.pause && gameAssets.snake.life;
}

function handleTouchStart(event) {
	if (isGameOn() && isInGameZone(event)) {
		initLoop(event);
	}
}

function handleTouchMove(event) {
	if (isGameOn() && isInGameZone(event)) {
		if (event.touches.length === 1) event.preventDefault(); // stop default scroll with gesture, except if the game is paused or using multi finger

		if (waitForMoveDelay) return; // Cancel until delay .

		waitForMoveDelay = true;
		const gestureSensitivity = gameAssets.gameLoopDelay; // Sensitivity grow with game speed

		nextDirectionUpdate = setTimeout(function () {
			updateDirection(event);
			initLoop(event);
		}, gestureSensitivity); // Delay between each movement update (ms)
	}
}

function handleTouchEnd(event) {
	if (isGameOn() && waitForMoveDelay && isInGameZone(event)) {
		// if the finger is released before the next update :
		clearTimeout(nextDirectionUpdate); // We cancel the next update,
		updateDirection(event); // And do it now.
	}
}

/*
// Test fullscreen :
check "esc" key conflict to exit fullsreen
const headline = document.getElementById("title");
headline.addEventListener("click", function () {
	document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
});
 */
