#!/usr/bin/env python3
"""
Project AegisBreach — Stage 4 Exploit Solver
Vulnerability: Stream Cipher / AES-CTR Nonce/Key Reuse (Two-Time Pad Attack)
Formula: C1 ^ C2 = P1 ^ P2 ==> P2 = (C1 ^ C2) ^ P1
"""

def xor_bytes(b1: bytes, b2: bytes) -> bytes:
    """Computes bitwise XOR between two byte sequences."""
    return bytes(a ^ b for a, b in zip(b1, b2))

def solve_two_time_pad(c1: bytes, c2: bytes, known_p1: bytes) -> bytes:
    """
    Recovers P2 given C1, C2, and partial or full known plaintext P1.
    """
    # Keystream = C1 ^ P1
    keystream = xor_bytes(c1, known_p1)
    # P2 = C2 ^ Keystream
    recovered_p2 = xor_bytes(c2, keystream)
    return recovered_p2

def demonstrate():
    print("[*] Stage 4: Vault of Echoes — Two-Time Pad Solver Initialized")
    
    # Simulated shared keystream (e.g. from AES-CTR with reused IV/nonce)
    simulated_keystream = b"Aegis_Super_Secret_Keystream_Key_99812_DoNotLeak!" * 2
    
    # Known plaintext template (daily automated system broadcast)
    p1_known = b"[APEX SYSTEM BROADCAST] Daily automated telemetry status: All services operational and running with normal load."
    
    # Secret target plaintext containing credentials and flag
    p2_target = b"CONFIDENTIAL: svc-deploy:ApexDeploy2026! | FLAG: AegisBreach{n0nc3_r3us3_tw0_t1m3_p4d_c0ll4ps3}"
    
    # Attacker intercepted both ciphertexts:
    c1 = xor_bytes(p1_known, simulated_keystream[:len(p1_known)])
    c2 = xor_bytes(p2_target, simulated_keystream[:len(p2_target)])
    
    print(f"[+] Intercepted Ciphertext 1 length: {len(c1)} bytes")
    print(f"[+] Intercepted Ciphertext 2 length: {len(c2)} bytes")
    print(f"[+] Utilizing Known Plaintext Template: '{p1_known[:30].decode()}...'")
    
    # Perform attack:
    recovered_p2 = solve_two_time_pad(c1, c2, p1_known)
    
    print("\n[!] Cryptanalysis Successful! Recovered Secret Plaintext:")
    print("-" * 75)
    print(recovered_p2.decode(errors="replace"))
    print("-" * 75)

if __name__ == "__main__":
    demonstrate()
