const show_warning = (message) => {
	const warning = document.querySelector("#warning")
	warning.querySelector("#warning_text").innerText = message
	warning.style.display = "block"
}

clearForm()

const item_ids = Object.keys(ITEM_NAME_TO_SPRITE_ID)

for (const item_id of item_ids) {
	const name = ITEM_ID_TO_NAME[item_id]
	const sprite_id = eval(ITEM_NAME_TO_SPRITE_ID[item_id])

	// <tr>
	// 	<td></td>
	// 	<td>Ankh</td>
	// </tr>

	console.log(sprite_id)

	const html = `<tr><td><div class="item_icon"></div></td><td>${name}</td></tr>`

	document.querySelector("#inventory").insertAdjacentHTML("beforeend", html)
}