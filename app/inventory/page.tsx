'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useInventory } from '@/lib/hooks/useInventory';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { InventoryItem } from '@/lib/db/dexie';
import BarcodeScanner from '../components/BarcodeScanner';
import ThemeToggle from '../components/ThemeToggle';
import SwipeableItemCard from '../components/SwipeableItemCard';
import ViewModeSelector, { ViewMode } from '../components/ViewModeSelector';
import ImageUpload from '../components/ImageUpload';
import BulkSelectionBar from '../components/BulkSelectionBar';
import { lookupBarcode, suggestCategory, estimateExpiryDays } from '@/lib/services/barcodeService';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  QrCodeIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

export default function Inventory() {
  const { user, loading: authLoading } = useAuth();
  const { currentHousehold, loading: householdLoading } = useHousehold();
  const { items, loading: inventoryLoading, addItem, updateItem, deleteItem } = useInventory();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'quantity'>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lookingUpBarcode, setLookingUpBarcode] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    expiryDate: '',
    location: '',
    notes: '',
    barcode: '',
    minThreshold: 0,
    imageUrl: '',
  });

  useEffect(() => {
    setMounted(true);
    const savedViewMode = localStorage.getItem('inventoryViewMode') as ViewMode;
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (!authLoading && !householdLoading && !currentHousehold) {
      router.push('/household/setup');
    }
  }, [user, authLoading, householdLoading, currentHousehold, router]);

  useEffect(() => {
    if (searchParams.get('scan') === 'true') {
      setShowScanner(true);
    }
  }, [searchParams]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('inventoryViewMode', mode);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 1,
      unit: 'pieces',
      expiryDate: '',
      location: '',
      notes: '',
      barcode: '',
      minThreshold: 0,
      imageUrl: '',
    });
    setEditingItem(null);
  };

  const handleBarcodeScanned = async (code: string) => {
    setShowScanner(false);
    setFormData(prev => ({ ...prev, barcode: code }));
    setShowAddModal(true);

    setLookingUpBarcode(true);
    const productInfo = await lookupBarcode(code);
    setLookingUpBarcode(false);

    if (productInfo) {
      const suggestedExpiryDays = estimateExpiryDays(productInfo.category || suggestCategory(productInfo.name));
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + suggestedExpiryDays);

      setFormData(prev => ({
        ...prev,
        name: productInfo.name,
        category: productInfo.category || suggestCategory(productInfo.name),
        expiryDate: expiryDate.toISOString().split('T')[0],
        imageUrl: productInfo.imageUrl || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem && editingItem.id) {
      await updateItem(editingItem.id, formData);
    } else {
      await addItem(formData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate || '',
      location: item.location || '',
      notes: item.notes || '',
      barcode: item.barcode || '',
      minThreshold: item.minThreshold || 0,
      imageUrl: item.imageUrl || '',
    });
    setShowAddModal(true);
  };

  // Bulk selection handlers
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedItems.size} items?`)) {
      for (const id of Array.from(selectedItems)) {
        await deleteItem(id);
      }
      setSelectedItems(new Set());
      setBulkSelectMode(false);
    }
  };

  const handleBulkEdit = () => {
    const itemId = Array.from(selectedItems)[0];
    const item = items.find(i => i.id === itemId);
    if (item) {
      handleEdit(item);
      setSelectedItems(new Set());
      setBulkSelectMode(false);
    }
  };

  const handleBulkExport = () => {
    const selectedItemsData = items.filter(item => item.id && selectedItems.has(item.id));
    const csv = [
      ['Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Location', 'Notes'].join(','),
      ...selectedItemsData.map(item =>
        [item.name, item.category, item.quantity, item.unit, item.expiryDate || '', item.location || '', item.notes || ''].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSelectedItems(new Set());
    setBulkSelectMode(false);
  };

  // Filter and sort items - do this before early returns to keep hook order consistent
  let filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  filteredItems.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'expiry') {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    } else if (sortBy === 'quantity') {
      return a.quantity - b.quantity;
    }
    return 0;
  });

  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  // Virtual scrolling - MUST be called before any conditional returns (React Rules of Hooks)
  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (authLoading || householdLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Inventory</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {items.length} items total
                {bulkSelectMode && ` • ${selectedItems.size} selected`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Bulk Select Toggle */}
              <button
                onClick={() => {
                  setBulkSelectMode(!bulkSelectMode);
                  setSelectedItems(new Set());
                }}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${bulkSelectMode
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  }`}
                title="Bulk Select"
              >
                <CheckCircleIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() => setShowScanner(true)}
                className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all hover:scale-105"
                title="Scan Barcode"
              >
                <QrCodeIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="expiry">Sort by Expiry</option>
                <option value="quantity">Sort by Quantity</option>
              </select>
            </div>

            <ViewModeSelector currentMode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {inventoryLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filterCategory !== 'all' ? 'No items found' : 'No items yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first item to get started!'}
            </p>
            {!searchQuery && filterCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Add First Item
              </button>
            )}
          </motion.div>
        ) : viewMode === 'list' ? (
          // Virtual scrolling for list view
          <div ref={parentRef} className="h-[calc(100vh-300px)] overflow-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = filteredItems[virtualRow.index];
                const isSelected = item.id ? selectedItems.has(item.id) : false;

                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="relative">
                      {bulkSelectMode && (
                        <button
                          onClick={() => item.id && toggleItemSelection(item.id)}
                          className="absolute top-2 left-2 z-10"
                        >
                          {isSelected ? (
                            <CheckCircleIconSolid className="w-8 h-8 text-primary-600" />
                          ) : (
                            <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      )}
                      <SwipeableItemCard
                        item={item}
                        onEdit={handleEdit}
                        onDelete={deleteItem}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Grid view
          <div className={
            viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'
          }>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const isSelected = item.id ? selectedItems.has(item.id) : false;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    layout
                    className="relative"
                  >
                    {bulkSelectMode && (
                      <button
                        onClick={() => item.id && toggleItemSelection(item.id)}
                        className="absolute top-2 left-2 z-10"
                      >
                        {isSelected ? (
                          <CheckCircleIconSolid className="w-8 h-8 text-primary-600" />
                        ) : (
                          <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    )}
                    <SwipeableItemCard
                      item={item}
                      onEdit={handleEdit}
                      onDelete={deleteItem}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bulk Selection Bar */}
      <BulkSelectionBar
        selectedCount={selectedItems.size}
        onDelete={handleBulkDelete}
        onEdit={handleBulkEdit}
        onExport={handleBulkExport}
        onCancel={() => {
          setSelectedItems(new Set());
          setBulkSelectMode(false);
        }}
      />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1400]"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>

                {lookingUpBarcode && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">Looking up product...</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Photo
                    </label>
                    <ImageUpload
                      currentImage={formData.imageUrl}
                      onImageSelected={(url) => setFormData({ ...formData, imageUrl: url })}
                      onImageRemoved={() => setFormData({ ...formData, imageUrl: '' })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Barcode
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Scan or enter barcode"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowScanner(true);
                        }}
                        className="px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
                        title="Scan Barcode"
                      >
                        <QrCodeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      list="categories"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <datalist id="categories">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                      <option value="Fruits & Vegetables" />
                      <option value="Dairy" />
                      <option value="Meat & Seafood" />
                      <option value="Grains & Bread" />
                      <option value="Beverages" />
                      <option value="Snacks" />
                      <option value="Condiments & Sauces" />
                      <option value="Frozen Foods" />
                      <option value="Canned Goods" />
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit *
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kg</option>
                        <option value="g">Grams</option>
                        <option value="l">Liters</option>
                        <option value="ml">ML</option>
                        <option value="lbs">Lbs</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Threshold (Auto-Restock Alert)
                    </label>
                    <input
                      type="number"
                      value={formData.minThreshold || ''}
                      onChange={(e) => setFormData({ ...formData, minThreshold: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Pantry, Fridge, Freezer"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                    >
                      {editingItem ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
