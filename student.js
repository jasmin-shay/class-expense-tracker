// ── STUDENT DASHBOARD ──
let currentUser = null;
let myPayments = [];

// ── INITIALIZATION ──
async function init() {
  try {

    const userStr = localStorage.getItem("currentUser");

    if (!userStr) {
      window.location.href = "login.html";
      return;
    }

    currentUser = JSON.parse(userStr);

    updateUserBadge();

    await loadStudentProfile();   // ADD THIS

    await loadMyPayments();

    subscribeToMyPayments();

  } catch (error) {
    console.error("Initialization error:", error);
    showToast("Error loading dashboard", "error");
  }
}
async function loadStudentProfile() {

  if (!currentUser) return;

  document.getElementById("profileName").textContent =
    currentUser.full_name;

  document.getElementById("profileReg").textContent =
    currentUser.username;

  document.getElementById("profileClass").textContent =
    currentUser.class;


  // avatar initials
  const initials =
    currentUser.full_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();

  document.getElementById("profileAvatar").textContent =
    initials;
}

// ── USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById("userBadge");

  if (currentUser) {
    badge.textContent =
      `${currentUser.username.toUpperCase()} · STUDENT`;
  }
}

function openNotifications(){

const panel =
document.getElementById("notificationPanel")

panel.style.display =
panel.style.display === "block"
? "none"
: "block"

}
// ── LOAD MY PAYMENTS ──
async function loadMyPayments() {

  try {

    const container = document.getElementById("paymentsContainer");

    container.innerHTML =
      `<div class="loading">Loading your payments...</div>`;


    // Get assignments for this student
    const { data: assignments, error } =
      await supabaseClient
        .from("student_payments")
        .select("*")
        .eq("register_num", currentUser.username);

    if (error) throw error;


    if (!assignments || assignments.length === 0) {

      container.innerHTML =
        `<div class="empty">No payments assigned to you yet.</div>`;

      return;
    }


    // Get payment IDs
    const paymentIds = assignments.map(p => p.payment_id);


    // Get payment details
    const { data: payments, error: paymentError } =
      await supabaseClient
        .from("payments")
        .select("*")
        .in("id", paymentIds)
        .order("created_at", { ascending: false });

    if (paymentError) throw paymentError;


    // Merge payment + status
    myPayments = payments.map(payment => {

      const myStatus =
        assignments.find(a => a.payment_id === payment.id);

      return {
        ...payment,
        myStatus
      };

    });


    // ── CALCULATE TOTAL / PAID / DUE ──
    let total = 0;
    let paid = 0;

    myPayments.forEach(p => {

      total += p.amount;

      if (p.myStatus?.status === "paid") {
        paid += p.amount;
      }

    });

    const due = total - paid;


    document.getElementById("statTotal").textContent = "₹" + total;
    document.getElementById("statPaid").textContent = "₹" + paid;
    document.getElementById("statDue").textContent = "₹" + due;


    // Render payment cards
    renderPayments();


  } catch (error) {

    console.error("Load payments error:", error);

    showToast("Failed to load payments", "error");

  }

}


// ── RENDER PAYMENTS ──
function renderPayments() {

  const container =
    document.getElementById("paymentsContainer");

  container.innerHTML =
    myPayments.map((payment, index) => {

      const status =
        payment.myStatus.status;

      return `

      <div class="payment-card">

        <div class="payment-header">

          <div>
            <div class="payment-reason">
              ${payment.reason}
            </div>

            <span class="status-badge status-${status}">
              ${status}
            </span>

          </div>

          <div class="payment-amount">
            ₹${payment.amount}
          </div>

        </div>


        <div class="payment-details">

          <div>
            Created :
            ${formatDate(payment.created_at)}
          </div>

        </div>


        <div style="display:flex; gap:10px; margin-top:10px;">

          ${
            status !== "paid"
            ? `<button onclick="payWithRazorpay(${index})"
                class="pay-btn">
                Pay Now
              </button>`
            : `<span style="color:green;">✓ Paid</span>`
          }

        </div>

      </div>

      `;

    }).join("");

}


// ── RAZORPAY PAYMENT ──
function payWithRazorpay(index) {

  const payment =
    myPayments[index];

  const options = {

    key: "rzp_live_SOncgc69x3fR1N ", // Replace with your Razorpay key

    amount: payment.amount * 100,

    currency: "INR",

    name: "Class Expense",

    description: payment.reason,

    handler: async function () {

      await markAsPaid(index);

    },

    prefill: {
      name: currentUser.username
    },

    theme: {
      color: "#7c3aed"
    }

  };

  const rzp =
    new Razorpay(options);

  rzp.open();

}


// ── MARK PAYMENT ──
async function markAsPaid(index) {

  const payment =
    myPayments[index];

  const myStatus =
    payment.myStatus;

  try {

    const { error } =
      await supabaseClient
        .from("student_payments")
        .update({
          status: "pending",
          payment_date: new Date().toISOString()
        })
        .eq("id", myStatus.id);

    if (error) throw error;

    showToast("Payment sent for approval", "success");

    await loadMyPayments();

  } catch (error) {

    console.error("Payment update error:", error);

    showToast("Failed to update payment", "error");

  }

}


// ── REALTIME UPDATES ──
function subscribeToMyPayments() {

  supabaseClient
    .channel("payments-channel")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "student_payments"
      },

      () => {

        console.log("Realtime update received");

        loadMyPayments();

      }
    )

    .subscribe();

}


// ── FORMAT DATE ──
function formatDate(dateStr) {

  const date =
    new Date(dateStr);

  return date.toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

}


// ── LOGOUT ──
function handleLogout() {

  if (confirm("Logout?")) {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";

  }

}


// ── TOAST ──
function showToast(message, type="info") {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.className =
    "toast show " + type;

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


// ── START APP ──
document.addEventListener(
  "DOMContentLoaded",
  init
);
