#include <stdio.h>
#include <stdint.h>
#include <string.h>

int count = 4;
uint8_t RAM[65536];
char RVL[2]; // reset address low byte
char RVH[4]; // reset address high byte
uint16_t PC = 0x8000; // Program Counter
uint8_t A = 0; // A Register
uint8_t X = 0; // X Register
uint8_t Y = 0; // Y Register

void run() {
    switch (RAM[PC]) {
        case 0xa9:
            // LDA Immediate
            printf("LDA Immediate\n");
            PC += 1;
            A = RAM[PC];
            break;
        case 0xa5:
            //LDA ZP
            PC += 1;
            A = RAM[RAM[PC]];
            break;
        default:
            printf("Unknown or unimplemented instruction\n");
            break;
    }
    PC += 1;
    if (count != 0) {
        count -= 1;
        run();
    }
}

int main(int argc, char *argv[]) {
    // Initialize
    printf("Searching for ROM image at %s\n", argv[1]);
    FILE *image = fopen(argv[1], "rb"); // Open file in binary mode
    if (image == NULL) {
        perror("Error opening file");
        return 1;
    } else {
        printf("Reading image...\n");
    }
    int byte;
    for (int i = 0; i < 32768; i++) {
        byte = fgetc(image);
        RAM[32768+i] = byte;
        //printf("%d  ", byte);
    }
    fclose(image);

    // Get reset vector

    sprintf(RVL, "%02x", RAM[65532]); // Get low byte
    sprintf(RVH, "%02x", RAM[65533]); // Get high byte
    strcat(RVH, RVL); // Combine into 1 string
    printf("%s\n", RVH);
    sscanf(RVH, "%x", &PC); // Convert to decimal and store to PC

    printf("PC Set to: %d\n", PC);

    // Start emulation

    printf("Starting machine...\n\n\n\n\n\n\n");

    run();

    return 0;
}
