import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import DataTable from './components/DataTable';
import Stats from './components/Stats';
import { parseCSV, parseXLSX, normalizeAndCleanData, sortDays } from './services/parserService';
import type { TimetableEntry, UploadMode, AppStats } from './types';

const EmptyState: React.FC = () => (
    <div className="text-center py-16 px-6">
        <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A9FF] to-[#C875FF] rounded-full blur-xl animate-pulse"></div>
            <svg className="relative w-full h-full text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <h3 className="mt-6 text-xl font-semibold text-white">Your Timetable Awaits</h3>
        <p className="mt-2 text-slate-400">
            Upload your timetable file (.xlsx or .csv) to begin.
        </p>
    </div>
);


const App: React.FC = () => {
    const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
    const [filteredData, setFilteredData] = useState<TimetableEntry[]>([]);
    const [filters, setFilters] = useState({ day: '', section: '', query: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stats: AppStats = useMemo(() => {
        const uniqueDays = new Set(timetableData.map(r => r.day));
        const uniqueSections = new Set(timetableData.map(r => r.section));
        return {
            entries: timetableData.length,
            days: uniqueDays.size,
            sections: uniqueSections.size,
        };
    }, [timetableData]);

    const uniqueDays = useMemo(() => {
        const days = Array.from(new Set(timetableData.map(r => r.day)));
        return sortDays(days);
    }, [timetableData]);
    
    const uniqueSections = useMemo(() => {
        const sections = Array.from(new Set(timetableData.map(r => r.section)));
        return sections.sort();
    }, [timetableData]);

    const cmpTime = (a: TimetableEntry, b: TimetableEntry) => {
        const norm = (t: string) => (t || "").replace(/ /g, "");
        const mA = norm(a.time).match(/(\d+):(\d+)-(\d+):(\d+)/);
        const mB = norm(b.time).match(/(\d+):(\d+)-(\d+):(\d+)/);
        const mins = (m: RegExpMatchArray | null) => m ? (+m[1])*60 + (+m[2]) : 0;
        return mins(mA) - mins(mB);
    };

    useEffect(() => {
        const q = filters.query.toLowerCase().trim();
        const result = timetableData
            .filter(r => (!filters.day || r.day === filters.day))
            .filter(r => (!filters.section || r.section === filters.section))
            .filter(r => !q || (
                r.course.toLowerCase().includes(q) || 
                r.teacher.toLowerCase().includes(q) || 
                r.venue.toLowerCase().includes(q) ||
                r.section.toLowerCase().includes(q)
            ))
            .sort(cmpTime);
        setFilteredData(result);
    }, [filters, timetableData]);

    const handleFilterChange = useCallback((filterName: 'day' | 'section' | 'query', value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);

    const handleUpload = useCallback(async (file: File, mode: UploadMode) => {
        setIsLoading(true);
        setError(null);
        try {
            const parser = file.name.toLowerCase().endsWith('.csv') ? parseCSV : parseXLSX;
            const parsedData = await parser(file);
            const cleanedData = normalizeAndCleanData(parsedData);

            if (!cleanedData.length) {
                throw new Error('Could not parse any valid timetable entries from the file.');
            }

            setTimetableData(prevData => {
                const newData = mode === 'replace' ? cleanedData : [...prevData, ...cleanedData];
                // Remove duplicates that might occur during merge
                const uniqueData = Array.from(new Map(newData.map(item => [JSON.stringify(item), item])).values());
                return uniqueData;
            });

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during parsing.');
            setTimeout(() => setError(null), 5000); // Auto-hide error after 5s
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleDownload = useCallback(() => {
        if(timetableData.length === 0) {
            alert("No data to download.");
            return;
        }
        const blob = new Blob([JSON.stringify(timetableData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: 'timetable_data.json' });
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
    }, [timetableData]);

    return (
        <div className="min-h-screen bg-[#0D1117] text-slate-200 selection:bg-[#00A9FF]/30">
            <div className="fixed inset-0 -z-10 h-full w-full bg-[#0D1117] bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(0,169,255,0.15),transparent_80%),radial-gradient(1200px_800px_at_20%_-10%,rgba(200,117,255,0.15),transparent_80%)]"></div>
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                <Header />
                <Controls 
                    days={uniqueDays} 
                    sections={uniqueSections} 
                    onFilterChange={handleFilterChange} 
                    handleUpload={handleUpload}
                    handleDownload={handleDownload}
                    isLoading={isLoading} 
                />

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg text-center animate-pulse">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl ring-1 ring-white/10">
                    {timetableData.length > 0 ? (
                        <div className="p-4 sm:p-6 space-y-4">
                            <Stats stats={stats} filteredCount={filteredData.length} />
                            <div className="border-t border-slate-800"></div>
                            <DataTable data={filteredData} />
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>
                <footer className="text-center text-sm text-slate-500 pt-4">
                    <p>Designed for a modern, efficient timetable viewing experience.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;