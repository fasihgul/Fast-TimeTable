import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-300 to-slate-500">
                Timetable Matrix
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
                Dynamic timetable viewer for FAST NUCES Karachi. Upload, filter, and manage your schedule with ease.
            </p>
        </header>
    );
};

export default Header;