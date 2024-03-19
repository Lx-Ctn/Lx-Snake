import { appElements, gameAssets, gameState, pauseOrReload } from "..";
import { toggleSetting, isSettingOpen } from "./handleGameOptions";

/** Handle mouse, touch & keybord events to control the game */
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
/**  Handle pause or reload if click in the game zone */
function handleClick(event) {
	!isSettingOpen() && isInGameZone(event) && pauseOrReload();
}

// On touch devices, we want to see the game, so we mainly play we our finger under, on the footer (it's also more accessible).
// But here is the signature with the link to my portfolio...
// And when the game is on, a touch should pause the game, and not spoil the xp by opening a link.
let isClickTriggerByTouch = false;
let nextDisableClickTriggerByTouch;
const MAX_TIME_FOR_TOUCH_AND_HOLD = 1500; // ms  (android touch & hold long accessibility setting)

/** Called on "click" on the footer link element.
 * Cancel the click if the game is running to prevent redirect while playing */
function handleTouchOnLink(event) {
	if (isClickTriggerByTouch && isGameOn()) {
		// If it's a touch and not a mouse click, we stop the click event from openning the link while the game is running :
		event.preventDefault();
		// Then we enabled the link (disabled on touch start) && init isClickTriggerByTouch :
		showFooterLinkenabled();
		isClickTriggerByTouch = false;
	}
	if (!isClickTriggerByTouch && !isGameOn()) {
		// We want to be sure that the game is pause when the user is send to a other page :
		// If it's a real mouse click on the link, and the game is already paused (or game over) :
		// We want to open the link without having the event bubble to toggle pause, and set the game running to death while looking away.
		event.stopPropagation();
	}
}

/** We have to set this on a "touchstart" event, because on many touch device, the click event is simulated,
 * it behaved like a mouseEvent with no way to know if it was triggered by touch */
function setTouchTriggeredClick() {
	isClickTriggerByTouch = true;
	// More and more device can have a mouse AND a touch screen.
	// So we can't rely on the simple fact that there is a touch screen to disable the link
	clearTimeout(nextDisableClickTriggerByTouch);
	nextDisableClickTriggerByTouch = setTimeout(() => {
		isClickTriggerByTouch = false;
	}, MAX_TIME_FOR_TOUCH_AND_HOLD);
}

/** Change the display of the footer link element to look disabled */
function showFooterLinkDisabled() {
	appElements.footerLinkElement.style.opacity = "0.4";
}

/** Change the display of the footer link element to look normal (not disabled) */
function showFooterLinkenabled() {
	appElements.footerLinkElement.style.opacity = "";
}

/*




*/ // Handle keybord navigation :

const isKeyboardSelectElement = {
	A: true,
	BUTTON: true,
	INPUT: true,
};

/** Handle keybord navigation */
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

/** @type {{x:number, y:number}} */ let startCoor;
let waitForMoveDelay = false;
/** setTimeOut id */ let nextDirectionUpdate;

/** Set new direction from touch gesture
 * @param {{x:number, y:number}} moveDelta - The distance covered by the pointer since last update
 */
function setNewDirection(moveDelta) {
	let newDirection;
	const { x, y } = moveDelta;

	if (x > 0 && x >= Math.abs(y)) newDirection = "right";
	else if (y > 0 && y > Math.abs(x)) newDirection = "down";
	else if (x < 0 && -x >= Math.abs(y)) newDirection = "left";
	else newDirection = "up";

	gameAssets.snake.setDirection(newDirection);
}

/** Get current pointer coordinates
 * @returns {{x:number, y:number}}
 */
function getCurrentCoor(event) {
	return { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

/** Get the pointer movement since last update -> update the direction */
function updateDirection(event) {
	const currentCoor = getCurrentCoor(event);
	const moveDelta = { x: currentCoor.x - startCoor.x, y: currentCoor.y - startCoor.y };
	setNewDirection(moveDelta);
}

/** Reset the variables for the new draw */
function initLoop(event) {
	startCoor = getCurrentCoor(event);
	waitForMoveDelay = false;
}

/** When the finger reach the screen  */
function handleTouchStart(event) {
	if (isGameOn() && isInGameZone(event)) {
		event.target === appElements.footerLinkElement && setTouchTriggeredClick();
		showFooterLinkDisabled();
		initLoop(event);
	}
}

/** Called over and over as long as the finger isn't released */
function handleTouchMove(event) {
	if (isGameOn() && isInGameZone(event)) {
		if (event.touches.length === 1) event.preventDefault(); // stop default scroll with gesture, except if the game is paused or using multiple fingers

		if (waitForMoveDelay) return; // Cancel until delay .

		waitForMoveDelay = true;
		const gestureSensitivity = gameAssets.gameLoopDelay; // Sensitivity grow with game speed
		console.log({ gestureSensitivity });
		nextDirectionUpdate = setTimeout(function () {
			updateDirection(event);
			initLoop(event);
		}, gestureSensitivity); // Delay between each movement update (ms)
	}
}

/** Called when the finger is release */
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

/** Check if the event the areas reacting for game controls.
 * @return {boolean} true if in the game zone
 */
function isInGameZone(event) {
	const { mainElement, canvas, footerElement, footerLinkElement } = appElements;
	return (
		event.target === canvas ||
		event.target === mainElement ||
		event.target === footerElement ||
		event.target === footerLinkElement
	);
}

/** Is the game running ?
 * @returns {boolean} true if the game is running
 */
function isGameOn() {
	return !gameState.pause && gameAssets.snake.life;
}

/*
// Test fullscreen :
//check "esc" key conflict to exit fullsreen
const headline = document.getElementById("title");
headline.addEventListener("click", function () {
	document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
});
*/
