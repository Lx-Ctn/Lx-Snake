import { Skins } from "./GameSkins.js";
import { gameStyle, contexte, cellSize, snakeColor } from "../index.js";

// Construction des éléments du serpent :
export function SnakeCell(coordonnees, direction) {
    let Style = new Skins(gameStyle, contexte, coordonnees, cellSize);
    this.x = coordonnees[0] * cellSize;
    this.y = coordonnees[1] * cellSize;
    this.direction = direction;
    let radius = cellSize / 2;

    // Initialise le dessin en fonction de la direction :
    this.beginDraw = function () {
        contexte.save();
        contexte.fillStyle = snakeColor;
        contexte.beginPath();
        contexte.translate(this.x + radius, this.y + radius); // On déplace le canvas au niveau de notre centre de rotation
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
        contexte.translate(-this.x - radius, -this.y - radius); // On remet le canvas en place
    };

    // Lance le dessin de l'élément :
    this.draw = function (position) {
        this.beginDraw();
        switch (position) {
            case "head":
                Style.head();
                break;

            case "body":
                Style.body();
                break;

            case "turnRight":
                Style.turn("right");
                break;

            case "turnLeft":
                Style.turn("left");
                break;

            case "tail":
                Style.tail();
                break;
            default:
                throw "Invalid position";
        }
        contexte.fill();
        contexte.restore();
    };
}
