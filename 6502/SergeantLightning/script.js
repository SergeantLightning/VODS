// Registers

var A = 0;                        // Accumulator
var X = 2;                        // X Register
var Y = 4;                        // Y Register
var SP = 255;                     // Stack Pointer
var PC = 0;                       // Program Counter
var F = [0, 0, 0, 0, 0, 0, 0, 0]; // Flags --> Carry, Zero, Irq disable, Decimal, B, (unused), oVerflow, Negative

// Memory
var ROM = [];                     // Mapped to addresses 49152 - 65535
var RAM = [];                     // Mapped to addresses 0     - 49149
var KBIN = 0;                     // Mapped to address  49150
var COM = 0;                      // Mapped to address  49151

function randomByte() {
	return Math.floor(Math.random() * 256);
}

function setHTML(id, content) {
	document.getElementById(id).innerHTML = content;
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

function updateRegMon() {
	setHTML("A", A);
	setHTML("X", X);
	setHTML("Y", Y);
	setHTML("SP", SP)
	setHTML("PC", PC);
	setHTML("C", F[0]);
	setHTML("Z", F[1]);
	setHTML("I", F[2]);
	setHTML("D", F[3]);
	setHTML("V", F[6]);
	setHTML("N", F[7]);
}

function updateFlagsByReg(regName) {
	if (regName == "A") {
		(A > 127) ? (F[7] = 1) : (F[7] = 0);
		(A == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (regName == "X") {
		(X > 127) ? (F[7] = 1) : (F[7] = 0);
		(X == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (regName == "Y") {
		(Y > 127) ? (F[7] = 1) : (F[7] = 0);
		(Y == 0) ? (F[1] = 1) : (F[1] = 0);
	}
}

function reset() {
	console.log("\nRESETTING MACHINE\n");
	A = 0;
	X = 2;
	Y = 4;
	SP = 255;
	for (var i = 0; i < 8; i++) {
		F[i] = 0;
	}
	console.log("Flags reset");
	for (var i = 0; i < 49150; i++) {
		RAM[i] = 0;
	}
	for (var i = 0; i < 64; i++) {
		RAM[i] = i;
	}
	console.log("RAM initialized");
	document.getElementById("screen").innerHTML = "";
	var startAddr = "" + ROM[16381] + ROM[16380]; // Load reset vector
	console.log("Start address in hex: " + startAddr);
	startAddr = parseInt(startAddr, 16);
	startAddr = Number(startAddr);
	PC = (startAddr);
	console.log("Program Counter set to: " + PC);
	updateRegMon();
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
		A = parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("A");
	} else if (byte == "a5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A = RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "b5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A = RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "ad") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[memAddr];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "bd") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[(memAddr + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "b9") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = RAM[(memAddr + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}
	
	/*
	
		LDX varients

	*/
	
	else if (byte == "a2") {
		PC += 1;
		X = parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("X");
	} else if (byte == "a6") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		X = RAM[target];
		updateFlagsByReg("X");
	} else if (byte == "b6") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += Y;
		X = RAM[target];
		updateFlagsByReg("X");
	} else if (byte == "ae") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		X = RAM[memAddr];
		PC += 1;
		updateFlagsByReg("X");
	} else if (byte == "be") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		X = RAM[(memAddr + Y)];
		PC += 1;
		updateFlagsByReg("X");
	}

	/*
	
		LDY varients

	*/
	
	else if (byte == "a0") {
		PC += 1;
		Y = parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("Y");
	} else if (byte == "a4") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		Y = RAM[target];
		updateFlagsByReg("Y");
	} else if (byte == "b4") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		Y = RAM[target];
		updateFlagsByReg("Y");
	} else if (byte == "ac") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		Y = RAM[memAddr];
		PC += 1;
		updateFlagsByReg("Y");
	} else if (byte == "bc") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		Y = RAM[(memAddr + X)];
		PC += 1;
		updateFlagsByReg("Y");
	}

	/*

		STA varients

	*/

	else if (byte == "85") { // Store to ZP
		PC += 1;
		RAM[parseInt(ROM[(PC - 49152)], 16)] = A;
	} else if (byte == "95") { // Store to ZP,X
		PC += 1;
		var addr = (parseInt(ROM[(PC - 49152)], 16)) + X;
		RAM[addr] = A;
	}  else if (byte == "8d") { // Store to Addr
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr] = A;
		PC += 1;
	}  else if (byte == "9d") { // Store to Addr,X
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr + X] = A;
		PC += 1;
	} else if (byte == "99") { // Store to Addr,Y
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr + Y] = A;
		PC += 1;
	}

	PC += 1;
	updateRegMon();
}

function toggleRef() {
	if (document.getElementById("ref").style.display != "none") {
		document.getElementById("ref").style.display = "none";
	} else {
		document.getElementById("ref").style.display = "block";
	}
}