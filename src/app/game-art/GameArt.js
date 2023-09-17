import COLORS from "../Colors.js";
import { ARTS } from "./arts";

const snakeColor = COLORS.green;
const appleColor = COLORS.red;

export class GameArt {
	constructor(gameArtName, context, cellSize) {
		this.context = context;
		this.cellSize = cellSize;
		this.color = snakeColor;

		const selectedGameArt = ARTS[gameArtName];
		const gameArt = selectedGameArt(context, cellSize);

		this.snakeArt = gameArt.snake;
		this.appleArt = gameArt.apple;
	}

	set snakeArt(snakeArt) {
		const drawSnakeCell = (snakeCell, drawPosition, turn) => {
			const coor = { x: snakeCell.x * this.cellSize, y: snakeCell.y * this.cellSize };
			this.beginDraw(coor, snakeCell.direction);
			drawPosition(coor, turn);
			this.closeDraw();
		};
		this.drawSnake = {
			head: snakeCell => drawSnakeCell(snakeCell, snakeArt.head),
			body: snakeCell => drawSnakeCell(snakeCell, snakeArt.body),
			turn: (snakeCell, turn) => drawSnakeCell(snakeCell, snakeArt.turn, turn),
			tail: snakeCell => drawSnakeCell(snakeCell, snakeArt.tail),
		};
	}

	set appleArt(appleArt) {
		this.drawApple = appleCoor => {
			const coor = { x: appleCoor.x * this.cellSize, y: appleCoor.y * this.cellSize };
			this.color = appleColor;
			this.beginDraw(coor);
			appleArt(coor);
			this.closeDraw();
			this.color = snakeColor;
		};
	}

	// Initialise le dessin en fonction de la direction de la cellule :
	beginDraw(coor, direction) {
		const radius = this.cellSize / 2;
		this.context.save();
		this.context.fillStyle = this.color;
		this.context.beginPath();

		if (direction) {
			this.context.translate(coor.x + radius, coor.y + radius); // On déplace le canvas au niveau de notre centre de rotation
			this.context.rotate(getRotationAngle[direction]);
			this.context.translate(-coor.x - radius, -coor.y - radius); // On remet le canvas en place
		}
	}

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
