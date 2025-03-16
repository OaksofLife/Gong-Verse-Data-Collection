const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const bodyParser = require('body-parser');

// Set up your express server
const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Load the credentials from the environment variable
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);  // Fetch credentials from environment variable

// Set up OAuth2 client
const { client_email, private_key } = credentials;
const auth = new google.auth.JWT(client_email, null, private_key, ['https://www.googleapis.com/auth/spreadsheets']);

// Google Sheets ID (Replace with your Google Sheets ID)
const spreadsheetId = '1OOBz2GyabPruLzoW6dirhG-l9NYYLgyJzUgqXFUJ8KM';

// Google Sheets API setup
const sheets = google.sheets({ version: 'v4', auth });

async function getNextRow() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'A:T',
        });

        const rows = response.data.values || [];

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) { // Start from row 1 (excluding headers)
            const row = rows[rowIndex] || []; // Handle undefined rows
            const isRowEmpty = row.slice(9, 20).every(cell => !cell || cell.trim() === ""); // Check J to T
            
            if (isRowEmpty) return rowIndex + 1; // Convert to 1-based index
        }

        return rows.length + 1; // If no empty row found, return the next available row
    } catch (error) {
        console.error('Error getting next row:', error);
        return null;
    }
}

// Function to check for duplicate certificate codes
async function checkForDuplicates(newCodes, columnRange) {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: columnRange });
    
    // Filter out "(无证书编码)" from existing codes
    const existingCodes = new Set((response.data.values || []).flat().filter(code => code !== "(无证书编码)"));
    
    // Filter out empty strings and "(无证书编码)" from the new codes
    const filteredNewCodes = newCodes.filter(code => code !== "(无证书编码)" && code !== "");

    // Return any new codes that are duplicates
    return filteredNewCodes.filter(code => existingCodes.has(code));
}

async function appendToSheet(data) {
    const nextRow = await getNextRow();
    let { name, idNumber, wallet, phone, service, leader, table2Data, table3Data, table4Data } = data;

    if (!nextRow) {
        console.error("Failed to determine next row.");
        return;
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:A', // Fetch only column A (IDs)
    });
    
    // Fetch existing values in columns B, J, N, and R
    const responseB = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'B:B', // Fetch column B
    });
    const responseJ = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'J:J', // Fetch column J
    });
    const responseN = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'N:N', // Fetch column N
    });
    const responseR = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'R:R', // Fetch column R
    });

    
    const rows = response.data.values || [];
    // Filter out empty cells and get the last non-empty ID
    const validIds = rows.filter(row => row[0].trim() !== ""); // Removes empty or blank cells
    const lastId = validIds.length > 0 ? Number(validIds[validIds.length - 1][0]) : 0; // Get last ID or default to 0
    const newId = lastId ? lastId + 1 : 1; // Increment ID

    // Extract new codes from user input
    const newCodesB = [idNumber];
    const newCodesJ = table2Data.map(row => row.code);
    const newCodesN = table3Data.map(row => row.code);
    const newCodesR = table4Data.map(row => row.code);

    // Use the checkForDuplicates function
    const duplicatesB = await checkForDuplicates(newCodesB, 'B:B');
    const duplicatesJ = await checkForDuplicates(newCodesJ, 'J:J');
    const duplicatesN = await checkForDuplicates(newCodesN, 'N:N');
    const duplicatesR = await checkForDuplicates(newCodesR, 'R:R');


    // If any duplicates are found, return an error
    if (duplicatesJ.length > 0 || duplicatesN.length > 0 || duplicatesR.length > 0) {
        console.error('Duplicate entries detected:', { duplicatesB, duplicatesJ, duplicatesN, duplicatesR });
        throw new Error(`提交失败：以下证书编码已存在: 
        ${duplicatesB.length > 0 ? `\n身份证号码错误: ${duplicatesB.join(", ")}` : ""}
        ${duplicatesJ.length > 0 ? `\nEEIGI证书编号错误: ${duplicatesJ.join(", ")}` : ""}
        ${duplicatesN.length > 0 ? `\nCNTV证书编号错误: ${duplicatesN.join(", ")}` : ""}
        ${duplicatesR.length > 0 ? `\n024证书编号错误: ${duplicatesR.join(", ")}` : ""}
        `);
    }
    
    // Calculate subtotals
    const subtotalTable2 = table2Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const subtotalTable3 = table3Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const subtotalTable4 = table4Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const totalPoints = subtotalTable2 + subtotalTable3 + subtotalTable4;

    // Row where personal data is stored
    let rowData = [
        [newId, idNumber, name, wallet, totalPoints, phone, service, leader, "", table2Data[0]?.code || "", table2Data[0]?.quantity || "", subtotalTable2, "", table3Data[0]?.code || "", table3Data[0]?.quantity || "", subtotalTable3, "", table4Data[0]?.code || "", table4Data[0]?.quantity || "", subtotalTable4]
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${nextRow}:T${nextRow}`,
        valueInputOption: 'RAW',
        resource: { values: rowData },
    });

    let tableRows = [];
    
    const maxLength = Math.max(table2Data.length, table3Data.length, table4Data.length); // Find the maximum length of all tables

    // Iterate through each row index and collect data from all tables for that index
    for (let i = 1; i < maxLength; i++) {
        let row = [
            newId, "", "", "", "", "", "", "", "", 
            table2Data[i]?.code || "", table2Data[i]?.quantity || "", "", "",
            table3Data[i]?.code || "", table3Data[i]?.quantity || "", "", "",
            table4Data[i]?.code || "", table4Data[i]?.quantity || "", ""
        ];
        tableRows.push(row);
    }

    if (tableRows.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `A${nextRow + 1}:T${nextRow + tableRows.length}`,
            valueInputOption: 'RAW',
            resource: { values: tableRows },
        });
    }
/*
    // Create an array to track empty cells and set them to black
let blackCells = [];
rowData[0].forEach((cell, index) => {
    if (!cell) { // If the cell is empty
        blackCells.push({
            updateCells: {
                range: {
                    sheetId: 0, // Replace with your sheet's ID
                    startRowIndex: nextRow - 1,
                    endRowIndex: nextRow,
                    startColumnIndex: index,
                    endColumnIndex: index + 1
                },
                rows: [{
                    values: [{
                        userEnteredFormat: {
                            backgroundColor: { red: 205, green: 205, blue: 205 } // Light grey color
                        }
                    }]
                }],
                fields: "userEnteredFormat.backgroundColor"
            }
        });
    }
});

tableRows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        if (!cell) { // If the cell is empty
            blackCells.push({
                updateCells: {
                    range: {
                        sheetId: 0, // Replace with your sheet's ID
                        startRowIndex: nextRow + rowIndex,
                        endRowIndex: nextRow + rowIndex + 1,
                        startColumnIndex: colIndex,
                        endColumnIndex: colIndex + 1
                    },
                    rows: [{
                        values: [{
                            userEnteredFormat: {
                                backgroundColor: { red: 205, green: 205, blue: 205 } // Light grey color
                            }
                        }]
                    }],
                    fields: "userEnteredFormat.backgroundColor"
                }
            });
        }
    });
});

// Batch update the background color of empty cells
if (blackCells.length > 0) {
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: blackCells
        }
    });
}
*/
    console.log("Data successfully appended to the sheet!");
}

// API endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
    try {
        await appendToSheet(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing to Google Sheets:', error);
        res.status(400).json({ success: false, error: error.message }); // Send error as a response
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});