import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";

export const full = (context, cellSize) => {
	const fullSquareCell = coor => {
		context.rect(coor.x, coor.y, cellSize, cellSize);
	};
	const snake = {};
	snake.head = snake.body = snake.turn = snake.tail = fullSquareCell;

	setGlobalArtStyle();
	return {
		snake,
		apple: fullSquareCell,
	};
};

function setGlobalArtStyle() {
	const { canvas } = appElements;
	const { setting, fieldsets } = settingElements;

	canvas.style.borderRadius = "0";
	setting.style.borderRadius = "0";
	for (const fieldset of fieldsets) fieldset.style.borderRadius = "0";
}
