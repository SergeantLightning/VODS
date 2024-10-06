// Registers

var A = 0;                        // Accumulator
var X = 2;                        // X Register
var Y = 4;                        // Y Register
var SP = 255;                     // Stack Pointer
var PC = 0;                       // Program Counter
var F = [0, 0, 0, 0, 1, 1, 0, 0]; // Flags --> Carry, Zero, Irq disable, Decimal, B, (unused), oVerflow, Negative

// Memory
var RAM = [];                     // Mapped to addresses 0 - 65535, Keyboard Last Pressed Key Mapped to address 49150, Serial Port Data Mapped to address 49151
var COLSET = ["#000", "#F00", "#0F0", "#FF0", "#00F", "#F0F", "#0FF", "@FFF"];

// Teletype mode variables
var HOFS = 0;
var VOFS = 0;

// Speed emulation variables

let lastTime = performance.now();
const timeStep = 1000 / 240; // 240 Hz, emulation has no difference past this

function randomByte() {
	return Math.floor(Math.random() * 256);
}

function setHTML(id, content) {
	document.getElementById(id).innerHTML = content;
}

function start() {
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

function updateFlagsByRAM(addr) {
	(addr > 127) ? (F[7] = 1) : (F[7] = 0);
	(addr == 0) ? (F[1] = 1) : (F[1] = 0);
}

function TTYScrollUp(type) {
	for (var i = 0; i < 40; i++) {
		document.getElementsByClassName("pixel")[i].innerHTML = "";
	}
	for (var i = 40; i < 1000; i++) {
		document.getElementsByClassName("pixel")[i - 40].innerHTML = document.getElementsByClassName("pixel")[i].innerHTML;
		document.getElementsByClassName("pixel")[i].innerHTML = "";
	}
	if (type == 0) {
		HOFS += 1;
	}
	VOFS -= 1;
}

function updateScreen() {
	// Update Characters
	if (RAM[49129] == 1) {
		for (var i = 0; i < 1000; i++) {
			document.getElementsByClassName("pixel")[i].innerHTML = String.fromCharCode(RAM[48128 + i]);
		}
	} else { // Teletype mode
		if (RAM[48128] == 13) {
			console.log("Detected Enter");
			if (VOFS == 24) {
				TTYScrollUp(0);
			} else {
				HOFS = 0;
				VOFS += 1;
			}
		} else if (RAM[48128] == 8) {
			if (HOFS == 0 && VOFS == 0) {
				// Break
			} else if (VOFS != 0 && HOFS == 0) {
				VOFS -= 1;
				HOFS = 40;
			} else {
				HOFS -= 1;
			}
			document.getElementsByClassName("pixel")[Number((VOFS * 40) + HOFS)].innerHTML = "";
		} else {
			document.getElementsByClassName("pixel")[Number((VOFS * 40) + HOFS)].innerHTML = String.fromCharCode(RAM[48128]);
			if (VOFS >= 24) {
				TTYScrollUp(1);
			} else if (HOFS == 40) {
				HOFS = 0;
				VOFS += 1;
			}
			HOFS += 1;
		}
	}
	for (var i = 0; i < 1000; i++) {
		// Set Text Color
		document.getElementsByClassName("pixel")[i].style.color = COLSET[Number(RAM[49128])];

		// Set BG Color
		document.getElementsByClassName("pixel")[i].style.backgroundColor = COLSET[Number(RAM[49129])];
	}
}

window.onkeydown = function(event) {
	let keycode = event.key;
	if (keycode == "Backspace") {
		RAM[49150] = 8;
	} else if (keycode == "Enter") {
		RAM[49150] = "d"; // Hex version of decimal 13
	} else if (keycode == "Shift") {
		//
	} else {
		RAM[49150] = Number(keycode.charCodeAt(0)).toString(16);
	}
	console.log(keycode);
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
	for (let i = 0; i < 49152; i++) {
		RAM[i] = 0;
	}
	for (let i = 0; i < 64; i++) {
		RAM[i] = i;
	}
	RAM[49128] = 7;
	RAM[49150] = 0;
	RAM[49149] = 0; // Default to teletype mode
	HOFS = 0;
	VOFS = 0;
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
				RAM[49152 + i] = hex;
			}
			// Display hex array
			console.log("Memory Dump:");
			console.log(RAM);
		};
	}
	console.log("Memory initialized");
	var startAddr = "" + RAM[65533] + RAM[65532]; // Load reset vector
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
			drawing += "<td class='pixel' style='color: #FFFFFF; background-color: #000000'></td>";
		}
		drawing += "</tr>";
	}

	document.getElementById("screen").innerHTML = drawing;
	console.log("Starting machine...\n");
}

function run() {
	const currentTime = performance.now();
	const deltaTime = currentTime - lastTime;
	if (deltaTime >= timeStep) {
		lastTime = currentTime - (deltaTime % timeStep);
	/*
	
		WARNING: SUPER LONG IF ELSE BLOCK COMING
	
	*/

	var byte = RAM[PC];
	console.log("Current instruction: " + byte);

	/*
	
		LDA varients

	*/

	if (byte == "a9") {
		PC += 1;
		A = parseInt(RAM[PC], 16);
		updateFlagsByReg("A");
	} else if (byte == "a5") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		A = parseInt(RAM[target], 16);
		updateFlagsByReg("A");
	} else if (byte == "b5") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		A = parseInt(RAM[target], 16);
		updateFlagsByReg("A");
	} else if (byte == "ad") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = parseInt(RAM[target], 16);
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "bd") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = parseInt(RAM[target + X], 16);
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "b9") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = parseInt(RAM[target + Y], 16);
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "a1") { // Indexed Indirect
		PC += 1;
		var temp = RAM[PC];
		temp = parseInt(temp, 16);
		temp += X;
		console.log("ZP address: " + temp);
		var target = RAM[temp + 1].toString(10).padStart(2, "0") + RAM[temp].toString(10).padStart(2, "0");
		console.log("L = " + RAM[temp] + " H = " + RAM[temp + 1]);
		console.log("Raw Target address: " + target);
		target = parseInt(target, 16);
		console.log("Target address: " + target);
		A = parseInt(RAM[target], 16);
	} else if (byte == "b1") { // Indirect Indexed
		PC += 1;
		var temp = "" + RAM[PC + 1] + RAM[PC];
		temp = parseInt(temp, 16);
		console.log("Target address location: " + temp);
		var target = "" + RAM[temp + 1] + RAM[temp];
		target = parseInt(target, 16);
		target += Y;
		console.log("Target address: " + target);
		A = RAM[Number(target)];
	}
	
	/*
	
		LDX varients

	*/
	
	else if (byte == "a2") {
		PC += 1;
		X = parseInt(RAM[PC], 16);
		updateFlagsByReg("X");
	} else if (byte == "a6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		X = parseInt(RAM[target], 16);
		updateFlagsByReg("X");
	} else if (byte == "b6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += Y;
		X = parseInt(RAM[target], 16);;
		updateFlagsByReg("X");
	} else if (byte == "ae") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		X = parseInt(RAM[target], 16);;
		PC += 1;
		updateFlagsByReg("X");
	} else if (byte == "be") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		X = parseInt(RAM[target + Y], 16);
		PC += 1;
		updateFlagsByReg("X");
	}

	/*
	
		LDY varients

	*/
	
	else if (byte == "a0") {
		PC += 1;
		Y = parseInt(RAM[PC], 16);
		updateFlagsByReg("Y");
	} else if (byte == "a4") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		Y = parseInt(RAM[target], 16);
		updateFlagsByReg("Y");
	} else if (byte == "b4") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		Y = parseInt(RAM[target], 16);
		updateFlagsByReg("Y");
	} else if (byte == "ac") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		Y = parseInt(RAM[target], 16);
		PC += 1;
		updateFlagsByReg("Y");
	} else if (byte == "bc") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		Y = parseInt(RAM[target + X], 16);
		PC += 1;
		updateFlagsByReg("Y");
	}

	/*

		STA varients

	*/

	else if (byte == "85") { // Store to ZP
		PC += 1;
		RAM[parseInt(RAM[PC], 16)] = A.toString(16);
	} else if (byte == "95") { // Store to ZP,X
		PC += 1;
		var addr = (parseInt(RAM[PC], 16)) + X;
		RAM[addr] = A;
	}  else if (byte == "8d") { // Store to Addr
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target] = A;
		PC += 1;
		if (target >= 48128 && target <= 49129) {
			updateScreen();
		}
	}  else if (byte == "9d") { // Store to Addr,X
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target + X] = A;
		PC += 1;
		if (target >= 48128 && target <= 49129) {
			updateScreen();
		}
	} else if (byte == "99") { // Store to Addr,Y
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target + Y] = A;
		PC += 1;
		if (target >= 48128 && target <= 49129) {
			updateScreen();
		}
	}

	/*

		STX varients

	*/

	else if (byte == "86") { // Store to ZP
		PC += 1;
		RAM[parseInt(RAM[PC], 16)] = X;
	} else if (byte == "96") { // Store to ZP,Y
		PC += 1;
		var addr = (parseInt(RAM[PC], 16)) + Y;
		RAM[addr] = X;
	}  else if (byte == "8e") { // Store to Addr
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target] = X;
		PC += 1;
		updateScreen();
	}

	/*

		STY varients

	*/

	else if (byte == "84") { // Store to ZP
		PC += 1;
		RAM[parseInt(RAM[PC], 16)] = Y;
	} else if (byte == "94") { // Store to ZP,X
		PC += 1;
		var addr = (parseInt(RAM[PC], 16)) + X;
		RAM[addr] = Y;
	}  else if (byte == "8c") { // Store to Addr
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target] = Y;
		PC += 1;
		updateScreen();
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
		A = A & parseInt(RAM[PC], 16);
		updateFlagsByReg("A");
	} else if (byte == "25") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		A = A & RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "35") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		A = A & RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "2d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A & RAM[target];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "3d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A & RAM[(target + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "39") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A & RAM[(target + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*
	
		EOR

	*/

	if (byte == "49") {
		PC += 1;
		A = A ^ parseInt(RAM[PC], 16);
		updateFlagsByReg("A");
	} else if (byte == "45") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		A = A ^ RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "55") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		A = A ^ RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "4d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A ^ RAM[target];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "5d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A ^ RAM[(target + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "59") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A ^ RAM[(target + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*
	
		ORA

	*/

	if (byte == "09") {
		PC += 1;
		A = A | parseInt(RAM[PC], 16);
		updateFlagsByReg("A");
	} else if (byte == "05") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		A = A | RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "15") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		A = A | RAM[target];
		updateFlagsByReg("A");
	} else if (byte == "0d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A | RAM[target];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "1d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A | RAM[(target + X)];
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "19") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A = A | RAM[(target + Y)];
		PC += 1;
		updateFlagsByReg("A");
	}

	/*

		(BUGGED INSTRUCTION, DEACTIVATED) BIT varients

	else if (byte == "24") { // Store to ZP
		PC += 1;
		var temp = A;
		temp = temp & RAM[parseInt(RAM[PC], 16)];
		(temp > 0) ? (F[1] = 0) : (F[1] = 1);
		temp = RAM[parseInt(RAM[PC], 16)].toString(2);
		F[7] = Number(temp.charAt(7)); // Set Negative Flag
		F[6] = Number(temp.charAt(6)); // Set Overflow Flag
		updateRegMon();
	} else if (byte == "2c") { // Store to Addr
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
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

	 else if (byte == "69") {
		PC += 1;
		A += parseInt(RAM[PC], 16);
		A += F[0];
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1; // Update Carry Flag
			A -= 255;
		}
	} else if (byte == "65") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		A += RAM[target];
		A += F[0];
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "75") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
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
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A += RAM[target];
		A += F[0];
		PC += 1;
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "7d") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A += RAM[(target + X)];
		A += F[0];
		PC += 1;
		updateFlagsByReg("A");
		if (A >= 256) {
			F[0] = 1;
			A -= 255;
		}
	} else if (byte == "79") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A += RAM[(target + Y)];
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

	 else if (byte == "e9") {
		PC += 1;
		A -= parseInt(RAM[PC], 16);
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
		var target = parseInt(RAM[PC], 16);
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
		var target = parseInt(RAM[PC], 16);
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
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A -= RAM[target];
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
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A -= RAM[(target + X)];
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
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		A -= RAM[(target + Y)];
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

	else if (byte == "c9") {
		PC += 1;
		var temp = parseInt(RAM[PC], 16);
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "c5") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		var temp = RAM[target];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "d5") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		var temp = RAM[target];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "cd") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target];
		PC += 1;
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "dd") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[(target + X)];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
		PC += 1;
		updateFlagsByReg("A");
	} else if (byte == "d9") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[(target + Y)];
		if (A >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		((A - temp) > 127) ? (F[7] = 1) : (F[7] = 0);
		((A - temp) == 0) ? (F[1] = 1) : (F[1] = 0);
		PC += 1;
		updateFlagsByReg("A");
	}

	/*
	
		CPX varients

	*/

	else if (byte == "e0") {
		PC += 1;
		var temp = parseInt(RAM[PC], 16);
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "e4") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		var temp = RAM[target];
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "ec") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target];
		PC += 1;
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	}

	/*
	
		CPY varients

	*/

	else if (byte == "c0") {
		PC += 1;
		var temp = parseInt(RAM[PC], 16);
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "c4") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		var temp = RAM[target];
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (byte == "cc") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target];
		PC += 1;
		if (X >= temp) {
			F[0] = 1; // Set carry flag
		} else {
			F[0] = 0;
		}
		(X - temp > 127) ? (F[7] = 1) : (F[7] = 0);
		(X - temp == 0) ? (F[1] = 1) : (F[1] = 0);
	}

	/*
	
		INC varients

	*/

	else if (byte == "e6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		if (RAM[target] == 255) {
			RAM[target] = 0;
		} else {
			RAM[target] += 1;
		}
	} else if (byte == "f6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		if (RAM[target] == 255) {
			RAM[target] = 0;
		} else {
			RAM[target] += 1;
		}
	} else if (byte == "ee") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		if (RAM[target] == 255) {
			RAM[target] = 0;
		} else {
			RAM[target] += 1;
		}
		PC += 1;
	} else if (byte == "fe") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		if (RAM[target] == 255) {
			RAM[target] = 0;
		} else {
			RAM[target] += 1;
		}
		PC += 1;
		updateFlagsByReg("A");
	}

	/*

		INX

	*/

	else if (byte == "e8") {
		if (X == 255) {
			X = 0;
		} else {
			X += 1;
		}
		updateFlagsByReg("X");
	}

	/*

		INY

	*/

	else if (byte == "c8") {
		if (Y == 255) {
			Y = 0;
		} else {
			Y += 1;
		}
		updateFlagsByReg("Y");
	}

	/*
	
		DEC varients

	*/

	else if (byte == "c6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		if (RAM[target] == 0) {
			RAM[target] = 255;
		} else {
			RAM[target] -= 1;
		}
		updateFlagsByReg("A");
	} else if (byte == "e6") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		if (RAM[target] == 0) {
			RAM[target] = 255;
		} else {
			RAM[target] -= 1;
		}
		updateFlagsByReg("A");
	} else if (byte == "ce") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		if (RAM[target] == 0) {
			RAM[target] = 255;
		} else {
			RAM[target] -= 1;
		}
		updateFlagsByReg("A");
		PC += 1;
	} else if (byte == "de") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		if (RAM[target] == 0) {
			RAM[target] = 255;
		} else {
			RAM[target] -= 1;
		}
		PC += 1;
		updateFlagsByReg("A");
	}

	/*

		DEX

	*/

	else if (byte == "ca") {
		if (X == 0) {
			X = 255;
		} else {
			X -= 1;
		}
		updateFlagsByReg("X");
	}

	/*

		DEY

	*/

	else if (byte == "88") {
		if (X == 0) {
			X = 255;
		} else {
			X -= 1;
		}
		updateFlagsByReg("Y");
	}

	/*
	
		ASL varients

	*/

	else if (byte == "0a") { // Accumulator
		A *= 2;
		if (A < 255) {
			F[0] = 0;
		} else {
			var mask = 255;
			A = A & mask;
			F[0] = 1;
		}
		updateFlagsByReg("A");
	} else if (byte == "06") { // ZP
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			F[0] = 0;
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
			F[0] = 1;
		}
		updateFlagsByRAM(target);
	} else if (byte == "16") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			F[0] = 0;
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
			F[0] = 1;
		}
		updateFlagsByRAM(target);
	} else if (byte == "0e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			F[0] = 0;
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
			F[0] = 1;
		}
		PC += 1;
		updateFlagsByRAM(target);
	} else if (byte == "1e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			F[0] = 0;
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
			F[0] = 1;
		}
		PC += 1;
		updateFlagsByRAM(target);
	}

	/*
	
		LSR varients

	*/

	else if (byte == "4a") { // Accumulator
		F[0] = Number(A.toString(2).padStart(8, "0").charAt(7));
		A /= 2;
		if (A < 0) {
			A = 0;
		}
		updateFlagsByReg("A");
	} else if (byte == "46") { // ZP
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		F[0] = Number(RAM[target].toString(2).padStart(8, "0").charAt(7));
		RAM[target] /= 2;
		if (RAM[target] < 0) {
			RAM[target] = 0;
		}
		updateFlagsByRAM(target);
	} else if (byte == "56") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		F[0] = Number(RAM[target].toString(2).padStart(8, "0").charAt(7));
		RAM[target] /= 2;
		if (RAM[target] < 0) {
			RAM[target] = 0;
		}
		updateFlagsByRAM(target);
	} else if (byte == "4e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		F[0] = Number(RAM[target].toString(2).padStart(8, "0").charAt(7));
		RAM[target] /= 2;
		if (RAM[target] < 0) {
			RAM[target] = 0;
		}
		PC += 1;
		updateFlagsByRAM(target);
	} else if (byte == "5e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		F[0] = Number(RAM[target].toString(2).padStart(8, "0").charAt(7));
		RAM[target] /= 2;
		if (RAM[target] < 0) {
			RAM[target] = 0;
		}
		PC += 1;
		updateFlagsByRAM(target);
	}

	/*
	
		ROL varients

	*/

	else if (byte == "2a") { // Accumulator
		var temp = A.toString(2).padStart(8, "0");
		temp = Number(temp.charAt(0)); // New carry flag value
		A *= 2;
		if (A < 255) {
			//
		} else {
			var mask = 255;
			A = A & mask;
		}
		(F[0] == 1) ? (A += 1) : (A += 0);
		F[0] = temp;
		updateFlagsByReg("A");
	} else if (byte == "26") { // ZP
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(0)); // New carry flag value
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			//
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
		}
		(F[0] == 1) ? (RAM[target] += 1) : (RAM[target] += 0);
		F[0] = temp;
		updateFlagsByRAM(target);
	} else if (byte == "36") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(0)); // New carry flag value
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			//
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
		}
		(F[0] == 1) ? (RAM[target] += 1) : (RAM[target] += 0);
		F[0] = temp;
		updateFlagsByRAM(target);
	} else if (byte == "2e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(0)); // New carry flag value
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			//
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
		}
		(F[0] == 1) ? (RAM[target] += 1) : (RAM[target] += 0);
		F[0] = temp;
		PC += 1;
		updateFlagsByRAM(target);
	} else if (byte == "3e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(0)); // New carry flag value
		RAM[target] *= 2;
		if (RAM[target] < 255) {
			//
		} else {
			var mask = 255;
			RAM[target] = RAM[target] & mask;
		}
		(F[0] == 1) ? (RAM[target] += 1) : (RAM[target] += 0);
		F[0] = temp;
		PC += 1;
		updateFlagsByRAM(target);
	}

	/*
	
		ROR varients

	*/

	else if (byte == "6a") { // Accumulator
		var temp = A.toString(2).padStart(8, "0");
		temp = Number(temp.charAt(7)); // New carry flag value
		A /= 2;
		if (A < 1) {
			A = 0;
		}
		(F[0] == 1) ? (A += 128) : (A += 0);
		F[0] = temp;
		updateFlagsByReg("A");
	} else if (byte == "66") { // ZP
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(7)); // New carry flag value
		RAM[target] /= 2;
		if (RAM[target] < 1) {
			RAM[target] = 0;
		}
		(F[0] == 1) ? (RAM[target] += 128) : (RAM[target] += 0);
		F[0] = temp;
		updateFlagsByRAM(target);
	} else if (byte == "76") {
		PC += 1;
		var target = parseInt(RAM[PC], 16);
		target += X;
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(7)); // New carry flag value
		RAM[target] /= 2;
		if (RAM[target] < 1) {
			RAM[target] = 0;
		}
		(F[0] == 1) ? (RAM[target] += 128) : (RAM[target] += 0);
		F[0] = temp;
		updateFlagsByRAM(target);
	} else if (byte == "6e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(7)); // New carry flag value
		RAM[target] /= 2;
		if (RAM[target] < 1) {
			RAM[target] = 0;
		}
		(F[0] == 1) ? (RAM[target] += 128) : (RAM[target] += 0);
		F[0] = temp;
		PC += 1;
		updateFlagsByRAM(target);
	} else if (byte == "7e") {
		PC += 1;
		var Q = "" + RAM[PC + 1] + RAM[PC];
		console.log("Using hex memory address: " + Q);
		var target = parseInt(Q, 16);
		target = Number(target);
		target += X;
		console.log("Using decimal memory address: " + target);
		var temp = RAM[target].toString(2).padStart(8, "0");
		temp = Number(temp.charAt(7)); // New carry flag value
		RAM[target] /= 2;
		if (RAM[target] < 1) {
			RAM[target] = 0;
		}
		(F[0] == 1) ? (RAM[target] += 128) : (RAM[target] += 0);
		F[0] = temp;
		PC += 1;
		updateFlagsByRAM(target);
	}

	/*

		JMP Varients

	*/

	else if (byte == "4c") { // Absolute
		PC += 1;
		var temp = "" + RAM[PC + 1] + RAM[PC];
		temp = parseInt(temp, 16);
		PC = temp;
		PC -= 1;
	} else if (byte == "6c") { // Indirect
		PC += 1;
		var temp = "" + RAM[PC + 1] + RAM[PC];
		temp = parseInt(temp, 16);
		var target = "" + RAM[temp + 1] + RAM[temp];
		PC = parseInt(target, 16);
		PC -= 1;
	}

	/*

		JSR

	*/

	else if (byte == "20") {
		PC += 1;
		var temp = "" + RAM[PC + 1] + RAM[PC]; // Jump address
		RAM[256 + SP] = (PC + 2);
		if (SP <= 0) {
			SP = 255;
		} else {
			SP -= 1;
		}
		temp = parseInt(temp, 16);
		PC = temp;
		PC -= 1;
		console.log("Subroutine address: " + PC);
	}

	/*

		RTS

	*/

	else if (byte == "60") {
		SP += 1;
		PC = RAM[256 + SP];
		PC -= 1;
		RAM[256 + SP] = 0;
	}

	/*

		BCC

	*/

	else if (byte == "90") {
		PC += 1;
		if (F[0] == 0) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BCS

	*/

	else if (byte == "b0") {
		PC += 1;
		if (F[0] == 1) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BEQ

	*/

	else if (byte == "f0") {
		PC += 1;
		if (F[1] == 1) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BMI

	*/

	else if (byte == "30") {
		PC += 1;
		if (F[7] == 1) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BNE

	*/

	else if (byte == "d0") {
		PC += 1;
		if (F[1] == 0) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BPL

	*/

	else if (byte == "10") {
		PC += 1;
		if (F[7] == 0) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BVC

	*/

	else if (byte == "50") {
		PC += 1;
		if (F[6] == 0) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*

		BVS

	*/

	else if (byte == "70") {
		PC += 1;
		if (F[6] == 1) {
			if (parseInt(RAM[PC], 16) < 127) {
				PC += parseInt(RAM[PC], 16);
				console.log("Jumping forward");
			} else {
				PC += (Number(parseInt(RAM[PC], 16)) - 256);
				console.log("Jumping back");
			}
		}
	}

	/*
	
		CLC
	
	*/

	else if (byte == "18") {
		F[0] = 0;
	}

	/*
	
		CLD
	
	*/

	else if (byte == "d8") {
		F[3] = 0;
	}

	/*
	
		CLI
	
	*/

	else if (byte == "58") {
		F[2] = 0;
	}

	/*
	
		CLV
	
	*/

	else if (byte == "b8") {
		F[6] = 0;
	}

	/*
	
		SEC
	
	*/

	else if (byte == "38") {
		F[0] = 1;
	}

	/*
	
		SED
	
	*/

	else if (byte == "f8") {
		F[3] = 1;
	}

	/*
	
		SEI
	
	*/

	else if (byte == "78") {
		F[2] = 1;
	}

	/*
	
		BRK
	
	*/

	else if (byte == "00" || byte == "0") {
		F[4] = 1;
	}

	/*
	
		NOP
	
	*/

	else if (byte == "ea") {
		// Do nothing
	}

	/*
	
		RTI
	
	*/

	else if (byte == "40") {
		// Pull Flags
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

		// Pull PC

		SP += 1;
		PC = RAM[256 + SP];
		PC -= 1;
		RAM[256 + SP] = 0;
	}

	PC += 1;
	updateRegMon();

	lastTime = currentTime - (deltaTime % timeStep);
    }
	if (document.getElementById("runbox").checked) {
		requestAnimationFrame(run);
	}
}

function toggleRef() {
	if (document.getElementById("ref").style.display != "none") {
		document.getElementById("ref").style.display = "none";
	} else {
		document.getElementById("ref").style.display = "block";
	}
}