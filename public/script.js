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

function addRow(tableId, columnClass1, columnClass2) {
    const table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2); // Adding the cell for the "-" button

    cell1.innerHTML = `<input type="text" class="${columnClass1}" placeholder="证书编码">`;
    cell2.innerHTML = `<input type="text" class="${columnClass2}" placeholder="数量">`;

    // Only add the "-" button to rows that are not the first row
    if (table.rows.length > 1) { // Check if the row is not the first row
        cell3.innerHTML = `<button type="button" class="remove-btn">-</button>`;
        const removeButton = cell3.querySelector('.remove-btn');
        removeButton.addEventListener('click', function() {
            removeRow(this);
        });
    }
}

// Call this function to remove the "-" button from the first row when the page loads
function removeMinusButtonFromFirstRow() {
    const table = document.getElementById("data-table2").getElementsByTagName("tbody")[0];
    if (table.rows.length > 0) {
        const firstRow = table.rows[0];
        const removeButtonCell = firstRow.cells[2]; // Get the cell containing the "-" button
        if (removeButtonCell) {
            removeButtonCell.innerHTML = ""; // Remove the button from the first row
        }
    }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", function() {
    removeMinusButtonFromFirstRow(); // Ensure the first row doesn't have the "-" button initially
});

function removeRow(button) {
    // Get the row that the button is in
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row); // Remove the row from the table
}


function validateTableInputs(tableId, columnClass1, columnClass2) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tbody")[0].rows;
    
    // Check if the first row is empty
    const isFirstRowEmpty = rows[0] && rows[0].querySelector(`.${columnClass1}`).value.trim() === "" &&
                            rows[0].querySelector(`.${columnClass2}`).value.trim() === "";

    // Check if there are any additional rows
    const hasAdditionalRows = rows.length > 1;

    // If there are additional rows, ensure that the first row is not empty
    if (hasAdditionalRows && isFirstRowEmpty) {
        return false; // Block proceeding if the first row is empty and additional rows are added
    }

    // If any rows are added, ensure all rows are fully filled
    for (let row of rows) {
        const inputs = row.querySelectorAll(`.${columnClass1}, .${columnClass2}`);
        let rowEmpty = true;
        
        // Check if the row is fully filled
        for (let input of inputs) {
            if (input.value.trim() !== "") {
                rowEmpty = false;
            }
        }

        // If any row is partially filled (even if the first row is empty), block the user
        if (rowEmpty) {
            return false; // Block if any row is not fully filled
        }
    }

    // Allow proceeding if all rows are fully filled
    return true;
}

function nextStep2() {
    if (!validateTableInputs("data-table2", "column2-1", "column2-2")) {
        document.getElementById("message2").innerText = "请完整填写所有字段，或保持原始行为空";
        return;
    }
    document.getElementById("data-form2").style.display = "none";
    document.getElementById("data-form3").style.display = "block";
}

function nextStep3() {
    if (!validateTableInputs("data-table3", "column3-1", "column3-2")) {
        document.getElementById("message3").innerText = "请完整填写所有字段，或保持原始行为空";
        return;
    }
    document.getElementById("data-form3").style.display = "none";
    document.getElementById("data-form4").style.display = "block";
}

function submitData() {
    if (!validateTableInputs("data-table4", "column4-1", "column4-2")) {
        document.getElementById("message4").innerText = "请完整填写所有字段，或保持原始行为空";
        return;
    }

    document.getElementById("data-form4").style.display = "none";
    document.getElementById("summary-form").style.display = "block";

    const summaryTable = document.getElementById("summary-table").getElementsByTagName("tbody")[0];
    summaryTable.innerHTML = ""; // Clear previous entries

    function addRow(label, value) {
        let row = summaryTable.insertRow();
        row.insertCell(0).innerText = label;
        row.insertCell(1).innerText = value;
    }

    // Add personal details
    addRow("姓名", document.getElementById("name1").value);
    addRow("身份证号码", document.getElementById("id1").value);
    addRow("钱包地址", document.getElementById("wallet1").value);
    addRow("联系电话", document.getElementById("phone1").value);
    addRow("所属服务中心号码", document.getElementById("service1").value);
    addRow("所属负责人", document.getElementById("leader1").value);

    // Retrieve and sum values from all three tables
    function getSumFromTable(tableId, columnClass) {
        let inputs = document.querySelectorAll(`#${tableId} .${columnClass}`);
        return Array.from(inputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
    }

    let totalScore = getSumFromTable("data-table2", "column2-2") +
                     getSumFromTable("data-table3", "column3-2") +
                     getSumFromTable("data-table4", "column4-2");

    document.getElementById("total-score").innerText = totalScore;
}

function finalSubmit() {
    // Ensure both checkboxes are checked before submission
    if (!document.getElementById("declaration1").checked || !document.getElementById("declaration2").checked) {
        alert("请勾选所有声明复选框以继续");
        return;
    }

    alert("数据已成功提交！");
    // Here, you can add the fetch request to submit the final data to your backend
}
