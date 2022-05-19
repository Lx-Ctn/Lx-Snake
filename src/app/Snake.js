import { SnakeCell } from "./SnakeCell.js";

// Construction du serpent :
export class Snake {
    #nextDirection = "";
    #appleEaten = false;

    constructor(body) {
        this.life = true;
        this.waitForRefresh = false;
        this.body = body.slice();

        this.#nextDirection = this.body[0][2];
    }

    get head() {
        return this.body[0];
    }

    get tail() {
        return this.body[this.body.length - 1];
    }

    // Dessine le serpent :
    draw() {
        let tail = new SnakeCell(
            this.tail,
            this.body[this.body.length - 2][2] // La queue récupére la direction de la cellule précédente pour anticiper les tournants
        );
        tail.draw("tail");

        for (let i = this.body.length - 2; i > 0; i--) {
            const cellDirection = this.body[i][2];
            const nextCellDirection = this.body[i - 1][2];
            if (nextCellDirection === cellDirection) {
                let body = new SnakeCell(this.body[i], cellDirection);
                body.draw("body");
            } else {
                let position = "";
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
                let turn = new SnakeCell(this.body[i], cellDirection);
                turn.draw(position);
            }
        }

        let head = new SnakeCell(this.head, this.head[2]);
        head.draw("head"); // La tête est affichée en dernière pour apparaître au dessus en cas de collision
    }

    // Fait avancer le serpent selon la direction :
    advance() {
        let nextPosition = this.head.slice();
        switch (this.#nextDirection) {
            case "right":
                nextPosition[0] += 1;
                nextPosition[2] = "right";
                break;
            case "left":
                nextPosition[0] -= 1;
                nextPosition[2] = "left";
                break;
            case "up":
                nextPosition[1] -= 1;
                nextPosition[2] = "up";
                break;
            case "down":
                nextPosition[1] += 1;
                nextPosition[2] = "down";
                break;
            default:
                throw "Invalid direction";
        }

        this.body.unshift(nextPosition);
        if (!this.appleEaten) {
            this.body.pop();
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
            if (this.head[0] === cell[0] && this.head[1] === cell[1]) {
                return true;
            }
        }
        return false;
    }

    // Détecte la collision avec une pomme :
    ate(apple) {
        if (this.head[0] == apple.position[0] && this.head[1] == apple.position[1]) {
            this.appleEaten = true;
            return true;
        }
        this.appleEaten = false;
        return false;
    }

    // Réinitialise le serpent :
    rebornWith(snakeStartingBody) {
        this.life = true;
        this.body = snakeStartingBody.slice();
        this.nextDirection = snakeStartingBody[0][2];
    }
}
