window.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  loadUserProfile();
  loadSavedIdeas();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("savedIdeas");
        alert("You have been logged out successfully!");
        window.location.href = "index.html";
      }
    });
  }
});

function checkAuthStatus() {
  const user = getUserFromStorage();
  if (!user) {
    window.location.href = "login.html";
  }
}

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function loadUserProfile() {
  const user = getUserFromStorage();
  if (user) {
    document.getElementById("user-name").textContent = `Welcome, ${user.name}`;
    document.getElementById("user-email").textContent = `Email: ${user.email}`;
  }
}

function loadSavedIdeas() {
  const ideasGrid = document.getElementById("ideas-grid");
  const savedIdeas = JSON.parse(localStorage.getItem("savedIdeas") || "[]");

  if (savedIdeas.length === 0) {
    ideasGrid.innerHTML = `
      <div class="no-ideas">
        <h4>No saved ideas yet</h4>
        <p>Start by <a href="generate.html">generating some ideas</a> and save your favorites!</p>
      </div>
    `;
  } else {
    ideasGrid.innerHTML = savedIdeas
      .map((idea, index) => `
        <div class="idea-card">
          <h4>${idea.title}</h4>
          <p>${idea.description}</p>
          <button class="delete-btn" onclick="deleteIdea(${index})">Remove</button>
        </div>
      `)
      .join("");
  }
}

function deleteIdea(index) {
  if (confirm("Are you sure you want to remove this idea?")) {
    const savedIdeas = JSON.parse(localStorage.getItem("savedIdeas") || "[]");
    savedIdeas.splice(index, 1);
    localStorage.setItem("savedIdeas", JSON.stringify(savedIdeas));
    loadSavedIdeas();
  }
}
