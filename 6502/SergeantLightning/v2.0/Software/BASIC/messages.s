syntaxerr: .byte "Syntax error",13,0
isnothex: .byte "Invalid byte/word given",13,0
isnotvar: .byte "Invalid variable name",13,0

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

PRINVHEX:
  LDX #0
INVHEXLOOP:
  LDA isnothex,X
  BEQ DONEPRERR
  JSR CHROUT
  INX
  JMP ERRLOOP
DONEPRINVHEX:
  RTS