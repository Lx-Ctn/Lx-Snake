import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";
import { gameSetting } from "../../gameSetting";

/** Return the instruction to draw on the canvas for each type of cell.
 * @param {CanvasRenderingContext2D} context - 2d context of the canvas.
 * @param {number} cellSize - Size of the grid division on the canvas.
 */
export const rounded = (context, cellSize) => {
	const radius = cellSize / 2;
	/** Set the instruction to draw the cell on the canvas.
	 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
	 */
	const fullCircle = coor => context.arc(coor.x + radius, coor.y + radius, radius, 0, Math.PI * 2); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.,

	setGlobalArtStyle();
	return {
		snake: {
			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			head: coor => {
				context.rect(coor.x, coor.y, radius, cellSize);
				fullCircle(coor);
			},
			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			body: coor => {
				context.fillRect(coor.x, coor.y, cellSize, cellSize); // (position x, position y, largeur, hauteur).
			},
			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 * @param {("left"|"right")} turn - The direction of the turn.
			 */
			turn: (coor, turn) => {
				context.rect(coor.x, coor.y, radius, cellSize);
				context.rect(coor.x, coor.y + (turn === "right" ? radius : 0), cellSize, radius);
				fullCircle(coor);
			},
			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			tail: coor => {
				context.rect(coor.x + radius, coor.y, radius, cellSize);
				fullCircle(coor);
			},
		},
		/** Set the instruction to draw the cell on the canvas.
		 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
		 */
		apple: fullCircle,
	};
};

/** Set some CSS styles in addition to the canvas art */
function setGlobalArtStyle() {
	const { canvas } = appElements;
	const { setting, fieldsets } = settingElements;
	const radius = `${gameSetting.canvas.cellSize / 2 / gameSetting.resolution}px`;

	canvas.style.borderRadius = radius;
	setting.style.borderRadius = "";
	for (const fieldset of fieldsets) fieldset.style.borderRadius = "";
}
