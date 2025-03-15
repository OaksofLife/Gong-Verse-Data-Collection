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
        const { tables, checkboxes } = req.body;

        // Ensure both checkboxes are checked
        if (!checkboxes.checkbox1 || !checkboxes.checkbox2) {
            return res.status(400).json({ success: false, message: "Both checkboxes must be checked." });
        }

        const sheet = await accessSheet();

        // Loop through each table and add rows
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];

            // Add each row of the table to the sheet
            for (let row of table.rows) {
                await sheet.addRow({
                    表格编号: `表格 ${i + 1}`, // Table number
                    序号: row.index, // Row index (if applicable)
                    数量: row.quantity, // 数量 (Required input)
                    证书编码: row.certificate || "", // May be empty
                    小计: table.subtotal // Table subtotal
                });
            }

            // Add a blank row for spacing
            await sheet.addRow({});
        }

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
