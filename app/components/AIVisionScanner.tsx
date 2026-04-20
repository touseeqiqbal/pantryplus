'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { XMarkIcon, CameraIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useInventory } from '@/lib/hooks/useInventory';

interface AIVisionScannerProps {
    onClose: () => void;
}

export default function AIVisionScanner({ onClose }: AIVisionScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { addItem } = useInventory();

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
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Data })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to process image');

            if (data.items && Array.isArray(data.items)) {
                if (data.items.length === 0) {
                    setError("No food items recognized in this image.");
                } else {
                    for (const item of data.items) {
                        await addItem({
                            name: item.name,
                            category: item.category || 'Other',
                            quantity: item.quantity || 1,
                            unit: item.unit || 'pcs'
                        });
                    }
                    setSuccess(`Successfully added ${data.items.length} items to your pantry!`);
                }
            } else {
                throw new Error("Invalid format returned from Vision AI.");
            }
        } catch (err: any) {
            setError(err.message);
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

            <div className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <CameraIcon className="w-7 h-7 text-primary-400" />
                        Pantry Vision
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Point your camera at your fridge or pantry. The AI will detect items and auto-add them.
                    </p>
                </div>

                <div className="relative aspect-[4/3] bg-black">
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-white font-semibold text-lg tracking-widest animate-pulse">ANALYZING...</p>
                        </div>
                    )}

                    {/* Result Overlays */}
                    {error && !isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm p-6 text-center">
                            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
                            <p className="text-white font-bold mb-4">{error}</p>
                            <button onClick={resetScan} className="px-6 py-2 bg-red-600 text-white rounded-lg">Try Again</button>
                        </div>
                    )}
                    
                    {success && !isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-sm p-6 text-center">
                            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                            <p className="text-white font-bold text-lg mb-4">{success}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg">Done</button>
                        </div>
                    )}
                </div>

                {!imageSrc && !isProcessing && (
                    <div className="p-6 flex justify-center bg-gray-900 border-t border-gray-800">
                        <button
                            onClick={capture}
                            className="w-20 h-20 bg-primary-600 rounded-full border-4 border-gray-900 outline outline-4 outline-primary-600 hover:bg-primary-500 transition-colors shadow-2xl flex items-center justify-center"
                        >
                            <CameraIcon className="w-8 h-8 text-white" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
