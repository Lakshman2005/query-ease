import requests
import pandas as pd

API_URL = "http://localhost:8001"
# while True:
#     table= input("Enter the table name to display (or 'exit' to quit): ")
#     # print("Welcome to the SQL Query Interface!")
#     # nl_query = input("Enter your natural language query: ")
#     # response = requests.post(API_URL, json={"natural_language": nl_query})
#     # response = requests.get(TABLE_API_URL, params={"table_name": table})
#     # madda=requests.get("http://localhost:8000/list_tables")

#     # if response.status_code == 200:
#     #     # Only print the generated SQL query
#     #     print(response.json())
#     # if madda.status_code == 200:
#     #     print(madda.json())
while True:
    option=int(input())
    if option == 1:
        response=requests.delete(f"{API_URL}/delete_row", params={"table_name": "customers", "row_id": 1})
        if response.status_code == 200:
            print("Row deleted successfully.")
    if option == 2:
        response=requests.patch(f"{API_URL}/update_row", json={"table_name": "customers", "row_id": 3,"updates": {"name":"gundus","email":"charlie@example.com","signup_date":"2022-12-01"}})
        if response.status_code == 200:
            print("Row updated successfully.")
        print(response.json())
    if option == 3:
        response=requests.post(f"{API_URL}/insert_row", json={'table_name': 'customers', "row_data":{"name": "Alice", "email": "alice@example.com", "signup_date": "2023-01-01"}})
        if response.status_code == 200:
            print("Row inserted successfully.")
    if option == 4:
        response=requests.get(f"{API_URL}/display_table_for_visualization", params={"table_name": "customers"})
        if response.status_code == 200:
            # data = response.json()
            print(response.text)
            # df = pd.DataFrame(data['rows'], columns=data['columns'])
            # print(df)