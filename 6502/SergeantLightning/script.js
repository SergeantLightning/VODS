// Registers

var A = 0;    // Accumulator
var X = 0;    // X Register
var Y = 0;    // Y Register
var S = 255;  // Stack Pointer

var ROM = [];
var RAM = [];

function start() {
	for (var i = 0; i < 32768; i++) {
		RAM[i] = 0;
	}
	console.log("RAM initialized");
	var file = document.getElementById("img").files[0];
	if (file) {
		const reader = new FileReader();
                
		// Read the file as an ArrayBuffer
		reader.readAsArrayBuffer(file);
                
		reader.onload = function(e) {
                    const arrayBuffer = e.target.result;
                    const byteArray = new Uint8Array(arrayBuffer);
                    // Convert each byte to a hex string
                    for (let i = 0; i < 16384; i++) {
                        const hex = byteArray[i].toString(16).padStart(2, '0'); // Convert to hex
                        ROM.push(hex);
                    }

			// Display hex array
                	console.log("ROM Dump:");
			console.log(ROM);
        	};
	}
	return "This function is currently in development";
}

function toggleRef() {
	if (document.getElementById("ref").style.display != "none") {
		document.getElementById("ref").style.display = "none";
	} else {
		document.getElementById("ref").style.display = "block";
	}
}