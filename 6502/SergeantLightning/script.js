// Registers

var A = 0;                        // Accumulator
var X = 2;                        // X Register
var Y = 4;                        // Y Register
var SP = 255;                     // Stack Pointer
var PC = 0;                       // Program Counter
var F = [0, 0, 0, 0, 1, 1, 0, 0]; // Flags --> Carry, Zero, Irq disable, Decimal, B, (unused), oVerflow, Negative

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
	reset();
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

function updateScreen() {
	for (var i = 0; i < 1000; i++) {
		document.getElementsByClassName("pixel")[i].innerHTML = String.fromCharCode(RAM[48128 + i]);
	}
}

function reset() {
	console.log("\nRESETTING MACHINE\n");
	A = 0;
	X = 2;
	Y = 4;
	SP = 255;
	for (let i = 0; i < 8; i++) {
		F[i] = 0;
	}
	console.log("Flags reset");
	for (let i = 0; i < 49150; i++) {
		RAM[i] = 0;
	}
	for (let i = 0; i < 64; i++) {
		RAM[i] = i;
	}
	console.log("RAM initialized");
	var startAddr = "" + ROM[16381] + ROM[16380]; // Load reset vector
	console.log("Start address in hex: " + startAddr);
	startAddr = parseInt(startAddr, 16);
	startAddr = Number(startAddr);
	PC = (startAddr);
	console.log("Program Counter set to: " + PC);
	updateRegMon();

	// Draw Screen

	var drawing = "";
	for (let i = 0; i < 25; i++) {
		drawing += "<tr class='pixel-row'>";
		for (let q = 0; q < 40; q++) {
			drawing += "<td class='pixel'></td>";
		}
		drawing += "</tr>";
	}

	document.getElementById("screen").innerHTML = drawing;
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
		updateScreen(memAddr);
	}  else if (byte == "9d") { // Store to Addr,X
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr + X] = A;
		PC += 1;
		updateScreen();
	} else if (byte == "99") { // Store to Addr,Y
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr + Y] = A;
		PC += 1;
		updateScreen();
	}

	/*

		STX varients

	*/

	else if (byte == "86") { // Store to ZP
		PC += 1;
		RAM[parseInt(ROM[(PC - 49152)], 16)] = X;
	} else if (byte == "96") { // Store to ZP,Y
		PC += 1;
		var addr = (parseInt(ROM[(PC - 49152)], 16)) + Y;
		RAM[addr] = X;
	}  else if (byte == "8e") { // Store to Addr
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr] = X;
		PC += 1;
		updateScreen(memAddr);
	}

	/*

		STY varients

	*/

	else if (byte == "84") { // Store to ZP
		PC += 1;
		RAM[parseInt(ROM[(PC - 49152)], 16)] = Y;
	} else if (byte == "94") { // Store to ZP,X
		PC += 1;
		var addr = (parseInt(ROM[(PC - 49152)], 16)) + X;
		RAM[addr] = Y;
	}  else if (byte == "8c") { // Store to Addr
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		RAM[memAddr] = Y;
		PC += 1;
		updateScreen(memAddr);
	}

	/*

		TAX

	*/

	else if (byte == "aa") {
		X = A;
		updateFlagsByReg("X");
	}

	/*

		TAY

	*/

	else if (byte == "a8") {
		Y = A;
		updateFlagsByReg("Y");
	}

	/*

		TXA

	*/

	else if (byte == "8a") {
		A = X;
		updateFlagsByReg("A");
	}

	/*

		TYA

	*/

	else if (byte == "98") {
		Y = A;
		updateFlagsByReg("A");
	}

	/*

		TSX

	*/

	else if (byte == "ba") {
		X = SP;
		updateFlagsByReg("X");
	}

	/*

		TXS

	*/

	else if (byte == "9a") {
		SP = X;
	}

	/*

		PHA

	*/

	else if (byte == "48") {
		RAM[256 + SP] = A;

		if (SP <= 0) {
			SP = 255;
		} else {
			SP -= 1;
		}
	}

	/*

		PHX

	*/

	else if (byte == "da") {
		RAM[256 + SP] = X;

		if (SP <= 0) {
			SP = 255;
		} else {
			SP -= 1;
		}
	}

	/*

		PHY

	*/

	else if (byte == "5a") {
		RAM[256 + SP] = Y;

		if (SP <= 0) {
			SP = 255;
		} else {
			SP -= 1;
		}
	}

	/*

		PHP

	*/

	else if (byte == "08") {
		let temp = "";

		for (let i = 0; i < 8; i++) {
			temp += F[i];
		}

		temp = parseInt(temp, 2);

		RAM[256 + SP] = temp;

		if (SP <= 0) {
			SP = 255;
		} else {
			SP -= 1;
		}
	}

	/*

		PLA

	*/

	else if (byte == "68") {
		if (SP >= 255) {
			SP = 0;
		} else {
			SP += 1;
		}
		A = RAM[256 + SP];
		RAM[256 + SP] = 0;
	}

	/*

		PLX

	*/

	else if (byte == "fa") {
		if (SP >= 255) {
			SP = 0;
		} else {
			SP += 1;
		}
		X = RAM[256 + SP];
		RAM[256 + SP] = 0;
	}

	/*

		PLY

	*/

	else if (byte == "7a") {
		if (SP >= 255) {
			SP = 0;
		} else {
			SP += 1;
		}
		Y = RAM[256 + SP];
		RAM[256 + SP] = 0;
	}

	/*

		PLP

	*/

	else if (byte == "28") {
		var temp = "";

		if (SP >= 255) {
			SP = 0;
		} else {
			SP += 1;
		}

		temp = RAM[256 + SP];
		temp = (temp >>> 0).toString(2).padStart(8, '0');

		for (let i = 0; i < 8; i++) {
			F[i] = temp.charAt(i);
		}
		RAM[256 + SP] = 0;
	}

	/*
	
		AND

	*/

	if (byte == "29") {
		PC += 1;
		A = A & parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("A");
	} else if (byte == "25") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A = A & RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "35") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A = A & RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "2d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A & RAM[memAddr];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "3d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A & RAM[(memAddr + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "39") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A & RAM[(memAddr + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*
	
		EOR

	*/

	if (byte == "49") {
		PC += 1;
		A = A ^ parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("A");
	} else if (byte == "45") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A = A ^ RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "55") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A = A ^ RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "4d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A ^ RAM[memAddr];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "5d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A ^ RAM[(memAddr + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "59") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A ^ RAM[(memAddr + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*
	
		ORA

	*/

	if (byte == "09") {
		PC += 1;
		A = A | parseInt(ROM[(PC - 49152)], 16);
		updateFlagsByReg("A");
	} else if (byte == "05") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A = A | RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "15") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A = A | RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "0d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A | RAM[memAddr];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "1d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A | RAM[(memAddr + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "19") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A = A | RAM[(memAddr + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*

		(BUGGED INSTRUCTION, DEACTIVATED) BIT varients

	else if (byte == "24") { // Store to ZP
		PC += 1;
		var temp = A;
		temp = temp & RAM[parseInt(ROM[(PC - 49152)], 16)];
		(temp > 0) ? (F[1] = 0) : (F[1] = 1);
		temp = RAM[parseInt(ROM[(PC - 49152)], 16)].toString(2);
		F[7] = Number(temp.charAt(7)); // Set Negative Flag
		F[6] = Number(temp.charAt(6)); // Set Overflow Flag
		updateRegMon();
	} else if (byte == "2c") { // Store to Addr
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		var temp = A;
		temp = temp & Q;
		(temp > 0) ? (F[1] = 0) : (F[1] = 1);
		temp = Q.toString(2);
		F[7] = Number(temp.charAt(7)); // Set Negative Flag
		F[6] = Number(temp.charAt(6)); // Set Overflow Flag
		PC += 1;
		updateRegMon();
	}

	*/

	/*
	
		ADC varients

	*/

	if (byte == "69") {
		PC += 1;
		A += parseInt(ROM[(PC - 49152)], 16);
		A += F[0];
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1; // Update Carry Flag
			A -= 255;
		}
	} else if (byte == "65") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A += RAM[target];
		A += F[0];
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "75") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A += RAM[target];
		A += F[0];
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "6d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A += RAM[memAddr];
		A += F[0];
		PC += 1;
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "7d") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A += RAM[(memAddr + X)];
		A += F[0];
		PC += 1;
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "79") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A += RAM[(memAddr + Y)];
		A += F[0];
		PC += 1;
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	}

	/*
	
		SBC varients

	*/

	if (byte == "e9") {
		PC += 1;
		A -= parseInt(ROM[(PC - 49152)], 16);
		if (F[0] = 0) {
			A -= 1;
		}
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	} else if (byte == "e5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		A -= RAM[target];
		if (F[0] = 0) {
			A -= 1;
		}
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	} else if (byte == "f5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		A -= RAM[target];
		if (F[0] = 0) {
			A -= 1;
		}
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	} else if (byte == "ef") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A -= RAM[memAddr];
		if (F[0] = 0) {
			A -= 1;
		}
		PC += 1;
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	} else if (byte == "fd") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A -= RAM[(memAddr + X)];
		if (F[0] = 0) {
			A -= 1;
		}
		PC += 1;
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	} else if (byte == "f9") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		A -= RAM[(memAddr + Y)];
		if (F[0] = 0) {
			A -= 1;
		}
		PC += 1;
		updateFlagsByReg("A");
		if (A < -128) {
			F[0] = 0; // Update Carry Flag
			A -= 255;
		} else {
			F[0] = 1;
		}
	}

	/*
	
		CMP varients

	*/

	if (byte == "c9") {
		PC += 1;
		var temp = parseInt(ROM[(PC - 49152)], 16);
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "c5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		var temp = RAM[target];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "d5") {
		PC += 1;
		var target = parseInt(ROM[(PC - 49152)], 16);
		target += X;
		var temp = RAM[target];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "cd") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		var temp = RAM[memAddr];
		PC += 1;
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "dd") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		var temp = RAM[(memAddr + X)];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "d9") {
		PC += 1;
		var Q = "" + ROM[(PC - 49151)] + ROM[(PC - 49152)];
		console.log("Using hex memory address: " + Q);
		var memAddr = parseInt(Q, 16);
		memAddr = Number(memAddr);
		console.log("Using decimal memory address: " + memAddr);
		var temp = RAM[(memAddr + Y)];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(A - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(A - temp == 0) ? (F[1] = 1) : (F[1] = 0);
		PC += 1;
		updateFlagsByReg("A");
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