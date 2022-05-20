import "./styles.scss";
import { Snake } from "./app/Snake.js";
import { Skins } from "./app/GameSkins.js";

const canvas = document.createElement("canvas"); // Créer un nouvel élément <canvas> et l'enregistre dans la variable canvas.
canvas.id = "mainGame";
export const canvasWidth = 780;
export const canvasHeight = 600;
export const cellSize = 30;
const maxCellsInWidth = canvasWidth / cellSize;
const maxCellsInHeight = canvasHeight / cellSize;

export let contexte;
let pause;
const pauseElement = document.getElementById("pause");
const gameOverElement = document.getElementById("gameOver");
const footerElement = document.getElementById("footer");
const mainElement = document.getElementById("main");
let again = false;
let gameLoopDelay = 140;
const minGameLoopDelay = 40;

const green = "hsl(140, 10%, 20%)";
export const red = "hsl(345, 90%, 50%)";
const oldWhite = "hsl(34, 14%, 91%)";

let borderGameStyle;
export let gameStyle = "classic";
let style;

let snake;
export let snakeColor = green;
let snakeStartingBody = [
    [5, 2, "right"],
    [4, 2, "right"],
    [3, 2, "right"],
];
let apple;
let appleColor = red;

let score = 0;
const lastBestScore = localStorage.getItem("snakeBestScore");
let bestScore = lastBestScore ? +lastBestScore : 0;

// Idées à implémenter pour faire évoluer le jeu :
// - ajouter un vrai menu différentes catégories ?
// - réglage pour la sensibilité ?, supprimer la sauvegarde, afficher les contrôles pour le touch ? etc.
// - Un menu de choix de style, avec choix des couleurs, et une grilles avec l'ensemble des styles déblocables + aperçu
// - Gameplay + développé avec avancée et évolution, recompense

init();

function init() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ratio = canvasWidth / canvasHeight;
    let headerHeight = "130px";

    function setCanvasSize() {
        headerHeight = getComputedStyle(document.getElementById("header")).minHeight;
        canvas.style.maxWidth =
            "min(" + canvasWidth + "px, calc((100vh - " + headerHeight + ")*" + ratio + "))";
        canvas.style.maxHeight = "min(" + canvasHeight + "px, calc(100vh - " + headerHeight + "))";
    }
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const main = document.getElementsByTagName("main")[0];
    main.appendChild(canvas); // document = <html> // appendChild(canvas) va ajouter le <canvas> dans le <main> .

    pause = false;
    borderGameStyle = "mirror";
    contexte = canvas.getContext("2d");

    style = new Skins(gameStyle, contexte, cellSize);
    snake = new Snake(snakeStartingBody);
    apple = new Apple([6, 8]);

    getScore(); // Dès l'init pour récupérer le "BestScore" du localStorage
    letsGo();
    setTimeout(requestAnimationFrame, 1000, refreshCanvas);
}

// Affichage d'un texte d'intro :
function letsGo() {
    contexte.clearRect(0, 0, canvas.width, canvas.height);
    contexte.fillStyle = snakeColor;
    contexte.font = "40px monospace";
    contexte.textBaseline = "middle";
    contexte.textAlign = "center";

    contexte.fillText("Let's go !", canvasWidth / 2, canvasHeight / 2);
}

// Remet à 0 le jeu après un game-over :
function reload() {
    // Redemarre seulement si la touche est pressée.
    if (again) {
        snake.rebornWith(snakeStartingBody);
        snakeColor = green;
        gameOverElement.style.display = "none";
        score = 0;
        again = false;

        requestAnimationFrame(refreshCanvas);
    }
}

// Contrôle les collisions :
function isCollisions() {
    // Détecte les collisions aux bords :
    let borderCollision = false;
    switch (borderGameStyle) {
        case "walls":
            borderCollision =
                snake.head.x < 0 ||
                snake.head.x > maxCellsInWidth - 1 ||
                snake.head.y < 0 ||
                snake.head.y > maxCellsInHeight - 1;
            break;
        case "mirror":
            if (snake.head.x < 0) snake.head.x = maxCellsInWidth - 1;
            if (snake.head.x > maxCellsInWidth - 1) snake.head.x = 0;
            if (snake.head.y < 0) snake.head.y = maxCellsInHeight - 1;
            if (snake.head.y > maxCellsInHeight - 1) snake.head.y = 0;
            break;
        default:
            throw "Invalid Gameplay";
    }

    return borderCollision || snake.isAutoCollision(); // + Autocollision
}

function gameOver() {
    snake.life = false;
    snakeColor = red;
    document.getElementById("gameOver").style.display = "block";
}

// Quand le serpent mange une pomme :
function scoreThatApple() {
    score++;
    if (score > bestScore) {
        bestScore = score;
    }
    gameLoopDelay > minGameLoopDelay ? (gameLoopDelay -= 3) : (gameLoopDelay = minGameLoopDelay); // On accellère le jeu

    // On génére une nouvelle pomme :
    do {
        apple.setNewPosition();
    } while (apple.isOnSnake(snake));
}

// Boucle de jeu principale :
function refreshCanvas() {
    if (!pause) {
        snake.waitForRefresh = false;

        snake.advance();

        isCollisions() && gameOver(); // Game-over en cas de collision.

        snake.ate(apple) && scoreThatApple(); // Si le serpent mange une pomme.
        getScore(); // Mise à jour de l'affichage des scores

        contexte.clearRect(0, 0, canvas.width, canvas.height);
        apple.draw();
        snake.draw(style);

        if (snake.life) {
            setTimeout(requestAnimationFrame, gameLoopDelay, refreshCanvas);
        } else {
            reload();
        }
    }
}

// Construit l'objet pomme :
function Apple(coordonnees) {
    this.x = coordonnees[0];
    this.y = coordonnees[1];

    // Dessine une pomme :
    this.draw = function () {
        contexte.save(); // enregistre les paramètres actuels du contexte.
        contexte.fillStyle = appleColor;
        contexte.beginPath();

        const radius = cellSize / 2;
        const x = this.x * cellSize;
        const y = this.y * cellSize;

        gameStyle === "classic"
            ? contexte.rect(x + 3, y + 3, cellSize - 6, cellSize - 6)
            : gameStyle === "full"
            ? contexte.rect(x, y, cellSize, cellSize)
            : contexte.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.

        contexte.fill();
        contexte.restore(); // puis les restore pour éviter de dessiner les nouvelles parties du serpents couleur pomme.
    };

    // Définie de nouvelle coordonnées aléatoires :
    this.setNewPosition = function () {
        this.x = Math.floor(Math.random() * maxCellsInWidth);
        this.y = Math.floor(Math.random() * maxCellsInHeight);
    };

    // Vérifie si les coordonnées ne sont pas sur le serpent :
    this.isOnSnake = function (snakeToCheck) {
        let isOnSnake = false;
        for (let i = 0; i < snakeToCheck.body.length; i++) {
            if (this.x === snakeToCheck.body[i].x && this.y === snakeToCheck.body[i].y) {
                isOnSnake = true;
            }
        }
        return isOnSnake;
    };
}

// Gestion de la mise en pause et relance après un game over :
function pauseOrReload() {
    if (!snake.life) {
        // Si gameOver :
        again = true;
        reload(); // On relance
    } else if (!pause) {
        // Sinon on gère la mise en pause
        pause = true;
        canvas.style.backgroundColor = "#777";
        pauseElement.style.display = "block";
    } else {
        pause = false;
        canvas.style.backgroundColor = oldWhite;
        pauseElement.style.display = "none";
        requestAnimationFrame(refreshCanvas);
    }
}

// Met à jour l'affichage des scores :
function getScore() {
    document.getElementById("currentScore").innerHTML = score.toString(); // innerHTML correspond au texte entre les tags html de l'élément sélectionné.
    document.getElementById("bestScore").innerHTML = bestScore.toString();
    try {
        localStorage.setItem("snakeBestScore", bestScore.toString());
    } catch (error) {
        console.log(error);
    }
}

// Gestion de l'affichage du menu de réglage :
const settingIcon = document.getElementById("settingIcon");
const exitIcon = document.getElementById("exitSetting");
const setting = document.getElementById("setting");

settingIcon.addEventListener("click", getSetting);
exitIcon.addEventListener("click", getSetting);

function getSetting(event) {
    event.stopPropagation();

    if (!pause && snake.life) {
        pauseOrReload();
    }
    setting.style.display = setting.style.display == "block" ? "none" : "block";
}

/*
    const headline = document.getElementById("title");
    headline.addEventListener("click", function () {
        // Met en plein écran
        document.fullscreenElement != null ? document.exitFullscreen() : document.body.requestFullscreen();
    })
    */

let blockClickPropagation = false;
document.body.addEventListener("click", function (event) {
    if (
        (event.target == mainElement ||
            event.target == canvas ||
            event.target == pauseElement ||
            event.target == gameOverElement) &&
        !blockClickPropagation
    ) {
        pauseOrReload();
    }
    if (blockClickPropagation) blockClickPropagation = false;
    // @ts-ignore
    if (!setting.contains(event.target) && setting.style.display == "block") {
        getSetting(event);
    }
});

// Gestion du selecteur de mode de jeu :
const gamePlaySelector = document.getElementsByClassName("gamePlaySelector");
for (const gamePlay of gamePlaySelector) {
    gamePlay.addEventListener("click", selectingGamePlay);
}

function selectingGamePlay(event) {
    switch (
        event.currentTarget.id // currentTarget : élément à partir duquel l'événement à été appelé (gamePlay ici); Target : élément précis qui à déclencher l'événement, donc peut être un enfant de currentTarget
    ) {
        case "wallsSelector":
            borderGameStyle = "walls";
            canvas.style.border = "3px solid " + red;
            break;

        case "mirrorSelector":
            borderGameStyle = "mirror";
            canvas.style.border = "none";
            break;

        default:
            throw "Invalid Gameplay";
    }
    apple.draw(); // Met à jour le canvas pour afficher le nouveau mode.
}

// Gestion du selecteur de style :
const styleSelector = document.getElementsByClassName("styleSelector");
for (const style of styleSelector) {
    style.addEventListener("click", selectingStyle);
}

function selectingStyle(event) {
    const radius = (cellSize / 2).toString() + "px";
    switch (event.currentTarget.id) {
        case "classicSelector":
            gameStyle = "classic";
            canvas.style.borderRadius = "0";
            setting.style.borderRadius = "0";
            break;

        case "fullSelector":
            gameStyle = "full";
            canvas.style.borderRadius = "0";
            setting.style.borderRadius = "0";
            break;

        case "roundedSelector":
            gameStyle = "rounded";
            canvas.style.borderRadius = radius;
            setting.style.borderRadius = radius;
            break;

        case "bigHeadSelector":
            gameStyle = "bigHead";
            canvas.style.borderRadius = radius;
            setting.style.borderRadius = radius;
            break;

        default:
            throw "Invalid Style";
    }

    // Met à jour le canvas pour afficher le nouveau mode :
    style = new Skins(gameStyle, contexte, cellSize);
    contexte.clearRect(0, 0, canvas.width, canvas.height);
    apple.draw();
    snake.draw(style);
}
/*




*/
// Détecte l'appuis sur les touches :

document.onkeydown = function handleKeyDown(event) {
    let key = event.key; // renvoi le code de la touche qui a été appuyée
    let newDirection;
    switch (key) {
        case "d": // touche d
        case "Right": // touche directionnelle droite
        case "ArrowRight":
            newDirection = "right";
            break;
        case "q": // touche q
        case "Left": // touche directionnelle gauche
        case "ArrowLeft":
            newDirection = "left";
            break;
        case "z": // touche z
        case "Up": // touche directionnelle haut
        case "ArrowUp":
            newDirection = "up";
            break;
        case "s": // touche s
        case "Down": // touche directionnelle bas
        case "ArrowDown":
            newDirection = "down";
            break;
        case "Enter": // touche entrée
        case " ": // touche espace
            pauseOrReload();
            break;
        default:
            return;
    }
    pause || snake.setDirection(newDirection);
};
/*




*/
// Détection des gestes tactiles :

let xFirst;
let yFirst;
let xMove = 0;
let yMove = 0;
let timingStart;
let timingEnd;
let gestureSensitivity = gameLoopDelay; // Delais de rafraîchissement du calcul du mouvement au toucher (en ms)
let waitForMoveDelay = false;
let killTimeOut = false;

function getNewDirection() {
    let newDirection;

    if (xMove > 0 && xMove >= Math.abs(yMove)) {
        newDirection = "right";
    } else if (yMove > 0 && yMove > Math.abs(xMove)) {
        newDirection = "down";
    } else if (xMove < 0 && -xMove >= Math.abs(yMove)) {
        newDirection = "left";
    } else {
        newDirection = "up";
    }

    return newDirection;
}

document.body.addEventListener(
    "touchstart",
    function (event) {
        // Target : document au lieu de canvas pour inclure les éléments d'affichage "pause" & "Game Over"

        if (
            event.target == canvas ||
            event.target == pauseElement ||
            event.target == gameOverElement ||
            event.target == footerElement ||
            event.target == mainElement
        ) {
            if (getComputedStyle(setting).display == "none") {
                //event.preventDefault(); // Bloque l'appel de l'évenement "click" en même temps que le touch, sauf pour fermer les settings.
                blockClickPropagation = true;
            }
            xFirst = event.touches[0].clientX;
            yFirst = event.touches[0].clientY;
            timingStart = performance.now();

            waitForMoveDelay = false; // Réinitialise si le timeOut est kill
        }
    },
    { passive: false }
);

document.body.addEventListener(
    "touchmove",
    function (event) {
        if (
            (event.target == canvas ||
                event.target == pauseElement ||
                event.target == gameOverElement ||
                event.target == footerElement ||
                event.target == mainElement) &&
            event.touches.length == 1 &&
            !pause
        ) {
            event.preventDefault(); // Évite le scroll par défaut pour les gestes tactiles.
        }

        if (waitForMoveDelay) {
            return;
        } // Annule l'event si le delai de rafraîchissement n'est pas atteint.

        if (
            event.target == canvas ||
            event.target == footerElement ||
            event.target == mainElement
        ) {
            waitForMoveDelay = true;
            killTimeOut = false;

            setTimeout(function () {
                if (killTimeOut) {
                    return;
                } // Annule la programmation si le doigt est levé avant

                xMove = event.touches[0].clientX - xFirst;
                yMove = event.touches[0].clientY - yFirst;
                pause || snake.setDirection(getNewDirection());

                // La boucle est passée, on peut en relancer une nouvelle
                xFirst = event.touches[0].clientX;
                yFirst = event.touches[0].clientY;
                waitForMoveDelay = false;
            }, gestureSensitivity); // La sensibilité s'accèlère avec la vitesse de jeu
        }
    },
    { passive: false }
);

document.body.addEventListener(
    "touchend",
    function (event) {
        if (
            event.target == canvas ||
            event.target == pauseElement ||
            event.target == gameOverElement ||
            event.target == footerElement ||
            event.target == mainElement
        ) {
            timingEnd = performance.now();
            let touchDelay = timingEnd - timingStart;

            if (waitForMoveDelay) {
                // Si le doigt est levé avant que le timeOut soit appelé
                killTimeOut = true; // On anule le timeOut

                // Et on fait le calcul maintenant
                xMove = event.changedTouches[0].clientX - xFirst;
                yMove = event.changedTouches[0].clientY - yFirst;
                pause || snake.setDirection(getNewDirection());
            }

            if (Math.abs(xMove) < 9 && Math.abs(yMove) < 9 && touchDelay < 250) {
                // Math.abs(number) : renvoi toujours un nombre positif, donc Math.abs(number) === Math.abs(-number)
                pauseOrReload();
            }

            xMove = 0;
            yMove = 0;
        }
    },
    { passive: false }
);
