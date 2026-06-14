/**
 * External Integrations Service
 * Handles integrations with third-party services:
 * - Google Calendar (meal plan sync)
 * - Smart Home (Alexa, Google Home)
 * - Grocery Delivery (Instacart, Amazon Fresh)
 * - Fitness Apps (MyFitnessPal)
 */

import { MealPlanDay } from './aiService';
import { ShoppingItem } from '@/lib/db/dexie';

// ============================================================================
// GOOGLE CALENDAR INTEGRATION
// ============================================================================

export interface CalendarEvent {
    summary: string;
    description: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    colorId?: string;
}

/**
 * Sync meal plan to Google Calendar
 * Requires Google Calendar API credentials
 */
export async function syncMealPlanToCalendar(
    mealPlan: MealPlanDay[],
    accessToken: string
): Promise<{ success: boolean; eventsCreated: number; error?: string }> {
    try {
        const events: CalendarEvent[] = [];
        const today = new Date();

        mealPlan.forEach((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index);

            // Breakfast event
            const breakfastStart = new Date(date);
            breakfastStart.setHours(8, 0, 0);
            const breakfastEnd = new Date(date);
            breakfastEnd.setHours(9, 0, 0);

            events.push({
                summary: `🍳 Breakfast: ${day.breakfast}`,
                description: `Meal plan for ${day.day}\nCalories: ~${Math.round(day.calories / 3)}`,
                start: { dateTime: breakfastStart.toISOString(), timeZone: 'America/New_York' },
                end: { dateTime: breakfastEnd.toISOString(), timeZone: 'America/New_York' },
                colorId: '9', // Blue
            });

            // Lunch event
            const lunchStart = new Date(date);
            lunchStart.setHours(12, 0, 0);
            const lunchEnd = new Date(date);
            lunchEnd.setHours(13, 0, 0);

            events.push({
                summary: `🥗 Lunch: ${day.lunch}`,
                description: `Meal plan for ${day.day}\nCalories: ~${Math.round(day.calories / 3)}`,
                start: { dateTime: lunchStart.toISOString(), timeZone: 'America/New_York' },
                end: { dateTime: lunchEnd.toISOString(), timeZone: 'America/New_York' },
                colorId: '10', // Green
            });

            // Dinner event
            const dinnerStart = new Date(date);
            dinnerStart.setHours(18, 0, 0);
            const dinnerEnd = new Date(date);
            dinnerEnd.setHours(19, 0, 0);

            events.push({
                summary: `🍽️ Dinner: ${day.dinner}`,
                description: `Meal plan for ${day.day}\nCalories: ~${Math.round(day.calories / 3)}`,
                start: { dateTime: dinnerStart.toISOString(), timeZone: 'America/New_York' },
                end: { dateTime: dinnerEnd.toISOString(), timeZone: 'America/New_York' },
                colorId: '11', // Red
            });
        });

        // Create events in Google Calendar
        let createdCount = 0;
        for (const event of events) {
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (response.ok) {
                createdCount++;
            }
        }

        return { success: true, eventsCreated: createdCount };
    } catch (error) {
        console.error('Google Calendar sync error:', error);
        return { success: false, eventsCreated: 0, error: String(error) };
    }
}

/**
 * Generate a downloadable .ics (iCalendar) file from a meal plan.
 *
 * Unlike the Google Calendar OAuth path, this works entirely offline and can be
 * imported into Google Calendar, Apple Calendar, or Outlook. Each day produces
 * colour-hinted Breakfast / Lunch / Dinner events.
 */
export function generateMealPlanICS(mealPlan: MealPlanDay[]): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
            d.getMinutes()
        )}00`;

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PantryPlus//Meal Planner//EN',
        'CALSCALE:GREGORIAN',
    ];

    const today = new Date();

    mealPlan.forEach((day, index) => {
        const base = new Date(today);
        base.setDate(today.getDate() + index);

        const meals: Array<{ label: string; meal: string; hour: number }> = [
            { label: '🍳 Breakfast', meal: day.breakfast, hour: 8 },
            { label: '🥗 Lunch', meal: day.lunch, hour: 12 },
            { label: '🍽️ Dinner', meal: day.dinner, hour: 18 },
        ];

        meals.forEach(({ label, meal, hour }) => {
            const start = new Date(base);
            start.setHours(hour, 0, 0, 0);
            const end = new Date(start);
            end.setHours(hour + 1, 0, 0, 0);

            lines.push(
                'BEGIN:VEVENT',
                `UID:${fmt(start)}-${label.replace(/\s/g, '')}@pantryplus`,
                `DTSTART:${fmt(start)}`,
                `DTEND:${fmt(end)}`,
                `SUMMARY:${label}: ${meal}`,
                `DESCRIPTION:Meal plan for ${day.day} (~${Math.round(day.calories / 3)} cal)`,
                'END:VEVENT'
            );
        });
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

/**
 * Trigger a browser download of the meal plan as an .ics file.
 */
export function downloadMealPlanICS(mealPlan: MealPlanDay[], filename = 'pantryplus-meals.ics'): void {
    const ics = generateMealPlanICS(mealPlan);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get Google Calendar OAuth URL
 */
export function getGoogleCalendarAuthUrl(clientId: string, redirectUri: string): string {
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeGoogleAuthCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        };
    } catch (error) {
        console.error('Google auth error:', error);
        return null;
    }
}

// ============================================================================
// SMART HOME INTEGRATION
// ============================================================================

export interface SmartHomeDevice {
    type: 'alexa' | 'google_home';
    deviceId: string;
    name: string;
}

/**
 * Send shopping list to Alexa
 */
export async function sendToAlexaShoppingList(
    items: ShoppingItem[],
    accessToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Alexa Shopping List API endpoint
        const endpoint = 'https://api.amazonalexa.com/v2/householdlists';

        // Get the shopping list ID first
        const listsResponse = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const lists = await listsResponse.json();
        const shoppingList = lists.lists?.find((list: any) => list.name === 'Alexa shopping list');

        if (!shoppingList) {
            return { success: false, error: 'Shopping list not found' };
        }

        // Add items to the list
        for (const item of items) {
            await fetch(`${endpoint}/${shoppingList.listId}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: `${item.quantity} ${item.unit} ${item.name}`,
                    status: 'active',
                }),
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Alexa integration error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Send shopping list to Google Home
 */
export async function sendToGoogleHomeShoppingList(
    items: ShoppingItem[],
    accessToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Google Shopping List API (via Google Tasks)
        const endpoint = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks';

        for (const item of items) {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `${item.quantity} ${item.unit} ${item.name}`,
                    notes: item.notes || '',
                }),
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Google Home integration error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Create voice announcement for expiring items
 */
export function createExpiryAnnouncement(expiringItems: Array<{ name: string; daysUntilExpiry: number }>): string {
    if (expiringItems.length === 0) {
        return 'All your food items are fresh!';
    }

    const urgent = expiringItems.filter(item => item.daysUntilExpiry <= 2);
    const soon = expiringItems.filter(item => item.daysUntilExpiry > 2 && item.daysUntilExpiry <= 5);

    let announcement = 'Food expiry alert! ';

    if (urgent.length > 0) {
        announcement += `Urgent: ${urgent.map(i => i.name).join(', ')} expiring in ${urgent[0].daysUntilExpiry} days. `;
    }

    if (soon.length > 0) {
        announcement += `Coming soon: ${soon.map(i => i.name).join(', ')} expiring in ${soon[0].daysUntilExpiry} days.`;
    }

    return announcement;
}

// ============================================================================
// GROCERY DELIVERY INTEGRATION
// ============================================================================

export interface DeliveryService {
    name: 'instacart' | 'amazon_fresh' | 'walmart';
    available: boolean;
    estimatedDelivery?: string;
}

/**
 * Check available delivery services
 */
export async function checkDeliveryAvailability(zipCode: string): Promise<DeliveryService[]> {
    // Mock implementation - in reality, would check each service's API
    return [
        { name: 'instacart', available: true, estimatedDelivery: '2 hours' },
        { name: 'amazon_fresh', available: true, estimatedDelivery: '4 hours' },
        { name: 'walmart', available: true, estimatedDelivery: 'Next day' },
    ];
}

/**
 * Create Instacart cart from shopping list
 */
export async function createInstacartCart(
    items: ShoppingItem[],
    apiKey: string
): Promise<{ success: boolean; cartUrl?: string; error?: string }> {
    try {
        // Instacart Partner API endpoint
        const endpoint = 'https://connect.instacart.com/v2/carts';

        const cartItems = items.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
        }));

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cartItems,
                store_id: 'default', // Would be configurable
            }),
        });

        const data = await response.json();

        return {
            success: true,
            cartUrl: data.cart_url || 'https://www.instacart.com/store',
        };
    } catch (error) {
        console.error('Instacart integration error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Create Amazon Fresh cart from shopping list
 */
export async function createAmazonFreshCart(
    items: ShoppingItem[]
): Promise<{ success: boolean; cartUrl?: string; error?: string }> {
    try {
        // Amazon Fresh uses Amazon's Product Advertising API
        // This is a simplified version
        const searchParams = items.map(item =>
            `${item.quantity} ${item.unit} ${item.name}`
        ).join(' ');

        const cartUrl = `https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo&search=${encodeURIComponent(searchParams)}`;

        return { success: true, cartUrl };
    } catch (error) {
        console.error('Amazon Fresh integration error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Compare prices across delivery services
 */
export interface PriceComparison {
    service: string;
    totalPrice: number;
    deliveryFee: number;
    estimatedTotal: number;
    deliveryTime: string;
}

export async function comparePrices(items: ShoppingItem[]): Promise<PriceComparison[]> {
    // The cart subtotal is computed from the user's REAL shopping-list prices.
    // We have no per-retailer pricing API, so the item subtotal is identical
    // across services; the comparison reflects each service's delivery fee and
    // ETA (the genuine, honest differentiator), not invented price markups.
    const basePrice = items.reduce(
        (sum, item) => sum + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 1),
        0
    );

    const services = [
        { service: 'Instacart', deliveryFee: 5.99, deliveryTime: '2 hours' },
        { service: 'Amazon Fresh', deliveryFee: 0, deliveryTime: '4 hours' }, // Free with Prime
        { service: 'Walmart+', deliveryFee: 0, deliveryTime: 'Next day' },    // Free with Walmart+
    ];

    return services
        .map(({ service, deliveryFee, deliveryTime }) => ({
            service,
            totalPrice: basePrice,
            deliveryFee,
            estimatedTotal: basePrice + deliveryFee,
            deliveryTime,
        }))
        .sort((a, b) => a.estimatedTotal - b.estimatedTotal);
}

// ============================================================================
// FITNESS APP INTEGRATION
// ============================================================================

export interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

/**
 * Send meal to MyFitnessPal
 */
export async function logMealToMyFitnessPal(
    mealName: string,
    nutrition: NutritionData,
    accessToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // MyFitnessPal API endpoint
        const endpoint = 'https://api.myfitnesspal.com/v2/nutrition_entries';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meal_name: mealName,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbohydrates: nutrition.carbs,
                fat: nutrition.fat,
                fiber: nutrition.fiber,
                date: new Date().toISOString().split('T')[0],
            }),
        });

        return { success: response.ok };
    } catch (error) {
        console.error('MyFitnessPal integration error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get nutrition goals from MyFitnessPal
 */
export async function getNutritionGoals(
    accessToken: string
): Promise<NutritionData | null> {
    try {
        const response = await fetch('https://api.myfitnesspal.com/v2/users/me/goals', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        return {
            calories: data.calories_goal,
            protein: data.protein_goal,
            carbs: data.carbs_goal,
            fat: data.fat_goal,
            fiber: data.fiber_goal,
        };
    } catch (error) {
        console.error('MyFitnessPal goals error:', error);
        return null;
    }
}

/**
 * Sync meal plan with fitness goals
 */
export function alignMealPlanWithGoals(
    mealPlan: MealPlanDay[],
    goals: NutritionData
): { aligned: boolean; adjustments: string[] } {
    const adjustments: string[] = [];

    const avgCalories = mealPlan.reduce((sum, day) => sum + day.calories, 0) / mealPlan.length;

    if (avgCalories > goals.calories * 1.1) {
        adjustments.push(`Reduce daily calories by ${Math.round(avgCalories - goals.calories)}`);
    } else if (avgCalories < goals.calories * 0.9) {
        adjustments.push(`Increase daily calories by ${Math.round(goals.calories - avgCalories)}`);
    }

    return {
        aligned: adjustments.length === 0,
        adjustments,
    };
}

// ============================================================================
// INTEGRATION STATUS & MANAGEMENT
// ============================================================================

export interface IntegrationStatus {
    service: string;
    connected: boolean;
    lastSync?: Date;
    error?: string;
}

/**
 * Get all integration statuses
 */
export function getIntegrationStatuses(): IntegrationStatus[] {
    // In a real app, this would check localStorage or a database
    return [
        { service: 'Google Calendar', connected: false },
        { service: 'Alexa', connected: false },
        { service: 'Google Home', connected: false },
        { service: 'Instacart', connected: false },
        { service: 'Amazon Fresh', connected: false },
        { service: 'MyFitnessPal', connected: false },
    ];
}

/**
 * Test integration connection
 */
export async function testIntegration(
    service: string,
    credentials: any
): Promise<{ success: boolean; message: string }> {
    // Mock implementation
    return {
        success: true,
        message: `Successfully connected to ${service}`,
    };
}

export default {
    // Google Calendar
    syncMealPlanToCalendar,
    generateMealPlanICS,
    downloadMealPlanICS,
    getGoogleCalendarAuthUrl,
    exchangeGoogleAuthCode,

    // Smart Home
    sendToAlexaShoppingList,
    sendToGoogleHomeShoppingList,
    createExpiryAnnouncement,

    // Grocery Delivery
    checkDeliveryAvailability,
    createInstacartCart,
    createAmazonFreshCart,
    comparePrices,

    // Fitness Apps
    logMealToMyFitnessPal,
    getNutritionGoals,
    alignMealPlanWithGoals,

    // Management
    getIntegrationStatuses,
    testIntegration,
};
