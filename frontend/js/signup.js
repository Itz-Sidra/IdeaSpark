document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Attempting signup for:", email);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Signup Response:", data);

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              createdAt: data.user.createdAt,
            })
          );

          alert("Sign up successful! You are now logged in.");
          window.location.href = "profile.html";
        } else {
          alert("Sign up successful! Please log in.");
          window.location.href = "login.html";
        }
      } else {
        alert(`Error: ${data.error || "Could not create account"}`);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("An error occurred: " + error.message);
    }
  });
