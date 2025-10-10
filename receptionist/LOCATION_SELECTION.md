# Receptionist Location Selection Feature

## Overview

The receptionist can now add both pickup and dropoff locations when creating orders for customers who come to the pressing shop in person. This ensures that after cleaning, the items can be delivered to the customer's preferred location.

## Features Added

### 🗺️ **Location Selection**

-  **Pickup Location**: Where to collect items from the customer
-  **Dropoff Location**: Where to deliver cleaned items back to the customer
-  **Google Maps Integration**: Uses Google Places API for accurate location search
-  **Address Validation**: Ensures both locations are provided before order submission

### 📱 **User Interface**

-  **Location Cards**: Visual display of selected pickup and dropoff locations
-  **Search Integration**: Real-time address search with autocomplete
-  **Validation**: Form validation ensures both locations are selected
-  **Summary View**: Order summary shows all location details before submission

### 🔄 **Workflow**

1. **Customer Selection**: Receptionist selects the customer
2. **Items Selection**: Add items to the order as usual
3. **Location Selection**:
   -  Select pickup location (where to collect from customer)
   -  Select dropoff location (where to deliver back)
4. **Order Details**: Set pickup date and notes
5. **Submit**: Create order with complete location information

## Technical Implementation

### **Frontend Changes**

-  Updated `neworder/page.tsx` with location selection UI
-  Integrated existing `LocationSelector` component
-  Added location validation to form submission
-  Enhanced order summary with location preview

### **Backend Integration**

-  Order creation API already supports `pickupLocation` and `dropoffLocation`
-  Location data includes:
   ```json
   {
      "address": "Full formatted address",
      "coordinates": {
         "latitude": 3.848,
         "longitude": 11.502
      },
      "placeId": "Google Places ID"
   }
   ```

### **Form Validation**

-  Customer selection: Required
-  Items: At least one item required
-  Pickup date: Required
-  Pickup location: Required ✨ NEW
-  Dropoff location: Required ✨ NEW

## User Benefits

### **For Customers**

-  ✅ Convenient pickup from their location
-  ✅ Delivery to their preferred address
-  ✅ No need to return to the pressing shop
-  ✅ Flexible location options (home, office, etc.)

### **For Receptionists**

-  ✅ Complete order information upfront
-  ✅ Clear pickup and delivery instructions
-  ✅ Reduced confusion about locations
-  ✅ Better customer service

### **For Operations**

-  ✅ Efficient route planning for pickup/delivery
-  ✅ Accurate location data for drivers
-  ✅ Improved logistics coordination
-  ✅ Better tracking and customer communication

## Usage Instructions

### **Creating an Order with Locations**

1. **Navigate to New Order** (`/neworder`)
2. **Select Customer** using the search functionality
3. **Add Items** to the order basket
4. **Set Order Details** (pickup date, notes)
5. **Select Pickup Location**:
   -  Use the pickup location search field
   -  Type address or select from suggestions
   -  Confirm the selected location appears in the preview card
6. **Select Dropoff Location**:
   -  Use the dropoff location search field
   -  Type delivery address or select from suggestions
   -  Confirm the selected location appears in the preview card
7. **Review Order Summary** - all location details will be displayed
8. **Submit Order** - button is only enabled when all required fields are complete

### **Location Selection Tips**

-  Type at least 3 characters for search suggestions
-  Select from dropdown suggestions for best accuracy
-  Use "Use Address" button for manual address entry
-  Remove locations using the trash icon if correction needed
-  Both pickup and dropoff locations are required

## Error Handling

-  Missing customer: "Please select a customer"
-  No items: "Please add at least one item"
-  Missing pickup date: "Please select a pickup date"
-  Missing pickup location: "Please select a pickup location"
-  Missing dropoff location: "Please select a dropoff location"

## API Integration

The order creation API endpoint (`POST /api/orders`) now expects:

```json
{
  "customerId": "customer_id",
  "items": [...],
  "pickupDate": "2025-10-10T10:00:00Z",
  "notes": "Special instructions",
  "total": 5000,
  "pickupLocation": {
    "address": "Customer pickup address",
    "coordinates": {"latitude": 3.848, "longitude": 11.502},
    "placeId": "ChIJ..."
  },
  "dropoffLocation": {
    "address": "Customer delivery address",
    "coordinates": {"latitude": 3.850, "longitude": 11.505},
    "placeId": "ChIJ..."
  }
}
```

## Next Steps

This feature enhances the order creation process by ensuring complete location information is captured upfront. Future enhancements could include:

-  Route optimization for pickup/delivery
-  Location history for frequent customers
-  Map preview of pickup/dropoff locations
-  Integration with delivery tracking system
