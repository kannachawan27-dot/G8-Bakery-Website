/* G8 BAKERY - ADMIN PAGE ACCESS CHECK */
if (sessionStorage.getItem("g8AdminLoggedIn") !== "true") {
  window.location.href = "onwer-login.html";
}

/* G8 BAKERY - ADMIN ORDER MANAGEMENT */
const STORAGE_KEY = "g8Bookings";
const DAILY_CAPACITY = 25;

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}
function readBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
function getFilteredBookings() {
  const bookings = readBookings();
  const searchText = (document.getElementById("searchOrder")?.value || "").toLowerCase();
  const selectedStatus = document.getElementById("statusFilter")?.value || "All";
  const selectedDate = document.getElementById("dateFilter")?.value || "";
  return bookings.filter(booking => {
    const matchesSearch = (booking.name || "").toLowerCase().includes(searchText);
    const matchesStatus = selectedStatus === "All" || (booking.status || "Confirmed") === selectedStatus;
    const matchesDate = !selectedDate || booking.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });
}
function renderDashboard() {
  const bookings = readBookings();
  const todayBookings = bookings.filter(b => b.date === getToday() && b.status !== "Cancelled");
  document.getElementById("totalOrders").textContent = bookings.length;
  document.getElementById("todayOrders").textContent = todayBookings.length;
  document.getElementById("availableCapacity").textContent = Math.max(0, DAILY_CAPACITY - todayBookings.length);

  const tableBody = document.getElementById("bookingTableBody");
  if (!tableBody) return;
  const filtered = getFilteredBookings();
  tableBody.replaceChildren();
  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.textContent = "No matching orders found.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }
  filtered.slice().reverse().forEach(booking => {
    const cake = booking.cake || {};
    const row = document.createElement("tr");
    [
      booking.name || "", booking.festival || "", booking.date || "", booking.time || "",
      cake.flavor || "Not provided", cake.weight ? `${cake.weight} kg` : "—",
      cake.price ? `₹${cake.price}` : "—", booking.status || "Confirmed"
    ].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    const actionCell = document.createElement("td");
    const status = booking.status || "Confirmed";
    const addAction = (label, newStatus) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.className = "order-action-btn";
      button.dataset.id = booking.id;
      button.dataset.status = newStatus;
      actionCell.appendChild(button);
    };
    if (status === "Confirmed") {
      addAction("Accept", "Accepted");
      addAction("Cancel", "Cancelled");
    } else if (status === "Accepted") {
      addAction("Complete", "Completed");
      addAction("Cancel", "Cancelled");
    } else {
      actionCell.textContent = "No actions";
    }
    const receiptButton = document.createElement("button");
    receiptButton.type = "button";
    receiptButton.textContent = "Receipt";
    receiptButton.className = "order-action-btn";
    receiptButton.dataset.receiptId = booking.id;
    actionCell.appendChild(receiptButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });
}
function calculateIngredients() {
  const active = readBookings().filter(b => b.status !== "Cancelled");
  const totalWeight = active.reduce((sum, b) => sum + Number(b.cake?.weight || 0), 0);
  const amounts = {
    requiredFlour: totalWeight * 300,
    requiredSugar: totalWeight * 250,
    requiredButter: totalWeight * 200,
    requiredCream: totalWeight * 250
  };
  Object.entries(amounts).forEach(([id, grams]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = `${grams.toFixed(0)} g`;
  });
  return amounts;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showAdminReceipt(booking) {
  const cake = booking.cake || {};
  const win = window.open("", "_blank", "width=700,height=750");
  if (!win) { alert("Please allow pop-ups to print the receipt."); return; }
  win.document.write(`<!doctype html><html><head><title>G8 Bakery Receipt</title><style>body{font-family:Arial;padding:30px;color:#2e211b}h1{color:#6b3828}hr{border:0;border-top:1px solid #ddd}p{margin:10px 0}</style></head><body><h1>G8 Bakery — Receipt</h1><hr>
  <p><b>Receipt ID:</b> ${escapeHtml(booking.id)}</p><p><b>Customer:</b> ${escapeHtml(booking.name)}</p>
  <p><b>Occasion:</b> ${escapeHtml(booking.festival)}</p><p><b>Pickup:</b> ${escapeHtml(booking.date)} · ${escapeHtml(booking.time)}</p>
  <p><b>Cake:</b> ${escapeHtml(cake.flavor)} · ${escapeHtml(cake.weight)} kg</p>
  <p><b>Shape:</b> ${escapeHtml(cake.shape)} · <b>Frosting:</b> ${escapeHtml(cake.frosting)}</p>
  <p><b>Decoration:</b> ₹${Number(cake.decoration || 0).toFixed(2)}</p>
  <p><b>Base price:</b> ₹${Number(cake.basePrice || cake.price || 0).toFixed(2)}</p>
  <p><b>Early-bird discount:</b> ${Number(cake.discountPercent || 0)}% (−₹${Number(cake.discountAmount || 0).toFixed(2)})</p>
  <h2>Total: ₹${Number(cake.price || 0).toFixed(2)}</h2><p><b>Status:</b> ${escapeHtml(booking.status)}</p><hr><p>Thank you for choosing G8 Bakery!</p><script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}
function exportOrdersToCSV() {
  const filtered = getFilteredBookings();
  if (!filtered.length) { alert("No orders available to export!"); return; }
  const headers = ["Customer","Festival","Pickup Date","Pickup Time","Cake","Weight","Base Price","Discount %","Discount Amount","Final Price","Status"];
  const rows = filtered.map(b => {
    const c = b.cake || {};
    return [b.name,b.festival,b.date,b.time,c.flavor,c.weight,c.basePrice,c.discountPercent,c.discountAmount,c.price,b.status || "Confirmed"];
  });
  const csv = [headers,...rows].map(row => row.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href=url; link.download="G8_Bakery_Orders.csv";
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(url);
}
function generatePurchaseOrder() {
  const active = readBookings().filter(b => b.status !== "Cancelled");
  if (!active.length) { alert("No active bookings to calculate a purchase order."); return; }
  const ingredients = calculateIngredients();
  const count = active.length;
  const weight = active.reduce((sum,b)=>sum+Number(b.cake?.weight||0),0);
  const rows = [
    ["Flour", ingredients.requiredFlour],
    ["Sugar", ingredients.requiredSugar],
    ["Butter", ingredients.requiredButter],
    ["Cream", ingredients.requiredCream]
  ];
  const area = document.getElementById("purchaseOrderPreview");
  area.innerHTML = `<div class="purchase-order-sheet">
    <h2>G8 Bakery — Supplier Purchase Order</h2>
    <p><b>Generated:</b> ${new Date().toLocaleString("en-IN")}</p>
    <p><b>Active orders:</b> ${count} &nbsp; <b>Total cake weight:</b> ${weight.toFixed(2)} kg</p>
    <p>Quantities below use the demo recipe estimates currently configured in the Ingredient Forecaster.</p>
    <table><thead><tr><th>Ingredient</th><th>Estimated quantity</th></tr></thead>
    <tbody>${rows.map(([name,grams])=>`<tr><td>${name}</td><td>${grams.toFixed(0)} g</td></tr>`).join("")}</tbody></table>
    <p><b>Supplier:</b> ____________________ &nbsp; <b>PO No:</b> G8-${Date.now()}</p>
    <p><b>Authorized by:</b> ____________________</p>
    <button type="button" id="printPurchaseOrder">Print / Save as PDF</button>
  </div>`;
  document.getElementById("printPurchaseOrder")?.addEventListener("click",()=>window.print());
}
document.getElementById("searchOrder")?.addEventListener("input",renderDashboard);
document.getElementById("statusFilter")?.addEventListener("change",renderDashboard);
document.getElementById("dateFilter")?.addEventListener("change",renderDashboard);
document.getElementById("exportOrders")?.addEventListener("click",exportOrdersToCSV);
document.getElementById("generatePurchaseOrder")?.addEventListener("click",generatePurchaseOrder);

document.getElementById("bookingTableBody")?.addEventListener("click", event => {
  const receiptButton = event.target.closest("button[data-receipt-id]");
  if (receiptButton) {
    const found = readBookings().find(b => String(b.id) === receiptButton.dataset.receiptId);
    if (found) showAdminReceipt(found);
    return;
  }
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const bookings = readBookings();
  const booking = bookings.find(item => String(item.id) === button.dataset.id);
  if (!booking) return;
  booking.status = button.dataset.status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  renderDashboard();
  calculateIngredients();
});
window.addEventListener("storage", () => { renderDashboard(); calculateIngredients(); });

// Initial render after function declarations are available.
renderDashboard();
calculateIngredients();

// ADMIN LOGOUT
document.getElementById("adminLogout")?.addEventListener("click", () => {
  sessionStorage.removeItem("g8AdminLoggedIn");
  window.location.href = "onwer-login.html";
});
