/* =========================================
   G8 BAKERY - CUSTOMER PAGE
   Browser demo: bookings are saved in localStorage.
========================================= */
const STORAGE_KEY = "g8Bookings";
const DRAFT_KEY = "g8CakeDraft";
const DAILY_CAPACITY = 25;
const EARLY_BIRD_DAYS = 7;
const EARLY_BIRD_DISCOUNT = 10; // Demo default: 10%

function getBookings() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Could not read saved bookings:", error);
    return [];
  }
}
function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}
function localDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}
function daysUntil(dateString) {
  if (!dateString) return -1;
  const [y,m,d] = dateString.split("-").map(Number);
  const target = new Date(y, m-1, d);
  const todayParts = localDateString().split("-").map(Number);
  const today = new Date(todayParts[0], todayParts[1]-1, todayParts[2]);
  return Math.round((target - today) / 86400000);
}

const weight = document.getElementById("weight");
const flavor = document.getElementById("flavor");
const shape = document.getElementById("shape");
const frosting = document.getElementById("frosting");
const decoration = document.getElementById("decoration");
const message = document.getElementById("message");
const totalPrice = document.getElementById("totalPrice");
const previewFlavor = document.getElementById("previewFlavor");
const previewDetails = document.getElementById("previewDetails");
const cakeTiers = document.querySelectorAll(".cake-tier");
const topTier = document.querySelector(".top-tier");
const pickupDate = document.getElementById("pickupDate");
const cakePhoto = document.getElementById("cakePhoto");
const cakePhotoPreview = document.getElementById("cakePhotoPreview");
const cakePhotoHint = document.getElementById("cakePhotoHint");
let inspirationPhotoData = "";

const basePrices = { chocolate: 65000, redvelvet: 75000, mango: 70000 }; // paise/kg
const flavorNames = { chocolate: "Chocolate Truffle", redvelvet: "Red Velvet", mango: "Mango" };

function getPriceDetails(date = pickupDate?.value || "") {
  const selectedFlavor = flavor?.value || "chocolate";
  const selectedWeight = Number(weight?.value || 1);
  const decorationRupees = Number(decoration?.value || 0);
  const basePaise = Math.round((basePrices[selectedFlavor] || 65000) * selectedWeight) + decorationRupees * 100;
  const days = daysUntil(date);
  const discountEligible = days >= EARLY_BIRD_DAYS;
  const discountPaise = discountEligible ? Math.round(basePaise * EARLY_BIRD_DISCOUNT / 100) : 0;
  const finalPaise = basePaise - discountPaise;
  return {
    basePrice: (basePaise / 100).toFixed(2),
    discountPercent: discountEligible ? EARLY_BIRD_DISCOUNT : 0,
    discountAmount: (discountPaise / 100).toFixed(2),
    price: (finalPaise / 100).toFixed(2),
    daysInAdvance: days
  };
}
function getCakeDetails(date = pickupDate?.value || "") {
  const selectedFlavor = flavor?.value || "chocolate";
  const selectedWeight = Number(weight?.value || 1);
  const decorationRupees = Number(decoration?.value || 0);
  const price = getPriceDetails(date);
  return {
    flavor: flavorNames[selectedFlavor] || selectedFlavor,
    weight: selectedWeight,
    shape: shape?.value || "round",
    frosting: frosting?.selectedOptions?.[0]?.textContent || "Chocolate Brown",
    decoration: decorationRupees,
    message: message?.value?.trim() || "",
    photo: inspirationPhotoData,
    basePrice: price.basePrice,
    discountPercent: price.discountPercent,
    discountAmount: price.discountAmount,
    price: price.price
  };
}
function updateCakePreview() {
  if (!weight || !flavor || !shape || !frosting) return;
  const selectedWeight = Number(weight.value);
  cakeTiers.forEach(tier => {
    tier.style.backgroundColor = frosting.value;
    tier.style.borderRadius = shape.value === "round" ? "48%" : shape.value === "heart" ? "45% 45% 10% 10%" : "8px";
  });
  if (topTier) topTier.style.display = selectedWeight >= 2 ? "block" : "none";
  if (previewFlavor) previewFlavor.textContent = flavorNames[flavor.value] || flavor.value;
  if (previewDetails) previewDetails.textContent = `${weight.value} kg · ${shape.value} · ${getCakeDetails().frosting}`;
  const previewMessage = document.getElementById("previewCakeMessage");
  if (previewMessage) previewMessage.textContent = message?.value?.trim() || "Your message appears here";
}
function calculatePrice() {
  if (!weight || !flavor || !totalPrice) return;
  const price = getPriceDetails();
  totalPrice.textContent = "₹" + Number(price.price).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});
  const breakdown = document.getElementById("priceBreakdown");
  if (breakdown) {
    if (price.discountPercent) {
      breakdown.textContent = `Early-bird discount (${EARLY_BIRD_DISCOUNT}%) applied: save ₹${Number(price.discountAmount).toLocaleString("en-IN")} · Base ₹${Number(price.basePrice).toLocaleString("en-IN")}`;
    } else if (pickupDate?.value) {
      breakdown.textContent = `No early-bird discount. Select a date at least ${EARLY_BIRD_DAYS} days ahead to save ${EARLY_BIRD_DISCOUNT}%.`;
    } else {
      breakdown.textContent = `Choose a pickup date ${EARLY_BIRD_DAYS}+ days ahead to save ${EARLY_BIRD_DISCOUNT}%.`;
    }
  }
  updateCakePreview();
}
[weight, flavor, shape, frosting, decoration, message].forEach(element => {
  element?.addEventListener("input", calculatePrice);
  element?.addEventListener("change", calculatePrice);
});
pickupDate?.addEventListener("change", calculatePrice);
if (pickupDate) pickupDate.min = localDateString();

cakePhoto?.addEventListener("change", () => {
  const file = cakePhoto.files?.[0];
  if (!file) {
    inspirationPhotoData = "";
    if (cakePhotoPreview) cakePhotoPreview.hidden = true;
    if (cakePhotoHint) cakePhotoHint.textContent = "Choose a photo to preview your cake inspiration.";
    return;
  }
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    cakePhoto.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert("Please choose an image smaller than 2 MB for this browser demo.");
    cakePhoto.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    inspirationPhotoData = String(reader.result || "");
    if (cakePhotoPreview) {
      cakePhotoPreview.src = inspirationPhotoData;
      cakePhotoPreview.hidden = false;
    }
    if (cakePhotoHint) cakePhotoHint.textContent = "Inspiration image preview (reference only; not an exact cake rendering).";
  };
  reader.readAsDataURL(file);
});

calculatePrice();

const bookingButton = document.getElementById("bookingButton");
const cakeDraftStatus = document.getElementById("cakeDraftStatus");
bookingButton?.addEventListener("click", () => {
  const cake = getCakeDetails();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(cake));
  if (cakeDraftStatus) cakeDraftStatus.textContent = `Cake selected: ${cake.flavor}, ${cake.weight} kg, ₹${cake.price}. Now fill in your pickup details.`;
  document.getElementById("booking")?.scrollIntoView({behavior:"smooth"});
});

const festivalForm = document.getElementById("festivalForm");
const bookingMessage = document.getElementById("bookingMessage");
festivalForm?.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("customerName")?.value.trim();
  const festival = document.getElementById("festival")?.value;
  const date = pickupDate?.value;
  const time = document.getElementById("pickupTime")?.value;
  if (!name || !festival || !date || !time) {
    if (bookingMessage) bookingMessage.textContent = "Please complete all booking details.";
    return;
  }
  if (date < localDateString()) {
    if (bookingMessage) bookingMessage.textContent = "Please select today or a future date.";
    return;
  }
  let cake;
  try { cake = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { cake = null; }
  if (!cake) {
    if (bookingMessage) bookingMessage.textContent = "Please create your cake and click Continue to Booking first.";
    return;
  }
  // Recalculate against the actual selected pickup date at submission time.
  cake = getCakeDetails(date);
  const bookings = getBookings();
  const bookedForDate = bookings.filter(item => item.date === date && item.status !== "Cancelled").length;
  if (bookedForDate >= DAILY_CAPACITY) {
    if (bookingMessage) bookingMessage.textContent = "Sorry, this date has reached its 25-cake limit.";
    return;
  }
  const newBooking = {
    id: Date.now(),
    name, festival, date, time, cake,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  saveBookings(bookings);
  localStorage.removeItem(DRAFT_KEY);
  if (bookingMessage) bookingMessage.textContent = `Thank you ${name}! Your ${cake.flavor} cake booking is confirmed.`;
  renderReceipt(newBooking);
  festivalForm.reset();
  if (pickupDate) pickupDate.min = localDateString();
  if (cakeDraftStatus) cakeDraftStatus.textContent = "Booking saved. Create another cake to place a new order.";
  if (cakePhoto) cakePhoto.value = "";
  inspirationPhotoData = "";
  calculatePrice();
});

function renderReceipt(booking) {
  const area = document.getElementById("receiptArea");
  if (!area) return;
  const cake = booking.cake || {};
  area.innerHTML = `
    <div class="receipt-card">
      <h3>G8 Bakery — Booking Receipt</h3>
      <p><strong>Receipt ID:</strong> ${String(booking.id)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(booking.name)}</p>
      <p><strong>Occasion:</strong> ${escapeHtml(booking.festival)}</p>
      <p><strong>Pickup:</strong> ${escapeHtml(booking.date)} · ${escapeHtml(booking.time)}</p>
      <p><strong>Cake:</strong> ${escapeHtml(cake.flavor || "")} · ${escapeHtml(cake.weight || "")} kg</p>
      <p><strong>Shape / Frosting:</strong> ${escapeHtml(cake.shape || "")} / ${escapeHtml(cake.frosting || "")}</p>
      <p><strong>Decoration:</strong> ₹${Number(cake.decoration || 0).toFixed(2)}</p>
      <p><strong>Base price:</strong> ₹${Number(cake.basePrice || cake.price || 0).toFixed(2)}</p>
      <p><strong>Early-bird discount:</strong> ${Number(cake.discountPercent || 0)}% (−₹${Number(cake.discountAmount || 0).toFixed(2)})</p>
      <p><strong>Total:</strong> ₹${Number(cake.price || 0).toFixed(2)}</p>
      <p><strong>Status:</strong> ${escapeHtml(booking.status || "Confirmed")}</p>
      <div class="receipt-actions"><button type="button" id="printReceipt">Print / Save as PDF</button></div>
    </div>`;
  document.getElementById("printReceipt")?.addEventListener("click", () => window.print());
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
