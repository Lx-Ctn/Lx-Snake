/** Build the apple object : the main target of the game */
export class Apple {
	constructor(coor) {
		this.coor = coor;
	}

	/**
	 * @typedef {import('./game-art/GameArt.js').GameArt} GameArt
	 */

	/** Draw the apple (according to the gameArt passed in argument)
	 * @param {GameArt} gameArt - The selected game art style
	 */
	draw(gameArt) {
		gameArt.drawApple(this.coor);
	}

	/** Update the apple coordinate
	 * @param {{x: number, y: number}} coor - The new coordinate
	 */
	setNewPosition(coor) {
		this.coor = coor;
	}

	/**
	 * @typedef {import('./Snake.js').Snake} Snake
	 */

	/** Check if the apple is on the same coordinates as any snake body cells
	 * @param {Snake} snakeToCheck - The snake.
	 */
	isOnSnake(snakeToCheck) {
		let isOnSnake = false;
		snakeToCheck.body.forEach(cell => {
			if (this.coor.x === cell.x && this.coor.y === cell.y) isOnSnake = true;
		});
		return isOnSnake;
	}
}
