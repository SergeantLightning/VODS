ISCMD:
  LDY #0
  LDX #0
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
  RTS
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
  CMP #$23          ; Closing quotes or less?
  BCC ISPRINT       ; Yes, done with print
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
  RTS


ISIF:
  RTS  

ISGOTO:
  RTS

ISGOSUB:
  RTS

ISRETURN:
  RTS

ISFOR:
  RTS

ISPOKE:
  ; DOESN'T WORK PROPERLY
  LDA #0
  STA LWORD
  STA LWORD+1
  STA LBYTE
  LDY #5
POKEADDR:
  JSR GETNIBBLE
  ASL
  ASL
  ASL
  ASL
  STA LWORD+1
  JSR GETNIBBLE
  ORA LWORD+1
  STA LWORD+1

  JSR GETNIBBLE
  ASL
  ASL
  ASL
  ASL
  STA LWORD
  JSR GETNIBBLE
  ORA LWORD
  STA LWORD
  INY
  JSR GETNIBBLE
  JSR ATB
  ASL
  ASL
  ASL
  ASL
  STA LBYTE
  JSR GETNIBBLE
  ORA LBYTE
  STA LBYTE
DONEPOKEBYTE:
  LDA LBYTE
  STY YSAVE
  LDY #0
  STA (LWORD),Y
  LDY YSAVE
  .byte $FC, LWORD+1, $FC, LWORD, $FC, LBYTE
  .byte $FB         ; Breakpoint for debugging
POKEDONE:
  RTS

ISINPUT:
  RTS

ISEND:
  RTS

ISNEW:
  RTS

ISLIST:
  RTS

ISARR:
  RTS

ISPEEK:
  RTS

ISTOHEX:
  RTS