import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../Components/SchemaPage/SchemaPage.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

const API_SCHEMA = "http://localhost:8000/query";
const API_QUERY = "http://localhost:8000/query";
const API_TABLES = "http://localhost:8001/list_tables";
const API_TRENDS = "http://localhost:8001/trends"; // <-- Add your backend endpoint for trends

function MergedSchemaQueryPage() {
  const [activeTab, setActiveTab] = useState("query");

  // Schema Builder states
  const [nlInput, setNlInput] = useState("");
  const [showCinematic, setShowCinematic] = useState(false);
  const [schemaError, setSchemaError] = useState("");
  const [schemaMsg, setSchemaMsg] = useState("");
  const [schemaMsgType, setSchemaMsgType] = useState("");
  const inputRef = useRef(null);

  // Query Interface states
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");

  // Trends states
  const [trendsTable, setTrendsTable] = useState("");
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState("");
  const [trendsData, setTrendsData] = useState([]);

  useEffect(() => {
    if (activeTab === "query" || activeTab === "trends" || activeTab === "schema") {
      axios.get(API_TABLES)
        .then(res => setTables(res.data.tables || []))
        .catch(() => setTables([]));
    }
  }, [activeTab]);

  // Schema Builder submit
  const handleSubmitNL = async () => {
    if (!nlInput.trim()) {
      setSchemaError("Please enter a description before generating the schema.");
      setSchemaMsg("");
      setSchemaMsgType("");
      return;
    }
    setSchemaError("");
    setShowCinematic(true);
    setSchemaMsg("");
    setSchemaMsgType("");
    try {
      const res = await axios.post(API_SCHEMA, {
        "natural_language": nlInput,
      });
      setSchemaMsg(res.data.message || "Schema created!");
      setSchemaMsgType("success");
    } catch (err) {
      setSchemaMsg("Error connecting to the backend.");
      setSchemaMsgType("error");
    } finally {
      setShowCinematic(false);
    }
  };

  // Query Interface submit
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQueryError("");
    setQueryResult(null);
    if (!selectedTable) {
      setQueryError("Please select a table.");
      return;
    }
    if (!query.trim()) {
      setQueryError("Please enter a query.");
      return;
    }
    setQueryLoading(true);
    try {
      const res = await axios.post(API_QUERY, {
        table: selectedTable,
        natural_language: query
      });
      console.log("response query data:", res.data.result);
      setQueryResult(res.data.result || res.data.data || res.data.message || "No result found.");
    } catch (err) {
      setQueryError("Error connecting to the backend.");
    } finally {
      setQueryLoading(false);
    }
  };

  // Trends submit
  const handleTrendsFetch = async () => {
    setTrendsError("");
    setTrendsData(null);
    // if (!trendsTable) {
    //   setTrendsError("Please select a table to view trends.");
    //   return;
    // }
    setTrendsLoading(true);
    try {
      // const res = await axios.get(`${API_TRENDS}?table_name=${encodeURIComponent(trendsTable)}`);
      const res = await axios.get(`${API_TRENDS}`);
      console.log("response trends data:", res.data.trends);
      if (res.data.trends) {
        setTrendsData(res.data.trends);
      } else {
        setTrendsError("No trends data available for this table.");
      }
    } catch (err) {
      setTrendsError("Error fetching trends data from the backend.");
    } finally {
      setTrendsLoading(false);
    }
  };

  console.log("trendsData:", trendsData);

  // Helper to render query result
  const renderQueryResult = () => {
    if (queryLoading) {
      return (
        <div style={{textAlign: 'center', margin: '2rem 0'}}>
          <div className="classic-loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div style={{fontWeight: 600, color: '#2575fc', marginTop: 8, fontSize: '1.1rem'}}>
            Fetching your data... Please wait
          </div>
        </div>
      );
    }
    if (queryError) {
      return <div style={{ color: '#d32f2f', fontWeight: 500, marginTop: 8 }}>{queryError}</div>;
    }
    if (!queryResult) return null;

    // Material UI Table for { columns: [...], rows: [...] }
    if (
      typeof queryResult === "object" &&
      queryResult !== null &&
      Array.isArray(queryResult.columns) &&
      Array.isArray(queryResult.rows)
    ) {
      return (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            background: "var(--main-bg2, #f9fafb)",
            minWidth: 400,
            maxWidth: 900,
            margin: "0 auto",
            marginBottom: 2
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#e2e8f0" }}>
                {queryResult.columns.map((col, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      fontWeight: 700,
                      color: "#2d3748",
                      borderBottom: "1px solid #e2e8f0",
                      background: "#f1f5fa",
                      textAlign: "center"
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {queryResult.rows.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  sx={{
                    background: rowIdx % 2 === 0 ? "#f8fafc" : "#e9eef6"
                  }}
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      align="center"
                      sx={{
                        fontSize: "0.98rem",
                        borderBottom: "1px solid #e2e8f0"
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ...existing code for array of objects, string, etc...
    if (Array.isArray(queryResult) && queryResult.length > 0 && typeof queryResult[0] === 'object') {
      const columns = Object.keys(queryResult[0]);
      return (
        <div className="scrollable-result">
          <table className="result-table">
            <thead>
              <tr>
                {columns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {queryResult.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => <td key={col}>{row[col]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (typeof queryResult === 'string') {
      return <pre className="scrollable-result">{queryResult}</pre>;
    } else if (Array.isArray(queryResult) && queryResult.length === 0) {
      return <pre className="scrollable-result">No results found.</pre>;
    } else {
      return <pre className="scrollable-result">{JSON.stringify(queryResult, null, 2)}</pre>;
    }
  };

  // Helper to render trends result
  const renderTrendsResult = () => {
    if (trendsLoading) {
      return (
        <div style={{textAlign: 'center', margin: '2.5rem 0'}}>
          <div className="trends-loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div style={{fontWeight: 700, color: '#43cea2', marginTop: 12, fontSize: '1.15rem'}}>
            Analyzing trends... Please wait
          </div>
        </div>
      );
    }
    if (trendsError) {
      return (
        <div style={{
          color: '#d32f2f',
          fontWeight: 600,
          marginTop: 16,
          marginBottom: 16,
          fontSize: '1.08rem',
          textAlign: 'center'
        }}>
          {trendsError}
        </div>
      );
    }
    if (!trendsData) return null;

    // If trendsData is a mapping of item names to "Up trend"/"Down trend"
    if (
      typeof trendsData === "object" &&
      !Array.isArray(trendsData) &&
      Object.values(trendsData).every(
        v => typeof v === "string" && (v === "Up trend" || v === "Down trend")
      )
    ) {
      // Separate into trending and non-trending arrays
      const trending = Object.entries(trendsData)
        .filter(([_, v]) => v === "Up trend")
        .map(([k]) => k);
      const nonTrending = Object.entries(trendsData)
        .filter(([_, v]) => v === "Down trend")
        .map(([k]) => k);

      // Find the max length for table rows
      const maxLen = Math.max(trending.length, nonTrending.length);

      return (
        <div
          className="trends-result-card"
          style={{
            background: "var(--main-bg2, #f5f7fa)",
            borderRadius: 16,
            boxShadow: "0 2px 12px #43cea233",
            padding: "2rem 2.5rem",
            margin: "2rem auto",
            maxWidth: 700,
            color: "var(--main-dark, #2d3a4b)",
            transition: "background 0.3s"
          }}
        >
          <div style={{fontWeight: 700, fontSize: "1.2rem", color: "var(--main-accent, #3a7bd5)", marginBottom: 18}}>
            Trends Table
          </div>
          <div style={{overflowX: "auto"}}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "inherit"
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: "0.7em 1em",
                    background: "var(--main-accent, #3a7bd5)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "8px 0 0 0"
                  }}>Trending</th>
                  <th style={{
                    padding: "0.7em 1em",
                    background: "#ff5e62",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "0 8px 0 0"
                  }}>Non Trending</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(maxLen)].map((_, i) => (
                  <tr key={i}>
                    <td style={{
                      padding: "0.6em 1em",
                      borderBottom: "1px solid #e0e7ef",
                      color: "#388e3c",
                      fontWeight: 600,
                      background: "rgba(67,206,162,0.07)"
                    }}>
                      {trending[i] || ""}
                    </td>
                    <td style={{
                      padding: "0.6em 1em",
                      borderBottom: "1px solid #e0e7ef",
                      color: "#d32f2f",
                      fontWeight: 600,
                      background: "rgba(255,94,98,0.07)"
                    }}>
                      {nonTrending[i] || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div
        className="trends-result-card"
        style={{
          background: "var(--main-bg2, #f5f7fa)",
          borderRadius: 16,
          boxShadow: "0 2px 12px #43cea233",
          padding: "2rem 2.5rem",
          margin: "2rem auto",
          maxWidth: 700,
          color: "var(--main-dark, #2d3a4b)",
          transition: "background 0.3s"
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 18}}>
          <div style={{fontWeight: 700, fontSize: "1.2rem", color: "var(--main-accent, #3a7bd5)"}}>
            Trends for <span style={{color: "var(--main-dark, #2d3a4b)"}}>{trendsTable}</span>
          </div>
          {trendsData.upstream && (
            <div>
              <span style={{fontWeight: 600, color: "#388e3c"}}>Upstream:</span>
              <span style={{marginLeft: 8}}>{trendsData.upstream}</span>
            </div>
          )}
          {trendsData.downstream && (
            <div>
              <span style={{fontWeight: 600, color: "#d32f2f"}}>Downstream:</span>
              <span style={{marginLeft: 8}}>{trendsData.downstream}</span>
            </div>
          )}
          {trendsData.image_url && (
            <div style={{marginTop: 18, textAlign: "center"}}>
              <img
                src={trendsData.image_url}
                alt="Trends Visualization"
                style={{
                  maxWidth: "100%",
                  maxHeight: 320,
                  borderRadius: 12,
                  boxShadow: "0 2px 12px #43cea233",
                  border: "2px solid var(--main-accent, #3a7bd5)",
                  background: "#fff"
                }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="main-fullscreen animated-bg">
      <div className="animated-card" style={{ maxWidth: 900, width: '98vw', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <button
            className={`animated-btn ${activeTab === 'query' ? 'active' : ''}`}
            style={{
              marginRight: 16,
              fontWeight: activeTab === 'query' ? 700 : 500,
              fontSize: '1.1rem',
              background: activeTab === 'query' ? 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)' : '#eaf1fb',
              color: activeTab === 'query' ? '#fff' : '#2575fc',
              border: 'none',
              boxShadow: activeTab === 'query' ? '0 2px 8px #2575fc33' : 'none',
              transition: "background 0.3s"
            }}
            onClick={() => setActiveTab('query')}
          >
            💬 Query Interface
          </button>
          <button
            className={`animated-btn ${activeTab === 'schema' ? 'active' : ''}`}
            style={{
              marginRight: 16,
              fontWeight: activeTab === 'schema' ? 700 : 500,
              fontSize: '1.1rem',
              background: activeTab === 'schema' ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)' : '#eaf1fb',
              color: activeTab === 'schema' ? '#fff' : '#2575fc',
              border: 'none',
              boxShadow: activeTab === 'schema' ? '0 2px 8px #43cea233' : 'none',
              transition: "background 0.3s"
            }}
            onClick={() => setActiveTab('schema')}
          >
            🧱 Schema Builder
          </button>
          <button
            className={`animated-btn ${activeTab === 'trends' ? 'active' : ''}`}
            style={{
              fontWeight: activeTab === 'trends' ? 700 : 500,
              fontSize: '1.1rem',
              background: activeTab === 'trends' ? 'linear-gradient(90deg, #ffb347 0%, #ff5e62 100%)' : '#eaf1fb',
              color: activeTab === 'trends' ? '#fff' : '#ff5e62',
              border: 'none',
              boxShadow: activeTab === 'trends' ? '0 2px 8px #ffb34733' : 'none',
              transition: "background 0.3s"
            }}
            onClick={() => setActiveTab('trends')}
          >
            📈 Trends
          </button>
        </div>
        {activeTab === 'query' && (
          <div style={{ background: 'linear-gradient(120deg, #eaf1fb 0%, #dbeafe 100%)', borderRadius: 14, boxShadow: '0 2px 12px #2575fc11', padding: '2.2rem 2.5rem 2.5rem 2.5rem', marginBottom: 12, border: '2px solid #2575fc22' }}>
            <h2 className="animated-title" style={{ fontSize: '1.5rem', marginBottom: 16, color: '#2575fc', letterSpacing: 1, textAlign: 'center' }}>Query Your Data</h2>
            <form onSubmit={handleQuerySubmit} className="animated-form" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 18, justifyContent: 'center', marginBottom: 24, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
              <label style={{ fontWeight: 600, color: '#185a9d', marginBottom: 4, fontSize: '1rem' }} htmlFor="table-select">Select Table</label>
              <select
                id="table-select"
                className="animated-input form-select"
                style={{ minWidth: 180, maxWidth: 320, fontSize: '1rem', marginBottom: 8, border: '1.5px solid #2575fc', borderRadius: 6, padding: '8px 12px', background: '#f7fafd' }}
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
                disabled={queryLoading}
              >
                <option value="" disabled>Select a table...</option>
                {tables.map((table) => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
              <label style={{ fontWeight: 600, color: '#185a9d', marginBottom: 4, fontSize: '1rem' }} htmlFor="query-textarea">Query</label>
              <textarea
                id="query-textarea"
                className="animated-input"
                style={{ minWidth: 320, maxWidth: '100%', fontSize: '1rem', minHeight: 90, resize: 'vertical', border: '1.5px solid #2575fc', borderRadius: 6, padding: '10px 14px', background: '#f7fafd', marginBottom: 8 }}
                placeholder="Enter your query in natural language (e.g., Show all employees in the sales department)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={queryLoading}
              />
              <button type="submit" className="animated-btn" disabled={queryLoading} style={{ minWidth: 140, alignSelf: 'flex-end', background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 6 }}>
                {queryLoading ? (
                  <span className="classic-loader" style={{ marginRight: 8 }}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                ) : 'Run Query'}
              </button>
            </form>
            <div className="animated-result show" style={{ marginTop: 12 }}>{renderQueryResult()}</div>
          </div>
        )}
        {activeTab === 'schema' && (
          <div style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e0e7ef 100%)', borderRadius: 14, boxShadow: '0 2px 12px #43cea211', padding: '2.2rem 2.5rem 2.5rem 2.5rem', marginBottom: 12, border: '2px solid #43cea222' }}>
            <h2 className="animated-title" style={{ fontSize: '1.5rem', marginBottom: 16, color: '#185a9d', letterSpacing: 1, textAlign: 'center' }}>🧱 Smart Schema Builder</h2>
            <div style={{ position: 'relative', minHeight: '120px', marginBottom: 16 }}>
              {showCinematic && (
                <div className="cinematic-graphic">
                  <div className="cinematic-search">
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
                  if (schemaError) setSchemaError("");
                }}
                placeholder="e.g., I want to store employee names, departments, and salaries."
                className="schema-textarea"
                rows={4}
                style={{ zIndex: 2, position: 'relative', background: showCinematic ? 'rgba(255,255,255,0.95)' : '#f7fafd', border: '1.5px solid #185a9d', borderRadius: 6, padding: '10px 14px', fontSize: '1rem' }}
                disabled={showCinematic}
              />
              {schemaError && (
                <div style={{ color: '#d32f2f', fontWeight: 500, marginTop: 4, marginBottom: 4, fontSize: '1rem' }}>{schemaError}</div>
              )}
            </div>
            <button
              onClick={handleSubmitNL}
              className="schema-btn"
              disabled={showCinematic}
              style={{ minWidth: 160, background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 6 }}
            >
              {showCinematic ? (
                <span className="classic-loader" style={{ marginRight: 8 }}>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              ) : null}
              {showCinematic ? "Fetching..." : "Generate Schema"}
            </button>
            {schemaMsg && (
              <div style={{
                color: schemaMsgType === "success" ? "#388e3c" : "#d32f2f",
                fontWeight: 500,
                marginTop: 8,
                fontSize: '1rem',
                minHeight: 24
              }}>{schemaMsg}</div>
            )}
          </div>
        )}
        {activeTab === 'trends' && (
          <div style={{
            background: 'linear-gradient(120deg, #fffbe6 0%, #ffe5e5 100%)',
            borderRadius: 14,
            boxShadow: '0 2px 12px #ffb34722',
            padding: '2.2rem 2.5rem 2.5rem 2.5rem',
            marginBottom: 12,
            border: '2px solid #ffb34733',
            transition: "background 0.3s"
          }}>
            <h2 className="animated-title" style={{
              fontSize: '1.5rem',
              marginBottom: 16,
              color: '#ff5e62',
              letterSpacing: 1,
              textAlign: 'center'
            }}>📈 Table Trends</h2>
            <div style={{ maxWidth: 400, margin: "0 auto 1.5rem auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: 600, color: '#ff5e62', marginBottom: 4, fontSize: '1rem' }} htmlFor="trends-table-select">
                Select Table
              </label>
              <select
                id="trends-table-select"
                className="animated-input form-select"
                style={{
                  minWidth: 180,
                  maxWidth: 320,
                  fontSize: '1rem',
                  marginBottom: 8,
                  border: '1.5px solid #ffb347',
                  borderRadius: 6,
                  padding: '8px 12px',
                  background: '#fffbe6'
                }}
                value={trendsTable}
                onChange={e => setTrendsTable(e.target.value)}
                disabled={trendsLoading}
              >
                <option value="" disabled>Select a table...</option>
                {tables.map((table) => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
              <button
                className="animated-btn"
                style={{
                  minWidth: 140,
                  alignSelf: 'flex-end',
                  background: 'linear-gradient(90deg, #ffb347 0%, #ff5e62 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  border: 'none',
                  borderRadius: 6,
                  marginTop: 8
                }}
                onClick={handleTrendsFetch}
                disabled={trendsLoading}
              >
                {trendsLoading ? (
                  <span className="trends-loader" style={{ marginRight: 8 }}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                ) : "Show Trends"}
              </button>
            </div>
            {renderTrendsResult()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MergedSchemaQueryPage;
