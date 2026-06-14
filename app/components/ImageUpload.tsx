'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CameraIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useUI } from './ui/Toaster';

interface ImageUploadProps {
    currentImage?: string;
    onImageSelected: (imageUrl: string) => void;
    onImageRemoved: () => void;
}

export default function ImageUpload({ currentImage, onImageSelected, onImageRemoved }: ImageUploadProps) {
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useUI();

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
                audio: false,
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setShowCamera(true);
        } catch (error) {
            console.error('Camera access error:', error);
            toast('Unable to access camera. Please check permissions or use file upload.', 'error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const switchCamera = async () => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setTimeout(() => startCamera(), 100);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
                onImageSelected(imageUrl);
                stopCamera();
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageSelected(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3">
            {/* Current Image Preview */}
            {currentImage && (
                <div className="relative">
                    <img
                        src={currentImage}
                        alt="Item"
                        className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                        type="button"
                        onClick={onImageRemoved}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Upload Options */}
            {!currentImage && !showCamera && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    >
                        <CameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Take Photo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    >
                        <PhotoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose File</span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}

            {/* Camera View */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-3"
                    >
                        <div className="relative rounded-lg overflow-hidden bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-64 object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Camera Controls */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={switchCamera}
                                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                                    title="Switch Camera"
                                >
                                    <ArrowPathIcon className="w-6 h-6 text-gray-900" />
                                </button>

                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                    title="Capture"
                                >
                                    <div className="w-12 h-12 border-4 border-gray-900 rounded-full" />
                                </button>

                                <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="p-3 bg-red-500/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-500 transition-colors"
                                    title="Cancel"
                                >
                                    <XMarkIcon className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
