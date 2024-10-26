L		= $0		; Address low byte
H		= $1		; Address high byte
RPTR		= $2		; Buffer Read Start
WBH		= $3		; High nibble of byte to write
WBL		= $4		; Low nibble of byte to write
READCNT		= $5		; Counter for block reads
HOFS		= $6		; Screen horizontal offset
ENDL		= $7		; Used for bug work around code

IN      	= $0200 	; 256 Byte Input Buffer
TTYOUT  	= $7FFB 	; Teletype output
KBIN    	= $7FFE 	; Keyboard Input

	.org $8000

JBKSP:
	JMP BKSP
JDONE:
	JMP DONE
RESET:
	CLD			; Clear decimal arithmetic mode.
	SEI			; No interrupts
	LDY #0			; Set up buffer index
	STY KBIN		; Clear keyboard input
	STY RPTR		; Set up read start
	STY READCNT		; Clear block read counter
	STZ HOFS		; Clear screen horizontal offset
	LDA #16
	STA ENDL
BOOTMSG:
	LDA #':'		; Ready symbol
	STA TTYOUT		; Output it
	LDY #0
GETKEY:
	LDA KBIN		; New key pressed?
	BEQ GETKEY		; No
	CMP #13         	; CR?
	BEQ GO			; Yes
	CMP #8			; Backspace?
	BEQ JBKSP		; Yes
	CMP #$5B		; Invalid character?
	BCS JDONE		; Yes, don't store or display it
	STA IN,Y		; Store key
	INY
	STA TTYOUT		; Output key
	BRA JDONE
GO:
	LDA #13
	STA TTYOUT
	STA IN,Y
	INY
	; Convert input to address
	PHY			; Save End of input
	LDY RPTR
RLOOP:
	LDA IN,Y		; Load first character
	CMP #13			; End of input?
	BEQ READDONE	; Yes
	CMP #'>'		; Block read?
	BEQ SETBLOCK	; Yes
	CMP #'<'		; Writing?
	BEQ GOWRITE		; Yes
	CMP #'R'		; Running another program?
	BEQ RUNPROG		; Yes
	; Digit Parsing
	JSR SHIFT
	JSR ATB			; Convert ASCII character to binary
	BRA NEXTR
SETBLOCK:
	INY
	LDA IN,Y		; Load high nibble of read count
	JSR ATB			; Convert to binary
	ASL
	ASL
	ASL
	ASL
	STA READCNT		; Store as high byte
	INY
	LDA IN,Y		; Load low nibble of read count
	JSR ATB			; Convert to binary
	ORA READCNT		; Combine with high nibble
	STA READCNT		; Store full read count
	INY
	BRA RLOOP
GOWRITE:
	PHY
	INY
	JMP WLOOP
RUNPROG:
	JMP (L)			; Jump to program address
NEXTR:
	ORA L
	STA L
	INY
	BRA RLOOP
READDONE:
	PHY
	LDY #0
LOADLOOP:
	CPY READCNT		; Reached read count?
	BEQ OPDONE		; Branch if yes
	LDA (L),Y		; Load byte
	PHA
	AND #$F0		; Save high byte
	LSR
	LSR
	LSR
	LSR
	JSR PARSEBYTE		; Convert to ASCII character
	STA TTYOUT		; Output it
	PLA
	AND #$0F		; Save low byte
	JSR PARSEBYTE		; Convert to ASCII character
	STA TTYOUT		; Output it
	INY

	LDA HOFS
	CLC
	ADC #2
	CMP ENDL		; Need to go to new line?
	STA HOFS
	BCS OUTCR		; Branch if yes
	BRA OUTSPACE
OUTCR:
	LDA #13
	STA TTYOUT
	LDA #6
	STA HOFS
	LDA #21
	STA ENDL		; Update text output variables
	BRA NEXTLOAD
OUTSPACE:
	LDA #32
	STA TTYOUT
NEXTLOAD:
	BRA LOADLOOP
OPDONE:
	PLY
	STZ L
	STZ H
	STZ READCNT		; Reset address & read count
	PLY
	STY RPTR
	LDA #13
	STA TTYOUT
	STA TTYOUT
	LDA #':'
	STA TTYOUT
	BRA DONE
WLOOP:
	PHX			; Save X register
	LDX #0
GETNIBBLE:
	CPX #2			; Done parsing byte?
	BEQ NEXTW		; Branch if yes
	LDA IN,Y		; Get current nibble
	CMP #13			; CR?
	BEQ WDONE		; Branch if yes
	CMP #32			; Space?
	BEQ ISSPACE		; Branch if yes, ignore it
	JSR ATB			; Convert nibble to binary
	STA WBH,X		; Store it
	INX
ISSPACE:
	INY
	BRA GETNIBBLE
NEXTW:
	LDA WBH			; Get high byte
	ASL
	ASL
	ASL
	ASL
	ORA WBL			; Combine with low byte
	STA (L)			; Store it
	JSR INADDR		; Increment store address
	LDX #0
	BRA GETNIBBLE		; Process next byte to write to memory
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
	STA ENDL		; Reset variables for the next operation
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
	RTS

PARSEBYTE:
	CMP #10			; 0-9?
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

	.org $FFFC
	.word RESET
	.word $0
