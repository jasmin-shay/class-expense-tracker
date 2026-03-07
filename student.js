<<<<<<< HEAD
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

    await loadMyPayments();

    subscribeToMyPayments();

  } catch (error) {
    console.error("Initialization error:", error);
    showToast("Error loading dashboard", "error");
  }
}


// ── USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById("userBadge");

  if (currentUser) {
    badge.textContent =
      `${currentUser.username.toUpperCase()} · STUDENT`;
  }
}


// ── LOAD MY PAYMENTS ──
async function loadMyPayments() {

  try {

    const container =
      document.getElementById("paymentsContainer");

    container.innerHTML =
      `<div class="loading">Loading your payments...</div>`;


    // Get assigned payments
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


    const paymentIds =
      assignments.map(p => p.payment_id);


    const { data: payments, error: paymentError } =
      await supabaseClient
        .from("payments")
        .select("*")
        .in("id", paymentIds)
        .order("created_at", { ascending: false });

    if (paymentError) throw paymentError;


    myPayments =
      payments.map(payment => {

        const myStatus =
          assignments.find(a => a.payment_id === payment.id);

        return {
          ...payment,
          myStatus
        };
      });


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

    key: "rzp_test_1234567890", // Replace with your Razorpay key

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
=======
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

    await loadMyPayments();

    subscribeToMyPayments();

  } catch (error) {
    console.error("Initialization error:", error);
    showToast("Error loading dashboard", "error");
  }
}


// ── USER BADGE ──
function updateUserBadge() {
  const badge = document.getElementById("userBadge");

  if (currentUser) {
    badge.textContent =
      `${currentUser.username.toUpperCase()} · STUDENT`;
  }
}


// ── LOAD MY PAYMENTS ──
async function loadMyPayments() {

  try {

    const container =
      document.getElementById("paymentsContainer");

    container.innerHTML =
      `<div class="loading">Loading your payments...</div>`;


    // Get assigned payments
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


    const paymentIds =
      assignments.map(p => p.payment_id);


    const { data: payments, error: paymentError } =
      await supabaseClient
        .from("payments")
        .select("*")
        .in("id", paymentIds)
        .order("created_at", { ascending: false });

    if (paymentError) throw paymentError;


    myPayments =
      payments.map(payment => {

        const myStatus =
          assignments.find(a => a.payment_id === payment.id);

        return {
          ...payment,
          myStatus
        };
      });


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

    key: "rzp_test_1234567890", // Replace with your Razorpay key

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
>>>>>>> 0c8568dca3fa4766446fd6e9f46f665c9dff2b75
);