// ── TEACHER DASHBOARD ──
let currentUser = null;
let allPayments = [];
let allClasses = [];
let allStudents = [];

// ── INITIALIZATION ──
async function init() {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      window.location.href = 'login.html';
      return;
    }

    currentUser = JSON.parse(userStr);
    updateUserBadge();

    // Load all data
    await Promise.all([
      loadAllPayments(),
      loadAllClasses(),
      loadAllStudents()
    ]);

    // Update stats
    updateStatistics();
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Error loading dashboard', 'error');
  }
}

// ── UPDATE USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById('userBadge');
  if (currentUser) {
    badge.textContent = `${currentUser.username.toUpperCase()} · TEACHER`;
  }
}

// ── LOAD ALL PAYMENTS ──
async function loadAllPayments() {
  try {
    const { data: payments, error } = await supabaseClient
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allPayments = payments || [];

    // Load student payment details for each payment
    for (let payment of allPayments) {
      const { data: studentPayments } = await supabaseClient
        .from('student_payments')
        .select('*')
        .eq('payment_id', payment.id);

      payment.studentPayments = studentPayments || [];
    }

    renderPayments();
  } catch (error) {
    console.error('Load payments error:', error);
    showToast('Failed to load payments', 'error');
  }
}

// ── LOAD ALL CLASSES ──
async function loadAllClasses() {
  try {
    const { data: users, error } = await supabaseClient
      .from('users')
      .select('class')
      .eq('role', 'leader')
      .order('class');

    if (error) throw error;

    // Get unique classes
    allClasses = [...new Set((users || []).map(u => u.class))].filter(Boolean);
  } catch (error) {
    console.error('Load classes error:', error);
  }
}

// ── LOAD ALL STUDENTS ──
async function loadAllStudents() {
  try {
    const { data: students, error } = await supabaseClient
      .from('students')
      .select('*')
      .order('class, name');

    if (error) throw error;
    allStudents = students || [];

    renderClasses();
  } catch (error) {
    console.error('Load students error:', error);
    showToast('Failed to load student data', 'error');
  }
}

// ── RENDER PAYMENTS ──
function renderPayments() {
  const container = document.getElementById('paymentsContainer');

  if (allPayments.length === 0) {
    container.innerHTML = '<div class="empty">No payments recorded yet.</div>';
    return;
  }

  container.innerHTML = allPayments.map((payment) => {
    const paid = payment.studentPayments.filter(sp => sp.status === 'paid').length;
    const unpaid = payment.studentPayments.filter(sp => sp.status === 'unpaid').length;
    const pending = payment.studentPayments.filter(sp => sp.status === 'pending').length;
    const total = payment.studentPayments.length;
    const collectionPercentage = total > 0 ? Math.round((paid / total) * 100) : 0;

    return `
      <div class="class-card">
        <div class="class-header">
          <div>
            <div class="class-name">${escapeHtml(payment.reason)}</div>
            <span style="color: var(--muted); font-size: 0.8rem;">Created: ${formatDate(payment.created_at)}</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--green);">₹${payment.amount.toLocaleString()}</div>
            <div style="font-size: 0.8rem; color: var(--accent);">${collectionPercentage}% collected</div>
          </div>
        </div>

        <div class="class-stats" style="margin-bottom: 16px;">
          <div class="class-stat">
            <span style="color: var(--green);">✓</span>
            <span><strong>${paid}</strong> Paid</span>
          </div>
          <div class="class-stat">
            <span style="color: var(--yellow);">◷</span>
            <span><strong>${pending}</strong> Pending</span>
          </div>
          <div class="class-stat">
            <span style="color: var(--red);">✗</span>
            <span><strong>${unpaid}</strong> Unpaid</span>
          </div>
          <div class="class-stat">
            Total: <strong>${total}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>UPI / Payment</th>
            </tr>
          </thead>
          <tbody>
            ${payment.studentPayments.map(sp => `
              <tr>
                <td>${escapeHtml(sp.student_name)}</td>
                <td>
                  <span class="badge badge-${getStatusColor(sp.status)}">
                    ${getStatusLabel(sp.status)}
                  </span>
                </td>
                <td>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted);">
                    ${sp.payment_date ? formatDate(sp.payment_date) : '—'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

// ── RENDER CLASSES ──
function renderClasses() {
  const container = document.getElementById('classesContainer');

  // Group students by class
  const classesByName = {};
  allStudents.forEach(student => {
    if (!classesByName[student.class]) {
      classesByName[student.class] = [];
    }
    classesByName[student.class].push(student);
  });

  if (Object.keys(classesByName).length === 0) {
    container.innerHTML = '<div class="empty">No classes or students found.</div>';
    return;
  }

  container.innerHTML = Object.entries(classesByName)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([className, students]) => `
      <div class="class-card">
        <div class="class-header">
          <div>
            <div class="class-name">Class ${escapeHtml(className)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.2rem; font-weight: 700;">${students.length}</div>
            <div style="font-size: 0.8rem; color: var(--muted);">students</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, i) => `
              <tr>
                <td style="color: var(--muted); font-family: var(--font-mono);">${i + 1}</td>
                <td>${escapeHtml(student.name)}</td>
                <td style="color: var(--muted); font-family: var(--font-mono);">${student.roll_number || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
}

// ── UPDATE STATISTICS ──
function updateStatistics() {
  // Total classes
  document.getElementById('totalClasses').textContent = new Set(allStudents.map(s => s.class)).size || 0;

  // Total students
  document.getElementById('totalStudents').textContent = allStudents.length;

  // Total payments
  document.getElementById('totalPayments').textContent = allPayments.length;

  // Collection rate
  const allStudentPayments = allPayments.flatMap(p => p.studentPayments);
  const paidCount = allStudentPayments.filter(sp => sp.status === 'paid').length;
  const collectionRate =
    allStudentPayments.length > 0
      ? Math.round((paidCount / allStudentPayments.length) * 100)
      : 0;
  document.getElementById('collectionRate').textContent = collectionRate + '%';
}

// ── SWITCH TAB ──
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');

  // Add active class to clicked button
  event.target.classList.add('active');
}

// ── HELPER FUNCTIONS ──

function getStatusLabel(status) {
  switch (status) {
    case 'paid':
      return '✓ Paid';
    case 'pending':
      return '◷ Pending';
    case 'unpaid':
      return '✗ Unpaid';
    default:
      return status;
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'unpaid':
      return 'red';
    default:
      return 'yellow';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'short',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── LOGOUT ──
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

// ── TOAST ──
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('success', 'error');
  if (type && type !== 'info') {
    toast.classList.add(type);
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── INIT ON LOAD ──
document.addEventListener('DOMContentLoaded', init);
