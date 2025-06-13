document.addEventListener("DOMContentLoaded", () => {
  const generatorForm = document.getElementById("generator-form");
  const resultContainer = document.getElementById("result-container");
  const loadingSpinner = document.getElementById("loading-spinner");
  const resultCard = document.getElementById("result-card");
  const problemStatementElement = document.getElementById("problem-statement");
  const copyButton = document.getElementById("copy-button");
  const saveButton = document.getElementById("save-button");

  const API_BASE_URL = "";

  let currentGeneratedIdeas = null;
  let currentFormData = null;

  checkAuthStatus();

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  if (generatorForm) {
    generatorForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      try {
        if (loadingSpinner) loadingSpinner.style.display = "block";
        if (resultCard) resultCard.style.display = "none";

        const formData = {
          numberOfIdeas: parseInt(document.getElementById("number").value) || 1,
          techStack: document.getElementById("tech-stack").value,
          hardwareComponents: document.getElementById("hardware").value || "None",
          complexity: document.getElementById("complexity").value,
          domain: document.getElementById("domain").value || "",
          additionalRequirements: document.getElementById("additional-info").value || "",
        };

        currentFormData = formData;

        if (!formData.techStack || !formData.complexity) {
          throw new Error("Technology Stack and Complexity are required fields");
        }

        if (formData.numberOfIdeas < 1 || formData.numberOfIdeas > 5) {
          throw new Error("Number of ideas must be between 1 and 5");
        }

        console.log("Sending request with data:", formData);

        const response = await fetch(`${API_BASE_URL}/api/ai/generate-ideas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received response:", data);

        currentGeneratedIdeas = data.ideas;
        displayGeneratedIdeas(data);

        if (loadingSpinner) loadingSpinner.style.display = "none";
        if (resultCard) resultCard.style.display = "block";

        updateSaveButton();
        resultContainer.scrollIntoView({ behavior: "smooth" });

      } catch (error) {
        console.error("Error generating ideas:", error);
        if (loadingSpinner) loadingSpinner.style.display = "none";
        showErrorMessage(error.message);
      }
    });
  }

  function checkAuthStatus() {
    console.log("=== AUTH DEBUG ===");
    console.log("All localStorage keys:", Object.keys(localStorage));

    const authToken = localStorage.getItem("authToken");
    const token = localStorage.getItem("token");
    const jwt = localStorage.getItem("jwt");

    console.log("authToken:", authToken);
    console.log("token:", token);
    console.log("jwt:", jwt);

    const userStr = localStorage.getItem("user");
    console.log("user string:", userStr);

    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
      console.log("parsed user:", user);
    } catch (error) {
      console.error("Error parsing user:", error);
    }

    const finalToken = authToken || token || jwt;

    console.log("Final token to use:", !!finalToken);
    console.log("Final user to use:", !!user);
    console.log("=== END DEBUG ===");

    const authElements = document.querySelectorAll(".auth-status");
    authElements.forEach((element) => {
      if (finalToken && user) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    });

    updateSaveButton();
  }

  function updateSaveButton() {
    if (!saveButton) return;

    const token = getAuthToken();
    const user = getUserFromStorage();

    console.log("Updating save button - Token:", !!token, "User:", !!user);

    if (!token || !user) {
      saveButton.disabled = false; // FIXED: Enable button so it can be clicked
      saveButton.innerHTML = '<i class="fas fa-lock"></i> Login to Save';
      
      saveButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Login to save clicked");
        showToast("Please login to save ideas", "error");
        setTimeout(() => {
          window.location.href = "../html/login.html";
        }, 1500);
      };
    } else {
      if (!currentGeneratedIdeas || !currentFormData) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Generate Ideas First';
        saveButton.onclick = null;
      } else {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save to Favorites';
        saveButton.onclick = handleSaveIdeas;
      }
    }
  }

  function getAuthToken() {
    return localStorage.getItem("authToken") || 
           localStorage.getItem("token") || 
           localStorage.getItem("jwt");
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

  async function handleSaveIdeas(e) {
    e.preventDefault();
    e.stopPropagation();

    const token = getAuthToken();
    const user = getUserFromStorage();

    console.log("Save button clicked - Token:", !!token, "User:", !!user);

    if (!token || !user) {
      showToast("Please login to save ideas", "error");
      setTimeout(() => {
        window.location.href = "../html/login.html";
      }, 1500);
      return;
    }

    if (!currentGeneratedIdeas || !currentFormData) {
      showToast("No ideas to save. Please generate ideas first.", "error");
      return;
    }

    try {
      const originalText = saveButton.innerHTML;
      saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveButton.disabled = true;

      const savePromises = currentGeneratedIdeas.map(async (idea, index) => {
        const title = extractTitleFromContent(idea.content, index);

        const saveData = {
          title: title,
          description: idea.content,
          language: currentFormData.techStack,
          hardware: currentFormData.hardwareComponents === "None" ? null : currentFormData.hardwareComponents,
          domain: currentFormData.domain || null,
        };

        console.log("Saving idea:", saveData);

        const response = await fetch(`${API_BASE_URL}/api/ideas/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(saveData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save idea ${index + 1}`);
        }

        return await response.json();
      });

      const savedIdeas = await Promise.all(savePromises);
      const ideaCount = savedIdeas.length;
      
      showToast(`Successfully saved ${ideaCount} idea${ideaCount > 1 ? "s" : ""} to your profile!`);

      saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
      setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
      }, 2000);

    } catch (error) {
      console.error("Save error:", error);
      showToast(`Failed to save ideas: ${error.message}`, "error");

      const originalText = '<i class="fas fa-save"></i> Save to Favorites';
      saveButton.innerHTML = originalText;
      saveButton.disabled = false;
    }
  }

  function displayGeneratedIdeas(data) {
    if (data.success && data.ideas && data.ideas.length > 0) {
      let displayContent = "";

      if (data.ideas.length === 1) {
        displayContent = cleanupIdeaContent(data.ideas[0].content);
      } else {
        displayContent = data.ideas
          .map((idea, index) => {
            let cleanContent = cleanupIdeaContent(idea.content);
            return `**Project Idea ${index + 1}:**\n\n${cleanContent}`;
          })
          .join("\n\n" + "=".repeat(50) + "\n\n");
      }
      
      if (problemStatementElement) {
        const formattedContent = formatMarkdownForDisplay(displayContent);
        problemStatementElement.innerHTML = formattedContent;
      }
    } else {
      throw new Error("No ideas were generated. Please try again.");
    }
  }

  function cleanupIdeaContent(content) {
    return content
      .replace(/^(PROJECT IDEA \d+:|IDEA \d+:|\*\*PROJECT IDEA \d+:\*\*|\*\*IDEA \d+:\*\*)\s*/i, "")
      .replace(/^([^*\n]+)\*\*\s*/gm, "$1")
      .replace(/\*\*\s*$/gm, "")
      .replace(/\*\*(?!\s*[^*\n]+\s*\*\*)/g, "")
      .trim();
  }

  function formatMarkdownForDisplay(text) {
    let formattedText = text
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\*\*([^*\n]+(?:\n[^*\n]*)*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+):\*/g, "<strong>$1:</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(/^\* (.+)$/gm, "<li>$1</li>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^• (.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      .replace(/^---+$/gm, "<hr>")
      .replace(/^___+$/gm, "<hr>")
      .replace(/^===+$/gm, "<hr>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\n\n+/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      .replace(/(<li>.*?<\/li>)(<br>)?/gs, (match, listItem) => listItem)
      .replace(/(<li>.*?<\/li>)(\s*<br>\s*<li>.*?<\/li>)*/gs, (match) => {
        return "<ul>" + match.replace(/<br>/g, "") + "</ul>";
      })
      .replace(/<p><\/p>/g, "")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<p>(\s*<(?:h[1-6]|ul|ol|hr)[^>]*>.*?<\/(?:h[1-6]|ul|ol)>\s*)<\/p>/gs, "$1")
      .replace(/<p>(\s*<hr>\s*)<\/p>/gs, "$1")
      .replace(/(<\/(?:h[1-6]|ul|ol|hr)>)\s*<br>/g, "$1")
      .replace(/<br>\s*(<(?:h[1-6]|ul|ol|hr))/g, "$1")
      .replace(/(<br>\s*){3,}/g, "<br><br>")
      .replace(/\*\*/g, "");

    return formattedText;
  }

  function showErrorMessage(message) {
    if (problemStatementElement) {
      problemStatementElement.innerHTML = `
        <div style="color: #dc3545; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; background-color: #f8d7da;">
          <strong>Error:</strong> ${message}
          <br><br>
          <small>Please check your internet connection and try again. If the problem persists, the server might be down.</small>
        </div>
      `;
    }

    if (resultCard) resultCard.style.display = "block";
    showToast(message, "error");
  }

  if (copyButton) {
    copyButton.addEventListener("click", () => {
      const problemStatement = problemStatementElement.textContent || problemStatementElement.innerText;

      navigator.clipboard.writeText(problemStatement)
        .then(() => {
          showToast("Copied to clipboard!");
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied';
          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          showToast("Failed to copy to clipboard", "error");
        });
    });
  }

  function extractTitleFromContent(content, index) {
    const titleMatch = content.match(/\*\*Project Title:\*\*\s*(.+?)(?:\n|$)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    const titleMatch2 = content.match(/\*\*Title:\*\*\s*(.+?)(?:\n|$)/i);
    if (titleMatch2) {
      return titleMatch2[1].trim();
    }

    const boldMatch = content.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      return boldMatch[1].trim();
    }

    const projectMatch = content.match(/(?:Project|Idea):\s*(.+?)(?:\n|$)/i);
    if (projectMatch) {
      return projectMatch[1].trim();
    }

    const firstLine = content.split("\n")[0].trim();
    const cleanFirstLine = firstLine
      .replace(/^\*\*|\*\*$/g, "")
      .replace(/^\*|\*$/g, "")
      .replace(/^#+\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/^-\s*/, "")
      .trim();

    if (cleanFirstLine && cleanFirstLine.length > 5 && cleanFirstLine.length <= 100) {
      return cleanFirstLine;
    }

    const meaningfulContent = content.replace(/\*\*/g, "").replace(/^\s*/, "").trim();

    if (meaningfulContent.length <= 50) {
      return meaningfulContent;
    }

    let title = meaningfulContent.substring(0, 50);
    const lastSpace = title.lastIndexOf(" ");
    const lastPeriod = title.lastIndexOf(".");
    const lastComma = title.lastIndexOf(",");

    const breakPoint = Math.max(lastPeriod, lastComma, lastSpace);
    if (breakPoint > 20) {
      title = title.substring(0, breakPoint);
    }

    if (title.length < meaningfulContent.length && !title.endsWith(".")) {
      title += "...";
    }

    return title || `Generated Project Idea ${index + 1}`;
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
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
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

  async function testAPIConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        console.log("Backend connection successful");
      } else {
        console.warn("Backend responded but with error status:", response.status);
      }
    } catch (error) {
      console.warn("Backend connection failed:", error.message);
      console.warn("Make sure your backend server is running on http://localhost:5000");
    }
  }

  testAPIConnection();
});