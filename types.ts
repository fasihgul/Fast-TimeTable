
export interface TimetableEntry {
  day: string;
  time: string;
  venue: string;
  course: string;
  section: string;
  teacher: string;
}

export type UploadMode = 'merge' | 'replace';

export interface AppStats {
    entries: number;
    days: number;
    sections: number;
}