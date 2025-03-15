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

function nextStep2() {
    document.getElementById("data-form2").style.display = "none";
    document.getElementById("data-form3").style.display = "block";
}

function nextStep3() {
    document.getElementById("data-form3").style.display = "none";
    document.getElementById("data-form4").style.display = "block";
}

function addRow(tableId, columnClass1, columnClass2) {
    const table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);

    cell1.innerHTML = `<input type="text" class="${columnClass1}" placeholder="证书编码">`;
    cell2.innerHTML = `<input type="text" class="${columnClass2}" placeholder="数量">`;
}

function submitData() {
    const column2Data1 = Array.from(document.getElementsByClassName("column2-1")).map(input => input.value);
    const column2Data2 = Array.from(document.getElementsByClassName("column2-2")).map(input => input.value);
    
    const column3Data1 = Array.from(document.getElementsByClassName("column3-1")).map(input => input.value);
    const column3Data2 = Array.from(document.getElementsByClassName("column3-2")).map(input => input.value);
    
    const column4Data1 = Array.from(document.getElementsByClassName("column4-1")).map(input => input.value);
    const column4Data2 = Array.from(document.getElementsByClassName("column4-2")).map(input => input.value);

    if (
        column2Data1.some(value => value === "") || column2Data2.some(value => value === "") ||
        column3Data1.some(value => value === "") || column3Data2.some(value => value === "") ||
        column4Data1.some(value => value === "") || column4Data2.some(value => value === "")
    ) {
        document.getElementById("message4").innerText = "请填写所有字段";
        return;
    }

    fetch("https://gong-verse-data-collection.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            EIIGI: { column2Data1, column2Data2 },
            CNTV: { column3Data1, column3Data2 },
            _024: { column4Data1, column4Data2 }
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("message4").innerText = "提交成功!";
    })
    .catch(error => console.error("Error:", error));
}
