
import { TimetableEntry } from '../types';

// Let TypeScript know that XLSX is available globally from the CDN script
declare const XLSX: any;

const DAYS_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function normalizeDay(s: string): string {
    if (!s) return "";
    s = ("" + s).trim().toUpperCase();
    if (s.includes("MON")) return "MONDAY";
    if (s.includes("TUE")) return "TUESDAY";
    if (s.includes("WED")) return "WEDNESDAY";
    if (s.includes("THU")) return "THURSDAY";
    if (s.includes("FRI")) return "FRIDAY";
    if (s.includes("SAT")) return "SATURDAY";
    if (s.includes("SUN")) return "SUNDAY";
    return s;
}

export function sortDays(days: string[]): string[] {
    return [...days].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
}

// --- CSV parser (expects tidy columns): day,time,venue,course,section,teacher
export function parseCSV(file: File): Promise<TimetableEntry[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read CSV.'));
        reader.onload = () => {
            try {
                const text = reader.result as string;
                const lines = text.split(/\r?\n/).filter(Boolean);
                if (!lines.length) return resolve([]);
                const header = lines.shift()!.split(',').map(s => s.trim().toLowerCase());
                const idx = (name: string) => header.indexOf(name);
                const out: TimetableEntry[] = [];
                for (const line of lines) {
                    const cols = line.split(',');
                    out.push({
                        day: cols[idx('day')] || '',
                        time: cols[idx('time')] || '',
                        venue: cols[idx('venue')] || '',
                        course: cols[idx('course')] || '',
                        section: (cols[idx('section')] || '').replace(/ /g, ''),
                        teacher: cols[idx('teacher')] || ''
                    });
                }
                resolve(out);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
}

// --- Excel parser for raw timetable (one sheet per weekday)
export function parseXLSX(file: File): Promise<TimetableEntry[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read Excel file.'));
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const out: TimetableEntry[] = [];

                for (const sheetName of wb.SheetNames) {
                    const day = normalizeDay(sheetName);
                    if (!day) continue;

                    const ws = wb.Sheets[sheetName];
                    const arr: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) || [];
                    if (!arr.length) continue;

                    let timeRowIdx = arr.findIndex(r => r && ('' + (r[0] || '')).toLowerCase().includes('venues/time'));
                    if (timeRowIdx < 0) timeRowIdx = 2; // Fallback

                    const times: { [key: number]: string } = {};
                    const timeRowArr = arr[timeRowIdx] || [];
                    for (let c = 1; c < timeRowArr.length; c++) {
                        const v = (timeRowArr[c] || '').toString().trim();
                        if (v) times[c] = v;
                    }

                    let classRowIdx = arr.findIndex(r => r && ('' + (r[0] || '')).toUpperCase().includes('CLASSROOMS'));
                    let startR = classRowIdx >= 0 ? classRowIdx + 1 : timeRowIdx + 1;

                    const reSection = /\bB[A-Z]{1,4}\s?-?\d{1,2}[A-Z]?\b/;

                    for (let r = startR; r < arr.length; r++) {
                        const venue = (arr[r] && arr[r][0]) ? arr[r][0].toString().trim() : '';
                        if (!venue || ['LABS', 'CLASSROOMS'].includes(venue.toUpperCase())) continue;

                        for (const cStr of Object.keys(times)) {
                            const c = +cStr;
                            const raw = (arr[r] && arr[r][c]) ? arr[r][c].toString().trim() : '';
                            if (!raw) continue;

                            const lines = raw.split(/\r?\n/);
                            const first = (lines[0] || '').trim();
                            const teacher = (lines[1] || '').trim();

                            const m = first.match(reSection);
                            const section = m ? m[0].replace(/ /g, '') : '';
                            let course = first;
                            if (m) {
                                const idx = first.search(reSection);
                                if (idx > -1) course = first.slice(0, idx).trim();
                            }

                            if(course && section) {
                                out.push({
                                    day: day,
                                    time: times[c] || '',
                                    venue: venue,
                                    course: course,
                                    section: section,
                                    teacher: teacher
                                });
                            }
                        }
                    }
                }
                resolve(out);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

export function normalizeAndCleanData(data: TimetableEntry[]): TimetableEntry[] {
    return data
        .map(r => ({ ...r, day: normalizeDay(r.day || '') }))
        .filter(r => r.day && r.section);
}