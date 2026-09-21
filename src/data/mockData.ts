import { 
  INITIAL_BENTO_DATA_ALGERIA, 
  INITIAL_FINANCIALS_ALGERIA, 
  INITIAL_INBOX_ALGERIA, 
  INITIAL_SCHEDULES_ALGERIA,
  FLASK_MONGODB_ALGERIA_BACKEND
} from './algerianBusinessData';
import { ScheduleDay } from '../types';

export const INITIAL_BENTO_DATA = INITIAL_BENTO_DATA_ALGERIA;
export const INITIAL_FINANCIALS = INITIAL_FINANCIALS_ALGERIA;
export const INITIAL_INBOX = INITIAL_INBOX_ALGERIA;
export const INITIAL_SCHEDULES = INITIAL_SCHEDULES_ALGERIA;
export const FLASK_BACKEND_CODE = FLASK_MONGODB_ALGERIA_BACKEND;

export const SCHEDULE_DAYS: ScheduleDay[] = [
  { dayName: 'Dim', dayNum: 20, dateStr: '20 Septembre 2026', isToday: true },
  { dayName: 'Lun', dayNum: 21, dateStr: '21 Septembre 2026' },
  { dayName: 'Mar', dayNum: 22, dateStr: '22 Septembre 2026' },
  { dayName: 'Mer', dayNum: 23, dateStr: '23 Septembre 2026' },
  { dayName: 'Jeu', dayNum: 24, dateStr: '24 Septembre 2026' },
  { dayName: 'Ven', dayNum: 25, dateStr: '25 Septembre 2026' },
  { dayName: 'Sam', dayNum: 26, dateStr: '26 Septembre 2026' },
];
