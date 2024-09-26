# SergeantLightning's 6502 Machine Emulator

## Important References

- Code can be up to 16 KiB when assembled
- Program starts at address 0xC000
- Screen memory is from 0xBC00 (top left) to 0xBFE7 (bottom right)
- (WHEN COLOR IS ADDED) Foreground color value is at address 0xBFE8, background color value is at 0xBFE9. Planning to have 8 or 16 color palette
- Indirect addressing is NOT implemented for any instructions yet.
- Unlike past versions, you now have control over all of the memory instead of just the first 48KiB. Please make sure you don't write to ROM addresses, as protections for that have not been implemented yet

## Goals

- Get Wozmon Running
- Get BASIC running

## Todo
- Add support for the following instructions:
	- BIT
	- Jumps & branches
	- Status flag changes
	- RTS + RTI + BRK + NOP
- Add support for indexed-indirect addressing (X register ONLY)
- Add keyboard capturing
- Add color to text screen