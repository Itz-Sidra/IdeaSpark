document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Logging in with:', email, password);  // Debugging line

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log('Login Response:', result); // Debugging line

        if (response.ok) {
            // Save the token from backend response
            localStorage.setItem('token', result.token); // Use 'token' instead of 'accessToken'
            alert('Login successful!');
            window.location.href = 'profile.html'; // Redirect to the profile page after login
        } else {
            alert(result.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login Error:', error); // Log error details
        alert('Error: ' + error.message); // Error handling
    }
});
