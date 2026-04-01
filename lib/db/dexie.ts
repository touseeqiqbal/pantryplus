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
  householdId: string;
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
  householdId: string;
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
  householdId: string;
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
// ALERT INTERFACE (Legacy - keeping for backward compatibility)
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
// DEXIE DATABASE CLASS
// ============================================================================

export class PantryPlusDB extends Dexie {
  // Existing tables
  inventory!: Table<InventoryItem, number>;
  shopping!: Table<ShoppingItem, number>;
  recipes!: Table<Recipe, number>;
  alerts!: Table<Alert, number>;

  // New tables for household management
  households!: Table<Household, number>;
  invitations!: Table<Invitation, number>;

  // New tables for features
  meals!: Table<MealPlan, number>;
  tasks!: Table<Task, number>;
  expenses!: Table<Expense, number>;
  budgets!: Table<Budget, number>;
  notifications!: Table<Notification, number>;
  activities!: Table<Activity, number>;

  constructor() {
    super('PantryPlusDB');

    // Version 1: Original schema
    this.version(1).stores({
      inventory: '++id, firebaseId, name, category, expiryDate, syncStatus',
      shopping: '++id, firebaseId, name, purchased, syncStatus',
      recipes: '++id, firebaseId, name, syncStatus',
      alerts: '++id, firebaseId, type, itemId, dismissed',
    });

    // Version 2: Add household support and new features
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
    }).upgrade(async (trans) => {
      // Migration: Add default householdId to existing data
      // This will be populated when user first logs in after upgrade
      console.log('Upgrading database to version 2...');
    });

    // Version 3: Smart Inventory
    this.version(3).stores({
      inventory: '++id, firebaseId, householdId, name, category, expiryDate, minThreshold, syncStatus',
    }).upgrade(async (trans) => {
      // No data migration needed
    });

    // Version 4: Gamification
    this.version(4).stores({
      tasks: '++id, firebaseId, householdId, assignedTo, status, dueDate, points, syncStatus',
    }).upgrade(async (trans) => {
      // No data migration needed
    });

    // Version 5: Activity Log
    this.version(5).stores({
      activities: '++id, firebaseId, householdId, userId, timestamp, entityType, syncStatus',
    }).upgrade(async (trans) => {
      // No data migration needed
    });
  }
}

// Create and export database instance
export const db = new PantryPlusDB();
