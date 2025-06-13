window.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  loadUserProfile();
  loadSavedIdeas();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("savedIdeas");

        alert("You have been logged out successfully!");
        window.location.href = "index.html";
      }
    });
  }
});

const API_BASE_URL = "";
let fullIdeasData = {};

function checkAuthStatus() {
  const user = getUserFromStorage();
  const token = getAuthToken();

  console.log("Auth check - User:", !!user, "Token:", !!token);

  if (!user || !token) {
    alert("Please log in to access your profile.");
    window.location.href = "login.html";
    return;
  }
}

function getUserFromStorage() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from storage:", error);
    return null;
  }
}

function getAuthToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt")
  );
}

function loadUserProfile() {
  const user = getUserFromStorage();
  if (user) {
    document.getElementById("user-name").textContent = `Welcome, ${user.name}`;
    document.getElementById("user-email").textContent = `Email: ${user.email}`;
  }
}

async function loadSavedIdeas() {
  const ideasGrid = document.getElementById("ideas-grid");
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token found");
    ideasGrid.innerHTML = `
      <div class="no-ideas">
        <h4>Authentication Error</h4>
        <p>Please <a href="login.html">log in again</a> to view your saved ideas.</p>
      </div>
    `;
    return;
  }

  try {
    ideasGrid.innerHTML = `
      <div class="loading-state">
        <p>Loading your saved ideas...</p>
      </div>
    `;

    console.log("Fetching ideas from API...");

    const response = await fetch(`${API_BASE_URL}/api/ideas/my-ideas`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.clear();
        window.location.href = "login.html";
        return;
      }

      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Received ideas data:", data);

    if (data.success && data.ideas) {
      displaySavedIdeas(data.ideas);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading saved ideas:", error);
    ideasGrid.innerHTML = `
      <div class="error-state">
        <h4>Error Loading Ideas</h4>
        <p>Failed to load your saved ideas: ${error.message}</p>
        <button onclick="loadSavedIdeas()" class="retry-btn">Try Again</button>
      </div>
    `;
    showToast("Failed to load saved ideas: " + error.message, "error");
  }
}

function displaySavedIdeas(ideas) {
  const ideasGrid = document.getElementById("ideas-grid");
  fullIdeasData = {};

  if (!ideas || ideas.length === 0) {
    ideasGrid.innerHTML = `
      <div class="no-ideas">
        <h4>No saved ideas yet</h4>
        <p>Start by <a href="generate.html">generating some ideas</a> and save your favorites!</p>
      </div>
    `;
    return;
  }

  ideas.forEach((idea) => {
    fullIdeasData[idea.id] = idea;
  });

  ideasGrid.innerHTML = ideas
    .map(
      (idea) => `
      <div class="idea-card" data-idea-id="${
        idea.id
      }" data-full-description="${escapeHtml(idea.description)}">
        <div class="idea-header">
          <h4 class="idea-title">${escapeHtml(idea.title)}</h4>
          <div class="idea-meta">
            <span class="tech-badge">${escapeHtml(idea.language)}</span>
            ${
              idea.hardware
                ? `<span class="hardware-badge">${escapeHtml(
                    idea.hardware
                  )}</span>`
                : ""
            }
            ${
              idea.domain
                ? `<span class="domain-badge">${escapeHtml(idea.domain)}</span>`
                : ""
            }
          </div>
        </div>
        
        <div class="idea-description">
          <p>${formatDescription(idea.description)}</p>
        </div>
        
        <div class="idea-footer">
          <small class="idea-date">Saved on ${formatDate(
            idea.createdAt
          )}</small>
          <div class="idea-actions">
            <button class="view-btn" onclick="viewFullIdea('${idea.id}')">
              <i class="fas fa-eye"></i> View Full
            </button>
            <button class="copy-btn" onclick="copyIdeaText('${idea.id}')">
              <i class="fas fa-copy"></i> Copy
            </button>
            <button class="delete-btn" onclick="deleteIdea('${idea.id}')">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

function formatDescription(description, truncate = true) {
  if (!description) return "";
  let cleanDesc = description
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
  if (truncate && cleanDesc.length > 300) {
    cleanDesc = cleanDesc.substring(0, 300) + "...";
  }

  return cleanDesc;
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Unknown date";
  }
}

function viewFullIdea(ideaId) {
  const fullIdea = fullIdeasData[ideaId];
  if (!fullIdea) {
    console.error("Full idea data not found for ID:", ideaId);
    showToast("Error: Idea data not found", "error");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "idea-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${escapeHtml(fullIdea.title)}</h3>
        <button class="modal-close" onclick="closeModal(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="idea-meta-full">
          <span class="tech-badge">${escapeHtml(fullIdea.language)}</span>
          ${
            fullIdea.hardware
              ? `<span class="hardware-badge">${escapeHtml(
                  fullIdea.hardware
                )}</span>`
              : ""
          }
          ${
            fullIdea.domain
              ? `<span class="domain-badge">${escapeHtml(
                  fullIdea.domain
                )}</span>`
              : ""
          }
        </div>
        <div class="full-description">${formatDescription(
          fullIdea.description,
          false
        )}</div>
      </div>
      <div class="modal-actions">
        <button onclick="copyFullIdeaText('${ideaId}')" class="copy-btn">
          <i class="fas fa-copy"></i> Copy Full Text
        </button>
        <button onclick="closeModal(this)" class="close-btn">
          Close
        </button>
      </div>
    </div>
  `;

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
}

function closeModal(element) {
  const modal = element.closest(".idea-modal");
  if (modal) {
    modal.remove();
  }
}

function copyIdeaText(ideaId) {
  const fullIdea = fullIdeasData[ideaId];
  if (!fullIdea) {
    console.error("Full idea data not found for copying");
    showToast("Error: Idea data not found", "error");
    return;
  }

  const fullText = `${fullIdea.title}\n\n${fullIdea.description}`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showToast("Idea copied to clipboard!");
    })
    .catch((error) => {
      console.error("Copy failed:", error);
      showToast("Failed to copy to clipboard", "error");
    });
}

function copyFullIdeaText(ideaId) {
  const fullIdea = fullIdeasData[ideaId];
  if (!fullIdea) {
    console.error("Full idea data not found for copying");
    showToast("Error: Idea data not found", "error");
    return;
  }

  const fullText = `${fullIdea.title}\n\n${fullIdea.description}`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showToast("Full idea copied to clipboard!");
    })
    .catch((error) => {
      console.error("Copy failed:", error);
      showToast("Failed to copy to clipboard", "error");
    });
}

async function deleteIdea(ideaId) {
  if (
    !confirm(
      "Are you sure you want to remove this idea? This action cannot be undone."
    )
  ) {
    return;
  }

  const token = getAuthToken();
  if (!token) {
    alert("Authentication error. Please log in again.");
    return;
  }

  try {
    console.log("Deleting idea:", ideaId);

    const response = await fetch(`${API_BASE_URL}/api/ideas/delete/${ideaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Delete response:", data);

    if (data.success) {
      showToast("Idea removed successfully!");
      loadSavedIdeas();
    } else {
      throw new Error("Failed to delete idea");
    }
  } catch (error) {
    console.error("Error deleting idea:", error);
    showToast("Failed to remove idea: " + error.message, "error");
  }
}

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-${
        type === "success" ? "check-circle" : "exclamation-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#28a745" : "#dc3545"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  if (!document.querySelector("#toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .toast-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .idea-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
      }
      .modal-actions {
        margin-top: 15px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .copy-btn, .close-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .copy-btn {
        background: #007bff;
        color: white;
      }
      .close-btn {
        background: #6c757d;
        color: white;
      }
      .loading-state, .error-state, .no-ideas {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      .retry-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
