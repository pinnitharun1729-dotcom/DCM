import { StudentProfile } from '../types';
import { hashPassword } from '../utils/crypto';

export interface RawStudentRecord {
  rollNumber: string;
  name: string;
  gender: 'M' | 'F';
  branchCode: 'AIML' | 'CSE' | 'ECE' | 'EEE' | 'CE' | 'ME' | 'MME' | 'CHEMICAL';
  branchName: string;
  batch: string;
  admissionYear: number;
}

export const RAW_RGUKT_STUDENTS: RawStudentRecord[] = [
  // --- AIML (10 students) ---
  { rollNumber: 'O240635', name: 'Kondakrindi Navyakala', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240685', name: 'Tirumanyam Aishwarya', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O241267', name: 'Kelavath Gayathri', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240006', name: 'Devanakonda Thriveni', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240019', name: 'Yacham Joshna Devi', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240021', name: 'Kurakula Manjula', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240027', name: 'Polu Gowthami', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240030', name: 'Mali Zeba Fathima', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240041', name: 'Belupalli Munaswamy Harika', gender: 'F', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240018', name: 'Yeddula Sushanth Reddy', gender: 'M', branchCode: 'AIML', branchName: 'Artificial Intelligence & Machine Learning (AIML)', batch: '2024-2028', admissionYear: 2024 },

  // --- CSE (10 students) ---
  { rollNumber: 'R240086', name: 'Vikrant', gender: 'M', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240212', name: 'Tharun Pinninti', gender: 'M', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240243', name: 'Abhi', gender: 'M', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240016', name: 'Gaddam Gowthami', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240020', name: 'Bodagala Divya Sree', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240057', name: 'Kalisetty Akhila', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240072', name: 'S Jyothi', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240078', name: 'Veduru Lakshmipriya', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240110', name: 'Chakali Swaroopa', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240124', name: 'Bandaru Dikshitha', gender: 'F', branchCode: 'CSE', branchName: 'Computer Science & Engineering (CSE)', batch: '2024-2028', admissionYear: 2024 },

  // --- ECE (11 students) ---
  { rollNumber: 'R240359', name: 'Jai Sai Nagendra', gender: 'M', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240356', name: 'Thodime Bhavitha', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240457', name: 'Vannam Mahitha', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240588', name: 'Reddy Vandla Bhavana', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240667', name: 'Sirivella Chowsenbee', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240683', name: 'Pothu Thanvi', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240698', name: 'V Geethika Sai', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240706', name: 'Bhimanapalli Anusha', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240731', name: 'Nandanuru Karthik', gender: 'M', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240801', name: 'Mailarappa Gari Vidya Sri', gender: 'F', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240001', name: 'Mallagundla Mahesh Babu', gender: 'M', branchCode: 'ECE', branchName: 'Electronics & Communication Engineering (ECE)', batch: '2024-2028', admissionYear: 2024 },

  // --- EEE Section A (10 students) ---
  { rollNumber: 'R240639', name: 'Panjagalla Varshitha', gender: 'F', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240094', name: 'Addakula Soori', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240587', name: 'Telugu Nakhula Vamshi Krishna', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240044', name: 'Pedditi Jaswanth', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240705', name: 'Peetla Satish', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240752', name: 'Sane Dharani Lakshmi', gender: 'F', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240686', name: 'Karani Dhanush Kumar', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240272', name: 'Manchinella Jayasree', gender: 'F', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240206', name: 'Shaik Afifa', gender: 'F', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240831', name: 'Proddatur Moula', gender: 'M', branchCode: 'EEE', branchName: 'Electrical & Electronics Engineering (EEE)', batch: '2024-2028', admissionYear: 2024 },

  // --- CE - Civil Engineering (10 students) ---
  { rollNumber: 'O240214', name: 'Godugu Ashalatha', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R230147', name: 'Llakatupu Lakshmi Chandrakal', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2023-2027', admissionYear: 2023 },
  { rollNumber: 'R230600', name: 'Gunda Anjali Devi', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2023-2027', admissionYear: 2023 },
  { rollNumber: 'R230824', name: 'Chapala Manasa', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2023-2027', admissionYear: 2023 },
  { rollNumber: 'R230849', name: 'Palakolanu Vaishnavi', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2023-2027', admissionYear: 2023 },
  { rollNumber: 'R230898', name: 'Talaricheruvu Eekshitha', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2023-2027', admissionYear: 2023 },
  { rollNumber: 'R240080', name: 'Kalichappidi Hyma', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240116', name: 'Pakala Nandini', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240138', name: 'Gowdapuri Kavya Sree', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240159', name: 'Panem Jessitha', gender: 'F', branchCode: 'CE', branchName: 'Civil Engineering (CE)', batch: '2024-2028', admissionYear: 2024 },

  // --- ME - Mechanical Engineering (10 students) ---
  { rollNumber: 'R240098', name: 'Kola Chakradhar', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240188', name: 'Pula Somasekhar', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240275', name: 'Varthe Thareesh Naik', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240349', name: 'Edagottu Jaswanth', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240429', name: 'Vankam Venkateswarlu', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240459', name: 'Avula Aishwarya', gender: 'F', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240463', name: 'Golla Manindhar Yadav', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240478', name: 'Gorla Bhuvaneswar Reddy', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240500', name: 'Modduru Chethan Sai Kumar Reddy', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'R240663', name: 'Marapreddygari Abhishek Reddy', gender: 'M', branchCode: 'ME', branchName: 'Mechanical Engineering (ME)', batch: '2024-2028', admissionYear: 2024 },

  // --- MME - Metallurgical & Materials Engineering (10 students) ---
  { rollNumber: 'O240895', name: 'Shaik Ismath', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240013', name: 'Ramisetty Sireesha', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240346', name: 'Danne Madhu', gender: 'M', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240910', name: 'Rudrapati Asritha', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O241057', name: 'Bandarapu Krishna Vamshi', gender: 'M', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240035', name: 'Gariganti Usha Sri', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'S240549', name: 'Sayed Vasim Basha', gender: 'M', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240062', name: 'Galam Brahmani', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'S240092', name: 'Peram Sudhakar', gender: 'M', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240011', name: 'Pala Akonda Mounika', gender: 'F', branchCode: 'MME', branchName: 'Metallurgical & Materials Engineering (MME)', batch: '2024-2028', admissionYear: 2024 },

  // --- CHEMICAL Engineering (10 students) ---
  { rollNumber: 'O241031', name: 'B. Avinash', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240943', name: 'P. Siddbaiah', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'S240797', name: 'M. Krishna Nayak', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240265', name: 'H. S. Dawood', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240385', name: 'T. Vishal', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'S240764', name: 'Sk. M. Akhil', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'S241324', name: 'A. Sarath', gender: 'M', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240295', name: 'M. Pavani', gender: 'F', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240170', name: 'V. Suhasini', gender: 'F', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
  { rollNumber: 'O240251', name: 'K. Satwika', gender: 'F', branchCode: 'CHEMICAL', branchName: 'Chemical Engineering (CHEM)', batch: '2024-2028', admissionYear: 2024 },
];

/**
 * Transforms raw records into full StudentProfile records with official emails,
 * hashed roll-number passwords, and avatar endpoints.
 */
export function buildStudentProfiles(rawList: RawStudentRecord[] = RAW_RGUKT_STUDENTS): StudentProfile[] {
  return rawList.map((raw, idx) => {
    const rollLower = raw.rollNumber.toLowerCase().trim();
    const rollUpper = raw.rollNumber.toUpperCase().trim();
    // Official RGUKT email pattern: [rollnumber]@rguktrkv.ac.in
    const email = `${rollLower}@rguktrkv.ac.in`;
    
    // Auto-derive password from roll number portion only (hash stored)
    const passwordHash = hashPassword(rollLower);

    // Realistic phone number generator
    const phoneSuffix = (10000 + (idx * 379) % 90000).toString();
    const phone = `+91 98480 ${phoneSuffix}`;

    const isFemale = raw.gender === 'F';
    const avatarSeed = `${rollLower}-${raw.gender}`;
    const photoUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=e2e8f0`;

    return {
      id: rollLower,
      rollNumber: rollUpper,
      name: raw.name,
      email,
      branch: raw.branchName,
      branchCode: raw.branchCode,
      batch: raw.batch,
      studentType: 'engineering' as const,
      gender: raw.gender,
      photoUrl,
      phone,
      admissionYear: raw.admissionYear,
      passwordHash,
      hasChangedPassword: false, // Default is roll number, prompts user to change on first login
    };
  });
}

// Pre-compiled full real 81 student dataset
export const FULL_REAL_STUDENTS: StudentProfile[] = buildStudentProfiles();
