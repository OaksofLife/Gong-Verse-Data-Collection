const CORRECT_PASSWORD = "secure123"; // Change this to your actual password

function checkPassword() {
    const enteredPassword = document.getElementById("password").value;
    if (enteredPassword === CORRECT_PASSWORD) {
        document.getElementById("password-screen").style.display = "none";
        document.getElementById("data-form").style.display = "block";
    } else {
        document.getElementById("error-message").innerText = "Incorrect password!";
    }
}

function submitData() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (name && email) {
        fetch("http://localhost:5000/submit", {  // Replace with actual backend URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("success-message").innerText = "Data submitted successfully!";
        })
        .catch(error => console.error("Error:", error));
    } else {
        alert("Please fill in all fields.");
    }
}
