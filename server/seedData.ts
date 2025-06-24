import { storage } from './storage';
import { type InsertUser, type InsertChallenge, type InsertEventConfig } from '@shared/schema';

// Generate 250 pre-defined user credentials
function generateUserCredentials(): InsertUser[] {
  const users: InsertUser[] = [];
  
  for (let i = 1; i <= 250; i++) {
    const teamId = `TEAM_${i.toString().padStart(3, '0')}`;
    const accessToken = `CTF{${generateRandomString(16)}_${i}}`;
    const teamName = `Team ${i}`;
    
    users.push({
      teamId,
      accessToken,
      teamName,
      email: `team${i}@ctf.local`,
      isAdmin: i === 1, // Make first team admin
      totalScore: 0,
      currentRank: 0,
    });
  }
  
  return users;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sample challenges for different categories
const sampleChallenges: InsertChallenge[] = [
  // Web Exploitation
  {
    title: "SQL Injection Basics",
    description: "Find the hidden flag in this vulnerable login form. The database contains user credentials and a secret flag.",
    category: "Web Exploitation",
    difficulty: "Easy",
    points: 100,
    flag: "CTF{sql_1nj3ct10n_b4s1cs}",
    hints: ["Try different SQL injection payloads", "Look for admin credentials"],
    isActive: true,
  },
  {
    title: "XSS Reflected",
    description: "Exploit a reflected XSS vulnerability to steal the admin's session cookie.",
    category: "Web Exploitation",
    difficulty: "Medium",
    points: 200,
    flag: "CTF{xss_r3fl3ct3d_att4ck}",
    hints: ["Check URL parameters", "Use JavaScript to extract cookies"],
    isActive: true,
  },
  {
    title: "Directory Traversal",
    description: "Navigate through the file system to find the hidden flag file.",
    category: "Web Exploitation",
    difficulty: "Easy",
    points: 150,
    flag: "CTF{d1r3ct0ry_tr4v3rs4l}",
    hints: ["Use ../ to go up directories", "Look for sensitive files"],
    isActive: true,
  },

  // Cryptography
  {
    title: "Caesar Cipher Mystery",
    description: "Decrypt this message: 'PGS{P43F4E_P1CU3E_F0OW3Q}'",
    category: "Cryptography",
    difficulty: "Easy",
    points: 75,
    flag: "CTF{C43S4R_C1PH3R_S0LV3D}",
    hints: ["Try different shift values", "The flag format is CTF{...}"],
    isActive: true,
  },
  {
    title: "Base64 Layers",
    description: "This flag has been encoded multiple times with Base64. Decode: 'UTFSem1HRnpOREZmWW1GelpURTJYM1JwYldWZmRHOWZaR1ZqYjJSbGZRPT0='",
    category: "Cryptography",
    difficulty: "Easy",
    points: 100,
    flag: "CTF{b4s3_64_m4ny_t1m3s_t0_d3c0d3}",
    hints: ["Decode multiple times", "Keep going until you see readable text"],
    isActive: true,
  },
  {
    title: "RSA Small Exponent",
    description: "Break this RSA encryption with a small public exponent.",
    category: "Cryptography",
    difficulty: "Hard",
    points: 400,
    flag: "CTF{rs4_sm4ll_3xp0n3nt_4tt4ck}",
    hints: ["Public exponent is 3", "Use cube root attack"],
    isActive: true,
  },

  // Reverse Engineering
  {
    title: "Simple Crackme",
    description: "Reverse engineer this binary to find the correct password that reveals the flag.",
    category: "Reverse Engineering",
    difficulty: "Medium",
    points: 250,
    flag: "CTF{r3v3rs3_3ng1n33r1ng}",
    hints: ["Use a disassembler like Ghidra", "Look for string comparisons"],
    isActive: true,
  },
  {
    title: "Android APK Analysis",
    description: "Extract the flag hidden in this Android application.",
    category: "Reverse Engineering",
    difficulty: "Medium",
    points: 300,
    flag: "CTF{4ndr01d_4pk_4n4lys1s}",
    hints: ["Decompile the APK", "Check resources and code"],
    isActive: true,
  },

  // Forensics
  {
    title: "Hidden in Plain Sight",
    description: "Find the flag hidden in this image file using steganography techniques.",
    category: "Forensics",
    difficulty: "Easy",
    points: 125,
    flag: "CTF{st3g4n0gr4phy_h1dd3n}",
    hints: ["Use steganography tools", "Check image metadata"],
    isActive: true,
  },
  {
    title: "Memory Dump Analysis",
    description: "Analyze this memory dump to find the hidden password.",
    category: "Forensics",
    difficulty: "Hard",
    points: 450,
    flag: "CTF{m3m0ry_dump_4n4lys1s}",
    hints: ["Use Volatility framework", "Look for passwords in memory"],
    isActive: true,
  },

  // Binary Exploitation
  {
    title: "Buffer Overflow Basics",
    description: "Exploit a simple buffer overflow to control program execution.",
    category: "Binary Exploitation",
    difficulty: "Hard",
    points: 500,
    flag: "CTF{buff3r_0v3rfl0w_pwn3d}",
    hints: ["Find the buffer size", "Control EIP/RIP register"],
    isActive: true,
  },
  {
    title: "Format String Vulnerability",
    description: "Exploit a format string vulnerability to leak memory and control execution.",
    category: "Binary Exploitation",
    difficulty: "Hard",
    points: 450,
    flag: "CTF{f0rm4t_str1ng_3xpl01t}",
    hints: ["Use %x to leak memory", "Control stack values"],
    isActive: true,
  },

  // Additional 10 challenges as requested
  {
    title: "JWT Token Manipulation",
    description: "Analyze this JWT token and modify it to gain admin access. The secret is weak and can be cracked.",
    category: "Web Exploitation",
    difficulty: "Medium",
    points: 300,
    flag: "CTF{jwt_w34k_s3cr3t_crck3d}",
    hints: ["Try common secrets", "Use jwt.io to decode"],
    isActive: true,
  },
  {
    title: "ROT13 Cipher",
    description: "Decrypt this ROT13 encoded message: 'PGS{ebg13_vf_fb_rnfl}'",
    category: "Cryptography",
    difficulty: "Easy",
    points: 50,
    flag: "CTF{rot13_is_so_easy}",
    hints: ["ROT13 shifts letters by 13", "Online ROT13 decoder"],
    isActive: true,
  },
  {
    title: "SQL Injection Union",
    description: "Extract the admin password from the database using UNION-based SQL injection.",
    category: "Web Exploitation",
    difficulty: "Hard",
    points: 400,
    flag: "CTF{un10n_b4s3d_sql1_m4st3r}",
    hints: ["Use UNION SELECT", "Count the columns first"],
    isActive: true,
  },
  {
    title: "Binary Analysis",
    description: "Reverse engineer this binary file to find the hidden flag. Look for hardcoded strings.",
    category: "Reverse Engineering",
    difficulty: "Easy",
    points: 150,
    flag: "CTF{b1n4ry_str1ngs_r3v34l3d}",
    hints: ["Use strings command", "Check for printable characters"],
    isActive: true,
  },
  {
    title: "Vigenère Cipher",
    description: "Break this Vigenère cipher with key 'CYBER': 'EJO{z1omrkw_e1xlkv_jjyemkd}'",
    category: "Cryptography",
    difficulty: "Medium",
    points: 250,
    flag: "CTF{v1genere_c1pher_decoded}",
    hints: ["Key is CYBER", "Use online Vigenère decoder"],
    isActive: true,
  },
  {
    title: "Command Injection",
    description: "Exploit command injection vulnerability to read the flag file from /etc/flag.txt",
    category: "Web Exploitation",
    difficulty: "Medium",
    points: 280,
    flag: "CTF{c0mm4nd_1nj3ct10n_pwn3d}",
    hints: ["Try ; && || operators", "Read system files"],
    isActive: true,
  },
  {
    title: "Network Packet Analysis",
    description: "Analyze the PCAP file to find credentials transmitted in plaintext.",
    category: "Forensics",
    difficulty: "Medium",
    points: 200,
    flag: "CTF{p4ck3t_4n4lys1s_m4st3r}",
    hints: ["Use Wireshark", "Look for HTTP/FTP traffic"],
    isActive: true,
  },
  {
    title: "Assembly Code Review",
    description: "Review this assembly code and find the correct input that generates the flag.",
    category: "Reverse Engineering",
    difficulty: "Hard",
    points: 350,
    flag: "CTF{4ss3mbly_c0d3_4n4lys1s}",
    hints: ["Trace execution flow", "Look for comparisons"],
    isActive: true,
  },
  {
    title: "Hash Collision",
    description: "Find two different inputs that produce the same MD5 hash as 'admin123'.",
    category: "Cryptography",
    difficulty: "Hard",
    points: 450,
    flag: "CTF{h4sh_c0ll1s10n_f0und}",
    hints: ["MD5 is vulnerable", "Use rainbow tables"],
    isActive: true,
  },
  {
    title: "Race Condition Exploit",
    description: "Exploit the race condition in the banking application to withdraw more money than available.",
    category: "Binary Exploitation",
    difficulty: "Hard",
    points: 400,
    flag: "CTF{r4c3_c0nd1t10n_3xpl01t3d}",
    hints: ["Multiple simultaneous requests", "Time window exploitation"],
    isActive: true,
  },
];

const eventConfig: InsertEventConfig = {
  eventName: "CyberArena CTF 2024",
  startTime: new Date(),
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  isActive: true,
  maxParticipants: 250,
  settings: {
    allowTeamRegistration: false,
    showRealTimeLeaderboard: true,
    maxSubmissionsPerChallenge: 10,
  },
};

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    // Seed users
    console.log('Creating 250 user credentials...');
    const users = generateUserCredentials();
    for (const user of users) {
      await storage.createUser(user);
    }

    // Seed challenges
    console.log('Creating sample challenges...');
    for (const challenge of sampleChallenges) {
      await storage.createChallenge(challenge);
    }

    // Seed event configuration
    console.log('Setting up event configuration...');
    await storage.updateEventConfig(eventConfig);

    console.log('Database seeding completed successfully!');
    console.log(`Created ${users.length} user accounts`);
    console.log(`Created ${sampleChallenges.length} challenges`);
    console.log('Admin account: TEAM_001 with admin privileges');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
