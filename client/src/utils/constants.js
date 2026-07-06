export const EVENT_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  planning: { label: 'Perencanaan', color: 'blue' },
  approval: { label: 'Menunggu Persetujuan', color: 'yellow' },
  in_progress: { label: 'Berlangsung', color: 'blue' },
  completed: { label: 'Selesai', color: 'green' },
  cancelled: { label: 'Dibatalkan', color: 'red' },
};

export const REGISTRATION_STATUSES = {
  pending: { label: 'Menunggu', color: 'yellow' },
  confirmed: { label: 'Dikonfirmasi', color: 'green' },
  rejected: { label: 'Ditolak', color: 'red' },
  cancelled: { label: 'Dibatalkan', color: 'gray' },
};

export const PRIORITIES = {
  low: { label: 'Rendah', color: 'gray' },
  medium: { label: 'Sedang', color: 'yellow' },
  high: { label: 'Tinggi', color: 'orange' },
  urgent: { label: 'Mendesak', color: 'red' },
};

export const EVENT_FORMATS = {
  offline: 'Offline',
  online: 'Online',
  hybrid: 'Hybrid',
};

export const EVENT_TONES = {
  formal: 'Formal',
  semi_formal: 'Semi Formal',
  casual: 'Casual',
  festive: 'Festive',
};

export const CHECKLIST_CATEGORIES = {
  venue: 'Tempat',
  equipment: 'Peralatan',
  catering: 'Catering',
  decoration: 'Dekorasi',
  documentation: 'Dokumentasi',
  transportation: 'Transportasi',
  personnel: 'Personnel',
  miscellaneous: 'Lainnya',
};

export const DOC_TYPES = {
  proposal: 'Proposal',
  invitation: 'Undangan',
  rundown: 'Rundown',
  budget: 'Anggaran',
  report: 'Laporan',
  other: 'Lainnya',
};

export const APPROVAL_STATUSES = {
  pending: { label: 'Menunggu', color: 'yellow' },
  approved: { label: 'Disetujui', color: 'green' },
  rejected: { label: 'Ditolak', color: 'red' },
  revision: { label: 'Revisi', color: 'orange' },
};

export const TIMELINE_PHASES = [
  { key: 'h30', label: 'H-30' },
  { key: 'h21', label: 'H-21' },
  { key: 'h14', label: 'H-14' },
  { key: 'h7', label: 'H-7' },
  { key: 'h3', label: 'H-3' },
  { key: 'h1', label: 'H-1' },
  { key: 'hari_h', label: 'Hari-H' },
  { key: 'h1_after', label: 'H+1' },
  { key: 'h7_after', label: 'H+7' },
];

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  staff: 'Staff',
  pic: 'PIC Event',
  viewer: 'Viewer',
};
