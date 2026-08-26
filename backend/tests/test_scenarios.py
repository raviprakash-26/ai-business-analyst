from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_what_if_revenue_increase():
    response = client.post("/scenarios/what-if", json={"revenue": 100000, "profit": 20000, "revenue_change_pct": 10, "cost_change_pct": 0})
    assert response.status_code == 200
    body = response.json()
    assert body["projected"]["revenue"] == 110000
    assert body["projected"]["profit"] == 30000
    assert body["impact"]["profit_delta"] == 10000


def test_what_if_rejects_zero_revenue():
    response = client.post("/scenarios/what-if", json={"revenue": 0, "profit": 0})
    assert response.status_code == 422
