import { SnakeCell } from "./SnakeCell.js";
/**
 * @typedef {{coor:{x:number,y:number},direction:("right"|"left"|"up"|"down")}} SnakeCellConstructor
 */

/**  Bulding the snake */
export class Snake {
	#nextDirection = "";
	#appleEaten = false;

	/**
	 * Bulding the snake
	 * @param {SnakeCellConstructor[]} body - The body of the snake.
	 */
	constructor(body) {
		this.life = true;
		this.waitForRefresh = false;
		this.body = body.map(cell => new SnakeCell(cell.coor, cell.direction));
		this.#nextDirection = this.head.direction;
	}

	/**
	 * Get the head cell of the snake.
	 * @returns {SnakeCell} The head cell.
	 */
	get head() {
		// Need a getter to keep it dynamic (else it's fixed when instantiated)
		return this.body[0];
	}

	/**
	 * Get the tail cell of the snake.
	 * @returns {SnakeCell} The tail cell.
	 */
	get tail() {
		// Same
		return this.body[this.body.length - 1];
	}

	/**
	 * @typedef {import('./game-art/GameArt.js').GameArt} GameArt
	 */

	/**
	 * Draw the snake
	 * @param {GameArt} gameArt - The visual art style of the snake.
	 */
	draw(gameArt) {
		// The tail retrieves the previous cell direction to anticipate turns :
		this.tail.direction = this.body[this.body.length - 2].direction;
		gameArt.drawSnake.tail(this.tail);

		for (let i = this.body.length - 2; i > 0; i--) {
			const cellDirection = this.body[i].direction;
			const nextCellDirection = this.body[i - 1].direction;

			if (nextCellDirection === cellDirection) {
				gameArt.drawSnake.body(this.body[i]);
			} else {
				let drawDirection;
				switch (cellDirection) {
					case "up":
						// nextCellDirection can't be "up" since nextCellDirection !== direction, neither "down" since constrained by setDirection() :
						drawDirection = nextCellDirection === "right" ? "right" : "left";
						break;
					case "right":
						drawDirection = nextCellDirection === "down" ? "right" : "left";
						break;
					case "down":
						drawDirection = nextCellDirection === "left" ? "right" : "left";
						break;
					case "left":
						drawDirection = nextCellDirection === "up" ? "right" : "left";
						break;
					default:
						throw new Error("Invalid direction");
				}
				gameArt.drawSnake.turn(this.body[i], drawDirection);
			}
		}

		gameArt.drawSnake.head(this.head); // Head is the last drawn to be seen on top, especialy in case of collision when it's became red.
	}

	/**
	 * Move the snake depending on the direction
	 * @param {Object} [params={test:false,nextCell:null}] - Named parameters to bring clarity.
	 * @param {boolean} [params.test=false] - If true, get the next move before drawing it to check for potential collision.
	 * @param {SnakeCell} [params.nextCell] - The next cell to go to.
	 * */
	advance({ test = false, nextCell } = { test: false, nextCell: null }) {
		if (!nextCell) {
			nextCell = new SnakeCell({ x: this.head.x, y: this.head.y }, this.#nextDirection);
			switch (this.#nextDirection) {
				case "right":
					nextCell.x += 1;
					break;
				case "left":
					nextCell.x -= 1;
					break;
				case "up":
					nextCell.y -= 1;
					break;
				case "down":
					nextCell.y += 1;
					break;
				default:
					throw new Error("Invalid direction");
			}
		}

		// Test: Get the next move before drawing it to check for potential collision
		if (test) return nextCell;

		this.body.unshift(nextCell);
		!this.#appleEaten && this.body.pop(); // If a apple is eaten, we keep the last cell to grow
	}

	/**
	 * Handle snake direction
	 * @param {("right"|"left"|"up"|"down")} newDirection - Set the direction for the next move.
	 * */
	setDirection(newDirection) {
		if (this.waitForRefresh) return;

		let allowedDirection;
		switch (this.#nextDirection) {
			case "right":
			case "left":
				allowedDirection = ["up", "down"];
				break;
			case "up":
			case "down":
				allowedDirection = ["right", "left"];
				break;
			default:
				throw new Error("Invalid direction");
		}
		if (allowedDirection.includes(newDirection)) {
			this.#nextDirection = newDirection;
			this.waitForRefresh = true; // Wait for the direction to be drawn before setting a new one.
		}
	}

	/**
	 * Detects a collision with its own body
	 * @returns {boolean} true if there is a collision.
	 */
	isAutoCollision() {
		const tail = this.body.slice(1);
		for (const cell of tail) {
			if (this.head.x === cell.x && this.head.y === cell.y) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Detects a collision with the apple
	 * @returns {boolean} true if the apple is eaten.
	 */
	isEating(apple) {
		if (this.head.x === apple.coor.x && this.head.y === apple.coor.y) {
			this.#appleEaten = true;
			return true;
		}
		this.#appleEaten = false;
		return false;
	}

	/**
	 * Reset the snake
	 * @param {SnakeCellConstructor[]} snakeStartBody
	 */
	rebornWith(snakeStartBody) {
		this.life = true;
		this.body = snakeStartBody.map(cell => new SnakeCell(cell.coor, cell.direction));
		this.#nextDirection = snakeStartBody[0].direction;
	}
}
