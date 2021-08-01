const zlib = window.zlib
const Buffer = window.buffer.Buffer
const filesaver = window.filesaver
var audio = new Audio("assets/music.mp3")
var saveFileInput = document.getElementById("form_file")
var saveFile

// setup bindings

var bindingsreq = new XMLHttpRequest()
bindingsreq.open("GET", "./assets/bindings.json", false)
bindingsreq.send(null)
var bindings = JSON.parse(bindingsreq.responseText)

// utility functions
function status(string) {
	document.getElementById("status").innerHTML = "Status: "+string
}
function showError(string) {
	document.getElementById("error").innerHTML = string
}

// save data handling
function load() {
	// eval() should be safe here since this is a purely client-side website and there isn't any user input
	for (const x of bindings) {
		if (document.getElementById(x[0]).type == "checkbox") {
			eval("document.getElementById('"+x[0]+"').checked = saveFile."+x[1])
		} else {
			eval("document.getElementById('"+x[0]+"').value = saveFile."+x[1])
		}
	}
}

function save() {
	for (const x of bindings) {
		if (document.getElementById(x[0]).type == "number") {
			eval("saveFile."+x[1]+" = parseInt(document.getElementById('"+x[0]+"').value)")
		} else if (document.getElementById(x[0]).type == "checkbox") {
			eval("saveFile."+x[1]+" = document.getElementById('"+x[0]+"').checked")
		} else {
			eval("saveFile."+x[1]+" = document.getElementById('"+x[0]+"').value")
		}
	}
}

// handle file uploads
saveFileInput.addEventListener("change", function(event) {
	var file = saveFileInput.files[0]
	var reader = new FileReader()
	
	if (!file) return status("No file uploaded. Waiting")
	reader.onload = function() {
		let buffer = Buffer.from(reader.result)
		status("Unpacking save")
		showError("")
		
		try {
			if (!document.getElementById("form_gzip").checked) {
				saveFile = zlib.gunzipSync(buffer)
			}
		} catch (error) {
			if (error.message == "incorrect header check") {
				showError("Error: Failed to gunzip/ungzip the file. You likely didn't upload a correct save file, please upload game.dat")
			} else { showError(error) }
			return status("Error: Failed to unpack. Waiting")
		}
		
		try { saveFile = JSON.parse(saveFile) } catch (error) {
			console.error(error)
			showError(error)
			return status("Failed to read unpacked data. Waiting.")
		}
		
		status("Successfully read save. Waiting")
		load()
	}
	
	status("Reading file")
	reader.readAsArrayBuffer(file)
})

// button events
document.getElementById("form_reset").onclick = function() {
	for (x of document.getElementsByTagName("input")){
		x.value = ""
	}
	status("Reset all values. Waiting")
}

document.getElementById("form_save").onclick = function() {
	if (!saveFile) {
		return status("You haven't imported a save file yet! Waiting")
	}
	save()
	let buffer = Buffer.from(JSON.stringify(saveFile))
	status("Downloading..")
	try {
		if (!document.getElementById("form_gzip").checked) {
			buffer = zlib.gzipSync(buffer)
		}
	} catch (error) {
		console.error(error)
		showError(error)
		return status("Failed to gzip data. Waiting.")
	}
	
	console.log(buffer.toString())
	// download file
	var file = new File([buffer], "game.dat", {type: "application/octet-stream;charset=utf-8"})
	filesaver.saveAs(file)
	status("Downloaded. Waiting")
}

document.getElementById("secret").onclick = function() {
	if (audio.paused) {
		audio.play()
	} else {
		audio.pause()
		audio.currentTime = 0
	}
}

// initalization

for (x of document.getElementsByTagName("input")){
	x.value = ""
}

status("Waiting")