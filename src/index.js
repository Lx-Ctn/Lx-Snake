import "./styles/styles.scss";
import COLORS from "./app/game-art/colors.js";
import { Apple } from "./app/Apple";
import { Snake } from "./app/Snake.js";
import { GameArt } from "./app/game-art/GameArt.js";
import { gameSetting } from "./app/gameSetting";
import { drawGameState } from "./app/game-art/drawGameState";
import { handleControls } from "./app/handleControls";

export const appElements = {
	mainElement: document.getElementById("main"),
	footerElement: document.getElementById("footer"),
	/** @type HTMLCanvasElement */ canvas: document.querySelector("#mainGame"),

	currentScoreElement: document.getElementById("currentScore"),
	bestScoreElement: document.getElementById("bestScore"),

	// Setting panel :
	setting: document.getElementById("setting"),
	settingIcon: document.getElementById("settingIcon"),
	exitIcon: document.getElementById("exitSetting"),
	/** @type HTMLCanvasElement */ snakePreviewCanvas: document.querySelector("#snakePreview"),
};

const {
	canvas,
	mainElement,
	footerElement,
	currentScoreElement,
	bestScoreElement,
	setting,
	settingIcon,
	exitIcon,
	snakePreviewCanvas,
} = appElements;
const canvasSetting = gameSetting.canvas;
const lastBestScore = localStorage.getItem("snakeBestScore");

export const gameState = {
	gameLoopDelay: gameSetting.initialSpeed, // Time between frames : shorter increase game speed,
	pause: false,

	score: 0,
	bestScore: lastBestScore ? +lastBestScore : 0,
};

// Idées à implémenter pour faire évoluer le jeu :
// - ajouter un vrai menu différentes catégories ?
// - réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grilles avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, recompense

export const gameAssets = init();
const { context, snake, apple } = gameAssets;
handleControls();

function init() {
	canvas.width = canvasSetting.width;
	canvas.height = canvasSetting.height;
	const ratio = canvasSetting.width / canvasSetting.height;
	const radius = `${canvasSetting.cellSize / 2 / gameSetting.resolution}px`;
	canvas.style.borderRadius = radius;
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

	const context = canvas.getContext("2d");

	const gameArt = new GameArt(gameSetting.selectedGameArt, context, canvasSetting.cellSize);
	const snake = new Snake(gameSetting.initialSnakeBody);
	const apple = new Apple(gameSetting.initialAppleCoor);

	getScore(); // Dès l'init pour récupérer le "BestScore" du localStorage
	drawGameState.letsGo(context);
	setTimeout(requestAnimationFrame, 1000, refreshCanvas);

	return {
		context,
		gameArt,
		snake,
		apple,
	};
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
	gameAssets.gameArt.color = COLORS.red;
}

// Quand le serpent mange une pomme :
function scoreThatApple() {
	gameState.score++;
	if (gameState.score > gameState.bestScore) {
		gameState.bestScore = gameState.score;
	}
	const minGameLoopDelay = gameSetting.maxSpeed;
	gameState.gameLoopDelay > minGameLoopDelay
		? (gameState.gameLoopDelay -= gameSetting.acceleration)
		: (gameState.gameLoopDelay = minGameLoopDelay); // Speed-up the game

	// On génére une nouvelle pomme :
	do {
		const randomX = Math.floor(Math.random() * canvasSetting.maxCellsInWidth);
		const randomY = Math.floor(Math.random() * canvasSetting.maxCellsInHeight);
		apple.setNewPosition({ x: randomX, y: randomY });
	} while (apple.isOnSnake(snake));
}

// Remet à 0 le jeu après un game-over :
function reload() {
	gameAssets.gameArt.color = COLORS.green;
	snake.rebornWith(gameSetting.initialSnakeBody);

	gameState.score = 0;
	gameState.gameLoopDelay = gameSetting.initialSpeed;

	stopAnimGameOver();
	requestAnimationFrame(refreshCanvas);
}

const { animGameOver, stopAnimGameOver } = drawGameState.gameOver(context, () => {
	gameAssets.gameArt.color = COLORS.red;
	snake.draw(gameAssets.gameArt);
	apple.draw(gameAssets.gameArt);
});

// Boucle de jeu principale :
function refreshCanvas() {
	if (!gameState.pause) {
		snake.waitForRefresh = false;

		// snake.advance();
		isCollisions() && gameOver(); // Game-over en cas de collision.

		snake.isEating(apple) && scoreThatApple(); // Si le serpent mange une pomme.
		getScore(); // Mise à jour de l'affichage des scores

		context.clearRect(0, 0, canvas.width, canvas.height);
		apple.draw(gameAssets.gameArt);
		snake.draw(gameAssets.gameArt);

		if (snake.life) {
			setTimeout(requestAnimationFrame, gameState.gameLoopDelay, refreshCanvas);
		} else {
			animGameOver();
		}
	}
}

// Gestion de la mise en pause et relance après un game over :
export function pauseOrReload() {
	if (!snake.life) {
		// Si gameOver :
		reload(); // On relance
	} else if (!gameState.pause) {
		// Sinon on gère la mise en pause
		gameState.pause = true;
		drawGameState.pause(context);
	} else {
		gameState.pause = false;
		requestAnimationFrame(refreshCanvas);
	}
}

// Met à jour l'affichage des scores :
function getScore() {
	currentScoreElement.textContent = gameState.score.toString();
	bestScoreElement.textContent = gameState.bestScore.toString();
	try {
		localStorage.setItem("snakeBestScore", gameState.bestScore.toString());
	} catch (error) {
		console.log(error);
	}
}

// Gestion de l'affichage du menu de réglage :

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

export function getSetting(event) {
	event.stopPropagation();

	if (!gameState.pause && snake.life) {
		pauseOrReload();
	}
	getSnakePreview();
	const isSettingOpen = getComputedStyle(setting).display !== "none";
	console.log(setting, isSettingOpen);
	setting.style.display = isSettingOpen ? "none" : "block";
	canvas.style.display = isSettingOpen ? "block" : "none";
}

/*
    const headline = document.getElementById("title");
    headline.addEventListener("click", function () {
        // Met en plein écran
        document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
    })
*/

document.body.addEventListener("click", function (event) {
	if (event.target === mainElement || event.target === canvas || event.target === footerElement) {
		pauseOrReload();
	}

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
}

// Gestion du selecteur de style :
const styleSelector = document.getElementsByClassName("styleSelector");
for (const style of styleSelector) {
	style.addEventListener("click", selectingStyle);
}

const fieldsets = document.querySelectorAll("fieldset");
function selectingStyle(event) {
	const radius = `${canvasSetting.cellSize / 2 / gameSetting.resolution}px`;

	switch (event.currentTarget.id) {
		case "classicSelector":
			gameSetting.selectedGameArt = "classic";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			for (const fieldset of fieldsets) fieldset.style.borderRadius = "0";
			break;

		case "fullSelector":
			gameSetting.selectedGameArt = "full";
			canvas.style.borderRadius = "0";
			setting.style.borderRadius = "0";
			for (const fieldset of fieldsets) fieldset.style.borderRadius = "0";

			break;

		case "roundedSelector":
			gameSetting.selectedGameArt = "rounded";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = "";
			for (const fieldset of fieldsets) fieldset.style.borderRadius = "";
			break;

		case "bigHeadSelector":
			gameSetting.selectedGameArt = "bigHead";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = "";
			for (const fieldset of fieldsets) fieldset.style.borderRadius = "";
			break;

		case "evilSelector":
		default:
			gameSetting.selectedGameArt = "evil";
			canvas.style.borderRadius = radius;
			setting.style.borderRadius = "";
			for (const fieldset of fieldsets) fieldset.style.borderRadius = "";
			break;
	}

	// Mise à jour du preview du snake avec le nouveau style :
	getSnakePreview();

	// Met à jour du canvas du jeu pour afficher le nouveau mode :
	gameAssets.gameArt = new GameArt(gameSetting.selectedGameArt, context, canvasSetting.cellSize);
	context.clearRect(0, 0, canvas.width, canvas.height);
	apple.draw(gameAssets.gameArt);
	snake.draw(gameAssets.gameArt);
	drawGameState.pause(context);
}
