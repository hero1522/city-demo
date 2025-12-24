# CityFashionWear - Quick Setup Guide

## 🎉 What's New!

Your website has been **completely redesigned** for a simpler, happier shopping experience!

### ✨ Key Features

- **🎨 Vibrant, Happy Design** - Coral red, turquoise, and yellow colors
- **👨👩👧👦 Three Simple Categories** - Men, Ladies, Children
- **🛒 Working Shopping Cart** - Add items, view cart, track total
- **📱 Mobile Responsive** - Works perfectly on all devices
- **🔍 Search Function** - Find products quickly
- **💫 Smooth Animations** - Delightful user experience

---

## 🚀 Quick Start

### Open the Website

Simply double-click `index.html` or open it in your browser!

The website will load with 23 sample products across all categories.

---

## 📸 Adding Your Google Drive Images

### Step 1: Organize Your Products in Google Drive

Create folders for your products:
```
My Drive/CityFashionWear/
├── Men/
├── Ladies/
└── Children/
```

### Step 2: Upload Images & Make Public

1. Upload your product photos to the appropriate folders
2. Select all images
3. Right-click → Share → Get link
4. Change to "Anyone with the link can **view**"

### Step 3: Get Direct Image URLs

**Original Google Drive link:**
```
https://drive.google.com/file/d/1ABC123XYZ456/view?usp=sharing
```

**Convert to direct URL (use this format):**
```
https://drive.google.com/uc?export=view&id=1ABC123XYZ456
```

Extract the FILE_ID (between `/d/` and `/view`) and use:
```
https://drive.google.com/uc?export=view&id=YOUR_FILE_ID
```

### Step 4: Update config.js

Open `config.js` and update the products:

```javascript
{
    id: 'm001',
    name: 'Your Product Name',
    category: 'men',  // men, ladies, or children
    price: 29.99,
    image: 'https://drive.google.com/uc?export=view&id=YOUR_FILE_ID',
    badge: 'New',  // Optional: 'New', 'Sale', 'Popular', etc.
    description: 'Your product description here'
}
```

---

## 🎯 Categories

- **men** - Men's clothing (shirts, pants, jackets, etc.)
- **ladies** - Ladies' clothing (dresses, blouses, skirts, etc.)
- **children** - Children's clothing (ages 0-12)

---

## 🛍️ Shopping Cart Features

### How It Works

1. **Add to Cart** - Click "Add to Cart" on any product
2. **View Cart** - Click the cart icon in header
3. **See Total** - Cart calculates total price automatically
4. **Remove Items** - Click trash icon to remove items
5. **Persistent** - Cart saves even if you close the browser!

The cart uses `localStorage` to save items between sessions.

---

## 🎨 Color Scheme

Your website uses a happy, vibrant color palette:

- **Primary (Coral Red)**: #ff6b6b - Main buttons and accents
- **Secondary (Turquoise)**: #4ecdc4 - Highlights
- **Accent (Yellow)**: #ffd93d - Special elements
- **Purple**: #a29bfe - Additional accent
- **Green**: #6bcf7f - Success states

### Want to Change Colors?

Edit `styles.css` (lines 8-18) to customize colors:

```css
:root {
    --primary-color: #ff6b6b;  /* Change this! */
    --secondary-color: #4ecdc4;
    --accent-yellow: #ffd93d;
    /* ... more colors */
}
```

---

## 📱 Website Sections

### 1. Header
- Logo
- Navigation (Home, Shop, About, Contact)
- Search button
- Shopping cart with item count

### 2. Hero Section
- Welcome message with wave emoji 👋
- Call-to-action button
- Feature badges (Free Delivery, Best Prices, Quality)

### 3. Shop Section
- Search bar (click search icon to show)
- Category tabs (All, Men, Ladies, Children)
- Product grid with cards
- Each product shows:
  - Image
  - Category
  - Name
  - Price
  - Add to Cart button

### 4. About Section
- Why choose us
- 4 benefit cards with emojis

### 5. Footer
- Company info
- Quick links
- Shop categories
- Contact details
- Social media links

---

## 🔧 Customization Tips

### Add More Products

Copy this template in `config.js`:

```javascript
{
    id: 'unique_id',  // e.g., 'm007', 'l008', 'c009'
    name: 'Product Name',
    category: 'men',  // or 'ladies', 'children'
    price: 39.99,
    image: 'https://drive.google.com/uc?export=view&id=YOUR_FILE_ID',
    badge: 'New',  // Optional
    description: 'Description text'
}
```

### Update Contact Info

Edit `index.html` around line 240-250 to update:
- Address
- Phone number
- Email
- Social media links

### Change Font

Current font: **Poppins** (friendly, modern, readable)

To change, update line 11 in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

And line 36 in `styles.css`:
```css
--font-family: 'YOUR_FONT', sans-serif;
```

---

## 🌐 Deployment

### Option 1: GitHub Pages (Free)
1. Create GitHub repository
2. Upload all files
3. Settings → Pages → Select main branch
4. Done! Site will be live

### Option 2: Netlify (Free)
1. Go to netlify.com
2. Drag & drop the folder
3. Instant deployment!

### Option 3: Your Server
Upload all files via FTP to your web hosting.

---

## 🐛 Troubleshooting

### Images Not Showing
- Check Google Drive permissions (public access)
- Verify direct URL format: `https://drive.google.com/uc?export=view&id=FILE_ID`
- Clear browser cache (Ctrl+F5)

### Cart Not Working
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try clearing localStorage

### Categories Not Filtering
- Verify product `category` values: `men`, `ladies`, or `children`
- Check for typos in config.js

---

## 💡 Pro Tips

### Best Image Sizes
- **Product Images**: 600x750px (4:5 ratio)
- **File Size**: 100-300KB for fast loading
- **Format**: JPG for photos

### Product Names
- Keep them short and descriptive
- Use title case: "Classic Cotton T-Shirt"

### Pricing
- Be consistent with decimals: $29.99
- Use badges for sales: badge: 'Sale'

### Descriptions
- 1-2 sentences
- Highlight key features
- Be enthusiastic!

---

## 🎉 You're All Set!

Your CityFashionWear website is ready to make customers happy!

**Next Steps:**
1. Add your Google Drive images
2. Update product information
3. Customize contact details
4. Test the shopping cart
5. Deploy online!

**Have fun selling! 🛍️💖**

---

**Made with ❤️ for CityFashionWear**
