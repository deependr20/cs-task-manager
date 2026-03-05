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
