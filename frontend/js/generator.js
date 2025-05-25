document.addEventListener('DOMContentLoaded', () => {
    const generatorForm = document.getElementById('generator-form');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultCard = document.getElementById('result-card');
    const problemStatementElement = document.getElementById('problem-statement');
    const copyButton = document.getElementById('copy-button');
    const saveButton = document.getElementById('save-button');
    
    // API Configuration
    const API_BASE_URL = 'http://localhost:5000';
    
    if (generatorForm) {
        generatorForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            try {
                // Show loading state
                if (loadingSpinner) loadingSpinner.style.display = 'block';
                if (resultCard) resultCard.style.display = 'none';
                
                // Gather form data
                const formData = {
                    numberOfIdeas: parseInt(document.getElementById('number').value) || 1,
                    techStack: document.getElementById('tech-stack').value,
                    hardwareComponents: document.getElementById('hardware').value || 'None',
                    complexity: document.getElementById('complexity').value,
                    domain: document.getElementById('domain').value || '',
                    additionalRequirements: document.getElementById('additional-info').value || ''
                };
                
                // Validate required fields
                if (!formData.techStack || !formData.complexity) {
                    throw new Error('Technology Stack and Complexity are required fields');
                }
                
                if (formData.numberOfIdeas < 1 || formData.numberOfIdeas > 5) {
                    throw new Error('Number of ideas must be between 1 and 5');
                }
                
                console.log('Sending request with data:', formData);
                
                // Make API call to backend
                const response = await fetch(`${API_BASE_URL}/api/ai/generate-ideas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                // Check if response is ok
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                
                // Parse response
                const data = await response.json();
                console.log('Received response:', data);
                
                // Update UI with generated ideas
                displayGeneratedIdeas(data);
                
                // Hide loading, show result
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (resultCard) resultCard.style.display = 'block';
                
                // Scroll to results
                resultContainer.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Error generating ideas:', error);
                
                // Hide loading spinner
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                
                // Show error message
                showErrorMessage(error.message);
            }
        });
    }
    
    // Function to display generated ideas in the UI
    function displayGeneratedIdeas(data) {
        if (data.success && data.ideas && data.ideas.length > 0) {
            // For multiple ideas, we'll display them all
            let displayContent = '';
            
            if (data.ideas.length === 1) {
                displayContent = data.ideas[0].content;
            } else {
                // If multiple ideas, format them nicely
                displayContent = data.ideas.map((idea, index) => {
                    return `**Idea ${index + 1}:**\n\n${idea.content}`;
                }).join('\n\n---\n\n');
            }
            
            // Update the problem statement element
            if (problemStatementElement) {
                // Convert markdown-style formatting to HTML for better display
                const formattedContent = formatMarkdownForDisplay(displayContent);
                problemStatementElement.innerHTML = formattedContent;
            }
        } else {
            throw new Error('No ideas were generated. Please try again.');
        }
    }
    
    // Function to format markdown-style text for HTML display
    function formatMarkdownForDisplay(text) {
        return text
            // Bold text **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Bullet points * text -> <li>text</li>
            .replace(/^\*\s(.+)$/gm, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            // Wrap in paragraphs
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            // Handle lists
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            // Clean up empty paragraphs
            .replace(/<p><\/p>/g, '')
            // Handle horizontal rules
            .replace(/---/g, '<hr>');
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
        
        if (resultCard) resultCard.style.display = 'block';
        showToast(message, 'error');
    }
    
    // Copy button handler
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            // Get the text content (without HTML formatting)
            const problemStatement = problemStatementElement.textContent || problemStatementElement.innerText;
            
            navigator.clipboard.writeText(problemStatement)
                .then(() => {
                    showToast('Copied to clipboard!');
                    
                    // Visual feedback
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied';
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    showToast('Failed to copy to clipboard', 'error');
                });
        });
    }
    
    // Save button handler (keeping localStorage for now, but you could modify this to use your API)
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const problemStatement = problemStatementElement.textContent || problemStatementElement.innerText;
            
            // Get existing saved ideas from localStorage or initialize empty array
            const savedIdeas = JSON.parse(localStorage.getItem('savedIdeas') || '[]');
            
            // Check if this idea is already saved
            const isAlreadySaved = savedIdeas.some(idea => idea === problemStatement);
            
            if (isAlreadySaved) {
                showToast('This idea is already saved to your favorites');
                return;
            }
            
            // Add new idea to saved ideas
            savedIdeas.push({
                content: problemStatement,
                timestamp: new Date().toISOString(),
                id: Date.now() // Simple ID generation
            });
            
            // Save back to localStorage
            localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
            
            // Show success message
            showToast('Saved to favorites!');
            
            // Visual feedback
            const originalText = saveButton.innerHTML;
            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
            
            setTimeout(() => {
                saveButton.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Toast notification function
    function showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
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
            toast.style.animation = 'slideOut 0.3s ease-in';
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
                console.log('✅ Backend connection successful');
            } else {
                console.warn('⚠️ Backend responded but with error status:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ Backend connection failed:', error.message);
            console.warn('Make sure your backend server is running on http://localhost:5000');
        }
    }
});