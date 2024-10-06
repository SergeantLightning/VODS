# SergeantLightning's 6502 Machine Emulator

## Important References

- Code can be up to 16 KiB when assembled
- Program starts at address 0xC000
- Screen memory in full control mode is from 0xBC00 (top left) to 0xBFE7 (bottom right), but Teletype mode use only 0xBC00
- Indirect addressing is NOT implemented for any instructions yet.
- Unlike past versions, you now have control over all of the memory instead of just the first 48KiB. **Please make sure you don't write to ROM addresses, as protections for that have not been implemented yet**
- Press F2 at any time to dump RAM contents to the browser DevTools console. This is a useful debugging feature (I hope)

## Hardware registers:

- Monitor Foreground color value is at address 0xBFE8
- Background color value is at 0xBFE9.
- Display mode at 0xBFFD (0 = Teletype, 1 = Full control)
- Last pressed key at 0xBFFE
- Serial Port at 0xBFFF

## Goals

- Get Wozmon or some hex monitor running
- Get BASIC running

## Todo
- Add support for the following instructions:
	- BIT, RTI, BRK
- Add support for indexed-indirect addressing (X register ONLY)