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

//Dashboard API 
export const dashboardAPI = {
    users: () => api.get("/auth/count"),
    buses: () => api.get("/bus/count"),
    trips: () => api.get("/trip/count"),
    alerts: () => api.get("/alert/count")
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

//BusAssignment API
export const busAssignmentAPI = {
    createAssignment: (assignment) => api.post('/busAssignment/create', assignment),  // Add assignment
    getAllAssignments: () => api.get(`/busAssignment/all`),  // FIND
    getAssignmentById: (id) => api.get(`/busAssignment/find/${id}`),  // FIND
    getAssignmentByText: (text) => api.get(`/busAssignment/search/${encodeURIComponent(text)}`),  // FIND
    updateAssignment: (id, assignment) => api.put(`/busAssignment/update/${id}`, assignment), // UPDATE
    deleteAssignment: (assignmentID) => api.delete(`/busAssignment/delete/${assignmentID}`),  // DELETE
}

//Bus API
export const busAPI = {
    createBus: (bus) => api.post('/bus/create', bus),  // Add bus
    getAllBuses: () => api.get(`/bus/all`),  // FIND
    getBusById: (id) => api.get(`/bus/find/${id}`),  // FIND
    getBusByText: (text) => api.get(`/bus/search/${encodeURIComponent(text)}`),  // FIND
    updateBus: (id, bus) => api.put(`/bus/update/${id}`, bus), // UPDATE
    deleteBus: (busId) => api.delete(`/bus/delete/${busId}`),  // DELETE
}

//BusType API
export const busTypeAPI = {
    createBusType: (busType) => api.post('/busType/create', busType),  // Add busType
    getAllBusTypes: () => api.get(`/busType/all`),  // FIND
    getBusTypeById: (id) => api.get(`/busType/find/${id}`),  // FIND
    getBusTypeByText: (text) => api.get(`/busType/search/${encodeURIComponent(text)}`),  // FIND
    updateBusType: (id, busType) => api.put(`/busType/update/${id}`, busType), // UPDATE
    deleteBusType: (busTypeId) => api.delete(`/busType/delete/${busTypeId}`),  // DELETE
}

//CrowdReport API
export const crowdReportAPI = {
    createCrowdReport: (crowdReport) => api.post('/crowdReport/create', crowdReport),  // Add crowdReport
    getAllCrowdReports: () => api.get(`/crowdReport/all`),  // FIND
    getCrowdReportById: (id) => api.get(`/crowdReport/find/${id}`),  // FIND
    getCrowdReportByText: (text) => api.get(`/crowdReport/search/${encodeURIComponent(text)}`),  // FIND
    updateCrowdReport: (id, crowdReport) => api.put(`/crowdReport/update/${id}`, crowdReport), // UPDATE
    deleteCrowdReport: (crowdReportId) => api.delete(`/crowdReport/delete/${crowdReportId}`),  // DELETE
}

//Alert API
export const alertAPI = {
    create: (alert) => api.post('/alert/create', alert),  // Add alert 
    getAllAlerts: () => api.get(`/alert/all`),  // FIND
    getAlertById: (id) => api.get(`/alert/find/${id}`),  // FIND
    getAlertByText: (text) => api.get(`/alert/search/${encodeURIComponent(text)}`),  // FIND
    updateAlert: (id, alert) => api.put(`/alert/update/${id}`, alert), // UPDATE
    deleteAlert: (alertId) => api.delete(`/alert/delete/${alertId}`),  // DELETE
}

//Trip API
export const tripAPI = {
    getAllTrips: () => api.get("/trip/all")
}

//Role API
export const roleAPI = {
    getAllRoles: () => api.get("/role/all")
}

//Route API
export const routeAPI = {
    getAllRoutes: () => api.get("/route/all")
}