import COLORS from "../Colors.js";
import { ARTS } from "./arts";

export class GameArt {
	constructor(selectedGameArt, context, cellSize) {
		this.selectedGameArt = ARTS[selectedGameArt];
		this.context = context;
		this.x = null;
		this.y = null;
		this.cellSize = cellSize;

		this.snakeColor = COLORS.green;
		const appleColor = COLORS.red;

		const drawCell = (snakeCell, drawPosition, turn) => {
			this.coor = snakeCell;
			this.beginDraw(snakeCell.direction);
			drawPosition(this.coor, turn);
			this.closeDraw();
		};

		const snakeArt = this.selectedGameArt(context, cellSize).snake;
		this.drawHead = snakeCell => drawCell(snakeCell, snakeArt.head);
		this.drawBody = snakeCell => drawCell(snakeCell, snakeArt.body);
		this.drawTurn = (snakeCell, turn) => drawCell(snakeCell, snakeArt.turn, turn);
		this.drawTail = snakeCell => drawCell(snakeCell, snakeArt.tail);
	}

	set coor(coor) {
		this.x = coor.x * this.cellSize;
		this.y = coor.y * this.cellSize;
	}
	get coor() {
		return { x: this.x, y: this.y };
	}

	// Initialise le dessin en fonction de la direction de la cellule :
	beginDraw = function (direction) {
		const radius = this.cellSize / 2;
		this.context.save();
		this.context.fillStyle = this.snakeColor;
		this.context.beginPath();
		this.context.translate(this.x + radius, this.y + radius); // On déplace le canvas au niveau de notre centre de rotation
		this.context.rotate(getRotationAngle[direction]);
		this.context.translate(-this.x - radius, -this.y - radius); // On remet le canvas en place
	};

	closeDraw = function () {
		this.context.fill();
		this.context.restore();
	};
}

const getRotationAngle = {
	right: 0,
	down: Math.PI * 0.5,
	left: Math.PI,
	up: Math.PI * 1.5,
};
