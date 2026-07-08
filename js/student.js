// student.js - Student CRUD & Calculation Utilities

// --- Data Operations ---

function getAllStudents() {
  const students = localStorage.getItem('cms_students');
  return students ? JSON.parse(students) : [];
}

function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => s.id === id);
}

function addStudent(student) {
  const students = getAllStudents();
  
  if (students.some(s => s.id === student.id)) {
    throw new Error(`Student ID ${student.id} already exists.`);
  }
  if (students.some(s => s.rollNumber === student.rollNumber)) {
    throw new Error(`Roll Number ${student.rollNumber} already exists.`);
  }

  // Create default credentials for the new student in cms_users
  const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
  const username = student.name.split(' ')[0].toLowerCase() + student.id.substring(3);
  if (!users.some(u => u.username === username)) {
    users.push({
      username: username,
      password: username + "123", // e.g. aarav001 / aarav001123
      role: "Student",
      linkedId: student.id
    });
    localStorage.setItem('cms_users', JSON.stringify(users));
  }

  const marks = getMarksData();
  marks[student.id] = { mathematics: 0, programming: 0, database: 0, operatingSystems: 0, computerNetworks: 0 };
  saveMarksData(marks);

  const attendance = getAttendanceData();
  attendance[student.id] = {};
  saveAttendanceData(attendance);

  student.attendancePercent = 0;
  students.push(student);
  saveStudentsList(students);

  // Log activity
  if (typeof logActivity === 'function') {
    logActivity('STUDENT ADDED', `${student.name} (${student.id}) enrolled in ${student.department}.`, 'success');
  }
}

function updateStudent(id, updatedStudent) {
  const students = getAllStudents();
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) {
    throw new Error("Student not found.");
  }

  if (students.some((s, i) => i !== idx && s.rollNumber === updatedStudent.rollNumber)) {
    throw new Error(`Roll Number ${updatedStudent.rollNumber} is already in use by another student.`);
  }

  updatedStudent.id = id;
  updatedStudent.attendancePercent = students[idx].attendancePercent;
  
  // Preserve bio if edit-form doesn't supply it
  if (!updatedStudent.bio && students[idx].bio) {
    updatedStudent.bio = students[idx].bio;
  }

  students[idx] = updatedStudent;
  saveStudentsList(students);

  // Log activity
  if (typeof logActivity === 'function') {
    logActivity('PROFILE UPDATED', `${updatedStudent.name} (${id}) profile was modified.`, 'info');
  }
}

function deleteStudent(id) {
  const students = getAllStudents();
  const student = students.find(s => s.id === id);
  const filtered = students.filter(s => s.id !== id);
  if (students.length === filtered.length) {
    throw new Error("Student not found.");
  }
  saveStudentsList(filtered);

  // Clean marks
  const marks = getMarksData();
  delete marks[id];
  saveMarksData(marks);

  // Clean attendance
  const attendance = getAttendanceData();
  delete attendance[id];
  saveAttendanceData(attendance);

  // Clean associated portal credentials in cms_users
  const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
  const filteredUsers = users.filter(u => u.linkedId !== id);
  localStorage.setItem('cms_users', JSON.stringify(filteredUsers));

  // Log activity
  if (student && typeof logActivity === 'function') {
    logActivity('STUDENT REMOVED', `${student.name} (${id}) was deleted from the records.`, 'danger');
  }
}

function deleteMultipleStudents(ids) {
  if (!ids || ids.length === 0) return 0;
  let deletedCount = 0;
  ids.forEach(id => {
    try {
      deleteStudent(id);
      deletedCount++;
    } catch(e) {
      console.warn(`Could not delete ${id}:`, e.message);
    }
  });
  return deletedCount;
}

function saveStudentsList(students) {
  localStorage.setItem('cms_students', JSON.stringify(students));
}

// --- Attendance Fetch & Calculate ---

function getAttendanceData() {
  const attendance = localStorage.getItem('cms_attendance');
  return attendance ? JSON.parse(attendance) : {};
}

function saveAttendanceData(attendance) {
  localStorage.setItem('cms_attendance', JSON.stringify(attendance));
}

function calculateAttendancePercent(studentId) {
  const attendance = getAttendanceData();
  const record = attendance[studentId];
  if (!record || Object.keys(record).length === 0) return 0;

  const dates = Object.keys(record);
  let present = 0;
  dates.forEach(d => {
    if (record[d] === 'Present') present++;
  });

  return parseFloat(((present / dates.length) * 100).toFixed(2));
}

function updateAllStudentsAttendancePercentage() {
  const students = getAllStudents();
  const updated = students.map(s => {
    s.attendancePercent = calculateAttendancePercent(s.id);
    return s;
  });
  saveStudentsList(updated);
}

// --- Marks Fetch & Calculate ---

function getMarksData() {
  const marks = localStorage.getItem('cms_marks');
  return marks ? JSON.parse(marks) : {};
}

function saveMarksData(marks) {
  localStorage.setItem('cms_marks', JSON.stringify(marks));
}

function calculateMarksSummary(studentId) {
  const marks = getMarksData();
  const studentMarks = marks[studentId] || { mathematics: 0, programming: 0, database: 0, operatingSystems: 0, computerNetworks: 0 };
  
  const subjects = ['mathematics', 'programming', 'database', 'operatingSystems', 'computerNetworks'];
  let total = 0;
  
  subjects.forEach(sub => {
    total += parseInt(studentMarks[sub] || 0);
  });

  const average = total / subjects.length;
  const percentage = average;
  const grade = getGradeFromPercentage(percentage);

  return {
    marks: studentMarks,
    total,
    average: parseFloat(average.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2)),
    grade
  };
}

function getGradeFromPercentage(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function recalculateCGPA(studentId) {
  const summary = calculateMarksSummary(studentId);
  const cgpa = parseFloat((summary.percentage / 10).toFixed(2));
  
  const students = getAllStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx !== -1) {
    students[idx].cgpa = cgpa;
    saveStudentsList(students);
  }

  // Log activity
  if (typeof logActivity === 'function') {
    const student = students[idx];
    if (student) {
      logActivity('MARKS SAVED', `Exam scores updated for ${student.name}. New CGPA: ${cgpa}.`, 'success');
    }
  }

  return cgpa;
}

// --- CSV Export / Import ---

function exportToCSV(studentList) {
  const students = studentList || getAllStudents();
  if (students.length === 0) {
    alert("No student records to export!");
    return;
  }

  const headers = [
    "Student ID", "Roll Number", "Name", "Gender", "DOB", "Department",
    "Year", "Semester", "Email", "Phone", "Address", "Parent Name",
    "Parent Phone", "Blood Group", "CGPA", "Attendance %"
  ];

  const csvRows = [headers.join(",")];

  students.forEach(s => {
    const row = [
      escapeCSVValue(s.id),
      escapeCSVValue(s.rollNumber),
      escapeCSVValue(s.name),
      escapeCSVValue(s.gender),
      escapeCSVValue(s.dob),
      escapeCSVValue(s.department),
      escapeCSVValue(s.year),
      escapeCSVValue(s.semester),
      escapeCSVValue(s.email),
      escapeCSVValue(s.phone),
      escapeCSVValue(s.address),
      escapeCSVValue(s.parentName),
      escapeCSVValue(s.parentPhone),
      escapeCSVValue(s.bloodGroup),
      s.cgpa,
      s.attendancePercent
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `students_list_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof logActivity === 'function') {
    logActivity('CSV EXPORTED', `${students.length} student record(s) exported to CSV file.`, 'info');
  }
}

function escapeCSVValue(val) {
  if (val === undefined || val === null) return '""';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function importFromCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length <= 1) {
    throw new Error("CSV file is empty or only contains headers.");
  }

  const students = getAllStudents();
  const marks = getMarksData();
  const attendance = getAttendanceData();
  const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
  
  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < 14) {
      skippedCount++;
      continue;
    }

    const [
      id, rollNumber, name, gender, dob, department,
      year, semester, email, phone, address, parentName,
      parentPhone, bloodGroup, cgpaStr, attendancePercentStr
    ] = values;

    if (students.some(s => s.id === id || s.rollNumber === rollNumber)) {
      skippedCount++;
      continue;
    }

    if (!id || !rollNumber || !name || !email) {
      skippedCount++;
      continue;
    }

    const newStudent = {
      id,
      rollNumber,
      name,
      gender: gender || "Male",
      dob: dob || "",
      department: department || "Computer Science",
      year: year || "1st Year",
      semester: semester || "1",
      email,
      phone: phone || "",
      address: address || "",
      parentName: parentName || "",
      parentPhone: parentPhone || "",
      bloodGroup: bloodGroup || "",
      cgpa: parseFloat(cgpaStr) || 0.00,
      attendancePercent: parseFloat(attendancePercentStr) || 0.00
    };

    students.push(newStudent);

    // Create username credentials
    const username = name.split(' ')[0].toLowerCase() + id.substring(3);
    if (!users.some(u => u.username === username)) {
      users.push({
        username: username,
        password: username + "123",
        role: "Student",
        linkedId: id
      });
    }

    if (!marks[id]) {
      marks[id] = { mathematics: 0, programming: 0, database: 0, operatingSystems: 0, computerNetworks: 0 };
    }
    if (!attendance[id]) {
      attendance[id] = {};
    }

    addedCount++;
  }

  if (addedCount > 0) {
    saveStudentsList(students);
    saveMarksData(marks);
    saveAttendanceData(attendance);
    localStorage.setItem('cms_users', JSON.stringify(users));

    if (typeof logActivity === 'function') {
      logActivity('CSV IMPORTED', `${addedCount} student record(s) imported from CSV file.`, 'success');
    }
  }

  return { addedCount, skippedCount };
}
