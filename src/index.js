import "./styles/styles.scss";
import COLORS, { Color } from "./app/Colors.js";
import { Apple } from "./app/Apple";
import { Snake } from "./app/Snake.js";
import { GameArt } from "./app/game-art/GameArt.js";
import { gameSetting } from "./app/gameSetting";

/** @type HTMLCanvasElement */ const canvas = document.querySelector("#mainGame");
const footerElement = document.getElementById("footer");
const mainElement = document.getElementById("main");

let context;
let pause;
let tryAgain = false;
let gameLoopDelay = gameSetting.initialSpeed; // Time between frames : shorter increase game speed;

let gameArt;

let snake;
const snakeColor = COLORS.green;
let apple;

let score = 0;
const lastBestScore = localStorage.getItem("snakeBestScore");
let bestScore = lastBestScore ? +lastBestScore : 0;

// Idées à implémenter pour faire évoluer le jeu :
// - ajouter un vrai menu différentes catégories ?
// - réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grilles avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, recompense

// TODO: apple drawn after game over

const canvasSetting = gameSetting.canvas;

init();

function init() {
	canvas.width = canvasSetting.width;
	canvas.height = canvasSetting.height;
	const ratio = canvasSetting.width / canvasSetting.height;
	let headerHeight = "130px";
	const bottomMargin = "0.8em";

	function setCanvasSize() {
		headerHeight = getComputedStyle(document.getElementById("header")).minHeight;
		canvas.style.maxWidth = `min(${
			canvasSetting.width / gameSetting.resolution
		}px, calc((100dvh - ${headerHeight}) * ${ratio}))`;
		canvas.style.maxHeight = `min(${
			canvasSetting.height / gameSetting.resolution
		}px, calc(100dvh - ${headerHeight} - ${bottomMargin}))`;
		// On high pixel density screen, if the height is not round, it could lead to differences between the render of the canvas and the canvas element itself
		// a fine line appear at the bottom, and we don't want that
		canvas.style.height = `${Math.round(window.innerWidth / ratio)}px`;
	}
	setCanvasSize();
	window.addEventListener("resize", setCanvasSize);

	pause = false;
	context = canvas.getContext("2d");

	gameArt = new GameArt(gameSetting.selectedGameArt, context, canvasSetting.cellSize);
	snake = new Snake(gameSetting.initialSnakeBody);
	apple = new Apple(gameSetting.initialAppleCoor);

	getScore(); // Dès l'init pour récupérer le "BestScore" du localStorage
	drawLetsGo();
	setTimeout(requestAnimationFrame, 1000, refreshCanvas);
}

// Affichage d'un texte d'intro :
function drawLetsGo() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = snakeColor;
	context.font = canvasSetting.getFontStyle();
	context.textBaseline = "middle";
	context.textAlign = "center";

	context.fillText("Let's go !", canvasSetting.width / 2, canvasSetting.height / 2);
}

// Contrôle les collisions :
function isCollisions() {
	// Détecte les collisions aux bords :
	let borderCollision = false;

	switch (gameSetting.selectedGamePlay) {
		case "walls": {
			// test: recupère le mouvement suivant avant son affichage pour vérifier une éventuelle collision
			const nextHeadPosition = snake.advance({ test: true });
			borderCollision =
				nextHeadPosition.x < 0 ||
				nextHeadPosition.x > canvasSetting.maxCellsInWidth - 1 ||
				nextHeadPosition.y < 0 ||
				nextHeadPosition.y > canvasSetting.maxCellsInHeight - 1;
			if (!borderCollision) snake.advance({ nextCell: nextHeadPosition });
			break;
		}
		case "mirror":
			snake.advance();
			if (snake.head.x < 0) snake.head.x = canvasSetting.maxCellsInWidth - 1;
			if (snake.head.x > canvasSetting.maxCellsInWidth - 1) snake.head.x = 0;
			if (snake.head.y < 0) snake.head.y = canvasSetting.maxCellsInHeight - 1;
			if (snake.head.y > canvasSetting.maxCellsInHeight - 1) snake.head.y = 0;
			break;
		default:
			throw new Error("Invalid Gameplay");
	}

	return borderCollision || snake.isAutoCollision();
}

function gameOver() {
	snake.life = false;
	gameArt.color = COLORS.red;
}

let startGameOverAnimation;
const gray = new Color(0, 0, 40, 0);
function drawGameOver(timeStamp) {
	if (!snake.life) {
		if (startGameOverAnimation != null) gray.alpha = 0;
		startGameOverAnimation ??= timeStamp;
		const delay = timeStamp - startGameOverAnimation;
		if (gray.alpha < 70) gray.alpha = delay / 15;

		const { width, height } = canvasSetting;

		context.save();
		context.beginPath();

		gameArt.color = COLORS.red;
		snake.draw(gameArt);
		apple.draw(gameArt);

		context.fillStyle = gray.toHsl();
		context.fillRect(0, 0, width, height);

		const fontSize = 80;
		context.fillStyle = COLORS.oldWhite;
		context.font = canvasSetting.getFontStyle({ fontSize });

		delay >= 200 && context.fillText("> <", width / 2, height / 2 - 0.8 * fontSize * gameSetting.resolution);
		delay >= 500 && context.fillText("GAME", width / 2, height / 2);
		delay >= 700 && context.fillText("OVER", width / 2, height / 2 + 0.65 * fontSize * gameSetting.resolution);

		context.restore();

		delay <= 800 && requestAnimationFrame(drawGameOver);
	}
}

// Quand le serpent mange une pomme :
function scoreThatApple() {
	score++;
	if (score > bestScore) {
		bestScore = score;
	}
	const minGameLoopDelay = gameSetting.maxSpeed;
	gameLoopDelay > minGameLoopDelay
		? (gameLoopDelay -= gameSetting.acceleration)
		: (gameLoopDelay = minGameLoopDelay); // Speed-up the game

	// On génére une nouvelle pomme :
	do {
		const randomX = Math.floor(Math.random() * canvasSetting.maxCellsInWidth);
		const randomY = Math.floor(Math.random() * canvasSetting.maxCellsInHeight);
		apple.setNewPosition({ x: randomX, y: randomY });
	} while (apple.isOnSnake(snake));
}

// Remet à 0 le jeu après un game-over :
function reload() {
	gameArt.color = COLORS.green;
	snake.rebornWith(gameSetting.initialSnakeBody);

	score = 0;
	tryAgain = false;
	gameLoopDelay = gameSetting.initialSpeed;

	requestAnimationFrame(refreshCanvas);
}

// Boucle de jeu principale :
function refreshCanvas() {
	if (!pause) {
		snake.waitForRefresh = false;

		// snake.advance();
		isCollisions() && gameOver(); // Game-over en cas de collision.

		snake.ate(apple) && scoreThatApple(); // Si le serpent mange une pomme.
		getScore(); // Mise à jour de l'affichage des scores

		context.clearRect(0, 0, canvas.width, canvas.height);
		apple.draw(gameArt);
		snake.draw(gameArt);

		if (snake.life) {
			setTimeout(requestAnimationFrame, gameLoopDelay, refreshCanvas);
		} else {
			startGameOverAnimation = null;
			// Redemarre seulement si la touche est pressée.
			tryAgain ? reload() : requestAnimationFrame(drawGameOver);
		}
	}
}

// Gestion de la mise en pause et relance après un game over :
function pauseOrReload() {
	if (!snake.life) {
		// Si gameOver :
		tryAgain = true;
		reload(); // On relance
	} else if (!pause) {
		// Sinon on gère la mise en pause
		pause = true;
		drawPause();
	} else {
		pause = false;
		requestAnimationFrame(refreshCanvas);
	}
}

// Affichage de la pause :
function drawPause() {
	context.save();
	context.beginPath();
	context.fillStyle = "#333a";
	context.fillRect(0, 0, canvasSetting.width, canvasSetting.height);
	context.fillStyle = COLORS.oldWhite;
	context.font = canvasSetting.getFontStyle();
	context.fillText("|| Pause ||", canvasSetting.width / 2, canvasSetting.height / 2);
	context.restore();
}

// Met à jour l'affichage des scores :
function getScore() {
	document.getElementById("currentScore").innerHTML = score.toString(); // innerHTML correspond au texte entre les tags html de l'élément sélectionné.
	document.getElementById("bestScore").innerHTML = bestScore.toString();
	try {
		localStorage.setItem("snakeBestScore", bestScore.toString());
	} catch (error) {
		console.log(error);
	}
}

// Gestion de l'affichage du menu de réglage :
const settingIcon = document.getElementById("settingIcon");
const exitIcon = document.getElementById("exitSetting");
const setting = document.getElementById("setting");
/** @type HTMLCanvasElement */ const snakePreviewCanvas = document.querySelector("#snakePreview");

const previewSetting = gameSetting.preview;
snakePreviewCanvas.width = previewSetting.width;
snakePreviewCanvas.height = previewSetting.height;
snakePreviewCanvas.style.maxWidth = previewSetting.width / gameSetting.resolution + "px";

const snakePreviewCtx = snakePreviewCanvas.getContext("2d");
const snakePreview = new Snake(previewSetting.snakePreviewBody);

function getSnakePreview() {
	snakePreviewCtx.clearRect(0, 0, snakePreviewCanvas.width, snakePreviewCanvas.height);
	const previewGameArt = new GameArt(gameSetting.selectedGameArt, snakePreviewCtx, previewSetting.cellSize);
	snakePreview.draw(previewGameArt);
}

settingIcon.addEventListener("click", getSetting);
exitIcon.addEventListener("click", getSetting);

function getSetting(event) {
	event.stopPropagation();

	if (!pause && snake.life) {
		pauseOrReload();
	}
	getSnakePreview();
	setting.style.display = setting.style.display === "block" ? "none" : "block";
}

/*
    const headline = document.getElementById("title");
    headline.addEventListener("click", function () {
        // Met en plein écran
        document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
    })
    */

let blockClickPropagation = false;
document.body.addEventListener("click", function (event) {
	if ((event.target === mainElement || event.target === canvas) && !blockClickPropagation) {
		pauseOrReload();
	}
	if (blockClickPropagation) blockClickPropagation = false;

	if (!setting.contains(event.target) && setting.style.display === "block") {
		getSetting(event);
	}
});

// Gestion du selecteur de mode de jeu :
const gamePlaySelector = document.getElementsByClassName("gamePlaySelector");
for (const gamePlay of gamePlaySelector) {
	gamePlay.addEventListener("click", selectingGamePlay);
}

function selectingGamePlay(event) {
	switch (
		event.currentTarget.id // currentTarget : élément à partir duquel l'événement à été appelé (gamePlay ici); Target : élément précis qui à déclencher l'événement, donc peut être un enfant de currentTarget
	) {
		case "wallsSelector":
			gameSetting.selectedGamePlay = "walls";
			canvas.style.border = "3px solid " + COLORS.red;
			break;

		case "mirrorSelector":
			gameSetting.selectedGamePlay = "mirror";
			canvas.style.border = "none";
			break;

		default:
			throw new Error("Invalid Gameplay");
	}
	apple.draw(gameArt); // Met à jour le canvas pour afficher le nouveau mode.
}

// Gestion du selecteur de style :
const styleSelector = document.getElementsByClassName("styleSelector");
for (const style of styleSelector) {
	style.addEventListener("click", selectingStyle);
}

function selectingStyle(event) {
	const radius = `${canvasSetting.cellSize / 2 / gameSetting.resolution}px`;
	switch (event.currentTarget.id) {
		case "classicSelector":
			gameSetting.selectedGameArt = "classic";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			break;

		case "fullSelector":
			gameSetting.selectedGameArt = "full";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			break;

		case "roundedSelector":
			gameSetting.selectedGameArt = "rounded";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;

		case "bigHeadSelector":
			gameSetting.selectedGameArt = "bigHead";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;

		case "evilSelector":
		default:
			gameSetting.selectedGameArt = "evil";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;
	}

	// Mise à jour du preview du snake avec le nouveau style :
	getSnakePreview();

	// Met à jour du canvas du jeu pour afficher le nouveau mode :
	gameArt = new GameArt(gameSetting.selectedGameArt, context, canvasSetting.cellSize);
	context.clearRect(0, 0, canvas.width, canvas.height);
	apple.draw(gameArt);
	snake.draw(gameArt);
	drawPause();
}
/*




*/
// Détecte l'appuis sur les touches :

document.onkeydown = function handleKeyDown(event) {
	const key = event.key; // renvoi le code de la touche qui a été appuyée
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
			event.preventDefault();
			setting.style.display === "block" || pauseOrReload();
			break;
		default:
			return;
	}
	if (newDirection) event.preventDefault();
	pause || snake.setDirection(newDirection);
};
/*




*/
// Détection des gestes tactiles :

let xFirst;
let yFirst;
let xMove = 0;
let yMove = 0;
let timingStart;
let timingEnd;
const gestureSensitivity = gameLoopDelay; // Delais de rafraîchissement du calcul du mouvement au toucher (en ms)
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

document.body.addEventListener(
	"touchstart",
	function (event) {
		// Target : document au lieu de canvas pour inclure les éléments d'affichage "pause" & "Game Over"

		if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
			if (getComputedStyle(setting).display === "none") {
				// Bloque l'appel de l'évenement "click" en même temps que le touch, sauf pour fermer les settings.
				blockClickPropagation = true;
			}
			xFirst = event.touches[0].clientX;
			yFirst = event.touches[0].clientY;
			timingStart = performance.now();

			waitForMoveDelay = false; // Réinitialise si le timeOut est kill
		}
	},
	{ passive: false }
);

document.body.addEventListener(
	"touchmove",
	function (event) {
		if (
			(event.target === canvas || event.target === footerElement || event.target === mainElement) &&
			event.touches.length === 1 &&
			!pause
		) {
			event.preventDefault(); // Évite le scroll par défaut pour les gestes tactiles.
		}

		if (waitForMoveDelay) {
			return;
		} // Annule l'event si le delai de rafraîchissement n'est pas atteint.

		if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
			waitForMoveDelay = true;
			killTimeOut = false;

			setTimeout(function () {
				if (killTimeOut) {
					return;
				} // Annule la programmation si le doigt est levé avant

				xMove = event.touches[0].clientX - xFirst;
				yMove = event.touches[0].clientY - yFirst;
				pause || snake.setDirection(getNewDirection());

				// La boucle est passée, on peut en relancer une nouvelle
				xFirst = event.touches[0].clientX;
				yFirst = event.touches[0].clientY;
				waitForMoveDelay = false;
			}, gestureSensitivity); // La sensibilité s'accèlère avec la vitesse de jeu
		}
	},
	{ passive: false }
);

document.body.addEventListener(
	"touchend",
	function (event) {
		if (event.target === canvas || event.target === footerElement || event.target === mainElement) {
			timingEnd = performance.now();
			const touchDelay = timingEnd - timingStart;

			if (waitForMoveDelay) {
				// Si le doigt est levé avant que le timeOut soit appelé
				killTimeOut = true; // On anule le timeOut

				// Et on fait le calcul maintenant
				xMove = event.changedTouches[0].clientX - xFirst;
				yMove = event.changedTouches[0].clientY - yFirst;
				pause || snake.setDirection(getNewDirection());
			}

			if (Math.abs(xMove) < 9 && Math.abs(yMove) < 9 && touchDelay < 250) {
				// Math.abs(number) : renvoi toujours un nombre positif, donc Math.abs(number) === Math.abs(-number)
				pauseOrReload();
			}

			xMove = 0;
			yMove = 0;
		}
	},
	{ passive: false }
);
