SL      = $0	; Start low byte
SH      = $1	; Start high byte
EL      = $2	; End low byte
EH      = $3	; End high byte
OPFLAGS = $4	; B0 = R/W, B1 = Block read
RPTR	= $5	; Buffer Read Start

IN      = $0200 ; 256 Byte Input Buffer
TTYOUT  = $BC00 ; Teletype output
SCRMD   = $BFFD ; Screen Mode Register
KBIN    = $BFFE ; Keyboard Input

	.org $C000

RESET:
	CLD		; Clear decimal arithmetic mode.
	SEI		; No interrupts
	LDY #0		; Set up buffer index
	STY KBIN	; Clear keyboard input
	STY SCRMD	; Teletype Mode
	STY RPTR	; Set up read start
	INY
	STY OPFLAGS	; Default to read mode
	DEY
BOOTMSG:
	LDA #'>'	; Ready symbol
	STA $BC00	; Output it
	LDY #0
GETKEY:
	LDA KBIN
	CMP #0		; New key pressed?
	BEQ GETKEY	; No
	CMP #13         ; CR?
	BEQ GO		; Yes
	CMP #'.'	; Dot?
	BEQ SETBLOCK	; Yes
	CMP #':'	; Colon?
	BEQ SETW	; Yes
	CMP #8		; Backspace?
	BEQ BKSP	; Yes
	STA IN,Y	; Store key
	INY
	STA $BC00	; Output key
	JMP DONE
GO:
	LDA #13
	STA $BC00
	STA IN,Y
	; Processing code goes here
	LDA OPFLAGS
	CMP #0		; Write?
	BEQ WRITE	; Yes
	CMP #1		; Read?
	BEQ READ	; Yes
	CMP #2		; Block Read?
	BEQ BLOCKREAD	; Yes
	JMP OPDONE	; Invalid operation
READ:
	PHY		; Save End of input
	LDY RPTR
RLOOP:
	LDA IN,Y	; Load first character
	CMP #13		; End of input?
	BEQ OPDONE
	CMP #'0'	; Invalid character?
	BCC OPDONE	; Yes
	CMP #'A'	; Letter?
	BCS LETTER	; Yes, fall through if digit
	CMP #":"	; Invalid character?
	BCS OPDONE	; Yes
LETTER:
	STA $BC00
	INY
	JMP RLOOP
BLOCKREAD:
	PHY
	JMP OPDONE
WRITE:
	PHY
	JMP OPDONE
OPDONE:
	PLY
	LDA #1
	STA OPFLAGS
	STY RPTR
	LDA #13
	STA $BC00
	STA $BC00
	LDA #'>'
	STA $BC00
	JMP DONE
SETBLOCK:
	STA $BC00
	LDA #2
	STA OPFLAGS
	JMP DONE
SETW:
	STA $BC00
	LDA #0
	STA OPFLAGS
	JMP DONE
BKSP:
	DEY
	STA $BC00
DONE:
	LDA #0
	STA KBIN
	JMP GETKEY

	.org $FFFC
	.word $C000
	.word $0