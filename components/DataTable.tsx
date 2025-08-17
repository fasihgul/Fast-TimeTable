import React from 'react';
import type { TimetableEntry } from '../types';

interface DataTableProps {
    data: TimetableEntry[];
}

const dayColorMap: { [key: string]: { base: string, text: string } } = {
    MONDAY:    { base: 'bg-cyan-500/10 border-cyan-500/30',    text: 'text-cyan-300' },
    TUESDAY:   { base: 'bg-green-500/10 border-green-500/30',  text: 'text-green-300' },
    WEDNESDAY: { base: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-300' },
    THURSDAY:  { base: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-300' },
    FRIDAY:    { base: 'bg-pink-500/10 border-pink-500/30',    text: 'text-pink-300' },
    SATURDAY:  { base: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-300' },
    SUNDAY:    { base: 'bg-red-500/10 border-red-500/30',      text: 'text-red-300' },
    DEFAULT:   { base: 'bg-slate-700/50 border-slate-600',     text: 'text-slate-300' },
};


const DataTable: React.FC<DataTableProps> = ({ data }) => {
    if (data.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-900/70 backdrop-blur-lg z-10">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Day</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Teacher</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Venue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {data.map((row, index) => {
                        const colors = dayColorMap[row.day] || dayColorMap.DEFAULT;
                        return (
                            <tr key={index} className="group hover:bg-slate-800/60 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${colors.base} ${colors.text}`}>
                                        {row.day.charAt(0) + row.day.slice(1).toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono">{row.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{row.course}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                    {row.teacher || <span className="text-slate-600">—</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono">{row.section}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{row.venue}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;