// This script purely handles the animated background, which
// I tried to get as accurate to the game as possible. It's not perfect, but I think it looks good enough

const FPS = 60
let background_pos_x = 0

let interval = Math.floor(1000 / FPS) // rounding down since our code will rarely run at the exact interval
let startTime = performance.now()
let previousTime = startTime

let currentTime = 0
let deltaTime = 0

const animationLoop = (timestamp) => {
	currentTime = timestamp
	deltaTime = currentTime - previousTime

	if (deltaTime > interval) {
		previousTime = currentTime - (deltaTime % interval)

		background_pos_x -= 2
		document.querySelector("#background_small").style.backgroundPositionY = `${background_pos_x / 2}px`
		document.querySelector("#background_big").style.backgroundPositionY = `${background_pos_x}px`
	}

	requestAnimationFrame(animationLoop)
}
requestAnimationFrame(animationLoop)
