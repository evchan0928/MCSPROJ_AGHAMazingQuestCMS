export const STATUS_LABELS = {
  // canonical workflow states (frontend display values)
  for_editing: 'For Editing',
  for_approval: 'For Approval',
  approved: 'Approved',
  for_publishing: 'For Publishing',
  published: 'Published',
  deleted: 'Deleted',

  // legacy / alternate keys mapped to canonical values
  uploaded: 'For Editing',
  edited: 'For Approval',
  pending_approval: 'For Approval',
};

export const STATUS_COLORS = {
  for_editing: 'default',
  for_approval: 'orange',
  approved: 'blue',
  for_publishing: 'geekblue',
  published: 'green',
  deleted: 'gray',
};

export default function statusLabel(status) {
  if (status === null || status === undefined) return '';
  const key = String(status).toLowerCase();
  return STATUS_LABELS[key] || String(status);
}

export function getStatusColor(status) {
  if (status === null || status === undefined) return 'default';
  const key = String(status).toLowerCase();
  return STATUS_COLORS[key] || 'default';
}
