import { appElements, gameState, gameAssets, pauseOrReload, drawGameFrame } from "..";
import { gameSetting } from "./gameSetting";
import { Snake } from "./Snake";
import { GameArt } from "./game-art/GameArt";
import { drawGameState } from "./game-art/drawGameState";
import COLORS from "./game-art/colors";

/** Get all option panel elements */
export const settingElements = {
	settingIcon: document.getElementById("setting-icon"),
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

/** Handle option panel display */
export function handleGameOptions() {
	snakePreviewCtx = initPreviewCanvas(previewSetting);

	settingElements.settingIcon.addEventListener("click", toggleSetting);
	settingElements.exitIcon.addEventListener("click", toggleSetting);
	document.body.addEventListener("click", closeSettingIfClickOutside);

	for (const gamePlay of settingElements.gamePlaySelector) {
		gamePlay.addEventListener("click", selectingGamePlay);
	}
	for (const style of settingElements.gameArtSelector) {
		style.addEventListener("click", selectingGameArt);
	}
}

/**
 * Set the canvas configuration for the preview of the snake art style.
 * @param {{height:number, width:number}} previewSetting  - Initial setting for the preview canvas
 * @returns {CanvasRenderingContext2D} The 2D context for the preview canvas.
 */
function initPreviewCanvas(previewSetting) {
	const { snakePreviewCanvas } = settingElements;
	snakePreviewCanvas.width = previewSetting.width;
	snakePreviewCanvas.height = previewSetting.height;
	snakePreviewCanvas.style.maxWidth = previewSetting.width / gameSetting.resolution + "px";

	const snakePreviewCtx = snakePreviewCanvas.getContext("2d");
	return snakePreviewCtx;
}

/** Draw the preview of the current selected art style in the canvas */
function getSnakePreview() {
	const { snakePreviewCanvas } = settingElements;
	snakePreviewCtx.clearRect(0, 0, snakePreviewCanvas.width, snakePreviewCanvas.height);

	const previewGameArt = new GameArt(gameSetting.selectedGameArt, snakePreviewCtx, previewSetting.cellSize);
	snakePreview.draw(previewGameArt);
}

/** Check if the setting panel is currently open */
export function isSettingOpen() {
	return getComputedStyle(settingElements.setting).display !== "none";
}

/** Open/close the setting panel */
export function toggleSetting(event) {
	event.stopPropagation(); // Otherwise trigger window listener for click outside the setting panel and close immediately after opening

	if (!gameState.pause && gameAssets.snake.life) {
		pauseOrReload();
	}
	getSnakePreview();

	const isSettingPanelOpen = isSettingOpen();
	settingElements.setting.style.display = isSettingPanelOpen ? "none" : "block";
	settingElements.settingIcon.dataset.settings = isSettingPanelOpen ? "off" : "on";
	settingElements.settingIcon.title = isSettingPanelOpen ? "Go to settings" : "Exit settings";
	appElements.canvas.style.display = isSettingPanelOpen ? "block" : "none";
}

/** Close the setting panel when we click outside of it */
function closeSettingIfClickOutside(event) {
	const isClickOutsideSetting = !settingElements.setting.contains(event.target);
	isSettingOpen() && isClickOutsideSetting && toggleSetting(event);
}

/** Handle gameplay selection */
function selectingGamePlay(event) {
	gameSetting.selectedGamePlay = event.currentTarget.dataset.gamePlay;
	appElements.canvas.style.border = gameSetting.selectedGamePlay === "walls" ? "3px solid " + COLORS.red : "none";
}

/** Handle game art selection */
function selectingGameArt(event) {
	gameSetting.selectedGameArt = event.currentTarget.dataset.gameArt;

	// Update preview of the snake with new art :
	getSnakePreview();

	// Update main game with new art :
	gameAssets.gameArt = new GameArt(gameSetting.selectedGameArt, gameAssets.context, gameSetting.canvas.cellSize);
	drawGameFrame();
	drawGameState.pause(gameAssets.context);
}
