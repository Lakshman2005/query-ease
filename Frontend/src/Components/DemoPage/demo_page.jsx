import React, { useState } from 'react';
// import tailwindcss from '@tailwindcss/vite';
// import "tailwindcss/tailwind.css"; // Uncomment if using Tailwind CSS
// import './App.css';
const API_URL = "http://localhost:8000/query"
function DemoPage() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvUploaded, setCsvUploaded] = useState(false);
    const [loading, setLoading] = useState(false); // for query fetch
    const [uploading, setUploading] = useState(false); // for CSV upload

    const handleCsvChange = (e) => {
        setCsvFile(e.target.files[0]);
        setCsvUploaded(false);
    };

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) return;
        setUploading(true);
        setResult("");
        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            const response = await fetch('http://localhost:5000/upload_csv', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setCsvUploaded(data.success);
            setResult(data.message);
        } catch (error) {
            setResult('Error uploading CSV.');
        } finally {
            setUploading(false);
        }
    };

    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setLoading(true);
        setResult("");
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({"natural_language": query }),
            });
            const data = await response.json();
            setResult(data.data.msg || 'No result found.');
        } catch (error) {
            setResult('Error connecting to the backend.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render result as table if it's an array of objects
    const renderResult = () => {
        if (loading) {
            return (
                <div style={{textAlign: 'center', margin: '2rem 0'}}>
                    <div className="classic-loader">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                    <div style={{fontWeight: 600, color: '#2575fc', marginTop: 8, fontSize: '1.1rem'}}>
                        Crunching your data... Please wait
                    </div>
                </div>
            );
        }
        if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
            const columns = Object.keys(result[0]);
            return (
                <div className="scrollable-result">
                    <table className="result-table">
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col}>{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map(col => <td key={col}>{row[col]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (typeof result === 'string') {
            return <pre className="scrollable-result">{result}</pre>;
        } else if (Array.isArray(result) && result.length === 0) {
            return <pre className="scrollable-result">No results found.</pre>;
        } else {
            return <pre className="scrollable-result">{JSON.stringify(result, null, 2)}</pre>;
        }
    };

    return (
        <div className="main-fullscreen animated-bg">
            <div className="animated-card">
                <h1 className="animated-title">Natural Language to SQL Interface</h1>
                <form onSubmit={handleCsvUpload} className="animated-form">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvChange}
                        className="animated-input"
                        disabled={uploading}
                    />
                    <button type="submit" className="animated-btn" disabled={uploading}>
                        {uploading ? (
                            <>
                                <span className="classic-loader" style={{marginRight: 8}}>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </span>
                                Uploading CSV...
                            </>
                        ) : 'Upload CSV'}
                    </button>
                </form>
                {csvUploaded && <div style={{ color: 'green', marginBottom: '1rem' }}>CSV uploaded successfully!</div>}
                <form onSubmit={handleQuerySubmit} className="animated-form">
                    <input
                        type="text"
                        className="animated-input query-input"
                        placeholder="Enter your query in natural language"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={!csvUploaded || loading}
                    />
                    <button type="submit" className="animated-btn" disabled={!csvUploaded || loading}>
                        {loading ? (
                            <>
                                <span className="classic-loader" style={{marginRight: 8}}>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </span>
                                Fetching...
                            </>
                        ) : 'Submit'}
                    </button>
                </form>
                <div className={`result animated-result ${submitted ? 'show' : ''}`}>
                    <h2>Result:</h2>
                    {renderResult()}
                </div>
            </div>
        </div>
    );
}

export default DemoPage;
