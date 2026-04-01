'use client';

import { useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { motion } from 'framer-motion';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            try {
                codeReader.current
                    .decodeFromImage(undefined, imageSrc)
                    .then((result) => {
                        if (result) {
                            onScan(result.getText());
                        }
                    })
                    .catch((err) => {
                        if (!(err instanceof NotFoundException)) {
                            console.error(err);
                        }
                    });
            } catch (err) {
                console.error(err);
            }
        }
    }, [onScan]);

    useEffect(() => {
        const interval = setInterval(capture, 500);
        return () => clearInterval(interval);
    }, [capture]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
        >
            <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 border-2 border-indigo-500 opacity-50 pointer-events-none m-12 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                </div>

                {/* Scanning Line Animation */}
                <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-12 right-12 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
                <p className="text-white text-lg font-medium">Point camera at a barcode</p>
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}
