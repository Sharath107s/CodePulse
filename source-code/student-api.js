const express = require("express");

const app = express();

const CODEPULSE_URL = "http://localhost:4000";

// ==========================================
// STUDENT DATA
// ==========================================

const students = [
    {
        id: 1,
        name: "Rahul",
        department: "CSE"
    },
    {
        id: 2,
        name: "Priya",
        department: "ECE"
    },
    {
        id: 3,
        name: "Arun",
        department: "IT"
    }
];

// ==========================================
// GET STUDENT
// ==========================================

app.get("/students/:id", (req, res) => {

    const studentId = Number(req.params.id);

    const student = students.find(
        (student) => student.id === studentId
    );

    if (!student) {
        return res.status(404).json({
            error: "Student not found in database"
        });
    }

    res.json(student);
});

// ==========================================
// GET STUDENT NAME
// ==========================================

app.get("/student-name/:id", (req, res) => {

    const studentId = Number(req.params.id);

    const student = students.find(
        (student) => student.id === studentId
    );

    if (!student) {
        return res.status(404).json({
            error: "Student record unavailable"
        });
    }

    res.json({
        name: student.name
    });
});

// ==========================================
// CODEPULSE ERROR REPORTING
// ==========================================

app.use(async (err, req, res, next) => {

    console.error(
        "Application error:",
        err.message
    );

    try {

        await fetch(
            `${CODEPULSE_URL}/api/errors`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    endpoint: req.originalUrl,
                    method: req.method,
                    status: 500,
                    error: err.message,
                    stackTrace: err.stack
                })
            }
        );

        console.log(
            "🚨 Error reported to CodePulse"
        );

    } catch (reportError) {

        console.error(
            "⚠️ Failed to report error to CodePulse:",
            reportError.message
        );
    }

    res.status(500).json({
        error: err.message
    });
});

// ==========================================
// EXPORT
// ==========================================

module.exports = app;