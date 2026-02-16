# AspirantHub - React Native Mobile App

Complete exam preparation ecosystem for government exams with modern features.

## 🎯 Project Overview

AspirantHub is a comprehensive mobile application for government exam preparation covering:
- SSC, Railway, Banking, Defense, Teaching, Police & more
- Daily Practice & Quiz modes
- Live Tournaments & 1v1 Battles
- Previous Year Questions (PYQ)
- Content Marketplace
- Social Community
- Wallet & Rewards System

## 📁 Project Structure

```
AspirantHub/
├── src/
│   ├── api/                    # API integration
│   │   ├── client.ts          # Axios instance
│   │   ├── endpoints.ts       # API endpoints
│   │   └── services/          # API services
│   │
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   ├── animations/
│   │   └── fonts/
│   │
│   ├── components/            # Reusable components
│   │   ├── common/           # Generic components
│   │   ├── exam/             # Exam components
│   │   ├── practice/         # Practice components
│   │   ├── quiz/             # Quiz components
│   │   └── ...               # Other feature components
│   │
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   │
│   ├── screens/               # All app screens
│   │   ├── auth/
│   │   ├── home/
│   │   ├── practice/
│   │   └── ...               # Other screens
│   │
│   ├── store/                 # Redux state management
│   │   ├── index.ts
│   │   └── slices/
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   ├── constants/             # App constants
│   ├── theme/                 # Theme configuration
│   └── types/                 # TypeScript types
│
├── android/                   # Android native code
├── ios/                       # iOS native code
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   cd AspirantHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Setup environment variables**
   Create a `.env` file in the root directory:
   ```env
   API_BASE_URL=http://localhost:5000/api
   SOCKET_URL=http://localhost:5000
   ```

### Running the App

#### iOS
```bash
npm run ios
# or
npx react-native run-ios
```

#### Android
```bash
npm run android
# or
npx react-native run-android
```

#### Metro Bundler
```bash
npm start
```

## 📦 Core Dependencies

- **React Native** - Mobile framework
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **AsyncStorage** - Local storage
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Gesture handling
- **React Native Vector Icons** - Icons

## 🏗️ Architecture

### State Management
- Redux Toolkit for global state
- Slices for different features (auth, user, exam, etc.)
- Async thunks for API calls

### Navigation
- Stack navigation for auth flow
- Bottom tab navigation for main app
- Nested navigators for feature sections

### API Integration
- Centralized API client with Axios
- Request/Response interceptors
- Automatic token management

### Folder Organization
- Feature-based organization
- Separation of concerns
- Reusable components
- Custom hooks for business logic

## 🎨 UI/UX

### Design System
- **Colors**: Primary (Indigo), Secondary (Green), Accent (Amber)
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8-point grid system
- **Components**: Custom reusable UI components

### Theme
- Light mode (default)
- Dark mode support (planned)
- Consistent design tokens

## 🔧 Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

### Best Practices
- Component composition
- Custom hooks for reusability
- Type safety with TypeScript
- Clean code principles

## 📱 Features (Planned)

- ✅ Authentication (Login/Register/OTP)
- ✅ Redux State Management
- ✅ API Integration
- ✅ Navigation Setup
- 🚧 Daily Practice
- 🚧 Quiz Modes
- 🚧 Tournaments
- 🚧 Battles
- 🚧 PYQ Module
- 🚧 Content Store
- 🚧 Social Feed
- 🚧 Wallet System

## 🤝 Contributing

This is a private project. For team members:
1. Create feature branches
2. Follow code style guidelines
3. Write clean, documented code
4. Test thoroughly before PR

## 📄 License

Private & Proprietary

## 👥 Team

Built with ❤️ by the AspirantHub team
