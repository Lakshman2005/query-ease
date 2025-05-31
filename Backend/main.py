from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import sqlite3

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/generate"
DB_PATH = "nlp_sql.db"

class QueryRequest(BaseModel):
    natural_language: str
    # table_name: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with actual domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import re

def extract_sql_from_markdown(markdown_text):
    """
    Extracts SQL query from markdown-formatted text.

    Parameters:
        markdown_text (str): Markdown text containing an SQL query.

    Returns:
        str: Raw SQL query without markdown formatting.
    """
    # Match fenced code blocks likesql ...
    print("markdown_text", markdown_text)
    match = re.search(r"```(?:sql)?\s*([\s\S]*?)```", markdown_text, re.DOTALL | re.IGNORECASE)
    if match:
        print(match)
        return match.group(1).strip()

    # If no fenced code blocks found, return the text assuming it's plain SQL
    print("query", markdown_text.strip())
    return markdown_text.strip()

def generate_sql_from_nlp(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama2",
            "prompt": f"Generate a SQL query that answers the question \"{prompt}\" Give only the SQL query, no explanation",
            "stream": False
        }
    )
    result = response.json()
    return result["response"].strip()

def init__init():
    requests.post(
        OLLAMA_URL,
        json={
            "model": "llama2",
            "prompt": f"ollama run sqlcoder2:7b --no-cache",
            "stream": False
        }
    )
    requests.post(
        OLLAMA_URL,
        json={
            "model": "llama2",
            "prompt": (
                "Use the database schema to answer the following questions in further prompts The schema is: `CREATE TABLE customers (id INTEGER PRIMARY KEY,name TEXT,email TEXT,signup_date DATE);`"
            ),
            "stream": False
        }
    )
    print("done")

def execute_sql_query(query: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if '```\n' in query:
        query = query.split('```\n')[1].strip()
    if '\n```' in query:
        query = query.split('\n```')[0].strip()
    print("Executing SQL query:", query)
    try:
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        return {"columns": columns, "rows": rows}
    except Exception as e:
        print("Error executing SQL query:", e)
        return {"error": "Please enter a valid question."}
    finally:
        conn.close()


@app.post("/query")
def query_sql(req: QueryRequest):
    sql = generate_sql_from_nlp(req.natural_language)
    result = execute_sql_query(sql)
    return {
        "natural_language": req.natural_language,
        "generated_sql": sql,
        "result": result
    }

init__init()
# To run this API on a port, use:
# python uvicorn main:app --host 0.0.0.0 --port 8001