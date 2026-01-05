export const STATUS_LABELS = {
  // old values
  uploaded: 'Uploaded',
  edited: 'For Approval',
  pending_approval: 'For Approval',
  approved: 'For Publishing',
  published: 'Published',
  deleted: 'Deleted',
  // new workflow values
  for_editing: 'For editing',
  for_approval: 'For Approval',
  for_publishing: 'For Publishing',
};

export default function statusLabel(status) {
  if (!status && status !== 0) return '';
  const key = String(status).toLowerCase();
  return STATUS_LABELS[key] || status;
}
