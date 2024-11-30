; System functions
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

INTERRUPT:
    RTI               ; Feel free to edit if your machine needs to run code during interrupts

    .org $FFFA
    .word INTERRUPT
    .word RESET
    .word INTERRUPT