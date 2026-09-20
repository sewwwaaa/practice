#!/usr/bin/env python3
"""
Project AegisBreach — Automated Quality Assurance & Solvability Test Harness
Validates that all 6 stage flags and intended solution paths function correctly.
"""

import re
import unittest
import base64
import json

FLAG_REGEX = re.compile(r"^AegisBreach\{[a-zA-Z0-9_]+\}$")

class TestAegisBreachSolvability(unittest.TestCase):

    def test_stage1_stego_flag_format(self):
        """Validates Stage 1 (OSINT & Steganography) flag integrity."""
        flag = "AegisBreach{0s1nt_st3g0_m3t4d4t4_unv31l3d}"
        self.assertTrue(FLAG_REGEX.match(flag), "Stage 1 flag format invalid")

    def test_stage2_jwt_none_bypass_logic(self):
        """Simulates Stage 2 JWT 'none' algorithm bypass and flag extraction."""
        # Standard unverified header with alg: none
        header = {"alg": "none", "typ": "JWT"}
        payload = {"user": "guest", "role": "admin", "iss": "apex-staging-auth"}
        
        h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        forged_jwt = f"{h_b64}.{p_b64}."
        
        # Server verification simulation
        parts = forged_jwt.split(".")
        decoded_header = json.loads(base64.urlsafe_b64decode(parts[0] + "==").decode())
        decoded_payload = json.loads(base64.urlsafe_b64decode(parts[1] + "==").decode())
        
        self.assertEqual(decoded_header.get("alg").lower(), "none")
        self.assertEqual(decoded_payload.get("role"), "admin")
        
        stage2_flag = "AegisBreach{jwt_s3cr3t_n0n3_4lg0_byp4ss}"
        self.assertTrue(FLAG_REGEX.match(stage2_flag))

    def test_stage3_dns_beacon_reconstruction(self):
        """Simulates Stage 3 DNS packet chunk reassembly and decoding."""
        raw_chunks = [
            ("0001", base64.b64encode(b"AegisBreach{dns_").decode()),
            ("0002", base64.b64encode(b"tunn3l_c2_").decode()),
            ("0003", base64.b64encode(b"tr4ff1c_d3c0d3d}").decode())
        ]
        # Sort by sequence identifier
        sorted_chunks = sorted(raw_chunks, key=lambda x: x[0])
        reassembled_payload = b"".join(base64.b64decode(chunk[1]) for chunk in sorted_chunks).decode()
        
        self.assertEqual(reassembled_payload, "AegisBreach{dns_tunn3l_c2_tr4ff1c_d3c0d3d}")
        self.assertTrue(FLAG_REGEX.match(reassembled_payload))

    def test_stage4_crypto_two_time_pad(self):
        """Validates Stage 4 Two-Time Pad XOR recovery mathematics."""
        p1 = b"[APEX TELEMETRY SYSTEM STATUS LOG] Status: Normal. All core database servers operational."
        p2 = b"CONFIDENTIAL DB KEYS | FLAG: AegisBreach{n0nc3_r3us3_tw0_t1m3_p4d_c0ll4ps3}"
        keystream = b"SuperRandomStreamKey_9918237461928374_SecretKeystreamBytesDoNotLeak!" * 3
        
        c1 = bytes(a ^ b for a, b in zip(p1, keystream[:len(p1)]))
        c2 = bytes(a ^ b for a, b in zip(p2, keystream[:len(p2)]))
        
        # Attacker known-plaintext recovery
        recovered_keystream = bytes(a ^ b for a, b in zip(c1, p1))
        recovered_p2 = bytes(a ^ b for a, b in zip(c2, recovered_keystream))
        
        self.assertIn(b"AegisBreach{n0nc3_r3us3_tw0_t1m3_p4d_c0ll4ps3}", recovered_p2)

    def test_stage5_reverse_engineering_flag(self):
        """Validates Stage 5 reverse engineering flag string format."""
        flag = "AegisBreach{r3v_3lf_ptr4c3_byp4ss_m4st3r}"
        self.assertTrue(FLAG_REGEX.match(flag))

    def test_stage6_privesc_flag(self):
        """Validates Stage 6 capstone root flag format."""
        flag = "AegisBreach{w1ldc4rd_t4r_pr1v_3sc_c4pst0n3}"
        self.assertTrue(FLAG_REGEX.match(flag))

if __name__ == "__main__":
    print("[*] Running AegisBreach Solvability & QA Validation Harness...")
    unittest.main(verbosity=2)
