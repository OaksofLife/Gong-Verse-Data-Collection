const CORRECT_PASSWORD = "^3{-).4{[2,(0#8{4~5$";

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

    if (name) {
        fetch("https://gong-verse-data-collection.onrender.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("success-message").innerText = "";
        })
        .catch(error => console.error("Error:", error));
    } else {
        alert("请填写所有字段");
    }
}
