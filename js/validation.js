// validation.js - Form Validation Helpers

const Validation = {
  // Regex patterns
  emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phonePattern: /^[0-9]{10}$/,
  studentIdPattern: /^STU\d{3,6}$/i, // STU followed by 3 to 6 digits
  staffIdPattern: /^STF\d{3,6}$/i,   // STF followed by 3 to 6 digits
  rollNumberPattern: /^\d{2}[A-Z]{2}\d{2,3}$/i, // e.g. 23CS01

  // Display validation states
  setInvalid: function (element, message) {
    if (!element) return;
    element.classList.remove('is-valid');
    element.classList.add('is-invalid');
    
    // Find or create feedback element
    let feedback = element.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      element.parentNode.insertBefore(feedback, element.nextSibling);
    }
    feedback.textContent = message;
  },

  setValid: function (element) {
    if (!element) return;
    element.classList.remove('is-invalid');
    element.classList.add('is-valid');
    
    // Clear feedback if exists
    let feedback = element.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = '';
    }
  },

  clearState: function (element) {
    if (!element) return;
    element.classList.remove('is-invalid');
    element.classList.remove('is-valid');
    let feedback = element.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.textContent = '';
    }
  },

  // Field validation logic
  validateRequired: function (element, fieldName = "Field") {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, `${fieldName} is required.`);
      return false;
    }
    this.setValid(element);
    return true;
  },

  validateEmail: function (element) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "Email address is required.");
      return false;
    }
    if (!this.emailPattern.test(element.value.trim())) {
      this.setInvalid(element, "Please enter a valid email address.");
      return false;
    }
    this.setValid(element);
    return true;
  },

  validatePhone: function (element, fieldName = "Phone number") {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, `${fieldName} is required.`);
      return false;
    }
    const val = element.value.trim();
    if (!this.phonePattern.test(val)) {
      this.setInvalid(element, `${fieldName} must be exactly 10 numeric digits.`);
      return false;
    }
    this.setValid(element);
    return true;
  },

  validateCGPA: function (element) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "CGPA is required.");
      return false;
    }
    const val = parseFloat(element.value);
    if (isNaN(val) || val < 0.0 || val > 10.0) {
      this.setInvalid(element, "CGPA must be a number between 0.00 and 10.00.");
      return false;
    }
    this.setValid(element);
    return true;
  },

  validateMark: function (element, subjectName = "Subject") {
    if (element.value === undefined || element.value === "") {
      this.setInvalid(element, `${subjectName} mark is required.`);
      return false;
    }
    const val = parseInt(element.value);
    if (isNaN(val) || val < 0 || val > 100) {
      this.setInvalid(element, `${subjectName} mark must be an integer between 0 and 100.`);
      return false;
    }
    this.setValid(element);
    return true;
  },

  validateStudentIdUnique: function (element, originalId = null) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "Student ID is required.");
      return false;
    }
    
    const idVal = element.value.trim().toUpperCase();
    
    // Check format
    if (!this.studentIdPattern.test(idVal)) {
      this.setInvalid(element, "Format must be STU followed by 3 to 6 digits (e.g. STU001).");
      return false;
    }

    if (originalId && idVal === originalId.toUpperCase()) {
      this.setValid(element);
      return true;
    }

    const students = JSON.parse(localStorage.getItem('cms_students') || '[]');
    if (students.some(s => s.id.toUpperCase() === idVal)) {
      this.setInvalid(element, `Student ID ${idVal} is already in use.`);
      return false;
    }

    this.setValid(element);
    return true;
  },

  validateStaffIdUnique: function (element, originalId = null) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "Staff ID is required.");
      return false;
    }

    const idVal = element.value.trim().toUpperCase();

    // Check format
    if (!this.staffIdPattern.test(idVal)) {
      this.setInvalid(element, "Format must be STF followed by 3 to 6 digits (e.g. STF001).");
      return false;
    }

    if (originalId && idVal === originalId.toUpperCase()) {
      this.setValid(element);
      return true;
    }

    const staffList = JSON.parse(localStorage.getItem('cms_staff') || '[]');
    if (staffList.some(s => s.id.toUpperCase() === idVal)) {
      this.setInvalid(element, `Staff ID ${idVal} is already in use.`);
      return false;
    }

    this.setValid(element);
    return true;
  },

  validateRollNumberUnique: function (element, originalRoll = null) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "Roll Number is required.");
      return false;
    }

    const rollVal = element.value.trim().toUpperCase();
    
    // Check format
    if (!this.rollNumberPattern.test(rollVal)) {
      this.setInvalid(element, "Format should be YYDeptNo, e.g. 23CS01.");
      return false;
    }

    if (originalRoll && rollVal === originalRoll.toUpperCase()) {
      this.setValid(element);
      return true;
    }

    const students = JSON.parse(localStorage.getItem('cms_students') || '[]');
    if (students.some(s => s.rollNumber.toUpperCase() === rollVal)) {
      this.setInvalid(element, `Roll Number ${rollVal} is already in use.`);
      return false;
    }

    this.setValid(element);
    return true;
  },

  validateUsernameUnique: function (element, originalUsername = null) {
    if (!element.value || element.value.trim() === "") {
      this.setInvalid(element, "Username is required.");
      return false;
    }

    const usernameVal = element.value.trim().toLowerCase();

    if (originalUsername && usernameVal === originalUsername.toLowerCase()) {
      this.setValid(element);
      return true;
    }

    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    if (users.some(u => u.username.toLowerCase() === usernameVal)) {
      this.setInvalid(element, `Username '${usernameVal}' is already in use.`);
      return false;
    }

    this.setValid(element);
    return true;
  }
};
