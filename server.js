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

async function appendToSheet(data) {
    const nextRow = await getNextRow();
    if (!nextRow) {
        console.error("Failed to determine next row.");
        return;
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:A', // Fetch only column A (IDs)
    });
    
    const rows = response.data.values || [];
    // Filter out empty cells and get the last non-empty ID
    const validIds = rows.filter(row => row[0].trim() !== ""); // Removes empty or blank cells
    const lastId = validIds.length > 0 ? Number(validIds[validIds.length - 1][0]) : 1; // Get last ID or default to 0
    const newId = lastId + 1; // Increment ID

    let { name, idNumber, wallet, phone, service, leader, table2Data, table3Data, table4Data } = data;
    
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
            "", "", "", "", "", "", "", "", "", 
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