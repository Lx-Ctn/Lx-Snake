import "./styles/styles.scss";
import COLORS from "./app/game-art/colors.js";
import { Apple } from "./app/Apple";
import { Snake } from "./app/Snake.js";
import { GameArt } from "./app/game-art/GameArt.js";
import { gameSetting } from "./app/gameSetting";
import { drawGameState } from "./app/game-art/drawGameState";
import { handleControls } from "./app/handleControls";
import { handleGameOptions } from "./app/handleGameOptions";
import { handleResponsive } from "./app/handleResponsive";

// Idées à implémenter pour faire évoluer le jeu :
// - Fullscreen
// - En cas d'enchainement rapide de 2 directions, pour tourner vite, la syncronisation est difficile avec le rythme du jeu -> enregistrer la prochaine puis la dessiner au prochain tick.
// - Ajouter une fonction qui met en pause automatiquement en pause sans action du joueur pedant un certain temps ou s'il change d'onglet, etc -> performance / économie
// - Ajouter un vrai menu différentes catégories ?
// - Réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grille avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, récompenses

/** Get all HTML elements of the game */
export const appElements = {
	headerElement: document.getElementById("header"),
	mainElement: document.getElementById("main"),
	footerElement: document.getElementById("footer"),
	footerLinkElement: document.querySelector(".author-link"),
	/** @type HTMLCanvasElement */ canvas: document.querySelector("#mainGame"),
	currentScore: document.getElementById("currentScore"),
	bestScore: document.getElementById("bestScore"),
};

/** All game states in a object to keep live update of the values (passed by ref)  */
export const gameState = {
	/** Time between frames : shorter increase game speed */
	gameLoopDelay: gameSetting.initialSpeed,
	/** Current pause state */
	pause: false,
	/** Update with the "walls" gameplay if the collide with the canvas limits */
	isBorderCollision: false,
	/** Current score state */
	currentScore: 0,
	/** Last saved best score */
	bestScore: getLastBestScore(),
};

/** Create the assets of the game  */
function getGameAssets() {
	const context = appElements.canvas.getContext("2d");
	return {
		/** Context of the main game canvas */
		context,
		/** Contain all drawing instructions to display the selected game Art on the canvas */
		gameArt: new GameArt(gameSetting.selectedGameArt, context, gameSetting.canvas.cellSize),
		/** Main snake object to be controled by the user */
		snake: new Snake(gameSetting.initialSnakeBody),
		/** Main target object to be eaten by the snake */
		apple: new Apple(gameSetting.initialAppleCoor),
	};
}
export const gameAssets = getGameAssets();

init();

/** First lauch set-up */
function init() {
	appElements.canvas.width = gameSetting.canvas.width;
	appElements.canvas.height = gameSetting.canvas.height;

	handleResponsive();
	window.addEventListener("resize", handleResponsive);

	updateScore(); // From init to get bestScore from localStorage
	handleControls();
	handleGameOptions();

	drawGameState.background(gameAssets.context);
	drawGameState.letsGo(gameAssets.context);
	setTimeout(requestAnimationFrame, 1000, refreshCanvas);
}

/** Main game loop */
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

/** Draw the game asset on the canvas base on selected game Art
 * @param {string} [mainColor=null] - To applied a new main color (for the snake) - CSS color string .
 */
export function drawGameFrame(mainColor = null) {
	const { snake, apple, gameArt, context } = gameAssets;
	drawGameState.background(context);
	if (mainColor) gameArt.color = mainColor;
	apple.draw(gameArt);
	snake.draw(gameArt);
}

/** Update nextPosition coordonates or isBorderCollision base on current gamePlay.
 * @param {{x: number, y: number}} nextPosition - Coordinate of the next position (head).
 */
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

/** Mutate the coor parameter with the opposite position on the axis when reach canvas limits
 * @param {({x: number, y: number})} coor - Coordinates to mirror.
 */
function mirroringPosition(coor) {
	const { maxCellsInWidth, maxCellsInHeight } = gameSetting.canvas;
	if (coor.x < 0) coor.x = maxCellsInWidth - 1;
	if (coor.x > maxCellsInWidth - 1) coor.x = 0;
	if (coor.y < 0) coor.y = maxCellsInHeight - 1;
	if (coor.y > maxCellsInHeight - 1) coor.y = 0;
}

/** Check if the coordinates are in still in the canvas limits : Update gameState.isBorderCollision
 * @param {({x: number, y: number})} coor - Coordinates to check for collision.
 */
function isBorderCollision(coor) {
	const { maxCellsInWidth, maxCellsInHeight } = gameSetting.canvas;
	gameState.isBorderCollision =
		coor.x < 0 || coor.x > maxCellsInWidth - 1 || coor.y < 0 || coor.y > maxCellsInHeight - 1;
}

/** Check for all possible collisions  */
function isCollisions() {
	return gameState.isBorderCollision || gameAssets.snake.isAutoCollision();
}

const { animGameOver, stopAnimGameOver } = drawGameState.gameOver(gameAssets.context);

/** Stop the game & launch game-over animation */
function gameOver() {
	gameAssets.snake.life = false;
	animGameOver();
}

/** When snake eat a apple */
function scoreThatApple() {
	gameState.currentScore++;
	updateScore();
	speedUpTheGame();
	getNewApple();
}

/** Reduce the delay between frames, until maxSpeed */
function speedUpTheGame() {
	const minGameLoopDelay = gameSetting.maxSpeed;
	gameState.gameLoopDelay > minGameLoopDelay
		? (gameState.gameLoopDelay -= gameSetting.acceleration)
		: (gameState.gameLoopDelay = minGameLoopDelay);
}

/** Display the apple at new random coordinates */
function getNewApple() {
	const { snake, apple } = gameAssets;
	do apple.setNewPosition(getRandomCoordinate());
	while (apple.isOnSnake(snake));
}
/** Set random new coordinates */
function getRandomCoordinate() {
	const randomX = Math.floor(Math.random() * gameSetting.canvas.maxCellsInWidth);
	const randomY = Math.floor(Math.random() * gameSetting.canvas.maxCellsInHeight);
	return { x: randomX, y: randomY };
}
/*



*/ // Handle pause & reload :

/** Handle pause or reload after game over */
export function pauseOrReload() {
	gameAssets.snake.life ? togglePause() : reload();
}

/** Handle pause state */
function togglePause() {
	if (!gameState.pause) {
		gameState.pause = true;
		drawGameState.pause(gameAssets.context);
	} else {
		gameState.pause = false;
		requestAnimationFrame(refreshCanvas);
	}
}

/** Reset game after game-over */
function reload() {
	stopAnimGameOver();
	gameAssets.gameArt.color = COLORS.green;
	gameAssets.snake.rebornWith(gameSetting.initialSnakeBody);

	gameState.gameLoopDelay = gameSetting.initialSpeed;
	gameState.isBorderCollision = false;
	gameState.currentScore = 0;

	updateScore();

	requestAnimationFrame(refreshCanvas);
}
/*



*/ // Handle scores :

/** Get user best score (localStorage) */
function getLastBestScore() {
	return +localStorage.getItem("snakeBestScore"); // if fail : +null === 0
}

/** Update score display elements & save best score (localStorage) */
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
