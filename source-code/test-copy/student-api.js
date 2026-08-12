const express = require("express");

const app = express();

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

app.get("/students/:id", (req, res) => {

    const studentId = Number(req.params.id);

    const student = students.find(
        (student) => student.id === studentId
    );

    if (!student) {
        throw new Error("Student not found in database");
    }

    res.json(student);
});

module.exports = app;