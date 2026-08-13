require("dotenv").config();

const fs = require("fs");
const express = require("express");
const cors = require("cors");

const pool = require("./db");
const investigateError = require("./services/aiInvestigator");
const generateFix = require("./services/fixGenerator");
const testFix = require("./services/fixTester");

const {
    createBranch,
    commitFix,
    createPullRequest
} = require("./services/githubService");

const app = express();

const PORT = 4000;

console.log(
    "Gemini API key loaded:",
    process.env.GEMINI_API_KEY ? "YES" : "NO"
);

app.use(cors());
app.use(express.json());


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {

    res.json({
        message: "CodePulse Backend is running!"
    });

});


// ==================================================
// SAVE ERROR
// ==================================================

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

        console.error(
            "Database error:",
            err
        );

        res.status(500).json({
            message: "Failed to save error"
        });

    }

});


// ==================================================
// GET ALL ERRORS
// ==================================================

app.get("/api/errors", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM errors ORDER BY created_at DESC"
        );

        res.json(result.rows);

    } catch (err) {

        console.error(
            "Database error:",
            err
        );

        res.status(500).json({
            message: "Failed to fetch errors"
        });

    }

});


// ==================================================
// AI INVESTIGATION
// ==================================================

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

        console.log(
            `🤖 Investigating error #${id}...`
        );

        const investigation =
            await investigateError(errorData);

        res.json({

            error: errorData,

            investigation: investigation

        });

    } catch (error) {

        console.error(
            "Investigation error:",
            error
        );

        res.status(500).json({
            message: "Investigation failed",
            error: error.message
        });

    }

});


// ==================================================
// AI FIX → TEST → GITHUB PULL REQUEST
// ==================================================

app.post("/api/fix/:id", async (req, res) => {

    try {

        const { id } = req.params;


        // --------------------------------------------------
        // 1. GET ERROR FROM DATABASE
        // --------------------------------------------------

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


        // --------------------------------------------------
        // 2. READ SOURCE CODE
        // --------------------------------------------------

        const sourceCode = fs.readFileSync(
            "C:\\CodePulse\\source-code\\student-api.js",
            "utf8"
        );


        // --------------------------------------------------
        // 3. GENERATE AI FIX
        // --------------------------------------------------

        console.log(
            "🤖 Generating AI fix..."
        );

        const fix = await generateFix(
            errorData,
            sourceCode
        );


        // --------------------------------------------------
        // 4. TEST AI FIX
        // --------------------------------------------------

        console.log(
            "🧪 Testing AI fix..."
        );

        const testResult = await testFix(
            fix.fixResponse
        );


        // --------------------------------------------------
        // 5. PREPARE GITHUB RESULT
        // --------------------------------------------------

        let pullRequest = null;


        // --------------------------------------------------
        // 6. ONLY SEND FIX TO GITHUB IF TEST PASSES
        // --------------------------------------------------

        if (testResult.success) {

            console.log(
                "✅ AI fix passed. Preparing GitHub..."
            );


            // Make sure the exact code that was tested
            // is the code sent to GitHub.

            const fixedCode =
                testResult.fixedCode;


            if (!fixedCode) {

                throw new Error(
                    "The automated test passed, but no tested fixed code was returned."
                );

            }


            // --------------------------------------------------
            // 7. CREATE GITHUB BRANCH
            // --------------------------------------------------

            const branchName =
                `codepulse/ai-fix-${id}-${Date.now()}`;

            await createBranch(
                branchName
            );


            // --------------------------------------------------
            // 8. COMMIT THE EXACT TESTED CODE
            // --------------------------------------------------

            await commitFix(
                branchName,
                "source-code/student-api.js",
                fixedCode,
                `AI fix for error #${id}`
            );


            // --------------------------------------------------
            // 9. CREATE PULL REQUEST
            // --------------------------------------------------

            pullRequest =
                await createPullRequest(

                    branchName,

                    `CodePulse AI Fix for Error #${id}`,

                    `This Pull Request was automatically generated by CodePulse.

The AI-generated code fix passed the automated test before being committed.

Please review the changes before merging.`
                );


        } else {

            console.log(
                "❌ AI fix failed testing."
            );

            console.log(
                "🚫 GitHub was NOT modified."
            );

        }


        // --------------------------------------------------
        // 10. SEND RESULT TO FRONTEND
        // --------------------------------------------------

        res.json({

            error: errorData,

            fix: fix,

            test: testResult,

            pullRequest: pullRequest

        });


    } catch (error) {

        console.error(
            "Fix generation error:",
            error
        );

        res.status(500).json({

            message: "Fix generation failed",

            error: error.message

        });

    }

});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log(
        `CodePulse backend running at http://localhost:${PORT}`
    );

});