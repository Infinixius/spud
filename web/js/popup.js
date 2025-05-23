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

// TODO: Pressing "esc" should close any popup
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

const popup_edititemjson_cancel_onclick = () => {
	remove_popup("edititemjson")
}

const popup_edititemjson_save_onclick = () => {
	let json_text = document.querySelector("#popup_edititemjson_json").value
	let element_id = document.querySelector("#popup_edititemjson_json").dataset.element_id
	let element = document.querySelector(`#${element_id}`)

	try {
		let json = JSON.parse(json_text)
		const item_id = json["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.", "").replace("items.", "").replace("$Seed" , "").toLowerCase()

		element.querySelector(".form_inventory_generic_icon").style = get_item_sprite(item_id)
		element.querySelector(".form_inventory_generic_name").innerText = ITEM_ID_TO_NAME[item_id]
		element.querySelector(".form_inventory_generic_level").value = json.level
		element.querySelector(".form_inventory_generic_quantity").value = json.quantity
		element.querySelector(".form_inventory_generic_cursed").checked = json.cursed

		element.dataset.json = JSON.stringify(json)
	} catch (err) {
		console.error(err)
		show_warning(`Failed to parse custom JSON.`)
	}

	remove_popup("edititemjson")
}

const popup_additem_cancel_onclick = () => {
	remove_popup("additem")
}

const popup_additem = (element) => {
	let json = {
		"cursedKnown": false,
		"quantity": 1,
		"levelKnown": false,
		"cursed": false,
		"level": 0,
		"__className": ITEM_ID_TO_GAME_ID[element.dataset.item_id],
		"kept_lost": false
	}
	if (element.dataset.item_id.includes("armor")) {
		json.augment = "NONE" // weird bug
	}

	deserialize_inventory_items([json], document.querySelector("#form_inventory_main"))
	remove_popup("additem")
}

const popup_extra_save_onclick = () => {
	remove_popup("extra")
}

const popup_extra_cancel_onclick = () => {
	remove_popup("extra")
}