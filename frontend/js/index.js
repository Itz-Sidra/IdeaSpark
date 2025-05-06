// Handle mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Check if user is logged in (for demo purposes)
    checkLoginStatus();

    // Testimonials slider
    setupTestimonialsSlider();
    
    // Initialize any other interactive elements
    setupAnimations();
});

// Check if user is logged in (for demo purposes)
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Update UI based on login status
    const authLinks = document.querySelectorAll('.auth-status');
    
    if (user) {
        // User is logged in
        authLinks.forEach(link => {
            if (link.classList.contains('logged-out')) {
                link.style.display = 'none';
            } else if (link.classList.contains('logged-in')) {
                link.style.display = 'block';
                
                // If there's a username placeholder, update it
                const username = link.querySelector('.username');
                if (username) {
                    username.textContent = user.name;
                }
            }
        });
    } else {
        // User is logged out
        authLinks.forEach(link => {
            if (link.classList.contains('logged-out')) {
                link.style.display = 'block';
            } else if (link.classList.contains('logged-in')) {
                link.style.display = 'none';
            }
        });
    }
}

// Setup testimonials slider
function setupTestimonialsSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    let currentIndex = 0;
    
    // Hide all testimonials except the first one
    testimonials.forEach((testimonial, index) => {
        if (index !== 0) {
            testimonial.style.display = 'none';
        }
    });
    
    // Function to show testimonial by index
    const showTestimonial = (index) => {
        // Hide all testimonials
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show selected testimonial and activate corresponding dot
        testimonials[index].style.display = 'block';
        dots[index].classList.add('active');
        currentIndex = index;
    };
    
    if (prevButton && nextButton && dots.length > 0) {
        // Previous button click
        prevButton.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = testimonials.length - 1;
            }
            showTestimonial(newIndex);
        });
        
        // Next button click
        nextButton.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= testimonials.length) {
                newIndex = 0;
            }
            showTestimonial(newIndex);
        });
        
        // Dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
        });
    }
}

// Setup animation effects
function setupAnimations() {
    // Add reveal animations when elements come into view
    const revealElements = document.querySelectorAll('.feature-card, .project-card, .pricing-card, .step-card');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Toast notification function
function showToast(message, type = 'success') {
    // Check if a toast already exists and remove it
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Append to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Make these functions available globally
window.logout = logout;
window.showToast = showToast;