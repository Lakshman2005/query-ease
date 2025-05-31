from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
import sqlite3
import pandas as pd
import numpy as np


def analyze_trends():
    SALES_TRENDS = "sales_trends.db"
    try:
        conn = sqlite3.connect(SALES_TRENDS)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sales'")
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Sales table not found")

        # CORRECTED QUERY WITH PROPER AGGREGATION
        query = """
SELECT 
    item_id, 
    item_name, 
    CASE
        WHEN typeof(date) = 'integer' 
        THEN substr(date, 1, 4) || '-' || 1 || '-' || 1
        ELSE date
    END AS date,
    COUNT(*) AS sales_count 
FROM sales 
GROUP BY item_id, item_name, date
"""
        df = pd.read_sql_query(query, conn)
        
        if df.empty:
            return {"trends": {}}

        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        if df['date'].isnull().any():
            raise HTTPException(status_code=500, detail="Invalid date format in database")

        trends = {}
        
        for (item_id, item_name), group in df.groupby(['item_id', 'item_name']):
            min_date = group['date'].min()
            max_date = group['date'].max()
            full_dates = pd.date_range(start=min_date, end=max_date, freq='D')
            
            group = (group.set_index('date')
                     .reindex(full_dates)
                     .fillna({'sales_count': 0})
                     .ffill())
            
            group['moving_avg'] = (group['sales_count']
                                   .rolling(7, min_periods=1)
                                   .mean()
                                   .round(2)
                                   .fillna(0))
            
            trends[f"{item_id}-{item_name}"] = {
                "dates": group.index.strftime('%Y').tolist(),
                "sales": group['sales_count'].astype(int).tolist(),
                "trend_line": group['moving_avg'].replace({np.nan: None}).tolist()
            }

        data= {"trends": trends}
        # print(data,type(data))
        item_dict={}
        for t in data.values():
            for i in t.values():
                # print(i)
                try:
                    item_dict[[key for key, val in t.items() if val == i][0]].append(i['trend_line'][0])
                except KeyError:
                    item_dict[[key for key, val in t.items() if val == i][0]]=i['trend_line']
        for i in item_dict.keys():
            # print(item_dict[i][0])
            unique=[item_dict[i][0]]
            for item in item_dict[i]:
                if item not in unique:
                    unique.append(item)
            item_dict[i]=unique
        sales_dict={}
        for t in data.values():
            for i in t.values():
                # print(i)
                try:
                    sales_dict[[key for key, val in t.items() if val == i][0]].append(i['sales'][0])
                except KeyError:
                    sales_dict[[key for key, val in t.items() if val == i][0]]=i['sales']
        for i in sales_dict.keys():
            # print(item_dict[i][0])
            unique=[sales_dict[i][0]]
            for item in sales_dict[i]:
                if item not in unique:
                    unique.append(item)
            sales_dict[i]=unique
        print(sales_dict)


        # max_len=max(list(map(len,item_dict.values())))
        # print(max_len)
        # for key in item_dict.keys():
        #     if len(item_dict[key])<max_len:
        #         while len(item_dict[key])==max_len:
        #             item_dict[key].append(0.0)
        print(item_dict)
        # df=pd.DataFrame(dict([ (k,pd.Series(v)) for k,v in item_dict.items() ]))
        ret_dict={}

        for item, trend_list in item_dict.items():
            if len(trend_list) < 2:
                ret_dict[item]="Down trend"
                print(f"{item}: down stream.")
                continue

            if len(trend_list) > 5:
                ret_dict[item]="Up trend"
                print(f"{item}: Upstream...")
                continue

        return {"trends": ret_dict}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except pd.errors.DatabaseError as e:
        raise HTTPException(status_code=400, detail=f"Invalid query: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
analyze_trends()