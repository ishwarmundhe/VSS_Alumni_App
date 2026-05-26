# VSS Alumni App - Project Structure Guide

## Overview

Complete guide to the VSS Alumni App directory structure, file organization, and naming conventions.

---

## Root Directory Structure

```
vss_alumni/
├── src/                           # Application source code
├── android/                       # Android native code
├── ios/                          # iOS native code
├── __tests__/                    # Test files
├── App.jsx                       # App entry component
├── app.json                      # Expo configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS config
├── jest.config.js                # Jest testing config
├── babel.config.js               # Babel transpiler config
├── metro.config.js               # Metro bundler config
├── ARCHITECTURE.md               # Architecture guide (this project)
├── PROJECT_STRUCTURE.md          # This file
├── LOGGING_GUIDE.md              # Logging conventions
└── README.md                     # Project overview
```

---

## Source Code (`src/`) Directory

### Main Folders

#### 1. **API Layer** (`src/api/`)

Redux Toolkit Query endpoints and API integration.

```
src/api/
└── apiSlice.js                  # All API endpoint definitions
    ├── Authentication endpoints (login, OTP, register)
    ├── User profile endpoints (get, update, address)
    ├── Admin endpoints (approve, statistics)
    ├── Avatar endpoints (CRUD operations)
    └── Events endpoints (CRUD + banner upload)
```

**Key Exports:**

- `apiSlice` - Main API slice instance
- All RTK Query hooks (useGetEventsQuery, useCreateEventMutation, etc.)

**File Size:** ~250 lines (incrementally growing)

---

#### 2. **Screens** (`src/screens/`)

Screen components organized by feature/domain.

```
src/screens/
├── admin/                       # Admin-specific screens
│   ├── AdminDashboard.jsx       # Main admin dashboard (tabs: overview, approvals, alumni, events)
│   └── AdminEventsTab.jsx       # Event management form & list (NEW)
├── auth/                        # Authentication flows
│   ├── Auth.jsx                 # Auth state handler
│   ├── LoginScreen.jsx          # Login screen
│   └── OTPVerification.jsx      # OTP verification
├── approval/                    # User approval flows
│   └── PendingApproval.jsx      # Pending approval screen
├── community/                   # Community features
│   └── CommunityScreen.jsx      # Community interaction
├── directory/                   # Alumni directory
│   └── AlumniDirectory.jsx      # Directory search & list
├── events/                      # Event management (NEW)
│   ├── EventsScreen.jsx         # Event list & calendar view (NEW)
│   └── EventDetailsScreen.jsx   # Event details & registration (NEW)
├── fundraising/                 # Donation & fundraising
│   └── FundraisingScreen.jsx    # Fundraising campaigns
├── home/                        # Main home screen
│   └── HomeScreen.jsx           # Dashboard (updated with events)
├── onboarding/                  # Initial setup
│   └── ProfileOnboarding.jsx    # Profile creation
├── splash/                      # App startup
│   └── SplashScreen.jsx         # Splash/loading screen
├── updates/                     # News & updates
│   └── UpdatesScreen.jsx        # Latest updates feed
├── user/                        # User profile management
│   ├── EditProfileScreen.jsx    # Profile editing
│   ├── NotificationsScreen.jsx  # Notifications
│   ├── PrivacyPolicyScreen.jsx  # Privacy policy
│   ├── SettingScreen.jsx        # Settings
│   ├── SupportScreen.jsx        # Support/help
│   └── UserProfile.jsx          # View user profile
└── volunteering/                # Volunteer opportunities
    └── VolunteeringScreen.jsx   # Volunteer listings
```

**Naming Conventions:**

- Screen files: `PascalCaseScreen.jsx`
- Feature folders: `lowercase/`
- Always export default component

**Key Stats:**

- Total screens: 22+
- New screens: 2 (EventsScreen, EventDetailsScreen)
- Modified screens: 2 (HomeScreen, AdminDashboard)

---

#### 3. **Components** (`src/components/`)

Reusable UI components.

```
src/components/
├── ui/                          # Shadcn-UI components
│   ├── Avatar.jsx               # User avatar component
│   ├── Breadcrumb.jsx           # Navigation breadcrumb
│   ├── Command.jsx              # Command palette
│   ├── ContextMenu.jsx          # Context menu
│   ├── Dialog.jsx               # Dialog/modal
│   ├── InputOtp.jsx             # OTP input field
│   ├── Menubar.jsx              # Menu bar
│   └── ScrollArea.jsx           # Scrollable area
└── [other components may be added]
```

**Usage Pattern:**

```javascript
import { Dialog } from '../../components/ui/Dialog';
```

---

#### 4. **Store** (`src/store/`)

Redux store configuration and state management.

```
src/store/
├── store.js                     # Main Redux store
├── slices/                      # Redux slices (if using Redux Slice)
│   ├── authSlice.js             # Auth state
│   └── [other slices]
└── [middleware configuration]
```

---

#### 5. **Navigation** (`src/navigation/`)

Navigation stack definitions and routing.

```
src/navigation/
├── RootStack.jsx                # Main navigation stack
├── AuthStack.jsx (if separate)  # Auth-specific navigation
└── MainStack.jsx (if separate)  # Main app navigation
```

**Navigation Structure:**

- Splash → Auth (if not logged in) → Main App
- Main App has tab navigation with nested stacks

---

#### 6. **Library/Utilities** (`src/lib/`)

Reusable utility functions and helpers.

```
src/lib/
├── constants.js                 # App-wide constants
├── validators.js                # Form validation functions
├── formatters.js                # Date/time formatting
├── helpers.js                   # General utilities
└── [other utilities]
```

**Example:**

```javascript
// Validate event form
import { validateEventForm } from '../../lib/validators';
const errors = validateEventForm(formData);
```

---

#### 7. **Styles** (`src/style/`)

Global styles and theme configuration.

```
src/style/
├── theme.css                    # Theme colors & variables
├── font.css                     # Font definitions
└── global.css (root)            # Global styles
```

---

#### 8. **Assets** (`src/assets/`)

Static files, images, and media.

```
src/assets/
├── images/                      # PNG, JPG, SVG files
├── icons/                       # Icon SVGs (if not using lucide)
├── fonts/                       # Custom font files
└── placeholders/                # Placeholder images
```

---

## File Naming Conventions

### Screen Files

```
PascalCaseScreen.jsx

Examples:
- HomeScreen.jsx
- EventsScreen.jsx
- EventDetailsScreen.jsx
- AdminEventsTab.jsx
```

### Component Files

```
PascalCase.jsx

Examples:
- Avatar.jsx
- Dialog.jsx
- EventCard.jsx
```

### Utility Files

```
camelCase.js

Examples:
- validators.js
- formatters.js
- helpers.js
```

### Folders

```
lowercase

Examples:
- src/screens/events/
- src/api/
- src/components/ui/
```

---

## Import Path Patterns

### Absolute Imports (with aliases)

```javascript
// From src/screens/events/EventsScreen.jsx

// API imports
import { useGetEventsQuery } from '../../api/apiSlice';

// Component imports
import Avatar from '../../components/ui/Avatar';

// Lib imports
import { formatDate } from '../../lib/formatters';

// Asset imports
import logo from '../../assets/images/logo.png';
```

### Common Import Patterns

```javascript
// Screens import from api
import { useGetEventsQuery, useCreateEventMutation } from '../../api/apiSlice';

// Screens import navigation props
function EventsScreen({ navigation, route }) {
  // navigation.navigate(), navigation.goBack()
  // route.params
}

// Components import navigation context
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();

// UI imports from react-native
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

// Icons from lucide-react-native
import { Calendar, MapPin, Users } from 'lucide-react-native';
```

---

## Project Dependencies

### Core Libraries

| Package                                     | Purpose               |
| ------------------------------------------- | --------------------- |
| `react-native`                              | UI framework          |
| `expo`                                      | Development framework |
| `@react-navigation/*`                       | Navigation            |
| `@reduxjs/toolkit`                          | State management      |
| `@react-native-async-storage/async-storage` | Local storage         |
| `react-native-safe-area-context`            | Safe area handling    |
| `lucide-react-native`                       | Icons                 |
| `react-native-toast-message`                | Toast notifications   |
| `nativewind`                                | Tailwind CSS          |

### Development Tools

- `jest` - Testing framework
- `babel` - Transpiler
- `prettier` - Code formatter
- `eslint` - Code linter

---

## File Size Reference

### Typical File Sizes

```
Small components:     50-150 lines
Medium components:    150-400 lines
Large screens:        300-600 lines
API slice:            200-300 lines (growing)
Utility files:        100-200 lines
```

### App-wide Stats

- Total screens: 22+
- Total components: 8+
- Total lines of code: ~8000+
- Average screen size: 350 lines

---

## New Files Added in This Session

### API Integration

- **Modified:** `src/api/apiSlice.js`
  - Added: Avatar CRUD endpoints
  - Added: Events CRUD endpoints
  - Added: Event banner upload
  - Total new endpoints: 10

### Screens

- **Created:** `src/screens/events/EventsScreen.jsx`
  - Features: List view, calendar toggle, search
  - Lines: ~280

- **Created:** `src/screens/events/EventDetailsScreen.jsx`
  - Features: Event details, sharing, deletion
  - Lines: ~210

- **Created:** `src/screens/admin/AdminEventsTab.jsx`
  - Features: Event form, validation, CRUD
  - Lines: ~400

- **Modified:** `src/screens/home/HomeScreen.jsx`
  - Updated: Added events query integration
  - Updated: Events count display
  - Updated: Events navigation from quick actions

- **Modified:** `src/screens/admin/AdminDashboard.jsx`
  - Added: Events tab
  - Added: AdminEventsTab integration

### Documentation (root level)

- **Created:** `ARCHITECTURE.md` (~11,800 words)
- **Created:** `PROJECT_STRUCTURE.md` (this file)
- **Created:** `LOGGING_GUIDE.md` (~4,000 words)

---

## Extending the Project

### Adding a New Screen

1. **Create folder** in `src/screens/[feature]/`
2. **Create component file** `ScreenNameScreen.jsx`
3. **Import in navigation** (`src/navigation/RootStack.jsx`)
4. **Add navigation hook** to app navigation
5. **Use API hooks** from `src/api/apiSlice.js`

Example:

```javascript
// src/screens/myfeature/MyFeatureScreen.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useGetMyDataQuery } from '../../api/apiSlice';

export default function MyFeatureScreen({ navigation }) {
  const { data, isFetching } = useGetMyDataQuery();

  return (
    <View className="flex-1">
      <Text>My Feature</Text>
    </View>
  );
}
```

### Adding API Endpoints

1. **Edit** `src/api/apiSlice.js`
2. **Add endpoint** in `endpoints: builder => ({ ... })`
3. **Define query or mutation**
4. **Add tags** for cache invalidation
5. **Export hook** at end of file

Example:

```javascript
getMyData: builder.query({
  query: () => '/v1/my-endpoint',
  providesTags: ['MyData'],
}),

useGetMyDataQuery: builder.mutation({
  query: data => ({
    url: '/v1/my-endpoint',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['MyData'],
}),
```

---

## Best Practices for Project Organization

1. ✅ **Keep screens focused** - One main feature per screen
2. ✅ **Extract components** - Reuse UI elements
3. ✅ **Organize by feature** - Feature-based folder structure
4. ✅ **Centralize API** - All endpoints in apiSlice.js
5. ✅ **Use utilities** - Share logic in lib/ folder
6. ✅ **Consistent naming** - Follow conventions throughout
7. ✅ **Limit nesting** - Max 2 levels deep in folders
8. ✅ **Document complex logic** - Add comments where needed

---

## Troubleshooting

### Import Errors

```
If getting "Cannot find module" error:
- Check file path (../ for up one level)
- Verify file name capitalization
- Ensure file extension (.jsx, .js)
```

### Navigation Issues

```
If screen doesn't appear:
- Verify in RootStack.jsx
- Check navigation.navigate() spelling
- Ensure params match route.params
```

### API Errors

```
If API call fails:
- Check endpoint URL in apiSlice.js
- Verify Bearer token exists
- Check server base URL
```

---

## Related Documentation

- `ARCHITECTURE.md` - Technical architecture & patterns
- `LOGGING_GUIDE.md` - Logging & debugging conventions
- README.md - Project overview & setup

---

## Future Enhancements to Structure

1. **Modular API** - Split apiSlice into multiple feature files
2. **Component Library** - Move shared UI to separate package
3. **Testing Structure** - `__tests__/` organized by feature
4. **Theme Provider** - Centralized theme management
5. **i18n** - Internationalization support (translations)
6. **E2E Tests** - End-to-end test organization
