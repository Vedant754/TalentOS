export const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  return `Rs. ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatRole = (role) => {
  if (!role) return 'Unknown';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getEmployeeName = (employee) => {
  if (!employee) return 'Unknown employee';
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email || 'Unknown employee';
};
