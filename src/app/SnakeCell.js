import { Skins } from "./GameSkins.js";
import { contexte, cellSize, snakeColor } from "../index.js";

// Construction des éléments du serpent :
export function SnakeCell(coordonnees, direction) {
    this.x = coordonnees[0];
    this.y = coordonnees[1];
    this.direction = direction;

    const radius = cellSize / 2;

    // Initialise le dessin en fonction de la direction :
    this.beginDraw = function () {
        contexte.save();
        contexte.fillStyle = snakeColor;
        contexte.beginPath();
        contexte.translate(this.x * cellSize + radius, this.y * cellSize + radius); // On déplace le canvas au niveau de notre centre de rotation
        switch (
            this.direction // On tourne l'élément selon la direction
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
        contexte.translate(-this.x * cellSize - radius, -this.y * cellSize - radius); // On remet le canvas en place
    };

    // Lance le dessin de l'élément :
    this.draw = function (style, position) {
        style.coordinates = [this.x, this.y];
        this.beginDraw();
        switch (position) {
            case "head":
                style.head();
                break;

            case "body":
                style.body();
                break;

            case "turnRight":
                style.turn("right");
                break;

            case "turnLeft":
                style.turn("left");
                break;

            case "tail":
                style.tail();
                break;
            default:
                throw "Invalid position";
        }
        contexte.fill();
        contexte.restore();
    };
}
