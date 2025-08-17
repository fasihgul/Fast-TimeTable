import React, { useState, useRef, useCallback } from 'react';
import type { UploadMode } from '../types';

interface ControlsProps {
    days: string[];
    sections: string[];
    onFilterChange: (filterName: 'day' | 'section' | 'query', value: string) => void;
    handleUpload: (file: File, mode: UploadMode) => void;
    handleDownload: () => void;
    isLoading: boolean;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15v6m-3-3l3 3 3-3" />
    </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const Button: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string, title?: string }> = ({ onClick, disabled, children, className, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`relative inline-flex items-center justify-center gap-2 w-full sm:w-auto flex-1 px-5 py-2.5 overflow-hidden font-medium text-white transition-all duration-300 rounded-lg group ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-[#00A9FF] rounded group-hover:-mr-4 group-hover:-mt-4">
            <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
        </span>
        <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full translate-y-full bg-[#00A9FF] rounded-2xl group-hover:mb-12 group-hover:translate-x-0"></span>
        <span className="relative w-full text-center transition-colors duration-200 ease-in-out flex items-center justify-center gap-2">
            {children}
        </span>
    </button>
);


const Controls: React.FC<ControlsProps> = ({ days, sections, onFilterChange, handleUpload, handleDownload, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const triggerUpload = (mode: UploadMode) => {
        if (selectedFile) {
            handleUpload(selectedFile, mode);
        } else {
            alert('Please select or drop a timetable file first.');
        }
    };

    const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };


    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl space-y-6 ring-1 ring-white/10">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="day" className="block text-sm font-medium text-slate-400 mb-2">Day</label>
                    <select id="day" onChange={e => onFilterChange('day', e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#00A9FF] focus:border-[#00A9FF] outline-none transition appearance-none bg-no-repeat bg-right-4" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em'}}>
                        <option value="">All Days</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="section" className="block text-sm font-medium text-slate-400 mb-2">Section</label>
                    <select id="section" onChange={e => onFilterChange('section', e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#00A9FF] focus:border-[#00A9FF] outline-none transition appearance-none bg-no-repeat bg-right-4" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em'}}>
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-2">Quick Filter</label>
                    <SearchIcon className="absolute left-3.5 top-11 h-5 w-5 text-slate-500" />
                    <input id="search" type="search" placeholder="Course, teacher, venue..." onChange={e => onFilterChange('query', e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00A9FF] focus:border-[#00A9FF] outline-none transition placeholder:text-slate-500" />
                </div>
            </div>

            <div className="border-t border-slate-800 my-6"></div>

            {/* Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <label 
                    htmlFor="file-upload"
                    className={`relative block w-full h-full p-6 text-center border-2 border-dashed border-slate-700 rounded-lg cursor-pointer transition-all duration-300 ${isDragging ? 'border-[#00A9FF] bg-slate-800/50 scale-105' : 'hover:border-slate-500'}`}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <UploadIcon className="mx-auto h-10 w-10 text-slate-500" />
                    <span className="mt-2 block text-sm font-semibold text-slate-300">
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Drop timetable here or click to upload'}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">.xlsx or .csv</span>
                    <input ref={fileInputRef} id="file-upload" type="file" className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
                </label>

                 <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => triggerUpload('merge')} disabled={isLoading || !selectedFile} className="bg-gradient-to-br from-[#00A9FF]/80 to-[#C875FF]/80" title="Add uploaded data to existing timetable">
                        Merge Upload
                    </Button>
                    <Button onClick={() => triggerUpload('replace')} disabled={isLoading || !selectedFile} className="bg-gradient-to-br from-[#00A9FF]/80 to-[#C875FF]/80" title="Replace entire timetable with uploaded data">
                       Replace with Upload
                    </Button>
                    <Button onClick={handleDownload} disabled={isLoading || !days.length} className="bg-slate-700/80" title="Download current data as a JSON file">
                        <DownloadIcon className="w-5 h-5"/> Download JSON
                    </Button>
                </div>
            </div>
             {isLoading && (
                <div className="flex items-center justify-center gap-2 text-[#00A9FF] mt-4">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing timetable... Hang tight!</span>
                </div>
             )}
        </div>
    );
};

export default Controls;