import { appElements } from "../../..";
import { settingElements } from "../../handleGameOptions";
import { gameSetting } from "../../gameSetting";
import COLORS from "../colors";

/** Return the instruction to draw on the canvas for each type of cell.
 * @param {CanvasRenderingContext2D} context - 2d context of the canvas.
 * @param {number} cellSize - Size of the grid division on the canvas.
 */
export const evil = (context, cellSize) => {
	const radius = cellSize / 2;
	const scale = 1.2;
	const bodyScale = 0.8;
	const xOffset = (cellSize * scale) / 4; // Décalage : la tête dépasse en arrière

	/** Set the instruction to draw the cell on the canvas.
	 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
	 */
	const fullCircle = coor => context.arc(coor.x + radius, coor.y + radius, radius, 0, Math.PI * 2); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.,
	const fallenSquare = (coor, xOffset = 0, bodyScale = 1) => {
		const diagonal = scale * cellSize * Math.SQRT2;
		const startX = coor.x + xOffset - (diagonal - cellSize) / 2;
		const startY = coor.y - (diagonal * bodyScale - cellSize) / 2;
		context.moveTo(startX, coor.y + radius);
		context.lineTo(coor.x + xOffset + radius, startY);
		context.lineTo(startX + diagonal, coor.y + radius);
		context.lineTo(coor.x + xOffset + radius, startY + diagonal * bodyScale);
		context.closePath();
	};

	setGlobalArtStyle();
	return {
		snake: {
			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			head: coor => {
				fallenSquare(coor, -xOffset);
				context.arc(coor.x + radius * 0.9 * scale, coor.y + radius, radius / scale, 0, Math.PI * 2);
				context.fill();

				// Eyes :
				context.beginPath();
				context.fillStyle = COLORS.red;
				const eyeRadius = radius / scale / 2.6;
				const eyeYOffset = radius / 1.7;
				context.arc(coor.x + radius / scale, coor.y + eyeYOffset, eyeRadius, Math.PI * 1.15, Math.PI * 2.15);
				context.fill();
				context.beginPath();
				context.arc(
					coor.x + radius / scale,
					coor.y + cellSize - eyeYOffset,
					eyeRadius,
					Math.PI * -0.15,
					Math.PI * 0.85
				);
				context.fill();

				// Tongue :
				context.fillStyle = COLORS.red;
				const tongueLength = cellSize / 2;
				const tongueWidth = cellSize / 5;
				const tongueX = coor.x + cellSize - radius / 8;
				const tongueY = coor.y + radius - tongueWidth / 2;
				context.beginPath();
				context.moveTo(tongueX, tongueY + tongueWidth / 4);
				context.lineTo(tongueX + tongueLength / 2, tongueY + tongueWidth / 4);
				context.lineTo(tongueX + tongueLength, tongueY);
				context.lineTo(tongueX + tongueLength / 2, tongueY + tongueWidth / 2);
				context.lineTo(tongueX + tongueLength, tongueY + tongueWidth);
				context.lineTo(tongueX + tongueLength / 2, tongueY + tongueWidth - tongueWidth / 4);
				context.lineTo(tongueX, tongueY + tongueWidth - tongueWidth / 4);
				context.fill();
			},

			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			body: coor => {
				fallenSquare(coor, -xOffset, bodyScale);
				context.fillStyle = COLORS.green;
				context.fill();

				context.beginPath();
				fallenSquare(coor, xOffset, bodyScale * 0.8);
				context.fillStyle = COLORS.red;
				context.fill();
			},

			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 * @param {("left"|"right")} turn - The direction of the turn.
			 */
			turn: (coor, turn) => {
				const scale = 0.9;
				const startingAngle = { x: coor.x, y: coor.y + (turn === "right" ? cellSize : 0) };

				context.save();
				context.translate(
					startingAngle.x + Math.cos((3 / 4) * 0.5 * Math.PI) * radius,
					startingAngle.y + (turn === "right" ? -1 : 1) * Math.sin((3 / 4) * 0.5 * Math.PI) * radius
				);
				context.rotate(Math.PI * (turn === "right" ? 1 : -1) * 0.17);
				fallenSquare({ x: (-scale * cellSize) / 2, y: (-scale * cellSize) / 2 }, 0, bodyScale);
				context.fillStyle = COLORS.green;
				context.fill();
				context.restore();

				context.beginPath();
				context.translate(
					startingAngle.x + Math.cos((1 / 4) * 0.5 * Math.PI) * radius,
					startingAngle.y + (turn === "right" ? -1 : 1) * Math.sin((1 / 4) * 0.5 * Math.PI) * radius
				);
				context.rotate(Math.PI * (turn === "right" ? 1 : -1) * 0.33);
				fallenSquare({ x: (-scale * cellSize) / 2, y: (-scale * cellSize) / 2 }, 0, bodyScale * bodyScale);
				context.fillStyle = COLORS.red;
				context.fill();
			},

			/** Set the instruction to draw the cell on the canvas.
			 * @param {{x:number, y:number}} coor - The coordinate of the cell to draw.
			 */
			tail: coor => {
				context.arc(coor.x + radius * 1.5, coor.y + radius, radius, 0, Math.PI * 2);
				context.arc(coor.x + radius / 1.5, coor.y + radius, radius / 1.4, 0, Math.PI * 2);
				context.arc(coor.x, coor.y + radius, radius / 2, 0, Math.PI * 2);
				context.fillStyle = COLORS.green;
				context.fill();

				context.beginPath();
				context.moveTo(coor.x + cellSize, coor.y);
				context.lineTo(coor.x + radius / 3, coor.y + radius);
				context.lineTo(coor.x + cellSize, coor.y + cellSize);
				context.fillStyle = COLORS.red;
				context.fill();
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
