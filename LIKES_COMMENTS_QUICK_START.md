# Likes and Comments - Quick Start Guide

## ✅ What's Been Implemented

### 1. **Property Likes** 
- Users can like/unlike properties
- Automatic like count tracking
- Toggle functionality (one click to like, another to unlike)
- Check like status for any property

### 2. **Property Comments**
- Users can comment on properties
- Users can edit their own comments
- Users can delete their own comments
- Builders can see all comments on their properties
- Automatic timestamp tracking with "edited" indicator

---

## 📋 API Endpoints

### Likes
```
POST   /api/v1/properties/:propertyId/like          - Toggle like/unlike (Auth required)
GET    /api/v1/properties/:propertyId/like/status   - Check like status (Auth required)
GET    /api/v1/properties/:propertyId/likes         - Get all likes (Public)
```

### Comments
```
POST   /api/v1/properties/:propertyId/comments      - Create comment (Auth required)
GET    /api/v1/properties/:propertyId/comments      - Get all comments (Public)
PATCH  /api/v1/comments/:commentId                  - Update comment (Auth required, owner only)
DELETE /api/v1/comments/:commentId                  - Delete comment (Auth required, owner only)
GET    /api/v1/builder/comments                     - Get all comments on builder's properties (Auth required)
```

---

## 🚀 How to Use

### Like a Property
```bash
# Like/Unlike a property
curl -X POST http://localhost:3000/api/v1/properties/PROPERTY_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response when liked:
{
  "liked": true,
  "message": "Property liked successfully",
  "likeCount": 15
}

# Response when unliked:
{
  "liked": false,
  "message": "Property unliked successfully",
  "likeCount": 14
}
```

### Check Like Status
```bash
curl -X GET http://localhost:3000/api/v1/properties/PROPERTY_ID/like/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "liked": true,
  "likeCount": 15
}
```

### Add a Comment
```bash
curl -X POST http://localhost:3000/api/v1/properties/PROPERTY_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a great property!"}'

# Response:
{
  "id": "comment123",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "property": "property123",
  "text": "This is a great property!",
  "status": "active",
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### Get Property Comments
```bash
# Get comments with pagination
curl -X GET "http://localhost:3000/api/v1/properties/PROPERTY_ID/comments?page=1&limit=10"

# Response:
{
  "results": [...],
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "totalResults": 25
}
```

### Builder: View All Comments on Your Properties
```bash
curl -X GET http://localhost:3000/api/v1/builder/comments \
  -H "Authorization: Bearer BUILDER_TOKEN"

# Response shows all comments on all properties owned by the builder
{
  "results": [
    {
      "id": "comment123",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "property": {
        "id": "property123",
        "name": "Luxury Apartment"
      },
      "text": "Interested in this property!",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## 🗂️ Database Models

### Like Model
- `property` - Reference to Property
- `user` - Reference to User
- `type` - 'like' or 'dislike'
- `status` - 'active', 'inactive', or 'flagged'
- Unique constraint: One like per user per property

### Comment Model
- `property` - Reference to Property
- `user` - Reference to User
- `text` - Comment text (max 1000 chars)
- `status` - 'active', 'inactive', 'flagged', or 'deleted'
- `metadata.isEdited` - Boolean flag
- `metadata.editedAt` - Timestamp of edit

### Property Model (Updated)
- Added `likes` field (Number, default: 0)
- Automatically incremented/decremented on like/unlike

---

## 🔒 Security Features

1. **Authentication Required:**
   - Like/unlike operations
   - Creating, editing, deleting comments
   - Viewing builder's comments

2. **Authorization:**
   - Users can only edit/delete their own comments
   - Builders see comments only on their properties

3. **Validation:**
   - Comment text: max 1000 characters
   - Property IDs validated
   - User ownership checked before edit/delete

---

## 📝 Notes

- **Soft Delete:** Comments are soft-deleted (status = 'deleted'), not permanently removed
- **Like Count:** Automatically synced with Property model
- **Edit Tracking:** Comments marked as edited with timestamp
- **Pagination:** All list endpoints support pagination (default: 10 items/page)
- **Public Access:** Anyone can view likes and comments (no auth needed)

---

## 🎯 Frontend Integration Tips

### React Example - Like Button
```javascript
const LikeButton = ({ propertyId }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const toggleLike = async () => {
    const res = await fetch(`/api/v1/properties/${propertyId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.likeCount);
  };

  return (
    <button onClick={toggleLike}>
      {liked ? '❤️' : '🤍'} {likeCount}
    </button>
  );
};
```

### React Example - Comments Section
```javascript
const CommentSection = ({ propertyId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    const res = await fetch(`/api/v1/properties/${propertyId}/comments`);
    const data = await res.json();
    setComments(data.results);
  };

  const addComment = async () => {
    await fetch(`/api/v1/properties/${propertyId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: newComment })
    });
    setNewComment('');
    loadComments();
  };

  return (
    <div>
      <textarea 
        value={newComment} 
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
      />
      <button onClick={addComment}>Post</button>
      
      {comments.map(comment => (
        <div key={comment.id}>
          <strong>{comment.user.name}</strong>
          <p>{comment.text}</p>
          {comment.metadata.isEdited && <small>(edited)</small>}
        </div>
      ))}
    </div>
  );
};
```

---

## 📚 Full Documentation

For complete API documentation, see [LIKES_COMMENTS_API.md](LIKES_COMMENTS_API.md)

