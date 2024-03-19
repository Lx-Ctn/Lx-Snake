import { appElements } from "..";
import { gameSetting } from "./gameSetting";

/** scale the canvas and some style depending on the window size */
export function handleResponsive() {
	setCanvasSize();
	setScaledRadius();
}

const BOTTOM_MARGIN = "0.8em";

function setCanvasSize() {
	const { canvas } = appElements;
	const { width, height } = gameSetting.canvas;
	const resolution = gameSetting.resolution;
	const headerHeight = `${appElements.headerElement.clientHeight}px`;
	const ratio = width / height;

	canvas.style.maxWidth = `min(${width / resolution}px, calc((100dvh - ${headerHeight}) * ${ratio}))`;
	canvas.style.maxHeight = `min(${height / resolution}px, calc(100dvh - ${headerHeight} - ${BOTTOM_MARGIN}))`;
}

function setScaledRadius() {
	const responsiveCellSize = appElements.canvas.clientWidth / gameSetting.canvas.maxCellsInWidth;
	const radius = `${responsiveCellSize / 2}px`;
	appElements.canvas.style.borderRadius = radius;
}
