'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecipeDetails, Step } from '@/lib/services/recipeService';
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CheckCircleIcon,
    PlayIcon,
    PauseIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface CookingModeProps {
    recipe: RecipeDetails;
    onClose: () => void;
}

export default function CookingMode({ recipe, onClose }: CookingModeProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [timers, setTimers] = useState<Map<number, { remaining: number; active: boolean }>>(new Map());
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAskingAi, setIsAskingAi] = useState(false);
    const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

    // Clear any running timers when the cooking session closes/unmounts.
    useEffect(() => {
        return () => {
            intervalsRef.current.forEach(clearInterval);
            intervalsRef.current = [];
        };
    }, []);

    const steps = recipe.analyzedInstructions?.[0]?.steps || [];

    const toggleStepComplete = (stepNumber: number) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepNumber)) {
                newSet.delete(stepNumber);
            } else {
                newSet.add(stepNumber);
            }
            return newSet;
        });
    };

    const startTimer = (stepNumber: number, duration: number) => {
        setTimers(prev => {
            const newMap = new Map(prev);
            newMap.set(stepNumber, { remaining: duration, active: true });
            return newMap;
        });

        const interval = setInterval(() => {
            setTimers(current => {
                const timer = current.get(stepNumber);
                if (!timer || !timer.active || timer.remaining <= 0) {
                    clearInterval(interval);
                    return current;
                }

                const newMap = new Map(current);
                newMap.set(stepNumber, { ...timer, remaining: timer.remaining - 1 });
                return newMap;
            });
        }, 1000);
        intervalsRef.current.push(interval);
    };

    const toggleTimer = (stepNumber: number) => {
        setTimers(prev => {
            const timer = prev.get(stepNumber);
            if (!timer) return prev;

            const newMap = new Map(prev);
            newMap.set(stepNumber, { ...timer, active: !timer.active });
            return newMap;
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAskAi = async () => {
        if(!aiQuery.trim()) return;
        setIsAskingAi(true);
        try {
            const res = await fetch('/api/recipes/substitute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeName: recipe.title,
                    stepInstruction: steps[currentStep].step,
                    userQuery: aiQuery
                })
            });
            const data = await res.json();
            if(data.answer) setAiResponse(data.answer);
        } catch(e) {
            setAiResponse("Failed to connect to Kitchen Brain.");
        } finally {
            setIsAskingAi(false);
            setAiQuery('');
        }
    };

    // Guard: some recipes (e.g. demo/import data) have no parsed step list.
    if (steps.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1500] flex items-center justify-center p-6"
            >
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {recipe.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Step-by-step instructions aren&apos;t available for this recipe yet.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1500] overflow-auto"
        >
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className="glass border-b border-white/20 sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-white">{recipe.title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <motion.div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-300">
                            <span>Step {currentStep + 1} of {steps.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                </div>

                {/* Current Step */}
                <div className="flex-1 container mx-auto px-4 py-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-3xl mx-auto"
                        >
                            {/* Step Number */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                                    {currentStepData.number}
                                </div>
                                <h3 className="text-2xl font-bold text-white">
                                    Step {currentStepData.number}
                                </h3>
                            </div>

                            {/* Step Instructions */}
                            <div className="card p-8 mb-6">
                                <p className="text-xl leading-relaxed text-gray-900 dark:text-white">
                                    {currentStepData.step}
                                </p>

                                {/* AI Substitution Assistance */}
                                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <label className="block text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                                        👩‍🍳 Missing an ingredient or need technique help? Ask AI:
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                            placeholder="e.g. Can I use baking soda instead of powder?"
                                            disabled={isAskingAi}
                                            className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 text-sm"
                                            onKeyDown={e => e.key === 'Enter' && handleAskAi()}
                                        />
                                        <button 
                                            onClick={handleAskAi}
                                            disabled={isAskingAi || !aiQuery.trim()}
                                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                        >
                                            {isAskingAi ? 'Thinking...' : 'Ask'}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {aiResponse && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 p-4 rounded-lg text-sm border border-primary-200 dark:border-primary-800/50 mt-3"
                                            >
                                                <strong>AI Says: </strong> {aiResponse}
                                                <button onClick={() => setAiResponse('')} className="ml-2 text-xs opacity-60 hover:opacity-100 underline border-none bg-transparent">(dismiss)</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Timer */}
                                {currentStepData.length && (
                                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                <span className="font-semibold text-orange-900 dark:text-orange-100">
                                                    {currentStepData.length.number} {currentStepData.length.unit}
                                                </span>
                                            </div>

                                            {timers.has(currentStepData.number) ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                        {formatTime(timers.get(currentStepData.number)!.remaining)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleTimer(currentStepData.number)}
                                                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                                    >
                                                        {timers.get(currentStepData.number)!.active ? (
                                                            <PauseIcon className="w-5 h-5" />
                                                        ) : (
                                                            <PlayIcon className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startTimer(
                                                        currentStepData.number,
                                                        (currentStepData.length?.number || 0) * (currentStepData.length?.unit === 'minutes' ? 60 : 1)
                                                    )}
                                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                                                >
                                                    Start Timer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Ingredients for this step */}
                                {currentStepData.ingredients.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            Ingredients needed:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {currentStepData.ingredients.map((ingredient) => (
                                                <span
                                                    key={ingredient.id}
                                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                                                >
                                                    {ingredient.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Equipment for this step */}
                                {currentStepData.equipment.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            Equipment needed:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {currentStepData.equipment.map((equipment) => (
                                                <span
                                                    key={equipment.id}
                                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                                                >
                                                    {equipment.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mark as Complete */}
                            <button
                                onClick={() => toggleStepComplete(currentStepData.number)}
                                className={`w-full p-4 rounded-xl font-semibold text-lg transition-all ${completedSteps.has(currentStepData.number)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {completedSteps.has(currentStepData.number) ? (
                                        <>
                                            <CheckCircleIconSolid className="w-6 h-6" />
                                            <span>Step Completed</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-6 h-6" />
                                            <span>Mark as Complete</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="glass border-t border-white/20 sticky bottom-0">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>

                            <div className="flex-1 text-center">
                                <div className="text-sm text-gray-300 mb-1">
                                    {completedSteps.size} of {steps.length} steps completed
                                </div>
                                <div className="flex justify-center gap-1">
                                    {steps.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentStep(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                                    ? 'bg-green-500 w-8'
                                                    : completedSteps.has(index + 1)
                                                        ? 'bg-green-600'
                                                        : 'bg-gray-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (currentStep === steps.length - 1) {
                                        onClose();
                                    } else {
                                        setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                            >
                                <span className="hidden sm:inline">
                                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </span>
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
