const show_warning = (message) => {
	const warning = document.querySelector("#warning")
	warning.querySelector("#warning_text").innerText = message
	warning.style.display = "block"
}

document.querySelectorAll(".form_inventory_generic_enchant").forEach(input => {
	input.innerHTML = get_enchantments("none")
})

clearForm()