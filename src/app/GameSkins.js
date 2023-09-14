import COLORS from "./Colors.js";

export function Skins(gameStyle, contexte, cellSize) {
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

    switch (gameStyle) {
        case "bigHead":
            this.head2 = function () {
                this.isCoordinates();
                const headScale = 1.2; // Echelle : it's a BIG head !
                const headXOffset = (cellSize * headScale) / 4; // Décalage : la tête dépasse en arrière

                // On déplace le canvas au niveau de notre centre de rotation :
                contexte.translate(this.x - headXOffset + radius, this.y - headScale / 2 + radius); // On tiens de l'échelle et du décalage pour center la cellule modifiée
                contexte.rotate(Math.PI * 0.25);

                contexte.rect(
                    (-headScale * cellSize) / 2,
                    (-headScale * cellSize) / 2,
                    headScale * cellSize,
                    headScale * cellSize
                );
                contexte.rotate(Math.PI * -0.25);
                contexte.translate(-this.x + headXOffset - radius, -this.y + headScale / 2 - radius); // On remet le canvas en place

                contexte.arc(
                    this.x + (radius - 0.5) * headScale,
                    this.y + radius,
                    radius / headScale,
                    0,
                    Math.PI * 2
                );

                contexte.fill();

                // Yeux :
                contexte.beginPath();
                contexte.fillStyle = COLORS.red;
                const eyeRadius = radius / headScale / 2.6;
                const eyeYOffset = radius / 1.7;
                contexte.arc(
                    this.x + radius / headScale,
                    this.y + eyeYOffset,
                    eyeRadius,
                    Math.PI * 1.15,
                    Math.PI * 2.15
                );
                contexte.fill();
                contexte.beginPath();
                contexte.arc(
                    this.x + radius / headScale,
                    this.y + cellSize - eyeYOffset,
                    eyeRadius,
                    Math.PI * -0.15,
                    Math.PI * 0.85
                );
                contexte.fill();
            };

            this.head = function () {
                this.isCoordinates();
                const headScale = 1.2; // Echelle : it's a BIG head !
                const headXOffset = (cellSize * headScale) / 4; // Décalage : la tête dépasse en arrière
                const headLength = 1.4; // Longeur de la tête en avant

                contexte.arc(
                    this.x + radius - headXOffset,
                    this.y + radius,
                    headScale * radius,
                    Math.PI * 0.5,
                    Math.PI * 1.5
                );
                contexte.ellipse(
                    this.x + radius - headXOffset,
                    this.y + radius,
                    headScale * radius * headLength,
                    headScale * radius,
                    0,
                    Math.PI * 1.5,
                    Math.PI * 0.5
                );
                contexte.ellipse(
                    this.x + radius - headLength / headScale,
                    this.y + radius,
                    headScale * radius * headLength,
                    radius * 0.9,
                    0,
                    Math.PI * 1.5,
                    Math.PI * 0.5
                );
                contexte.fill();

                // Yeux :
                contexte.beginPath();
                contexte.fillStyle = COLORS.red;
                const eyeRadius = radius / headScale / 2.6;
                const eyeYOffset = radius / 1.7;
                contexte.arc(this.x + radius, this.y + eyeYOffset, eyeRadius, Math.PI * 1.15, Math.PI * 2.15);
                contexte.fill();
                contexte.beginPath();
                contexte.arc(
                    this.x + radius,
                    this.y + cellSize - eyeYOffset,
                    eyeRadius,
                    Math.PI * -0.15,
                    Math.PI * 0.85
                );
                contexte.fill();
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
