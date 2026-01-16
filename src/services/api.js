import axios from "axios";

const api = axios.create(
    {
        baseURL: `http://localhost:5000/api/v1`,
        headers:{
            'Content-Type':`application/json`
        }
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post("auth/login", data)
}

//User API
export const userAPI = {
    register: (data) => api.post('/user', data)
}

//Dashboard API 
export const dashboardAPI = {
    users: () => api.get("/auth/count"),
    buses: () => api.get("/bus/count"),
    trips: () => api.get("/trip/count"),
    alerts: () => api.get("/alert/count")
}