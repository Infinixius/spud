const spawn_popup = async (id) => {
	let req = await fetch(`./popups/${id}.html`)
	let html = await req.text()

	let overlay = document.createElement("div")
	overlay.classList.add("popup_background")

	let popup = document.createElement("div")
	popup.id = `popup_${id}`
	popup.classList.add("popup")
	popup.innerHTML = html

	document.body.insertBefore(overlay, document.querySelector("#main"))
	document.body.insertBefore(popup, document.querySelector("#main"))
}

const remove_popup = (id) => {
	document.querySelector(`#popup_${id}`).remove()
	document.querySelector(".popup_background").remove()
}

/* Popup events */

const popup_editjson_cancel_onclick = () => {
	remove_popup("editjson")
}

const popup_editjson_save_onclick = () => {
	let json = document.querySelector("#popup_editjson_json").value

	SAVE_FILE = JSON.parse(json)
	deserializeFormJSON()
	remove_popup("editjson")
}