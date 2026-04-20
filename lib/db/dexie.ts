import Dexie, { Table } from 'dexie';

// ============================================================================
// HOUSEHOLD & USER INTERFACES
// ============================================================================

export interface Household {
  id?: number;
  firebaseId?: string;
  name: string;
  createdBy: string;
  createdAt: string;
  members: HouseholdMember[];
  settings: {
    currency: string;
    timezone: string;
    notifications: boolean;
    dietaryProfile?: string; // Epic 2 Feature 3
  };
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface HouseholdMember {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Invitation {
  id?: number;
  firebaseId?: string;
  householdId: string;
  householdName: string;
  invitedBy: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// INVENTORY & SHOPPING INTERFACES (Updated with householdId)
// ============================================================================

export interface InventoryItem {
  id?: number;
  firebaseId?: string;
  householdId?: string;
  businessId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  minThreshold?: number; // Smart Restock threshold
  barcode?: string;
  location?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface ShoppingItem {
  id?: number;
  firebaseId?: string;
  householdId?: string;
  businessId?: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  purchased: boolean;
  addedBy?: string;
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// RECIPE INTERFACE (Updated with householdId)
// ============================================================================

export interface Recipe {
  id?: number;
  firebaseId?: string;
  householdId?: string;
  businessId?: string;
  name: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  tags?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// MEAL PLANNING INTERFACES
// ============================================================================

export interface MealPlan {
  id?: number;
  firebaseId?: string;
  householdId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string;
  recipeName?: string;
  customMeal?: string;
  servings: number;
  assignedTo?: string;
  notes?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// TASK MANAGEMENT INTERFACES
// ============================================================================

export interface Task {
  id?: number;
  firebaseId?: string;
  householdId: string;
  title: string;
  description?: string;
  points?: number; // Gamification points
  category: 'cleaning' | 'cooking' | 'shopping' | 'maintenance' | 'other';
  assignedTo?: string;
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// EXPENSE TRACKING INTERFACES
// ============================================================================

export interface Expense {
  id?: number;
  firebaseId?: string;
  householdId: string;
  amount: number;
  currency: string;
  category: 'groceries' | 'utilities' | 'household' | 'dining' | 'other';
  description: string;
  date: string;
  paidBy: string;
  splitWith?: string[];
  receiptUrl?: string;
  recurring?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Budget {
  id?: number;
  firebaseId?: string;
  householdId: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  alerts: {
    threshold: number; // percentage
    enabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// NOTIFICATION INTERFACE
// ============================================================================

export interface Notification {
  id?: number;
  firebaseId?: string;
  userId: string;
  householdId?: string;
  type: 'expiry' | 'task' | 'budget' | 'meal' | 'shopping' | 'household' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// ALERT & ACTIVITY INTERFACES
// ============================================================================

export interface Alert {
  id?: number;
  firebaseId?: string;
  type: 'expiry' | 'low-stock' | 'out-of-stock';
  itemId: number;
  itemName: string;
  message: string;
  dismissed: boolean;
  createdAt: string;
}

export interface Activity {
  id?: number;
  firebaseId?: string;
  householdId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'complete' | 'join' | 'leave';
  entityType: 'inventory' | 'shopping' | 'recipe' | 'task' | 'expense' | 'budget' | 'household';
  entityName: string;
  details?: string;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// BUSINESS & KITCHEN OPERATIONS INTERFACES
// ============================================================================

export interface Business {
  id?: number;
  firebaseId?: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'cafe' | 'cloud-kitchen';
  ownerId: string;
  settings: {
    currency: string;
    timezone: string;
    lowStockThreshold: number;
    defaultTaxRate: number;
  };
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Branch {
  id?: number;
  firebaseId?: string;
  businessId: string;
  name: string;
  address?: string;
  managerId: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface MenuItem {
  id?: number;
  firebaseId?: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number; // Calculated from raw ingredients
  imageUrl?: string;
  isActive: boolean;
  recipeMappingId?: string; // Links to the Bill of Materials
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface IngredientMapping {
  id?: number;
  firebaseId?: string;
  businessId: string;
  menuItemId: string;
  ingredients: Array<{
    inventoryItemId: string; // References firebaseId of InventoryItem
    quantity: number;
    unit: string;
    wastageFactor: number; // e.g., 1.2 if 20% is lost during prep
  }>;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface YieldLog {
  id?: number;
  firebaseId?: string;
  businessId: string;
  branchId: string;
  type: 'prep' | 'sale' | 'waste';
  entityId: string; // MenuItemId or InventoryItemId
  quantity: number;
  unit: string;
  reason?: string; // For waste
  staffId: string;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Staff {
  id?: number;
  firebaseId?: string;
  businessId: string;
  branchId?: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'chef' | 'waiter';
  permissions: string[];
  joinedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// ============================================================================
// DEXIE DATABASE CLASS
// ============================================================================

export class PantryPlusDB extends Dexie {
  // Existing tables
  inventory!: Table<InventoryItem, number>;
  shopping!: Table<ShoppingItem, number>;
  recipes!: Table<Recipe, number>;
  alerts!: Table<Alert, number>;
  households!: Table<Household, number>;
  invitations!: Table<Invitation, number>;
  meals!: Table<MealPlan, number>;
  tasks!: Table<Task, number>;
  expenses!: Table<Expense, number>;
  budgets!: Table<Budget, number>;
  notifications!: Table<Notification, number>;
  activities!: Table<Activity, number>;

  // New tables for Business Mode
  businesses!: Table<Business, number>;
  branches!: Table<Branch, number>;
  menuItems!: Table<MenuItem, number>;
  ingredientMappings!: Table<IngredientMapping, number>;
  yieldLogs!: Table<YieldLog, number>;
  staff!: Table<Staff, number>;

  constructor() {
    super('PantryPlusDB');

    // Version 1-5 (omitted for brevity in replacement, but kept in class definition)
    // We will define the full stores for version 6 which includes everything.
    
    this.version(1).stores({
      inventory: '++id, firebaseId, name, category, expiryDate, syncStatus',
      shopping: '++id, firebaseId, name, purchased, syncStatus',
      recipes: '++id, firebaseId, name, syncStatus',
      alerts: '++id, firebaseId, type, itemId, dismissed',
    });

    this.version(2).stores({
      inventory: '++id, firebaseId, householdId, name, category, expiryDate, syncStatus',
      shopping: '++id, firebaseId, householdId, name, purchased, syncStatus',
      recipes: '++id, firebaseId, householdId, name, syncStatus',
      alerts: '++id, firebaseId, type, itemId, dismissed',
      households: '++id, firebaseId, name, createdBy, syncStatus',
      invitations: '++id, firebaseId, householdId, invitedEmail, status, syncStatus',
      meals: '++id, firebaseId, householdId, date, mealType, syncStatus',
      tasks: '++id, firebaseId, householdId, assignedTo, status, dueDate, syncStatus',
      expenses: '++id, firebaseId, householdId, category, date, paidBy, syncStatus',
      budgets: '++id, firebaseId, householdId, category, period, syncStatus',
      notifications: '++id, firebaseId, userId, householdId, type, read, createdAt',
    });

    this.version(3).stores({
      inventory: '++id, firebaseId, householdId, name, category, expiryDate, minThreshold, syncStatus',
    });

    this.version(4).stores({
      tasks: '++id, firebaseId, householdId, assignedTo, status, dueDate, points, syncStatus',
    });

    this.version(5).stores({
      activities: '++id, firebaseId, householdId, userId, timestamp, entityType, syncStatus',
    });

    // Version 6: Business Mode Integration
    this.version(6).stores({
      businesses: '++id, firebaseId, name, ownerId, syncStatus',
      branches: '++id, firebaseId, businessId, managerId, syncStatus',
      menuItems: '++id, firebaseId, businessId, name, category, syncStatus',
      ingredientMappings: '++id, firebaseId, businessId, menuItemId, syncStatus',
      yieldLogs: '++id, firebaseId, businessId, branchId, type, entityId, timestamp, syncStatus',
      staff: '++id, firebaseId, businessId, branchId, userId, email, role, syncStatus',
      // Maintain existing household context for inventory etc.
      inventory: '++id, firebaseId, householdId, businessId, name, category, expiryDate, minThreshold, syncStatus',
      recipes: '++id, firebaseId, householdId, businessId, name, syncStatus',
      shopping: '++id, firebaseId, householdId, businessId, name, purchased, syncStatus',
    }).upgrade(async (_trans) => {
      console.log('Upgrading database to version 6 (Business Mode)...');
    });
  }
}

// Create and export database instance
export const db = new PantryPlusDB();
