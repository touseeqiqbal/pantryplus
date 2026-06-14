'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ExclamationTriangleIcon, 
    LightBulbIcon, 
    FireIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/lib/hooks/useInventory';
import { useAppMode } from '@/lib/hooks/useAppMode';

// Perishable categories used by the offline heuristic fallback.
const PERISHABLE = ['Fruits & Vegetables', 'Dairy', 'Meat & Seafood', 'Frozen Foods'];

/**
 * Data-driven foresight computed locally from real inventory. Used as a fallback
 * when the AI endpoint is unavailable (e.g. offline), so the panel always
 * reflects the user's actual items rather than placeholder data.
 */
function computeLocalForesight(inventory: any[], isBusiness: boolean) {
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    const alerts = inventory
        .map(item => {
            const daysToExpiry = item.expiryDate
                ? Math.ceil((new Date(item.expiryDate).getTime() - now) / dayMs)
                : null;
            const ageDays = item.createdAt
                ? Math.floor((now - new Date(item.createdAt).getTime()) / dayMs)
                : 0;
            const isPerishable = PERISHABLE.includes(item.category);

            let riskLevel: 'high' | 'medium' | null = null;
            let reason = '';

            if (daysToExpiry !== null && daysToExpiry <= 2) {
                riskLevel = 'high';
                reason = `Expires in ${Math.max(daysToExpiry, 0)} day(s).`;
            } else if (daysToExpiry !== null && daysToExpiry <= 5) {
                riskLevel = 'medium';
                reason = `Expires in ${daysToExpiry} days — use soon.`;
            } else if (isPerishable && ageDays >= 4) {
                riskLevel = 'medium';
                reason = `Perishable item purchased ${ageDays} days ago.`;
            }

            if (!riskLevel) return null;
            return {
                itemName: item.name,
                riskLevel,
                reason,
                saveMeTip: `Plan a meal using ${item.name} within the next day to avoid waste.`,
                suggestedRecipe: `Quick ${item.name} dish`,
            };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (a.riskLevel === 'high' ? -1 : 1))
        .slice(0, 6);

    return {
        alerts,
        businessAnomalies: [],
        foresightSummary: alerts.length
            ? `${alerts.length} item(s) need attention based on age and expiry.`
            : 'Inventory health looks stable.',
        _local: isBusiness,
    };
}

export default function PredictiveDecayAnalyzer() {
    const router = useRouter();
    const { items: inventory } = useInventory();
    const { isBusiness } = useAppMode();
    const [foresight, setForesight] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchForesight = async () => {
        if (inventory.length === 0) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/insights/predictive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory: inventory.map(i => ({
                        name: i.name,
                        category: i.category,
                        createdAt: i.createdAt,
                        expiryDate: i.expiryDate,
                    })),
                    isBusiness,
                }),
            });

            if (!res.ok) throw new Error('Predictive endpoint error');

            // streamObject().toTextStreamResponse() accumulates the JSON object;
            // the full body once the stream ends is valid JSON.
            const text = await res.text();
            const parsed = JSON.parse(text);
            if (parsed && Array.isArray(parsed.alerts)) {
                setForesight(parsed);
            } else {
                throw new Error('Unexpected shape');
            }
        } catch (e) {
            console.error('Foresight AI unavailable, using local analysis:', e);
            setForesight(computeLocalForesight(inventory, isBusiness));
        } finally {
            setIsLoading(false);
        }
    };

    // Run foresight once inventory is available. Falls back to local heuristics
    // if the AI call fails so the panel always reflects real items.
    useEffect(() => {
        if (inventory.length > 0 && !foresight) {
            // Show instant local insight, then upgrade with AI.
            setForesight(computeLocalForesight(inventory, isBusiness));
            fetchForesight();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory, isBusiness]);

    if (!foresight && !isLoading) return null;

    return (
        <div className="space-y-6">
            {/* Foresight Mode Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />
                    Predictive Fridge Guard
                </h3>
                {isLoading && <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />}
            </div>

            {/* Decay Alerts */}
            <div className="grid md:grid-cols-2 gap-4">
                {foresight?.alerts?.map((alert: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-3xl border-2 flex flex-col justify-between h-full transition-all ${
                            alert.riskLevel === 'high' 
                            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
                            : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30'
                        }`}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                    alert.riskLevel === 'high' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-orange-500 text-white'
                                }`}>
                                    {alert.riskLevel} SPOIL RISK
                                </span>
                                <ExclamationTriangleIcon className={`w-5 h-5 ${alert.riskLevel === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{alert.itemName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">"{alert.reason}"</p>
                        </div>
                        
                        <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                <FireIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Save-Me Tip</span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 italic mb-3">
                                {alert.saveMeTip}
                            </p>
                            <button
                                onClick={() => router.push(`/recipes?q=${encodeURIComponent(alert.itemName)}`)}
                                className="w-full py-2 bg-gray-900 dark:bg-indigo-600 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <LightBulbIcon className="w-3 h-3" />
                                SEE RECIPE: {alert.suggestedRecipe}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Business Anomalies Section */}
            {isBusiness && foresight?.businessAnomalies?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h4 className="flex items-center gap-2 font-black text-sm uppercase tracking-widest mb-4 opacity-70">
                            <ChartBarIcon className="w-5 h-5 text-indigo-300" />
                            Business Anomaly Radar
                        </h4>
                        
                        <div className="space-y-4">
                            {foresight.businessAnomalies.map((anom: any, i: number) => (
                                <div key={i} className="flex gap-4 p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <div className="p-2 bg-indigo-500 rounded-xl h-fit">
                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-indigo-300">{anom.category}</p>
                                        <p className="text-sm font-medium mb-2">{anom.description}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold py-1 px-3 bg-white/20 rounded-lg w-fit">
                                            ACTION: {anom.recommendedAction}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-3xl opacity-50 -mr-16 -mt-16" />
                </motion.div>
            )}
        </div>
    );
}
