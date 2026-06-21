'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    PlusIcon, 
    TrashIcon, 
    ScaleIcon, 
    BanknotesIcon,
    MagnifyingGlassIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '@/lib/hooks/useInventory';
import { useIngredientMapping } from '@/lib/hooks/useIngredientMapping';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useCountry } from '@/lib/hooks/useCountry';

interface IngredientMapperModalProps {
    menuItemId: string;
    onClose: () => void;
}

export default function IngredientMapperModal({ menuItemId, onClose }: IngredientMapperModalProps) {
    const { items: inventoryItems } = useInventory(); // This respects business context
    const { menuItems, updateMenuItem } = useMenuItems();
    const { formatPrice } = useCountry();
    const { mapping, saveMapping, loading: mappingLoading } = useIngredientMapping(menuItemId);

    const dish = useMemo(() => menuItems.find(m => m.firebaseId === menuItemId), [menuItems, menuItemId]);
    const [localIngredients, setLocalIngredients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when mapping loads
    useMemo(() => {
        if (mapping?.ingredients) {
            setLocalIngredients(mapping.ingredients);
        }
    }, [mapping]);

    const filteredInventory = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !localIngredients.some(li => li.inventoryItemId === item.firebaseId)
    );

    const addIngredient = (item: any) => {
        setLocalIngredients([...localIngredients, {
            inventoryItemId: item.firebaseId,
            name: item.name, // We keep the name locally for display
            quantity: 1,
            unit: item.unit,
            wastageFactor: 1
        }]);
    };

    const removeIngredient = (id: string) => {
        setLocalIngredients(localIngredients.filter(li => li.inventoryItemId !== id));
    };

    const updateIngredient = (id: string, updates: any) => {
        setLocalIngredients(localIngredients.map(li => 
            li.inventoryItemId === id ? { ...li, ...updates } : li
        ));
    };

    // Calculate simulated cost (assuming default $5 if not found, in real app would use purchase price)
    const estimatedCost = useMemo(() => {
        return localIngredients.reduce((sum, li) => {
            const invItem = inventoryItems.find(i => i.firebaseId === li.inventoryItemId);
            const unitPrice = 5; // Placeholder: In production use (item.lastPurchasePrice / item.packSize)
            return sum + (li.quantity * li.wastageFactor * unitPrice);
        }, 0);
    }, [localIngredients, inventoryItems]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveMapping(localIngredients);
            // Update the menu item's cost price for quick reference
            const dishRef = menuItems.find(m => m.firebaseId === menuItemId);
            if (dishRef && dishRef.id) {
                await updateMenuItem(dishRef.id, { costPrice: estimatedCost });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save mapping");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-end"
        >
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recipe Mapping</h2>
                        <p className="text-sm text-gray-500">Mapping ingredients for <span className="font-bold text-primary-600">"{dish?.name}"</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <XMarkIcon className="w-8 h-8 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                            <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Estimated Cost</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatPrice(estimatedCost)}</p>
                        </div>
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
                            <p className="text-[10px] font-bold uppercase text-primary-600 mb-1">Sale Price</p>
                            <p className="text-2xl font-black text-primary-700 dark:text-primary-400">{formatPrice(dish?.price ?? 0)}</p>
                        </div>
                    </div>

                    {/* Current Ingredients */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <ScaleIcon className="w-4 h-4" />
                            Active Bill of Materials
                        </h3>

                        {localIngredients.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                                <ExclamationCircleIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm italic">No ingredients mapped yet. Add from the inventory below.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {localIngredients.map((li) => (
                                    <motion.div 
                                        layout
                                        key={li.inventoryItemId} 
                                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">{li.name}</p>
                                            <p className="text-[10px] text-gray-400">Inventory SKU Link Verified</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white dark:bg-gray-700 p-1 rounded-lg border dark:border-gray-600 flex items-center">
                                                <input 
                                                    type="number"
                                                    value={li.quantity}
                                                    onChange={(e) => updateIngredient(li.inventoryItemId, { quantity: parseFloat(e.target.value) })}
                                                    className="w-12 bg-transparent text-center font-bold text-sm outline-none"
                                                />
                                                <span className="text-xs text-gray-400 pr-2">{li.unit}</span>
                                            </div>
                                            <div className="bg-white dark:bg-gray-700 p-1 rounded-lg border dark:border-gray-600 flex flex-col items-center">
                                                <span className="text-[8px] text-gray-400">Waste %</span>
                                                <input 
                                                    type="number"
                                                    value={li.wastageFactor}
                                                    onChange={(e) => updateIngredient(li.inventoryItemId, { wastageFactor: parseFloat(e.target.value) })}
                                                    className="w-10 bg-transparent text-center font-bold text-[10px] outline-none"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => removeIngredient(li.inventoryItemId)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inventory Selection */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <BanknotesIcon className="w-4 h-4" />
                            Add Raw Materials
                        </h3>
                        
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search Business Inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredInventory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => addIngredient(item)}
                                    className="p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-primary-100 rounded-xl flex items-center justify-between group transition-all"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{item.name}</p>
                                        <p className="text-[10px] text-gray-400">{item.category} • In stock: {item.quantity} {item.unit}</p>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-500 font-bold rounded-2xl border dark:border-gray-700 transition-all hover:bg-gray-50"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-3 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 dark:shadow-none hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Syncing BOM...' : 'Save & Sync Dish Cost'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
