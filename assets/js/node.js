// this is the only way i could get gzip/gunzip working in the browser
// hopefully i come up with a less-hacky solution in the future

window.zlib = require("zlib")
window.buffer = require("buffer")
window.filesaver = require("file-saver")