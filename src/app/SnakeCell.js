/*



*/
// Construction des éléments du serpent :

export function SnakeCell(coordonnees, direction) {
    this.x = coordonnees[0];
    this.y = coordonnees[1];
    this.direction = direction;

    // Lance le dessin de l'élément :
    this.draw = function (style, position) {
        // Mise à jour du style avec les coordonnées
        style.coordinates = [this.x, this.y];

        // Initialise le dessin en fonction de la direction :
        style.beginDraw(this.direction);
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
        style.closeDraw();
    };
}
