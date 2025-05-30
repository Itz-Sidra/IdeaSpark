document.addEventListener("DOMContentLoaded", () => {
  const generatorForm = document.getElementById("generator-form");
  const resultContainer = document.getElementById("result-container");
  const loadingSpinner = document.getElementById("loading-spinner");
  const resultCard = document.getElementById("result-card");
  const problemStatementElement = document.getElementById("problem-statement");
  const copyButton = document.getElementById("copy-button");
  const saveButton = document.getElementById("save-button");

  // API Configuration
  const API_BASE_URL = "http://localhost:5000";

  // Store current generated ideas globally for saving
  let currentGeneratedIdeas = null;
  let currentFormData = null;

  // Check authentication status
  checkAuthStatus();

  // Hamburger menu functionality
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
        // Show loading state
        if (loadingSpinner) loadingSpinner.style.display = "block";
        if (resultCard) resultCard.style.display = "none";

        // Gather form data
        const formData = {
          numberOfIdeas: parseInt(document.getElementById("number").value) || 1,
          techStack: document.getElementById("tech-stack").value,
          hardwareComponents:
            document.getElementById("hardware").value || "None",
          complexity: document.getElementById("complexity").value,
          domain: document.getElementById("domain").value || "",
          additionalRequirements:
            document.getElementById("additional-info").value || "",
        };

        // Store form data globally for saving
        currentFormData = formData;

        // Validate required fields
        if (!formData.techStack || !formData.complexity) {
          throw new Error(
            "Technology Stack and Complexity are required fields"
          );
        }

        if (formData.numberOfIdeas < 1 || formData.numberOfIdeas > 5) {
          throw new Error("Number of ideas must be between 1 and 5");
        }

        console.log("Sending request with data:", formData);

        // Make API call to backend
        const response = await fetch(`${API_BASE_URL}/api/ai/generate-ideas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Check if response is ok
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        // Parse response
        const data = await response.json();
        console.log("Received response:", data);

        // Store generated ideas globally for saving
        currentGeneratedIdeas = data.ideas;

        // Update UI with generated ideas
        displayGeneratedIdeas(data);

        // Hide loading, show result
        if (loadingSpinner) loadingSpinner.style.display = "none";
        if (resultCard) resultCard.style.display = "block";

        // Update save button after ideas are generated
        updateSaveButton();

        // Scroll to results
        resultContainer.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Error generating ideas:", error);

        // Hide loading spinner
        if (loadingSpinner) loadingSpinner.style.display = "none";

        // Show error message
        showErrorMessage(error.message);
      }
    });
  }

  // Function to check authentication status
  // Debug version of checkAuthStatus function
function checkAuthStatus() {
  // Debug: Log all localStorage keys
  console.log("=== AUTH DEBUG ===");
  console.log("All localStorage keys:", Object.keys(localStorage));
  
  // Check different possible token keys
  const authToken = localStorage.getItem("authToken");
  const token = localStorage.getItem("token");
  const jwt = localStorage.getItem("jwt");
  
  console.log("authToken:", authToken);
  console.log("token:", token);
  console.log("jwt:", jwt);
  
  // Check user
  const userStr = localStorage.getItem("user");
  console.log("user string:", userStr);
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
    console.log("parsed user:", user);
  } catch (error) {
    console.error("Error parsing user:", error);
  }

  // Use whichever token exists
  const finalToken = authToken || token || jwt;
  
  console.log("Final token to use:", !!finalToken);
  console.log("Final user to use:", !!user);
  console.log("=== END DEBUG ===");

  // Update navigation based on auth status
  const authElements = document.querySelectorAll(".auth-status");
  authElements.forEach((element) => {
    if (finalToken && user) {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });

  // Update save button based on auth status
  updateSaveButton(finalToken, user);
}

// Updated updateSaveButton to accept parameters
function updateSaveButton(token, user) {
  const saveButton = document.getElementById('save-button');
  if (!saveButton) return;

  if (!token || !user) {
    // User not authenticated
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-lock"></i> Login to Save';
    saveButton.onclick = () => {
      showToast("Please login to save ideas", "error");
      setTimeout(() => {
        window.location.href = '../pages/login.html';
      }, 1500);
    };
  } else {
    // User is authenticated
    saveButton.disabled = false;
    saveButton.innerHTML = '<i class="fas fa-save"></i> Save to Favorites';
    
    // Remove the onclick and use the event listener instead
    saveButton.onclick = null;
    
    // Check if ideas are available
    if (!currentGeneratedIdeas || !currentFormData) {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fas fa-save"></i> Generate Ideas First';
    }
  }
}

  // Function to update save button based on auth status
  function updateSaveButton() {
    if (!saveButton) return;

    const token = localStorage.getItem("authToken");
    const user = getUserFromStorage();

    if (!token || !user) {
      // User not authenticated
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fas fa-lock"></i> Login to Save';
      saveButton.onclick = () => {
        showToast("Please login to save ideas", "error");
        // Optional: redirect to login page
        setTimeout(() => {
          window.location.href = '../pages/login.html';
        }, 1500);
      };
    } else {
      // User is authenticated
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save to Favorites';
      
      // Remove the onclick and use the event listener instead
      saveButton.onclick = null;
      
      // Check if ideas are available
      if (!currentGeneratedIdeas || !currentFormData) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Generate Ideas First';
      }
    }
  }

  // Function to get user from storage
  function getUserFromStorage() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from storage:", error);
      return null;
    }
  }

  // Function to display generated ideas in the UI
  function displayGeneratedIdeas(data) {
    if (data.success && data.ideas && data.ideas.length > 0) {
      // For multiple ideas, we'll display them all
      let displayContent = "";

      if (data.ideas.length === 1) {
        displayContent = data.ideas[0].content;
      } else {
        // If multiple ideas, format them nicely
        displayContent = data.ideas
          .map((idea, index) => {
            return `**Idea ${index + 1}:**\n\n${idea.content}`;
          })
          .join("\n\n---\n\n");
      }

      // Update the problem statement element
      if (problemStatementElement) {
        // Convert markdown-style formatting to HTML for better display
        const formattedContent = formatMarkdownForDisplay(displayContent);
        problemStatementElement.innerHTML = formattedContent;
      }
    } else {
      throw new Error("No ideas were generated. Please try again.");
    }
  }

  // Function to format markdown-style text for HTML display
  function formatMarkdownForDisplay(text) {
    return (
      text
        // Bold text **text** -> <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Bullet points * text -> <li>text</li>
        .replace(/^\*\s(.+)$/gm, "<li>$1</li>")
        // Line breaks
        .replace(/\n\n/g, "</p><p>")
        // Wrap in paragraphs
        .replace(/^/, "<p>")
        .replace(/$/, "</p>")
        // Handle lists
        .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, "")
        // Handle horizontal rules
        .replace(/---/g, "<hr>")
    );
  }

  // Function to show error messages
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

  // Copy button handler
  if (copyButton) {
    copyButton.addEventListener("click", () => {
      // Get the text content (without HTML formatting)
      const problemStatement =
        problemStatementElement.textContent ||
        problemStatementElement.innerText;

      navigator.clipboard
        .writeText(problemStatement)
        .then(() => {
          showToast("Copied to clipboard!");

          // Visual feedback
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

  // Updated save button handler - saves to database
  if (saveButton) {
    saveButton.addEventListener("click", async (e) => {
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();

      const token = localStorage.getItem("authToken");
      const user = getUserFromStorage();

      console.log("Save button clicked - Token:", !!token, "User:", !!user);

      if (!token || !user) {
        showToast("Please login to save ideas", "error");
        setTimeout(() => {
          window.location.href = '../pages/login.html';
        }, 1500);
        return;
      }

      if (!currentGeneratedIdeas || !currentFormData) {
        showToast("No ideas to save. Please generate ideas first.", "error");
        return;
      }

      try {
        // Show loading state on button
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveButton.disabled = true;

        // If multiple ideas, save each one separately
        const savePromises = currentGeneratedIdeas.map(async (idea, index) => {
          // Extract title from the idea content (first line or first few words)
          const title = extractTitleFromContent(idea.content, index);

          const saveData = {
            title: title,
            description: idea.content,
            language: currentFormData.techStack,
            hardware:
              currentFormData.hardwareComponents === "None"
                ? null
                : currentFormData.hardwareComponents,
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
            throw new Error(
              errorData.error || `Failed to save idea ${index + 1}`
            );
          }

          return await response.json();
        });

        // Wait for all ideas to be saved
        const savedIdeas = await Promise.all(savePromises);

        // Show success message
        const ideaCount = savedIdeas.length;
        showToast(
          `Successfully saved ${ideaCount} idea${
            ideaCount > 1 ? "s" : ""
          } to your profile!`
        );

        // Reset button
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        setTimeout(() => {
          saveButton.innerHTML = originalText;
          saveButton.disabled = false;
        }, 2000);
      } catch (error) {
        console.error("Save error:", error);
        showToast(`Failed to save ideas: ${error.message}`, "error");

        // Reset button
        const originalText = '<i class="fas fa-save"></i> Save to Favorites';
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
      }
    });
  }

  // Function to extract title from idea content
  function extractTitleFromContent(content, index) {
    // Try to find a title pattern like "**Project Title:** Something"
    const titleMatch = content.match(/\*\*Project Title:\*\*\s*(.+?)(?:\n|$)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Try to find other title patterns like "**Title:** Something"
    const titleMatch2 = content.match(/\*\*Title:\*\*\s*(.+?)(?:\n|$)/i);
    if (titleMatch2) {
      return titleMatch2[1].trim();
    }

    // Try to find any bold text at the beginning (likely a title)
    const boldMatch = content.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      return boldMatch[1].trim();
    }

    // Try to find patterns like "Project: Something" or "Idea: Something"
    const projectMatch = content.match(/(?:Project|Idea):\s*(.+?)(?:\n|$)/i);
    if (projectMatch) {
      return projectMatch[1].trim();
    }

    // Fallback: use first line or first 50 characters
    const firstLine = content.split("\n")[0].trim();

    // Clean up any markdown formatting from the first line
    const cleanFirstLine = firstLine
      .replace(/^\*\*|\*\*$/g, "") // Remove bold markers
      .replace(/^\*|\*$/g, "") // Remove italic markers
      .replace(/^#+\s*/, "") // Remove heading markers
      .replace(/^\d+\.\s*/, "") // Remove numbered list markers
      .replace(/^-\s*/, "") // Remove bullet point markers
      .trim();

    // If the cleaned first line is reasonable length, use it
    if (
      cleanFirstLine &&
      cleanFirstLine.length > 5 &&
      cleanFirstLine.length <= 100
    ) {
      return cleanFirstLine;
    }

    // If first line is too short or too long, extract first 50 meaningful characters
    const meaningfulContent = content
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/^\s*/, "") // Remove leading whitespace
      .trim();

    if (meaningfulContent.length <= 50) {
      return meaningfulContent;
    }

    // Find a good breaking point (end of sentence or word)
    let title = meaningfulContent.substring(0, 50);
    const lastSpace = title.lastIndexOf(" ");
    const lastPeriod = title.lastIndexOf(".");
    const lastComma = title.lastIndexOf(",");

    // Use the latest breaking point that makes sense
    const breakPoint = Math.max(lastPeriod, lastComma, lastSpace);
    if (breakPoint > 20) {
      // Only use breaking point if it's not too early
      title = title.substring(0, breakPoint);
    }

    // Add ellipsis if we truncated
    if (title.length < meaningfulContent.length && !title.endsWith(".")) {
      title += "...";
    }

    // Final fallback: generic title with index
    return title || `Generated Project Idea ${index + 1}`;
  }

  // Toast notification function
  function showToast(message, type = "success") {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
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

    // Add styles
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

    // Add animation styles if not already present
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

    // Add to page
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Test API connection on page load (optional)
  testAPIConnection();

  async function testAPIConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        console.log("✅ Backend connection successful");
      } else {
        console.warn(
          "⚠️ Backend responded but with error status:",
          response.status
        );
      }
    } catch (error) {
      console.warn("⚠️ Backend connection failed:", error.message);
      console.warn(
        "Make sure your backend server is running on http://localhost:5000"
      );
    }
  }
});