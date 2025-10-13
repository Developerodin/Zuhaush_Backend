# Property Creation API Documentation

## Overview
This document describes how to create a property in the Zuhaush Backend system. It outlines all available fields, their types, and whether they are required or optional.

## Endpoint
```
POST /v1/property
```

## Authentication
Requires Builder authentication token in the Authorization header:
```
Authorization: Bearer <builder_token>
```

## Quick Reference Summary

### ✅ Required Fields (10 total)
1. `builder` - Builder ID reference
2. `name` - Property name
3. `type` - Property type (apartment, villa, plot, etc.)
4. `bhk` - BHK configuration (e.g., "3BHK", "Studio")
5. `area.value` - Area value (number)
6. `area.unit` - Area unit (sqft, sqm, acre, hectare)
7. `price.value` - Price value (number)
8. `price.unit` - Price unit (lakh, crore, rupees)
9. `city` - City name
10. `locality` - Locality/Area name

### 📋 Optional Fields (can be omitted)
- **Location**: `geo` (latitude, longitude, address)
- **Media**: `media[]` array (images, videos, documents, floor plans, brochures)
- **Amenities**: `amenities[]` array (only `name` required within each amenity)
- **Status**: `status` (draft, active, sold, rented, inactive, archived)
- **Admin**: `adminApproved`, `approvedBy`
- **SEO**: `seo` (title, description, keywords, slug)
- **Flags**: `flags[]` (featured, new_launch, premium, etc.)
- **Quality**: `qualityScore` (0-100)
- **Details**: `description`, `specifications`
- **Availability**: `availability` (isAvailable, availableFrom, possessionDate)
- **Contact**: `contact` (phone, email, whatsapp)

---

## Request Body Structure

### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `builder` | ObjectId | Reference to Builder | Must be a valid Builder ID |
| `name` | String | Property name | Required, trimmed |
| `type` | String | Property type | Must be one of: `apartment`, `villa`, `plot`, `commercial`, `office`, `shop`, `warehouse`, `other` |
| `bhk` | String | BHK configuration | Format: "2BHK", "3.5BHK", "1RK", "Studio" |
| `area.value` | Number | Area value | Must be >= 0 |
| `area.unit` | String | Area unit | Must be one of: `sqft`, `sqm`, `acre`, `hectare` (default: `sqft`) |
| `price.value` | Number | Price value | Must be >= 0 |
| `price.unit` | String | Price unit | Must be one of: `lakh`, `crore`, `rupees` (default: `lakh`) |
| `city` | String | City name | Required, trimmed |
| `locality` | String | Locality/Area name | Required, trimmed |

### Optional Fields

#### Location (geo)
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `geo.latitude` | Number | Latitude coordinate | Range: -90 to 90 |
| `geo.longitude` | Number | Longitude coordinate | Range: -180 to 180 |
| `geo.address` | String | Full address | Trimmed |

#### Media (Array)
Each media object can contain:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `media[].type` | String | Media type | **Required**. One of: `image`, `video`, `document`, `floor_plan`, `brochure` |
| `media[].url` | String | Media URL | **Required**, trimmed |
| `media[].urlKey` | String | S3 URL key | Optional, trimmed |
| `media[].caption` | String | Media caption | Optional, trimmed |
| `media[].isPrimary` | Boolean | Primary media flag | Default: false |
| `media[].uploadedAt` | Date | Upload timestamp | Auto-generated |

#### Amenities (Array)
Each amenity object can contain:
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `amenities[].name` | String | Amenity name | **Required**, trimmed |
| `amenities[].category` | String | Amenity category | Optional. One of: `basic`, `lifestyle`, `security`, `parking`, `maintenance`, `other` |
| `amenities[].description` | String | Amenity description | Optional, trimmed |

#### Property Status
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `status` | String | Property status | One of: `draft`, `active`, `sold`, `rented`, `inactive`, `archived` (default: `draft`) |

#### Admin Approval
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `adminApproved` | Boolean | Admin approval status | Default: false |
| `approvedBy` | ObjectId | Admin who approved | Reference to Admin |

#### SEO Information
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `seo.title` | String | SEO title | Max length: 60 characters |
| `seo.description` | String | SEO description | Max length: 160 characters |
| `seo.keywords` | Array[String] | SEO keywords | Array of strings |
| `seo.slug` | String | URL slug | Unique, lowercase, auto-generated if not provided |

#### Property Flags (Array)
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `flags` | Array[String] | Property flags | One or more of: `featured`, `new_launch`, `premium`, `best_seller`, `limited_offer`, `verified`, `trending` |

#### Quality Score
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `qualityScore` | Number | Property quality score | Range: 0-100 (default: 0) |

#### Additional Details
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `description` | String | Property description | Optional, trimmed |
| `specifications` | Map | Additional specifications | Key-value pairs |

#### Availability
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `availability.isAvailable` | Boolean | Availability status | Default: true |
| `availability.availableFrom` | Date | Available from date | ISO date format |
| `availability.possessionDate` | Date | Possession date | ISO date format |

#### Contact Information
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `contact.phone` | String | Contact phone | Trimmed |
| `contact.email` | String | Contact email | Trimmed, lowercase |
| `contact.whatsapp` | String | WhatsApp number | Trimmed |

#### Tracking (Auto-managed)
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `views` | Number | View count | 0 |
| `likes` | Number | Like count | 0 |
| `inquiries` | Number | Inquiry count | 0 |

## Example Request

### Minimal Required Request
```json
{
  "builder": "507f1f77bcf86cd799439011",
  "name": "Sunrise Apartments",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1500,
    "unit": "sqft"
  },
  "price": {
    "value": 75,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Andheri West"
}
```

### Complete Request with All Optional Fields (Annotated)
```json
{
  // ============================================
  // REQUIRED FIELDS (Must be provided)
  // ============================================
  
  "builder": "507f1f77bcf86cd799439011",        // REQUIRED: Builder ID
  "name": "Sunrise Luxury Apartments",          // REQUIRED: Property name
  "type": "apartment",                          // REQUIRED: Property type
  "bhk": "3BHK",                                // REQUIRED: BHK configuration
  
  "area": {                                     // REQUIRED: Area object
    "value": 1500,                              // REQUIRED: Area value
    "unit": "sqft"                              // REQUIRED: Area unit (default: sqft)
  },
  
  "price": {                                    // REQUIRED: Price object
    "value": 75,                                // REQUIRED: Price value
    "unit": "lakh"                              // REQUIRED: Price unit (default: lakh)
  },
  
  "city": "Mumbai",                             // REQUIRED: City name
  "locality": "Andheri West",                   // REQUIRED: Locality name
  
  
  // ============================================
  // OPTIONAL FIELDS (Can be omitted)
  // ============================================
  
  "geo": {                                      // OPTIONAL: Geographic coordinates
    "latitude": 19.1136,                        // OPTIONAL: Latitude
    "longitude": 72.8697,                       // OPTIONAL: Longitude
    "address": "123 Main Street, Andheri West, Mumbai, Maharashtra 400053"  // OPTIONAL: Full address
  },
  
  "media": [                                    // OPTIONAL: Media array
    {
      "type": "image",                          // REQUIRED (if media provided): Media type
      "url": "https://example.com/images/property1.jpg",  // REQUIRED (if media provided): Media URL
      "urlKey": "properties/property1.jpg",     // OPTIONAL: S3 URL key
      "caption": "Living Room",                 // OPTIONAL: Media caption
      "isPrimary": true                         // OPTIONAL: Primary flag (default: false)
    },
    {
      "type": "floor_plan",
      "url": "https://example.com/floorplans/property1.pdf",
      "urlKey": "properties/floorplan1.pdf",
      "caption": "3BHK Floor Plan"
    }
  ],
  
  "amenities": [                                // OPTIONAL: Amenities array
    {
      "name": "Swimming Pool",                  // REQUIRED (if amenity provided): Amenity name
      "category": "lifestyle",                  // OPTIONAL: Amenity category
      "description": "Olympic size swimming pool"  // OPTIONAL: Amenity description
    },
    {
      "name": "Gym"                             // Only name is required, others optional
    },
    {
      "name": "24/7 Security",
      "category": "security"
    }
  ],
  
  "status": "active",                           // OPTIONAL: Property status (default: draft)
  
  "seo": {                                      // OPTIONAL: SEO information
    "title": "3BHK Luxury Apartments in Andheri West",           // OPTIONAL: SEO title (max 60 chars)
    "description": "Premium 3BHK apartments with modern amenities in the heart of Andheri West, Mumbai",  // OPTIONAL: SEO description (max 160 chars)
    "keywords": ["3bhk", "apartment", "andheri", "mumbai", "luxury"],  // OPTIONAL: SEO keywords array
    "slug": "sunrise-luxury-apartments-andheri-west"              // OPTIONAL: URL slug (auto-generated if not provided)
  },
  
  "flags": ["featured", "premium", "new_launch"],  // OPTIONAL: Property flags
  
  "description": "Experience luxury living at its finest with our 3BHK apartments featuring modern architecture, premium fittings, and world-class amenities.",  // OPTIONAL: Property description
  
  "specifications": {                           // OPTIONAL: Custom specifications (key-value pairs)
    "flooring": "Vitrified tiles",
    "kitchen": "Modular kitchen with granite countertop",
    "bathroom": "Premium bathroom fittings",
    "parking": "2 covered parking spaces",
    "balcony": "2 balconies with scenic view"
  },
  
  "availability": {                             // OPTIONAL: Availability information
    "isAvailable": true,                        // OPTIONAL: Availability status (default: true)
    "availableFrom": "2024-06-01T00:00:00.000Z",  // OPTIONAL: Available from date
    "possessionDate": "2024-12-31T00:00:00.000Z"  // OPTIONAL: Possession date
  },
  
  "contact": {                                  // OPTIONAL: Contact information
    "phone": "+919876543210",                   // OPTIONAL: Contact phone
    "email": "sales@sunriseapartments.com",     // OPTIONAL: Contact email
    "whatsapp": "+919876543210"                 // OPTIONAL: WhatsApp number
  },
  
  "qualityScore": 85                            // OPTIONAL: Quality score (0-100, default: 0)
}
```

**Note**: Comments are for documentation purposes only. Remove them when making actual API requests as JSON doesn't support comments.

## Response

### Success Response (201 Created)
```json
{
  "id": "507f191e810c19729de860ea",
  "builder": "507f1f77bcf86cd799439011",
  "name": "Sunrise Luxury Apartments",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1500,
    "unit": "sqft"
  },
  "price": {
    "value": 75,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Andheri West",
  "status": "active",
  "adminApproved": false,
  "views": 0,
  "likes": 0,
  "inquiries": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  // ... other fields
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "code": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "bhk",
      "message": "Invalid BHK format. Use format like \"2BHK\", \"3.5BHK\", \"1RK\", \"Studio\""
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

## Important Notes

1. **Slug Auto-generation**: If `seo.slug` is not provided, it will be automatically generated from the property name.

2. **Amenities**: Only the `name` field is required for amenities. The `category` and `description` fields are optional.

3. **Media Array**: When adding media, both `type` and `url` are required for each media object.

4. **Admin Approval**: New properties will have `adminApproved` set to `false` by default and require admin approval before being publicly visible.

5. **Status**: Properties are created with `draft` status by default. Change to `active` to make them visible to users.

6. **Tracking Fields**: `views`, `likes`, and `inquiries` are automatically managed by the system and should not be manually set.

7. **Timestamps**: `createdAt` and `updatedAt` are automatically managed by MongoDB.

## Validation Rules

### BHK Format
- Valid formats: "2BHK", "3.5BHK", "1RK", "Studio"
- Case insensitive
- Must match pattern: `^\d+\.?\d*\s*(BHK|RK|Studio)$/i`

### Coordinates
- Latitude: -90 to 90
- Longitude: -180 to 180

### SEO
- Title: Maximum 60 characters
- Description: Maximum 160 characters
- Slug: Must be unique across all properties

### Numeric Fields
- All numeric fields (area, price, quality score) must be non-negative
- Quality score: 0-100 range

## Best Practices

1. **Always provide media**: Properties with images get better engagement
2. **Set at least one primary image**: Mark one image with `isPrimary: true`
3. **Use descriptive amenities**: Clear amenity names help users understand property features
4. **Add SEO information**: Improves property discoverability
5. **Include contact details**: Makes it easier for potential buyers to reach out
6. **Add specifications**: Detailed specifications build trust and reduce inquiries
7. **Set realistic availability dates**: Helps users plan their property search

## Need Help?

For additional support or questions, please refer to the main API documentation or contact the development team.

