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
    login: (user) => api.post("auth/login", user)
}

//User API
export const userAPI = {
    register: (user) => api.post('/user', user),  // Add user
    getAllUsers: () => api.get(`/user/all`),  // FIND
    getUserById: (id) => api.get(`/user/find/${id}`),  // FIND
    getUserByText: (text) => api.get(`/user/search/${encodeURIComponent(text)}`),  // FIND
    updateUser: (id, user) => api.put(`/user/update/${id}`, user), // UPDATE
    deleteUser: (userId) => api.delete(`/user/delete/${userId}`),  // DELETE
}

//Dashboard API 
export const dashboardAPI = {
    users: () => api.get("/auth/count"),
    buses: () => api.get("/bus/count"),
    trips: () => api.get("/trip/count"),
    alerts: () => api.get("/alert/count")
}

//Role API
export const roleAPI = {
    getAllRoles: () => api.get("/role/all")
}