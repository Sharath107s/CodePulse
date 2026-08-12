const fs = require("fs");
const path = require("path");

async function investigateError(errorData) {
  // Read the sample application's source code
  let sourceCode = "Source code not available.";

  try {
    const sourcePath = path.join(
      __dirname,
      "../../sample-app/server.js"
    );

    sourceCode = fs.readFileSync(sourcePath, "utf8");
  } catch (err) {
    console.error("Could not read source code:", err.message);
  }

  const prompt = `
You are CodePulse, an AI backend debugging engineer.

Investigate this backend error.

========================
ERROR INFORMATION
========================

Endpoint: ${errorData.endpoint}
Method: ${errorData.method}
Status: ${errorData.status}
Error: ${errorData.error}
Stack Trace: ${errorData.stack_trace || "Not available"}

========================
SOURCE CODE
========================

${sourceCode}

========================
YOUR TASK
========================

Using BOTH the error information and the source code above, answer using EXACTLY this format.

ROOT CAUSE:
Explain the technical reason for the error.

EXPLANATION:
Explain it in simple words.

AFFECTED CODE:
Identify the function or code block responsible.

SUGGESTED SOLUTION:
Explain how to fix it.

FIXED CODE:
Return ONLY the corrected code that should replace the buggy section.

Do not invent files that are not shown.
Only suggest changes supported by the provided source code.
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: "gemini-3.6-flash",
        input: prompt,
        store: false,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();

  const outputStep = data.steps?.find(
    (step) => step.type === "model_output"
  );

  const text = outputStep?.content?.find(
    (item) => item.type === "text"
  )?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return {
    aiResponse: text,
  };
}

module.exports = investigateError;