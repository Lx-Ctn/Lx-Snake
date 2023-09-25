import { appElements, gameState, gameAssets, pauseOrReload } from "..";
import { gameSetting } from "./gameSetting";
import { Snake } from "./Snake";
import { GameArt } from "./game-art/GameArt";
import { drawGameState } from "./game-art/drawGameState";
import COLORS from "./game-art/colors";

export const settingElements = {
	settingIcon: document.getElementById("settingIcon"),
	exitIcon: document.getElementById("exitSetting"),
	setting: document.getElementById("setting"),
	/** @type HTMLCanvasElement */ snakePreviewCanvas: document.querySelector("#snakePreview"),

	gamePlaySelector: document.getElementsByClassName("gamePlaySelector"),
	styleSelector: document.getElementsByClassName("styleSelector"),
	fieldsets: document.querySelectorAll("fieldset"),
};

let snakePreviewCtx;
const previewSetting = gameSetting.preview;
const snakePreview = new Snake(previewSetting.snakePreviewBody);

export function handleGameOptions() {
	snakePreviewCtx = initPreviewCanvas(previewSetting);

	settingElements.settingIcon.addEventListener("click", toggleSetting);
	settingElements.exitIcon.addEventListener("click", toggleSetting);
	window.addEventListener("click", closeSettingIfClickOutside);

	for (const gamePlay of settingElements.gamePlaySelector) {
		gamePlay.addEventListener("click", selectingGamePlay);
	}
	for (const style of settingElements.styleSelector) {
		style.addEventListener("click", selectingStyle);
	}
}

// Handle option panel display :

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
	const { setting } = settingElements;

	if (!gameState.pause && gameAssets.snake.life) {
		pauseOrReload();
	}
	getSnakePreview();

	const isSettingPanelOpen = isSettingOpen();
	setting.style.display = isSettingPanelOpen ? "none" : "block";
	appElements.canvas.style.display = isSettingPanelOpen ? "block" : "none";
}

function closeSettingIfClickOutside(event) {
	const { setting } = settingElements;
	const isClickOutsideSetting = !setting.contains(event.target);

	isSettingOpen() && isClickOutsideSetting && toggleSetting(event);
}

// Gestion du selecteur de mode de jeu :
function selectingGamePlay(event) {
	const { canvas } = appElements;
	switch (event.currentTarget.id) {
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

function selectingStyle(event) {
	const { canvas } = appElements;
	const { setting, fieldsets } = settingElements;
	const radius = `${gameSetting.canvas.cellSize / 2 / gameSetting.resolution}px`;

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
	gameAssets.gameArt = new GameArt(gameSetting.selectedGameArt, gameAssets.context, gameSetting.canvas.cellSize);
	gameAssets.context.clearRect(0, 0, canvas.width, canvas.height);
	gameAssets.apple.draw(gameAssets.gameArt);
	gameAssets.snake.draw(gameAssets.gameArt);
	drawGameState.pause(gameAssets.context);
}
