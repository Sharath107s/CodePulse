import { useState } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:4000";

function App() {
    const [loading, setLoading] = useState(false);
    const [investigation, setInvestigation] = useState(null);
    const [fix, setFix] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [pullRequest, setPullRequest] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const errorData = {
        id: 1,
        endpoint: "/students/999",
        method: "GET",
        status: 500,
        error: "Student not found in database",
        stack_trace: "Error: Student not found in database",
    };

    // ==================================================
    // AI INVESTIGATION
    // ==================================================

    const investigateError = async () => {
        setLoading(true);
        setInvestigation(null);
        setErrorMessage("");

        try {
            const response = await fetch(
                `${BACKEND_URL}/api/investigate/1`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Investigation failed"
                );
            }

            setInvestigation(data.investigation);

        } catch (error) {

            console.error(
                "Investigation error:",
                error
            );

            setErrorMessage(
                "Could not connect to CodePulse backend."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // AI CODE FIX
    // ==================================================

    const generateFix = async () => {

        setLoading(true);
        setFix(null);
        setTestResult(null);
        setPullRequest(null);
        setErrorMessage("");

        try {

            const response = await fetch(
                `${BACKEND_URL}/api/fix/1`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Fix generation failed"
                );

            }

            setFix(data.fix);

            setTestResult(data.test);

            setPullRequest(
                data.pullRequest
            );

        } catch (error) {

            console.error(
                "Fix generation error:",
                error
            );

            setErrorMessage(
                "Could not generate the AI fix."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // GET PULL REQUEST URL
    // ==================================================

    const getPullRequestUrl = () => {

        if (!pullRequest) {
            return null;
        }

        if (typeof pullRequest === "string") {
            return pullRequest;
        }

        return (
            pullRequest.html_url ||
            pullRequest.url ||
            pullRequest.web_url ||
            null
        );
    };


    const pullRequestUrl =
        getPullRequestUrl();


    return (
        <div className="app">

            {/* HEADER */}

            <header className="header">

                <div>

                    <h1>⚡ CodePulse</h1>

                    <p>
                        AI-Powered Error Investigation & Auto-Fix
                    </p>

                </div>

                <div className="status">

                    <span className="status-dot"></span>

                    Backend

                </div>

            </header>


            {/* MAIN */}

            <main className="container">


                {/* ERROR CARD */}

                <section className="error-card">

                    <div className="error-top">

                        <div className="status-code">
                            {errorData.status}
                        </div>

                        <div className="error-title">

                            <h2>
                                {errorData.error}
                            </h2>

                            <p>
                                {errorData.method}{" "}
                                {errorData.endpoint}
                            </p>

                        </div>

                    </div>


                    <hr />


                    <div className="error-details">

                        <div>

                            <span>ERROR</span>

                            <strong>
                                {errorData.error}
                            </strong>

                        </div>


                        <div>

                            <span>METHOD</span>

                            <strong>
                                {errorData.method}
                            </strong>

                        </div>


                        <div>

                            <span>STATUS</span>

                            <strong>
                                {errorData.status}
                            </strong>

                        </div>

                    </div>


                    {/* INVESTIGATION BUTTON */}

                    <button
                        className="investigate-button"
                        onClick={investigateError}
                        disabled={loading}
                    >

                        {loading
                            ? "🔄 Investigating..."
                            : "🔍 Investigate Error"}

                    </button>


                    {/* FIX BUTTON */}

                    <button
                        className="investigate-button"
                        onClick={generateFix}
                        disabled={loading}
                    >

                        {loading
                            ? "🔄 Generating Fix..."
                            : "🔧 Generate AI Fix"}

                    </button>

                </section>


                {/* ERROR MESSAGE */}

                {errorMessage && (

                    <div className="connection-error">

                        ⚠️ {errorMessage}

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className="loading">

                        <div className="spinner"></div>

                        <h3>
                            🤖 CodePulse AI is working...
                        </h3>

                        <p>
                            Please wait while CodePulse
                            analyzes the backend error.
                        </p>

                    </div>

                )}


                {/* AI INVESTIGATION */}

                {investigation && !loading && (

                    <section className="investigation-card">

                        <div className="ai-title">
                            🤖 AI Investigation
                        </div>


                        <div className="result-section">

                            <h2>
                                🔍 Root Cause
                            </h2>

                            <p>
                                {extractSection(
                                    investigation.aiResponse,
                                    "ROOT CAUSE"
                                )}
                            </p>

                        </div>


                        <div className="result-section">

                            <h2>
                                💡 Explanation
                            </h2>

                            <p>
                                {extractSection(
                                    investigation.aiResponse,
                                    "EXPLANATION"
                                )}
                            </p>

                        </div>


                        <div className="result-section">

                            <h2>
                                🛠️ Suggested Solution
                            </h2>

                            <p>
                                {extractSection(
                                    investigation.aiResponse,
                                    "SUGGESTED SOLUTION"
                                )}
                            </p>

                        </div>


                        <details className="full-response">

                            <summary>
                                View Full AI Investigation
                            </summary>

                            <pre>
                                {investigation.aiResponse}
                            </pre>

                        </details>

                    </section>

                )}


                {/* AI FIX */}

                {fix && !loading && (

                    <section className="investigation-card">

                        <div className="ai-title">
                            🔧 AI Generated Code Fix
                        </div>


                        {/* ROOT CAUSE */}

                        <div className="result-section">

                            <h2>
                                🔍 Root Cause
                            </h2>

                            <p>
                                {extractSection(
                                    fix.fixResponse,
                                    "ROOT CAUSE"
                                )}
                            </p>

                        </div>


                        {/* PROBLEMATIC CODE */}

                        <div className="result-section">

                            <h2>
                                ❌ Problematic Code
                            </h2>

                            <pre>
                                {extractSection(
                                    fix.fixResponse,
                                    "PROBLEMATIC CODE"
                                )}
                            </pre>

                        </div>


                        {/* FIXED CODE */}

                        <div className="result-section">

                            <h2>
                                ✅ Fixed Code
                            </h2>

                            <pre>
                                {extractSection(
                                    fix.fixResponse,
                                    "FIXED CODE"
                                )}
                            </pre>

                        </div>


                        {/* EXPLANATION */}

                        <div className="result-section">

                            <h2>
                                💡 Explanation
                            </h2>

                            <p>
                                {extractSection(
                                    fix.fixResponse,
                                    "EXPLANATION"
                                )}
                            </p>

                        </div>


                        {/* AUTOMATED TEST */}

                        <div className="result-section">

                            <h2>
                                🧪 Automated Test
                            </h2>


                            {testResult ? (

                                <>

                                    <h3>

                                        {testResult.success
                                            ? "✅ TEST PASSED"
                                            : "❌ TEST FAILED"}

                                    </h3>


                                    <p>
                                        {testResult.message}
                                    </p>


                                    {testResult.details && (

                                        <pre>
                                            {testResult.details}
                                        </pre>

                                    )}

                                </>

                            ) : (

                                <p>
                                    Test result not available.
                                </p>

                            )}

                        </div>


                        {/* GITHUB PULL REQUEST */}

                        {testResult?.success && (

                            <div className="result-section">

                                <h2>
                                    🔀 GitHub Pull Request
                                </h2>


                                {pullRequestUrl ? (

                                    <>

                                        <h3>
                                            ✅ Pull Request Created
                                        </h3>

                                        <p>
                                            The AI-generated fix
                                            passed the automated
                                            test and was committed
                                            to GitHub.
                                        </p>


                                        <a
                                            href={pullRequestUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="investigate-button"
                                            style={{
                                                display: "inline-block",
                                                textDecoration: "none",
                                                textAlign: "center",
                                                marginTop: "10px"
                                            }}
                                        >
                                            🔗 View Pull Request
                                        </a>

                                    </>

                                ) : (

                                    <p>
                                        ⚠️ Pull Request information
                                        was not returned by the backend.
                                    </p>

                                )}

                            </div>

                        )}


                        {/* FULL RESPONSE */}

                        <details className="full-response">

                            <summary>
                                View Full AI Fix
                            </summary>

                            <pre>
                                {fix.fixResponse}
                            </pre>

                        </details>

                    </section>

                )}

            </main>

        </div>
    );
}


// ==================================================
// EXTRACT AI SECTIONS
// ==================================================

function extractSection(text, sectionName) {

    if (!text) {
        return "No information available.";
    }


    const sections = [
        "ROOT CAUSE",
        "PROBLEMATIC CODE",
        "FIXED CODE",
        "EXPLANATION",
        "SUGGESTED SOLUTION",
        "AFFECTED AREA",
    ];


    const start =
        text.indexOf(sectionName);


    if (start === -1) {
        return text;
    }


    const contentStart =
        start + sectionName.length;


    let end = text.length;


    for (const section of sections) {

        if (section === sectionName) {
            continue;
        }


        const next =
            text.indexOf(
                section,
                contentStart
            );


        if (next !== -1 && next < end) {
            end = next;
        }

    }


    return text
        .substring(
            contentStart,
            end
        )
        .replace(/[*#]/g, "")
        .trim();

}


export default App;