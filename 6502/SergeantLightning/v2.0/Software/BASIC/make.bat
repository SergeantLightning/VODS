@echo off
echo Building vods6502 BASIC...
ca65 -D vods6502 msbasic.s -o tmp/vods6502.o
ld65 -C vods6502.cfg tmp/vods6502.o -o tmp/vods6502.bin -Ln tmp/vods6502.lbl