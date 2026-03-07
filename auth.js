<<<<<<< HEAD
// ── AUTHENTICATION MODULE ──
// Handles user login and session management

async function handleLogin() {
  const role = document.getElementById('role').value.toLowerCase();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');
  const loginBtn = document.getElementById('loginBtn');

  // Validation
  if (!username || !password) {
    showAuthError('Please fill in all fields');
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Logging in…';
    errorMsg.style.display = 'none';

    // Query user from Supabase
 const { data, error } = await supabaseClient
  .from('users')
  .select('*') //('id, username, password_hash, role, full_name, class')
  .eq('username', username)
  .eq('role', role);
  console.log(data);

const users = data && data.length > 0 ? data[0] : null;

if (!users) {
  showAuthError('User not found');
  return;
}

    if (error) {
      showAuthError('Database error. Please try again.');
      return;
    }

    // For demo purposes: verify password (in production, use proper hashing)
    // Simple check: password should match password_hash
    if (!verifyPassword(password, users.password_hash)) {
      showAuthError('Invalid credentials');
      return;
    }

    // Store user session in localStorage
    const userSession = {
      id: users.id,
      username: users.username,
      role: users.role,
      full_name: users.full_name,
      class: users.class,
      login_time: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(userSession));
    showAuthToast('✓ Login successful!');

    // Redirect to appropriate dashboard
    setTimeout(() => {
      switch (role) {
        case 'student':
          window.location.href = 'student.html';
          break;
        case 'leader':
          window.location.href = 'leader.html';
          break;
        case 'teacher':
          window.location.href = 'teacher.html';
          break;
      }
    }, 500);
  } catch (error) {
    console.error('Login error:', error);
    showAuthError('Login failed. Please try again.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
}

// ── VERIFY PASSWORD (Demo - in production use bcrypt or similar) ──
function verifyPassword(inputPassword, storedHash) {
  // For now, simple comparison
  // In production: use bcrypt.compare(inputPassword, storedHash)
  return inputPassword === storedHash;
}

// ── SHOW AUTH ERROR ──
function showAuthError(msg) {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '⚠️ ' + msg;
  errorMsg.style.display = 'block';
}

// ── SHOW AUTH TOAST ──
function showAuthToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => (toast.style.display = 'none'), 2000);
}

// ── CHECK IF ALREADY LOGGED IN ──
function checkExistingSession() {
  const userStr = localStorage.getItem('currentUser');

  if (!userStr) return;

  try {
    const user = JSON.parse(userStr);

    if (user.role === "student") {
      window.location.href = "student.html";
    } 
    else if (user.role === "leader") {
      window.location.href = "leader.html";
    } 
    else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }

  } catch (e) {
    console.error("Session error:", e);
    localStorage.removeItem("currentUser");
  }
}

// Check on page load
document.addEventListener('DOMContentLoaded', checkExistingSession);

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
  const password = document.getElementById('password');
  if (password) {
    password.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
});
=======
// ── AUTHENTICATION MODULE ──
// Handles user login and session management

async function handleLogin() {
  const role = document.getElementById('role').value.toLowerCase();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');
  const loginBtn = document.getElementById('loginBtn');

  // Validation
  if (!username || !password) {
    showAuthError('Please fill in all fields');
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Logging in…';
    errorMsg.style.display = 'none';

    // Query user from Supabase
 const { data, error } = await supabaseClient
  .from('users')
  .select('*') //('id, username, password_hash, role, full_name, class')
  .eq('username', username)
  .eq('role', role);
  console.log(data);

const users = data && data.length > 0 ? data[0] : null;

if (!users) {
  showAuthError('User not found');
  return;
}

    if (error) {
      showAuthError('Database error. Please try again.');
      return;
    }

    // For demo purposes: verify password (in production, use proper hashing)
    // Simple check: password should match password_hash
    if (!verifyPassword(password, users.password_hash)) {
      showAuthError('Invalid credentials');
      return;
    }

    // Store user session in localStorage
    const userSession = {
      id: users.id,
      username: users.username,
      role: users.role,
      full_name: users.full_name,
      class: users.class,
      login_time: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(userSession));
    showAuthToast('✓ Login successful!');

    // Redirect to appropriate dashboard
    setTimeout(() => {
      switch (role) {
        case 'student':
          window.location.href = 'student.html';
          break;
        case 'leader':
          window.location.href = 'leader.html';
          break;
        case 'teacher':
          window.location.href = 'teacher.html';
          break;
      }
    }, 500);
  } catch (error) {
    console.error('Login error:', error);
    showAuthError('Login failed. Please try again.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
}

// ── VERIFY PASSWORD (Demo - in production use bcrypt or similar) ──
function verifyPassword(inputPassword, storedHash) {
  // For now, simple comparison
  // In production: use bcrypt.compare(inputPassword, storedHash)
  return inputPassword === storedHash;
}

// ── SHOW AUTH ERROR ──
function showAuthError(msg) {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '⚠️ ' + msg;
  errorMsg.style.display = 'block';
}

// ── SHOW AUTH TOAST ──
function showAuthToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => (toast.style.display = 'none'), 2000);
}

// ── CHECK IF ALREADY LOGGED IN ──
function checkExistingSession() {
  const userStr = localStorage.getItem('currentUser');

  if (!userStr) return;

  try {
    const user = JSON.parse(userStr);

    if (user.role === "student") {
      window.location.href = "student.html";
    } 
    else if (user.role === "leader") {
      window.location.href = "leader.html";
    } 
    else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }

  } catch (e) {
    console.error("Session error:", e);
    localStorage.removeItem("currentUser");
  }
}

// Check on page load
document.addEventListener('DOMContentLoaded', checkExistingSession);

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
  const password = document.getElementById('password');
  if (password) {
    password.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
});
>>>>>>> 0c8568dca3fa4766446fd6e9f46f665c9dff2b75
