const rootCSSStyles = getComputedStyle(document.documentElement);

export default {
    green: rootCSSStyles.getPropertyValue("--green"),
    red: rootCSSStyles.getPropertyValue("--red"),
    oldWhite: rootCSSStyles.getPropertyValue("--oldWhite"),
};

export class Color {
    /*  Créé un objet couleur au format hsl + alpha optionnel
        Permet d'intéragir facilement avec la couleur,
        Par exemple d'accéder facilement aux nuances et ombres d'une couleur en variant la propriétés de luminosité.

        On peut passer un autre object Color en paramètre :
        Il sera la référence pour garder un lien dynamique avec ses propriétés :
            const mainColor = new Color(360, 90, 70);
            const darkMainColor = new Color(color, null, -30);
            color.hue = 30; 
            => darkMainColor : (30, 90, 40)
        La nouvelle instance hérite des changements sur la référence, sauf si la propriété est écrasée sur la nouvelle.
        Les propriétés Offset permettent un décalage dynamique avec la valeur de référence.
        => Idéal pour la gestion dynamique de thème de couleurs
   */

    #colorReference;
    #hue;
    #saturation;
    #light;
    #alpha;

    // Les paramètres sont protégés pour assurer les valeurs min et max (propriétés de 0 à 100%)
    // Ainsi que la rotation sur la roue chromatique

    constructor(ColorOrHue, saturation = 100, light = 50, alpha = 100) {
        // Si l'instance hérite d'une Color :
        if (ColorOrHue instanceof Color) {
            this.#colorReference = ColorOrHue;
            switch (arguments.length) {
                case 4:
                    this.alphaOffset = alpha;
                case 3:
                    this.lightOffset = light;
                case 2:
                    this.saturationOffset = saturation;
                default:
                    break;
            }
            // Si on créer une Color :
        } else {
            this.#hue =
                ColorOrHue > 360 ? ColorOrHue % 360 : ColorOrHue < 0 ? (ColorOrHue % 360) + 360 : ColorOrHue;
            this.#saturation = saturation > 100 ? 100 : saturation < 0 ? 0 : saturation;
            this.#light = light > 100 ? 100 : light < 0 ? 0 : light;
            this.#alpha = alpha > 100 ? 100 : alpha < 0 ? 0 : alpha;

            this.hueOffset = 0;
            this.saturationOffset = 0;
            this.lightOffset = 0;
            this.alphaOffset = 0;
        }
    }

    // Hue :
    get hue() {
        return this.#hue ? this.#hue : this.#colorReference.hue + this.hueOffset;
    }
    set hue(hue) {
        this.#hue = hue > 360 ? hue % 360 : hue < 0 ? (hue % 360) + 360 : hue;
    }

    // Saturation :
    get saturation() {
        return this.#saturation ? this.#saturation : this.#colorReference.saturation + this.saturationOffset;
    }
    set saturation(saturation) {
        this.#saturation = saturation > 100 ? 100 : saturation < 0 ? 0 : saturation;
    }

    // Light :
    get light() {
        return this.#light ? this.#light : this.#colorReference.light + this.lightOffset;
    }
    set light(light) {
        this.#light = light > 100 ? 100 : light < 0 ? 0 : light;
    }

    // Alpha :
    get alpha() {
        return this.#alpha ? this.#alpha : this.#colorReference.alpha + this.alphaOffset;
    }
    set alpha(alpha) {
        this.#alpha = alpha > 100 ? 100 : alpha < 0 ? 0 : alpha;
    }

    // Export css :
    toHsl() {
        return this.alpha === 100
            ? `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`
            : `hsla(${this.hue}, ${this.saturation}%, ${this.light}%, ${this.alpha}%)`;
    }
}
