export const full = (context, cellSize) => {
	const fullSquareCell = coor => {
		context.rect(coor.x, coor.y, cellSize, cellSize);
	};
	const snake = {};
	snake.head = snake.body = snake.turn = snake.tail = fullSquareCell;

	return {
		snake,
		apple: fullSquareCell,
	};
};
