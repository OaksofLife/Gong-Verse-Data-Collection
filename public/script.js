const CORRECT_PASSWORD = "^3{-).4{[2,(0#8{4~5$";

function checkPassword() {
    const enteredPassword = document.getElementById("password").value;
    if (enteredPassword === CORRECT_PASSWORD) {
        document.getElementById("password-screen").style.display = "none";
        document.getElementById("data-form1").style.display = "block";
    } else {
        document.getElementById("error-message").innerText = "Incorrect password!";
    }
}

function nextStep() {
    const name = document.getElementById("name1").value;
    const id = document.getElementById("id1").value;
    const wallet = document.getElementById("wallet1").value;
    const phone = document.getElementById("phone1").value;
    const service = document.getElementById("service1").value;
    const leader = document.getElementById("leader1").value;

    if (name && id && wallet && phone && service && leader) {
        document.getElementById("data-form1").style.display = "none";
        document.getElementById("data-form2").style.display = "block";
    } else {
        document.getElementById("message1").innerText = "请填写所有字段";
    }
}

function submitData() {
    const name = document.getElementById("name2").value;
    const id = document.getElementById("id2").value;
    const wallet = document.getElementById("wallet2").value;
    const phone = document.getElementById("phone2").value;
    const service = document.getElementById("service2").value;
    const leader = document.getElementById("leader2").value;

    if (name && id && wallet && phone && service && leader) {
        fetch("https://gong-verse-data-collection.onrender.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, id, wallet, phone, service, leader })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("message2").innerText = "提交成功!";
        })
        .catch(error => console.error("Error:", error));
    } else {
        document.getElementById("message2").innerText = "请填写所有字段";
    }
}
