// staff.js - Staff CRUD & Faculty Operations

function getAllStaff() {
  const staff = localStorage.getItem('cms_staff');
  return staff ? JSON.parse(staff) : [];
}

function getStaffById(id) {
  const staffList = getAllStaff();
  return staffList.find(s => s.id === id);
}

function addStaff(staffRecord) {
  const staffList = getAllStaff();

  if (staffList.some(s => s.id === staffRecord.id)) {
    throw new Error(`Staff ID ${staffRecord.id} already exists.`);
  }

  // Check unique username
  const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
  const username = staffRecord.username.trim().toLowerCase();
  if (users.some(u => u.username.toLowerCase() === username)) {
    throw new Error(`Username '${username}' is already in use by another user.`);
  }

  // Create portal login credentials
  users.push({
    username: username,
    password: username + "123", // default password
    role: "Staff",
    linkedId: staffRecord.id
  });
  localStorage.setItem('cms_users', JSON.stringify(users));

  // Add staff record
  staffList.push(staffRecord);
  localStorage.setItem('cms_staff', JSON.stringify(staffList));

  // Log activity
  if (typeof logActivity === 'function') {
    logActivity('STAFF ADDED', `Faculty ${staffRecord.name} (${staffRecord.id}) added to ${staffRecord.department} department.`, 'success');
  }
}

function updateStaff(id, updatedRecord) {
  const staffList = getAllStaff();
  const idx = staffList.findIndex(s => s.id === id);
  if (idx === -1) {
    throw new Error("Staff member not found.");
  }

  const oldUsername = staffList[idx].username;
  const newUsername = updatedRecord.username.trim().toLowerCase();

  // If username changed, check unique and update credentials
  if (oldUsername.toLowerCase() !== newUsername.toLowerCase()) {
    const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
    if (users.some(u => u.username.toLowerCase() === newUsername && u.linkedId !== id)) {
      throw new Error(`Username '${newUsername}' is already in use.`);
    }

    // Update username in users list
    const userIdx = users.findIndex(u => u.linkedId === id);
    if (userIdx !== -1) {
      users[userIdx].username = newUsername;
      localStorage.setItem('cms_users', JSON.stringify(users));
    }
  }

  // Preserve bio if edit form doesn't provide it
  if (!updatedRecord.bio && staffList[idx].bio) {
    updatedRecord.bio = staffList[idx].bio;
  }

  updatedRecord.id = id;
  staffList[idx] = updatedRecord;
  localStorage.setItem('cms_staff', JSON.stringify(staffList));

  // Log activity
  if (typeof logActivity === 'function') {
    logActivity('STAFF UPDATED', `Faculty ${updatedRecord.name} (${id}) profile details updated.`, 'info');
  }
}

function deleteStaff(id) {
  const staffList = getAllStaff();
  const member = staffList.find(s => s.id === id);
  const filtered = staffList.filter(s => s.id !== id);

  if (staffList.length === filtered.length) {
    throw new Error("Staff member not found.");
  }

  localStorage.setItem('cms_staff', JSON.stringify(filtered));

  // Clean login in cms_users
  const users = JSON.parse(localStorage.getItem('cms_users') || '[]');
  const filteredUsers = users.filter(u => u.linkedId !== id);
  localStorage.setItem('cms_users', JSON.stringify(filteredUsers));

  // Log activity
  if (member && typeof logActivity === 'function') {
    logActivity('STAFF REMOVED', `Faculty ${member.name} (${id}) was deleted from the portal.`, 'danger');
  }
}
