export const rounded = (context, cellSize) => {
	const radius = cellSize / 2;
	const fullCircle = coor => context.arc(coor.x + radius, coor.y + radius, radius, 0, Math.PI * 2); // x, y : coordonnées du centre, rayon, angleDépart, angleFin (Math.PI * 2 : cercle complet, Math.PI : demi-cercle), sensAntiHoraire.,

	return {
		snake: {
			head: coor => {
				context.rect(coor.x, coor.y, radius, cellSize);
				fullCircle(coor);
			},
			body: coor => {
				context.fillRect(coor.x, coor.y, cellSize, cellSize); // (position x, position y, largeur, hauteur).
			},
			turn: (coor, turn) => {
				context.rect(coor.x, coor.y, radius, cellSize);
				context.rect(coor.x, coor.y + (turn === "right" ? radius : 0), cellSize, radius);
				fullCircle(coor);
			},
			tail: coor => {
				context.rect(coor.x + radius, coor.y, radius, cellSize);
				fullCircle(coor);
			},
		},
		apple: fullCircle,
	};
};
