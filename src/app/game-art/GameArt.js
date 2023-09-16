import COLORS from "../Colors.js";
import { classic, full, rounded, bigHead, evil } from "./arts";

export function GameArt(gameStyle, contexte, cellSize) {
	this.x = null;
	this.y = null;
	this.snakeColor = COLORS.green;

	Object.defineProperty(this, "coordinates", {
		set: function (coordinates) {
			this.x = coordinates[0] * cellSize;
			this.y = coordinates[1] * cellSize;
		},
		enumerable: true,
		configurable: true,
	});

	const radius = cellSize / 2;
	const appleColor = COLORS.red;

	this.isCoordinates = function () {
		try {
			if (this.x === null && this.y === null)
				throw new Error(`
    x: null, y: null, But gamestyles need coordinates :
    -> Declare Skins.coordinates before calling any Skins methodes
    `);
		} catch (error) {
			console.error(error);
		}
	};

	// Initialise le dessin en fonction de la direction de la cellule :
	this.beginDraw = function (direction) {
		this.isCoordinates();
		contexte.save();
		contexte.fillStyle = this.snakeColor;
		contexte.beginPath();
		contexte.translate(this.x + radius, this.y + radius); // On déplace le canvas au niveau de notre centre de rotation
		switch (
			direction // On tourne l'élément selon la direction
		) {
			case "right":
				break; // On laisse dans ce sens

			case "down":
				contexte.rotate(Math.PI * 0.5);
				break;

			case "left":
				contexte.rotate(Math.PI * 1);
				break;

			case "up":
				contexte.rotate(Math.PI * 1.5);
				break;

			default:
				throw "Invalid direction";
		}
		contexte.translate(-this.x - radius, -this.y - radius); // On remet le canvas en place
	};

	const getCoor = () => ({ x: this.x, y: this.y });
	switch (gameStyle) {
		case "classic":
			const classicSnakeArt = classic(contexte, cellSize).snake;
			this.head = () => classicSnakeArt.head(getCoor());
			this.body = () => classicSnakeArt.body(getCoor());
			this.turn = turn => classicSnakeArt.turn(getCoor(), turn);
			this.tail = () => classicSnakeArt.tail(getCoor());
			break;

		case "full":
			const fullSnakeArt = full(contexte, cellSize).snake;
			this.head = () => fullSnakeArt.head(getCoor());
			this.body = () => fullSnakeArt.body(getCoor());
			this.turn = turn => fullSnakeArt.turn(getCoor(), turn);
			this.tail = () => fullSnakeArt.tail(getCoor());
			break;

		case "rounded":
			const roundedSnakeArt = rounded(contexte, cellSize).snake;
			this.head = () => roundedSnakeArt.head(getCoor());
			this.body = () => roundedSnakeArt.body(getCoor());
			this.turn = turn => roundedSnakeArt.turn(getCoor(), turn);
			this.tail = () => roundedSnakeArt.tail(getCoor());
			break;

		case "bigHead":
			const bigHeadSnakeArt = bigHead(contexte, cellSize).snake;
			this.head = () => bigHeadSnakeArt.head(getCoor());
			this.body = () => bigHeadSnakeArt.body(getCoor());
			this.turn = turn => bigHeadSnakeArt.turn(getCoor(), turn);
			this.tail = () => bigHeadSnakeArt.tail(getCoor());
			break;

		case "evil":
		default:
			const evilSnakeArt = evil(contexte, cellSize).snake;
			this.head = () => evilSnakeArt.head(getCoor());
			this.body = () => evilSnakeArt.body(getCoor());
			this.turn = turn => evilSnakeArt.turn(getCoor(), turn);
			this.tail = () => evilSnakeArt.tail(getCoor());
			break;
	}

	this.closeDraw = function () {
		contexte.fill();
		contexte.restore();
	};
}
