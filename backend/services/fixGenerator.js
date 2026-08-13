async function generateFix(errorData, sourceCode) {

    const prompt = `
You are CodePulse, an AI coding engineer.

A backend application has produced an error.

ERROR INFORMATION:

Endpoint:
${errorData.endpoint}

Method:
${errorData.method}

Status:
${errorData.status}

Error:
${errorData.error}

Stack Trace:
${errorData.stack_trace || "Not available"}

SOURCE CODE:

${sourceCode}

Your job is to identify the problem and produce a corrected version of the source code.

CRITICAL RULE:

The FIXED CODE must completely replace the original source code.

If the original code contains a statement that causes the error, REMOVE that statement completely.

DO NOT keep the broken statement together with the replacement.

For example, if the original code is:

if (!student) {
    throw new Error("Student not found");
}

and the correct behavior is to return HTTP 404, the fixed code MUST be:

if (!student) {
    return res.status(404).json({
        error: "Student not found"
    });
}

It MUST NOT contain both "throw new Error" and "return res.status".

Return your answer using exactly these sections:

ROOT CAUSE:
Explain the coding problem.

PROBLEMATIC CODE:
Show the original code that causes the problem.

FIXED CODE:
Provide the COMPLETE corrected source file.
Remove the broken code completely.
Do not include markdown code fences.

EXPLANATION:
Explain why the corrected code fixes the problem.

IMPORTANT:

- Do not invent files.
- Do not invent unrelated code.
- Preserve existing functionality.
- The FIXED CODE must be executable JavaScript.
- The FIXED CODE must be a complete replacement for the provided source code.
- Remove unreachable code.
- Never leave a throw statement immediately before code that is supposed to execute.
- If you replace an existing statement, completely remove the old statement.
- Do not include ROOT CAUSE, PROBLEMATIC CODE, or EXPLANATION inside the FIXED CODE section.
`;

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },

            body: JSON.stringify({
                model: "gemini-3.6-flash",
                input: prompt,
                store: false
            })
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Gemini Fix Generator Error: ${errorText}`
        );
    }

    const data = await response.json();

    const outputStep = data.steps?.find(
        step => step.type === "model_output"
    );

    const text = outputStep?.content?.find(
        item => item.type === "text"
    )?.text;

    if (!text) {
        throw new Error(
            "Gemini returned an empty fix"
        );
    }

    return {
        fixResponse: text
    };
}

module.exports = generateFix;