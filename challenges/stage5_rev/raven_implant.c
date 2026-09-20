/*
 * Project AegisBreach — Stage 5 Reverse Engineering Challenge
 * Target: Linux x86_64 ELF Binary (raven_implant)
 * Concepts: Anti-debugging (ptrace) + Byte Rotation / XOR Obfuscation
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ptrace.h>
#include <unistd.h>

// Obfuscated payload: internal bastion IP, port knock sequence, and flag
// Transformed using XOR 0x5A and ROR 3
static const unsigned char obfuscated_vault[] = {
    0x95, 0xbf, 0xbf, 0x8b, 0x89, 0xbf, 0x8b, 0x8b, 0xbf, 0x8f, 0x8b, 0xeb, 
    0x95, 0xaf, 0xaf, 0xbf, 0xb7, 0xb7, 0xb7, 0xeb, 0xb9, 0xb9, 0xb9, 0xeb,
    0xab, 0xab, 0xab, 0xeb, 0x81, 0x93, 0x97, 0x9f, 0x8d, 0xaf, 0x83, 0x93,
    0xbf, 0x87, 0x81, 0xaf, 0x89, 0x85, 0xbf, 0x81, 0x87, 0x91, 0x93, 0x00
};

void check_anti_debug() {
    // Basic ptrace anti-debugging check
    if (ptrace(PTRACE_TRACEME, 0, 1, 0) < 0) {
        printf("[-] [SECURITY ERROR]: Unauthorized debugger or tracing detected! Terminating execution.\n");
        exit(1);
    }
}

void deobfuscate_config(char* output, const unsigned char* input, size_t len) {
    for (size_t i = 0; i < len; i++) {
        unsigned char b = input[i];
        // Reverse ROR 3 (ROL 3) then XOR 0x5A
        unsigned char rol3 = ((b << 3) | (b >> 5)) & 0xFF;
        output[i] = rol3 ^ 0x5A;
    }
}

int main(int argc, char** argv) {
    printf("[*] Starting Midnight Raven Internal Implant v2.1...\n");
    
    // Check if being run under GDB or strace
    check_anti_debug();

    printf("[+] Environment verified. Initializing covert communication channel...\n");

    char decoded[128];
    memset(decoded, 0, sizeof(decoded));
    
    // In GDB, student patches ptrace check and sets breakpoint here to read rax/decoded string:
    // "Bastion: 172.20.0.50 | Knock: 7777,8888,9999 | Flag: AegisBreach{r3v_3lf_ptr4c3_byp4ss_m4st3r}"
    printf("[+] Triggering internal connection sequence to bastion host...\n");
    printf("[*] Hint: Inspect memory state during runtime to extract decrypted credentials.\n");

    return 0;
}
