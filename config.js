// CityFashionWear Product Configuration
// Simple structure for Men, Ladies, and Children clothing

// INSTRUCTIONS:
// 1. Upload your product images to Google Drive
// 2. Make them public: Right-click > Share > "Anyone with the link can view"
// 3. Get direct URL: https://drive.google.com/uc?export=view&id=YOUR_FILE_ID
// 4. Replace the image URLs below with your Google Drive URLs

const PRODUCTS = [
    // ========== MEN'S SECTION ==========
    {
        id: 'm001',
        name: 'Classic Cotton T-Shirt',
        category: 'men',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        badge: 'Popular',
        description: 'Comfortable cotton t-shirt perfect for everyday wear. Available in multiple colors.'
    },
    {
        id: 'm002',
        name: 'Denim Jeans',
        category: 'men',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        badge: 'New',
        description: 'Classic fit denim jeans with premium quality fabric.'
    },
    {
        id: 'm003',
        name: 'Casual Shirt',
        category: 'men',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        badge: '',
        description: 'Smart casual shirt suitable for work and weekends.'
    },
    {
        id: 'm004',
        name: 'Sports Jacket',
        category: 'men',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
        badge: 'Sale',
        description: 'Lightweight sports jacket with water-resistant fabric.'
    },
    {
        id: 'm005',
        name: 'Formal Pants',
        category: 'men',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
        badge: '',
        description: 'Professional dress pants for the modern workplace.'
    },
    {
        id: 'm006',
        name: 'Polo Shirt',
        category: 'men',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
        badge: '',
        description: 'Classic polo shirt in premium pique cotton.'
    },

    // ========== LADIES' SECTION ==========
    {
        id: 'l001',
        name: 'Floral Summer Dress',
        category: 'ladies',
        price: 64.99,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
        badge: 'Trending',
        description: 'Beautiful floral print dress perfect for summer occasions.'
    },
    {
        id: 'l002',
        name: 'Elegant Blouse',
        category: 'ladies',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600',
        badge: 'New',
        description: 'Sophisticated blouse suitable for office and events.'
    },
    {
        id: 'l003',
        name: 'Casual Jeans',
        category: 'ladies',
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1541840031508-326b77c9a17e?w=600',
        badge: '',
        description: 'Comfortable skinny fit jeans with stretch fabric.'
    },
    {
        id: 'l004',
        name: 'Knit Sweater',
        category: 'ladies',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
        badge: '',
        description: 'Cozy knit sweater for cooler weather.'
    },
    {
        id: 'l005',
        name: 'Maxi Skirt',
        category: 'ladies',
        price: 42.99,
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
        badge: 'Sale',
        description: 'Flowing maxi skirt with elastic waistband.'
    },
    {
        id: 'l006',
        name: 'Designer Handbag',
        category: 'ladies',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
        badge: 'Premium',
        description: 'Elegant leather handbag with multiple compartments.'
    },
    {
        id: 'l007',
        name: 'Casual Top',
        category: 'ladies',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1564257577149-47c307d1dada?w=600',
        badge: '',
        description: 'Versatile casual top perfect for everyday wear.'
    },

    // ========== CHILDREN'S SECTION ==========
    {
        id: 'c001',
        name: 'Kids T-Shirt Pack',
        category: 'children',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
        badge: 'Value',
        description: 'Pack of 3 colorful t-shirts for kids aged 4-12.'
    },
    {
        id: 'c002',
        name: 'Girls Dress',
        category: 'children',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600',
        badge: 'New',
        description: 'Adorable dress perfect for special occasions.'
    },
    {
        id: 'c003',
        name: 'Boys Shorts',
        category: 'children',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
        badge: '',
        description: 'Comfortable cotton shorts for active kids.'
    },
    {
        id: 'c004',
        name: 'Kids Hoodie',
        category: 'children',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
        badge: 'Popular',
        description: 'Warm and cozy hoodie for boys and girls.'
    },
    {
        id: 'c005',
        name: 'School Uniform Set',
        category: 'children',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc63a?w=600',
        badge: '',
        description: 'Complete school uniform set including shirt and pants/skirt.'
    },
    {
        id: 'c006',
        name: 'Kids Jacket',
        category: 'children',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1514090458221-6e4fd7f11a89?w=600',
        badge: '',
        description: 'Lightweight jacket perfect for spring and fall.'
    },
    {
        id: 'c007',
        name: 'Baby Outfit Set',
        category: 'children',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
        badge: 'Cute',
        description: 'Adorable outfit set for babies 0-24 months.'
    },
    {
        id: 'c008',
        name: 'Girls Leggings',
        category: 'children',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
        badge: '',
        description: 'Comfortable leggings in fun colors and patterns.'
    }
];

// Category Names for Display
const CATEGORIES = {
    all: 'All Items',
    men: 'Men',
    ladies: 'Ladies',
    children: 'Children'
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRODUCTS, CATEGORIES };
}
