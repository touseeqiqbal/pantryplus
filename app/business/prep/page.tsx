'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FireIcon, 
    CheckCircleIcon, 
    ArrowPathIcon, 
    BeakerIcon,
    TableCellsIcon,
    ArrowDownTrayIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { prepService, PrepRequirement } from '@/lib/services/prepService';
import { yieldService } from '@/lib/services/yieldService';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ChefsPrepDashboard() {
    const { currentBusiness } = useBusiness();
    const { user } = useAuth();
    const [prepList, setPrepList] = useState<PrepRequirement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStation, setFilterStation] = useState<string>('All');

    useEffect(() => {
        const loadPrep = async () => {
            if (!currentBusiness?.firebaseId) return;
            setIsLoading(true);
            try {
                const list = await prepService.generateDailyPrepList(currentBusiness.firebaseId);
                setPrepList(list);
            } catch (e) {
                console.error("Failed to load prep list");
            } finally {
                setIsLoading(false);
            }
        };
        loadPrep();
    }, [currentBusiness]);

    const stations = ['All', ...Array.from(new Set(prepList.map(p => p.station || 'General Prep')))];

    const filteredPrep = filterStation === 'All' 
        ? prepList 
        : prepList.filter(p => p.station === filterStation);

    const toggleComplete = async (req: PrepRequirement) => {
        if (!currentBusiness?.firebaseId || req.status === 'completed') return;

        try {
            await yieldService.logPrep(
                currentBusiness.firebaseId,
                req.inventoryItemId,
                req.requiredQuantity,
                user?.uid || 'anonymous'
            );

            setPrepList(prepList.map(p => 
                p.inventoryItemId === req.inventoryItemId 
                ? { ...p, status: 'completed' } 
                : p
            ));
        } catch (e) {
            console.error("Failed to log prep");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            {/* Mission Critical Header */}
            <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <FireIcon className="w-5 h-5 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Kitchen Mission Control</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Chef's Daily Prep</h1>
                            <p className="text-gray-400 text-sm mt-1">Shift Intelligence for <span className="text-white font-bold">{currentBusiness?.name}</span></p>
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Shift Target</p>
                                <p className="text-2xl font-black">140<span className="text-sm font-normal text-gray-500 ml-1">plates</span></p>
                            </div>
                            <div className="p-4 bg-primary-600 rounded-2xl text-center min-w-[120px] shadow-xl shadow-primary-900/20">
                                <p className="text-[10px] text-primary-200 font-bold uppercase mb-1">Prep Completion</p>
                                <p className="text-2xl font-black">
                                    {Math.round((prepList.filter(p => p.status === 'completed').length / (prepList.length || 1)) * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Forecast Banner */}
                    <div className="mt-8 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-indigo-500 rounded-lg">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-indigo-300">AI Shift Forecast:</span> High demand expected for <span className="italic">"Signature Burgers"</span>. Prep list has been adjusted +15% for safety.
                        </div>
                    </div>

                    {/* Station Filter Tabs */}
                    <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {stations.map(station => (
                            <button
                                key={station}
                                onClick={() => setFilterStation(station)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    filterStation === station 
                                    ? 'bg-white text-black' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                {station}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale brightness-200">
                        <ArrowPathIcon className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                        <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">Crunching BOM & Sales Forecast...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Array.from(new Set(filteredPrep.map(p => p.station))).map(stationName => (
                            <div key={stationName} className="space-y-4">
                                <h2 className="text-lg font-black flex items-center gap-2 opacity-50 uppercase tracking-widest">
                                    <TableCellsIcon className="w-5 h-5" />
                                    {stationName}
                                </h2>
                                
                                <div className="space-y-3">
                                    {filteredPrep.filter(p => p.station === stationName).map((p, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={p.inventoryItemId}
                                            onClick={() => toggleComplete(p)}
                                            className={`p-5 rounded-3xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                                                p.status === 'completed'
                                                ? 'bg-emerald-900/10 border-emerald-500/30 grayscale opacity-50'
                                                : 'bg-white/5 border-white/5 hover:border-primary-500/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${p.status === 'completed' ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                                    <BeakerIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                                    <p className="text-sm text-gray-500">Pull from Storage: <span className="text-primary-400 font-bold">{p.requiredQuantity} {p.unit}</span></p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {p.status === 'completed' ? (
                                                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                                                ) : (
                                                    <button className="p-3 bg-white/10 rounded-xl hover:bg-primary-600 transition-colors">
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
