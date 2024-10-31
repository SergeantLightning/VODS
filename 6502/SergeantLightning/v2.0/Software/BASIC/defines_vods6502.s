; configuration
CONFIG_2A := 1

CONFIG_CBM_ALL := 0

CONFIG_DATAFLG := 1
CONFIG_EASTER_EGG := 0
CONFIG_FILE := 0; support PRINT#, INPUT#, GET#, CMD
CONFIG_NO_CR := 0; terminal needs explicit CRs on line ends
CONFIG_NO_LINE_EDITING := 0; support for "@", "_", BEL etc.
CONFIG_NO_READ_Y_IS_ZERO_HACK := 1
CONFIG_PEEK_SAVE_LINNUM := 1
CONFIG_SCRTCH_ORDER := 2

; zero page
ZP_START1 = $00
ZP_START2 = $08
; Big gap to leave space for input buffer in case it's loaded into ZP (it shouldn't be for CBM BASIC 2)
ZP_START3 = $8F
ZP_START4 = $A2

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
;OPEN	:= $FFC0
;CLOSE	:= $FFC3
;CHKIN	:= $FFC6
;CHKOUT	:= $FFC9
;CLRCH	:= $FFCC
CHRIN	:= $FFCF
CHROUT	:= $FFD2
;LOAD	:= $FFD5
;SAVE	:= $FFD8
;VERIFY	:= $FFDB
;SYS	:= $FFDE
;ISCNTC	:= $FFE1
;GETIN	:= $FFE4
;CLALL	:= $FFE7
;LE7F3	:= $E7F3; for CBM1
MONCOUT	:= CHROUT
MONRDKEY := CHRIN