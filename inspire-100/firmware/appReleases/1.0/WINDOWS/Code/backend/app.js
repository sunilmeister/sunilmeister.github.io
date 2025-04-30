require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const cors = require("cors");
const excel = require("exceljs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Verify secret key
const verifySecret = (hashedSecret) => {
  const storedHash = crypto
    .createHash("sha256")
    .update(process.env.SECRET_KEY)
    .digest("hex");
  return hashedSecret === storedHash;
};

// Create firmware_installations table if it doesn't exist
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
            CREATE TABLE IF NOT EXISTS firmware_installations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                system_uid VARCHAR(100) NOT NULL,
                firmware_version VARCHAR(50) NOT NULL,
                installation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verification_status BOOLEAN NOT NULL
            )
        `);
    connection.release();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Record firmware installation
app.post("/api/firmware-installation", async (req, res) => {
  const { system_uid, firmware_version, verification_status, secret } =
    req.body;

  // Validate required fields
  if (
    !system_uid ||
    !firmware_version ||
    verification_status === undefined ||
    !secret
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Verify secret
  if (!verifySecret(secret)) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO firmware_installations (system_uid, firmware_version, verification_status) VALUES (?, ?, ?)",
      [system_uid, firmware_version, verification_status]
    );
    connection.release();

    const installation = {
      id: result.insertId,
      system_uid,
      firmware_version,
      verification_status
    };

    res.status(201).json({
      message: "Firmware installation recorded successfully",
      data: installation
    });
  } catch (error) {
    console.error("Error recording firmware installation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get firmware installation history
app.get("/api/firmware-installation/:system_uid", async (req, res) => {
  const { system_uid } = req.params;
  const { secret } = req.body;

  // Verify secret
  if (!secret || !verifySecret(secret)) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  try {
    const connection = await pool.getConnection();
    const [installations] = await connection.query(
      "SELECT * FROM firmware_installations WHERE system_uid = ? ORDER BY installation_timestamp DESC",
      [system_uid]
    );
    connection.release();

    res.json({ data: installations });
  } catch (error) {
    console.error("Error fetching firmware installations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Welcome route
app.get("/", (req, res) => {
  res.render("home");
});

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to render the table view
app.get("/view-installations", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM firmware_installations"
    );
    connection.release();

    res.render("table", { data: rows });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to download data as Excel
app.get("/download-excel", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM firmware_installations"
    );
    connection.release();

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Firmware Installations");

    // Add headers
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "System UID", key: "system_uid", width: 30 },
      { header: "Firmware Version", key: "firmware_version", width: 20 },
      {
        header: "Installation Timestamp",
        key: "installation_timestamp",
        width: 25
      },
      { header: "Verification Status", key: "verification_status", width: 20 }
    ];

    // Add rows
    rows.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        system_uid: row.system_uid,
        firmware_version: row.firmware_version,
        installation_timestamp: row.installation_timestamp,
        verification_status: row.verification_status
          ? "Verified"
          : "Not Verified"
      });
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=firmware_installations.xlsx"
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Internal server error");
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
