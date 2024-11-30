INTERRUPT:
    RTI               ; Feel free to edit if your machine needs to run code during interrupts

    .org $FFFA
    .word INTERRUPT
    .word RESET
    .word INTERRUPT