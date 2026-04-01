# PantryPlus Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Navigate to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider
4. Create Firestore Database:
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in "Production mode"
5. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click on the web app icon (</>) or create a new web app
   - Copy the configuration values

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

In your Firebase Console, go to Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Inventory collection
    match /inventory/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Shopping collection
    match /shopping/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Recipes collection
    match /recipes/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## Features Overview

### Authentication
- Email/Password sign up and sign in
- Google OAuth integration
- Protected routes that redirect to sign-in
- Automatic session management

### Inventory Management
- Add items with name, category, quantity, unit, expiry date, location, and notes
- Edit and delete items
- Visual indicators for expiring items (within 7 days)
- Visual indicators for expired items
- Search and filter by category
- Offline-first with automatic sync

### Shopping List
- Add items with quantity and category
- Mark items as purchased
- Delete items
- Offline-first with automatic sync

### Recipe Planner
- View your available ingredients
- Browse featured recipes
- Recipe matching (expandable for future AI integration)

### Offline Support
- All data stored locally in IndexedDB using Dexie.js
- Works completely offline
- Automatic background sync when online
- Sync status indicators

## PWA Features

### Installation
The app can be installed as a Progressive Web App:
- On mobile: Tap "Add to Home Screen"
- On desktop: Look for the install icon in the address bar

### Offline Functionality
- Service worker caches app shell
- Background sync for data
- Offline-first architecture

## Development

### Project Structure
```
├── app/                      # Next.js app directory
│   ├── auth/                 # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/            # Main dashboard
│   ├── inventory/            # Inventory management
│   ├── shopping/             # Shopping list
│   ├── recipes/              # Recipe planner
│   └── page.tsx              # Landing page
├── lib/                      # Core library code
│   ├── db/                   # Dexie database schema
│   ├── firebase/             # Firebase configuration
│   └── hooks/                # Custom React hooks
├── components/               # Reusable components (future)
└── public/                   # Static assets
    ├── manifest.json         # PWA manifest
    └── icons/                # App icons
```

### Key Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Material-UI**: Component library (imported for future use)
- **Framer Motion**: Animation library
- **Firebase**: Authentication and cloud database
- **Dexie.js**: IndexedDB wrapper for offline storage
- **next-pwa**: PWA support for Next.js

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## Troubleshooting

### Firebase Authentication Issues
- Ensure Firebase credentials are correctly set in `.env.local`
- Check that authentication providers are enabled in Firebase Console
- Verify authorized domains in Firebase Console

### Offline Sync Issues
- Check browser console for sync errors
- Verify Firestore security rules
- Check network tab for failed requests

### Build Errors
- Ensure all environment variables are set
- Run `npm run lint` to check for code issues
- Clear `.next` folder and rebuild

## Next Steps

1. **Add Custom Icons**: Replace placeholder icons in `public/icons/`
2. **Implement Barcode Scanner**: Add UI component for barcode scanning
3. **Recipe API Integration**: Connect to recipe APIs
4. **Advanced Features**:
   - Recipe recommendations based on inventory
   - Meal planning calendar
   - Nutrition tracking
   - Price tracking
   - Waste analytics

## Support

For issues or questions:
1. Check the documentation above
2. Review Firebase Console for authentication/database issues
3. Check browser console for client-side errors
4. Review server logs for API issues

## License

MIT License - See LICENSE file for details
