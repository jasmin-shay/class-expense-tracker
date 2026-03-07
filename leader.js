// ── INITIALIZE SUPABASE ──
// supabaseClient is created in supabase.js

let currentUser = null;
let allEvents = [];

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

    await loadEvents();      // load events first
    subscribeToPayments();   // start realtime updates

  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Error loading dashboard', 'error');
  }
}

// ── UPDATE USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById('userBadge');
  if (currentUser) {
    badge.textContent = `${currentUser.username.toUpperCase()} · LEADER`;
  }
}

// ── LOAD EVENTS FROM SUPABASE ──
async function loadEvents() {
  try {
    const list = document.getElementById('eventsList');
    list.innerHTML = '<div class="loading">Loading events…</div>';

    const { data: events, error } = await supabaseClient
      .from('payments')
      .select('id, reason, amount, upi, created_at, created_by')
      .eq('created_by', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    allEvents = events || [];

    if (allEvents.length === 0) {
      list.innerHTML = '<div class="empty">No events yet. Create one above ↑</div>';
      updateToggleSub(0, 0);
      return;
    }

    // Fetch student payments for each event
    for (let event of allEvents) {
      event.students = await loadStudentsForEvent(event.id);
    }

    renderEvents();
    updateToggleSub(
      allEvents.length, 
      allEvents.reduce((a, e) => a + ((e.students || []).length), 0)
    );
  } catch (error) {
    console.error('Load events error:', error);
    showToast('Failed to load events', 'error');
  }
}

// ── LOAD STUDENTS FOR SPECIFIC EVENT ──
async function loadStudentsForEvent(paymentId) {
  try {
    const { data: students, error } = await supabaseClient
      .from('student_payments')
      .select('id, student_name, register_num, status')
      .eq('payment_id', paymentId)
      .order('student_name', { ascending: true});

    if (error) throw error;
    return students || [];
  } catch (error) {
    console.error('Load students error:', error);
    return [];
  }
}

// ── UPDATE TOGGLE SUB TEXT ──
function updateToggleSub(eventCount, studentCount) {
  const sub = document.getElementById('toggleSub');
  sub.textContent = `${eventCount} event${eventCount !== 1 ? 's' : ''} · ${studentCount} students total`;
}

// ── RENDER EVENTS ──
function renderEvents() {
  const list = document.getElementById('eventsList');

  if (allEvents.length === 0) {
    list.innerHTML = '<div class="empty">No events yet. Create one above ↑</div>';
    return;
  }

  list.innerHTML = allEvents.map((event, index) => {
    const paid = event.students.filter(s => s.status === 'paid').length;
    const unpaid = event.students.filter(s => s.status !== 'paid').length;
    const isUPI = !event.upi.startsWith('http');

    return `
      <div class="event-card" id="ec-${event.id}">
        <div class="event-header" onclick="toggleEvent(${event.id})">
          <div class="event-header-left">
            <span class="event-num">#${String(index + 1).padStart(2, '0')}</span>
            <div>
              <div class="event-title">${escapeHtml(event.reason)}</div>
              <div class="event-amount">₹${event.amount.toLocaleString()}</div>
            </div>
          </div>
          <div class="event-header-right">
            <div class="event-stats">
              <span class="stat-pill paid">✓ ${paid} paid</span>
              <span class="stat-pill unpaid">✗ ${unpaid} unpaid</span>
            </div>
            <span class="event-chevron">▼</span>
          </div>
        </div>
        <div class="student-panel">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Status</th>
                <th>UPI / QR</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${event.students.map((student, j) => `
                <tr>
                  <td style="color:var(--muted);font-family:var(--font-mono);font-size:0.72rem">${j + 1}</td>
                  <td>${escapeHtml(student.student_name)}</td>
                  <td>
                    <span class="badge ${student.status}" onclick="cycleStatus(${event.id}, ${student.id}, '${student.status}')">
                      ${getStatusIcon(student.status)}
                      ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    ${isUPI
                      ? `<span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted)">${escapeHtml(event.upi)}</span>`
                      : `<a class="upi-link" href="${event.upi}" target="_blank">Open QR ↗</a>`
                    }
                  </td>
                  <td>
                    <button type="button" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:0.9rem;" onclick="deleteStudentPayment(${event.id}, ${student.id})">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }).join('');
}

// ── GET STATUS ICON ──
function getStatusIcon(status) {
  switch (status) {
    case 'paid': return '✓';
    case 'pending': return '◷';
    case 'unpaid': return '✗';
    default: return '◷';
  }
}

// ── CYCLE STATUS ──
async function cycleStatus(paymentId, studentPaymentId, currentStatus) {
  try {
    const statuses = ['unpaid', 'pending', 'paid'];
    const currentIndex = statuses.indexOf(currentStatus);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];

    const { error } = await supabaseClient
      .from('student_payments')
      .update({ status: newStatus })
      .eq('id', studentPaymentId);

    if (error) throw error;

    showToast(`✓ Status updated to ${newStatus}`, 'success');
    await loadEvents();
  } catch (error) {
    console.error('Cycle status error:', error);
    showToast('Failed to update status', 'error');
  }
}

// ── DELETE STUDENT PAYMENT ──
async function deleteStudentPayment(paymentId, studentPaymentId) {
  if (!confirm('Are you sure you want to remove this student from the payment?')) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('student_payments')
      .delete()
      .eq('id', studentPaymentId);

    if (error) throw error;

    showToast('✓ Student removed from payment', 'success');
    await loadEvents();
  } catch (error) {
    console.error('Delete student error:', error);
    showToast('Failed to remove student', 'error');
  }
}

// ── TOGGLE EVENTS PANEL ──
function toggleEvents() {
  const btn = document.getElementById('eventsToggle');
  const panel = document.getElementById('eventsPanel');
  btn.classList.toggle('open');
  panel.classList.toggle('open');
}

// ── TOGGLE INDIVIDUAL EVENT ──
function toggleEvent(id) {
  const card = document.getElementById(`ec-${id}`);
  card.classList.toggle('open');
}

// ── CREATE PAYMENT ──
async function createPayment() {
  let createBtn = null;
  try {
    const reason = document.getElementById('reason').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const upi = document.getElementById('upi').value.trim();

    // Validation
    if (!reason || !amount || !upi) {
      showToast('⚠️ Please fill all fields', 'error');
      return;
    }

    if (amount <= 0) {
      showToast('⚠️ Amount must be greater than 0', 'error');
      return;
    }

    createBtn = document.getElementById('createBtn');
    createBtn.disabled = true;
    createBtn.textContent = '⏳ Creating…';

    // Insert payment event
    const { data: newPayment, error: insertError } = await supabaseClient
      .from('payments')
      .insert({
        reason,
        amount,
        upi,
        created_by: currentUser.id,
        created_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('Insert payment error:', insertError);
      throw new Error(`Failed to create payment: ${insertError.message}`);
    }

    if (!newPayment || !newPayment[0]) {
      throw new Error('Payment was created but no data returned');
    }

    const paymentId = newPayment[0].id;
    console.log('Payment created with ID:', paymentId);

    // Get all students from class and add them to payment
    if (!currentUser.class) {
      console.warn('⚠️ User class is not set. Cannot auto-assign students.');
      showToast('⚠️ Payment created but students not auto-assigned (no class found for user)', 'error');
    } else {
      const { data: students, error: studentsError } = await supabaseClient
        .from('users')
        .select('id, full_name, username')
        .eq('class', currentUser.class)
        .eq('role','student')
        console.log("Students fetched:", students)

      console.log('Students query result:', { students, error: studentsError });

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        showToast('⚠️ Payment created but could not fetch students', 'error');
      } else if (students && students.length > 0) {
        const studentPayments = students.map(student => ({
          payment_id: paymentId,
          student_name: student.full_name,
          register_num: student.username,
          status: 'unpaid'
        }));

        console.log('Adding student payments:', studentPayments);

        const { error: batchError } = await supabaseClient
          .from('student_payments')
          .insert(studentPayments);

        if (batchError) {
          console.error('Error adding students to payment:', batchError);
          showToast('⚠️ Payment created but could not add students', 'error');
        } else {
          console.log('✓ Successfully added students to payment');
        }
      } else {
        console.warn('No students found for class:', currentUser.class);
        showToast('⚠️ Payment created but no students found in class', 'error');
      }
    }

    // Clear form
    document.getElementById('reason').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('upi').value = '';

    // Open events panel if closed
    const panel = document.getElementById('eventsPanel');
    const btn = document.getElementById('eventsToggle');
    if (!panel.classList.contains('open')) {
      panel.classList.add('open');
      btn.classList.add('open');
    }

    showToast('✓ Payment event created!', 'success');
    await loadEvents();
  } catch (error) {
    console.error('Create payment error:', error);
    const errorMsg = error.message || 'Failed to create payment event';
    showToast(`❌ Error: ${errorMsg}`, 'error');
  } finally {
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = '+ Create';
    }
  }
}

// ── SUBSCRIBE TO REAL-TIME UPDATES ──
// ── REALTIME SUBSCRIPTION (SUPABASE V2) ──
function subscribeToPayments() {

  const channel = supabaseClient
    .channel('student-payments-realtime')

    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_payments'
      },
      (payload) => {

        console.log("Realtime update:", payload);

        showToast("📢 Payment status updated");

        loadEvents(); // refresh events list

      }
    )

    .subscribe();

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
  toast.classList.remove('error', 'success');
  if (type) {
    toast.classList.add(type);
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── ESCAPE HTML ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── INIT ON LOAD ──
document.addEventListener('DOMContentLoaded', init);
