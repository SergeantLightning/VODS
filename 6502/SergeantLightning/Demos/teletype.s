LKEY = $0	       ; Last Pressed Key
HOFS = $1	       ; Horizontal Offset
LN   = $2	       ; Line Number
FOFS = $3	       ; Full Offset
KBIN = $BFFE	       ; Keyboard input address

	.org $C000

start:
	LDX #0
	LDA KBIN
	STA LKEY       ; Clear input address
main:
	LDA KBIN
	CMP LKEY
	BEQ main       ; While LKEY != KBIN, don't do anything

	CMP #8         ; Backspace?
	BEQ bs         ; Jump to bs label if yes
	CMP #13        ; CR / Enter?
	BEQ cr         ; Jump to cr label if yes
	STA $BC00,X    ; Store character
	JMP done
bs:
	LDA #0
	DEX
	STA $BC00,X
	DEX            ; Print backspace & clear character
	STA KBIN       ; Clear KB input
	JMP done
cr:
	JSR GETNEWLINE ; Calculate New Line and save it in X register
	JMP done
done:
	STA LKEY       ; Update LKEY
	INX
	JMP main

GETNEWLINE:
	; Find out current horizontal offset
	; Formula for calculating next line: (H + (40 * L) - H)
	; H = Horizontal offset, L = Line number

	; Not sure how to implement this, since at the time I'm writing this
	; The emulator can't use indirect addresing. But I am planning to
	; implement it some day

	RTS

	.org $FFFA
	.word $0     ; NMI (NOT SUPPORTED IN EMULATOR)
	.word $C000  ; Reset
	.word $0     ; IRQ (Not implemented yet, but will be in the future)