const JSON_FORM_MAP = {
	"form_game_seed": "seed",
	"form_game_version": "version",
	"form_game_current_depth": "depth",
	// "form_game_max_depth": "maxDepth",
	"form_game_amuletobtained": "amuletObtained",

	"form_hero_hp": "hero.HP",
	"form_hero_maxhp": "hero.HT",

	"form_hero_strength": "hero.STR",

	"form_hero_attack": "hero.attackSkill",
	"form_hero_defense": "hero.defenseSkill",

	"form_hero_level": "hero.lvl",
	"form_hero_experience": "hero.exp",

	"form_hero_gold": "gold",
	"form_hero_energy": "energy",
}

// Updates all form values with the values from SAVE_FILE
const deserializeFormJSON = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		try {
			const formElement = document.querySelector(`#${key}`)

			// We have to use eval because it supports periods (ex: "hero.HP")
			eval(`formElement.value = SAVE_FILE.${JSON_FORM_MAP[key]}`)

			// If the form element is a checkbox, set its checked property
			if (formElement.type === "checkbox") {
				formElement.checked = SAVE_FILE[JSON_FORM_MAP[key]]
			}
		} catch (err) {
			console.log(`deserializeFormJSON error with ${key} (${JSON_FORM_MAP[key]}):`)
			console.error(err)
			show_warning("Failed to deserialize save file. Check browser console for details.")
		}
	})

	derserialize_inventory()

	document.querySelector("#form_hero_class").value = SAVE_FILE.hero.class
	if (SAVE_FILE.hero.subClass !== "NONE") {
		document.querySelector("#form_hero_class").value = SAVE_FILE.hero.subClass
	}
}

// Updates SAVE_FILE with values from the form
const serializeFormJSON = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		const formElement = document.querySelector(`#${key}`)
		if (formElement) {
			eval(`SAVE_FILE.${JSON_FORM_MAP[key]} = formElement.value`)

			// If the form element is a checkbox, get the checked property
			if (formElement.type === "checkbox") {
				eval(`SAVE_FILE.${JSON_FORM_MAP[key]} = formElement.checked`)
			}
		}
	})

	serialize_inventory()

	let new_class = document.querySelector("#form_hero_class").value
	if (["WARRIOR", "MAGE", "ROGUE", "HUNTRESS", "DUELIST", "CLERIC"].includes(new_class)) {
		SAVE_FILE.hero.class = new_class
		SAVE_FILE.hero.subClass = null
	} else {
		SAVE_FILE.hero.subClass = new_class
		console.log(new_class)

		if (new_class == "BERSERKER" || new_class == "GLADIATOR") {
			SAVE_FILE.hero.class = "WARRIOR"
		} else if (new_class == "BATTLEMAGE" || new_class == "WARLOCK") {
			SAVE_FILE.hero.class = "MAGE"
		} else if (new_class == "ASSASSIN" || new_class == "FREERUNNER") {
			SAVE_FILE.hero.class = "ROGUE"
		} else if (new_class == "SNIPER" || new_class == "WARDEN") {
			SAVE_FILE.hero.class = "HUNTRESS"
		} else if (new_class == "CHAMPION" || new_class == "MONK") {
			SAVE_FILE.hero.class = "DUELIST"
		} else if (new_class == "PRIEST" || new_class == "PALADIN") {
			SAVE_FILE.hero.class = "CLERIC"
		}
	}

	if (document.querySelector("#form_game_identifyall").checked) {
		Object.keys(SAVE_FILE).filter(key => key.endsWith("_known")).forEach(key => {
			SAVE_FILE[key] = true
		})

		SAVE_FILE.hero.inventory.forEach(item => {
			if (item.cursedKnown !== undefined) item.cursedKnown = true
			if (item.levelKnown !== undefined) item.levelKnown = true
			if (item.curChargeKnown !== undefined) item.curChargeKnown = true

			if (item.inventory) {
				item.inventory.forEach(subItem => {
					if (subItem.cursedKnown !== undefined) subItem.cursedKnown = true
					if (subItem.levelKnown !== undefined) subItem.levelKnown = true
					if (subItem.curChargeKnown !== undefined) subItem.curChargeKnown = true
				})
			}
		})
	}
}

// Clear all form inputs
const clearForm = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		document.querySelector(`#${key}`).value = ""
		
		if (document.querySelector(`#${key}`).type === "checkbox") {
			document.querySelector(`#${key}`).checked = false
		}
	})

	reset_inventory()

	document.querySelectorAll("input").forEach(input => {input.disabled = true; input.value = ""; input.checked = false;})
	document.querySelectorAll("select").forEach(input => {input.disabled = true; input.value = ""})
	document.querySelectorAll("button").forEach(input => input.disabled = true)
	document.querySelector("#form_file").disabled = false
	document.querySelector("#warning").style.display = "none"
	document.querySelectorAll(".form_inventory_generic_enchant").forEach(input => input.value = "none")
}

document.querySelector("#form_reset").addEventListener("click", () => {
	if (confirm("Are you sure you want to reset all values?")) {
		clearForm()
	}
})

document.querySelector("#form_editjson").addEventListener("click", () => {
	serializeFormJSON()
	spawn_popup("editjson").then(() => {
		document.querySelector("#popup_editjson_json").value = JSON.stringify(SAVE_FILE, null, 2)
	})
})