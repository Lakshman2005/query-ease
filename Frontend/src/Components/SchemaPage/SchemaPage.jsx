import React, { useState, useRef } from "react";
import axios from "axios";
import "./SchemaPage.css";
const API_URL = "http://localhost:8001/query";

function SchemaPage() {
  const [nlInput, setNlInput] = useState("");
  const [showCinematic, setShowCinematic] = useState(false);
  const [error, setError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [responseType, setResponseType] = useState(""); // 'success' or 'error'
  const inputRef = useRef(null);

  const handleSubmitNL = async () => {
    if (!nlInput.trim()) {
      setError("Please enter a description before generating the schema.");
      setResponseMsg("");
      setResponseType("");
      return;
    }
    setError("");
    setShowCinematic(true);
    setResponseMsg("");
    setResponseType("");
    try {
      const res = await axios.post(API_URL, {
        "natural_language": nlInput,
      });
      setResponseMsg(res.data.message || "Schema created!");
      setResponseType("success");
    } catch (err) {
      setResponseMsg("Error connecting to the backend.");
      setResponseType("error");
    } finally {
      setShowCinematic(false);
    }
  };

  return (
    <div className="schema-page-container main-fullscreen">
      <div className="schema-card">
        <div className="schema-title">
          <span>Classic Schema Builder</span>
        </div>
        <div>
          <div className="schema-section-title">Describe your data in natural language</div>
          <div style={{position: 'relative', minHeight: '120px'}}>
            {showCinematic && (
              <div className="cinematic-graphic">
                <div className="cinematic-search">
                  {/* <div className="search-bar">
                    <div className="search-light" />
                    <div className="search-text">Searching your data...</div>
                  </div> */}
                  <div className="data-stream">
                    <div className="data-bits" />
                    <div className="data-bits" />
                    <div className="data-bits" />
                  </div>
                  <div className="result-box">Extracting result...</div>
                </div>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={nlInput}
              onChange={e => {
                setNlInput(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., I want to store employee names, departments, and salaries."
              className="schema-textarea"
              rows={4}
              style={{zIndex: 2, position: 'relative', background: showCinematic ? 'rgba(255,255,255,0.95)' : undefined}}
            />
            {error && (
              <div style={{color: '#d32f2f', fontWeight: 500, marginTop: 4, marginBottom: 4, fontSize: '1rem'}}>{error}</div>
            )}
          </div>
          <button
            onClick={handleSubmitNL}
            className="schema-btn"
            disabled={showCinematic}
          >
            {showCinematic ? "Fetching..." : "Generate Schema"}
          </button>
          {responseMsg && (
            <div style={{
              color: responseType === "success" ? "#388e3c" : "#d32f2f",
              fontWeight: 500,
              marginTop: 8,
              fontSize: '1rem',
              minHeight: 24
            }}>{responseMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchemaPage;
