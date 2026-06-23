export const getDashboardPath = (role) => {
  const map = {
    ceo: '/dashboard/ceo',
    hr_manager: '/dashboard/hr',
    team_lead: '/dashboard/team-lead',
    employee: '/dashboard/employee',
  };

  return map[role] || '/login';
};
