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
            range: 'A:T', // Check the full range where data is stored
        });

        const rows = response.data.values || [];
        
        // Check each column that contains data and find the first completely empty row
        let lastRow = 1; // Start from row 1 (A1 has headers)
        for (let i = 9; i <= 19; i++) { // Columns J to T (Index 9 to 19 in array)
            let columnData = rows.map(row => row[i] || "").filter(cell => cell.trim() !== ""); 
            lastRow = Math.max(lastRow, columnData.length + 2); // +2 to account for 1-based index
        }

        return lastRow;
    } catch (error) {
        console.error('Error getting next row:', error);
        return null;
    }
}

async function appendToSheet(data) {
    const nextRow = await getNextRow();
    if (!nextRow) {
        console.error("Failed to determine next row.");
        return;
    }

    let { name, idNumber, wallet, phone, service, leader, table2Data, table3Data, table4Data } = data;

    // Calculate subtotals
    const subtotalTable2 = table2Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const subtotalTable3 = table3Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const subtotalTable4 = table4Data.reduce((sum, row) => sum + Number(row.quantity), 0);
    const totalPoints = subtotalTable2 + subtotalTable3 + subtotalTable4;

    // Create the first row with personal data
    let rowData = [
        [nextRow - 1, idNumber, name, wallet, totalPoints, phone, service, leader, "", "", "", subtotalTable2, "", "", "", subtotalTable3, "", "", "", subtotalTable4]
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${nextRow}:T${nextRow}`,
        valueInputOption: 'RAW',
        resource: { values: rowData },
    });

    let tableRows = [];
    
    let rowOffset = nextRow;

    // Add EEIGI data on the same row first, then expand downward if needed
    table2Data.forEach((row, index) => {
        tableRows.push([index === 0 ? "" : "", "", "", "", "", "", "", "", "", row.code, row.quantity, "", "", "", "", "", "", "", "", ""]);
    });

    // Add CNTV data on the same row first, then expand downward if needed
    table3Data.forEach((row, index) => {
        tableRows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", row.code, row.quantity, "", "", "", "", ""]);
    });

    // Add 024 data on the same row first, then expand downward if needed
    table4Data.forEach((row, index) => {
        tableRows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", row.code, row.quantity, ""]);
    });

    let lastUsedRow = rowOffset + Math.max(table2Data.length, table3Data.length, table4Data.length);

    if (tableRows.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `A${nextRow + 1}:T${lastUsedRow}`,
            valueInputOption: 'RAW',
            resource: { values: tableRows },
        });
    }

    await blackoutCells(nextRow, lastUsedRow);

    console.log("Data successfully appended to the sheet!");
}

async function blackoutCells(startRow, endRow) {
    const requests = [];

    for (let row = startRow; row <= endRow; row++) {
        for (let col = 0; col <= 19; col++) { // A:T = 0 to 19
            requests.push({
                repeatCell: {
                    range: {
                        sheetId: yourSheetId, // Replace with actual sheet ID
                        startRowIndex: row - 1, // 0-based index
                        endRowIndex: row,
                        startColumnIndex: col,
                        endColumnIndex: col + 1,
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: { red: 0, green: 0, blue: 0 } // Black background
                        }
                    },
                    fields: "userEnteredFormat.backgroundColor"
                }
            });
        }
    }

    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests },
        });
    } catch (error) {
        console.error("Error blacking out cells:", error);
    }
}

// API endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
    try {
        await appendToSheet(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing to Google Sheets:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});