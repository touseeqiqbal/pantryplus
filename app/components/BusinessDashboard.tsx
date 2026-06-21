'use client';

import { motion } from 'framer-motion';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { useInventory } from '@/lib/hooks/useInventory';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useCountry } from '@/lib/hooks/useCountry';
import { 
  BuildingStorefrontIcon, 
  QueueListIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { yieldService } from '@/lib/services/yieldService';
import { AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db/dexie';

export default function BusinessDashboard() {
  const { currentBusiness, currentBranch, createBusiness, loading } = useBusiness();
  const { items } = useInventory(); // This now respects business context
  const { menuItems } = useMenuItems();
  const { formatPrice } = useCountry();
  const [showSetup, setShowSetup] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizType, setNewBizType] = useState<'restaurant' | 'cafe' | 'cloud-kitchen'>('cafe');
  
  // Sale Logging State
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedSaleItemId, setSelectedSaleItemId] = useState<string>('');
  const [saleQty, setSaleQty] = useState(1);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  
  const { user } = useAuth();

  // Real waste totals from recorded yield logs.
  const [wasteStats, setWasteStats] = useState<{ events: number; units: number }>({ events: 0, units: 0 });

  useEffect(() => {
    const bizId = currentBusiness?.firebaseId;
    if (!bizId) {
      setWasteStats({ events: 0, units: 0 });
      return;
    }
    db.yieldLogs
      .where('businessId')
      .equals(bizId)
      .toArray()
      .then(logs => {
        const waste = logs.filter(l => l.type === 'waste');
        setWasteStats({
          events: waste.length,
          units: waste.reduce((s, l) => s + (l.quantity || 0), 0),
        });
      })
      .catch(() => setWasteStats({ events: 0, units: 0 }));
  }, [currentBusiness, menuItems]);

  if (loading) return <div>Loading business data...</div>;

  if (!currentBusiness && !showSetup) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 min-h-[400px]">
        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-6 text-primary-600">
          <BuildingStorefrontIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Business Mode</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
          Set up your restaurant, cafe, or kitchen to start tracking inventory, costs, and daily operations.
        </p>
        <button
          onClick={() => setShowSetup(true)}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95"
        >
          Setup your Business
        </button>
      </div>
    );
  }

  if (showSetup) {
     return (
        <div className="card p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Setup Business</h2>
            <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Business Name</label>
                   <input 
                      type="text" 
                      value={newBizName} 
                      onChange={(e) => setNewBizName(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                      placeholder="e.g. Sunny's Cafe"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Business Type</label>
                   <select 
                      value={newBizType}
                      onChange={(e) => setNewBizType(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl"
                   >
                       <option value="cafe">Cafe</option>
                       <option value="restaurant">Restaurant</option>
                       <option value="cloud-kitchen">Cloud Kitchen</option>
                   </select>
                </div>
                <button 
                   onClick={async () => {
                      if (!newBizName) return;
                      await createBusiness(newBizName, newBizType);
                      setShowSetup(false);
                   }}
                   className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl mt-4"
                >
                   Complete Setup
                </button>
                <button onClick={() => setShowSetup(false)} className="w-full text-gray-500 text-sm">Cancel</button>
            </div>
        </div>
     );
  }

  const lowStock = items.filter(i => i.minThreshold && i.quantity <= i.minThreshold).length;

  // Real cost/margin from menu items that have both a price and a cost price.
  const menuWithCost = menuItems.filter(m => (m.price || 0) > 0 && (m.costPrice || 0) > 0);
  const avgFoodCostPct = menuWithCost.length
    ? (menuWithCost.reduce((s, m) => s + (m.costPrice! / m.price), 0) / menuWithCost.length) * 100
    : null;
  const profitMarginPct = avgFoodCostPct != null ? 100 - avgFoodCostPct : null;
  const menuValue = menuItems.reduce((s, m) => s + (m.price || 0), 0);
  const fmtPct = (v: number | null) => (v != null ? `${v.toFixed(1)}%` : '—');

  return (
    <div className="space-y-6">
      {/* Business Hero */}
      <div className="relative overflow-hidden card p-8 bg-gradient-to-br from-gray-900 to-indigo-950 text-white border-none">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 opacity-80">
                <BuildingStorefrontIcon className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">{currentBusiness?.type} Dashboard</span>
            </div>
            <h1 className="text-4xl font-black mb-1">{currentBusiness?.name}</h1>
            <p className="text-indigo-200 text-sm mb-6">{currentBranch?.name || 'Main Branch'}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                    <p className="text-xs text-indigo-300 font-medium uppercase">Active Menu</p>
                    <p className="text-2xl font-bold">{menuItems.length} Items</p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                    <p className="text-xs text-indigo-300 font-medium uppercase">Inventory</p>
                    <p className="text-2xl font-bold">{items.length} SKUs</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
                    <p className="text-xs text-red-300 font-medium uppercase">Low Stock</p>
                    <p className="text-2xl font-bold text-red-200">{lowStock}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-2xl border border-green-500/30">
                    <p className="text-xs text-green-300 font-medium uppercase">Menu Value</p>
                    <p className="text-2xl font-bold text-green-200">{formatPrice(menuValue)}</p>
                </div>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -m-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
      </div>

      {/* Business Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-primary-500">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
                <ArrowTrendingUpIcon className="w-6 h-6" />
              </div>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400">Avg Food Cost %</p>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white">{fmtPct(avgFoodCostPct)}</h3>
           <p className="text-xs text-gray-400 mt-1">
              {menuWithCost.length > 0 ? `From ${menuWithCost.length} costed dish(es)` : 'Add dish cost prices to calculate'}
           </p>
        </div>

        <div className="card p-6 border-l-4 border-l-red-500">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400">Recorded Waste</p>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white">{wasteStats.events}</h3>
           <p className="text-xs text-gray-400 mt-1">
              {wasteStats.events > 0 ? `${wasteStats.units} unit(s) logged` : 'No waste logged yet'}
           </p>
        </div>

        <div className="card p-6 border-l-4 border-l-green-500">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600">
                <CircleStackIcon className="w-6 h-6" />
              </div>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white">{fmtPct(profitMarginPct)}</h3>
           <p className="text-xs text-gray-400 mt-1">Based on dish cost vs. price</p>
        </div>
      </div>

      {/* Business Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/business/menu" className="p-4 bg-white dark:bg-gray-800 rounded-3xl border hover:border-primary-500 transition-all group">
             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                <QueueListIcon className="w-7 h-7" />
             </div>
             <p className="font-bold text-sm">Manage Menu</p>
             <p className="text-xs text-gray-500">Add dishes & map ingredients</p>
          </Link>
          
          <Link href="/inventory" className="p-4 bg-white dark:bg-gray-800 rounded-3xl border hover:border-primary-500 transition-all group">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                <CircleStackIcon className="w-7 h-7" />
             </div>
             <p className="font-bold text-sm">Stock Controls</p>
             <p className="text-xs text-gray-500">Track raw materials</p>
          </Link>

          <Link href="/business/prep" className="p-4 bg-white dark:bg-gray-800 rounded-3xl border hover:border-primary-500 transition-all group">
             <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-7 h-7" />
             </div>
             <p className="font-bold text-sm">Daily Prep</p>
             <p className="text-xs text-gray-500">Calculate today's pull</p>
          </Link>

          <button 
             onClick={() => setShowSaleModal(true)}
             className="p-4 bg-gray-900 text-white rounded-3xl hover:bg-black transition-all group"
          >
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <PlusIcon className="w-7 h-7" />
             </div>
             <p className="font-bold text-sm">Log Sale</p>
             <p className="text-xs text-white/60">Real-time stock deduction</p>
          </button>
      </div>

      {/* Sale Logging Modal */}
      <AnimatePresence>
         {showSaleModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                  onClick={() => setShowSaleModal(false)}
               />
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
               >
                  <div className="p-8">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black">Record Sale</h2>
                        <button onClick={() => setShowSaleModal(false)}>
                           <XMarkIcon className="w-6 h-6 text-gray-400" />
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Select Item Sold</label>
                           <select 
                              value={selectedSaleItemId}
                              onChange={(e) => setSelectedSaleItemId(e.target.value)}
                              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                           >
                              <option value="">Choose a dish...</option>
                              {menuItems.map(item => (
                                 <option key={item.firebaseId} value={item.firebaseId}>{item.name} - {formatPrice(item.price ?? 0)}</option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Quantity</label>
                           <div className="flex items-center gap-4">
                              <button 
                                 onClick={() => setSaleQty(Math.max(1, saleQty - 1))}
                                 className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-xl"
                              >
                                 -
                              </button>
                              <div className="flex-1 bg-gray-50 dark:bg-gray-700 py-3 rounded-xl text-center font-black text-2xl">
                                 {saleQty}
                              </div>
                              <button 
                                 onClick={() => setSaleQty(saleQty + 1)}
                                 className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-xl"
                              >
                                 +
                              </button>
                           </div>
                        </div>

                        <button 
                           disabled={!selectedSaleItemId || isProcessingSale}
                           onClick={async () => {
                              if (!currentBusiness?.firebaseId || !selectedSaleItemId) return;
                              setIsProcessingSale(true);
                              try {
                                 await yieldService.logSale(
                                    currentBusiness.firebaseId,
                                    selectedSaleItemId,
                                    saleQty,
                                    user?.uid || 'anonymous'
                                 );
                                 setShowSaleModal(false);
                                 setSaleQty(1);
                                 setSelectedSaleItemId('');
                              } catch (e) {
                                 console.error("Sale logging failed");
                              } finally {
                                 setIsProcessingSale(false);
                              }
                           }}
                           className="w-full py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 dark:shadow-none hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                           {isProcessingSale ? 'Deducting Stock...' : 'Confirm Sale & Subtract Stock'}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
