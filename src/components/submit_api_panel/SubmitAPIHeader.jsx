import { useState } from "react";
import { getSessionId, getEvaluationId } from "../../utils/api_submit_utils";
import "../../styles/SubmitAPIPanel.css";

function SubmitAPIHeader({ queryTask, setQueryTask, onSessionIdChange, onEvaluationIdChange, onResetSelection }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionName, setSessionName] = useState("");
  
  const [evaluationId, setEvaluationId] = useState("");
  const [evaluationName, setEvaluationName] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);


  const handleLogin = async () => {
    if (!username.trim() || !password) {
      alert("Please enter username and password");
      return;
    }

    setIsLoadingSession(true);
    try {
      const response = await getSessionId(username, password);
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
        setSessionName(`${response.username}-${response.role}` || "");
        if (onSessionIdChange) {
          onSessionIdChange(response.sessionId);
        }
      } else {
        throw new Error("Session ID not found in response");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Failed to get session ID. Please check your credentials.");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleGetEvaluationId = async () => {
    if (!sessionId) {
      alert("Please login first to get session ID");
      return;
    }

    setIsLoadingEvaluation(true);
    try {
      const evaluation = await getEvaluationId(sessionId);
      
      if (evaluation && typeof evaluation === 'object' && evaluation.id) {
        setEvaluationId(evaluation.id);
        setEvaluationName(`${evaluation.name}-${evaluation.type}-${evaluation.status}` || "");
        if (onEvaluationIdChange) {
          onEvaluationIdChange(evaluation.id);
        }
      } else {
        throw new Error("Evaluation ID not found in response. Please check if you have access to an active evaluation.");
      }
    } catch (error) {
      console.error("Get evaluation ID failed:", error);
      alert(error.message || "Failed to get evaluation ID");
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  const toggleCredentials = () => {
    setShowCredentials((prev) => !prev);
  };

  return (
    <div className="submit-api-header">
      

      <div className="credentials-section">
        <button type="button" onClick={toggleCredentials}>
          {showCredentials ? "Hide" : "Show"} Credentials
        </button>

        {showCredentials && (
          <>
            <div className="credentials-form">
              <div className="credential-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div className="credential-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="session-section">
              <div className="session-info">
                <label>Session ID</label>
                {sessionId ? (
                  <div className="session-value">{sessionId}</div>
                ) : (
                  <div className="session-value empty">Not logged in</div>
                )}
                {sessionName && <div className="evaluation-name">{sessionName}</div>}
              </div>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoadingSession || !username.trim() || !password}
              >
                {isLoadingSession ? "Logging in..." : "Refresh session ID"}
              </button>
            </div>

            <div className="evaluation-section">
              <div className="evaluation-info">
                <label>Evaluation ID</label>
                {evaluationId ? (
                  <div className="evaluation-value">
                    <div>{evaluationId}</div>
                    {evaluationName && <div className="evaluation-name">{evaluationName}</div>}
                  </div>
                ) : (
                  <div className="evaluation-value empty">Not loaded</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleGetEvaluationId}
                disabled={isLoadingEvaluation || !sessionId}
              >
                {isLoadingEvaluation ? "Loading..." : "Refresh evaluation ID"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="header-section">
        <label>Task Type</label>
        <div className="submit-option">
          <button
            type="button"
            className={`submit-option-btn ${queryTask === "kis" ? "active" : ""}`}
            onClick={() => { onResetSelection && onResetSelection(); setQueryTask("kis"); }}
          >
            KIS
          </button>
          <button
            type="button"
            className={`submit-option-btn ${queryTask === "qa" ? "active" : ""}`}
            onClick={() => { onResetSelection && onResetSelection(); setQueryTask("qa"); }}
          >
            QA
          </button>
          <button
            type="button"
            className={`submit-option-btn ${queryTask === "trake" ? "active" : ""}`}
            onClick={() => { onResetSelection && onResetSelection(); setQueryTask("trake"); }}
          >
            TRAKE
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default SubmitAPIHeader;
