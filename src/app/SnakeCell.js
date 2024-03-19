/** Bulding the snake elements */
export class SnakeCell {
	/**
	 * Bulding the snake elements
	 * @param {Object} coor - The coordonates of the snake cell.
	 * @param {number} coor.x - x position of the cell.
	 * @param {number} coor.y - y position of the cell.
	 * @param {("right"|"left"|"up"|"down")} direction - The direction of the cell.
	 */
	constructor(coor, direction) {
		this.x = coor.x;
		this.y = coor.y;
		this.direction = direction;
	}
}
