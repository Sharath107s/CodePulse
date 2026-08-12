require("dotenv").config();
const fs = require("fs");
console.log(
  "Gemini API key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const investigateError = require("./services/aiInvestigator");
const generateFix = require("./services/fixGenerator");
const testFix = require("./services/fixTester");

const app = express();

const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "CodePulse Backend is running!"
    });
});

app.post("/api/errors", async (req, res) => {

    const {
        endpoint,
        method,
        status,
        error,
        stackTrace
    } = req.body;

    try {

        const result = await pool.query(
            `INSERT INTO errors
            (endpoint, method, status, error, stack_trace)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                endpoint,
                method,
                status,
                error,
                stackTrace
            ]
        );

        res.json({
            message: "Error saved successfully",
            error: result.rows[0]
        });

    } catch (err) {

        console.error("Database error:", err);

        res.status(500).json({
            message: "Failed to save error"
        });
    }
});

app.get("/api/errors", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM errors ORDER BY created_at DESC"
        );

        res.json(result.rows);

    } catch (err) {
        console.error("Database error:", err);

        res.status(500).json({
            message: "Failed to fetch errors"
        });
    }
});

app.post("/api/investigate/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM errors WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Error not found"
            });
        }

        const errorData = result.rows[0];

        const investigation = await investigateError(errorData);

        res.json({
            error: errorData,
            investigation: investigation
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Investigation failed"
        });
    }
});
app.post("/api/fix/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM errors WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Error not found"
            });
        }

        const errorData = result.rows[0];
        const sourceCode = fs.readFileSync(
    "C:\\CodePulse\\source-code\\student-api.js",
    "utf8"
);

       


        const fix = await generateFix(
            errorData,
            sourceCode
        );

        const testResult = await testFix(
            fix.fixResponse
        );

        res.json({
            error: errorData,
            fix: fix,
            test: testResult
        });

    } catch (error) {

        console.error("Fix generation error:", error);

        res.status(500).json({
            message: "Fix generation failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`CodePulse backend running at http://localhost:${PORT}`);
});