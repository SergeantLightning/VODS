; SuperWozmon Segment - 287 Bytes + Reset vectors & message
; WARNING: NOT COMPATIBLE WITH ORIGINAL 6502
;
; Added command: U
; If you type U before an examine or block examine command, it will do a hexdump of that range or address instead of showing the hex bytes
; Example: U5000.503F will hexdump addresses 0x5000 - 0x503F

	.org $8000

XAML  = $20                            ; Last "opened" location Low
XAMH  = $21                            ; Last "opened" location High
STL   = $22                            ; Store address Low
STH   = $23                            ; Store address High
L     = $24                            ; Hex value parsing Low
H     = $25                            ; Hex value parsing High
YSAV  = $26                            ; Used to see if hex value is given
MODE  = $27                            ; $00=XAM, $7F=STOR, $AE=BLOCK XAM
ISDUMP = $28

IN	= $0200				; Input buffer
TTYOUT	= $7FFB				; Screen output
KBIN	= $7FFE

RESET:
		CLD
		SEI
                STZ	KBIN
NEXTRST:
                LDA     #$1B           ; Begin with escape.

NOTCR:
                CMP     #$08           ; Backspace key?
                BEQ     BACKSPACE      ; Yes.
                CMP     #$1B           ; ESC?
                BEQ     ESCAPE         ; Yes.
                INY                    ; Advance text index.
                BPL     NEXTCHAR       ; Auto ESC if line longer than 127.

ESCAPE:
		LDA	#'\'		; Ready prompt
		JSR	ECHO		; Output it
GETLINE:
		STZ	ISDUMP
		LDA	#$0D
		JSR	ECHO

                LDY     #$01           ; Initialize text index.
BACKSPACE:      DEY                    ; Back up text index.
                BMI     GETLINE        ; Beyond start of line, reinitialize.

NEXTCHAR:
                JSR	CHRIN		; Get character. Returns 0 if no new key
                BEQ     NEXTCHAR       ; Loop until ready.
                STA     IN,Y           ; Add to text buffer.
                JSR	ECHO           ; Display character.
                CMP     #$0D           ; CR?
                BNE     NOTCR          ; No.

                LDY     #$FF           ; Reset text index.
                LDA     #$00           ; For XAM mode.
SETBLOCK:
                ASL
SETSTOR:
                ASL                    ; Leaves $7B if setting STOR mode.
                STA     MODE           ; $00 = XAM, $74 = STOR, $B8 = BLOK XAM.
BLSKIP:
                INY                    ; Advance text index.
NEXTITEM:
                LDA     IN,Y           ; Get character.
                CMP     #$0D           ; CR?
                BEQ     GETLINE        ; Yes, done this line.
		CMP     #'.'           ; "."?
                BCC     BLSKIP         ; Skip delimiter.
                BEQ     SETBLOCK       ; Set BLOCK XAM mode.
                CMP     #':'           ; ":"?
                BEQ     SETSTOR        ; Yes, set STOR mode.
                CMP     #'R'           ; "R"?
                BEQ     RUN            ; Yes, run user program.
		CMP	#'U'		; Hex Dump?
		BEQ	SETDUMP		; Yes
                STZ     L              ; $00 -> L.
                STZ     H              ;    and H.
                STY     YSAV           ; Save Y for comparison

NEXTHEX:
                LDA     IN,Y           ; Get character for hex test.
                EOR     #$30           ; Map digits to $0-9.
                CMP     #$0A           ; Digit?
                BCC     DIG            ; Yes.
                ADC     #$88           ; Map letter "A"-"F" to $FA-FF.
                CMP     #$FA           ; Hex letter?
                BCC     NOTHEX         ; No, character not hex.
DIG:
                ASL
                ASL                    ; Hex digit to MSD of A.
                ASL
                ASL

                LDX     #$04           ; Shift count.
HEXSHIFT:
                ASL                    ; Hex digit left, MSB to carry.
                ROL     L              ; Rotate into LSD.
                ROL     H              ; Rotate into MSD's.
                DEX                    ; Done 4 shifts?
                BNE     HEXSHIFT       ; No, loop.
                INY                    ; Advance text index.
                BNE     NEXTHEX        ; Always taken. Check next character for hex.

NOTHEX:
                CPY     YSAV           ; Check if L, H empty (no hex digits).
                BEQ     ESCAPE         ; Yes, generate ESC sequence.

                BIT     MODE           ; Test MODE byte.
                BVC     NOTSTOR        ; B6=0 is STOR, 1 is XAM and BLOCK XAM.

                LDA     L              ; LSD's of hex data.
                STA     (STL,X)        ; Store current 'store index'.
                INC     STL            ; Increment store index.
                BNE     NEXTITEM       ; Get next item (no carry).
                INC     STH            ; Add carry to 'store index' high order.
TONEXTITEM:     BRA     NEXTITEM       ; Get next command item.

RUN:
                JMP     (XAML)         ; Run at current XAM index.
SETDUMP:
		STA	ISDUMP
		BRA	BLSKIP

NOTSTOR:
                BMI     XAMNEXT        ; B7 = 0 for XAM, 1 for BLOCK XAM.

                LDX     #$02           ; Byte count.
SETADR:         LDA     L-1,X          ; Copy hex data to
                STA     STL-1,X        ;  'store index'.
                STA     XAML-1,X       ; And to 'XAM index'.
                DEX                    ; Next of 2 bytes.
                BNE     SETADR         ; Loop unless X = 0.

NXTPRNT:
                BNE     PRDATA         ; NE means no address to print.
                LDA     #$0D           ; CR.
                JSR	ECHO           ; Output it.
		LDA	ISDUMP
		PHA
		STZ	ISDUMP
                LDA     XAMH           ; 'Examine index' high-order byte.
                JSR     PRBYTE         ; Output it in hex format.
                LDA     XAML           ; Low-order 'examine index' byte.
                JSR     PRBYTE         ; Output it in hex format.
		PLA
		STA	ISDUMP
                LDA     #$3A           ; ":".
                JSR	ECHO           ; Output it.

PRDATA:
                LDA     #$20           ; Blank.
                JSR	ECHO           ; Output it.
                LDA     (XAML,X)       ; Get data byte at 'examine index'.
                JSR     PRBYTE         ; Output it in hex format.
XAMNEXT:        STZ     MODE           ; 0 -> MODE (XAM mode).
                LDA     XAML
                CMP     L              ; Compare 'examine index' to hex data.
                LDA     XAMH
                SBC     H
                BCS     TONEXTITEM     ; Not less, so no more data to output.

                INC     XAML
                BNE     MOD8CHK        ; Increment 'examine index'.
                INC     XAMH

MOD8CHK:
                LDA     XAML           ; Check low-order 'examine index' byte
                AND     #$07           ; For MOD 8 = 0
                BPL     NXTPRNT        ; Always taken.

PRBYTE:
		PHA
		LDA	ISDUMP
		CMP	#'U'
		PLA
		BEQ	DUMPING
                PHA                    ; Save A for LSD.
                LSR
                LSR
                LSR                    ; MSD to LSD position.
                LSR
                JSR     PRHEX          ; Output hex digit.
                PLA                    ; Restore A.

PRHEX:
                AND     #$0F           ; Mask LSD for hex print.
                ORA     #$30           ; Add "0".
                CMP     #$3A           ; Digit?
                BCC     GOPRINT        ; Yes, output it.
                ADC     #$06           ; Add offset for letter.
GOPRINT:
		JMP	ECHO
DUMPING:
		CMP	#32
		BCC	NOTTEXT
		CMP	#127
		BCS	NOTTEXT
		BRA	GOPRINT
NOTTEXT:
		LDA	#'.'
ECHO:
		STA	TTYOUT
		RTS
CHRIN:
		LDA	KBIN		; Key pressed?
		BEQ	CHDONE		; No, return 0
		STZ	KBIN		; Clear key, it's loaded into A
CHDONE:
		RTS


	.org $FFFA

        .word   $0F00          ; NMI vector
        .word   RESET          ; RESET vector
	.word   $0000          ; IRQ vector