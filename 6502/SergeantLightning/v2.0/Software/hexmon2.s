L	= $0
H	= $1
RPTR	= $2	; Buffer Read Start
WBH	= $3	; High nibble of byte to write
WBL	= $4	; Low nibble of byte to write
READCNT	= $5	; Counter for block reads
HOFS	= $6	; Screen horizontal offset
ENDL	= $7	; Used for bug work around code

IN      = $0200 ; 256 Byte Input Buffer
TTYOUT  = $7FFB ; Teletype output
KBIN    = $7FFE ; Keyboard Input

	.org $8000

JBKSP:
	JMP BKSP
JDONE:
	JMP DONE
RESET:
	CLD		; Clear decimal arithmetic mode.
	SEI		; No interrupts
	LDY #0		; Set up buffer index
	STY KBIN	; Clear keyboard input
	STY RPTR	; Set up read start
	STY READCNT	; Clear block read counter
	STZ HOFS	; Clear screen horizontal offset
	LDA #16
	STA ENDL
BOOTMSG:
	LDA #':'	; Ready symbol
	STA TTYOUT	; Output it
	LDY #0
GETKEY:
	LDA KBIN	; New key pressed?
	BEQ GETKEY	; No
	CMP #13         ; CR?
	BEQ GO		; Yes
	CMP #8		; Backspace?
	BEQ JBKSP	; Yes
	CMP #$5B	; Invalid character?
	BCS JDONE	; Yes, don't store or display it
	STA IN,Y	; Store key
	INY
	STA TTYOUT	; Output key
	BRA JDONE
GO:
	LDA #13
	STA TTYOUT
	STA IN,Y
	INY
	; Convert input to address
	PHY		; Save End of input
	LDY RPTR
RLOOP:
	LDA IN,Y	; Load first character
	CMP #13		; End of input?
	BEQ READDONE	; Yes
	CMP #'>'	; Block read?
	BEQ SETBLOCK	; Yes
	CMP #'<'	; Writing?
	BEQ GOWRITE	; Yes
	; Digit Parsing
	JSR SHIFT
	JSR ATB		; Convert ASCII character to binary
	BRA NEXTR
SETBLOCK:
	INY
	LDA IN,Y
	JSR ATB
	ASL
	ASL
	ASL
	ASL
	STA READCNT
	INY
	LDA IN,Y
	JSR ATB
	ORA READCNT
	STA READCNT
	INY
	BRA RLOOP
GOWRITE:
	PHY
	INY
	JMP WLOOP
NEXTR:
	ORA L
	STA L
	INY
	BRA RLOOP
READDONE:
	PHY
	LDY #0
LOADLOOP:
	CPY READCNT
	BEQ OPDONE
	LDA (L),Y
	PHA
	AND #$F0		; Save high byte
	LSR
	LSR
	LSR
	LSR
	JSR PARSEBYTE
	STA TTYOUT
	PLA
	AND #$0F		; Save low byte
	JSR PARSEBYTE
	STA TTYOUT
	INY

	LDA HOFS
	CLC
	ADC #2
	CMP ENDL
	STA HOFS
	BCS OUTCR
	BRA OUTSPACE
OUTCR:
	LDA #13
	STA TTYOUT
	LDA #6
	STA HOFS
	LDA #21
	STA ENDL
	BRA NEXTLOAD
OUTSPACE:
	LDA #" "
	STA TTYOUT
NEXTLOAD:
	BRA LOADLOOP

OPDONE:
	PLY
	STZ L
	STZ H
	STZ READCNT
	PLY
	STY RPTR
	LDA #13
	STA TTYOUT
	STA TTYOUT
	LDA #':'
	STA TTYOUT
	BRA DONE
WLOOP:
	PHX
	LDX #0
GETNIBBLE:
	CPX #2
	BEQ NEXTW
	LDA IN,Y	; Get low nibble
	JSR ATB		; Convert to binary
	STA WBH,X	; Store it
	INY
	INX
	BRA GETNIBBLE
NEXTW:
	LDA WBH		; Get high byte
	ASL
	ASL
	ASL
	ASL
	ORA WBL		; Add low byte
	STA (L)		; Store it
WDONE:
	PLX
	BRA OPDONE
BKSP:
	DEY
	STA TTYOUT
DONE:
	STZ KBIN
	STZ L
	STZ H
	STZ WBL
	STZ WBH
	STZ HOFS
	LDA #16
	STA ENDL
	JMP GETKEY

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
	.byte $FC
	.byte $1
	.byte $FC
	.byte $2
	RTS

PARSEBYTE:
	CMP #10		; 0-9?
	BCC PARSEDIG	; Yes, fall through if no
	CLC
	ADC #55
	RTS
PARSEDIG:
	CLC
	ADC #48
	RTS

ATB:
	CMP #'A'	; Letter?
	BCS LETTER	; Yes, fall through if digit
	SEC
	SBC #48		; Convert ASCII digit to binary digit
	RTS
LETTER:
	SEC
	SBC #55		; ASCII to binary
	RTS

	.org $FFFC
	.word RESET
	.word $0
