import { appElements, gameAssets, gameState, pauseOrReload, getSetting } from "..";

export function handleControls() {
	window.addEventListener("keydown", handleKeyDown, { passive: false });
	window.addEventListener("touchstart", handleTouchStart, { passive: false });
	window.addEventListener("touchmove", handleTouchMove, { passive: false });
	window.addEventListener("touchend", handleTouchEnd, { passive: false });
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
	if (appElements.setting.style.display !== "block") {
		const key = event.key;
		let newDirection;
		switch (key) {
			case "d": // touche d
			case "Right": // touche directionnelle droite
			case "ArrowRight":
				newDirection = "right";
				break;
			case "q": // touche q
			case "Left": // touche directionnelle gauche
			case "ArrowLeft":
				newDirection = "left";
				break;
			case "z": // touche z
			case "Up": // touche directionnelle haut
			case "ArrowUp":
				newDirection = "up";
				break;
			case "s": // touche s
			case "Down": // touche directionnelle bas
			case "ArrowDown":
				newDirection = "down";
				break;
			case "Enter": // touche entrée
			case " ": // touche espace
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
		event.key === "Escape" && getSetting(event);
	}
}

/*




*/
// Handle touch gestures :

let xFirst;
let yFirst;
let xMove = 0;
let yMove = 0;
let timingStart;
let timingEnd;
let waitForMoveDelay = false;
let killTimeOut = false;

function getNewDirection() {
	let newDirection;

	if (xMove > 0 && xMove >= Math.abs(yMove)) {
		newDirection = "right";
	} else if (yMove > 0 && yMove > Math.abs(xMove)) {
		newDirection = "down";
	} else if (xMove < 0 && -xMove >= Math.abs(yMove)) {
		newDirection = "left";
	} else {
		newDirection = "up";
	}

	return newDirection;
}

function handleTouchStart(event) {
	const { mainElement, canvas, footerElement, setting } = appElements;

	if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
		if (getComputedStyle(setting).display === "none") {
			// Block the automatic "click" event call when a "touch" event is fired, except to close the setting panel.
			event.preventDefault();
		}
		xFirst = event.touches[0].clientX;
		yFirst = event.touches[0].clientY;
		timingStart = performance.now();

		waitForMoveDelay = false; // Réinitialise si le timeOut est kill
	}
}

function handleTouchMove(event) {
	const { mainElement, canvas, footerElement } = appElements;

	if (
		(event.target === canvas || event.target === footerElement || event.target === mainElement) &&
		event.touches.length === 1 &&
		!gameState.pause
	) {
		event.preventDefault(); // Évite le scroll par défaut pour les gestes tactiles.
	}

	if (waitForMoveDelay) {
		return;
	} // Annule l'event si le delai de rafraîchissement n'est pas atteint.

	if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
		waitForMoveDelay = true;
		killTimeOut = false;

		const gestureSensitivity = gameAssets.gameLoopDelay; // Delais de rafraîchissement du calcul du mouvement au toucher (en ms)

		setTimeout(function () {
			if (killTimeOut) {
				return;
			} // Annule la programmation si le doigt est levé avant

			xMove = event.touches[0].clientX - xFirst;
			yMove = event.touches[0].clientY - yFirst;
			gameState.pause || gameAssets.snake.setDirection(getNewDirection());

			// La boucle est passée, on peut en relancer une nouvelle
			xFirst = event.touches[0].clientX;
			yFirst = event.touches[0].clientY;
			waitForMoveDelay = false;
		}, gestureSensitivity); // La sensibilité s'accèlère avec la vitesse de jeu
	}
}

function handleTouchEnd(event) {
	const { mainElement, canvas, footerElement } = appElements;

	if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
		timingEnd = performance.now();
		const touchDelay = timingEnd - timingStart;

		if (waitForMoveDelay) {
			// Si le doigt est levé avant que le timeOut soit appelé
			killTimeOut = true; // On anule le timeOut

			// Et on fait le calcul maintenant
			xMove = event.changedTouches[0].clientX - xFirst;
			yMove = event.changedTouches[0].clientY - yFirst;
			gameState.pause || gameAssets.snake.setDirection(getNewDirection());
		}

		if (Math.abs(xMove) < 9 && Math.abs(yMove) < 9 && touchDelay < 250) {
			// Math.abs(number) : renvoi toujours un nombre positif, donc Math.abs(number) === Math.abs(-number)
			pauseOrReload();
		}

		xMove = 0;
		yMove = 0;
	}
}
