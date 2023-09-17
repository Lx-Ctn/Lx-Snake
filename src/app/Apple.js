import Colors from "./Colors";
const appleColor = Colors.red;

// Construit l'objet pomme :
export class Apple {
	constructor(coor) {
		this.coor = coor;
	}

	// Dessine une pomme :
	draw(gameArt) {
		gameArt.drawApple(this.coor);
	}

	// Définie de nouvelle coordonnées :
	setNewPosition(coor) {
		this.coor = coor;
	}

	// Vérifie si les coordonnées ne sont pas sur le serpent :
	isOnSnake(snakeToCheck) {
		let isOnSnake = false;
		snakeToCheck.body.forEach(cell => {
			if (this.coor.x === cell.x && this.coor.y === cell.y) isOnSnake = true;
		});
		return isOnSnake;
	}
}
