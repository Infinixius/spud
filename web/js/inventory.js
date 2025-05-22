const ACTIVE_WEAPON = document.querySelector("#form_inventory_active_weapon")
const ACTIVE_ARMOR = document.querySelector("#form_inventory_active_armor")
const ACTIVE_ARTIFACT = document.querySelector("#form_inventory_active_artifact")
const ACTIVE_ARTIFACTORRING = document.querySelector("#form_inventory_active_artifactorring")
const ACTIVE_RING = document.querySelector("#form_inventory_active_ring")

var inventory_item_counter = 0

const get_item_sprite = (item_id) => {
	if (!ITEM_NAME_TO_SPRITE[item_id.toLowerCase()]) return get_item_sprite("bags.bag") // return default ? sprite

	let sprite_xy = eval((ITEM_NAME_TO_SPRITE[item_id.toLowerCase()] ?? {}).pos)
	let sprite_clip = ITEM_NAME_TO_SPRITE_RECT[(ITEM_NAME_TO_SPRITE[item_id.toLowerCase()] ?? {}).id]
	let invert = ITEM_NAME_TO_SPRITE[item_id.toLowerCase()].pos == "SOMETHING"

	if (item_id.startsWith("potions.") || item_id.startsWith("scrolls.") || item_id.startsWith("rings.")) {
		var icon_type = item_id.split(".")[0].toUpperCase().slice(0, -1)
		var icon_color = SAVE_FILE[`${ITEM_ID_TO_GAME_ID[item_id].split(".").pop()}_label`] || SAVE_FILE[`${EXOTIC_ID_TO_REGULAR_ID[ITEM_ID_TO_GAME_ID[item_id].split(".").pop()]}_label`]

		if (icon_color) {
			sprite_xy = eval(SPRITE_ID_TO_SPRITE_ICON_POS[`${icon_type}_${icon_color.toUpperCase()}`])
			if (item_id.includes("exotic")) sprite_xy += 16
			sprite_clip = ITEM_NAME_TO_SPRITE_RECT[`${icon_type}_${icon_color.toUpperCase()}`]
			invert = false
		}
	}

	let [x, y] = rxy(sprite_xy)
	if (sprite_clip) {
		var [clip_x, clip_y] = [sprite_clip.x, sprite_clip.y]
	} else {
		var [clip_x, clip_y] = [16, 16]
	}

	let style_string = ""

	// style_string += `background-image: url(./assets/items/${item_id}.png);`
	style_string += `background-position: -${(x * 16) - 16}px -${(y * 16) - 16}px;`
	style_string += `width: ${clip_x}px;`
	style_string += `height: ${clip_y}px;`
	style_string += invert ? "filter: invert(100%);" : ""
	// style_string += icon ? `" data-overlay-icon="${icon_type}_${icon_color.toUpperCase()}` : ""

	return style_string
}

const get_item_small_sprite = (item_id) => {
	if (item_id.startsWith("potions.") || item_id.startsWith("scrolls.") || item_id.startsWith("rings.")) {
		let icon_id = ITEM_NAME_TO_SPRITE[item_id].icon

		if (icon_id && SPRITE_ID_TO_SPRITE_ICON_POS[icon_id]) {
			let pos = eval(SPRITE_ID_TO_SPRITE_ICON_POS[icon_id].replace("+", "_ICON+"))

			let [x, y] = rxy(pos)

			let style_string = `background-position: -${(x * 8) - 8}px -${(y * 8) - 8}px;`

			return style_string
		} else {
			return "display: none;"
		}
		// var icon_type = item_id.split(".")[0].toUpperCase().slice(0, -1)
		// var icon_color = SAVE_FILE[`${ITEM_ID_TO_GAME_ID[item_id].split(".").pop()}_label`] || SAVE_FILE[`${EXOTIC_ID_TO_REGULAR_ID[ITEM_ID_TO_GAME_ID[item_id].split(".").pop()]}_label`]

		// console.log(icon_type, icon_color)
		// if (icon_color) {
		// 	let iconpos = eval(SPRITE_ID_TO_SPRITE_ICON_POS[`${icon_type}_${icon_color.toUpperCase()}`].replace("+", "_ICON+"))
		// 	console.log(SPRITE_ID_TO_SPRITE_ICON_POS[`${icon_type}_${icon_color.toUpperCase()}`])

		// 	let [x, y] = r8xy(iconpos)
		// 	// if (item_id.includes("exotic")) y += 8

		// 	return `background-position: -${(x * 8) - 8}px -${(y * 8) - 8}px; width: 8px; height: 8px;`
		// }
	} else {
		return "display: none;"
	}
}

// TODO: see what happens when you try to deserialize an item not in data.js
const derserialize_inventory = () => {
	if (SAVE_FILE.hero.weapon) deserialize_equipped_item(SAVE_FILE.hero.weapon, ACTIVE_WEAPON)
	if (SAVE_FILE.hero.armor) deserialize_equipped_item(SAVE_FILE.hero.armor, ACTIVE_ARMOR)
	if (SAVE_FILE.hero.artifact) deserialize_equipped_item(SAVE_FILE.hero.artifact, ACTIVE_ARTIFACT)
	if (SAVE_FILE.hero.misc) deserialize_equipped_item(SAVE_FILE.hero.misc, ACTIVE_ARTIFACTORRING)
	if (SAVE_FILE.hero.ring) deserialize_equipped_item(SAVE_FILE.hero.ring, ACTIVE_RING)

	deserialize_inventory_items(SAVE_FILE.hero.inventory, document.querySelector("#form_inventory_main"))
}
const deserialize_inventory_items = (items, table_element) => {
	items.forEach(item => {
		const item_id = item["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.", "").replace("items.", "").replace("$Seed" , "").toLowerCase()
		const name = ITEM_ID_TO_NAME[item_id]?? item["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.", "").replace("$Seed" , "").replaceAll("..", ".")

		// Because we don't specify a tbody, the browser creates one automatically
		// see: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody#not_specifying_a_body
		let element = `<tr class="form_inventory_main_item inventory_item" id="form_inventory_generic_${inventory_item_counter++}">
			<td>
				<div class="item_icon form_inventory_generic_icon" style="${get_item_sprite(item_id)}"></div>
				<div class="item_small_icon" style="${get_item_small_sprite(item_id)}"></div>
			</td>
			<td class="form_inventory_generic_name">${name}</td>
			<td><input type="number" class="smaller form_inventory_generic_level" min="1" value="${item.level}"></td>
			<td><input type="number" class="smaller form_inventory_generic_quantity" min="1" value="${item.quantity}"></td>
			<td><input type="checkbox" class="form_inventory_generic_cursed" ${item.cursed ? "checked" : ""}></td>
			<td>
				<button onclick="button_editjson(this)">json</button>
				<button onclick="button_delete(this)">delete</button>
			</td>
		</tr>`

		table_element.insertAdjacentHTML("beforeend", element)
		table_element.lastChild.querySelector("tr").dataset.json = JSON.stringify(item)

		if (item_id == "bags.velvetpouch" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_pouch"))
		if (item_id == "bags.scrollholder" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_scrolls"))
		if (item_id == "bags.potionbandolier" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_potions"))
	})
}
const deserialize_equipped_item = (item_data, element) => {
	const item_id = item_data["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.", "").replace("items.", "")
	const name = ITEM_ID_TO_NAME[item_id.toLowerCase()]
	const sprite_xy = eval(ITEM_NAME_TO_SPRITE[item_id.toLowerCase()].pos)
	const sprite_clip = ITEM_NAME_TO_SPRITE_RECT[ITEM_NAME_TO_SPRITE[item_id.toLowerCase()].id]

	const quantity = item_data.quantity
	const level = item_data.level
	const cursed = item_data.cursed

	element.dataset.json = JSON.stringify(item_data)
	element.querySelector(".form_inventory_generic_name").innerText = name
	element.querySelector(".form_inventory_generic_level").value = level
	element.querySelector(".form_inventory_generic_quantity").value = quantity
	element.querySelector(".form_inventory_generic_cursed").checked = cursed

	let [x, y] = rxy(sprite_xy)
	if (sprite_clip) {
		var [clip_x, clip_y] = [sprite_clip.x, sprite_clip.y]
	} else {
		var [clip_x, clip_y] = [16, 16]
	}

	let invert = ITEM_NAME_TO_SPRITE[item_id.toLowerCase()].pos == "SOMETHING" ? "filter: invert(100%);" : ""
	element.querySelector(".item_icon").style = `background-position: -${(x * 16) - 16}px -${(y * 16) - 16}px; width: ${clip_x}px; height: ${clip_y}px; ${invert}`
}

const serialize_inventory = () => {
	let inventory = []

	document.querySelector("#form_inventory_main").querySelectorAll(".inventory_item").forEach(item => {
		let json = JSON.parse(serialize_table_row(item))
		const item_id = json["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.", "").replace("items.", "").replace("$Seed" , "").toLowerCase()

		if (item_id == "bags.velvetpouch") {
			json.inventory = serialize_sub_inventory("#form_inventory_pouch")
		} else if (item_id == "bags.scrollholder") {
			json.inventory = serialize_sub_inventory("#form_inventory_scrolls")
		} else if (item_id == "bags.potionbandolier") {
			json.inventory = serialize_sub_inventory("#form_inventory_potions")
		}

		inventory.push(json)
	})

	if (ACTIVE_WEAPON.dataset.json) {
		let json = JSON.parse(serialize_table_row(ACTIVE_WEAPON))
		SAVE_FILE.hero.weapon = json
	}
	if (ACTIVE_ARMOR.dataset.json) {
		let json = JSON.parse(serialize_table_row(ACTIVE_ARMOR))
		SAVE_FILE.hero.armor = json
	}
	if (ACTIVE_ARTIFACT.dataset.json) {
		let json = JSON.parse(serialize_table_row(ACTIVE_ARTIFACT))
		SAVE_FILE.hero.artifact = json
	}
	if (ACTIVE_ARTIFACTORRING.dataset.json) {
		let json = JSON.parse(serialize_table_row(ACTIVE_ARTIFACTORRING))
		SAVE_FILE.hero.misc = json
	}
	if (ACTIVE_RING.dataset.json) {
		let json = JSON.parse(serialize_table_row(ACTIVE_RING))
		SAVE_FILE.hero.ring = json
	}

	SAVE_FILE.hero.inventory = inventory
}
const serialize_sub_inventory = (table_id) => {
	let sub_inventory = []
	document.querySelector(table_id).querySelectorAll(".inventory_item").forEach(pouch_item => {
		let pouch_json = JSON.parse(serialize_table_row(pouch_item))
		sub_inventory.push(pouch_json)
	})
	return sub_inventory
}
const serialize_table_row = (element) => {
	let json = JSON.parse(element.dataset.json)
	const form_level = element.querySelector(".form_inventory_generic_level").value
	const form_quantity = element.querySelector(".form_inventory_generic_quantity").value
	const form_cursed = element.querySelector(".form_inventory_generic_cursed").checked
	
	json.level = Number(form_level)
	json.quantity = Number(form_quantity)
	json.cursed = form_cursed

	element.dataset.json = JSON.stringify(json)
	return JSON.stringify(json)
}

const reset_inventory = () => {
	document.querySelectorAll(".form_inventory_main_item").forEach(item => {
		item.parentElement.remove()
	})

	document.querySelector("#form_inventory_active_weapon").querySelector(".item_icon").style = "background-position: -16px -0px; width: 14px; height: 14px;"
	document.querySelector("#form_inventory_active_armor").querySelector(".item_icon").style = "background-position: -32px -0px; width: 14px; height: 12px;	"
	document.querySelector("#form_inventory_active_artifact").querySelector(".item_icon").style = "background-position: -96px -0px; width: 15px; height: 15px;"
	document.querySelector("#form_inventory_active_artifactorring").querySelector(".item_icon").style = "background-position: -0px -0px; width: 8px; height: 13px;"
	document.querySelector("#form_inventory_active_ring").querySelector(".item_icon").style = "background-position: -80px -0px; width: 8px; height: 10px;"

	document.querySelectorAll(".form_inventory_generic_name").forEach(item => {
		item.innerText = ""
	})
}

const button_editjson = (element) => {
	const before_json = element.parentElement.parentElement.dataset.json
	
	if (before_json) {
		const after_json = serialize_table_row(element.parentElement.parentElement)
		spawn_popup("edititemjson").then(() => {
			document.querySelector("#popup_edititemjson_json").value = JSON.stringify(JSON.parse(after_json), null, 2)
			document.querySelector("#popup_edititemjson_json").dataset.element_id = element.parentElement.parentElement.id
		})
	}
}
const button_delete = (element) => {
	let tr = element.parentElement.parentElement

	if (tr.classList.contains("form_inventory_active_item")) {
		tr.querySelector(".form_inventory_generic_icon").style = ""
		tr.querySelector(".form_inventory_generic_name").innerText = ""
		tr.querySelector(".form_inventory_generic_level").value = 0
		tr.querySelector(".form_inventory_generic_quantity").value = 0
		tr.querySelector(".form_inventory_generic_cursed").checked = false

		tr.dataset.json = ""
	} else if (tr.classList.contains("form_inventory_main_item")) {
		if (tr.parentElement.localName == "tbody") {
			tr.parentElement.remove()
		} else {
			tr.remove()
		}
	}
}

document.querySelector("#form_inventory_main_additem").addEventListener("click", () => {
	spawn_popup("additem").then(() => {
		Object.keys(ITEM_ID_TO_NAME).forEach(item_id => {
			let element = `<tr>
				<td>
					<div class="item_icon" style="${get_item_sprite(item_id)}"></div>
					<div class="item_small_icon" style="${get_item_small_sprite(item_id)}"></div>
				</td>
				<td><a data-item_id="${item_id}" class="popup_additem_list_item" href="javascript:void(0);" onclick="popup_additem(this)">${ITEM_ID_TO_NAME[item_id]}</a></td>
			</tr>`

			document.querySelector("#popup_additem_list").insertAdjacentHTML("beforeend", element)
		})
	})
})