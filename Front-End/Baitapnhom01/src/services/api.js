import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // backend chạy ở cổng 5000 + prefix /api

export const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};
