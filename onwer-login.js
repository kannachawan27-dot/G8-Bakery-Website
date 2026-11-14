// Demo-only front-end login. Do not use this for production security.
const ADMIN_USERNAME = "kanna";
const ADMIN_PASSWORD = "kanna@143";

document.getElementById("adminLoginForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const username = document.getElementById("adminUsername")?.value.trim();
  const password = document.getElementById("adminPassword")?.value;
  const message = document.getElementById("loginMessage");

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("g8AdminLoggedIn", "true");
    window.location.href = "onwer.html";
  } else if (message) {
    message.textContent = "Incorrect username or password.";
  }
});
