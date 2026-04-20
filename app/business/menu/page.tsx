'use client';

import { useState } from 'react';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { 
  PlusIcon, 
  QueueListIcon, 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  TagIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import IngredientMapperModal from '@/app/components/IngredientMapperModal';

export default function MenuManagementPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, loading } = useMenuItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  
  // New Item State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Mains',
    price: 0,
    costPrice: 0,
    isActive: true
  });

  const categories = ['Mains', 'Starters', 'Desserts', 'Beverages', 'Sides', 'Specials'];

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header Area */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <QueueListIcon className="w-8 h-8 text-primary-600" />
                Menu Catalog
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your dishes and map them to inventory for auto-stock deduction.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Dish
            </button>
          </div>

          <div className="mt-6 flex gap-3">
             <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                   type="text"
                   placeholder="Search dishes or categories..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
             </div>
             <button className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300">
                <AdjustmentsHorizontalIcon className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
             <QueueListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">No items found</h3>
             <p className="text-gray-500">Try adjusting your search or add your first menu item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group card overflow-hidden bg-white dark:bg-gray-800 hover:shadow-2xl transition-all"
              >
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary-100 dark:border-primary-800">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                         <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                         {item.price.toFixed(2)}
                      </div>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                   
                   <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-500 italic">{item.isActive ? 'Active on Menu' : 'Inactive'}</span>
                      </div>
                      <button 
                         onClick={() => setSelectedMenuItemId(item.firebaseId || null)}
                         className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                      >
                         Ingredients <ChevronRightIcon className="w-3 h-3" />
                      </button>
                   </div>
                </div>
                {/* Progress Bar for margin if costPrice exists */}
                {item.costPrice && (
                   <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
                      <div 
                         className="h-full bg-green-500" 
                         style={{ width: `${Math.min(100, (item.costPrice / item.price) * 100)}%` }} 
                      />
                   </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <div className="p-8">
                  <h2 className="text-2xl font-black mb-6">New Dish</h2>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Dish Name</label>
                        <input 
                           type="text"
                           value={newItem.name}
                           onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                           className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                           placeholder="e.g. Avocado Smash"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                           <select 
                              value={newItem.category}
                              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                           >
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
                           <input 
                              type="number"
                              value={newItem.price}
                              onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                           />
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4 mt-10">
                     <button 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-bold rounded-2xl"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={async () => {
                           if (!newItem.name || newItem.price <= 0) return;
                           await addMenuItem(newItem);
                           setShowAddModal(false);
                           setNewItem({ name: '', category: 'Mains', price: 0, costPrice: 0, isActive: true });
                        }}
                        className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none"
                     >
                        Add to Menu
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ingredient Mapping Modal */}
      <AnimatePresence>
         {selectedMenuItemId && (
            <IngredientMapperModal 
               menuItemId={selectedMenuItemId}
               onClose={() => setSelectedMenuItemId(null)}
            />
         )}
      </AnimatePresence>
    </div>
  );
}
