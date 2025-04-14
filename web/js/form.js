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
}

// Clear all form inputs
const clearForm = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		document.querySelector(`#${key}`).value = ""
		
		if (document.querySelector(`#${key}`).type === "checkbox") {
			document.querySelector(`#${key}`).checked = false
		}
	})
	document.querySelectorAll("input").forEach(input => input.disabled = true)
	document.querySelectorAll("button").forEach(input => input.disabled = true)
	document.querySelector("#form_file").disabled = false

	document.querySelector("#warning").style.display = "none"
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