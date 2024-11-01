; configuration
CONFIG_2A := 1

CONFIG_CBM_ALL := 0

CONFIG_DATAFLG := 0
CONFIG_EASTER_EGG := 0
CONFIG_FILE := 0; support PRINT#, INPUT#, GET#, CMD
CONFIG_NO_CR := 0; terminal needs explicit CRs on line ends
CONFIG_NO_LINE_EDITING := 0; support for "@", "_", BEL etc.
CONFIG_NO_READ_Y_IS_ZERO_HACK := 1
CONFIG_PEEK_SAVE_LINNUM := 1
CONFIG_SCRTCH_ORDER := 2

; zero page
ZP_START1 = $00
ZP_START2 = $0A
; Big gap to leave space for input buffer in case it's loaded into ZP (it shouldn't be for CBM BASIC 2)
ZP_START3 = $70
ZP_START4 = $7B

; extra/override ZP variables
CURDVC			:= $000E
TISTR			:= $008D
Z96			:= $0096
POSX			:= $00C6
TXPSV			:= LASTOP
USR			:= GORESTART ; XXX

; inputbuffer
INPUTBUFFER     := $0200

; constants
SPACE_FOR_GOSUB		:= $3E
STACK_TOP		:= $FA
WIDTH			:= 40
WIDTH2			:= 30

RAMSTART2		:= $0300

; magic memory locations
ENTROPY = $E844

; monitor functions
ISCNTC	:= NOTPOSSIBLE
CHKIN := NOTPOSSIBLE
CHKOUT := NOTPOSSIBLE
CLALL := NOTPOSSIBLE
CLRCH := NOTPOSSIBLE
CLOSE := NOTPOSSIBLE
OPEN := NOTPOSSIBLE
SYS := NOTPOSSIBLE
VERIFY := NOTPOSSIBLE
SAVE := NOTPOSSIBLE
LOAD := NOTPOSSIBLE

MONCOUT	:= CHRIN
MONRDKEY := CHROUT