import Color from "@lxweb/color";

const mainColor = new Color("hsl(160, 7%, 25%)"); // green
const accentColor = new Color("hsl(345, 90%, 60%)"); // red
const backgroundColor = new Color("hsl(34, 14%, 91%)"); // old white
const visibleColor = new Color({ parentColor: mainColor, saturation: 70, light: 40 });

export default {
	green: mainColor.toHsl(),
	red: accentColor.toHsl(),
	oldWhite: backgroundColor.toHsl(),
	visible: visibleColor.toHsl(),
};

document.documentElement.style.setProperty("--green", mainColor.toHsl());
document.documentElement.style.setProperty("--red", accentColor.toHsl());
document.documentElement.style.setProperty("--old-white", backgroundColor.toHsl());
document.documentElement.style.setProperty("--visible-green", visibleColor.toHsl());
