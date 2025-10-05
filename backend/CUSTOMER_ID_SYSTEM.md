# Customer ID System Implementation

This document describes the implementation of the customer unique ID system using PL prefixes (PL1, PL2, PL3, etc.).

## Overview

The system automatically assigns sequential customer IDs to all customers in the format `PLX` where X is an incrementing number starting from 1.

## Features

-  **Automatic ID Generation**: New customers automatically receive the next available PL ID
-  **Sequential Numbering**: IDs are assigned in order of customer creation
-  **Unique Constraints**: Each customer ID is unique across the system
-  **Backward Compatibility**: Existing customers can be migrated to have PL IDs
-  **Database Consistency**: Uses atomic operations to ensure no duplicate IDs

## Implementation Details

### Database Changes

1. **User Model**: Added `customerId` field

   -  Type: String
   -  Unique: true (sparse index for customers only)
   -  Format: "PL{number}"

2. **Counter Model**: New collection to track ID sequences
   -  Stores the current counter value for customer IDs
   -  Uses atomic operations to prevent race conditions

### Backend Changes

1. **Customer ID Generator** (`utils/customerIdGenerator.js`)

   -  Generates next available customer ID
   -  Manages counter initialization

2. **User Model Hooks**

   -  Pre-save hook automatically assigns customer IDs to new customers
   -  Only applies to users with role 'customer'

3. **API Updates**
   -  All auth endpoints now include `customerId` in responses
   -  Customer listing endpoints include customer IDs

### Migration

The system includes migration scripts to assign PL IDs to existing customers:

```bash
# Run the migration
npm run migrate:customer-ids

# Test customer ID generation
npm run test:customer-ids
```

## Usage

### Running the Migration

1. **Backup your database** before running the migration
2. Navigate to the backend directory
3. Run the migration:
   ```bash
   cd backend
   npm run migrate:customer-ids
   ```
4. Verify the results using the verification output

### Testing

Test the customer ID system:

```bash
npm run test:customer-ids
```

### Manual Counter Initialization

If you need to set a specific starting point (e.g., starting from PL23):

```javascript
const { initializeCustomerCounter } = require('./utils/customerIdGenerator');
await initializeCustomerCounter(23); // Next customer will be PL24
```

## Frontend Integration

The frontend auth store has been updated to handle customer IDs:

```typescript
interface User {
   _id: string;
   customerId?: string; // New field
   name: string;
   email: string;
   phone: string;
   role: string;
}
```

## API Response Examples

### Registration Response

```json
{
   "_id": "...",
   "customerId": "PL24",
   "name": "John Doe",
   "email": "john@example.com",
   "phone": "+237123456789",
   "role": "customer",
   "token": "..."
}
```

### Customer List Response

```json
{
   "success": true,
   "count": 2,
   "data": [
      {
         "_id": "...",
         "customerId": "PL1",
         "name": "Customer One",
         "email": "customer1@example.com",
         "role": "customer"
      },
      {
         "_id": "...",
         "customerId": "PL2",
         "name": "Customer Two",
         "email": "customer2@example.com",
         "role": "customer"
      }
   ]
}
```

## Troubleshooting

### Common Issues

1. **Counter not initialized**: Run `npm run migrate:customer-ids` to initialize
2. **Duplicate IDs**: Check for concurrent customer creation; the system uses atomic operations to prevent this
3. **Missing customer IDs**: Existing customers need migration; run the migration script

### Verification

Check migration status:

```bash
# Connect to MongoDB
use your_database_name

# Check counter
db.counters.findOne({name: "customerId"})

# Check customers with IDs
db.users.find({role: "customer", customerId: {$exists: true}}).count()

# Check customers without IDs
db.users.find({role: "customer", customerId: {$exists: false}}).count()
```

## Next Steps

1. **Run the migration** on your production database
2. **Update frontend displays** to show customer IDs where appropriate
3. **Update reports and exports** to include customer IDs
4. **Consider adding search functionality** by customer ID in the receptionist interface
5. **Update any existing integrations** to handle the new customer ID field

## Security Considerations

-  Customer IDs are not sensitive information but are unique identifiers
-  The sequential nature makes them predictable, which is acceptable for this use case
-  Consider rate limiting customer registration if ID enumeration is a concern
