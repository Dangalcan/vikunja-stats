export function getWeek(dateStr) {
  const date = new Date(dateStr);
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date - oneJan) / 86400000);
  return Math.ceil((dayOfYear + oneJan.getDay() + 1) / 7);
}
