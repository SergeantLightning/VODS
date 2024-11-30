; System Variables
ZPSTART = $0
RAMSTART = $0400
RAMSIZE  = $7C00
ROMSTART = $8000
TXTBUFFER = $200
INTVARS = $300

KB = $7FFE
SCREEN = $7FFB

; Zero Page Variables

LINENUM = ZPSTART       ; Current program line number, 2 Bytes
MATCHCNT = ZPSTART+2    ; Command match counter, 1 byte
CMDNUM = ZPSTART+3      ; Command number, 1 byte
LADDR = ZPSTART+4       ; Last address used in POKE or PEEK, 2 bytes


    .org ROMSTART

RESET:
    CLD
    CLI
    LDA #0
    STA LINENUM
    STA LINENUM+1
NEXTOP:
    LDA #'>'
    JSR CHROUT
    LDY #0
    TYA
    TAX
    STA MATCHCNT
    STA CMDNUM
GETKEY:
    JSR CHRIN
    BCC GETKEY
    CMP #13
    BEQ ISCMD
    CMP #8
    BEQ BKSP
    STA TXTBUFFER,Y
    INY
    JSR CHROUT
    JMP GETKEY
BKSP:
    CPY #0
    BEQ GETKEY
    DEY
    JSR CHROUT
    JMP GETKEY


    .include "command.s"
    .include "function.s"