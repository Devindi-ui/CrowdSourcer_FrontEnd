import axios from "axios";

const api = axios.create(
    {
        baseURL: `http://localhost:5000/api/v1`,
        headers:{
            'Content-Type':`application/json`
        }
    }
);

// authAPI.js or in your api/index.js
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyResetToken: (token) => api.get(`/auth/verify-reset-token/${token}`),

    updatePassword: (data) => api.post('/auth/update-password', data)
};

// Dashboard API 
export const dashboardAPI = {
    getAuthCount: () => api.get("/auth/count"),
    getUserCount: () => api.get("/user/count"), // Alternative if you have user count endpoint
    getBusCount: () => api.get("/bus/count"),
    getTripCount: () => api.get("/trip/count"),
    getAlertCount: () => api.get("/alert/count")
};

//User API
export const userAPI = {
    register: (user) => api.post('/user', user),  // Add user
    getAllUsers: () => api.get(`/user/all`),  // FIND
    getUserById: (id) => api.get(`/user/find/${id}`),  // FIND
    getUserByText: (text) => api.get(`/user/search/${encodeURIComponent(text)}`),  // FIND
    updateUser: (id, user) => api.put(`/user/update/${id}`, user), // UPDATE
    deleteUser: (userId) => api.delete(`/user/delete/${userId}`),  // DELETE
}

// BusAssignment API 
export const busAssignmentAPI = {
    createAssignment: (assignment) => api.post('/busAssignment/create', assignment),
    getAllAssignments: () => api.get('/busAssignment/all'),
    getAssignmentById: (id) => api.get(`/busAssignment/find/${id}`),
    getAssignmentByText: (text) => api.get(`/busAssignment/search/${encodeURIComponent(text)}`),
    updateAssignment: (id, assignment) => api.put(`/busAssignment/update/${id}`, assignment),
    deleteAssignment: (assignmentID) => api.delete(`/busAssignment/delete/${assignmentID}`),
};

// Bus API
export const busAPI = {
    // Create bus
    createBus: (bus) => api.post('/bus/create', bus),
    
    // Get all buses
    getAllBuses: () => api.get('/bus/all'),
    
    // Get bus by ID 
    getBusById: (id) => api.get(`/bus/find/${id}`),
    
    // Get buses by route number
    getBusesByRouteNo: (route_no) => 
        api.get(`/bus/findByRouteNo/${encodeURIComponent(route_no)}`),
    
    // Search buses by text
    getBusByText: (text) => 
        api.get(`/bus/search/${encodeURIComponent(text)}`),
    
    // Update bus
    updateBus: (id, bus) => api.put(`/bus/update/${id}`, bus),
    
    // Delete bus
    deleteBus: (busId) => api.delete(`/bus/delete/${busId}`),
    
    // Get bus count
    getBusCount: () => api.get('/bus/count')
};

//BusType API
export const busTypeAPI = {
    createBusType: (busType) => api.post('/busType/create', busType),  // Add busType
    getAllBusTypes: () => api.get(`/busType/all`),  // FIND
    getBusTypeById: (id) => api.get(`/busType/find/${id}`),  // FIND
    getBusTypeByText: (text) => api.get(`/busType/search/${encodeURIComponent(text)}`),  // FIND
    updateBusType: (id, busType) => api.put(`/busType/update/${id}`, busType), // UPDATE
    deleteBusType: (busTypeId) => api.delete(`/busType/delete/${busTypeId}`),  // DELETE
}

//CrowdReport API - No comments as requested
export const crowdReportAPI = {
    createCrowdReport: (crowdReport) => api.post('/crowdReport/create', crowdReport),
    getAllCrowdReports: () => api.get('/crowdReport/all'),
    getCrowdReportById: (id) => api.get(`/crowdReport/find/${id}`),
    getCrowdReportByText: (text) => api.get(`/crowdReport/search/${encodeURIComponent(text)}`),
    updateCrowdReport: (id, crowdReport) => api.put(`/crowdReport/update/${id}`, crowdReport),
    deleteCrowdReport: (crowdReportId) => api.delete(`/crowdReport/delete/${crowdReportId}`),
    // Get buses by route number
    getBusesByRouteNo: (route_no) => api.get(`/crowdReport/buses-by-route/${encodeURIComponent(route_no)}`),
    getTripsInDateRange: (bus_no, route_no, from_date, to_date) => 
    api.get(`/crowdReport/trips-in-range/${encodeURIComponent(bus_no)}/${encodeURIComponent(route_no)}/${from_date}/${to_date}`),
};

//favouriteRoute API
export const favouriteRouteAPI = {
    create: (favouriteRoute) => api.post('/favouriteRoute/create', favouriteRoute),
    getAllFavouriteRoutes: () => api.get('/favouriteRoute/all'),
    getFavouriteRouteById: (id) => api.get(`/favouriteRoute/find/${id}`),
    getFavouriteRouteByText: (text) => api.get(`/favouriteRoute/search/${encodeURIComponent(text)}`),
    updateFavouriteRoute: (id, favouriteRoute) => api.put(`/favouriteRoute/update/${id}`, favouriteRoute),
    deleteFavouriteRoute: (favouriteRouteId) => api.delete(`/favouriteRoute/delete/${favouriteRouteId}`),
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

//feedback API
export const feedbackAPI = {
    create: (feedback) => api.post('/feedback/create', feedback),  // Add feedback 
    getAllFeedbacks: () => api.get(`/feedback/all`),  // FIND
    getFeedbackByText: (text) => {
    // If no text provided, don't make the request
    if (!text) {
        return Promise.reject(new Error("Search text is required"));
    }
    return api.get(`/feedback/search/${text}`);
    },
    getFeedbackByText: (text) => api.get(`/feedback/search/${encodeURIComponent(text)}`),  // FIND
    updateFeedback: (id, feedback) => api.put(`/feedback/update/${id}`, feedback), // UPDATE
    deleteFeedback: (feedbackId) => api.delete(`/feedback/delete/${feedbackId}`),  // DELETE
}

// Trip API
export const tripAPI = {
    createTrip: (trip) => api.post('/trip/create', trip),
    getAllTrips: () => api.get('/trip/all'),
    getTripById: (id) => api.get(`/trip/find/${id}`),
    getTripByText: (text) => api.get(`/trip/search/${encodeURIComponent(text)}`),
    updateTrip: (id, trip) => api.put(`/trip/update/${id}`, trip),
    deleteTrip: (id) => api.delete(`/trip/delete/${id}`),
    getTripCount: () => api.get('/trip/count')
};

// Role API - Complete with all CRUD operations
export const roleAPI = {
    // Get all roles
    getAllRoles: () => api.get("/role/all"),
    
    // Get role by ID
    getRoleById: (id) => api.get(`/role/find/${id}`),
    
    // Search roles by text
    getRoleByText: (text) => api.get(`/role/search/${encodeURIComponent(text)}`),
    
    // Create new role
    createRole: (data) => api.post("/role/create", data),
    
    // Update role
    updateRole: (id, data) => api.put(`/role/update/${id}`, data),
    
    // Delete role
    deleteRole: (id) => api.delete(`/role/delete/${id}`)
};

// Route API - All methods now support route_no
export const routeAPI = {
    // Get all routes
    getAllRoutes: () => api.get("/route/all"),
    
    // Get route by ID (internal use only, keep for compatibility)
    getRouteById: (id) => api.get(`/route/find/${id}`),
    
    // Get route by route_no
    getRouteByNumber: (route_no) => api.get(`/route/findByRouteNo/${encodeURIComponent(route_no)}`),
    
    // Search routes by text
    getRouteByText: (text) => api.get(`/route/search/${encodeURIComponent(text)}`),
    
    // Create new route
    createRoute: (data) => api.post("/route/create", data),
    
    // Update route by ID (internal use only, keep for compatibility)
    updateRoute: (id, data) => api.put(`/route/update/${id}`, data),
    
    //Update route by route_no
    updateRouteByNumber: (route_no, data) => 
        api.put(`/route/updateByRouteNo/${encodeURIComponent(route_no)}`, data),
    
    // Delete route by ID (internal use only, keep for compatibility)
    deleteRoute: (id) => api.delete(`/route/delete/${id}`),
    
    // Delete route by route_no
    deleteRouteByNumber: (route_no) => 
        api.delete(`/route/deleteByRouteNo/${encodeURIComponent(route_no)}`)
};

//CurrentSituation API 
export const currentSituationAPI = {
    create: (data) => api.post("/currentSituation/create", data),
    getAll: () => api.get("/currentSituation/all"),
    getById: (id) => api.get(`/currentSituation/id/${id}`),
    getByText: (text) => api.get(`/currentSituation/search/${text}`),
    delete: (id) => api.put(`/currentSituation/delete/${id}`)
}

// routeStop API
export const routeStopAPI = {
    // Create single route stop
    createRouteStop: (data) => api.post('/routeStop/create', data),
    // Bulk create - sends route_no
    bulkCreate: (data) => api.post('/routeStop/bulk', data),
    getAllRouteStops: () => api.get('/routeStop/all'),
    getByRouteNo: (routeNo) => 
        api.get(`/routeStop/byRouteNo/${encodeURIComponent(routeNo)}`),
    getByIdRouteStop: (id) => 
        api.get(`/routeStop/find/${id}`),
    getByTextRouteStop: (text) => 
        api.get(`/routeStop/search/${encodeURIComponent(text)}`),
    updateRouteStop: (id, data) => 
        api.put(`/routeStop/update/${id}`, data),
    bulkUpdate: (data) => 
        api.put('/routeStop/bulk-update', data),
    deleteRouteStop: (id) => 
        api.delete(`/routeStop/delete/${id}`),
    deleteRouteStopsByRouteNo: (routeNo) =>
        api.delete(`/routeStop/deleteByRouteNo/${encodeURIComponent(routeNo)}`)
};

// Profile API
export const profileAPI = {
    // Get user profile
    getProfile: () => api.get('/profile'),
    
    // Update profile (name and phone)
    updateProfile: (data) => api.put('/profile', data),
    
    // Upload profile picture
    uploadPicture: (file) => {
        const formData = new FormData();
        formData.append('profile_picture', file);
        return api.post('/profile/picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    // Delete profile picture
    deletePicture: () => api.delete('/profile/picture')
};