// Updates all form values with the values from SAVE_FILE
const deserializeFormJSON = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		const formElement = document.querySelector(`#${key}`)
		if (formElement) {
			// We have to use eval because it supports periods (ex: "hero.HP")
			eval(`formElement.value = SAVE_FILE.${JSON_FORM_MAP[key]}`)
		}
	})
}

// Updates SAVE_FILE with values from the form
const serializeFormJSON = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		const formElement = document.querySelector(`#${key}`)
		if (formElement) {
			eval(`SAVE_FILE.${JSON_FORM_MAP[key]} = formElement.value`)
		}
	})
}

// Clear all form inputs
const clearForm = () => {
	Object.keys(JSON_FORM_MAP).forEach(key => {
		document.querySelector(`#${key}`).value = ""
	})
	document.querySelectorAll("input").forEach(input => input.disabled = true)
	document.querySelectorAll("button").forEach(input => input.disabled = true)
	document.querySelector("#form_file").disabled = false

}