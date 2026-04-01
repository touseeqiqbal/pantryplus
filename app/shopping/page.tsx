'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useShopping } from '@/lib/hooks/useShopping';
import { useInventory } from '@/lib/hooks/useInventory';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ShoppingItem } from '@/lib/db/dexie';
import ThemeToggle from '../components/ThemeToggle';
import VoiceInput from '../components/VoiceInput';
import {
  PlusIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

// Sortable Item Component
function SortableShoppingItem({
  item,
  onToggle,
  onDelete,
  onUpdatePrice,
  addedBy,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
  onUpdatePrice: (price: number) => void;
  addedBy?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id!,
  });

  const [showPriceInput, setShowPriceInput] = useState(false);
  const [price, setPrice] = useState(item.price || 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`card p-4 mb-2 ${item.purchased ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {item.purchased ? (
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <CheckCircleIcon className="w-6 h-6 text-gray-400 hover:text-green-600 dark:hover:text-green-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-medium ${item.purchased
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
                }`}>
                {item.name}
              </h4>
              {item.quantity && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quantity: {item.quantity} {item.unit || 'items'}
                </p>
              )}
              {item.category && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                  {item.category}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-col items-end gap-1">
              {showPriceInput ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    onBlur={() => {
                      onUpdatePrice(price);
                      setShowPriceInput(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdatePrice(price);
                        setShowPriceInput(false);
                      }
                    }}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                    step="0.01"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowPriceInput(true)}
                  className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  <CurrencyDollarIcon className="w-4 h-4" />
                  {item.price ? `$${item.price.toFixed(2)}` : 'Add price'}
                </button>
              )}
            </div>
          </div>

          {/* Added by indicator */}
          {addedBy && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="w-3 h-3" />
              <span>Added by {addedBy}</span>
            </div>
          )}

          {item.notes && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
              {item.notes}
            </p>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}

export default function Shopping() {
  const { user, loading: authLoading } = useAuth();
  const { items: shoppingItems, loading, addItem, updateItem, deleteItem } = useShopping();
  const { items: inventoryItems, addItem: addToInventory } = useInventory();
  const { currentHousehold } = useHousehold();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: '',
    notes: '',
    price: 0,
    purchased: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading shopping list...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Separate active and purchased items
  const activeItems = shoppingItems.filter(item => !item.purchased);
  const purchasedItems = shoppingItems.filter(item => item.purchased);

  // Group items by category
  const groupedActiveItems = groupByCategory
    ? activeItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>)
    : { 'All Items': activeItems };

  // Calculate total
  const total = shoppingItems
    .filter(item => item.purchased && item.price)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  // Smart suggestions from inventory
  const lowStockItems = inventoryItems.filter(
    item => item.minThreshold && item.quantity <= item.minThreshold
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem(formData);
    setFormData({
      name: '',
      quantity: 1,
      unit: 'pieces',
      category: '',
      notes: '',
      price: 0,
      purchased: false,
    });
    setShowAddModal(false);
  };

  const handleVoiceInput = async (text: string) => {
    // Parse voice input (e.g., "add milk" or "2 apples")
    const match = text.match(/(\d+)?\s*(.+)/);
    if (match) {
      const quantity = match[1] ? parseInt(match[1]) : 1;
      const name = match[2].trim();

      await addItem({
        name,
        quantity,
        unit: 'pieces',
        category: '',
        notes: '',
        price: 0,
        purchased: false,
      });
    }
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    if (item.id) {
      const newPurchasedStatus = !item.purchased;
      await updateItem(item.id, { purchased: newPurchasedStatus });

      // If marking as purchased, optionally add to inventory
      if (newPurchasedStatus && confirm('Add this item to inventory?')) {
        await addToInventory({
          name: item.name,
          category: item.category || 'Other',
          quantity: item.quantity || 1,
          unit: item.unit || 'pieces',
          notes: `Added from shopping list`,
        });
      }
    }
  };

  const handleUpdatePrice = async (itemId: number, price: number) => {
    await updateItem(itemId, { price });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex(item => item.id === active.id);
      const newIndex = activeItems.findIndex(item => item.id === over.id);

      const newOrder = arrayMove(activeItems, oldIndex, newIndex);

      // Update order in database (you'd need to add an 'order' field to ShoppingItem)
      // For now, this just reorders visually
    }
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getAddedByEmail = (item: ShoppingItem) => {
    if (!item.addedBy || !currentHousehold) return undefined;
    const member = currentHousehold.members.find(m => m.userId === item.addedBy);
    return member?.email.split('@')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Shopping List</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeItems.length} items to buy
                {total > 0 && ` • Total: $${total.toFixed(2)}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Group Toggle */}
              <button
                onClick={() => setGroupByCategory(!groupByCategory)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${groupByCategory
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
              >
                {groupByCategory ? 'Grouped' : 'List'}
              </button>

              {/* Voice Input */}
              <VoiceInput onResult={handleVoiceInput} />

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Smart Suggestions */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Smart Suggestions
            </h3>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Low stock: {item.quantity} {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => addItem({
                      name: item.name,
                      category: item.category,
                      quantity: item.minThreshold || 1,
                      unit: item.unit,
                      notes: 'Auto-suggested',
                      price: 0,
                      purchased: false,
                    })}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Items */}
        {activeItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your shopping list is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add items to get started or use voice input!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              Add First Item
            </button>
          </motion.div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {Object.entries(groupedActiveItems).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                {groupByCategory && (
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full mb-3 group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {collapsedCategories.has(category) ? (
                        <ChevronRightIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                      {category}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({items.length})
                      </span>
                    </h3>
                  </button>
                )}

                <AnimatePresence>
                  {!collapsedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <SortableContext items={items.map(i => i.id!)} strategy={verticalListSortingStrategy}>
                        {items.map(item => (
                          <SortableShoppingItem
                            key={item.id}
                            item={item}
                            onToggle={() => handleTogglePurchased(item)}
                            onDelete={() => item.id && deleteItem(item.id)}
                            onUpdatePrice={(price) => item.id && handleUpdatePrice(item.id, price)}
                            addedBy={getAddedByEmail(item)}
                          />
                        ))}
                      </SortableContext>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </DndContext>
        )}

        {/* Purchased Items */}
        {purchasedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
              Purchased ({purchasedItems.length})
              {total > 0 && (
                <span className="ml-auto text-green-600 dark:text-green-400 font-bold">
                  Total: ${total.toFixed(2)}
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {purchasedItems.map(item => (
                <SortableShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={() => handleTogglePurchased(item)}
                  onDelete={() => item.id && deleteItem(item.id)}
                  onUpdatePrice={(price) => item.id && handleUpdatePrice(item.id, price)}
                  addedBy={getAddedByEmail(item)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1400]"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Add Shopping Item
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Produce, Dairy, Meat"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      placeholder="Brand preference, size, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
