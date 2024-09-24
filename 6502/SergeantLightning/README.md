# SergeantLightning's 6502 Machine Emulator

## Important References

- Code can be up to 16 KiB when assembled
- Program starts at address 0xC000
- Screen memory is from 0xBC00 (top left) to 0xBCE7 (bottom right)
- (WHEN COLOR IS ADDED) Foreground color value is at address 0xBCE8, background color value is at 0xBCE9. Planning to have 16 color palette
- Indirect addressing is NOT implemented for any instructions. I can't find out what it does different, so I just ignored it.

## Goals

- Get Wozmon Running
- Get BASIC running

## Todo
- Add support for the following instructions:
	- EOR + ORA + BIT
	- Math + Compares
	- Increments & Decrements
	- Shifts
	- Jumps & branches
	- Status flag changes
	- RTS + RTI + BRK + NOP
- Add keyboard capturing
- Add color to text screen