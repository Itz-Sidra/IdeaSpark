document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  checkLoginStatus();
  setupTestimonialsSlider();
  setupAnimations();
});

function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const authLinks = document.querySelectorAll(".auth-status");

  if (user) {
    authLinks.forEach((link) => {
      if (link.classList.contains("logged-out")) {
        link.style.display = "none";
      } else if (link.classList.contains("logged-in")) {
        link.style.display = "block";

        const username = link.querySelector(".username");
        if (username) {
          username.textContent = user.name;
        }
      }
    });
  } else {
    authLinks.forEach((link) => {
      if (link.classList.contains("logged-out")) {
        link.style.display = "block";
      } else if (link.classList.contains("logged-in")) {
        link.style.display = "none";
      }
    });
  }
}

function setupTestimonialsSlider() {
  const testimonials = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  const prevButton = document.querySelector(".prev-testimonial");
  const nextButton = document.querySelector(".next-testimonial");
  let currentIndex = 0;

  testimonials.forEach((testimonial, index) => {
    if (index !== 0) {
      testimonial.style.display = "none";
    }
  });

  const showTestimonial = (index) => {
    testimonials.forEach((testimonial) => {
      testimonial.style.display = "none";
    });

    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    testimonials[index].style.display = "block";
    dots[index].classList.add("active");
    currentIndex = index;
  };

  if (prevButton && nextButton && dots.length > 0) {
    prevButton.addEventListener("click", () => {
      let newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = testimonials.length - 1;
      }
      showTestimonial(newIndex);
    });

    nextButton.addEventListener("click", () => {
      let newIndex = currentIndex + 1;
      if (newIndex >= testimonials.length) {
        newIndex = 0;
      }
      showTestimonial(newIndex);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showTestimonial(index);
      });
    });
  }
}

function setupAnimations() {
  const revealElements = document.querySelectorAll(
    ".feature-card, .project-card, .pricing-card, .step-card"
  );

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("revealed");
    });
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fa-solid ${
          type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

window.logout = logout;
window.showToast = showToast;
