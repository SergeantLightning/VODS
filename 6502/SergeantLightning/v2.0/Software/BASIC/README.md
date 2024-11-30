# VODS BASIC - A Custom BASIC Interpreter written for SergeantLightning's VODS 6502 Emulator

## Important things to know

- Numbers must be provided in hexadecimal (EXCLUDING markers like 0x, h, $, etc.) To use decimal, use TOHEX function. For example, TOHEX(127) allows you to use decimal 127 instead of its hex equivalent (0x7F)
- A command dealing with numbers might look like this: POKE 7F68, AA
- Commands ***MUST*** be given in uppercase
- If your program counts line numbers by 10, it will leave 9 spaces for commands behind it. **This will reduce how big your program can be**
- Excluding line numbers, each command can be up to 64 Characters long, and takes up 64 bytes of memory.

## List of keywords (None do anything yet)

- PRINT
- LET
- IF
- GOTO
- GOSUB
- RETURN
- FOR
- POKE
- INPUT
- END
- NEW
- LIST
- DIM()
- PEEK()
- TOHEX()
