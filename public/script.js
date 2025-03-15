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

function addRow() {
    const table = document.getElementById("data-table").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);

    cell1.innerHTML = `<input type="text" class="column1" placeholder="输入内容">`;
    cell2.innerHTML = `<input type="text" class="column2" placeholder="输入内容">`;
}

function submitData() {
    const column1Data = Array.from(document.getElementsByClassName("column1")).map(input => input.value);
    const column2Data = Array.from(document.getElementsByClassName("column2")).map(input => input.value);

    if (column1Data.some(value => value === "") || column2Data.some(value => value === "")) {
        document.getElementById("message2").innerText = "请填写所有字段";
        return;
    }

    fetch("https://gong-verse-data-collection.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column1Data, column2Data })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("message2").innerText = "提交成功!";
    })
    .catch(error => console.error("Error:", error));
}
