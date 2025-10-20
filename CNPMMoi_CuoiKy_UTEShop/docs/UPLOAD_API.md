# 📤 Upload API Documentation - UTEShop

## Tổng Quan

API Upload cho phép admin upload ảnh sản phẩm lên server. Hỗ trợ upload single và multiple images.

### Yêu Cầu
- **Authentication**: Bearer Token (JWT)
- **Authorization**: User phải có `is_admin = TRUE`
- **Content-Type**: `multipart/form-data`
- **Max File Size**: 5MB per file
- **Allowed Types**: JPEG, JPG, PNG, GIF, WEBP
- **Max Files**: 5 images per request (for multiple upload)

---

## 📤 Upload Single Image

**Endpoint:** `POST /api/upload/single`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file): Image file to upload

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

**Example using JavaScript (Fetch):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/api/upload/single', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response (Success - 200):**
```json
{
    "success": true,
    "data": {
        "image_url": "/images/iphone16pro-1729432156789-123456789.jpg",
        "filename": "iphone16pro-1729432156789-123456789.jpg",
        "size": 245632,
        "mimetype": "image/jpeg"
    },
    "message": "Upload ảnh thành công",
    "timestamp": "2025-10-20T14:30:00.000Z"
}
```

---

## 📤 Upload Multiple Images

**Endpoint:** `POST /api/upload/multiple`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` (files): Multiple image files (max 5)

**Example using JavaScript:**
```javascript
const formData = new FormData();
// Add multiple files
for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('images', fileInput.files[i]);
}

fetch('http://localhost:3000/api/upload/multiple', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response (Success - 200):**
```json
{
    "success": true,
    "data": {
        "images": [
            {
                "image_url": "/images/product1-1729432156789-123456789.jpg",
                "filename": "product1-1729432156789-123456789.jpg",
                "size": 245632,
                "mimetype": "image/jpeg"
            },
            {
                "image_url": "/images/product2-1729432156790-987654321.jpg",
                "filename": "product2-1729432156790-987654321.jpg",
                "size": 189456,
                "mimetype": "image/png"
            }
        ],
        "count": 2
    },
    "message": "Upload 2 ảnh thành công",
    "timestamp": "2025-10-20T14:30:00.000Z"
}
```

---

## 🗑️ Delete Image

**Endpoint:** `DELETE /api/upload/:filename`

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Example:**
```bash
DELETE /api/upload/iphone16pro-1729432156789-123456789.jpg
```

**Response (Success - 200):**
```json
{
    "success": true,
    "data": null,
    "message": "Xóa ảnh thành công",
    "timestamp": "2025-10-20T14:30:00.000Z"
}
```

---

## 📋 Workflow Tạo Sản Phẩm Với Upload

### Step 1: Upload ảnh chính
```javascript
// 1. Upload main image
const mainImageFormData = new FormData();
mainImageFormData.append('image', mainImageFile);

const mainImageResponse = await fetch('/api/upload/single', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: mainImageFormData
});
const mainImageData = await mainImageResponse.json();
const mainImageUrl = mainImageData.data.image_url;
```

### Step 2: Upload ảnh phụ (gallery)
```javascript
// 2. Upload gallery images
const galleryFormData = new FormData();
galleryFiles.forEach(file => {
    galleryFormData.append('images', file);
});

const galleryResponse = await fetch('/api/upload/multiple', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: galleryFormData
});
const galleryData = await galleryResponse.json();
const galleryUrls = galleryData.data.images.map(img => img.image_url);
```

### Step 3: Tạo sản phẩm với URLs đã upload
```javascript
// 3. Create product with uploaded image URLs
const productData = {
    name: "iPhone 16 Pro Max",
    description: "Latest iPhone with A18 chip",
    price: 1299.99,
    sale_price: 1199.99,
    stock_quantity: 100,
    category_id: 1,
    image_url: mainImageUrl,  // from step 1
    images: galleryUrls,       // from step 2
    specifications: {
        screen: "6.7 inch",
        chip: "A18 Pro",
        camera: "48MP"
    },
    is_featured: true
};

const productResponse = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
});
```

---

## 🖼️ Accessing Uploaded Images

Uploaded images can be accessed via:
```
http://localhost:3000/images/filename.jpg
```

Example:
```html
<img src="http://localhost:3000/images/iphone16pro-1729432156789-123456789.jpg" alt="Product">
```

---

## ⚠️ Error Responses

### File Too Large (400)
```json
{
    "success": false,
    "message": "File quá lớn. Kích thước tối đa là 5MB"
}
```

### Too Many Files (400)
```json
{
    "success": false,
    "message": "Số lượng file vượt quá giới hạn (tối đa 5 ảnh)"
}
```

### Invalid File Type (400)
```json
{
    "success": false,
    "message": "Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"
}
```

### No File Uploaded (400)
```json
{
    "success": false,
    "message": "Không có file nào được upload"
}
```

### Unauthorized (401)
```json
{
    "success": false,
    "message": "Token không được cung cấp"
}
```

### Not Admin (403)
```json
{
    "success": false,
    "message": "Chỉ admin mới có thể truy cập chức năng này"
}
```

---

## 🎨 Frontend Example (React)

```jsx
import { useState } from 'react';

function ProductUploadForm() {
    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleMainImageChange = (e) => {
        setMainImage(e.target.files[0]);
    };

    const handleGalleryImagesChange = (e) => {
        setGalleryImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // 1. Upload main image
            const mainFormData = new FormData();
            mainFormData.append('image', mainImage);
            
            const mainRes = await fetch('/api/upload/single', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: mainFormData
            });
            const mainData = await mainRes.json();

            // 2. Upload gallery images
            const galleryFormData = new FormData();
            galleryImages.forEach(file => {
                galleryFormData.append('images', file);
            });

            const galleryRes = await fetch('/api/upload/multiple', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: galleryFormData
            });
            const galleryData = await galleryRes.json();

            // 3. Create product
            const productData = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value),
                stock_quantity: parseInt(document.getElementById('stock').value),
                category_id: parseInt(document.getElementById('category').value),
                image_url: mainData.data.image_url,
                images: galleryData.data.images.map(img => img.image_url)
            };

            const productRes = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            alert('Tạo sản phẩm thành công!');
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Ảnh chính:</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleMainImageChange}
                    required 
                />
            </div>
            
            <div>
                <label>Ảnh phụ (tối đa 5):</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleGalleryImagesChange}
                    max="5"
                />
            </div>

            {/* Other form fields... */}

            <button type="submit" disabled={uploading}>
                {uploading ? 'Đang upload...' : 'Tạo sản phẩm'}
            </button>
        </form>
    );
}
```

---

## 📝 Notes

1. **File Naming**: Files are automatically renamed with timestamp and random string to prevent conflicts
2. **Storage Location**: Files are stored in `/images` directory
3. **Security**: Only admin users can upload/delete images
4. **Validation**: Server validates file type, size, and count
5. **Static Serving**: Images are served as static files via `/images` route

---

## 🚀 Quick Test

### Using Postman:
1. Create new POST request to `http://localhost:3000/api/upload/single`
2. Add Authorization header: `Bearer YOUR_TOKEN`
3. Go to Body tab → form-data
4. Add key `image` with type `File`
5. Select your image file
6. Send request

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```
