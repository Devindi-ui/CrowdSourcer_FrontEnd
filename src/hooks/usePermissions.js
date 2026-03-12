import useRole from './useRole';
import { roleConfig } from '../config/roleConfig';

const usePermissions = (moduleName = null) => {
  const role = useRole();
  const config = roleConfig[role] || roleConfig.passenger;
  
  const can = (action) => {
    if (!moduleName) return config[action] || false;
    
    // Check module-specific permissions
    const modulePerms = config.allowedModules?.[moduleName];
    if (!modulePerms) return false;
    
    switch(action) {
      case 'view': return modulePerms.view || false;
      case 'add': return modulePerms.add || false;
      case 'edit': return modulePerms.edit || false;
      case 'delete': return modulePerms.delete || false;
      default: return false;
    }
  };
  
  return {
    role,
    config,
    canAdd: config.canAdd,
    canEdit: config.canEdit,
    canDelete: config.canDelete,
    showActions: config.showActions,
    can,
    isAdmin: role === 'admin',
    isPassenger: role === 'passenger',
    isDriver: role === 'driver',
    isOwner: role === 'owner'
  };
};

export default usePermissions;