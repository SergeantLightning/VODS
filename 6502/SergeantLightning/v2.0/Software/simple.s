TTYOUT  = $7FFB 	; Teletype output

    .org $600

    LDA #0
LOOP:
    STA TTYOUT
    INC A
    BRA LOOP