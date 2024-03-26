// Test fullscreen :
// check "esc" key conflict to exit fullsreen

const fullscreenButton = document.getElementById("fullscreen-button");

/** Display the fullscreen button only for compatible screen & handle enter/exit fullscreen */
export function handleFullscreen() {
	// Disable fullscreen on touch device because "swipe down to exit fullscreen" conflict with the game touch controls (Os level, can't change with JS)
	if (!document.fullscreenEnabled || navigator.maxTouchPoints) return;

	fullscreenButton.style.display = "block";
	fullscreenButton.addEventListener("click", () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.body.requestFullscreen({ navigationUI: "hide" });
		}
	});

	// Some browser provide their own ui for fullscreen :
	document.addEventListener("fullscreenchange", () => {
		if (document.fullscreenElement) {
			displayExitFullscreenIcon();
		} else {
			displayEnterFullscreenIcon();
		}
	});
}

function displayEnterFullscreenIcon() {
	fullscreenButton.dataset.fullscreen = "off";
	fullscreenButton.title = "Enter fullscreen";
}

function displayExitFullscreenIcon() {
	fullscreenButton.dataset.fullscreen = "on";
	fullscreenButton.title = "Exit fullscreen";
}
