; Hexmon2.1 By SergeantLightning
;
; Should compile to 298 Bytes (including reset/interrupt vectors)
;
; >> Type an address in hex to view it's contents, such as C000 or F
; >> Type an address followed by greater than sign, and then a hex number 00 - FF to view 0 - 255 bytes starting at the entered address, such as 8000>10
; >> Type an address, less than sign, followed with bytes to write to an address.
; You can write this test program to memory: 1000<A9 41 8D FB 7F 4C 00 10
; Note: Bytes less than 15 must be padded with a zero
;
; >> Type an address followed by R to jump to a memory location
; Example: 1000R

KBIN	= $7FFE			; Keyboard input
TTYOUT	= $7FFB			; Teletype output
IN	= $80			; 128 byte input buffer in ZP

AL	= $0			; Address low
AH	= $1			; Address high
BYTE	= $2			; Last parsed byte
RDCNT	= $3			; Number of bytes that have been printed

	.org $8000

RESET:
	CLD
	SEI
BUFFOVRN:
	LDX #0			; Setup input buffer index
NEXTOP:
	LDA #':'		; Ready symbol
	STA TTYOUT		; Output it
	STZ KBIN
	STZ BYTE
	STZ AL
	STZ AH
	STZ RDCNT		; Clear ZP variables
GETKEY:
	LDA KBIN
	BEQ GETKEY		; Wait until a key has been pressed
	CMP #13			; CR?
	BEQ GO			; Yes
	CMP #8			; Backspace?
	BEQ BKSP		; Yes
	CMP #32			; Space?
	BEQ BLANK		; Yes
	CMP #48			; Invalid character?
	BCC NOSTOR		; Yes, reset
	STA IN,X		; Store to buffer
	INX			; Increment buffer index
BLANK:
	STA TTYOUT		; Output character
NOSTOR:
	BMI BUFFOVRN		; Reset if more than 128 chars were typed
NEXTKEY:
	STZ KBIN
	BRA GETKEY		; Get next key
BKSP:
	DEX
	STA TTYOUT
	BMI BUFFOVRN		; Decremented to value larger than 127
	BRA NEXTKEY
GO:
	STA IN,X
	STA TTYOUT
	LDX #0
	PHX
RLOOP:
	LDA IN,X
	CMP #13			; Done reading command?
	BEQ DONEREAD		; Yes
	CMP #'>'		; Block read?
	BEQ SETBLOCK		; Yes
	CMP #'<'		; Write?
	BEQ GOWRITE		; Yes
	CMP #'R'		; Run program?
	BEQ GORUN		; Yes
	JSR SHIFT		; Shift target address
	JSR ATB			; Convert current character to binary digit
	ORA AL
	STA AL			; Add to target address
	INX
	BRA RLOOP
SETBLOCK:
	INX
	JSR GETBYTE		; Get count and store it in BYTE
	BRA DONEREAD
GORUN:
	JMP (AL)
GOWRITE:
	LDA BYTE
	PHA			; Save BYTE
WLOOP:
	INX
	LDA IN,X
	CMP #13
	BEQ DONEWRITE
	JSR GETBYTE
	LDA BYTE
	STA (AL)
	JSR INADDR
	BRA WLOOP
DONEWRITE:
	PLA
	STA BYTE
	PLX
	JMP NEXTOP
DONEREAD:
	LDY #0
	CPY BYTE
	BEQ READSINGLE
OUTLOOP:
	CPY BYTE		; Done with block read?
	BEQ DONEOUT		; Yes
	LDA (AL)		; Load byte at target address
	JSR PRBYTE		; Print byte in A register as ASCII
	INY
	JSR INADDR		; Increment read address
	BRA OUTLOOP
DONEOUT:
	PLX
	LDA #13
	STA TTYOUT
	STA TTYOUT		; New line
	JMP NEXTOP
READSINGLE:
	INC BYTE
	BRA OUTLOOP

; SUBROUTINES

SHIFT:
	PHX
	LDX #4
SLOOP:
	ASL AL
	ROL AH
	DEX
	BEQ SDONE
	BRA SLOOP
SDONE:
	PLX
	RTS

PARSEBYTE:
	CMP #10			; 0-9?
	BCC PARSEDIG		; Yes, fall through if no
	CLC
	ADC #55
	RTS
PARSEDIG:
	ADC #48
	RTS

ATB:
	CMP #'A'		; Letter?
	BCS LETTER		; Yes, fall through if digit
	SEC
	SBC #48			; Convert ASCII digit to binary digit
	RTS
LETTER:
	SBC #55			; ASCII to binary
	RTS

INADDR:
	PHA
	LDA AL
	CMP #$FF
	BEQ INHB		; Need to increment high byte
INLB:
	INC AL
	PLA
	RTS
INHB:
	INC AH
	BRA INLB


PRBYTE:
	PHA
	LSR
	LSR
	LSR
	LSR			; Move high nibble to low nibble spot
	JSR PARSEBYTE		; Convert to ASCII
	STA TTYOUT		; Output it
	PLA
	AND #$0F		; Get low nibble
	JSR PARSEBYTE
	STA TTYOUT		; Convert and output it
	LDA #32
	STA TTYOUT		; Output space
	INC RDCNT
	LDA RDCNT
	CMP #8
	BEQ PRCR
	BRA PRDONE
PRCR:
	LDA #13
	STA TTYOUT
	STZ RDCNT
PRDONE:
	RTS

GETBYTE:
	LDA IN,X		; Get high nibble of count
	JSR ATB			; Convert to binary
	ASL
	ASL
	ASL
	ASL			; Shift to high nibble of read count
	STA BYTE		; Store it
	INX
	LDA IN,X		; Get low nibble
	JSR ATB			; Convert to binary
	ORA BYTE		; Combine with high nibble
	STA BYTE		; Store to read count
	RTS

	.org $FFFA
	.word $0		; NMI
	.word RESET		; Reset vector
	.word $0		; IRQ