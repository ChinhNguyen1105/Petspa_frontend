export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  PROBATION: 'PROBATION',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
};
export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái', color: 'bg-gray-100 text-gray-600' },
  { value: USER_STATUS.ACTIVE, label: 'Đang làm việc', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { value: USER_STATUS.PROBATION, label: 'Thử việc', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  { value: USER_STATUS.SUSPENDED, label: 'Tạm đình chỉ', color: 'bg-amber-50 text-amber-600 border border-amber-200' },
  { value: USER_STATUS.TERMINATED, label: 'Đã nghỉ việc', color: 'bg-rose-50 text-rose-600 border border-rose-200' }
];