ISCMD:
  STA TXTBUFFER,Y
  JSR CHROUT
  LDY #0
  STY KB
ISCMDLOOP:
  LDA CMDLST,Y
  BEQ CMDNOTFOUND
  CMP #3
  BEQ WASCMDFOUND
  EOR TXTBUFFER,X
  BEQ CMDMATCH
NEXTCMDLOOP:
  INX
  INY
  JMP ISCMDLOOP
CMDNOTFOUND:
  JSR PRERR
  JMP NEXTOP
CMDMATCH:
  INC MATCHCNT
  JMP NEXTCMDLOOP
WASCMDFOUND:
  CPX MATCHCNT
  BEQ CMDFOUND
  LDX #0
  STX MATCHCNT
  INC CMDNUM
  INY
  JMP ISCMDLOOP
CMDFOUND:
  LDA CMDNUM
  TAX
  LDA #0
GETJMPOFFSET:
  CPX #0
  BEQ READYTOJUMP
  CLC
  ADC #2
  DEX
  JMP GETJMPOFFSET
READYTOJUMP:
  TAX
  ; The RTS Trick for the jump table (WARNING: VODS EMULATOR PULLS LOW BYTE, THEN HIGH BYTE IN RTS INSTRUCTION. THIS MAY NOT BE THE SAME FOR REAL 6502 CPUs)
  LDA CMDJMPTBL+1,X
  PHA
  LDA CMDJMPTBL,X
  PHA
  RTS

CMDJMPTBL:
  .word ISPRINT
  .word ISIF
  .word ISGOTO
  .word ISGOSUB
  .word ISRETURN
  .word ISFOR
  .word ISPOKE
  .word ISINPUT
  .word ISEND
  .word ISNEW
  .word ISLIST
  .word ISARR
  .word ISPEEK
  .word ISTOHEX

CMDLST:
  .byte "PRINT",3   ; Print command, all commands end with 0x3 if not last command in list.
  .byte "IF",3
  .byte "GOTO",3
  .byte "GOSUB",3
  .byte "RETURN",3
  .byte "FOR",3
  .byte "POKE",3
  .byte "INPUT",3
  .byte "END",3
  .byte "NEW",3
  .byte "LIST",3
  .byte "ARR(",3
  .byte "PEEK(",3
  .byte "TOHEX(",3
  .word 0           ; Terminating 0

PRERR:
  LDX #0
ERRLOOP:
  LDA syntaxerr,X
  BEQ DONEPRERR
  JSR CHROUT
  INX
  JMP ERRLOOP
DONEPRERR:
  RTS


; Command handlers

ISPRINT:
  INY
  LDA TXTBUFFER,Y
  CMP #13           ; CR?
  BEQ DONEPRINT     ; Yes, done with command
  CMP #$23          ; Quotes or space?
  BCC ISPRINT       ; Skip them
  CMP #'$'          ; Dollar sign?
  BEQ ISVAR         ; Yes, print variable
  CMP #';'          ; Omit new line?
  BEQ PRNONL        ; Yes
PRLOOP:
  JSR CHROUT
  INY
  LDA TXTBUFFER,Y
  CMP #$22          ; Closing quotes?
  BEQ ISPRINT       ; Yes, done with print
  JMP PRLOOP
ISVAR:
  INY
  LDA TXTBUFFER,Y
  CMP #$5B          ; Greater than Z?
  BCS INVALIDVAR
  SEC
  SBC #65           ; Get variable number
  JSR PRVAR         ; Print it
  JMP ISPRINT
INVALIDVAR:
  LDX #0
IVLOOP:
  LDA isnotvar,X
  BEQ DONEPRINT
  JSR CHROUT
  INX
  JMP IVLOOP
DONEPRINT:
  LDA #13
  JSR CHROUT
PRNONL:
  JMP NEXTOP

ISIF:
  JMP NEXTOP  

ISGOTO:
  JMP NEXTOP

ISGOSUB:
  JMP NEXTOP

ISRETURN:
  JMP NEXTOP

ISFOR:
  JMP NEXTOP

ISPOKE:
  JMP NEXTOP

ISINPUT:
  JMP NEXTOP

ISEND:
  JMP NEXTOP

ISNEW:
  JMP NEXTOP

ISLIST:
  JMP NEXTOP

ISARR:
  JMP NEXTOP

ISPEEK:
  JMP NEXTOP

ISTOHEX:
  JMP NEXTOP