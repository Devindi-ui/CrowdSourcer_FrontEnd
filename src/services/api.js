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
    login: (data) => api.post("/login", data)
}

//User API
export const userAPI = {
    register: (data) => api.post('/user', data)
}