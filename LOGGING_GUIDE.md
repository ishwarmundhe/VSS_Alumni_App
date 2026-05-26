# VSS Alumni App - Logging & Debugging Guide

## Overview

Comprehensive guide for logging, debugging, and troubleshooting the VSS Alumni App.

---

## Logging Best Practices

### 1. Console Logging Levels

#### Debug Information

```javascript
console.log('Event data:', event);
console.log('Form submitted:', formData);
```

#### Warnings

```javascript
console.warn('Avatar upload may fail without proper permissions');
console.warn('API response missing expected field:', response);
```

#### Errors

```javascript
console.error('Failed to create event:', error);
console.error('API call failed with status:', error.status);
```

#### Info (Important milestones)

```javascript
console.info('User logged in:', userId);
console.info('Events loaded successfully:', events.length);
```

### 2. Strategic Logging Points

#### API Requests

```javascript
// Log before mutation
console.log('[API] Creating event:', formData);
try {
  const result = await createEvent(formData).unwrap();
  console.log('[API] Event created:', result);
} catch (error) {
  console.error('[API] Event creation failed:', {
    status: error.status,
    message: error.data?.message,
    timestamp: new Date().toISOString(),
  });
}
```

#### State Changes

```javascript
const [viewMode, setViewMode] = useState('list');

const handleViewModeChange = mode => {
  console.log('[STATE] View mode changed:', mode);
  setViewMode(mode);
};
```

#### Navigation Events

```javascript
const handleEventPress = eventId => {
  console.log('[NAVIGATION] Going to event details:', eventId);
  navigation.navigate('EventDetails', { eventId });
};
```

#### User Interactions

```javascript
const handleDelete = (eventId) => {
  console.log('[ACTION] User initiated delete:', eventId);
  Alert.alert(...);
};
```

### 3. Structured Logging Format

Use consistent prefixes for easier filtering:

```javascript
// Format: [DOMAIN] Action: Details
console.log('[API] GET /events:', response.length, 'events');
console.log('[FORM] Validation failed:', errors);
console.log('[UI] Rendered EventsScreen');
console.log('[AUTH] Token valid:', token?.substring(0, 20) + '...');
console.log('[CACHE] Invalidated Events tag');
```

**Common Domains:**

- `[API]` - API calls & responses
- `[FORM]` - Form validation & submission
- `[AUTH]` - Authentication & authorization
- `[NAVIGATION]` - Screen navigation
- `[UI]` - Component rendering
- `[ACTION]` - User actions
- `[CACHE]` - RTK Query cache updates
- `[ERROR]` - Error handling
- `[STORAGE]` - Local storage operations

---

## Debugging Techniques

### 1. Redux DevTools

#### Setup

```javascript
// In Android/iOS, shake device to access menu
// Navigate to More → Show options menu
// DevTools should be available if correctly configured
```

#### Key Actions to Monitor

- API queries: `api/executeQuery...`
- API mutations: `api/executeMutation...`
- State changes: Check action payloads

#### What to Look For

```javascript
// Action example
{
  type: 'api/executeQuery/fulfilled',
  payload: {
    data: [...events],
    meta: {...}
  }
}
```

### 2. Network Tab Debugging

#### Using Chrome DevTools

```bash
# Connect device/emulator
adb forward tcp:8081 tcp:8081

# Open Chrome DevTools
# Visit: chrome://inspect

# Find your device and inspect
```

#### Check These in Network Tab

1. **Request Headers**

   ```
   Authorization: Bearer <token>
   Content-Type: application/json
   ```

2. **Response Headers**

   ```
   Content-Type: application/json
   Status: 200/201/400/401/500
   ```

3. **Response Body**

   ```json
   {
     "success": true,
     "data": {...},
     "message": "Operation successful"
   }
   ```

4. **Request Payload**
   ```json
   {
     "event_name": "Alumni Meet",
     "date": "2026-06-15"
   }
   ```

### 3. React Native Debugger

#### Installation

```bash
npm install -g react-native-debugger
```

#### Starting

```bash
# Open React Native Debugger
react-native-debugger

# In app terminal
j  # Enable jsi debugger
```

#### Features

- Redux DevTools integration
- Element inspector
- Network monitor
- Async storage viewer

### 4. Console Filtering

#### Show only specific domains

```javascript
// Show only API logs
console.log = msg => {
  if (typeof msg === 'string' && msg.includes('[API]')) {
    console.debug(msg);
  }
};
```

#### Real-time filtering in DevTools

```
# Filter box in Chrome DevTools
[API]
[ERROR]
```

---

## Common Issues & Solutions

### Issue 1: API Call Not Triggering

**Symptoms:**

- Data not loading
- `isFetching` stays false
- No network request in DevTools

**Debugging Steps:**

```javascript
// 1. Verify hook is being called
function EventsScreen() {
  console.log('[DEBUG] EventsScreen mounted');

  const { data, isFetching, error } = useGetEventsQuery();
  console.log('[DEBUG] Query state:', { data, isFetching, error });

  return <View>{data?.length}</View>;
}

// 2. Check if query is skipped
const { data } = useGetEventsQuery(undefined, { skip: true }); // Won't run!

// 3. Verify base URL
// Check apiSlice.js baseUrl: should be http://85.25.172.10:8002
```

**Common Causes:**

- ❌ Condition skips query: `skip: condition`
- ❌ Invalid parameters passed
- ❌ Wrong base URL
- ❌ Network connectivity issue

### Issue 2: Authentication Token Missing

**Symptoms:**

- 401 Unauthorized errors
- API calls fail with "Invalid token"

**Debugging:**

```javascript
// 1. Check token in Redux state
import { useSelector } from 'react-redux';

function DebugComponent() {
  const token = useSelector(state => state.auth.token);
  console.log('[AUTH] Current token:', token?.substring(0, 20) + '...');
  return null;
}

// 2. Verify prepareHeaders in apiSlice.js
const baseQuery = fetchBaseQuery({
  // ...
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    console.log('[AUTH] Adding token to request:', !!token);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

**Solutions:**

- ✅ Clear app data and re-login
- ✅ Check Redux DevTools for auth state
- ✅ Verify token expiration

### Issue 3: Form Validation Not Working

**Symptoms:**

- Invalid data submitted to API
- No error messages shown

**Debugging:**

```javascript
const validateForm = () => {
  console.log('[FORM] Validating:', formData);

  if (!formData.event_name.trim()) {
    console.warn('[FORM] Validation failed: empty event name');
    return false;
  }

  console.log('[FORM] Validation passed');
  return true;
};

// Call before submit
const handleSubmit = () => {
  if (!validateForm()) {
    console.error('[FORM] Form validation failed, aborting submit');
    return;
  }
  // Submit...
};
```

**Solutions:**

- ✅ Add console logs in validation function
- ✅ Check Toast notifications appear
- ✅ Verify Alert.alert() is being called

### Issue 4: Images/Avatars Not Uploading

**Symptoms:**

- Upload appears to work but no image visible
- API returns success but image is missing

**Debugging:**

```javascript
const handleUpload = async imageUri => {
  console.log('[UPLOAD] Starting upload from:', imageUri);

  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  });

  console.log('[UPLOAD] FormData created:', Object.keys(formData));

  try {
    const result = await uploadAvatar(formData).unwrap();
    console.log('[UPLOAD] Success:', result);
  } catch (error) {
    console.error('[UPLOAD] Failed:', {
      status: error.status,
      message: error.data?.message,
    });
  }
};
```

**Check in Network Tab:**

```
Request:
- Content-Type: multipart/form-data
- Form data contains 'avatar' field
- File is being sent

Response:
- Status: 200 or 201
- Returns image URL
```

**Solutions:**

- ✅ Verify image URI is valid
- ✅ Check file size (limit: ~5MB)
- ✅ Ensure FormData format is correct

### Issue 5: Cache Not Invalidating

**Symptoms:**

- After creating event, list doesn't update
- Manual refetch() works but automatic doesn't

**Debugging:**

```javascript
// Before mutation
const { data: eventsStart } = useGetEventsQuery();
console.log('[CACHE] Initial events:', eventsStart?.length);

// After mutation
const [createEvent] = useCreateEventMutation();
await createEvent(newEvent);

// Should automatically refetch
const { data: eventsEnd } = useGetEventsQuery();
console.log('[CACHE] Events after mutation:', eventsEnd?.length);
```

**Verify Tags:**

```javascript
// In apiSlice.js

// Query must have providesTags
getEvents: builder.query({
  query: () => '/v1/events',
  providesTags: ['Events'],  // ← REQUIRED
}),

// Mutation must invalidate same tag
createEvent: builder.mutation({
  query: data => ({...}),
  invalidatesTags: ['Events'],  // ← MUST MATCH
}),
```

**Solutions:**

- ✅ Verify tag names match exactly
- ✅ Check `invalidatesTags` array includes tag
- ✅ Manual `refetch()` as fallback

---

## Error Handling Best Practices

### 1. API Error Handling

```javascript
const [createEvent, { isLoading }] = useCreateEventMutation();

const handleSubmit = async data => {
  try {
    console.log('[API] Sending event data:', data);
    const result = await createEvent(data).unwrap();
    console.log('[API] Success:', result);

    Toast.show({
      type: 'success',
      text1: 'Event Created',
      text2: 'New event added successfully',
    });
  } catch (error) {
    console.error('[ERROR] API Error:', {
      status: error.status,
      message: error.data?.message,
      fullError: error,
    });

    const errorMessage =
      error?.data?.message || 'Failed to create event. Please try again.';

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }
};
```

### 2. Network Error Handling

```javascript
const { data, error, isLoading } = useGetEventsQuery();

if (error) {
  console.error('[NETWORK] Request failed:', {
    status: error.status,
    message: error.data?.message,
    isNetworkError: error.status === 0,
  });

  if (error.status === 0) {
    return <Text>No internet connection</Text>;
  } else if (error.status === 401) {
    return <Text>Session expired. Please login again.</Text>;
  } else {
    return <Text>Error loading events</Text>;
  }
}
```

### 3. Validation Error Handling

```javascript
const validateEmail = email => {
  console.log('[VALIDATION] Checking email:', email);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log('[VALIDATION] Email valid:', isValid);
  return isValid;
};

if (!validateEmail(formData.email)) {
  console.warn('[VALIDATION] Invalid email format');
  errors.push('Invalid email format');
}
```

---

## Performance Debugging

### 1. Render Performance

```javascript
function EventsScreen() {
  console.time('EventsScreen-render');

  const { data } = useGetEventsQuery();

  return (
    <View>
      {data?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </View>
  );

  console.timeEnd('EventsScreen-render');
}
```

**Output:**

```
EventsScreen-render: 0.234ms
```

### 2. API Performance

```javascript
const handleLoadEvents = async () => {
  console.time('API-getEvents');

  const { data } = await getEvents();

  console.timeEnd('API-getEvents');
  console.log('Loaded', data.length, 'events');
};
```

### 3. Memory Usage

```javascript
// Monitor in React Native Debugger
// Tools → Performance Monitor

// Or log object sizes
const largeArray = [...];
console.log('[MEMORY] Events array size:', JSON.stringify(largeArray).length, 'bytes');
```

---

## Debugging Checklist

### Before Submitting Bug Report

- [ ] Check console for errors
- [ ] Check Redux DevTools state
- [ ] Verify network request in DevTools
- [ ] Clear app cache (`Clear app data`)
- [ ] Re-login if auth-related
- [ ] Check device/emulator has internet
- [ ] Try on different device
- [ ] Check API endpoint is correct
- [ ] Verify required fields in request
- [ ] Check response status code

### Information to Include in Bug Report

```javascript
{
  "error_description": "...",
  "console_errors": "...",
  "network_request": {
    "url": "...",
    "method": "...",
    "status": 400,
    "response": {...}
  },
  "redux_state": {...},
  "steps_to_reproduce": "...",
  "device": "Android/iOS",
  "app_version": "1.0.0"
}
```

---

## Environment-Specific Debugging

### Development

```javascript
// Use detailed logs
console.log('[DEV] Event data:', JSON.stringify(event, null, 2));

// Show Redux DevTools
// Shake device → Show options menu
```

### Staging

```javascript
// Reduce log verbosity
// Monitor error rate
// Check API response times
```

### Production

```javascript
// Minimal logging
// Only errors and critical events
// Consider remote logging service
```

---

## Tools & Resources

### Official Tools

- **React Native Debugger** - Inspection & debugging
- **Chrome DevTools** - Network & console
- **Redux DevTools** - State debugging
- **Flipper** - Device debugging

### VS Code Extensions

```
- React Native Tools (Microsoft)
- ES7+ React/Redux/React-Native snippets
- Thunder Client (API testing)
- GitLens (Git debugging)
```

### Browser Extensions

```
- React Developer Tools
- Redux DevTools
- Network Tab (built-in)
```

### CLI Commands

```bash
# Clear app data
adb shell pm clear com.vss.alumni

# View logs
adb logcat | grep "app-name"

# Start debugger
react-native-debugger

# Run tests with verbose
npm test -- --verbose
```

---

## Logging Examples by Feature

### Events API

```javascript
// EventsScreen.jsx
console.log('[EVENTS] Query started');
const { data: events, isFetching, error } = useGetEventsQuery();
console.log('[EVENTS] Loaded:', events?.length, 'error:', error?.message);

// AdminEventsTab.jsx
console.log('[ADMIN] Creating event:', formData);
await createEvent(formData);
console.log('[ADMIN] Event created successfully');
```

### Avatar Upload

```javascript
console.log('[AVATAR] Starting upload');
console.log('[AVATAR] FormData:', { uri, name, type });
const result = await uploadAvatar(formData);
console.log('[AVATAR] Uploaded:', result.avatar_url);
```

### Navigation

```javascript
console.log('[NAV] Navigating to EventDetails with:', { eventId });
navigation.navigate('EventDetails', { eventId });

console.log('[NAV] Route params:', route.params);
const { eventId } = route.params;
```

---

## Advanced Debugging

### 1. Monkey Patching for Testing

```javascript
// Temporarily override fetch for testing
const originalFetch = fetch;
fetch = (url, options) => {
  console.log('[FETCH] Request:', url, options);
  return originalFetch(url, options).then(response => {
    console.log('[FETCH] Response:', response.status);
    return response;
  });
};
```

### 2. State Snapshots

```javascript
// Capture Redux state at key points
const captureState = () => {
  const state = store.getState();
  console.log('[SNAPSHOT] Current state:', {
    auth: state.auth,
    api: state.api?.queries,
  });
};
```

### 3. Performance Profiling

```javascript
// Wrap expensive operations
const profileOperation = async (name, fn) => {
  console.time(name);
  const result = await fn();
  console.timeEnd(name);
  return result;
};

// Usage
const events = await profileOperation('Load events', () => getEvents());
```

---

## Related Documentation

- `ARCHITECTURE.md` - Technical architecture
- `PROJECT_STRUCTURE.md` - File organization
- README.md - Project setup & overview

---

## Quick Reference Card

```
[DOMAINS]
[API] - API calls
[FORM] - Form operations
[AUTH] - Authentication
[NAV] - Navigation
[CACHE] - Cache management
[ERROR] - Error handling
[UI] - UI rendering
[ACTION] - User actions

[DEBUGGING TOOLS]
DevTools: Chrome Inspector
Redux: Redux DevTools
Network: DevTools Network Tab
Logs: adb logcat or console
React: React Developer Tools

[COMMON ISSUES]
No data → Check API hook & baseUrl
401 Error → Check auth token
Cache stale → Check invalidateTags
Form error → Check validation logic
Image missing → Check FormData & upload endpoint
```
