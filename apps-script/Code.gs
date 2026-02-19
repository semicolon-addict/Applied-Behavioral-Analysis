///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Google Apps Script web app for RBAC authentication
// Outcome: Register, Login, GetUser, ListUsers endpoints backed by Google Sheet
// Short Description: Apps Script auth backend with password hashing, role-based access, and session tokens
/////////////////////////////////////////////////////////////

/**
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Rename the first sheet tab to "Users"
 * 3. Add headers in Row 1: Email | PasswordHash | Role | FirstName | LastName | Status | CreatedAt | LastLogin | SessionToken
 * 4. Open Extensions > Apps Script
 * 5. Paste this code into Code.gs
 * 6. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the web app URL and use it in your frontend
 */

// ========== CONFIGURATION ==========
var SHEET_NAME = "Users";
var VALID_ROLES = ["Parent", "Clinician", "Super Admin"];

// ========== MAIN ENTRY POINTS ==========

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "ABA Auth API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests — routes to appropriate action
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    var result;
    switch (action) {
      case "register":
        result = handleRegister(data);
        break;
      case "login":
        result = handleLogin(data);
        break;
      case "getUser":
        result = handleGetUser(data);
        break;
      case "listUsers":
        result = handleListUsers(data);
        break;
      case "updateRole":
        result = handleUpdateRole(data);
        break;
      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== HANDLERS ==========

/**
 * Register a new user
 * Required fields: email, password, role, firstName, lastName
 */
function handleRegister(data) {
  // Validate required fields
  if (!data.email || !data.password || !data.role || !data.firstName || !data.lastName) {
    return { success: false, error: "Missing required fields: email, password, role, firstName, lastName" };
  }

  var email = data.email.trim().toLowerCase();
  var password = data.password;
  var role = data.role;
  var firstName = data.firstName.trim();
  var lastName = data.lastName.trim();

  // Validate email format
  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email format" };
  }

  // Validate role
  if (VALID_ROLES.indexOf(role) === -1) {
    return { success: false, error: "Invalid role. Must be one of: " + VALID_ROLES.join(", ") };
  }

  // Validate password strength
  var passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.message };
  }

  var sheet = getSheet();

  // Check email uniqueness
  if (findUserRowByEmail(sheet, email) !== -1) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Hash password
  var passwordHash = hashPassword(password);

  // Create timestamp
  var now = new Date().toISOString();

  // Append new user row
  sheet.appendRow([email, passwordHash, role, firstName, lastName, "Active", now, "", ""]);

  return {
    success: true,
    message: "Registration successful",
    user: {
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName,
      status: "Active"
    }
  };
}

/**
 * Login an existing user
 * Required fields: email, password
 */
function handleLogin(data) {
  if (!data.email || !data.password) {
    return { success: false, error: "Missing required fields: email, password" };
  }

  var email = data.email.trim().toLowerCase();
  var password = data.password;

  var sheet = getSheet();
  var rowIndex = findUserRowByEmail(sheet, email);

  if (rowIndex === -1) {
    return { success: false, error: "Invalid email or password" };
  }

  var rowData = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
  var storedHash = rowData[1];
  var role = rowData[2];
  var firstName = rowData[3];
  var lastName = rowData[4];
  var status = rowData[5];

  // Check account status
  if (status !== "Active") {
    return { success: false, error: "Account is " + status + ". Please contact an administrator." };
  }

  // Verify password
  var inputHash = hashPassword(password);
  if (inputHash !== storedHash) {
    return { success: false, error: "Invalid email or password" };
  }

  // Generate session token
  var sessionToken = generateSessionToken(email);

  // Update last login and session token
  var now = new Date().toISOString();
  sheet.getRange(rowIndex, 8).setValue(now);       // LastLogin column
  sheet.getRange(rowIndex, 9).setValue(sessionToken); // SessionToken column

  return {
    success: true,
    message: "Login successful",
    user: {
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName,
      status: status,
      sessionToken: sessionToken
    }
  };
}

/**
 * Get user by session token or email
 * Required fields: sessionToken OR email
 */
function handleGetUser(data) {
  var sheet = getSheet();

  if (data.sessionToken) {
    var allData = sheet.getDataRange().getValues();
    for (var i = 1; i < allData.length; i++) {
      if (allData[i][8] === data.sessionToken) {
        return {
          success: true,
          user: {
            email: allData[i][0],
            role: allData[i][2],
            firstName: allData[i][3],
            lastName: allData[i][4],
            status: allData[i][5],
            createdAt: allData[i][6],
            lastLogin: allData[i][7]
          }
        };
      }
    }
    return { success: false, error: "Invalid or expired session" };
  }

  if (data.email) {
    var rowIndex = findUserRowByEmail(sheet, data.email.trim().toLowerCase());
    if (rowIndex === -1) {
      return { success: false, error: "User not found" };
    }
    var rowData = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
    return {
      success: true,
      user: {
        email: rowData[0],
        role: rowData[2],
        firstName: rowData[3],
        lastName: rowData[4],
        status: rowData[5],
        createdAt: rowData[6],
        lastLogin: rowData[7]
      }
    };
  }

  return { success: false, error: "Provide sessionToken or email" };
}

/**
 * List all users (Super Admin only)
 * Required fields: sessionToken
 */
function handleListUsers(data) {
  if (!data.sessionToken) {
    return { success: false, error: "Authentication required" };
  }

  var sheet = getSheet();
  var allData = sheet.getDataRange().getValues();

  // Verify the requester is a Super Admin
  var requesterRole = null;
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][8] === data.sessionToken) {
      requesterRole = allData[i][2];
      break;
    }
  }

  if (requesterRole !== "Super Admin") {
    return { success: false, error: "Unauthorized. Only Super Admin can list users." };
  }

  // Return all users (without password hashes or tokens)
  var users = [];
  for (var j = 1; j < allData.length; j++) {
    users.push({
      email: allData[j][0],
      role: allData[j][2],
      firstName: allData[j][3],
      lastName: allData[j][4],
      status: allData[j][5],
      createdAt: allData[j][6],
      lastLogin: allData[j][7]
    });
  }

  return { success: true, users: users, total: users.length };
}

/**
 * Update a user's role (Super Admin only)
 * Required fields: sessionToken, targetEmail, newRole
 */
function handleUpdateRole(data) {
  if (!data.sessionToken || !data.targetEmail || !data.newRole) {
    return { success: false, error: "Missing required fields: sessionToken, targetEmail, newRole" };
  }

  if (VALID_ROLES.indexOf(data.newRole) === -1) {
    return { success: false, error: "Invalid role. Must be one of: " + VALID_ROLES.join(", ") };
  }

  var sheet = getSheet();
  var allData = sheet.getDataRange().getValues();

  // Verify requester is Super Admin
  var requesterRole = null;
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][8] === data.sessionToken) {
      requesterRole = allData[i][2];
      break;
    }
  }

  if (requesterRole !== "Super Admin") {
    return { success: false, error: "Unauthorized. Only Super Admin can modify roles." };
  }

  // Find target user and update role
  var targetEmail = data.targetEmail.trim().toLowerCase();
  var targetRow = findUserRowByEmail(sheet, targetEmail);

  if (targetRow === -1) {
    return { success: false, error: "Target user not found" };
  }

  sheet.getRange(targetRow, 3).setValue(data.newRole); // Role column

  return { success: true, message: "Role updated to " + data.newRole + " for " + targetEmail };
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get the Users sheet
 */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Auto-create sheet with headers if it doesn't exist
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Email", "PasswordHash", "Role", "FirstName", "LastName", "Status", "CreatedAt", "LastLogin", "SessionToken"]);
    // Bold the header row
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
  }
  return sheet;
}

/**
 * Find user row index by email (returns -1 if not found)
 */
function findUserRowByEmail(sheet, email) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email) {
      return i + 1; // Sheets are 1-indexed
    }
  }
  return -1;
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  var hash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hex = byte.toString(16);
    if (hex.length === 1) hex = "0" + hex;
    hash += hex;
  }
  return hash;
}

/**
 * Generate a session token
 */
function generateSessionToken(email) {
  var timestamp = new Date().getTime().toString();
  var raw = email + timestamp + Math.random().toString(36);
  return hashPassword(raw);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special character
 */
function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  return { valid: true, message: "Password is strong" };
}
