document.addEventListener('DOMContentLoaded', () => {
    const generatorForm = document.getElementById('generator-form');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultCard = document.getElementById('result-card');
    const problemStatementElement = document.getElementById('problem-statement');
    const copyButton = document.getElementById('copy-button');
    const saveButton = document.getElementById('save-button');
    
    if (generatorForm) {
        generatorForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // Show loading state
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (resultCard) resultCard.style.display = 'none';
            
            // Gather form data
            const formData = {
                techStack: document.getElementById('tech-stack').value,
                hardware: document.getElementById('hardware').value,
                complexity: document.getElementById('complexity').value,
                domain: document.getElementById('domain').value,
                additionalInfo: document.getElementById('additional-info').value
            };
            
            // In a real application, this would be an API call
            // For demo purposes, we'll use a timeout to simulate processing
            setTimeout(() => {
                generateProblemStatement(formData);
                
                // Hide loading, show result
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (resultCard) resultCard.style.display = 'block';
                
                // Scroll to results
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            }, 1500);
        });
    }
    
    // Copy button handler
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const problemStatement = problemStatementElement.textContent;
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
    
    // Save button handler
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const problemStatement = problemStatementElement.textContent;
            
            // Get existing saved ideas from localStorage or initialize empty array
            const savedIdeas = JSON.parse(localStorage.getItem('savedIdeas') || '[]');
            
            // Check if this idea is already saved
            const isAlreadySaved = savedIdeas.some(idea => idea === problemStatement);
            
            if (isAlreadySaved) {
                showToast('This idea is already saved to your favorites');
                return;
            }
            
            // Add new idea to saved ideas
            savedIdeas.push(problemStatement);
            
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
    
    // Function to generate a problem statement based on form inputs
    function generateProblemStatement(formData) {
        // Demo statements for different tech stacks
        const statements = {
            "Web Development": [
                `Develop a ${formData.domain || 'community-focused'} web platform that helps users track and organize ${formData.additionalInfo || 'personal projects'}. Use modern frontend frameworks and implement real-time data synchronization.`,
                `Create a responsive web application for ${formData.domain || 'educational'} purposes that visualizes complex data sets and allows interactive exploration.`,
                `Build a progressive web app that works offline and helps users manage ${formData.domain || 'daily tasks'} with smart suggestions and reminders.`
            ],
            "Mobile App": [
                `Develop a cross-platform mobile app for ${formData.domain || 'health tracking'} that integrates with ${formData.hardware || 'wearable devices'} to provide personalized insights and recommendations.`,
                `Create a mobile application that uses augmented reality to help users ${formData.additionalInfo || 'learn about their environment'} in interactive ways.`,
                `Build a location-aware mobile app that helps users discover ${formData.domain || 'local events and activities'} based on their preferences and past behavior.`
            ],
            "Embedded Systems": [
                `Design and build an embedded system using ${formData.hardware || 'Arduino'} that monitors and optimizes ${formData.domain || 'home energy usage'} with automated controls and user notifications.`,
                `Create a smart ${formData.domain || 'gardening'} system with ${formData.hardware || 'sensors'} that monitors plant health and automates care routines based on environmental data.`,
                `Develop an embedded solution for ${formData.domain || 'security monitoring'} that uses low-power communication protocols and can operate for months on battery power.`
            ],
            "Machine Learning": [
                `Create a machine learning model that analyzes ${formData.domain || 'user behavior'} data to provide personalized recommendations and improve user experience.`,
                `Develop an image recognition system specialized for ${formData.domain || 'identifying plant diseases'} from smartphone photos, providing treatment recommendations.`,
                `Build a natural language processing application that helps users ${formData.additionalInfo || 'summarize and extract key information'} from lengthy documents or conversations.`
            ],
            "IoT": [
                `Design an IoT ecosystem using ${formData.hardware || 'ESP32 devices'} that creates a ${formData.domain || 'smart home'} environment with seamless device communication and intelligent automation.`,
                `Build a network of IoT sensors to monitor ${formData.domain || 'environmental conditions'} and provide early warnings for potential issues through a user-friendly dashboard.`,
                `Develop an IoT solution for ${formData.domain || 'retail spaces'} that tracks customer movement and provides analytics to optimize store layout and product placement.`
            ],
            "Blockchain": [
                `Create a blockchain-based system for ${formData.domain || 'supply chain tracking'} that ensures transparency and authenticity throughout the product journey.`,
                `Develop a decentralized application (dApp) that allows users to ${formData.additionalInfo || 'securely share and monetize their data'} without third-party intermediaries.`,
                `Build a blockchain solution for ${formData.domain || 'digital identity verification'} that gives users control over their personal information while providing secure authentication.`
            ],
            "Robotics": [
                `Design and build a robotic system using ${formData.hardware || 'Raspberry Pi'} that can ${formData.additionalInfo || 'navigate indoor environments'} and perform basic tasks autonomously.`,
                `Create a robotic assistant specialized for ${formData.domain || 'elderly care'} that can monitor health metrics and provide medication reminders.`,
                `Develop a robotic solution for ${formData.domain || 'educational purposes'} that teaches coding and engineering principles through interactive challenges.`
            ]
        };
        
        // If tech stack exists in our pre-written statements
        if (statements[formData.techStack]) {
            const options = statements[formData.techStack];
            let statement = options[Math.floor(Math.random() * options.length)];
            
            // Add complexity level
            switch(formData.complexity) {
                case 'Beginner':
                    statement += ` This project is suitable for beginners, focusing on fundamental concepts and basic implementation.`;
                    break;
                case 'Intermediate':
                    statement += ` At an intermediate difficulty level, this project will challenge you to integrate multiple components and implement more advanced features.`;
                    break;
                case 'Advanced':
                    statement += ` This advanced project will require sophisticated implementation techniques, system optimization, and handling complex user interactions.`;
                    break;
                case 'Research':
                    statement += ` This research-level project pushes beyond current implementations, requiring novel approaches and potentially contributing new knowledge to the field.`;
                    break;
            }
            
            // Update the DOM
            if (problemStatementElement) {
                problemStatementElement.textContent = statement;
            }
        } else {
            if (problemStatementElement) {
                problemStatementElement.textContent = `Please select a technology stack to generate a project idea.`;
            }
        }
    }
});