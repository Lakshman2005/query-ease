import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import MergedSchemaQueryPage from "./Components/MergedSchemaQueryPage";
import TableManager from "./Components/DataPage/dataPage";
import "./App.css";

// Dark mode toggle button component (now positioned absolutely)
function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      className="modern-dark-toggle dark-toggle-absolute"
      onClick={() => setDarkMode((d) => !d)}
      aria-label="Toggle dark mode"
    >
      <span className={`modern-toggle-track${darkMode ? " dark" : ""}`}>
        <span className={`modern-toggle-thumb${darkMode ? " dark" : ""}`}>
          <span className="toggle-icon" style={{ opacity: darkMode ? 0 : 1, transition: "opacity 0.3s" }}>☀️</span>
          <span className="toggle-icon" style={{ opacity: darkMode ? 1 : 0, transition: "opacity 0.3s" }}>🌙</span>
        </span>
      </span>
    </button>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Animation state
  const [showTitle, setShowTitle] = useState(false);
  const [moveTitle, setMoveTitle] = useState(false);
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setTimeout(() => setShowTitle(true), 200); // fade in title center
    setTimeout(() => setMoveTitle(true), 1300); // move to top
    setTimeout(() => setShowInterface(true), 1800); // fade in rest
  }, []);

  return (
    <Router>
      <div className={`main-fullscreen bg-gray-50${darkMode ? " dark" : ""}`}>
        {/* Absolute top-right dark mode toggle */}
        <div className="dark-toggle-absolute-container">
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>

        {/* Animated project title: center, then move to top and stay fixed at top-middle */}
        <div
          className={`project-title-anim${showTitle ? " show" : ""}${moveTitle ? " move" : ""}`}
        >
          <h1
            className="project-title"
            style={{
              fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif",
              fontWeight: 900,
              fontSize: "2.7rem",
              letterSpacing: "2.5px",
              color: darkMode ? "#f5f7fa" : "#23272f",
              textShadow: darkMode
                ? "0 2px 12px rgba(58,123,213,0.18)"
                : "0 2px 12px rgba(58,123,213,0.08)",
              margin: 0,
              textAlign: "center"
            }}
          >
            QueryEase
          </h1>
        </div>

        {/* Always render a static header at the top after animation */}
        {moveTitle && (
          <header
            className="project-title-fixed"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2.2rem 0 0.7rem 0",
              background: "none",
              position: "static",
              zIndex: 10
            }}
          >
            <h1
              className="project-title"
              style={{
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif",
                fontWeight: 900,
                fontSize: "2.7rem",
                letterSpacing: "2.5px",
                color: darkMode ? "#f5f7fa" : "#23272f",
                textShadow: darkMode
                  ? "0 2px 12px rgba(58,123,213,0.18)"
                  : "0 2px 12px rgba(58,123,213,0.08)",
                margin: 0,
                textAlign: "center"
              }}
            >
              QueryEase
            </h1>
          </header>
        )}

        {/* Navigation Bar below title with fade/slide animation */}
        <nav
          className={`main-navbar fade-navbar${showInterface ? " show" : ""}`}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: darkMode
              ? "linear-gradient(90deg, #23272f 0%, #3a7bd5 100%)"
              : "linear-gradient(90deg, #e0e7ef 0%, #5b9df9 100%)",
            boxShadow: "0 2px 12px #b6c2d933",
            padding: "0.7rem 0 0.7rem 0",
            marginBottom: "1.2rem",
            transition: "background 0.5s cubic-bezier(.4,0,.2,1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link
              to="/merged"
              className="nav-bold"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif",
                fontWeight: 700,
                fontSize: "1.18rem",
                color: darkMode ? "#fff" : "#23272f",
                letterSpacing: "1px",
                textDecoration: "none",
                padding: "0.3rem 1.2rem",
                borderRadius: "8px",
                background: "none",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              <span style={{ fontSize: "1.35em" }}>💬</span>
              <span>Query &amp; Schema</span>
            </Link>
            <Link
              to="/data"
              className="nav-bold"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif",
                fontWeight: 700,
                fontSize: "1.18rem",
                color: darkMode ? "#fff" : "#23272f",
                letterSpacing: "1px",
                textDecoration: "none",
                padding: "0.3rem 1.2rem",
                borderRadius: "8px",
                background: "none",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              <span style={{ fontSize: "1.2em" }}>💬</span>
              <span>Data Management</span>
            </Link>
          </div>
        </nav>

        {/* Page Routes with fade-in */}
        <div className={`fade-interface${showInterface ? " show" : ""}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/merged" replace />} />
            <Route path="/merged" element={<MergedSchemaQueryPage />} />
            <Route path="/data" element={<TableManager />} />
            <Route path="*" element={<Navigate to="/merged" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
