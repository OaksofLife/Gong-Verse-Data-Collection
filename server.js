require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Load Google Sheets credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const SHEET_ID = "1OOBz2GyabPruLzoW6dirhG-l9NYYLgyJzUgqXFUJ8KM"; // Replace with your Google Sheet ID

async function accessSheet() {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc.sheetsByIndex[0]; // Access the first sheet
}

// Route to handle form submission
app.post("/submit", async (req, res) => {
    try {
        const { name, email } = req.body;
        const sheet = await accessSheet();

        await sheet.addRow({ Name: name, Email: email });

        res.json({ success: true, message: "Data added to Google Sheets!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Failed to add data" });
    }
});

// Route to serve the index.html file at the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
