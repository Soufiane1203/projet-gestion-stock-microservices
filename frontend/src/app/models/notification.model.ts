export interface Notification {
  id?: number;
  message: string;
  timestamp?: Date;
  type?: 'ALERT' | 'INFO' | 'WARNING';
}
