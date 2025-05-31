
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pandas as pd
import requests
from visualize import generate_plot
import io
API_URL = "http://localhost:8001"
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "csv_text": "", "columns": [], "plot": None})

@app.post("/", response_class=HTMLResponse)
async def post_form(
    request: Request,
    table_name: str = Form(""),
    plot_type: str = Form(""),
    x_axis: str = Form(""),
    y_axis: str = Form("")
):
    columns = []
    plot = None
    try:
        res = requests.get(f"{API_URL}/display_table_for_visualization", params={"table_name": table_name})
        df = pd.read_csv(io.StringIO(res.text))
        columns = df.columns.tolist()
        if plot_type and x_axis:
            plot = generate_plot(res.text, plot_type, x_axis, y_axis)
    except Exception as e:
        print("Error:", e)

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "csv_text": res.text,
            "columns": columns,
            "plot": plot,
            "selected_plot": plot_type,
            "x_axis": x_axis,
            "y_axis": y_axis
        }
    )