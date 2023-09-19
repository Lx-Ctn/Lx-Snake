import Color from "@lxweb/color";

const mainColor = new Color("hsl(160, 7%, 25%)"); // green
const accentColor = new Color("hsl(345, 90%, 60%)"); // red
const backgroundColor = new Color("hsl(34, 14%, 91%)");

export default {
	green: mainColor.toHsl(),
	red: accentColor.toHsl(),
	oldWhite: backgroundColor.toHsl(),
};

document.documentElement.style.setProperty("--green", mainColor.toHsl());
document.documentElement.style.setProperty("--red", accentColor.toHsl());
document.documentElement.style.setProperty("--oldWhite", backgroundColor.toHsl());
