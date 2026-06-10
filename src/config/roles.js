const allRoles = {
  user: [],
  agent: [],
  guest: [],
  admin: ['getUsers', 'manageUsers', 'getBuilders', 'manageBuilders', 'getProperties'],
  super_admin: ['getUsers', 'manageUsers', 'getBuilders', 'manageBuilders', 'getProperties'],
  builder: ['getBuilders'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
