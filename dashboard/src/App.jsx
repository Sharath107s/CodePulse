import { useState } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:4000";

function App() {
  const [loading, setLoading] = useState(false);
  const [investigation, setInvestigation] = useState(null);
  const [fix, setFix] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const errorData = {
    id: 1,
    endpoint: "/students/999",
    method: "GET",
    status: 500,
    error: "Student not found in database",
    stack_trace: "Error: Student not found in database",
  };

  // AI Investigation
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
      console.error("Investigation error:", error);

      setErrorMessage(
        "Could not connect to CodePulse backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // AI Code Fix
  const generateFix = async () => {
    setLoading(true);
    setFix(null);
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
    } catch (error) {
      console.error("Fix generation error:", error);

      setErrorMessage(
        "Could not generate the AI fix."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Header */}
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

      {/* Main */}
      <main className="container">

        {/* Error Card */}
        <section className="error-card">

          <div className="error-top">

            <div className="status-code">
              {errorData.status}
            </div>

            <div className="error-title">
              <h2>{errorData.error}</h2>

              <p>
                {errorData.method} {errorData.endpoint}
              </p>
            </div>

          </div>

          <hr />

          <div className="error-details">

            <div>
              <span>ERROR</span>
              <strong>{errorData.error}</strong>
            </div>

            <div>
              <span>METHOD</span>
              <strong>{errorData.method}</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>{errorData.status}</strong>
            </div>

          </div>

          {/* Investigation Button */}
          <button
            className="investigate-button"
            onClick={investigateError}
            disabled={loading}
          >
            {loading
              ? "🔄 Investigating..."
              : "🔍 Investigate Error"}
          </button>

          {/* Fix Button */}
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

        {/* Error Message */}
        {errorMessage && (
          <div className="connection-error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">

            <div className="spinner"></div>

            <h3>
              🤖 CodePulse AI is working...
            </h3>

            <p>
              Please wait while CodePulse analyzes
              the backend error.
            </p>

          </div>
        )}

        {/* AI Investigation */}
        {investigation && !loading && (
          <section className="investigation-card">

            <div className="ai-title">
              🤖 AI Investigation
            </div>

            <div className="result-section">

              <h2>🔍 Root Cause</h2>

              <p>
                {extractSection(
                  investigation.aiResponse,
                  "ROOT CAUSE"
                )}
              </p>

            </div>

            <div className="result-section">

              <h2>💡 Explanation</h2>

              <p>
                {extractSection(
                  investigation.aiResponse,
                  "EXPLANATION"
                )}
              </p>

            </div>

            <div className="result-section">

              <h2>🛠️ Suggested Solution</h2>

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

        {/* AI Fix */}
        {fix && !loading && (
          <section className="investigation-card">

            <div className="ai-title">
              🔧 AI Generated Code Fix
            </div>

            <div className="result-section">

              <h2>🔍 Root Cause</h2>

              <p>
                {extractSection(
                  fix.fixResponse,
                  "ROOT CAUSE"
                )}
              </p>

            </div>

            <div className="result-section">

              <h2>❌ Problematic Code</h2>

              <pre>
                {extractSection(
                  fix.fixResponse,
                  "PROBLEMATIC CODE"
                )}
              </pre>

            </div>

            <div className="result-section">

              <h2>✅ Fixed Code</h2>

              <pre>
                {extractSection(
                  fix.fixResponse,
                  "FIXED CODE"
                )}
              </pre>

            </div>

            <div className="result-section">

              <h2>💡 Explanation</h2>

              <p>
                {extractSection(
                  fix.fixResponse,
                  "EXPLANATION"
                )}
              </p>

            </div>

                        <div className="result-section">

              <h2>🧪 Automated Test</h2>

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
                <p>Test result not available.</p>
              )}

            </div>
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


/* Extract AI sections */
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

  const start = text.indexOf(sectionName);

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

    const next = text.indexOf(
      section,
      contentStart
    );

    if (next !== -1 && next < end) {
      end = next;
    }
  }

  return text
    .substring(contentStart, end)
    .replace(/\*\*/g, "")
    .trim();
}

export default App;