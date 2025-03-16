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
            range: 'J:S', // Check table data columns
        });

        const rows = response.data.values || [];
        let nextRow = rows.length + 2; // +2 to account for the header row and 1-based indexing

        return nextRow;
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

    // Row where personal data is stored
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
    
    // Add EEIGI data
    table2Data.forEach(row => {
        tableRows.push(["", "", "", "", "", "", "", "", "", row.code, row.quantity, "", "", "", "", "", "", "", "", ""]);
    });

    // Add CNTV data
    table3Data.forEach(row => {
        tableRows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", row.code, row.quantity, "", "", "", "", ""]);
    });

    // Add 024 data
    table4Data.forEach(row => {
        tableRows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", row.code, row.quantity, ""]);
    });

    if (tableRows.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `A${nextRow + 1}:T${nextRow + tableRows.length}`,
            valueInputOption: 'RAW',
            resource: { values: tableRows },
        });
    }

    console.log("Data successfully appended to the sheet!");
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