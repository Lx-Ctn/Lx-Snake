import "./styles/styles.scss";
import COLORS from "./app/game-art/colors.js";
import { Apple } from "./app/Apple";
import { Snake } from "./app/Snake.js";
import { GameArt } from "./app/game-art/GameArt.js";
import { gameSetting } from "./app/gameSetting";
import { drawGameState } from "./app/game-art/drawGameState";
import { handleControls } from "./app/handleControls";
import { handleGameOptions } from "./app/handleGameOptions";

// Idées à implémenter pour faire évoluer le jeu :
// - ajouter un vrai menu différentes catégories ?
// - réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grilles avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, recompense

export const appElements = {
	mainElement: document.getElementById("main"),
	footerElement: document.getElementById("footer"),
	/** @type HTMLCanvasElement */ canvas: document.querySelector("#mainGame"),
	currentScore: document.getElementById("currentScore"),
	bestScore: document.getElementById("bestScore"),
};

export const gameState = {
	gameLoopDelay: gameSetting.initialSpeed, // Time between frames : shorter increase game speed,
	pause: false,
	isBorderCollision: false,
	currentScore: 0,
	bestScore: getLastBestScore(),
};

function getGameAssets() {
	const context = appElements.canvas.getContext("2d");
	return {
		context,
		gameArt: new GameArt(gameSetting.selectedGameArt, context, gameSetting.canvas.cellSize),
		snake: new Snake(gameSetting.initialSnakeBody),
		apple: new Apple(gameSetting.initialAppleCoor),
	};
}
export const gameAssets = getGameAssets();

init();

function init() {
	const { width, height, cellSize } = gameSetting.canvas;
	appElements.canvas.width = width;
	appElements.canvas.height = height;

	const radius = `${cellSize / 2 / gameSetting.resolution}px`;
	appElements.canvas.style.borderRadius = radius;

	setCanvasSize();
	window.addEventListener("resize", setCanvasSize);

	updateScore(); // from init to get bestScore from localStorage
	handleControls();
	handleGameOptions();

	drawGameState.backgroud(gameAssets.context);
	drawGameState.letsGo(gameAssets.context);
	setTimeout(requestAnimationFrame, 1000, refreshCanvas);
}

function setCanvasSize() {
	const { canvas } = appElements;
	const { width, height } = gameSetting.canvas;
	const resolution = gameSetting.resolution;
	const headerHeight = getComputedStyle(document.getElementById("header")).minHeight;
	const bottomMargin = "0.8em";
	const ratio = width / height;

	canvas.style.maxWidth = `min(${width / resolution}px, calc((100dvh - ${headerHeight}) * ${ratio}))`;
	canvas.style.maxHeight = `min(${height / resolution}px, calc(100dvh - ${headerHeight} - ${bottomMargin}))`;
}

// Main game loop :
function refreshCanvas() {
	if (!gameState.pause) {
		const { snake, apple } = gameAssets;
		snake.waitForRefresh = false;

		const nextHeadPosition = snake.advance({ test: true }); // Test: get next cell before apply to snake body to test collision
		handleBorderBehavior(nextHeadPosition); // Will update nextPosition coordonates or isBorderCollision base on current gamePlay

		if (isCollisions()) {
			gameOver();
			return;
		}

		snake.advance({ nextCell: nextHeadPosition });
		drawGameFrame();
		snake.isEating(apple) && scoreThatApple();

		setTimeout(requestAnimationFrame, gameState.gameLoopDelay, refreshCanvas);
	}
}

export function drawGameFrame(mainColor = null) {
	const { snake, apple, gameArt, context } = gameAssets;
	drawGameState.backgroud(context);
	if (mainColor) gameArt.color = mainColor;
	apple.draw(gameArt);
	snake.draw(gameArt);
}

function handleBorderBehavior(nextPosition) {
	switch (gameSetting.selectedGamePlay) {
		case "walls":
			isBorderCollision(nextPosition);
			break;
		case "mirror":
		default:
			mirroringPosition(nextPosition);
	}
}

function mirroringPosition(coor) {
	const { maxCellsInWidth, maxCellsInHeight } = gameSetting.canvas;
	if (coor.x < 0) coor.x = maxCellsInWidth - 1;
	if (coor.x > maxCellsInWidth - 1) coor.x = 0;
	if (coor.y < 0) coor.y = maxCellsInHeight - 1;
	if (coor.y > maxCellsInHeight - 1) coor.y = 0;
}

function isBorderCollision(coor) {
	const { maxCellsInWidth, maxCellsInHeight } = gameSetting.canvas;
	gameState.isBorderCollision =
		coor.x < 0 || coor.x > maxCellsInWidth - 1 || coor.y < 0 || coor.y > maxCellsInHeight - 1;
}

function isCollisions() {
	return gameState.isBorderCollision || gameAssets.snake.isAutoCollision();
}

const { animGameOver, stopAnimGameOver } = drawGameState.gameOver(gameAssets.context);

function gameOver() {
	gameAssets.snake.life = false;
	animGameOver();
}

// When snake eat a apple :
function scoreThatApple() {
	gameState.currentScore++;
	updateScore();
	speedUpTheGame();
	getNewApple();
}

function speedUpTheGame() {
	const minGameLoopDelay = gameSetting.maxSpeed;
	gameState.gameLoopDelay > minGameLoopDelay
		? (gameState.gameLoopDelay -= gameSetting.acceleration)
		: (gameState.gameLoopDelay = minGameLoopDelay);
}

function getNewApple() {
	const { snake, apple } = gameAssets;
	do {
		const randomX = Math.floor(Math.random() * gameSetting.canvas.maxCellsInWidth);
		const randomY = Math.floor(Math.random() * gameSetting.canvas.maxCellsInHeight);
		apple.setNewPosition({ x: randomX, y: randomY });
	} while (apple.isOnSnake(snake));
}

// handle pause or reload after game over :
export function pauseOrReload() {
	gameAssets.snake.life ? togglePause() : reload();
}

function togglePause() {
	if (!gameState.pause) {
		gameState.pause = true;
		drawGameState.pause(gameAssets.context);
	} else {
		gameState.pause = false;
		requestAnimationFrame(refreshCanvas);
	}
}

// Reset game after game-over :
function reload() {
	stopAnimGameOver();

	gameAssets.gameArt.color = COLORS.green;
	gameAssets.snake.rebornWith(gameSetting.initialSnakeBody);

	gameState.gameLoopDelay = gameSetting.initialSpeed;
	gameState.currentScore = 0;
	updateScore();

	requestAnimationFrame(refreshCanvas);
}

// Handle scores :
function getLastBestScore() {
	return +localStorage.getItem("snakeBestScore"); // if fail : +null === 0
}

function updateScore() {
	if (gameState.currentScore > gameState.bestScore) {
		gameState.bestScore = gameState.currentScore;
		try {
			localStorage.setItem("snakeBestScore", gameState.bestScore.toString());
		} catch (error) {
			console.error(error);
		}
	}
	appElements.currentScore.textContent = gameState.currentScore;
	appElements.bestScore.textContent = gameState.bestScore;
}
