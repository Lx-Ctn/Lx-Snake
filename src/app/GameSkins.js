import COLORS from "./Colors.js";

export function Skins(gameStyle, contexte, cellSize) {
    this.x = null;
    this.y = null;

    Object.defineProperty(this, "coordinates", {
        set: function (coordinates) {
            this.x = coordinates[0] * cellSize;
            this.y = coordinates[1] * cellSize;
        },
        enumerable: true,
        configurable: true,
    });

    const radius = cellSize / 2;
    let snakeColor = COLORS.green;
    let appleColor = COLORS.red;

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
        contexte.save();
        contexte.fillStyle = snakeColor;
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

    switch (gameStyle) {
        case "bigHead":
            this.head = function () {
                this.isCoordinates();
                contexte.translate(this.x + radius, this.y + radius); // On déplace le canvas au niveau de notre centre de rotation
                contexte.rotate(Math.PI * 0.25);
                contexte.translate(-this.x - radius, -this.y - radius); // On remet le canvas en place
                contexte.rect(this.x - 10, this.y + 4, 1.2 * cellSize, 1.2 * cellSize);
                contexte.translate(this.x + radius, this.y + radius);
                contexte.rotate(Math.PI * -0.25);
                contexte.translate(-this.x - radius, -this.y - radius);
                contexte.arc(this.x + radius + 3, this.y + radius, radius - 3, 0, Math.PI * 2); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.
                contexte.fill();
                contexte.beginPath();
                contexte.fillStyle = COLORS.red;
                const eyeRadius = radius / 3.2;
                contexte.arc(this.x + eyeRadius, this.y + eyeRadius, eyeRadius, 0, Math.PI * 2);
                contexte.arc(
                    this.x + eyeRadius,
                    this.y + cellSize - eyeRadius,
                    eyeRadius,
                    0,
                    Math.PI * 2
                );
            };
            this.body = function () {
                this.isCoordinates();
                contexte.fillRect(this.x, this.y, cellSize, cellSize); // (position x, position y, largeur, hauteur).
            };
            this.turn = function (turn) {
                this.isCoordinates();
                contexte.rect(this.x, this.y, radius, cellSize);
                contexte.rect(this.x, this.y + (turn == "right" ? radius : 0), cellSize, radius);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            };
            this.tail = function () {
                this.isCoordinates();
                contexte.rect(this.x + radius, this.y, radius, cellSize);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            };
            break;

        case "rounded":
            this.head = function () {
                contexte.rect(this.x, this.y, radius, cellSize);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.
            };
            this.body = function () {
                contexte.fillRect(this.x, this.y, cellSize, cellSize); // (position x, position y, largeur, hauteur).
            };
            this.turn = function (turn) {
                contexte.rect(this.x, this.y, radius, cellSize);
                contexte.rect(this.x, this.y + (turn === "right" ? radius : 0), cellSize, radius);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            };
            this.tail = function () {
                contexte.rect(this.x + radius, this.y, radius, cellSize);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            };
            break;

        case "full":
            this.head =
                this.body =
                this.turn =
                this.tail =
                    function () {
                        this.isCoordinates();
                        contexte.rect(this.x, this.y, cellSize, cellSize);
                    };
            break;

        case "classic":
        default:
            this.head =
                this.body =
                this.turn =
                this.tail =
                    function () {
                        this.isCoordinates();
                        contexte.rect(this.x + 3, this.y + 3, cellSize - 6, cellSize - 6);
                    };
            break;
    }

    this.closeDraw = function () {
        contexte.fill();
        contexte.restore();
    };
}
