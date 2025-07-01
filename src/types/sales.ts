export interface SalesRecord {
  id?: string;
  date: string;
  cashAmount: number;
  onlineAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface ChartData {
  date: string;
  cash: number;
  online: number;
  total: number;
  label: string;
}

export type ViewType = 'cash' | 'online' | 'total';
export type PeriodType = 'daily' | 'weekly' | 'monthly';