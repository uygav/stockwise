from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression
import numpy as np


app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

class DepletionRequest(BaseModel): #req part
    current_stock: int
    daily_sales: list[float]

@app.post("/predict/depletion")
def predict_depletion(payload:DepletionRequest):
    days = len(payload.daily_sales)
    X = np.arange(days).reshape(-1,1)
    y = np.array(payload.daily_sales)

    model = LinearRegression()
    model.fit(X ,y)

    stock = payload.current_stock
    future_day = days
    max_days_to_check = 365

    while future_day < days + max_days_to_check :
        predicted_rate = max(0, model.predict([[future_day]])[0])

        if predicted_rate == 0:
            return {"estimated_days_until_depletion": None, "daily_sales_rate": float(predicted_rate)}

        stock -= predicted_rate
        
        if stock <= 0:
            return {
                "estimated_days_until_depletion": future_day - days + 1,
                "daily_sales_rate": float(model.predict([[days]])[0]),
            }

        future_day += 1

    return {"estimated_days_until_depletion": None, "daily_sales_rate": float(model.predict([[days]])[0])}