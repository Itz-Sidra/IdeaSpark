document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with:', email);  // Log without password for security

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            // credentials: 'include' // Include cookies for cookie-based auth
        });

        console.log('Response status:', response.status); // Log HTTP status
        
        const result = await response.json();
        console.log('Login Response:', result); // Log response data

        if (response.ok) {
            // Save the token from backend response
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify({
                email: email,
                // Don't store sensitive info like passwords in localStorage
            }));
            alert('Login successful!');
            window.location.href = 'profile.html';
        } else {
            alert(result.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('Connection error. Please make sure the server is running.');
    }
});