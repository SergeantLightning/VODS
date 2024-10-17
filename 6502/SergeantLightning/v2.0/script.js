// Registers

var A = new Uint8Array(1);        // Accumulator
var X = new Uint8Array(1);        // X Register
var Y = new Uint8Array(1);        // Y Register
var SP = new Uint8Array([255]);   // Stack Pointer (initiallized to 255, or 0xFF)
var PC = new Uint16Array(1);      // Program Counter
var F = [0, 0, 0, 0, 1, 1, 0, 0]; // Flags --> Carry, Zero, Irq disable, Decimal, Break, (unused), oVerflow, Negative

// Memory
var RAM = new Uint8Array(65536);
var COLSET = ["#000", "#F00", "#0F0", "#FF0", "#00F", "#F0F", "#0FF", "#FFF"];

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
	setHTML("A", A[0]);
	setHTML("X", X[0]);
	setHTML("Y", Y[0]);
	setHTML("SP", SP[0])
	setHTML("PC", PC[0]);
	setHTML("C", F[0]);
	setHTML("Z", F[1]);
	setHTML("I", F[2]);
	setHTML("D", F[3]);
	setHTML("V", F[6]);
	setHTML("N", F[7]);
}

function updateFlagsByReg(regName) {
	// Updates Negative and Carry flags
	if (regName == "A") {
		(A[0] > 127) ? (F[7] = 1) : (F[7] = 0);
		(A[0] == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (regName == "X") {
		(X[0] > 127) ? (F[7] = 1) : (F[7] = 0);
		(X[0] == 0) ? (F[1] = 1) : (F[1] = 0);
	} else if (regName == "Y") {
		(Y[0] > 127) ? (F[7] = 1) : (F[7] = 0);
		(Y[0] == 0) ? (F[1] = 1) : (F[1] = 0);
	}
}

function updateFlagsByRAM(addr) {
	(addr > 127) ? (F[7] = 1) : (F[7] = 0);
	(addr == 0) ? (F[1] = 1) : (F[1] = 0);
}

function returnHex(number) {
	return number.toString(16).padStart(2, "0");
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
	if (RAM[32763] == 13) { // CR
		console.log("Detected Enter");
		if (VOFS == 24) {
			TTYScrollUp(0);
		} else {
			HOFS = 0;
			VOFS += 1;
		}
	} else if (RAM[32763] == 10) { // LF
		// Ignore
	} else if (RAM[32763] == 8) {
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
		document.getElementsByClassName("pixel")[Number((VOFS * 40) + HOFS)].innerHTML = String.fromCharCode(RAM[32763]);
		if (VOFS >= 24) {
			TTYScrollUp(1);
		} else if (HOFS == 40) {
			HOFS = 0;
			VOFS += 1;
		}
		HOFS += 1;
	}
	for (var i = 0; i < 1000; i++) {
		// Set Text Color
		document.getElementsByClassName("pixel")[i].style.color = COLSET[Number(RAM[32764])];

		// Set BG Color
		document.getElementsByClassName("pixel")[i].style.backgroundColor = COLSET[Number(RAM[32765])];
	}
}

window.onkeydown = function(event) {
	let keycode = event.key;
	if (keycode == "Backspace") {
		RAM[32763] = 8;
	} else if (keycode == "Enter") {
		RAM[32763] = 13;
	} else if (keycode == "Tab") {
		RAM[32763] = 9; // Horizontal Tab
	} else if (keycode == "Shift") {
		// Do nothing
	} else if (keycode == "F2") {
		console.log("Full RAM Dump:");
		console.log(RAM);
	} else {
		RAM[32763] = Number(keycode.charCodeAt(0));
	}
	console.log(keycode);
}

function reset() {
	console.log("\nRESETTING MACHINE\n");
	A[0] = 0;
	X[0] = 2;
	Y[0] = 4;
	SP[0] = 255;
	for (let i = 0; i < 8; i++) {
		F[i] = 0;
	}
	console.log("Flags reset");
	for (let i = 0; i < 32768; i++) {
		RAM[i] = 0;
	}
	for (let i = 0; i < 64; i++) {
		RAM[i] = i;
	}
	RAM[32764] = 7;	// White text color
	RAM[32766] = 0;	// Black background color
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
			// Convert each byte to a decimal string
			for (let i = 0; i < 32768; i++) {
				const hex = byteArray[i].toString(10); // Convert to decimal
				RAM[32768 + i] = Number(hex);
			}
			// Display hex array
			console.log("Memory Dump:");
			console.log(RAM);
		};
	}
	console.log("Memory initialized");
	var startAddr = "" + RAM[65533].toString(16).padStart(2, "0") + RAM[65532].toString(16).padStart(2, "0"); // Load reset vector
	console.log("Start address in hex: " + startAddr);
	startAddr = parseInt(startAddr, 16);
	startAddr = Number(startAddr);
	PC[0] = (startAddr);
	console.log("Program Counter set to: " + PC[0]);
	updateRegMon();

	// Draw Screen

	var drawing = "";
	for (let i = 0; i < 25; i++) {
		drawing += "<tr class='pixel-row'>";
		for (let q = 0; q < 40; q++) {
			drawing += "<td class='pixel' style='color: #FFF; background-color: #000'></td>";
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
	
		var byte = RAM[PC[0]];
		var hexbyte = byte.toString(16).padStart(2, "0");
		console.log("Reading from ROM: 0x" + hexbyte + " | " + byte);

		// SPECIAL OPCODES

		if (byte == 252) { // 0xFC
			PC[0] += 1;
			console.log("Dumped ZP address " + RAM[PC[0]] + ": " + RAM[RAM[PC[0]]]);
		} else if (byte == 244) { // 0xF4
			// Dump absolute address
			PC[0] += 1;
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Dumped Absolute address " + memaddr + ": " + RAM[parseInt(memaddr, 16)]);
		}

		// 6502 + W65C02 OPCODES


		/*

			ADC Varients

		*/

		else if (hexbyte == "69") {
			// Immediate
			let oldA = A[0];
			PC[0] += 1;
			A[0] += RAM[PC[0]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0); // Update Carry Flag
			console.log("ADC immediate");
		} else if (hexbyte == "65") {
			let oldA = A[0];
			PC[0] += 1;
			A[0] += RAM[RAM[PC[0]]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			console.log("ADC ZP");
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "75") {
			let oldA = A[0];
			PC[0] += 1;
			A[0] += RAM[RAM[PC[0] + X]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			console.log("ADC ZP,X");
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "6d") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Absolute");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] += RAM[memaddr];
			if (F[0] == 1) {
				A[0] += 1;
			}
			PC[0] += 1;
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "7d") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Absolute,X");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] += RAM[memaddr + X[0]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			PC[0] += 1;
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "79") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Absolute,Y");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] += RAM[memaddr + Y[0]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			PC[0] += 1;
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "61") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Indexed Indirect");
			let ZPaddr = RAM[PC[0]];
			ZPaddr += X[0];
			console.log(ZPaddr);
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] += RAM[parseInt(memaddr, 16)];
			if (F[0] == 1) {
				A[0] += 1;
			}
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "71") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Indirect Indexed");
			let ZPaddr = RAM[PC[0]];
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] += RAM[parseInt(memaddr, 16) + Y[0]];
			if (F[0] == 1) {
				A[0] += 1;
			}
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		} else if (hexbyte == "72") {
			let oldA = A[0];
			PC[0] += 1;
			console.log("ADC Indirect ZP");
			let ZPaddr = RAM[PC[0]];
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] += RAM[parseInt(memaddr, 16)];
			if (F[0] == 1) {
				A[0] += 1;
			}
			updateFlagsByReg("A");
			(oldA > A[0]) ? (F[0] = 1) : (F[0] = 0);
		}

		/*

			AND Varients

		*/

		else if (hexbyte == "29") {
			// Immediate
			PC[0] += 1;
			A[0] &= RAM[PC[0]];
			updateFlagsByReg("A");
			console.log("AND immediate");
		} else if (hexbyte == "25") {
			PC[0] += 1;
			A[0] &= RAM[RAM[PC[0]]];
			console.log("AND ZP");
			updateFlagsByReg("A");
		} else if (hexbyte == "35") {
			PC[0] += 1;
			A[0] &= RAM[RAM[PC[0] + X]];
			console.log("AND ZP,X");
			updateFlagsByReg("A");
		} else if (hexbyte == "2d") {
			PC[0] += 1;
			console.log("AND Absolute");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] &= RAM[memaddr];
			PC[0] += 1;
			updateFlagsByReg("A");
		} else if (hexbyte == "3d") {
			PC[0] += 1;
			console.log("AND Absolute,X");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] &= RAM[memaddr + X[0]];
			PC[0] += 1;
			updateFlagsByReg("A");
		} else if (hexbyte == "39") {
			PC[0] += 1;
			console.log("ADC Absolute,Y");
			let memaddr = "" + RAM[PC[0] + 1].toString(16).padStart(2, "0") + RAM[PC[0]].toString(16).padStart(2, "0");
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			A[0] &= RAM[memaddr + Y[0]];
			PC[0] += 1;
			updateFlagsByReg("A");
		} else if (hexbyte == "21") {
			PC[0] += 1;
			console.log("ADC Indexed Indirect");
			let ZPaddr = RAM[PC[0]];
			ZPaddr += X[0];
			console.log(ZPaddr);
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] &= RAM[parseInt(memaddr, 16)];
			updateFlagsByReg("A");
		} else if (hexbyte == "31") {
			PC[0] += 1;
			console.log("ADC Indirect Indexed");
			let ZPaddr = RAM[PC[0]];
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] &= RAM[parseInt(memaddr, 16) + Y[0]];
			updateFlagsByReg("A");
		} else if (hexbyte == "32") {
			PC[0] += 1;
			console.log("ADC Indirect ZP");
			let ZPaddr = RAM[PC[0]];
			let memaddr = "" + RAM[ZPaddr + 1].toString(16).padStart(2, "0") + RAM[ZPaddr].toString(16).padStart(2, "0"); // Get indirect address by the value of provided ZP address (LSB) + next ZP page (MSB)
			console.log("ZP address: " + RAM[PC[0]]);
			console.log("Indirect Address: 0x" + memaddr);
			A[0] &= RAM[parseInt(memaddr, 16)];
			updateFlagsByReg("A");
		}

		/*

			ASL Varients

		*/

		else if (hexbyte == "0a") {
			(A[0] > 127) ? (F[0] = 1) : (F[0] = 0);
			A[0] *= 2;
			updateFlagsByReg("A");
			console.log("ASL A");
		} else if (hexbyte == "06") {
			PC[0] += 1;
			(RAM[RAM[PC[0]]] > 127) ? (F[0] = 1) : (F[0] = 0);
			RAM[RAM[PC[0]]] *= 2;
			updateFlagsByRAM(RAM[RAM[PC[0]]]);
			console.log("ASL ZP");
		} else if (hexbyte == "16") {
			PC[0] += 1;
			(RAM[RAM[PC[0]] + X] > 127) ? (F[0] = 1) : (F[0] = 0);
			RAM[RAM[PC[0]] + X] *= 2;
			updateFlagsByRAM(RAM[RAM[PC[0]] + X]);
			console.log("ASL ZP,X");
		} else if (hexbyte == "0e") {
			PC[0] += 1;
			console.log("ASL Absolute");
			let memaddr = "" + returnHex(RAM[PC[0] + 1]) + returnHex(RAM[PC[0]]);
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			(RAM[memaddr] > 127) ? (F[0] = 1) : (F[0] = 0);
			RAM[memaddr] *= 2;
			updateFlagsByRAM(RAM[memaddr]);
			PC[0] += 1;
		} else if (hexbyte == "1e") {
			PC[0] += 1;
			console.log("ASL Absolute");
			let memaddr = "" + returnHex(RAM[PC[0] + 1]) + returnHex(RAM[PC[0]]);
			console.log("Hex address: " + memaddr);
			memaddr = parseInt(memaddr, 16);
			(RAM[memaddr + X] > 127) ? (F[0] = 1) : (F[0] = 0);
			RAM[memaddr + X] *= 2;
			updateFlagsByRAM(RAM[memaddr + X]);
			PC[0] += 1;
		}

		PC[0] += 1;
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