import COLORS from "./colors.js";
import { ARTS } from "./arts";

const snakeColor = COLORS.green;
const appleColor = COLORS.red;

/** Define the game art style to draw on the canvas */
export class GameArt {
	/** Define the game art style to draw on the canvas.
	 * @param {string} gameArtName - The name of the selected art to draw.
	 * @param {CanvasRenderingContext2D} context - The 2D context of the canvas.
	 * @param {number} cellSize - The size of 1 division of the canvas.
	 */
	constructor(gameArtName, context, cellSize) {
		this.context = context;
		this.cellSize = cellSize;
		this.color = snakeColor;

		const selectedGameArt = ARTS[gameArtName];
		/** @type {ReturnType<import('./arts/rounded.js').rounded>} */
		const gameArt = selectedGameArt(context, cellSize);

		this.snakeArt = gameArt.snake;
		this.appleArt = gameArt.apple;
	}

	set snakeArt(snakeArt) {
		/** @typedef {import('../SnakeCell.js').SnakeCell} SnakeCell */

		/** Steps of each cell drawing.
		 * @param {SnakeCell} snakeCell - Data of the cell.
		 * @param {() => void} drawPosition - Instructions to draw the cell art.
		 * @param {("left"|"right")} [turn] - Direction if the cell is turning.
		 */
		const drawSnakeCell = (snakeCell, drawPosition, turn) => {
			const coor = { x: snakeCell.x * this.cellSize, y: snakeCell.y * this.cellSize };
			this.beginDraw(coor, snakeCell.direction);
			drawPosition(coor, turn);
			this.closeDraw();
		};
		this.drawSnake = {
			/** Instruction to draw a head cell type on the canvas with the selected game art style.
			 * @param {SnakeCell} snakeCell - Data of the cell.
			 */
			head: snakeCell => drawSnakeCell(snakeCell, snakeArt.head),

			/** Instruction to draw a body cell type on the canvas with the selected game art style.
			 * @param {SnakeCell} snakeCell - Data of the cell.
			 */
			body: snakeCell => drawSnakeCell(snakeCell, snakeArt.body),

			/** Instruction to draw a turning cell type on the canvas with the selected game art style.
			 * @param {SnakeCell} snakeCell - Data of the cell.
			 * @param {("left"|"right")} turn - Direction of the turn.
			 */
			turn: (snakeCell, turn) => drawSnakeCell(snakeCell, snakeArt.turn, turn),

			/** Instruction to draw a tail cell type on the canvas with the selected game art style.
			 * @param {SnakeCell} snakeCell - Data of the cell.
			 */
			tail: snakeCell => drawSnakeCell(snakeCell, snakeArt.tail),
		};
	}

	set appleArt(appleArt) {
		/** Instruction to draw the apple on the canvas with the selected game art style.
		 * @param {{x: number, y: number}} appleCoor - Coordinate of the apple.
		 */
		this.drawApple = appleCoor => {
			const coor = { x: appleCoor.x * this.cellSize, y: appleCoor.y * this.cellSize };
			const currentColor = this.color; // Main color is for the snake
			this.color = appleColor;
			this.beginDraw(coor);
			appleArt(coor);
			this.closeDraw();
			this.color = currentColor;
		};
	}

	/** Initialize the drawing according to the direction of the cell.
	 * @param {{x: number; y: number}} coor - The coordinate of the cell on the canvas.
	 * @param {("right"|"left"|"up"|"down")} direction - The direction of the cell.
	 */
	beginDraw(coor, direction) {
		const radius = this.cellSize / 2;
		this.context.save();
		this.context.fillStyle = this.color;
		this.context.beginPath();

		if (direction) {
			this.context.translate(coor.x + radius, coor.y + radius); // Moving the canvas at the center of rotation.
			this.context.rotate(getRotationAngle[direction]);
			this.context.translate(-coor.x - radius, -coor.y - radius); // Moving the canvas back.
		}
	}

	/** Draw and restore the canvas context */
	closeDraw() {
		this.context.fill();
		this.context.restore();
	}
}

const getRotationAngle = {
	right: 0,
	down: Math.PI * 0.5,
	left: Math.PI,
	up: Math.PI * 1.5,
};
