# VSS Alumni App - Architecture & API Integration Guide

## Overview

This document outlines the architectural patterns, API integration approach, and system design for the VSS Alumni App.

---

## System Architecture

### Technology Stack

- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit with RTK Query
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Lucide React Native
- **Notifications**: React Native Toast Message
- **Styling**: CSS-in-JS with classNames

### Directory Structure

```
src/
├── api/                      # Redux Toolkit API slice & hooks
│   └── apiSlice.js          # All API endpoint definitions
├── screens/                  # Screen components organized by feature
│   ├── admin/               # Admin dashboard & event management
│   ├── auth/                # Authentication flows
│   ├── events/              # Event browsing & details
│   ├── home/                # Home screen
│   ├── user/                # User profile & settings
│   ├── directory/           # Alumni directory
│   ├── community/           # Community features
│   ├── fundraising/         # Donation/fundraising
│   ├── volunteering/        # Volunteer opportunities
│   └── [other screens]/
├── components/              # Reusable UI components
├── store/                   # Redux store configuration
├── navigation/              # Navigation stack definitions
├── lib/                     # Utility functions & helpers
└── assets/                  # Images, fonts, static files
```

---

## API Integration Pattern

### Redux Toolkit Query (RTK Query)

All APIs use RTK Query, which provides automatic caching, synchronization, and real-time updates.

#### Key Benefits:

- **Automatic Cache Management**: No manual state management needed
- **Tag-based Invalidation**: Mutations automatically invalidate related queries
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Separate `isFetching` and `isLoading` states
- **TypeScript Support**: Full type safety (can be added)

### Base Configuration

```javascript
// src/api/apiSlice.js
baseUrl: 'http://85.25.172.10:8002'; // Development server
// For production: 'https://mvmsamiti.org/wp-json'

// Authorization is automatically added to all requests
headers.set('authorization', `Bearer ${token}`);
```

---

## API Endpoints

### Avatar Management

| Method | Endpoint        | Purpose                                 |
| ------ | --------------- | --------------------------------------- |
| GET    | `/v1/me/avatar` | Retrieve user's avatar                  |
| POST   | `/v1/me/avatar` | Upload new avatar (multipart/form-data) |
| PUT    | `/v1/me/avatar` | Update existing avatar                  |
| DELETE | `/v1/me/avatar` | Remove avatar                           |

**Hooks:**

- `useGetAvatarQuery()` - Fetch avatar
- `useUploadAvatarMutation()` - Upload/create avatar
- `useUpdateAvatarMutation()` - Update avatar
- `useDeleteAvatarMutation()` - Delete avatar

### Events Management

| Method | Endpoint                 | Purpose                                 |
| ------ | ------------------------ | --------------------------------------- |
| GET    | `/v1/events`             | List all events (with optional filters) |
| GET    | `/v1/events/{id}`        | Get event details                       |
| POST   | `/v1/events`             | Create new event (admin only)           |
| PUT    | `/v1/events/{id}`        | Update event (admin only)               |
| DELETE | `/v1/events/{id}`        | Delete event (admin only)               |
| POST   | `/v1/events/{id}/banner` | Upload event banner image               |

**Hooks:**

- `useGetEventsQuery(params?)` - List events
- `useGetEventByIdQuery(eventId)` - Get single event
- `useCreateEventMutation()` - Create event
- `useUpdateEventMutation()` - Update event
- `useDeleteEventMutation()` - Delete event
- `useUploadEventBannerMutation()` - Upload banner

#### Event Schema

```json
{
  "id": 1,
  "event_name": "Alumni Meet 2026",
  "date": "2026-06-15",
  "time": "18:00",
  "host_name": "Achut Gite",
  "event_location": "Samiti Hall, Pune",
  "is_paid": true,
  "registration_fee": 500,
  "banner_url": "https://...",
  "description": "Event description (optional)"
}
```

---

## Using RTK Query Hooks

### Query Example (Fetch Data)

```javascript
import { useGetEventsQuery } from '../../api/apiSlice';

function EventsList() {
  const { data: events = [], isFetching, refetch } = useGetEventsQuery();

  // data: Array of events (empty [] by default)
  // isFetching: boolean (true while loading)
  // refetch: Function to manually refresh data

  return (
    <TouchableOpacity onPress={refetch}>
      <Text>Events: {events.length}</Text>
    </TouchableOpacity>
  );
}
```

### Mutation Example (Create/Update Data)

```javascript
import { useCreateEventMutation } from '../../api/apiSlice';
import Toast from 'react-native-toast-message';

function CreateEventForm() {
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const handleSubmit = async formData => {
    try {
      const result = await createEvent(formData).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Event created successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to create event',
      });
    }
  };

  return <Button disabled={isLoading} onPress={handleSubmit} />;
}
```

### Multipart Form Data (File Upload)

```javascript
function AvatarUpload() {
  const [uploadAvatar] = useUploadAvatarMutation();

  const handleUpload = async imageUri => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    try {
      await uploadAvatar(formData).unwrap();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
}
```

---

## Cache Invalidation & Tags

### How Tags Work

- **Queries provide tags**: `providesTags: ['Events']`
- **Mutations invalidate tags**: `invalidatesTags: ['Events']`
- When a mutation invalidates a tag, all queries with that tag are refetched

### Tag Types in This App

| Tag              | Used By            | Invalidated By              |
| ---------------- | ------------------ | --------------------------- |
| `'User'`         | User queries       | User mutations              |
| `'CurrentUser'`  | `/v1/users/me`     | Profile updates             |
| `'Avatar'`       | Avatar queries     | Avatar mutations            |
| `'Events'`       | Event queries      | Event mutations             |
| `'PendingUsers'` | Admin pending list | User approvals              |
| `'Alumni'`       | Alumni list        | Approvals & profile updates |

### Example: Automatic Cache Update

```javascript
// 1. Component fetches events (cached)
const { data: events } = useGetEventsQuery();

// 2. User creates new event
const [createEvent] = useCreateEventMutation();
await createEvent(newEvent); // Invalidates 'Events' tag

// 3. Events query automatically refetches
// No manual refetch() call needed!
```

---

## Navigation Structure

### Stack Architecture

```
RootStack
├── Auth Stack
│   ├── SplashScreen
│   ├── LoginScreen
│   ├── OTPVerification
│   └── ProfileOnboarding
├── Main Stack
│   ├── HomeScreen
│   ├── EventsScreen
│   ├── EventDetailsScreen
│   ├── AdminDashboard
│   ├── EditProfileScreen
│   ├── UserProfile
│   ├── SettingScreen
│   ├── Directory
│   ├── Fundraising
│   ├── Volunteering
│   ├── Community
│   ├── Updates
│   └── [other screens]
└── Modals
    └── [popup screens]
```

### Navigation Patterns

```javascript
// Navigate to screen
navigation.navigate('EventsScreen');

// Navigate with parameters
navigation.navigate('EventDetails', { eventId: 123 });

// Access parameters in destination
function EventDetailsScreen({ route }) {
  const { eventId } = route.params;
}

// Go back
navigation.goBack();
```

---

## Error Handling

### Toast Notifications

```javascript
import Toast from 'react-native-toast-message';

// Success
Toast.show({
  type: 'success',
  text1: 'Success',
  text2: 'Operation completed',
});

// Error
Toast.show({
  type: 'error',
  text1: 'Error',
  text2: error?.data?.message || 'Something went wrong',
});

// Info
Toast.show({
  type: 'info',
  text1: 'Information',
  text2: 'Additional details',
});
```

### Alert Dialogs

```javascript
import { Alert } from 'react-native';

Alert.alert('Confirm Delete', 'Are you sure?', [
  { text: 'Cancel' },
  {
    text: 'Delete',
    onPress: handleDelete,
    style: 'destructive',
  },
]);
```

### API Error Handling

```javascript
try {
  const result = await mutation(data).unwrap();
  // Success
} catch (error) {
  // error.data.message - API error message
  // error.status - HTTP status code
  // error.originalStatus - Original error code
}
```

---

## Performance Optimization

### 1. Selective Field Queries

```javascript
// Instead of fetching all fields, use params
useGetEventsQuery({ page: 1, limit: 10 });
```

### 2. Manual Cache Control

```javascript
const { refetch } = useGetEventsQuery();

// Refresh on demand (expensive operation)
const handleRefresh = () => {
  refetch();
};
```

### 3. Debouncing Search

```javascript
const [search, setSearch] = useState('');

// Manually filter instead of fetching
const filtered = useMemo(() => {
  return events.filter(e => e.name.includes(search));
}, [events, search]);
```

### 4. FlatList Optimization

```javascript
// Always use scrollEnabled={false} in ScrollView
<FlatList
  scrollEnabled={false}
  data={data}
  keyExtractor={item => item.id.toString()}
  renderItem={({ item }) => <Item {...item} />}
/>
```

---

## Debugging

### Redux DevTools

```javascript
// Enable Redux debugging in Android
// Menu → More → Show options menu (hold alt)
```

### Logging API Calls

```javascript
// In apiSlice.js, add logging middleware
const apiSlice = createApi({
  // ... config
  baseQuery: fetchBaseQuery({
    // ... setup
  }),
  // Add this to middleware in store
});
```

### Network Tab

Use Chrome DevTools or React Native Debugger to inspect network requests.

---

## Best Practices

1. **Always use hooks** - Never call `apiSlice.endpoints` directly
2. **Handle loading states** - Show spinners/skeletons
3. **Handle errors gracefully** - Use Toast for user feedback
4. **Validate forms before submit** - Check required fields
5. **Use key props in lists** - Ensure proper reconciliation
6. **Cache wisely** - Use tags to manage invalidation
7. **Avoid redundant requests** - RTK Query caches by default
8. **Test mutations** - Verify API responses in dev tools

---

## Common Patterns

### Pull-to-Refresh

```javascript
<ScrollView
  refreshControl={
    <RefreshControl refreshing={isFetching} onRefresh={refetch} />
  }
>
  {/* Content */}
</ScrollView>
```

### Pagination

```javascript
const [page, setPage] = useState(1);
const { data: events } = useGetEventsQuery({ page, limit: 10 });

const handleLoadMore = () => setPage(p => p + 1);
```

### Conditional Rendering

```javascript
{
  isFetching ? (
    <ActivityIndicator />
  ) : data?.length > 0 ? (
    <List data={data} />
  ) : (
    <EmptyState />
  );
}
```

---

## Security Considerations

1. **Token Management** - Stored in Redux auth state
2. **HTTPS Only** - Use HTTPS in production
3. **Bearer Token** - Sent in `Authorization` header
4. **Input Validation** - Validate all user inputs
5. **Error Messages** - Don't expose sensitive info in errors
6. **CORS Handling** - API must allow cross-origin requests

---

## Future Enhancements

1. **Pagination** - Implement offset/cursor-based pagination
2. **Filtering** - Advanced event filters (date range, location)
3. **Search** - Real-time search with debouncing
4. **Offline Support** - Use RTK Query's offline plugin
5. **WebSocket** - Real-time event updates
6. **Image Optimization** - Compress avatars/banners
7. **Analytics** - Track user actions

---

## Related Documentation

- `PROJECT_STRUCTURE.md` - Directory layout and file organization
- `LOGGING_GUIDE.md` - Logging conventions and debugging
- Redux Toolkit Docs: https://redux-toolkit.js.org/
- RTK Query Docs: https://redux-toolkit.js.org/rtk-query
