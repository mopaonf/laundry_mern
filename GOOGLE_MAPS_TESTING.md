# Google Maps Integration Testing Guide

## Quick Test Setup

To test if the Google Maps integration is working correctly after the fixes, follow these steps:

### 1. Add Debug Component (Temporary)

Add the GoogleMapsDebug component to any page to test the integration. For example, add it to the new order page:

**File:** `src/app/neworder/page.tsx`

Add this import at the top:

```typescript
import GoogleMapsDebug from '../../components/GoogleMapsDebug';
```

Then add the component somewhere in the JSX (temporarily):

```tsx
{
   /* Temporary debug component - remove after testing */
}
<GoogleMapsDebug />;
```

### 2. Access the Page

1. Go to `http://localhost:3001/neworder`
2. Look for the "Google Maps Debug Status" section
3. Check if it shows "✅ Loaded Successfully"

### 3. Test the Components

#### Test Location Selection:

1. Try typing in the pickup location field
2. Check if autocomplete suggestions appear
3. Select a suggestion and verify it populates correctly

#### Test Map Display (if viewing existing orders):

1. Navigate to an existing order with location data
2. Click to view the map
3. Verify the map loads without console errors

### 4. Check Browser Console

Open the browser developer tools (F12) and check the Console tab for:

-  ✅ No "Google Maps API multiple times" errors
-  ✅ No "Cannot read properties of undefined (reading 'Autocomplete')" errors
-  ✅ Green checkmark messages from the debug component

### 5. Test Different Scenarios

1. **Fresh Page Load**: Refresh the page and test immediately
2. **Component Re-mounting**: Navigate away and back to test component lifecycle
3. **Multiple Components**: Test both LocationSelector and MapViewModal on the same page

## Expected Results

### ✅ Success Indicators:

-  Debug component shows "Loaded Successfully"
-  All API availability checks show green checkmarks
-  Location autocomplete works smoothly
-  Maps display without errors
-  Console shows successful loading messages

### ❌ Failure Indicators:

-  Debug component shows "Error" status
-  Red X marks in API availability
-  Autocomplete fails to initialize
-  Console errors about undefined properties

## Troubleshooting

### If Google Maps fails to load:

1. **Check API Key**: Verify `NEXT_PUBLIC_GOOGLE_API_KEY` in `.env.local`
2. **Check Network**: Ensure internet connection for Google Maps API
3. **Check Console**: Look for specific error messages
4. **Restart Server**: Try stopping and restarting the dev server

### If Autocomplete is undefined:

1. Check if the `places` library is being loaded
2. Verify the GoogleMapsLoader is waiting for all libraries
3. Check browser network tab for failed API requests

## Cleanup After Testing

Remove the GoogleMapsDebug component from your pages once testing is complete:

```typescript
// Remove this line
import GoogleMapsDebug from '../../components/GoogleMapsDebug';

// Remove this component from JSX
<GoogleMapsDebug />;
```

## Production Checklist

Before deploying to production:

-  [ ] Remove all debug components
-  [ ] Verify API key is properly configured
-  [ ] Test on different browsers
-  [ ] Test with slower internet connections
-  [ ] Verify error handling works correctly
