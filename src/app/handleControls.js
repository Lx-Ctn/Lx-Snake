import { appElements, gameAssets, gameState, pauseOrReload } from "..";
import { toggleSetting, isSettingOpen } from "./handleGameOptions";

export function handleControls() {
	appElements.footerLinkElement.addEventListener("click", handleTouchOnLink, { passive: false });
	document.body.addEventListener("click", handleClick, { passive: false });
	document.body.addEventListener("keydown", handleKeyDown, { passive: false });
	document.body.addEventListener("touchstart", handleTouchStart, { passive: false });
	document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
	document.body.addEventListener("touchend", handleTouchEnd, { passive: false });
}
/*


*/
// Handle pause or reload if click in the game zone :

function handleClick(event) {
	!isSettingOpen() && isInGameZone(event) && pauseOrReload();
}

// On touch devices, we want to see the game, so we mainly play we our finger under, on the footer (it also more accessible).
// But here is the signature with the link to my portfolio...
// And when the game is on, a touch should pause the game, and not spoil the xp by opening a link.
let isClickTriggerByTouch = false;
let nextDisableClickTriggerByTouch;
const MAX_TIME_FOR_TOUCH_AND_HOLD = 1500; // ms  (android touch & hold long accessibility setting)

// We set this on touch start, cause on many touch device, the click event is simulated, behaved like a mouseEvent with no way to know if it was triggered by touch.
function setTouchTriggeredClick() {
	isClickTriggerByTouch = true;
	// More and more device can have a mouse AND a touch screen.
	// So we can't rely on the simple fact that there is a touch screen to disable the link
	clearTimeout(nextDisableClickTriggerByTouch);
	nextDisableClickTriggerByTouch = setTimeout(() => {
		isClickTriggerByTouch = false;
	}, MAX_TIME_FOR_TOUCH_AND_HOLD);
}
function showFooterLinkDisabled() {
	appElements.footerLinkElement.style.opacity = "0.4";
}

function showFooterLinkenabled() {
	appElements.footerLinkElement.style.opacity = "";
}

function handleTouchOnLink(event) {
	if (isClickTriggerByTouch && isGameOn()) {
		event.preventDefault();
		showFooterLinkenabled();
		isClickTriggerByTouch = false;
	} else {
		event.stopPropagation();
	}
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

function handleTouchStart(event) {
	if (isGameOn() && isInGameZone(event)) {
		event.target === appElements.footerLinkElement && setTouchTriggeredClick();
		showFooterLinkDisabled();
		initLoop(event);
	}
}

function handleTouchMove(event) {
	if (isGameOn() && isInGameZone(event)) {
		if (event.touches.length === 1) event.preventDefault(); // stop default scroll with gesture, except if the game is paused or using multiple fingers

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
	if (isGameOn() && isInGameZone(event)) {
		showFooterLinkenabled();

		if (waitForMoveDelay) {
			// if the finger is released before the next update :
			clearTimeout(nextDirectionUpdate); // We cancel the next update,
			updateDirection(event); // And do it now.
		}
	}
}
/*


*/ // Utils :

function isInGameZone(event) {
	const { mainElement, canvas, footerElement, footerLinkElement } = appElements;
	return (
		event.target === canvas ||
		event.target === mainElement ||
		event.target === footerElement ||
		event.target === footerLinkElement
	);
}

function isGameOn() {
	return !gameState.pause && gameAssets.snake.life;
}

/*
// Test fullscreen :
check "esc" key conflict to exit fullsreen
const headline = document.getElementById("title");
headline.addEventListener("click", function () {
	document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
});
 */
