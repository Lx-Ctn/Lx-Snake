export function Skins(gameStyle, contexte, coordonnees, cellSize) {
    this.x = coordonnees[0] * cellSize;
    this.y = coordonnees[1] * cellSize;
    let radius = cellSize / 2;
    const red = "hsl(345, 90%, 50%)";

    switch (gameStyle) {
        case "bigHead":
            this.head = function () {
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
                contexte.fillStyle = red;
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
                contexte.fillRect(this.x, this.y, cellSize, cellSize); // (position x, position y, largeur, hauteur).
            };
            this.turn = function (turn) {
                contexte.rect(this.x, this.y, radius, cellSize);
                contexte.rect(this.x, this.y + (turn == "right" ? radius : 0), cellSize, radius);
                contexte.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
            };
            this.tail = function () {
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
                        contexte.rect(this.x + 3, this.y + 3, cellSize - 6, cellSize - 6);
                    };
            break;
    }
}
