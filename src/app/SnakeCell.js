// Construction des éléments du serpent :
export class SnakeCell {
	constructor(coor, direction) {
		this.x = coor.x;
		this.y = coor.y;
		this.direction = direction;
	}
}
