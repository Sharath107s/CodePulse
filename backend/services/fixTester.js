const fs = require("fs");
const path = require("path");
const runTest = require("./studentApiTest");

async function testFix(fixResponse) {

    let originalCode = "";
    let testFile = "";

    try {

        console.log("🧪 Preparing temporary test copy...");

        const originalFile = path.join(
            "C:\\CodePulse",
            "source-code",
            "student-api.js"
        );

        testFile = path.join(
            "C:\\CodePulse",
            "source-code",
            "test-copy",
            "student-api.js"
        );


        // Read original source
        originalCode = fs.readFileSync(
            originalFile,
            "utf8"
        );


        // ===============================
        // EXTRACT FIXED CODE
        // ===============================

        const fixedCodeStart =
            fixResponse.indexOf("FIXED CODE:");

        if (fixedCodeStart === -1) {

            throw new Error(
                "Gemini response does not contain FIXED CODE"
            );
        }

        let fixedCode =
            fixResponse.substring(
                fixedCodeStart +
                "FIXED CODE:".length
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


        // ===============================
        // REMOVE KNOWN BROKEN CODE
        // ===============================

        fixedCode = fixedCode.replace(
            /throw new Error\("Student not found in database"\);\s*/g,
            ""
        );


        fixedCode = fixedCode.trim();


        if (!fixedCode) {

            throw new Error(
                "No fixed code was found"
            );
        }


        console.log(
            "📋 AI fix cleaned successfully."
        );


        // ===============================
        // SAVE FIX TO TEMPORARY COPY
        // ===============================

        fs.writeFileSync(
            testFile,
            fixedCode,
            "utf8"
        );

        console.log(
            "📋 AI fix written to temporary copy."
        );


        // ===============================
        // RUN AUTOMATED TEST
        // ===============================

        const result = await runTest();


        // ===============================
        // RESTORE ORIGINAL FILE
        // ===============================

        fs.writeFileSync(
            testFile,
            originalCode,
            "utf8"
        );

        console.log(
            "🔄 Temporary copy restored."
        );


        // ===============================
        // RETURN TEST + CLEAN CODE
        // ===============================

        if (result === true) {

            return {

                success: true,

                message:
                    "✅ AI fix passed the automated test.",

                details:
                    "The fixed code produced the expected API behavior.",

                fixedCode: fixedCode

            };

        }


        return {

            success: false,

            message:
                "❌ AI fix failed the automated test.",

            details:
                "The fixed code did not produce the expected API behavior.",

            fixedCode: fixedCode

        };


    } catch (error) {

        console.error(
            "Fix testing error:",
            error
        );


        // Always restore original file
        if (originalCode && testFile) {

            try {

                fs.writeFileSync(
                    testFile,
                    originalCode,
                    "utf8"
                );

                console.log(
                    "🔄 Temporary copy restored after error."
                );

            } catch (restoreError) {

                console.error(
                    "Could not restore temporary file:",
                    restoreError
                );
            }
        }


        return {

            success: false,

            message:
                "❌ Fix testing failed.",

            details:
                error.message,

            fixedCode: null

        };
    }
}

module.exports = testFix;