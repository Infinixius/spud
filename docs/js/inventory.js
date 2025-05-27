const ACTIVE_WEAPON = document.querySelector("#form_inventory_active_weapon")
const ACTIVE_ARMOR = document.querySelector("#form_inventory_active_armor")
const ACTIVE_ARTIFACT = document.querySelector("#form_inventory_active_artifact")
const ACTIVE_ARTIFACTORRING = document.querySelector("#form_inventory_active_artifactorring")
const ACTIVE_RING = document.querySelector("#form_inventory_active_ring")

var inventory_item_counter = 0

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
		const item_schema = ITEMS.find(i => i.game_id == item["__className"])
		if (!item_schema) {
			console.warn(`Item schema not found for "${item["__className"]}" Skipping...`)
			return
		}

		let enchantment = item.enchantment
		if (enchantment) { enchantment = enchantment["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.items.", "") } else enchantment = "none"
		
		// Because we don't specify a tbody, the browser creates one automatically
		// see: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody#not_specifying_a_body
		let element = `<tr class="form_inventory_main_item inventory_item" id="form_inventory_generic_${inventory_item_counter++}">
			<td>
				<div class="item_icon form_inventory_generic_icon" style="${get_item_sprite(item_schema.id)}"></div>
				<div class="item_small_icon" style="${get_item_small_sprite(item_schema.id)}"></div>
			</td>
			<td class="form_inventory_generic_name">${item_schema.name}</td>
			<td><input type="number" class="smaller form_inventory_generic_level" min="1" value="${item.level}"></td>
			<td><input type="number" class="smaller form_inventory_generic_quantity" min="1" value="${item.quantity}"></td>
			<td><select class="form_inventory_generic_enchant">${get_enchantments(item_schema.id, enchantment)}</select></td>
			<td><input type="checkbox" class="form_inventory_generic_cursed" ${item.cursed ? "checked" : ""}></td>
			<td>
				<button onclick="button_editjson(this)">json</button>
				<button onclick="button_delete(this)">delete</button>
			</td>
		</tr>`

		table_element.insertAdjacentHTML("beforeend", element)
		table_element.lastChild.querySelector("tr").dataset.json = JSON.stringify(item)

		if (item_schema.id == "bags.velvetpouch" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_pouch"))
		if (item_schema.id == "bags.scrollholder" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_scrolls"))
		if (item_schema.id == "bags.potionbandolier" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_potions"))
		if (item_schema.id == "bags.magicalholster" && item.inventory) deserialize_inventory_items(item.inventory, document.querySelector("#form_inventory_holster"))
	})
}
const deserialize_equipped_item = (item_data, element) => {
	const item_schema = ITEMS.find(item => item.game_id == item_data["__className"])

	const quantity = item_data.quantity
	const level = item_data.level
	const cursed = item_data.cursed

	let enchantment = item_data.enchantment
		if (enchantment) { enchantment = enchantment["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.items.", "") } else enchantment = "none"
		if (enchantment == "none" && item_data.glyph) {
			enchantment = item_data.glyph["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.items.", "")
		}

	element.dataset.json = JSON.stringify(item_data)
	element.querySelector(".form_inventory_generic_name").innerText = item_schema.name
	element.querySelector(".form_inventory_generic_level").value = level
	element.querySelector(".form_inventory_generic_quantity").value = quantity
	element.querySelector(".form_inventory_generic_enchant").innerHTML = get_enchantments(item_schema.id, enchantment)
	element.querySelector(".form_inventory_generic_enchant").value = enchantment ?? glyph
	element.querySelector(".form_inventory_generic_cursed").checked = cursed

	element.querySelector(".form_inventory_generic_icon").style = get_item_sprite(item_schema.id)
	element.querySelector(".item_small_icon").style = get_item_small_sprite(item_schema.id)
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
		} else if (item_id == "bags.magicalholster") {
			json.inventory = serialize_sub_inventory("#form_inventory_holster")
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
	const form_enchantment = element.querySelector(".form_inventory_generic_enchant").value
	const form_cursed = element.querySelector(".form_inventory_generic_cursed").checked
	
	json.level = Number(form_level)
	json.quantity = Number(form_quantity)
	json.cursed = form_cursed

	if (form_enchantment == "none") {
		json.enchantment = undefined
	} else {
		if (json["__className"].includes("weapon")) {
			json.enchantment = {}
			json.enchantment["__className"] = "com.shatteredpixel.shatteredpixeldungeon.items." + form_enchantment
		} else if (json["__className"].includes("armor")) {
			json.glyph = {}
			json.glyph["__className"] = "com.shatteredpixel.shatteredpixeldungeon.items." + form_enchantment
		}
	}

	element.dataset.json = JSON.stringify(json)
	return JSON.stringify(json)
}

const reset_inventory = () => {
	document.querySelectorAll(".form_inventory_main_item").forEach(item => {
		item.parentElement.remove()
	})

	document.querySelector("#section_inventory").querySelectorAll(".item_icon").forEach(icon => {
		icon.style = "background-position: -16px -0px; width: 14px; height: 14px;"
	})

	document.querySelector("#section_inventory").querySelectorAll(".item_small_icon").forEach(icon => {
		icon.style = "display: none;"
	})

	document.querySelectorAll(".form_inventory_generic_name").forEach(item => {
		item.innerText = ""
	})
}

const button_extra = (element) => {
	let tr = element.parentElement.parentElement

	if (tr.dataset.json) {
		let json = JSON.parse(tr.dataset.json)

		let enchant = json.enchantment

		if (enchant) {
			enchant = enchant["__className"].replace("com.shatteredpixel.shatteredpixeldungeon.items.weapon.", "")
		}

		console.log(enchant)

		spawn_popup("extra").then(() => {
			
		})
	}
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
		tr.querySelector(".form_inventory_generic_enchant").innerHTML = get_enchantments("none")
		tr.querySelector(".form_inventory_generic_enchant").value = "none"
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
		ITEMS.forEach(item_schema => {
			let element = `<tr>
				<td>
					<div class="item_icon" style="${get_item_sprite(item_schema.id)}"></div>
					<div class="item_small_icon" style="${get_item_small_sprite(item_schema.id)}"></div>
				</td>
				<td><a data-item_id="${item_schema.id}" class="popup_additem_list_item" href="javascript:void(0);" onclick="popup_additem(this)">${item_schema.name}</a></td>
			</tr>`

			document.querySelector("#popup_additem_list").insertAdjacentHTML("beforeend", element)
		})
	})
})