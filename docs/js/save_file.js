// This file is responsible for handling save file uploads/downloads
const SAVE_FILE_INPUT = document.querySelector("#form_file")
const DOWNLOAD_BUTTON = document.querySelector("#form_download")

let SAVE_FILE = {}

// handle file uploads
SAVE_FILE_INPUT.addEventListener("change", function(event) {
	var file = SAVE_FILE_INPUT.files[0]
	var reader = new FileReader()
	
	if (!file) return console.log("no file uploaded?")
	reader.onload = function() {
		try {
			let ungzipped_raw = pako.ungzip(reader.result)
			var ungzipped_string = new TextDecoder().decode(ungzipped_raw)
			console.log("ungzipped save data")
			var json = JSON.parse(ungzipped_string)
			console.log("parsed save data")
			console.log(json)
			
			SAVE_FILE = json
			clearForm()
			deserializeFormJSON()

			if (SAVE_FILE["version"] !== SUPPORTED_GAME_VERSION) {
				show_warning(`Save file version mismatch! Expected ${SUPPORTED_GAME_VERSION}, but got ${SAVE_FILE["version"]}. Some features may not work correctly.`)
			}

			document.querySelectorAll("input").forEach(input => input.disabled = false)
			document.querySelectorAll("select").forEach(input => input.disabled = false)
			document.querySelectorAll("button").forEach(input => input.disabled = false)
		} catch (err) {
			console.log("failed to read file!")
			console.error(err)
			show_warning("Failed to read save file. Check browser console for details.")
		}
	}
	
	console.log("reading file")
	reader.readAsArrayBuffer(file)
})

DOWNLOAD_BUTTON.addEventListener("click", function() {
	serializeFormJSON()
	var string = JSON.stringify(SAVE_FILE)
	var compressed = pako.gzip(string)
	console.log("gzipped save data")
	
	// create a blob from the compressed data
	var blob = new Blob([compressed], { type: "application/gzip" })
	
	// create a link element to download the blob
	var link = document.createElement("a")
	link.href = URL.createObjectURL(blob)
	link.download = "game.dat"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	console.log("downloading file")
})
