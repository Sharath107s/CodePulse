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

Your job is to identify the problem and create a safe code fix.

Return your answer using exactly these sections:

ROOT CAUSE:
Explain the coding problem.

PROBLEMATIC CODE:
Show the exact code that should be changed.

FIXED CODE:
Return the COMPLETE corrected source code.

EXPLANATION:
Explain why the new code fixes the problem.

IMPORTANT:
- The FIXED CODE section must contain the COMPLETE source file.
- Do not return partial code.
- Do not omit any existing code.
- Do not invent files, functions, variables, or code that are not needed.
- Preserve all existing functionality.
- Only make the changes necessary to fix the reported error.
- The complete fixed source code must be valid JavaScript.
- Do not use markdown code fences inside FIXED CODE.
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
        throw new Error("Gemini returned an empty fix");
    }

    return {
        fixResponse: text
    };
}

module.exports = generateFix;