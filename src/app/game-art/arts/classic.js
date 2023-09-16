export const classic = (context, cellSize) => {
	const squareCellWithGap = coor => {
		const gap = (cellSize * 20) / 100;
		context.rect(coor.x + gap / 2, coor.y + gap / 2, cellSize - gap, cellSize - gap);
	};
	const snake = {};
	snake.head = snake.body = snake.turn = snake.tail = squareCellWithGap;

	return {
		snake,
		apple: squareCellWithGap,
	};
};
