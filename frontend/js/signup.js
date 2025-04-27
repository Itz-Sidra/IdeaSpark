document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Password validation
    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    console.log('Attempting signup for:', email);

    try {
        // Send a POST request to the backend API
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            }),
            // credentials: 'include' // Include cookies for cookie-based auth
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Signup Response:', data);

        if (response.ok) {
            alert('Sign up successful! Please log in.');
            window.location.href = 'login.html';
        } else {
            alert(`Error: ${data.error || 'Could not create account'}`);
        }
    } catch (error) {
        console.error('Signup Error:', error);
        alert('An error occurred: ' + error.message);
    }
});