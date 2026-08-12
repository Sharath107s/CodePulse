const fs = require("fs");
const path = require("path");
const runTest = require("./studentApiTest");

async function testFix(fixResponse) {

    try {

        console.log("🧪 Preparing temporary test copy...");

        const originalFile = path.join(
            "C:\\CodePulse",
            "source-code",
            "student-api.js"
        );

        const testFile = path.join(
            "C:\\CodePulse",
            "source-code",
            "test-copy",
            "student-api.js"
        );

        // Read original source
        const originalCode = fs.readFileSync(
            originalFile,
            "utf8"
        );

        // Extract the fixed code from Gemini response
        const fixedCodeStart =
            fixResponse.indexOf("FIXED CODE:");

        if (fixedCodeStart === -1) {
            throw new Error(
                "Gemini response does not contain FIXED CODE"
            );
        }

        let fixedCode =
            fixResponse.substring(
                fixedCodeStart + "FIXED CODE:".length
            );

        // Remove everything after EXPLANATION
        const explanationStart =
            fixedCode.indexOf("EXPLANATION:");

        if (explanationStart !== -1) {
            fixedCode =
                fixedCode.substring(
                    0,
                    explanationStart
                );
        }

        // Remove markdown code fences
        fixedCode = fixedCode
            .replace(/```javascript/g, "")
            .replace(/```js/g, "")
            .replace(/```/g, "")
            .trim();

        if (!fixedCode) {
            throw new Error(
                "No fixed code was found"
            );
        }

        // Save fixed code to temporary copy
        fs.writeFileSync(
            testFile,
            fixedCode,
            "utf8"
        );

        console.log(
            "📋 AI fix written to temporary copy."
        );

        // Run automated test
        const result = await runTest();

        // Restore original temporary copy
        fs.writeFileSync(
            testFile,
            originalCode,
            "utf8"
        );

        console.log(
            "🔄 Temporary copy restored."
        );

        return {
            success: result === true,
            message:
                result === true
                    ? "✅ AI fix passed the automated test."
                    : "❌ AI fix failed the automated test.",
            details:
                result === true
                    ? "The fixed code produced the expected API behavior."
                    : "The fixed code did not produce the expected API behavior."
        };

    } catch (error) {

        console.error(
            "Fix testing error:",
            error
        );

        return {
            success: false,
            message: "❌ Fix testing failed.",
            details: error.message
        };
    }
}

module.exports = testFix;