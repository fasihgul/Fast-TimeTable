import React from 'react';
import type { AppStats } from '../types';

interface StatsProps {
    stats: AppStats;
    filteredCount: number;
}

const StatItem: React.FC<{label: string; value: number | string}> = ({ label, value }) => (
    <div className="flex-1 text-center px-4 py-2 bg-slate-900/50 rounded-lg">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{value}</span>
        <span className="block text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</span>
    </div>
);

const Stats: React.FC<StatsProps> = ({ stats, filteredCount }) => {
    return (
        <div className="flex items-center justify-around text-slate-400 text-sm gap-4">
            <StatItem label="Showing" value={filteredCount} />
            <StatItem label="Total Entries" value={stats.entries} />
            <StatItem label="Days" value={stats.days} />
            <StatItem label="Sections" value={stats.sections} />
        </div>
    );
};

export default Stats;