export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getWeekRange = (weeks: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getMonthRange = (months: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getMonthDaysRange = (monthString: string): { startDate: string; endDate: string } => {
  const [year, month] = monthString.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-indexed
  const endDate = new Date(year, month, 0); // Last day of the month
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};