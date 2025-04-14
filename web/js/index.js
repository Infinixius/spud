const show_warning = (message) => {
	const warning = document.querySelector("#warning")
	warning.querySelector("#warning_text").innerText = message
	warning.style.display = "block"
}

clearForm()