document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with:', email);

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Login Response:', result);

        if (response.ok && result.success) {
            console.log('=== LOGIN SUCCESS DEBUG ===');
            console.log('Token received:', result.token);
            console.log('User received:', result.user);
            
            // Store with consistent keys
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Verify storage immediately
            console.log('Stored authToken:', localStorage.getItem('authToken'));
            console.log('Stored user:', localStorage.getItem('user'));
            console.log('=== END LOGIN DEBUG ===');
            
            alert('Login successful!');
            window.location.href = 'profile.html';
        } else {
            console.error('Login failed:', result);
            alert(result.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('Connection error. Please make sure the server is running.');
    }
});