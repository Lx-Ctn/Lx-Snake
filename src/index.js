import "./styles/styles.scss";
import COLORS, { Color } from "./app/Colors.js";
import { Apple } from "./app/Apple";
import { Snake } from "./app/Snake.js";
import { GameArt } from "./app/game-art/GameArt.js";

/** @type HTMLCanvasElement */ const canvas = document.querySelector("#mainGame");

// On tiens compte de la résolution de l'écran pour garder un affichage correct sur retina display : on multiplie la taille du canvas, puis divise en css
const resolution = window.devicePixelRatio || 1;
const canvasWidth = resolution * 780;
const canvasHeight = resolution * 600;
const cellSize = resolution * 30;
const maxCellsInWidth = canvasWidth / cellSize;
const maxCellsInHeight = canvasHeight / cellSize;

const footerElement = document.getElementById("footer");
const mainElement = document.getElementById("main");

let contexte;
let pause;
let tryAgain = false;
const INITIAL_SPEED = 140;
let gameLoopDelay = INITIAL_SPEED; // Time between frames : shorter increase game speed;
const minGameLoopDelay = 40;

let borderGameStyle;
let gameStyle = "evil";
let style;

let snake;
let snakeColor = COLORS.green;
const snakeStartBody = [
	{ coor: { x: 5, y: 2 }, direction: "right" },
	{ coor: { x: 4, y: 2 }, direction: "right" },
	{ coor: { x: 3, y: 2 }, direction: "right" },
];
const appleStartCoor = { x: 6, y: 8 };
let apple;

let score = 0;
const lastBestScore = localStorage.getItem("snakeBestScore");
let bestScore = lastBestScore ? +lastBestScore : 0;

const defaultFontSize = 50;
const getFontStyle = ({ fontSize } = { fontSize: defaultFontSize }) =>
	`bold ${resolution * fontSize}px "Courier New", Courier, monospace`;

// Idées à implémenter pour faire évoluer le jeu :
// - ajouter un vrai menu différentes catégories ?
// - réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grilles avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, recompense

// TODO: apple drawn after game over

init();

function init() {
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const ratio = canvasWidth / canvasHeight;
	let headerHeight = "130px";
	const bottomMargin = "0.8em";

	function setCanvasSize() {
		headerHeight = getComputedStyle(document.getElementById("header")).minHeight;
		canvas.style.maxWidth = `min(${canvasWidth / resolution}px, calc((100dvh - ${headerHeight}) * ${ratio}))`;
		canvas.style.maxHeight = `min(${
			canvasHeight / resolution
		}px, calc(100dvh - ${headerHeight} - ${bottomMargin}))`;
		// On high pixel density screen, if the height is not round, it could lead to differences between the render of the canvas and the canvas element itself
		// a fine line appear at the bottom, and we don't want that
		canvas.style.height = `${Math.round(window.innerWidth / ratio)}px`;
	}
	setCanvasSize();
	window.addEventListener("resize", setCanvasSize);

	pause = false;
	borderGameStyle = "mirror";
	contexte = canvas.getContext("2d");

	style = new GameArt(gameStyle, contexte, cellSize);
	snake = new Snake(snakeStartBody);
	apple = new Apple(appleStartCoor);

	getScore(); // Dès l'init pour récupérer le "BestScore" du localStorage
	letsGo();
	setTimeout(requestAnimationFrame, 1000, refreshCanvas);
}

// Affichage d'un texte d'intro :
function letsGo() {
	contexte.clearRect(0, 0, canvas.width, canvas.height);
	contexte.fillStyle = snakeColor;
	contexte.font = getFontStyle();
	contexte.textBaseline = "middle";
	contexte.textAlign = "center";

	contexte.fillText("Let's go !", canvasWidth / 2, canvasHeight / 2);
}

// Contrôle les collisions :
function isCollisions() {
	// Détecte les collisions aux bords :
	let borderCollision = false;

	switch (borderGameStyle) {
		case "walls":
			// test: recupère le mouvement suivant avant son affichage pour vérifier une éventuelle collision
			const nextHeadPosition = snake.advance({ test: true });
			borderCollision =
				nextHeadPosition.x < 0 ||
				nextHeadPosition.x > maxCellsInWidth - 1 ||
				nextHeadPosition.y < 0 ||
				nextHeadPosition.y > maxCellsInHeight - 1;
			if (!borderCollision) snake.advance({ nextCell: nextHeadPosition });
			break;
		case "mirror":
			snake.advance();
			if (snake.head.x < 0) snake.head.x = maxCellsInWidth - 1;
			if (snake.head.x > maxCellsInWidth - 1) snake.head.x = 0;
			if (snake.head.y < 0) snake.head.y = maxCellsInHeight - 1;
			if (snake.head.y > maxCellsInHeight - 1) snake.head.y = 0;
			break;
		default:
			throw "Invalid Gameplay";
	}

	return borderCollision || snake.isAutoCollision();
}

function gameOver() {
	snake.life = false;
	style.color = COLORS.red;
}

let startGameOverAnimation;
const gray = new Color(0, 0, 40, 0);
function drawGameOver(timeStamp) {
	if (!snake.life) {
		if (startGameOverAnimation != null) gray.alpha = 0;
		startGameOverAnimation ??= timeStamp;
		const delay = timeStamp - startGameOverAnimation;
		if (gray.alpha < 70) gray.alpha = delay / 15;

		contexte.save();
		contexte.beginPath();

		style.color = COLORS.red;
		snake.draw(style);
		apple.draw(style);

		contexte.fillStyle = gray.toHsl();
		contexte.fillRect(0, 0, canvasWidth, canvasHeight);

		const fontSize = 80;
		contexte.fillStyle = COLORS.oldWhite;
		contexte.font = getFontStyle({ fontSize });

		delay >= 200 && contexte.fillText("> <", canvasWidth / 2, canvasHeight / 2 - 0.8 * fontSize * resolution);
		delay >= 500 && contexte.fillText("GAME", canvasWidth / 2, canvasHeight / 2);
		delay >= 700 && contexte.fillText("OVER", canvasWidth / 2, canvasHeight / 2 + 0.65 * fontSize * resolution);

		contexte.restore();

		delay <= 800 && requestAnimationFrame(drawGameOver);
	}
}

// Quand le serpent mange une pomme :
function scoreThatApple() {
	score++;
	if (score > bestScore) {
		bestScore = score;
	}
	gameLoopDelay > minGameLoopDelay ? (gameLoopDelay -= 3) : (gameLoopDelay = minGameLoopDelay); // On accellère le jeu

	// On génére une nouvelle pomme :
	do {
		const randomX = Math.floor(Math.random() * maxCellsInWidth);
		const randomY = Math.floor(Math.random() * maxCellsInHeight);
		apple.setNewPosition({ x: randomX, y: randomY });
	} while (apple.isOnSnake(snake));
}

// Remet à 0 le jeu après un game-over :
function reload() {
	style.color = COLORS.green;
	snake.rebornWith(snakeStartBody);

	score = 0;
	tryAgain = false;
	gameLoopDelay = INITIAL_SPEED;

	requestAnimationFrame(refreshCanvas);
}

// Boucle de jeu principale :
function refreshCanvas() {
	if (!pause) {
		snake.waitForRefresh = false;

		//snake.advance();
		isCollisions() && gameOver(); // Game-over en cas de collision.

		snake.ate(apple) && scoreThatApple(); // Si le serpent mange une pomme.
		getScore(); // Mise à jour de l'affichage des scores

		contexte.clearRect(0, 0, canvas.width, canvas.height);
		apple.draw(style);
		snake.draw(style);

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
	contexte.save();
	contexte.beginPath();
	contexte.fillStyle = "#333c";
	contexte.fillRect(0, 0, canvasWidth, canvasHeight);
	contexte.fillStyle = COLORS.oldWhite;
	contexte.font = getFontStyle();
	contexte.fillText("|| Pause ||", canvasWidth / 2, canvasHeight / 2);
	contexte.restore();
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

const PREVIEW_CELL_SIZE = 20;
const SNAKE_PREVIEW_LENGTH = 7;
const width = (SNAKE_PREVIEW_LENGTH + 2) * PREVIEW_CELL_SIZE;
const height = 3 * PREVIEW_CELL_SIZE;
snakePreviewCanvas.width = width * resolution;
snakePreviewCanvas.height = height * resolution;
snakePreviewCanvas.style.maxWidth = width + "px";

const snakePreviewCtx = snakePreviewCanvas.getContext("2d");
let previewStyle;
const snakePreviewBody = [];
for (let i = 1; i <= SNAKE_PREVIEW_LENGTH; i++) {
	snakePreviewBody.unshift({ coor: { x: i, y: 1 }, direction: "right" });
}
const snakePreview = new Snake(snakePreviewBody);

function getSnakePreview() {
	snakePreviewCtx.clearRect(0, 0, snakePreviewCanvas.width, snakePreviewCanvas.height);
	previewStyle = new GameArt(gameStyle, snakePreviewCtx, PREVIEW_CELL_SIZE * resolution);
	snakePreview.draw(previewStyle);
}

settingIcon.addEventListener("click", getSetting);
exitIcon.addEventListener("click", getSetting);

function getSetting(event) {
	event.stopPropagation();

	if (!pause && snake.life) {
		pauseOrReload();
	}
	getSnakePreview();
	setting.style.display = setting.style.display == "block" ? "none" : "block";
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

	if (!setting.contains(event.target) && setting.style.display == "block") {
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
			borderGameStyle = "walls";
			canvas.style.border = "3px solid " + COLORS.red;
			break;

		case "mirrorSelector":
			borderGameStyle = "mirror";
			canvas.style.border = "none";
			break;

		default:
			throw "Invalid Gameplay";
	}
	apple.draw(style); // Met à jour le canvas pour afficher le nouveau mode.
}

// Gestion du selecteur de style :
const styleSelector = document.getElementsByClassName("styleSelector");
for (const style of styleSelector) {
	style.addEventListener("click", selectingStyle);
}

function selectingStyle(event) {
	const radius = (cellSize / 2 / resolution).toString() + "px";
	switch (event.currentTarget.id) {
		case "classicSelector":
			gameStyle = "classic";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			break;

		case "fullSelector":
			gameStyle = "full";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			break;

		case "roundedSelector":
			gameStyle = "rounded";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;

		case "bigHeadSelector":
			gameStyle = "bigHead";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;

		case "evilSelector":
		default:
			gameStyle = "evil";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = radius;
			break;
	}

	// Mise à jour du preview du snake avec le nouveau style :
	getSnakePreview();

	// Met à jour du canvas du jeu pour afficher le nouveau mode :
	style = new GameArt(gameStyle, contexte, cellSize);
	contexte.clearRect(0, 0, canvas.width, canvas.height);
	apple.draw(style);
	snake.draw(style);
	drawPause();
}
/*




*/
// Détecte l'appuis sur les touches :

document.onkeydown = function handleKeyDown(event) {
	let key = event.key; // renvoi le code de la touche qui a été appuyée
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
let gestureSensitivity = gameLoopDelay; // Delais de rafraîchissement du calcul du mouvement au toucher (en ms)
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

		if (event.target == canvas || event.target == footerElement || event.target == mainElement) {
			if (getComputedStyle(setting).display == "none") {
				//event.preventDefault(); // Bloque l'appel de l'évenement "click" en même temps que le touch, sauf pour fermer les settings.
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
			event.touches.length == 1 &&
			!pause
		) {
			event.preventDefault(); // Évite le scroll par défaut pour les gestes tactiles.
		}

		if (waitForMoveDelay) {
			return;
		} // Annule l'event si le delai de rafraîchissement n'est pas atteint.

		if (event.target == canvas || event.target == footerElement || event.target == mainElement) {
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
			let touchDelay = timingEnd - timingStart;

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
