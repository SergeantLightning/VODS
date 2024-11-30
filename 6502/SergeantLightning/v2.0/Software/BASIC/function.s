; I/O functions
CHRIN:
    LDA KB
    BEQ KEYNOTFOUND
    PHA
    LDA #0
    STA KB
    PLA
    SEC
    BCS DONEKEY       ; Always taken
KEYNOTFOUND:
    CLC
DONEKEY:
    RTS

CHROUT:
    STA SCREEN
    RTS

; Command processing functions

GETBYTE:
    PHA
    LDA TXTBUFFER,Y
    JSR ATB
    ASL
    ASL
    ASL
    ASL
    STA LBYTE
    INY
    LDA TXTBUFFER,Y
    JSR ATB
    ORA LBYTE
    STA LBYTE
    INY
    PLA
    RTS

GETWORD:
    JSR GETBYTE
    LDA LBYTE
    STA LWORD+1
    JSR GETBYTE
    LDA LBYTE
    STA LWORD
    RTS


ATB:
    CMP #'G'          ; Invalid digit?
    BEQ INVALID
    CMP #'A'          ; Letter?
    BCS LETTER        ; Yes, fall through if digit
    SEC
    SBC #48           ; Convert ASCII digit to binary digit
    RTS
LETTER:
    SBC #55           ; ASCII to binary
    RTS
INVALID:
    PHA               ; If invalid, returns with overflow flag set.

    PHP               ; Here's a trick to set the overflow flag
    PLA               ; Move flags into A register
    ORA #64           ; Overflow flag is bit 6, set it to 1 (overflow set)
    PHA
    PLP               ; Move A register to flags, now overflow flag is set

    PLA
    RTS