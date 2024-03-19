import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";

/** Return the instruction to draw on the canvas for each type of cell.
 * @param {CanvasRenderingContext2D} context - 2d context of the canvas.
 * @param {number} cellSize - Size of the grid division on the canvas.
 */
export const full = (context, cellSize) => {
	/** Set the instruction to draw the cell on the canvas.
	 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
	 */
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

/** Set some CSS styles in addition to the canvas art */
function setGlobalArtStyle() {
	const { canvas } = appElements;
	const { setting, fieldsets } = settingElements;

	canvas.style.borderRadius = "0";
	setting.style.borderRadius = "0";
	for (const fieldset of fieldsets) fieldset.style.borderRadius = "0";
}
