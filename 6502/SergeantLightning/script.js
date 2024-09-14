// Registers

var A = 0;                        // Accumulator
var X = 2;                        // X Register
var Y = 4;                        // Y Register
var SP = 255;                     // Stack Pointer
var PC = 0;                       // Program Counter
var F = [0, 0, 0, 0, 0, 0, 0, 0]; // Flags

// Memory
var ROM = [];                     // Mapped to addresses 49152 - 65535
var RAM = [];                     // Mapped to addresses 0     - 48127
var VRAM = [];                    // Mapped to addresses 48128 - 49149
var KBIN = 0;                     // Mapped to address  49150
var COM = 0;                      // Mapped to address  49151

function randomByte() {
	return Math.floor(Math.random() * 256);
}

function start() {
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
	document.getElementById("welcome").style.display = "none";
	document.getElementById("machine").style.display = "block";
}

function reset() {
	console.log("\nRESETTING MACHINE\n");
	for (var i = 0; i < 48128; i++) {
		RAM[i] = 0;
	}
	for (var i = 0; i < 64; i++) {
		RAM[i] = i;
	}
	console.log("RAM initialized");
	for (var i = 0; i < 1022; i++) {
		VRAM[i] = 0;
	}
	console.log("VRAM initialized");
	document.getElementById("screen").innerHTML = "";
	var startAddr = "" + ROM[16381] + ROM[16380]; // Load reset vector
	console.log("Start address in hex: " + startAddr);
	startAddr = parseInt(startAddr, 16);
	startAddr = Number(startAddr);
	PC = (startAddr);
	console.log("Program Counter set to: " + PC);
	console.log("Starting machine...\n");
}

function run() {
	/*
	
		WARNING: SUPER LONG IF ELSE BLOCK COMING
	
	*/

	var byte = ROM[(PC - 49152)];
	console.log("Current instruction: " + byte);

	/*
	
		LDA varients

	*/

	if (byte == "a9") {
		PC += 1;
		A = ROM[(PC - 49152)];
	} else if (byte == "a5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A = RAM[target];
	} else if (byte == "b5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A = RAM[target];
	} else if (byte == "ad") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[memAddr];
		PC += 1;
	} else if (byte == "bd") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[(memAddr + X)];
		PC += 1;
	} else if (byte == "b9") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[(memAddr + Y)];
		PC += 1;
	}
	
	/*
	
		LDX varients

	*/
	
	else if (byte == "a2") {
		PC += 1;
		X = ROM[(PC - 49152)];
	} else if (byte == "a6") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		X = RAM[target];
	} else if (byte == "b6") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += Y;
		X = RAM[target];
	} else if (byte == "ae") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		X = RAM[memAddr];
		PC += 1;
	} else if (byte == "be") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		X = RAM[(memAddr + Y)];
		PC += 1;
	}

	/*
	
		LDY varients

	*/
	
	else if (byte == "a0") {
		PC += 1;
		Y = ROM[(PC - 49152)];
	} else if (byte == "a4") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		Y = RAM[target];
	} else if (byte == "b4") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		Y = RAM[target];
	} else if (byte == "ac") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		Y = RAM[memAddr];
		PC += 1;
	} else if (byte == "bc") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		Y = RAM[(memAddr + X)];
		PC += 1;
	}

	PC += 1;
	document.getElementById("A").innerHTML = A;
	document.getElementById("X").innerHTML = X;
	document.getElementById("Y").innerHTML = Y;
	document.getElementById("SP").innerHTML = SP;
	document.getElementById("PC").innerHTML = PC;
}

function toggleRef() {
	if (document.getElementById("ref").style.display != "none") {
		document.getElementById("ref").style.display = "none";
	} else {
		document.getElementById("ref").style.display = "block";
	}
}