const request = require("supertest");

async function runTest() {
    try {
        const appPath = require.resolve(
            "../../source-code/test-copy/student-api"
        );

        // Remove previously loaded version from Node cache
        delete require.cache[appPath];

        const app = require(
            "../../source-code/test-copy/student-api"
        );

        const response = await request(app)
            .get("/students/999");

        console.log(
            "Status received:",
            response.status
        );

        if (response.status === 404) {
            console.log("✅ TEST PASSED");

            return true;
        }

        console.log("❌ TEST FAILED");
        console.log("Expected: 404");
        console.log(
            "Received:",
            response.status
        );

        return false;

    } catch (error) {

        console.error(
            "Test execution error:",
            error.message
        );

        return false;
    }
}

module.exports = runTest;