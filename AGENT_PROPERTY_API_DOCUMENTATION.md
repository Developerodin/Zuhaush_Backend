# Agent Property Management API Documentation

## Overview
This document describes how agents can create and manage properties in the Zuhaush Backend system. Agents have the same property management capabilities as builders, allowing them to create, update, delete, and manage media for properties.

## Authentication
Agents authenticate using the standard User JWT token. The agent's role must be set to `'agent'` in the user profile.

### Authentication Header
```
Authorization: Bearer <agent_jwt_token>
```

### Agent Registration
Agents are registered as regular users with `role: 'agent'` during registration. See the user registration API for details.

---

## Quick Reference

### ✅ Agent Property Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/property` | Create a new property | Yes |
| GET | `/v1/property/agent/:agentId` | Get all properties by agent | No |
| GET | `/v1/property/agent/:agentId/stats` | Get agent property statistics | No |
| PATCH | `/v1/property/:propertyId` | Update a property | Yes (owner only) |
| DELETE | `/v1/property/:propertyId` | Delete a property | Yes (owner only) |
| POST | `/v1/property/:propertyId/media` | Add media to property | Yes (owner only) |
| PATCH | `/v1/property/:propertyId/media/:mediaId` | Update media | Yes (owner only) |
| DELETE | `/v1/property/:propertyId/media/:mediaId` | Remove media | Yes (owner only) |
| POST | `/v1/property/:propertyId/flags` | Add flag to property | Yes |
| DELETE | `/v1/property/:propertyId/flags` | Remove flag from property | Yes |

---

## 1. Create Property

### Endpoint
```
POST /v1/property
```

### Authentication
Requires Agent authentication token in the Authorization header.

### Request Body

#### Required Fields (10 total)
1. `name` - Property name (string, max 200 chars)
2. `type` - Property type: `'apartment'`, `'villa'`, `'plot'`, `'commercial'`, `'office'`, `'shop'`, `'warehouse'`, `'other'`
3. `bhk` - BHK configuration (string, format: "2BHK", "3.5BHK", "1RK", "Studio")
4. `area.value` - Area value (number, min: 0)
5. `area.unit` - Area unit: `'sqft'`, `'sqm'`, `'acre'`, `'hectare'` (default: `'sqft'`)
6. `price.value` - Price value (number, min: 0)
7. `price.unit` - Price unit: `'lakh'`, `'crore'`, `'rupees'` (default: `'lakh'`)
8. `city` - City name (string, max 100 chars)
9. `locality` - Locality/Area name (string, max 200 chars)

**Note:** The `agent` field is automatically set from the authenticated agent's ID. You don't need to include it in the request.

#### Optional Fields
- `geo` - Location coordinates
  - `latitude` (number, -90 to 90)
  - `longitude` (number, -180 to 180)
  - `address` (string, max 500 chars)
- `media[]` - Array of media files (see Media section below)
- `amenities[]` - Array of amenities
  - `category` (optional): `'basic'`, `'lifestyle'`, `'security'`, `'parking'`, `'maintenance'`, `'other'`
  - `name` (required, string, max 100 chars)
  - `description` (optional, string, max 200 chars)
- `description` - Property description (string, max 2000 chars)
- `specifications` - Map of key-value pairs (object)
- `availability` - Availability information
  - `isAvailable` (boolean, default: true)
  - `availableFrom` (date)
  - `possessionDate` (date)
- `contact` - Contact information
  - `phone` (string, phone format)
  - `email` (string, email format)
  - `whatsapp` (string, phone format)
- `seo` - SEO information
  - `title` (string, max 60 chars)
  - `description` (string, max 160 chars)
  - `keywords[]` (array of strings)
- `flags[]` - Array of flags: `'featured'`, `'new_launch'`, `'premium'`, `'best_seller'`, `'limited_offer'`, `'verified'`, `'trending'`
- `status` - Property status: `'draft'`, `'active'`, `'sold'`, `'rented'`, `'inactive'`, `'archived'` (default: `'draft'`)



```json
{
  "name": "Luxury 3BHK Apartment in Downtown",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1500,
    "unit": "sqft"
  },
  "price": {
    "value": 85,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Andheri West",
  "geo": {
    "latitude": 19.1364,
    "longitude": 72.8297,
    "address": "123 Main Street, Andheri West, Mumbai"
  },
  "description": "Beautiful 3BHK apartment with modern amenities",
  "amenities": [
    {
      "category": "basic",
      "name": "Power Backup",
      "description": "24/7 power backup"
    },
    {
      "category": "lifestyle",
      "name": "Swimming Pool",
      "description": "Rooftop swimming pool"
    }
  ],
  "contact": {
    "phone": "+919876543210",
    "email": "agent@example.com",
    "whatsapp": "+919876543210"
  },
  "status": "draft"
}
```

### Example Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "agent": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Agent",
    "email": "agent@example.com",
    "contactNumber": "+919876543210"
  },
  "name": "Luxury 3BHK Apartment in Downtown",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1500,
    "unit": "sqft"
  },
  "price": {
    "value": 85,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Andheri West",
  "status": "draft",
  "adminApproved": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Get Agent's Properties

### Endpoint
```
GET /v1/property/agent/:agentId
```

### Authentication
Not required (public endpoint)

### URL Parameters
- `agentId` - The agent's user ID

### Query Parameters
- `sortBy` - Sort option (default: `'createdAt:desc'`)
- `limit` - Results per page (default: 10, max: 100)
- `page` - Page number (default: 1)

### Example Request
```
GET /v1/property/agent/507f1f77bcf86cd799439012?limit=20&page=1
```

### Example Response

```json
{
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Luxury 3BHK Apartment",
      "type": "apartment",
      "status": "active",
      "adminApproved": true,
      "price": {
        "value": 85,
        "unit": "lakh"
      },
      "city": "Mumbai",
      "locality": "Andheri West"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "totalResults": 100
}
```

---

## 3. Get Agent Property Statistics

### Endpoint
```
GET /v1/property/agent/:agentId/stats
```

### Authentication
Not required (public endpoint)

### URL Parameters
- `agentId` - The agent's user ID

### Example Request
```
GET /v1/property/agent/507f1f77bcf86cd799439012/stats
```

### Example Response

```json
{
  "totalProperties": 50,
  "activeProperties": 35,
  "soldProperties": 10,
  "totalViews": 1250,
  "totalInquiries": 85,
  "avgPrice": 75.5,
  "avgArea": 1450.5
}
```

---

## 4. Update Property

### Endpoint
```
PATCH /v1/property/:propertyId
```

### Authentication
Requires Agent authentication. Only the agent who created the property can update it.

### URL Parameters
- `propertyId` - The property ID

### Request Body
All fields are optional. Only include fields you want to update.

### Example Request

```json
{
  "name": "Updated Property Name",
  "price": {
    "value": 90,
    "unit": "lakh"
  },
  "status": "active"
}
```

### Example Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Updated Property Name",
  "price": {
    "value": 90,
    "unit": "lakh"
  },
  "status": "active",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Error Response (403 Forbidden)
If you try to update a property you don't own:
```json
{
  "code": 403,
  "message": "You can only update your own properties"
}
```

---

## 5. Delete Property

### Endpoint
```
DELETE /v1/property/:propertyId
```

### Authentication
Requires Agent authentication. Only the agent who created the property can delete it.

### URL Parameters
- `propertyId` - The property ID

### Example Request
```
DELETE /v1/property/507f1f77bcf86cd799439011
```

### Response
- Status: `204 No Content` (success)
- Status: `403 Forbidden` (if not the owner)
- Status: `404 Not Found` (if property doesn't exist)

---

## 6. Add Media to Property

### Endpoint
```
POST /v1/property/:propertyId/media
```

### Authentication
Requires Agent authentication. Only the agent who created the property can add media.

### URL Parameters
- `propertyId` - The property ID

### Request
- **Content-Type:** `multipart/form-data`
- **File:** Upload file using form field `file`
- **Body Fields:**
  - `type` (required): `'image'`, `'video'`, `'document'`, `'floor_plan'`, `'brochure'`
  - `caption` (optional): Media caption
  - `isPrimary` (optional, boolean): Set as primary media

### Example Request (cURL)

```bash
curl -X POST \
  https://api.example.com/v1/property/507f1f77bcf86cd799439011/media \
  -H "Authorization: Bearer YOUR_AGENT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image" \
  -F "caption=Living room view" \
  -F "isPrimary=true"
```

### Example Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "media": [
    {
      "id": "507f1f77bcf86cd799439013",
      "type": "image",
      "url": "https://s3.amazonaws.com/bucket/image.jpg",
      "caption": "Living room view",
      "isPrimary": true,
      "uploadedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## 7. Update Media

### Endpoint
```
PATCH /v1/property/:propertyId/media/:mediaId
```

### Authentication
Requires Agent authentication. Only the agent who created the property can update media.

### URL Parameters
- `propertyId` - The property ID
- `mediaId` - The media ID

### Request Body
- `caption` (optional): Update caption
- `isPrimary` (optional, boolean): Set as primary media

### Example Request

```json
{
  "caption": "Updated caption",
  "isPrimary": false
}
```

---

## 8. Remove Media

### Endpoint
```
DELETE /v1/property/:propertyId/media/:mediaId
```

### Authentication
Requires Agent authentication. Only the agent who created the property can remove media.

### URL Parameters
- `propertyId` - The property ID
- `mediaId` - The media ID

### Response
- Status: `200 OK` with updated property object
- Status: `403 Forbidden` (if not the owner)
- Status: `404 Not Found` (if property or media doesn't exist)

---

## 9. Add Flag to Property

### Endpoint
```
POST /v1/property/:propertyId/flags
```

### Authentication
Requires authentication

### URL Parameters
- `propertyId` - The property ID

### Request Body

```json
{
  "flag": "featured"
}
```

### Available Flags
- `'featured'` - Featured property
- `'new_launch'` - New launch property
- `'premium'` - Premium property
- `'best_seller'` - Best seller
- `'limited_offer'` - Limited offer
- `'verified'` - Verified property
- `'trending'` - Trending property

---

## 10. Remove Flag from Property

### Endpoint
```
DELETE /v1/property/:propertyId/flags
```

### Authentication
Requires authentication

### URL Parameters
- `propertyId` - The property ID

### Request Body

```json
{
  "flag": "featured"
}
```

---

## Property Status Flow

1. **Draft** (default) - Property is created but not yet published
2. **Active** - Property is live and visible to users
3. **Sold** - Property has been sold
4. **Rented** - Property has been rented
5. **Inactive** - Property is temporarily hidden
6. **Archived** - Property is archived

**Note:** Properties require admin approval (`adminApproved: true`) before they appear in public searches, even if status is `'active'`.

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not authorized to perform this action |
| 404 | Not Found - Property or resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Best Practices

1. **Always set status to 'draft' initially** - Review your property before setting it to 'active'
2. **Add at least one primary image** - Properties with images get more views
3. **Use descriptive names** - Help users find your properties easily
4. **Include accurate location data** - Geo coordinates help with map features
5. **Keep contact information updated** - Ensure users can reach you
6. **Use appropriate flags** - Only use flags that accurately describe your property
7. **Regular updates** - Keep property information current

---

## Notes

- The `agent` field is automatically set from the authenticated agent's ID when creating a property
- You cannot change the `agent` field after property creation
- Properties created by agents work exactly like builder properties
- All property management features available to builders are also available to agents
- Agent properties appear in the same search results as builder properties
- Admin approval is required for properties to appear in public searches

---

## Support

For issues or questions, please contact the API support team.

