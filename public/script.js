const CORRECT_PASSWORD = "123456";

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
    const name = document.getElementById("name").value.trim();
    const idNumber = document.getElementById("id").value.trim();
    const wallet = document.getElementById("wallet").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value.trim();
    const leader = document.getElementById("leader").value.trim();

    // Custom length validations
    if (idNumber.length !== 18) {
        document.getElementById("message").innerText = "身份证号码必须为18个字符";
        return;
    }
    if (wallet.length !== 42) {
        document.getElementById("message").innerText = "钱包地址必须为42个字符";
        return;
    }

    // Check if all fields are filled
    if (name && idNumber && wallet && phone && service && leader) {
        document.getElementById("data-form1").style.display = "none";
        document.getElementById("data-form2").style.display = "block";
    } else {
        document.getElementById("message").innerText = "请填写所有字段";
    }
}

function updateSubtotal(formId) {
    let subtotal = 0;
    // Select only the quantity inputs in the current form (column2-2, column3-2, column4-2)
    document.querySelectorAll(`#${formId} input[type="number"]`).forEach(input => {
        let value = parseFloat(input.value) || 0;  // Convert the input value to a number, default to 0 if not valid
        subtotal += value;  // Add the valid value to the subtotal
    });

    // Update the subtotal display, add it under the table but above the next button
    const subtotalElement = document.querySelector(`#${formId} .subtotal`);
    if (subtotalElement) {
        subtotalElement.textContent = `小计: ${subtotal}`;
    } else {
        // If no subtotal element exists, create it and append it
        const subtotalParagraph = document.createElement("p");
        subtotalParagraph.classList.add("subtotal");
        subtotalParagraph.textContent = `小计: ${subtotal}`;
        const form = document.getElementById(formId);
        const nextButton = form.querySelector("button");
        form.insertBefore(subtotalParagraph, nextButton);
    }

    // Add margin to subtotal after inserting it
    const subtotalParagraph = document.querySelector(`#${formId} .subtotal`);
    subtotalParagraph.style.marginBottom = "20px"; // Make sure to apply marginBottom
}

// Attach event listeners when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners to dynamically update the subtotal
    document.querySelectorAll('[id^="data-table"]').forEach(table => {
        table.addEventListener("input", () => {
            const tableId = table.id;
            let subtotalId = '';
            
            if (tableId === 'data-table2') subtotalId = 'subtotal2';
            if (tableId === 'data-table3') subtotalId = 'subtotal3';
            if (tableId === 'data-table4') subtotalId = 'subtotal4';
            
            updateSubtotal(tableId, subtotalId);
        });
    });
});

function addRow(tableId, columnClass1, columnClass2) {
    const table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2); // Adding the cell for the "-" button

    cell1.innerHTML = `<input type="text" class="${columnClass1}" placeholder="证书编码">`;
    cell2.innerHTML = `<input type="number" class="${columnClass2}" placeholder="数量" min="0">`;
    cell3.innerHTML = `<button type="button" onclick="removeRow(this)">-</button>`;

    // Update subtotal after adding a new row
    const subtotalId = tableId === 'data-table2' ? 'subtotal2' : tableId === 'data-table3' ? 'subtotal3' : 'subtotal4';
    updateSubtotal(tableId, subtotalId);
}

function removeRow(button) {
    // Get the row that the button is in
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row); // Remove the row from the table

    // Update subtotal after removing a row
    const tableId = row.closest("table").id;
    const subtotalId = tableId === 'data-table2' ? 'subtotal2' : tableId === 'data-table3' ? 'subtotal3' : 'subtotal4';
    updateSubtotal(tableId, subtotalId);
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

function validateNumberInputs(tableId, columnClass) {
    let rows = document.querySelectorAll(`#${tableId} .${columnClass}`);
    for (let input of rows) {
        let value = input.value.trim();
        if (value && isNaN(value)) {
            return false;  // If any input is not a valid number
        }
    }
    return true;
}

// You can now use this validation function in the nextStep and nextStep2 functions:
function nextStep2() {
    if (!validateTableInputs("data-table2", "column2-1", "column2-2") || !validateNumberInputs("data-table2", "column2-2")) {
        document.getElementById("message2").innerText = "数量不能为空";
        return;
    }
    document.getElementById("data-form2").style.display = "none";
    document.getElementById("data-form3").style.display = "block";
}

function nextStep3() {
    if (!validateTableInputs("data-table3", "column3-1", "column3-2") || !validateNumberInputs("data-table3", "column3-2")) {
        document.getElementById("message3").innerText = "数量不能为空";
        return;
    }
    document.getElementById("data-form3").style.display = "none";
    document.getElementById("data-form4").style.display = "block";
}

function submitData() {
    if (!validateTableInputs("data-table4", "column4-1", "column4-2") || !validateNumberInputs("data-table4", "column4-2")) {
        document.getElementById("message4").innerText = "数量不能为空";
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
    addRow("姓名", document.getElementById("name").value);
    addRow("身份证号码", document.getElementById("id").value);
    addRow("钱包地址", document.getElementById("wallet").value);
    addRow("联系电话", document.getElementById("phone").value);
    addRow("所属服务中心号码", document.getElementById("service").value);
    addRow("所属负责人", document.getElementById("leader").value);

    // Retrieve and sum values from all three tables
    function getDataFromTable(tableId, columnClass1, columnClass2) {
        let rows = document.querySelectorAll(`#${tableId} tbody tr`);
        let data = [];
        
        rows.forEach(row => {
            let code = row.querySelector(`.${columnClass1}`).value.trim();
            let quantity = row.querySelector(`.${columnClass2}`).value.trim();
            
            if (code && quantity) {
                data.push({ code, quantity });
            }
        });
        
        return data;
    }

    // Get data from the three tables
    const table2Data = getDataFromTable("data-table2", "column2-1", "column2-2");
    const table3Data = getDataFromTable("data-table3", "column3-1", "column3-2");
    const table4Data = getDataFromTable("data-table4", "column4-1", "column4-2");

    // Function to create a table in the summary form
    function createTableWithData(title, data) {
        let section = document.createElement("div");
        section.innerHTML = `<h3>${title}</h3><table border="1"><thead><tr><th>证书编码</th><th>数量</th></tr></thead><tbody></tbody></table>`;
        
        const tableBody = section.querySelector("tbody");

        data.forEach(rowData => {
            let row = tableBody.insertRow();
            row.insertCell(0).innerText = rowData.code;
            row.insertCell(1).innerText = rowData.quantity;
        });

        document.getElementById("summary-form").insertBefore(section, document.getElementById("total-score").parentNode);
    }

    // Create tables for the three data sections
    if (table2Data.length > 0) createTableWithData("EIIGI积分统计", table2Data);
    if (table3Data.length > 0) createTableWithData("CNTV积分统计", table3Data);
    if (table4Data.length > 0) createTableWithData("024积分统计", table4Data);

    // Calculate total score
    let totalScore = table2Data.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0) +
                     table3Data.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0) +
                     table4Data.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0);

    document.getElementById("total-score").innerText = totalScore;
}


function finalSubmit() {
    // Ensure both checkboxes are checked before submission
    if (!document.getElementById("declaration1").checked || !document.getElementById("declaration2").checked) {
        alert("请勾选所有声明复选框以继续");
        return;
    }

    alert("您的身份证号码已经被递交使用，不能重复递交。请联系所属负责人，谢谢！");
    // Here, you can add the fetch request to submit the final data to your backend
}
