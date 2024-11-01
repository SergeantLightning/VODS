.setcpu "65C02"
.segment "CODE"

KBIN	= $7FFE
TTYOUT	= $7FFB

CHRIN:
	LDA KBIN
	BEQ NOCH
	STZ KBIN
NOCH:
	RTS

CHROUT:
	STA TTYOUT
	RTS

NOTPOSSIBLE:
	RTS

.segment "RESVEC"
.word $0
.word COLD_START
.word $0