export const roleConfig = {
  admin: {
    name: 'Admin',
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canViewAll: true,
    showActions: true,
    dashboardPath: '/admin',
    menuItems: [
      { path: '/admin/user', label: 'Users', icon: 'FaUsers' },
      { path: '/admin/bus', label: 'Buses', icon: 'FaBus' },
      { path: '/admin/route', label: 'Routes', icon: 'FaRoute' },
      { path: '/admin/trip', label: 'Trips', icon: 'FaRoad' },
      { path: '/admin/crowd-report', label: 'Crowd Reports', icon: 'FaClipboardList' },
      { path: '/admin/alert', label: 'Alerts', icon: 'FaExclamationTriangle' },
      { path: '/admin/bus-assignment', label: 'Bus Assignments', icon: 'FaBusAlt' },
      { path: '/admin/bus-type', label: 'Bus Types', icon: 'FaRoad' },
      { path: '/admin/current-situation', label: 'Current Situation', icon: 'FaClock' },
      { path: '/admin/favourite-route', label: 'Favourite Routes', icon: 'FaHeart' },
      { path: '/admin/feedback', label: 'Feedback', icon: 'FaComment' },
      { path: '/admin/role', label: 'Roles', icon: 'FaUserShield' },
      { path: '/admin/route-stop', label: 'Route Stops', icon: 'FaMapSigns' }
    ]
  },
  
  passenger: {
    name: 'Passenger',
    canAdd: true,
    canEdit: false,
    canDelete: true,
    canViewAll: false,
    showActions: false,
    dashboardPath: '/passenger',
    allowedModules: {
      'bus': { view: true, add: false, edit: false, delete: false },
      'route': { view: true, add: false, edit: false, delete: false },
      'crowd-report': { view: true, add: true, edit: false, delete: false },
      'favourite-route': { view: true, add: true, edit: false, delete: true },
      'feedback': { view: true, add: true, edit: false, delete: false },
      'alert': { view: true, add: false, edit: false, delete: false },
      'current-situation': { view: true, add: true, edit: false, delete: false }
    },
    menuItems: [
      { path: '/passenger', label: 'Dashboard', icon: 'FaHome' },
      { path: '/passenger/bus', label: 'Live Buses', icon: 'FaBus' },
      { path: '/passenger/route', label: 'Routes', icon: 'FaRoute' },
      { path: '/passenger/crowd-report', label: 'Report Crowd', icon: 'FaClipboardList' },
      { path: '/passenger/favourite-route', label: 'My Favourites', icon: 'FaHeart' },
      { path: '/passenger/feedback', label: 'Feedback', icon: 'FaComment' },
      { path: '/passenger/alert', label: 'Alerts', icon: 'FaExclamationTriangle' },
      { path: '/passenger/current-situation', label: 'Live Updates', icon: 'FaClock' }
    ]
  },
  
  driver: {
    name: 'Driver/Conductor',
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false,
    showActions: false,
    dashboardPath: '/driver',
    allowedModules: {
      'bus': { view: true, add: false, edit: false, delete: false },
      'current-situation': { view: true, add: true, edit: true, delete: false },
      'trip': { view: true, add: false, edit: false, delete: false },
      'route': { view: true, add: false, edit: false, delete: false }
    },
    menuItems: [
      { path: '/driver', label: 'Dashboard', icon: 'FaHome' },
      { path: '/driver/current-situation', label: 'Update Situation', icon: 'FaClock' },
      { path: '/driver/bus', label: 'My Bus', icon: 'FaBus' },
      { path: '/driver/trip', label: 'My Trips', icon: 'FaRoad' },
      { path: '/driver/route', label: 'Routes', icon: 'FaRoute' }
    ]
  },
  
  owner: {
    name: 'Owner',
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canViewAll: true,
    showActions: false,
    dashboardPath: '/owner',
    allowedModules: {
      'bus': { view: true, add: false, edit: false, delete: false },
      'route': { view: true, add: false, edit: false, delete: false },
      'trip': { view: true, add: false, edit: false, delete: false },
      'crowd-report': { view: true, add: false, edit: false, delete: false },
      'analytics': { view: true, add: false, edit: false, delete: false }
    },
    menuItems: [
      { path: '/owner', label: 'Dashboard', icon: 'FaHome' },
      { path: '/owner/bus', label: 'Buses', icon: 'FaBus' },
      { path: '/owner/route', label: 'Routes', icon: 'FaRoute' },
      { path: '/owner/trip', label: 'Trips', icon: 'FaRoad' },
      { path: '/owner/crowd-report', label: 'Crowd Reports', icon: 'FaClipboardList' },
      { path: '/owner/analytics', label: 'Analytics', icon: 'FaChartLine' }
    ]
  }
};