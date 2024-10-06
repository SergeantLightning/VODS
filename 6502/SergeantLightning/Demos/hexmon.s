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
	INY
	STY OPFLAGS	; Default to read mode
	DEY
BOOTMSG:
	LDA welcome,Y
	CMP #0
	BEQ MSGDONE
	STA $BC00
	INY
	JMP BOOTMSG
MSGDONE:
	LDA #13		; CR
	STA $BC00	; Output it
	LDA #'>'
	STA $BC00
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
	; Processing code goes here
	STY RPTR
	LDA #'>'
	STA $BC00
	JMP DONE
SETBLOCK:
	STA $BC00
	LDA OPFLAGS
	ORA #2
	STA OPFLAGS
	JMP DONE
SETW:
	STA $BC00
	LDA OPFLAGS
	AND #0
	STA OPFLAGS
	JMP DONE
BKSP:
	DEY
	STA $BC00
DONE:
	LDA #0
	STA KBIN
	JMP GETKEY

welcome: .asciiz "Hexmon"

	.org $FFFC
	.word $C000
	.word $0