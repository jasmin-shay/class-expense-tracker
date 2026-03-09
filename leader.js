// ══════════════════════════════════════════
//   CLASSPAY — Leader Dashboard JS
// ══════════════════════════════════════════

let currentUser = null;
let allEvents = [];
let editingEventId = null;

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
    await loadStats();
    loadLeaderProfile();
    await loadEvents();
    subscribeToPayments();

  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Error loading dashboard', 'error');
  }
}

// ── LOAD LEADER PROFILE ──
function loadLeaderProfile() {
  if (!currentUser) return;

  document.getElementById('profileName').textContent = currentUser.full_name || currentUser.username;
  document.getElementById('profileReg').textContent = currentUser.username;
  document.getElementById('profileClass').textContent = currentUser.class || '—';

  const initials = (currentUser.full_name || currentUser.username)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  document.getElementById('profileAvatar').textContent = initials;
}

// ── UPDATE USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById('userBadge');
  if (currentUser) {
    badge.textContent = `${(currentUser.username || '').toUpperCase()} · LEADER`;
  }
}
async function loadStats(){

const { data, error } = await supabaseClient
.from("student_payments")
.select("*")

if(error) return

const total = data.length
const paid = data.filter(p=>p.status==="paid").length
const pending = data.filter(p=>p.status==="pending").length

document.getElementById("statEvents").textContent = total
document.getElementById("statPaid").textContent = paid
document.getElementById("statPending").textContent = pending

}
// ── LOAD EVENTS ──
async function loadEvents() {
  try {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = `
      <div class="state-msg">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <p>Loading events</p>
      </div>`;

    const { data: events, error } = await supabaseClient
      .from('payments')
      .select('id, reason, amount, due_date, created_at, created_by')
      .eq('created_by', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    allEvents = events || [];

    for (let event of allEvents) {
      event.students = await loadStudentsForEvent(event.id);
    }

    renderEvents();
    updateProfileStats();
  } catch (error) {
    console.error('Load events error:', error);
    showToast('Failed to load events', 'error');
  }
}

// ── LOAD STUDENTS FOR EVENT ──
async function loadStudentsForEvent(paymentId) {
  try {
    const { data, error } = await supabaseClient
      .from('student_payments')
      .select('id, student_name, register_num, status')
      .eq('payment_id', paymentId)
      .order('student_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

// ── UPDATE PROFILE STATS ──
function updateProfileStats() {
  let totalPaid = 0;
  let totalPending = 0;

  allEvents.forEach(event => {
    (event.students || []).forEach(s => {
      if (s.status === 'paid') totalPaid++;
      else totalPending++;
    });
  });

  document.getElementById('statEvents').textContent = allEvents.length;
  document.getElementById('statPaid').textContent = totalPaid;
  document.getElementById('statPending').textContent = totalPending;
}

// ── RENDER EVENTS ──
function renderEvents() {
  const container = document.getElementById('eventsContainer');

  if (allEvents.length === 0) {
    container.innerHTML = `
      <div class="state-msg">
        <div class="state-icon">📋</div>
        <p>No events yet — create one above</p>
      </div>`;
    return;
  }

  container.innerHTML = allEvents.map((event, index) => {
    const paid = event.students.filter(s => s.status === 'paid').length;
    const total = event.students.length;
    const unpaid = total - paid;

    // Due date display
    let dueStr = '';
    let dueClass = '';
    if (event.due_date) {
      const due = new Date(event.due_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      dueStr = `Due: ${due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      if (due < today) dueClass = 'overdue';
    }

    return `
      <div class="event-card" id="ec-${event.id}">

        <div class="event-header" onclick="toggleEvent(${event.id})">
          <div class="event-header-left">
            <div class="event-index"># ${String(index + 1).padStart(2, '0')}</div>
            <div class="event-reason">${escapeHtml(event.reason)}</div>
            <div class="event-meta-row">
              <span class="event-amount">₹${Number(event.amount).toLocaleString('en-IN')}</span>
              ${dueStr ? `<span class="event-due ${dueClass}">${dueStr}</span>` : ''}
            </div>
          </div>

          <div class="event-header-right">
            <div class="event-stats">
              <span class="stat-pill paid">✓ ${paid} paid</span>
              <span class="stat-pill unpaid">✗ ${unpaid} unpaid</span>
            </div>
            <div class="event-actions" onclick="event.stopPropagation()">
              <button class="action-btn edit" title="Edit" onclick="openEditModal(${event.id})">✎</button>
              <button class="action-btn delete" title="Delete" onclick="deleteEvent(${event.id})">✕</button>
            </div>
            <span class="event-chevron">▼</span>
          </div>
        </div>

        <div class="student-panel">
          ${event.students.length === 0
            ? `<div style="text-align:center;padding:20px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(139,0,32,0.5)">No students assigned</div>`
            : `<table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Reg. No</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${event.students.map((s, j) => `
                  <tr>
                    <td style="color:rgba(139,0,32,0.45);font-size:10px;">${j + 1}</td>
                    <td style="font-weight:600;">${escapeHtml(s.student_name)}</td>
                    <td style="font-size:11px;color:rgba(10,0,5,0.6);">${escapeHtml(s.register_num)}</td>
                    <td>
                      <span class="badge ${s.status}" onclick="cycleStatus(${event.id}, ${s.id}, '${s.status}')">
                        ${getStatusIcon(s.status)} ${capitalize(s.status)}
                      </span>
                    </td>
                    <td>
                      <button class="del-student" onclick="deleteStudentPayment(${event.id}, ${s.id})" title="Remove">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>

      </div>`;
  }).join('');
}

// ── TOGGLE EVENT OPEN/CLOSE ──
function toggleEvent(id) {
  const card = document.getElementById(`ec-${id}`);
  card.classList.toggle('open');
}

// ── CYCLE STATUS ──
async function cycleStatus(paymentId, studentPaymentId, currentStatus) {
  try {
    const statuses = ['unpaid', 'pending', 'paid'];
    const newStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    const { error } = await supabaseClient
      .from('student_payments')
      .update({ status: newStatus })
      .eq('id', studentPaymentId);

    if (error) throw error;

    showToast(`Status → ${newStatus}`, 'success');
    await loadEvents();
  } catch (error) {
    console.error('Cycle status error:', error);
    showToast('Failed to update status', 'error');
  }
}

// ── DELETE STUDENT PAYMENT ──
async function deleteStudentPayment(paymentId, studentPaymentId) {
  if (!confirm('Remove this student from the payment?')) return;

  try {
    const { error } = await supabaseClient
      .from('student_payments')
      .delete()
      .eq('id', studentPaymentId);

    if (error) throw error;
    showToast('Student removed', 'success');
    await loadEvents();
  } catch (error) {
    console.error('Delete student error:', error);
    showToast('Failed to remove student', 'error');
  }
}

// ── CREATE PAYMENT ──
async function createPayment() {
  const createBtn = document.getElementById('createBtn');
  try {
    const reason = document.getElementById('reason').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const dueDate = document.getElementById('dueDate').value;

    if (!reason || !amount) {
      showToast('Please fill Reason and Amount', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    createBtn.disabled = true;
    createBtn.innerHTML = '<span>Creating…</span>';

    const insertData = {
      reason,
      amount,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };
    if (dueDate) insertData.due_date = dueDate;

    // Also keep upi field if your DB needs it (as empty string)
    insertData.upi = '';

    const { data: newPayment, error: insertError } = await supabaseClient
      .from('payments')
      .insert(insertData)
      .select();

    if (insertError) throw insertError;

    const paymentId = newPayment[0].id;

    if (!currentUser.class) {
      showToast('Payment created — no class found for auto-assign', 'error');
    } else {
      const { data: students, error: studentsError } = await supabaseClient
        .from('users')
        .select('id, full_name, username')
        .eq('class', currentUser.class)
        .eq('role', 'student');

      if (studentsError) {
        showToast('Payment created but could not fetch students', 'error');
      } else if (students && students.length > 0) {
        const studentPayments = students.map(student => ({
          payment_id: paymentId,
          student_name: student.full_name,
          register_num: student.username,
          status: 'unpaid'
        }));

        const { error: batchError } = await supabaseClient
          .from('student_payments')
          .insert(studentPayments);

        if (batchError) {
          showToast('Payment created but could not add students', 'error');
        }
      } else {
        showToast('Payment created — no students found in class', 'error');
      }
    }

    // Clear form
    document.getElementById('reason').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('dueDate').value = '';

    showToast('Payment event created!', 'success');
    await loadEvents();

  } catch (error) {
    console.error('Create payment error:', error);
    showToast(`Error: ${error.message || 'Failed to create'}`, 'error');
  } finally {
    createBtn.disabled = false;
    createBtn.innerHTML = '<span>+ Create Event</span>';
  }
}

// ── EDIT MODAL ──
function openEditModal(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;

  editingEventId = eventId;
  document.getElementById('editReason').value = event.reason;
  document.getElementById('editAmount').value = event.amount;
  document.getElementById('editDueDate').value = event.due_date ? event.due_date.split('T')[0] : '';

  document.getElementById('editModal').classList.add('open');
}

function closeEditModal(e) {
  if (e.target === document.getElementById('editModal')) {
    document.getElementById('editModal').classList.remove('open');
    editingEventId = null;
  }
}

function closeEditModalBtn() {
  document.getElementById('editModal').classList.remove('open');
  editingEventId = null;
}

async function saveEdit() {
  if (!editingEventId) return;

  try {
    const reason = document.getElementById('editReason').value.trim();
    const amount = parseFloat(document.getElementById('editAmount').value);
    const dueDate = document.getElementById('editDueDate').value;

    if (!reason || !amount) {
      showToast('Please fill Reason and Amount', 'error');
      return;
    }

    const updateData = { reason, amount };
    if (dueDate) updateData.due_date = dueDate;
    else updateData.due_date = null;

    const { error } = await supabaseClient
      .from('payments')
      .update(updateData)
      .eq('id', editingEventId);

    if (error) throw error;

    closeEditModalBtn();
    showToast('Event updated!', 'success');
    await loadEvents();
  } catch (error) {
    console.error('Edit error:', error);
    showToast('Failed to update event', 'error');
  }
}

// ── DELETE EVENT ──
async function deleteEvent(eventId) {
  if (!confirm('Delete this payment event and all student records?')) return;

  try {
    // Delete all student_payments first
    const { error: spError } = await supabaseClient
      .from('student_payments')
      .delete()
      .eq('payment_id', eventId);

    if (spError) throw spError;

    const { error } = await supabaseClient
      .from('payments')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    showToast('Event deleted', 'success');
    await loadEvents();
  } catch (error) {
    console.error('Delete event error:', error);
    showToast('Failed to delete event', 'error');
  }
}



// ── SUBSCRIBE TO REAL-TIME UPDATES ──
function subscribeToPayments() {
  supabaseClient
    .channel('leader-student-payments-realtime')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'student_payments'
      },
      async (payload) => {
        console.log('Realtime update:', payload);

        const updated = payload.new;

        // Only notify if it's a payment for one of our events
        const isOurEvent = allEvents.some(e => e.id === updated.payment_id);
        if (!isOurEvent) return;

        const event = allEvents.find(e => e.id === updated.payment_id);
        const eventName = event ? event.reason : 'an event';

        if (updated.status === 'pending') {
          addNotification(
            `${updated.student_name} has paid`,
            `${eventName} — awaiting your confirmation`
          );
          showToast(`💰 ${updated.student_name} paid for ${eventName}`, 'success');
        } else if (updated.status === 'paid') {
          addNotification(
            `Payment confirmed for ${updated.student_name}`,
            `${eventName}`
          );
        }

        await loadEvents();
      }
    )
    .subscribe();
}

// ── LOGOUT ──
function handleLogout() {
  if (confirm('Logout?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

// ── TOAST ──
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  msg.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── HELPERS ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function getStatusIcon(status) {
  return status === 'paid' ? '✓' : status === 'pending' ? '◷' : '✗';
}

// ── CLOSE MODAL ON ESC ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEditModalBtn();
    document.getElementById('notifPanel').classList.remove('open');
  }
});

// ── CLOSE NOTIF PANEL ON OUTSIDE CLICK ──
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  const bell = document.getElementById('notifBell');
  if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== bell) {
    panel.classList.remove('open');
  }
});

// — START APP —
document.addEventListener("DOMContentLoaded", () => {

  init();

  // Start realtime notification listener
  supabaseClient
  .channel("notifications-live")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications"
    },
    (payload) => {

      console.log("New notification:", payload.new.message);

      showToast(payload.new.message, "success");

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("ClassPay", {
          body: payload.new.message
        });
      }

    }
  )
  .subscribe();

});

async function init() 
{
  startNotificationListener();
}
supabaseClient
.channel("notifications-live")
.on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "notifications"
  },
  (payload) => {

    console.log("New notification:", payload.new.message)

    showPopupNotification(
      "ClassPay",
      payload.new.message
    )

    loadNotifications()

  }
)
.subscribe();

document.getElementById("notifCount").textContent =
data.filter(n=>!n.read).length

const panel =
document.getElementById("notificationPanel")

panel.innerHTML =
data.map(n=>`
<div class="notification-item">
${n.message}
</div>
`).join("")
function startNotificationListener(){

  supabaseClient
  .channel("notifications-live")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications"
    },
    (payload) => {

      console.log("New notification:", payload.new.message);

      showToast(payload.new.message, "success");

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("ClassPay", {
          body: payload.new.message
        });
      }

    }
  )
  .subscribe();

}