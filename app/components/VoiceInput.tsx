'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface VoiceInputProps {
    onResult: (text: string) => void;
    placeholder?: string;
}

export default function VoiceInput({ onResult, placeholder = 'Tap to speak...' }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if browser supports speech recognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const transcriptText = event.results[current][0].transcript;
                    setTranscript(transcriptText);

                    // If final result, send it
                    if (event.results[current].isFinal) {
                        onResult(transcriptText);
                        setIsListening(false);
                        setTranscript('');
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setError('Could not recognize speech. Please try again.');
                    setIsListening(false);
                    setTimeout(() => setError(''), 3000);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onResult]);

    const startListening = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not supported in this browser');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setError('');
        setTranscript('');
        setIsListening(true);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse scale-110'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
            >
                {isListening ? (
                    <XMarkIcon className="w-6 h-6" />
                ) : (
                    <MicrophoneIcon className="w-6 h-6" />
                )}
            </button>

            {/* Listening Indicator */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                        <div className="glass px-4 py-2 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <motion.div
                                        animate={{ height: [8, 16, 8] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                        className="w-1 bg-red-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: [8, 16, 8] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                                        className="w-1 bg-red-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: [8, 16, 8] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                        className="w-1 bg-red-500 rounded-full"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {transcript || 'Listening...'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg shadow-lg text-sm">
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
