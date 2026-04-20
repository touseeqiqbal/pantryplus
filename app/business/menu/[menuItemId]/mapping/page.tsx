'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useInventory } from '@/lib/hooks/useInventory';
import { useIngredientMapping } from '@/lib/hooks/useIngredientMapping';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  ScaleIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  ScaleIcon as WeightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function IngredientMappingPage() {
  const params = useParams();
  const router = useRouter();
  const menuItemId = params.menuItemId as string;
  
  const { menuItems } = useMenuItems();
  const { items: inventoryItems } = useInventory();
  const { mapping, saveMapping, loading } = useIngredientMapping(menuItemId);

  const menuItem = menuItems.find(m => m.firebaseId === menuItemId || m.id?.toString() === menuItemId);

  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mapping && mapping.ingredients) {
      setSelectedIngredients(mapping.ingredients);
    }
  }, [mapping]);

  const addIngredient = (item: any) => {
    if (selectedIngredients.some(i => i.inventoryItemId === item.firebaseId)) return;
    setSelectedIngredients([
      ...selectedIngredients,
      {
        inventoryItemId: item.firebaseId,
        name: item.name,
        quantity: 1,
        unit: item.unit,
        wastageFactor: 1.0,
        pricePerUnit: 0 // In a real app, track unit costs
      }
    ]);
  };

  const updateIngredient = (index: number, updates: any) => {
    const newIngredients = [...selectedIngredients];
    newIngredients[index] = { ...newIngredients[index], ...updates };
    setSelectedIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMapping(selectedIngredients);
      router.push('/business/menu');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!menuItem && !loading) return <div className="p-10">Menu Item not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ArrowLeftIcon className="w-6 h-6" />
             </button>
             <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{menuItem?.name}</h1>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Ingredient Mapping (BOM)</p>
             </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 dark:shadow-none hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CURRENT MAPPING */}
        <div className="lg:col-span-2 space-y-6">
           <div className="card p-0 overflow-hidden bg-white dark:bg-gray-800">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                 <h3 className="font-bold flex items-center gap-2">
                    <ScaleIcon className="w-5 h-5 text-indigo-500" />
                    Bill of Materials
                 </h3>
                 <span className="text-xs font-medium text-gray-500">{selectedIngredients.length} Ingredients linked</span>
              </div>
              
              <div className="divide-y dark:divide-gray-700">
                 {selectedIngredients.length === 0 ? (
                    <div className="p-20 text-center">
                       <ScaleIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                       <p className="text-gray-400">No ingredients linked yet. Add them from the inventory catalog on the right.</p>
                    </div>
                 ) : (
                    selectedIngredients.map((ing, idx) => (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ing.inventoryItemId} className="p-6 flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-1">
                             <h4 className="font-bold text-gray-900 dark:text-white uppercase text-sm tracking-wide">{ing.name}</h4>
                             <p className="text-xs text-gray-500">Unit: {ing.unit}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col gap-1 w-24">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Qty Needed</label>
                                <input 
                                   type="number"
                                   value={ing.quantity}
                                   onChange={(e) => updateIngredient(idx, { quantity: parseFloat(e.target.value) })}
                                   className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                                />
                             </div>
                             <div className="flex flex-col gap-1 w-24">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-orange-400">Wastage %</label>
                                <input 
                                   type="number"
                                   step="0.01"
                                   value={ing.wastageFactor}
                                   onChange={(e) => updateIngredient(idx, { wastageFactor: parseFloat(e.target.value) })}
                                   className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                                />
                             </div>
                             <button onClick={() => removeIngredient(idx)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-4">
                                <TrashIcon className="w-5 h-5" />
                             </button>
                          </div>
                       </motion.div>
                    ))
                 )}
              </div>
           </div>

           {/* TOTALS PREVIEW */}
           {selectedIngredients.length > 0 && (
              <div className="card p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-2xl">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Plate Cost</p>
                       <h3 className="text-3xl font-black text-green-400 flex items-center gap-2">
                          <CurrencyDollarIcon className="w-8 h-8" />
                          --.--
                       </h3>
                       <p className="text-xs text-gray-500 mt-2">Cost calculation requires inventory pricing data.</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Margin</p>
                       <h4 className="text-2xl font-bold">{menuItem ? (((menuItem.price - 0) / menuItem.price) * 100).toFixed(1) : 0}%</h4>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* RIGHT: INVENTORY CATALOG */}
        <div className="space-y-6">
           <div className="card p-6 bg-white dark:bg-gray-800 border-primary-100 sticky top-28">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ArchiveBoxIcon className="w-5 h-5 text-primary-500" />
                Raw Materials
              </h3>
              <div className="relative mb-4">
                 <input 
                    type="text" 
                    placeholder="Search inventory..."
                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none"
                 />
                 <PlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                 {inventoryItems.map(item => (
                    <button
                       key={item.id}
                       onClick={() => addIngredient(item)}
                       className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-800 group text-left"
                    >
                       <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-500 tracking-wider font-bold uppercase">{item.category} • {item.unit}</p>
                       </div>
                       <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          <PlusIcon className="w-5 h-5" />
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
