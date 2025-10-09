const allRoles = {
  user: [],
  agent: [],
  guest: [],
  admin: ['getUsers', 'manageUsers', 'getBuilders', 'manageBuilders'],
  super_admin: ['getUsers', 'manageUsers', 'getBuilders', 'manageBuilders'],
  builder: ['getBuilders'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
