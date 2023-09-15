import Colors from "./Colors";
const appleColor = Colors.red;

// Construit l'objet pomme :
export class Apple {
	constructor(coor) {
		this.x = coor.x;
		this.y = coor.y;
	}

	// Dessine une pomme :
	draw = function (cellSize, contexte, gameStyle) {
		contexte.save(); // enregistre les paramètres actuels du contexte.
		contexte.fillStyle = appleColor;
		contexte.beginPath();

		const radius = cellSize / 2;
		const x = this.x * cellSize;
		const y = this.y * cellSize;

		const gap = (cellSize * 20) / 100;

		gameStyle === "classic"
			? contexte.rect(x + gap / 2, y + gap / 2, cellSize - gap, cellSize - gap)
			: gameStyle === "full"
			? contexte.rect(x, y, cellSize, cellSize)
			: contexte.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.

		contexte.fill();
		contexte.restore(); // puis les restore pour éviter de dessiner les nouvelles parties du serpents couleur pomme.
	};

	// Définie de nouvelle coordonnées :
	setNewPosition = function (coor) {
		this.x = coor.x;
		this.y = coor.y;
	};

	// Vérifie si les coordonnées ne sont pas sur le serpent :
	isOnSnake = function (snakeToCheck) {
		let isOnSnake = false;
		snakeToCheck.body.forEach(cell => {
			if (this.x === cell.x && this.y === cell.y) {
				isOnSnake = true;
			}
		});
		return isOnSnake;
	};
}
