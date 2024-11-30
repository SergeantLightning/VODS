; System Variables
ZPSTART   = $0          ; Start of ZP where BASIC can store variables
RAMSTART  = $0400       ; Start of program memory
RAMSIZE   = $7C00       ; Size of memory (starting at RAMSTART, can't auto detect)
ROMSTART  = $8000       ; Start of code ROM
TXTBUFFER = $200        ; 256-Byte Input Buffer start
INTVARS   = $300        ; 52 Bytes for integer variables (-32767 to 32767)
ARR       = $334        ; 64-Byte 32 number long array (signed 16-Bit)
NEXT      = $374        ; The next variable can be allocated starting here

KB = $7FFE
SCREEN = $7FFB

; Zero Page Variables

LINENUM = ZPSTART       ; Current program line number, 2 Bytes
MATCHCNT = ZPSTART+2    ; Command match counter, 1 byte
CMDNUM = ZPSTART+3      ; Command number, 1 byte
LWORD = ZPSTART+4       ; Last parsed word (little-endian), 2 bytes
LBYTE = ZPSTART+6       ; Last parsed byte, 1 byte


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
    .include "messages.s"
    .include "end.s"