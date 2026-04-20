'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, ExclamationTriangleIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useInventory } from '@/lib/hooks/useInventory';
import { useAuth } from '@/lib/hooks/useAuth';

interface AIReceiptScannerProps {
    onClose: () => void;
}

export default function AIReceiptScanner({ onClose }: AIReceiptScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);
    
    const { addExpense } = useExpenses();
    const { addItem } = useInventory();
    const { user } = useAuth();

    const capture = useCallback(() => {
        const image = webcamRef.current?.getScreenshot();
        if (image) {
            setImageSrc(image);
            processImage(image);
        }
    }, [webcamRef]);

    const processImage = async (base64Data: string) => {
        setIsProcessing(true);
        setError(null);
        try {
            const res = await fetch('/api/expenses/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Data })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to process image');

            if (data.expenses) {
                for (const exp of data.expenses) {
                    await addExpense({
                        amount: exp.amount,
                        currency: exp.currency || 'USD',
                        category: exp.category || 'other',
                        description: exp.description || 'AI Scanned Receipt',
                        date: new Date().toISOString()
                    });
                }
            }

            if (data.items && Array.isArray(data.items)) {
                setScannedItems(data.items);
                setIsReviewing(true);
            } else {
                setSuccess(`Successfully added expenses!`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmInventory = async () => {
        setIsProcessing(true);
        try {
            for (const item of scannedItems) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + (item.estimatedExpiryDays || 7));
                
                await addItem({
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity || 1,
                    unit: item.unit || 'pcs',
                    expiryDate: expiry.toISOString(),
                    location: 'pantry',
                    notes: `AI Scanned - $${item.price || 0}`
                });
            }
            setSuccess(`Sync Complete! Added ${scannedItems.length} items to your kitchen.`);
            setIsReviewing(false);
        } catch (err: any) {
            setError("Failed to save inventory items.");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetScan = () => {
        setImageSrc(null);
        setError(null);
        setSuccess(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center p-4"
        >
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={onClose}
                    className="p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </div>

            <div className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col items-center">
                <div className="p-6 text-center w-full">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <CameraIcon className="w-7 h-7 text-emerald-400" />
                        AI Receipt Scanner
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Point your camera at your receipt. The AI will parse the line items and auto-budget the costs correctly.
                    </p>
                </div>

                <div className="relative aspect-[3/4] w-full max-w-[320px] bg-black mx-auto overflow-hidden rounded-2xl border-2 border-emerald-500 mb-6">
                    {!imageSrc ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: 'environment' }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img src={imageSrc} alt="Snapshot" className="w-full h-full object-cover opacity-60" />
                    )}

                    {/* Scanning Overlay */}
                    {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-white font-semibold text-lg tracking-widest animate-pulse">READING TOTALS...</p>
                        </div>
                    )}

                    {/* Result Overlays */}
                    {error && !isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm p-6 text-center z-10 w-full">
                            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
                            <p className="text-white font-bold mb-4">{error}</p>
                            <button onClick={resetScan} className="px-6 py-2 bg-red-600 text-white rounded-lg">Try Again</button>
                        </div>
                    )}
                    
                    {success && !isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/80 backdrop-blur-sm p-6 text-center z-10 w-full">
                            <CheckCircleIcon className="w-16 h-16 text-emerald-400 mb-4" />
                            <p className="text-white font-bold text-lg mb-4">{success}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg w-full max-w-[200px]">Done</button>
                        </div>
                    )}

                    {isReviewing && !isProcessing && (
                        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md flex flex-col z-20 overflow-hidden">
                            <div className="p-4 border-b border-gray-800 shrink-0">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-emerald-400" />
                                    Review Detected Items
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {scannedItems.map((item, idx) => (
                                    <div key={idx} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 flex justify-between items-center group">
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{item.name}</p>
                                            <p className="text-gray-400 text-xs">
                                                {item.quantity} {item.unit} • {item.category}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 text-xs font-bold">~{item.estimatedExpiryDays}d shelf life</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-900 border-t border-gray-800 space-y-2 shrink-0">
                                <button 
                                    onClick={handleConfirmInventory}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                                >
                                    Stock Kitchen (Confirm {scannedItems.length})
                                </button>
                                <button 
                                    onClick={resetScan}
                                    className="w-full text-gray-400 text-sm hover:text-white transition-colors py-2"
                                >
                                    Rescan Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!imageSrc && !isProcessing && (
                    <div className="p-6 pb-8 w-full flex justify-center border-t border-gray-800 bg-gray-900/50">
                        <button
                            onClick={capture}
                            className="w-20 h-20 bg-emerald-600 rounded-full border-4 border-gray-900 outline outline-4 outline-emerald-600 hover:bg-emerald-500 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center"
                        >
                            <CameraIcon className="w-8 h-8 text-white" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
