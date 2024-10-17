LKEY = $0	       ; Last Pressed Key
KBIN = $BFFE	       ; Keyboard input address

	.org $C000

start:
	LDX #0
	LDA KBIN
	STA LKEY       ; Clear input address
	LDA #0
	STA $BFFD      ; Set to teletype mode
main:
	LDA KBIN
	CMP LKEY
	BEQ main       ; While LKEY != KBIN, don't do anything

	STA $BC00    ; Store character
	LDA #0
	STA LKEY
	STA KBIN     ; Clear character
	JMP main

	.org $FFFA
	.word $0     ; NMI (NOT SUPPORTED IN EMULATOR)
	.word $C000  ; Reset
	.word $0     ; IRQ (Not implemented yet, but will be in the future)
