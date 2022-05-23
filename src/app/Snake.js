import { SnakeCell } from "./SnakeCell.js";

// Construction du serpent :
export class Snake {
    #nextDirection = "";
    #appleEaten = false;

    constructor(body) {
        this.life = true;
        this.waitForRefresh = false;
        this.body = body.map(cell => new SnakeCell([cell[0], cell[1]], cell[2]));

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
    draw(style) {
        // La queue récupére la direction de la cellule précédente pour anticiper les tournants :
        this.tail.direction = this.body[this.body.length - 2].direction;
        this.tail.draw(style, "tail");

        for (let i = this.body.length - 2; i > 0; i--) {
            const cellDirection = this.body[i].direction;
            const nextCellDirection = this.body[i - 1].direction;
            let position = "";

            if (nextCellDirection === cellDirection) {
                position = "body";
            } else {
                switch (cellDirection) {
                    case "up":
                        position = nextCellDirection === "right" ? "turnRight" : "turnLeft"; // nextCellDirection ne peut être "up" puisque nextCellDirection !== direction, ni "down" puique contraint par setDirection()
                        break;
                    case "right":
                        position = nextCellDirection === "down" ? "turnRight" : "turnLeft";
                        break;
                    case "down":
                        position = nextCellDirection === "left" ? "turnRight" : "turnLeft";
                        break;
                    case "left":
                        position = nextCellDirection === "up" ? "turnRight" : "turnLeft";
                        break;
                    default:
                        throw "Invalid direction";
                }
            }
            this.body[i].draw(style, position);
        }

        this.head.draw(style, "head"); // La tête est affichée en dernière pour apparaître au dessus en cas de collision
    }

    // Fait avancer le serpent selon la direction :
    advance(test = "") {
        let nextCell = new SnakeCell([this.head.x, this.head.y], this.head.direction);
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
                throw "Invalid direction";
        }

        if (test === "test") {
            return nextCell;
        } else {
            this.body.unshift(nextCell);
            !this.#appleEaten && this.body.pop();
        }
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
                throw "Invalid direction";
        }
        if (allowedDirection.includes(newDirection) && !this.waitForRefresh) {
            this.#nextDirection = newDirection;
            this.waitForRefresh = true; // Attend l'affichage d'une direction avant d'en choisir une nouvelle.
        }
    }

    // Détecte une collision avec son propre corps :
    isAutoCollision() {
        let tail = this.body.slice(1);
        for (const cell of tail) {
            if (this.head.x === cell.x && this.head.y === cell.y) {
                return true;
            }
        }
        return false;
    }

    // Détecte la collision avec une pomme :
    ate(apple) {
        if (this.head.x === apple.x && this.head.y === apple.y) {
            this.#appleEaten = true;
            return true;
        }
        this.#appleEaten = false;
        return false;
    }

    // Réinitialise le serpent :
    rebornWith(snakeStartingBody) {
        this.life = true;
        this.body = snakeStartingBody.map(cell => new SnakeCell([cell[0], cell[1]], cell[2]));
        this.#nextDirection = snakeStartingBody[0][2];
    }
}
