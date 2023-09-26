import { SnakeCell } from "./SnakeCell.js";

// Construction du serpent :
export class Snake {
	#nextDirection = "";
	#appleEaten = false;

	constructor(body) {
		this.life = true;
		this.waitForRefresh = false;
		this.body = body.map(cell => new SnakeCell(cell.coor, cell.direction));
		this.#nextDirection = this.head.direction;
	}

	get head() {
		// besoin d'un getter sinon head est fixé lors de l'instanciation et ne suis pas body dynamiquement
		return this.body[0];
	}

	get tail() {
		// idem
		return this.body[this.body.length - 1];
	}

	// Dessine le serpent :
	draw(gameArt) {
		// La queue récupére la direction de la cellule précédente pour anticiper les tournants :
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
						// nextCellDirection ne peut être "up" puisque nextCellDirection !== direction, ni "down" puique contraint par setDirection() :
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

		gameArt.drawSnake.head(this.head); // La tête est affichée en dernière pour apparaître au dessus en cas de collision
	}

	// Fait avancer le serpent selon la direction :
	advance({ test = false, nextCell } = { test: false, nextCell: null }) {
		if (!nextCell) {
			nextCell = new SnakeCell({ x: this.head.x, y: this.head.y }, this.head.direction);
			switch (this.#nextDirection) {
				case "right":
					nextCell.x += 1;
					nextCell.direction = "right";
					break;
				case "left":
					nextCell.x -= 1;
					nextCell.direction = "left";
					break;
				case "up":
					nextCell.y -= 1;
					nextCell.direction = "up";
					break;
				case "down":
					nextCell.y += 1;
					nextCell.direction = "down";
					break;
				default:
					throw new Error("Invalid direction");
			}
		}

		// test: recupère le mouvement suivant avant son affichage pour vérifier une éventuelle collision
		if (test) return nextCell;

		this.body.unshift(nextCell);
		!this.#appleEaten && this.body.pop(); // If a apple is eaten, we keep the  last cell to grow
	}

	// Contrôle la direction du serpent :
	setDirection(newDirection) {
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
		if (allowedDirection.includes(newDirection) && !this.waitForRefresh) {
			this.#nextDirection = newDirection;
			this.waitForRefresh = true; // Attend l'affichage d'une direction avant d'en choisir une nouvelle.
		}
	}

	// Détecte une collision avec son propre corps :
	isAutoCollision() {
		const tail = this.body.slice(1);
		for (const cell of tail) {
			if (this.head.x === cell.x && this.head.y === cell.y) {
				return true;
			}
		}
		return false;
	}

	// Détecte la collision avec une pomme :
	isEating(apple) {
		if (this.head.x === apple.coor.x && this.head.y === apple.coor.y) {
			this.#appleEaten = true;
			return true;
		}
		this.#appleEaten = false;
		return false;
	}

	// Réinitialise le serpent :
	rebornWith(snakeStartBody) {
		this.life = true;
		this.body = snakeStartBody.map(cell => new SnakeCell(cell.coor, cell.direction));
		this.#nextDirection = snakeStartBody[0].direction;
	}
}
