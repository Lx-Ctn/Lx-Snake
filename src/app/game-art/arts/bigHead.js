import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";
import { gameSetting } from "../../gameSetting";
import COLORS from "../colors";

/** Return the instruction to draw on the canvas for each type of cell.
 * @param {CanvasRenderingContext2D} context - 2d context of the canvas.
 * @param {number} cellSize - Size of the grid division on the canvas.
 */
export const bigHead = (context, cellSize) => {
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
				const headScale = 1.2; // Echelle : it's a BIG head !
				const headXOffset = (cellSize * headScale) / 4; // Décalage : la tête dépasse en arrière
				const headLength = 1.4; // Longeur de la tête en avant

				context.arc(
					coor.x + radius - headXOffset,
					coor.y + radius,
					headScale * radius,
					Math.PI * 0.5,
					Math.PI * 1.5
				);
				context.ellipse(
					coor.x + radius - headXOffset,
					coor.y + radius,
					headScale * radius * headLength,
					headScale * radius,
					0,
					Math.PI * 1.5,
					Math.PI * 0.5
				);
				context.ellipse(
					coor.x + radius - headLength / headScale,
					coor.y + radius,
					headScale * radius * headLength,
					radius * 0.9,
					0,
					Math.PI * 1.5,
					Math.PI * 0.5
				);
				context.fill();

				// Eyes :
				context.beginPath();
				context.fillStyle = COLORS.red;
				const eyeRadius = radius / headScale / 2.6;
				const eyeYOffset = radius / 1.7;
				context.arc(coor.x + radius, coor.y + eyeYOffset, eyeRadius, Math.PI * 1.15, Math.PI * 2.15);
				context.fill();
				context.beginPath();
				context.arc(
					coor.x + radius,
					coor.y + cellSize - eyeYOffset,
					eyeRadius,
					Math.PI * -0.15,
					Math.PI * 0.85
				);
				context.fill();
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
