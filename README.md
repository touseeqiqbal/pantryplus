# PantryPlus - Smart Pantry Manager

A smart offline-first Progressive Web Application (PWA) for managing kitchen pantry inventory, built with Next.js, TypeScript, Firebase, and modern web technologies.

## 🚀 Features

- **🔐 User Authentication**: Secure sign-up/sign-in with email/password and Google OAuth
- **📦 Inventory Management**: Add, edit, delete, and categorize pantry items
- **💾 Offline-First**: Works seamlessly offline using IndexedDB with Dexie.js
- **🔄 Real-time Sync**: Automatic synchronization with Firebase when online
- **⏰ Expiry Alerts**: Track expiration dates and get visual warnings
- **📷 Barcode Scanning**: Ready for barcode scanner integration (ZXing)
- **🛒 Shopping Lists**: Create and manage shopping lists with purchase tracking
- **🍳 Recipe Planner**: Discover recipes based on available ingredients
- **✨ Beautiful UI**: Clean, modern interface with Material-UI and Tailwind CSS
- **🎭 Smooth Animations**: Engaging user experience with Framer Motion
- **📱 PWA Support**: Install as a native app on any device

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Material-UI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (cloud) + Dexie.js (local)
- **Animations**: Framer Motion
- **PWA**: next-pwa
- **Barcode**: ZXing Library

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- Modern web browser

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashderkarim123/Pantry-Plus-Smart-Pantry-Application.git
   cd Pantry-Plus-Smart-Pantry-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
├── app/                      # Next.js app directory
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main dashboard
│   ├── inventory/            # Inventory management
│   ├── shopping/             # Shopping list
│   ├── recipes/              # Recipe planner
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── lib/                      # Core library code
│   ├── db/                   # Database schemas (Dexie)
│   ├── firebase/             # Firebase configuration
│   └── hooks/                # Custom React hooks
├── components/               # Reusable components
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons
└── next.config.mjs           # Next.js configuration
```

## 🎯 Core Features Explained

### Offline-First Architecture
- Uses IndexedDB via Dexie.js for local storage
- Automatic background sync when internet connection is available
- All operations work offline and sync later

### Inventory Management
- Add items with name, category, quantity, unit, expiry date, and location
- Visual indicators for expiring and expired items
- Search and filter by category
- Edit and delete items

### Shopping List
- Quick add items to shopping list
- Mark items as purchased
- Sync across devices

### Recipe Planner
- View available ingredients
- Recipe suggestions (expandable for future AI integration)
- Match recipes with inventory

## 🔐 Security Notes

- Never commit `.env.local` or `.env` files
- Use Firebase Security Rules to protect your data
- Implement proper authentication checks on all protected routes

## 🤝 Contributing

This is a Final Year Project (FYP) for SZABIST. Contributions and suggestions are welcome!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

SZABIST FYP Team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- All open-source contributors

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies

