# SergeantLightning's 6502 Machine Emulator v2.0

## What's changed

- Code can be up to 32 KiB when assembled, but the disk image must be 32 KiB in size (pad/fill extra space with 0s or 0xEA bytes)
- 32 KiB of RAM. 0x100 - 0x1FF is the stack location, and 0x7FFB - 0x7FFF are emulated hardware registers
- Program starts at address 0x8000
- Screen **Full control mode is deprecated, but you can still normally use backspace and Carriage Return (CR). Line feeds (LF) will be ignored. Only teletype mode is supported now.** You can send characters to the screen using address 0x7FFB
- In your source code, you can use 0xFC followed by a ZP address to dump a ZP address to the DevTools Console, and 0xF4 followed by a 16-Bit address in little-endian format to dump a 16-Bit address. You can also dump all 64 KiB of memory by pressing F2 at any time

## Hardware registers:

- Teletype output is at address 0x7FFB
- Monitor Foreground color value is at address 0x7FFC
- Background color value is at 0x7FFD
- Last pressed key at 0x7FFE
- Parallel Port at 0x7FFF

## Goals

- Get some hex monitor running
- Get Tiny BASIC running

## Todo
- Re-code all instructions