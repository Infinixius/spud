const show_warning = (message) => {
	const warning = document.querySelector("#warning")
	warning.querySelector("#warning_text").innerText = message
	warning.style.display = "block"
}

document.querySelectorAll(".form_inventory_generic_enchant").forEach(input => {
	input.innerHTML = get_enchantments("none")
})

clearForm()

var audio = new Audio("assets/theme.mp3")
audio.volume = 0.5
document.querySelector("#musicflip").addEventListener("click", () => {
	if (audio.paused) {
		audio.play()
	} else {
		audio.pause()
		audio.currentTime = 0
	}
})