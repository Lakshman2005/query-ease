import array
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from pydantic import BaseModel
from typing import Dict
from App import analyze_trends
from fastapi.responses import Response
import csv
import io
app = FastAPI()
DB_PATH = "nlp_sql.db"

class QueryRequest(BaseModel):
    natural_language: str
    table_name: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with actual domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def arrayify(data):

    # Convert rows to list of dictionaries
    formatted_rows = [
        {col: row[i] if i < len(row) else "" for i, col in enumerate(data['columns'])}
        for row in data['rows']
    ]

    # Output the result
    for row in formatted_rows:
        print(row)
    return {"columns": data['columns'], "rows": formatted_rows}

@app.get("/display_table")
def execute_sql_query(table_name: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(table_name)
    query=f"SELECT * FROM {table_name};"
    try:
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        return arrayify({"columns": columns, "rows": rows})
    except Exception as e:
        print("Error executing SQL query:", e)
        return {"error": "Please enter a valid question."}
    finally:
        conn.close()

@app.get("/display_table_for_visualization")
def execute_sql_query_for_visualization(table_name: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(table_name)
    query=f"SELECT * FROM {table_name};"
    try:
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        # Convert to CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(columns)
        writer.writerows(rows)
        csv_data = output.getvalue()
        output.close()

        return Response(content=csv_data, media_type="text/csv")
    except Exception as e:
        print("Error executing SQL query:", e)
        return {"error": "Please enter a valid question."}
    finally:
        conn.close()        

@app.get("/list_tables")
def list_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Query for all tables and their creation SQL
    cursor.execute("SELECT name, sql FROM sqlite_schema WHERE type='table'")
    tables = cursor.fetchall()

    for table in tables:
        print(f"Table: {table[0]}")
        print(f"Creation SQL: {table[1]}\n")
    conn.close()
    return {"tables": [table[0] for table in tables]}
@app.delete("/delete_row")
def delete_row(table_name: str, row_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (row_id,))
        conn.commit()
        return {"message": f"Row with id {row_id} deleted from {table_name}"}
    except Exception as e:
        print("Error deleting row:", e)
        return {"error": "Failed to delete row."}
    finally:
        conn.close()

# @app.patch("/update_row")
# def update_row(table_name: str, row_id: int, updates: dict):
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
#     print(table_name, row_id, updates)
#     try:
#         set_clause = ", ".join([f"{col} = ?" for col in updates.keys()])
#         values = list(updates.values()) + [row_id]
#         sql = f"UPDATE {table_name} SET {set_clause} WHERE id = ?"
#         cursor.execute(sql, values)
#         conn.commit()
#         return {"message": f"Row with id {row_id} updated in {table_name}"}
#     except Exception as e:
#         print("Error updating row:", e)
#         return {"error": "Failed to update row."}
#     finally:
#         conn.close()
class UpdateRowRequest(BaseModel):
    table_name: str
    row_id: int
    updates: Dict[str, str]

class InsertRowRequest(BaseModel):
    table_name: str
    row_data: Dict[str, str]

@app.patch("/update_row")
def update_row(req: UpdateRowRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(req.table_name, req.row_id, req.updates)
    try:
        set_clause = ", ".join([f"{col} = ?" for col in req.updates.keys()])
        values = list(req.updates.values()) + [req.row_id]
        sql = f"UPDATE {req.table_name} SET {set_clause} WHERE id = ?"
        cursor.execute(sql, values)
        conn.commit()
        return {"message": f"Row with id {req.row_id} updated in {req.table_name}"}
    except Exception as e:
        print("Error updating row:", e)
        return {"error": "Failed to update row."}
    finally:
        conn.close()

@app.post("/insert_row")
def insert_row(req: InsertRowRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(req.table_name, req.row_data)
    try:
        # query="SELECT MAX(id) FROM {}".format(req.table_name)
        # cursor.execute(query)
        # id_num = cursor.fetchone()[0] + 1 if cursor.fetchone()[0] is not None else 1
        columns = ", ".join(req.row_data.keys())
        placeholders = ", ".join(["?"] * len(req.row_data))
        sql = f"INSERT INTO {req.table_name} ({columns}) VALUES ({placeholders})"
        res=cursor.execute(sql, list(req.row_data.values()))
        print(res)
        conn.commit()
        return {"message": "Row inserted successfully"}
    except Exception as e:
        print("Error inserting row:", e)
        return {"error": "Failed to insert row."}
    finally:
        conn.close()

@app.get("/trends")
def dummy():
    return analyze_trends()