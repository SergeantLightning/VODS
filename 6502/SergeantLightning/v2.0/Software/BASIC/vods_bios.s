.setcpu "65C02"
.segment "CODE"

KBIN	= $7FFE
TTYOUT	= $7FFB

MONRDKEY:
CHIN:
	LDA KBIN
	BEQ NOCH
	STZ KBIN
NOCH:
	RTS

MONCOUT:
CHOUT:
	STA TTYOUT
	RTS

ISCNTC:
	RTS

.segment "RESVEC"
.word $0
.word COLDSTART
.word $0