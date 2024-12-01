# VODS BASIC - A Custom BASIC Interpreter written for SergeantLightning's VODS 6502 Emulator

## Important things to know

- Numbers must be provided in hexadecimal (EXCLUDING markers like 0x, h, $, etc.) To use decimal, use TOHEX function. For example, TOHEX(127) allows you to use decimal 127 instead of its hex equivalent (0x7F)
- A command dealing with numbers might look like this: POKE 7F68, AA
- Commands and operands ***MUST*** be given in uppercase. For example, PRINT $A works, but PRINT $a or print $a will give a syntax error
- If your program counts line numbers by 10, it will leave 9 spaces for commands behind it. **This will reduce how big your program can be**
- Excluding line numbers, each command can be up to 64 Characters long, and takes up 64 bytes of memory.
- There are only 26 signed 16-Bit variables, named A - Z. To use them, type a dollar sign followed by the variable's name. Example: $Z = 72F0
- There is 1 array called ARR, which holds 32 values. You can read from it by giving an index, and write to it by giving an index + value from -32767 to 32767. Examples: ARR(1F), ARR(2A, -7FF0)
- Variables are not stored as typical signed 16-Bit numbers. They are stored as unsigned 15-Bit numbers with the 16th bit acting as a sign bit. This means that 0x8100 equals -256 in this BASIC interpreter, but by standard is equal to -32512

## List of keywords

Keywords with checkbox are implemented

- PRINT ✅
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
- ARR()
- PEEK()
- TOHEX()

## Special characters

- $ means variable
- Math operators: + - * /
- = is the assignment operator. Example: $A = -B2CF
- ; means omit new line