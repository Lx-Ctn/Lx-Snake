import { appElements, gameState, gameAssets, pauseOrReload } from "..";
import { gameSetting } from "./gameSetting";
import { Snake } from "./Snake";
import { GameArt } from "./game-art/GameArt";
import { drawGameState } from "./game-art/drawGameState";
import COLORS from "./game-art/colors";

// Get all option panel elements :
export const settingElements = {
	settingIcon: document.getElementById("settingIcon"),
	exitIcon: document.getElementById("exitSetting"),
	setting: document.getElementById("setting"),
	/** @type HTMLCanvasElement */ snakePreviewCanvas: document.querySelector("#snakePreview"),

	gamePlaySelector: document.getElementsByClassName("gamePlaySelector"),
	gameArtSelector: document.getElementsByClassName("gameArtSelector"),
	fieldsets: document.querySelectorAll("fieldset"),
};

let snakePreviewCtx;
const previewSetting = gameSetting.preview;
const snakePreview = new Snake(previewSetting.snakePreviewBody);

// Handle option panel display :
export function handleGameOptions() {
	snakePreviewCtx = initPreviewCanvas(previewSetting);

	settingElements.settingIcon.addEventListener("click", toggleSetting);
	settingElements.exitIcon.addEventListener("click", toggleSetting);
	window.addEventListener("click", closeSettingIfClickOutside);

	for (const gamePlay of settingElements.gamePlaySelector) {
		gamePlay.addEventListener("click", selectingGamePlay);
	}
	for (const style of settingElements.gameArtSelector) {
		style.addEventListener("click", selectingGameArt);
	}
}

function initPreviewCanvas(previewSetting) {
	const { snakePreviewCanvas } = settingElements;
	snakePreviewCanvas.width = previewSetting.width;
	snakePreviewCanvas.height = previewSetting.height;
	snakePreviewCanvas.style.maxWidth = previewSetting.width / gameSetting.resolution + "px";

	const snakePreviewCtx = snakePreviewCanvas.getContext("2d");
	return snakePreviewCtx;
}

function getSnakePreview() {
	const { snakePreviewCanvas } = settingElements;
	snakePreviewCtx.clearRect(0, 0, snakePreviewCanvas.width, snakePreviewCanvas.height);

	const previewGameArt = new GameArt(gameSetting.selectedGameArt, snakePreviewCtx, previewSetting.cellSize);
	snakePreview.draw(previewGameArt);
}

export function isSettingOpen() {
	return getComputedStyle(settingElements.setting).display !== "none";
}

export function toggleSetting(event) {
	event.stopPropagation(); // otherwise trigger window listener for click outside the setting panel and close immediately

	if (!gameState.pause && gameAssets.snake.life) {
		pauseOrReload();
	}
	getSnakePreview();

	const isSettingPanelOpen = isSettingOpen();
	settingElements.setting.style.display = isSettingPanelOpen ? "none" : "block";
	appElements.canvas.style.display = isSettingPanelOpen ? "block" : "none";
}

function closeSettingIfClickOutside(event) {
	const isClickOutsideSetting = !settingElements.setting.contains(event.target);
	isSettingOpen() && isClickOutsideSetting && toggleSetting(event);
}

// Handle gameplay selection :
function selectingGamePlay(event) {
	gameSetting.selectedGamePlay = event.currentTarget.dataset.gamePlay;
	appElements.canvas.style.border = gameSetting.selectedGamePlay === "walls" ? "3px solid " + COLORS.red : "none";
}

// Handle game art selection :
function selectingGameArt(event) {
	gameSetting.selectedGameArt = event.currentTarget.dataset.gameArt;

	// Update preview of the snake with new art :
	getSnakePreview();

	// Update main game with new art :
	gameAssets.gameArt = new GameArt(gameSetting.selectedGameArt, gameAssets.context, gameSetting.canvas.cellSize);
	gameAssets.context.clearRect(0, 0, appElements.canvas.width, appElements.canvas.height);
	gameAssets.apple.draw(gameAssets.gameArt);
	gameAssets.snake.draw(gameAssets.gameArt);
	drawGameState.pause(gameAssets.context);
}
