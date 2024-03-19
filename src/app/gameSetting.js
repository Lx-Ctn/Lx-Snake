const DEFAULT = {
	// Game :
	INITIAL_SPEED: 140, // Time between frames : shorter increase game speed;
	ACCELERATION: 3,
	MAX_SPEED: 40,

	GAMEPLAY: "mirror",
	GAME_ART: "evil",

	// Main canvas :
	WIDTH: 25, // nb of cell
	HEIGHT: 20, // nb of cell
	CELL_SIZE: 30, // px
	FONT_SIZE: 50, // px

	// Preview canvas in setting panel :
	PREVIEW: {
		SNAKE_LENGTH: 7, // nb of cell
		HEIGHT: 3, // nb of cell
		CELL_SIZE: 20, // px
		FONT_SIZE: 50, // px
	},
};

const resolution = window.devicePixelRatio || 1;

/** All game setting in a object to keep live update of the values (passed by ref)  */
export const gameSetting = {
	initialSpeed: DEFAULT.INITIAL_SPEED,
	acceleration: DEFAULT.ACCELERATION,
	maxSpeed: DEFAULT.MAX_SPEED,

	selectedGamePlay: DEFAULT.GAMEPLAY,
	selectedGameArt: DEFAULT.GAME_ART,

	resolution,
	initialSnakeBody: [
		{ coor: { x: 5, y: 2 }, direction: "right" },
		{ coor: { x: 4, y: 2 }, direction: "right" },
		{ coor: { x: 3, y: 2 }, direction: "right" },
	],
	initialAppleCoor: { x: 6, y: 8 },

	/** Main game canvas setting */
	canvas: {
		// Taking screen resolution into consideration to keep a nice display quality on retina screen :
		// Canvas size is multiply, and will be divided with CSS
		width: resolution * DEFAULT.WIDTH * DEFAULT.CELL_SIZE,
		height: resolution * DEFAULT.HEIGHT * DEFAULT.CELL_SIZE,
		cellSize: resolution * DEFAULT.CELL_SIZE,
		maxCellsInWidth: DEFAULT.WIDTH,
		maxCellsInHeight: DEFAULT.HEIGHT,

		getFontStyle: ({ fontSize } = { fontSize: DEFAULT.FONT_SIZE }) =>
			`bold ${resolution * fontSize}px "Courier New", Courier, monospace`,
	},

	/** Canvas setting for art preview in the art selection panel */
	preview: {
		width: resolution * (DEFAULT.PREVIEW.SNAKE_LENGTH + 2) * DEFAULT.PREVIEW.CELL_SIZE,
		height: resolution * DEFAULT.PREVIEW.HEIGHT * DEFAULT.PREVIEW.CELL_SIZE,
		cellSize: resolution * DEFAULT.PREVIEW.CELL_SIZE,

		get snakePreviewBody() {
			const snakePreviewBody = [];
			for (let i = 1; i <= DEFAULT.PREVIEW.SNAKE_LENGTH; i++) {
				snakePreviewBody.unshift({ coor: { x: i, y: 1 }, direction: "right" });
			}
			return snakePreviewBody;
		},
	},
};
