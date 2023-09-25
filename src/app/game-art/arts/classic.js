import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";

export const classic = (context, cellSize) => {
	const squareCellWithGap = coor => {
		const gap = (cellSize * 20) / 100;
		context.rect(coor.x + gap / 2, coor.y + gap / 2, cellSize - gap, cellSize - gap);
	};
	const snake = {};
	snake.head = snake.body = snake.turn = snake.tail = squareCellWithGap;

	setGlobalArtStyle();
	return {
		snake,
		apple: squareCellWithGap,
	};
};

function setGlobalArtStyle() {
	const { canvas } = appElements;
	const { setting, fieldsets } = settingElements;

	canvas.style.borderRadius = "0";
	setting.style.borderRadius = "0";
	for (const fieldset of fieldsets) fieldset.style.borderRadius = "0";
}
