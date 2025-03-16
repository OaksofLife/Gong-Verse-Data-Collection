const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');

// Set up your express server
const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Load the credentials from the environment variable
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);  // Fetch credentials from environment variable

// Set up OAuth2 client
const { client_email, private_key } = credentials;
const auth = new google.auth.JWT(client_email, null, private_key, ['https://www.googleapis.com/auth/spreadsheets']);

// Google Sheets ID (Replace with your Google Sheets ID)
const spreadsheetId = 'your-google-sheet-id';

// Google Sheets API setup
const sheets = google.sheets({ version: 'v4', auth });

// Function to append data to Google Sheets
async function appendToSheet(data) {
    const range = 'Sheet1!A:F'; // Update to your desired range
    const valueInputOption = 'RAW';

    const resource = {
        values: [
            [data.name, data.id, data.wallet, data.phone, data.service, data.leader]
        ],
    };

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption,
            resource,
        });
        console.log('Data successfully appended to the sheet!');
    } catch (error) {
        console.error('Error writing to Google Sheets:', error);
    }
}

// Endpoint to handle form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body;

    // Call function to append data to Google Sheets
    appendToSheet(formData);

    res.status(200).send('Form data submitted successfully!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
