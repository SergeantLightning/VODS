; IMPORTANT: THIS VERSION COMPILES WITH CA65, LINKER CONFIG IS PROVIDED IN SOFTWARE DIRECTORY
; Filename: slvods6502.cfg

.setcpu "65C02"

TTYOUT  := $7FFB 	; Teletype output
KBIN    := $7FFE 	; Keyboard Input

.segment "ZP"

L: .res 1			; Address low byte
H: .res 1			; Address high byte
WBH: .res 1			; High nibble of byte to write
WBL: .res 1			; Low nibble of byte to write
READCNT: .res 1		; Counter for block reads
HOFS: .res 1		; Screen horizontal offset

.segment "RAM"

IN: .res $100	 	; 256 Byte Input Buffer

.segment "CODE"

	.org $8000

RESET:
	CLD				; Clear decimal arithmetic mode.
	SEI				; No interrupts
	LDY #0			; Set up buffer index
NEXTOP:
	STZ KBIN		; Clear keyboard input
	STZ L
	STZ H
	STZ WBH
	STZ WBL
	STZ READCNT		; Clear block read counter
	STZ HOFS		; Clear screen horizontal offset
BOOTMSG:
	LDA #':'		; Ready symbol
	STA TTYOUT		; Output it
GETKEY:
	LDA KBIN		; Key pressed?
	BEQ GETKEY		; No, loop until ready
	STA IN,Y		; Store to buffer
	STA TTYOUT		; Output character
	STZ KBIN		; Clear key
	CMP #13			; CR?
	BEQ GO			; Yes, fall though if no
	CMP #8			; Backspace?
	BEQ BKSP		; Yes
	BRA GETKEY		; Wait for next key
BKSP:
	DEY
	BRA GETKEY
GO:
	LDY #0
READINPUT:
	LDA IN,Y		; Get inputted character
	CMP #13			; CR?
	BEQ NEXTOP

; SUBROUTINES

SHIFT:
	PHX
	LDX #0
SLOOP:
	CPX #4
	BEQ SDONE
	CLC
	ASL L
	ROL H
	INX
	BRA SLOOP
SDONE:
	PLX
	RTS

PARSEBYTE:
	CMP #10				; 0-9?
	BCC PARSEDIG		; Yes, fall through if no
	CLC
	ADC #55
	RTS
PARSEDIG:
	CLC
	ADC #48
	RTS

ATB:
	CMP #'A'		; Letter?
	BCS LETTER		; Yes, fall through if digit
	SEC
	SBC #48			; Convert ASCII digit to binary digit
	RTS
LETTER:
	SEC
	SBC #55			; ASCII to binary
	RTS

INADDR:
	PHA
	LDA L
	CMP #$FF
	BEQ INHB		; Need to increment high byte
INLB:
	INC L
	PLA
	RTS
INHB:
	INC H
	BRA INLB

.segment "VECS"

	.org $FFFA
	.word $0
	.word RESET
	.word $0