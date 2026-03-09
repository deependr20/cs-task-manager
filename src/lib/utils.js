export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOverdue = (dueDate, status) => {
  return new Date(dueDate) < new Date() && status !== 'Completed';
};

export const getStatusColor = (status) => {
  const colors = {
    Pending: 'amber',
    'In Progress': 'blue',
    Completed: 'green',
  };
  return colors[status] || 'gray';
};

export const getPriorityColor = (priority) => {
  const colors = {
    Low: 'slate',
    Medium: 'orange',
    High: 'red',
  };
  return colors[priority] || 'gray';
};

/** Given a list of companies and a stored companyName (may be "Name" or "fileNo – Name"), return display label "fileNo – Name" when company has fileNumber, else companyName. */
export function getCompanyDisplayLabel(companies, companyName) {
  if (!companyName || typeof companyName !== 'string') return companyName || '';
  const nameOnly = companyName.includes(' – ') ? companyName.split(' – ').slice(1).join(' – ').trim() : companyName.trim();
  const company = Array.isArray(companies) && companies.find((c) => (c.name || '').trim() === nameOnly);
  if (company && company.fileNumber && String(company.fileNumber).trim()) {
    return `${String(company.fileNumber).trim()} – ${company.name || '–'}`;
  }
  return companyName;
}
