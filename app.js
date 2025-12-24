// CityFashionWear - Simple & Happy Shopping App
// Updated for Men, Ladies, and Children categories

// Shopping Cart State
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupEventListeners();
    renderProducts();
});

// ==============================
// Event Listeners Setup
// ==============================
function setupEventListeners() {
    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchBtn.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            searchInput.focus();
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        renderProducts();
    });
    
    // Category Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });
    
    // Cart Modal
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCart();
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
    
    cartModal.querySelector('.modal-overlay').addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
    
    // Product Modal
    const productModal = document.getElementById('productModal');
    const closeProduct = document.getElementById('closeProduct');
    
    closeProduct.addEventListener('click', () => {
        productModal.classList.remove('active');
    });
    
    productModal.querySelector('.modal-overlay').addEventListener('click', () => {
        productModal.classList.remove('active');
    });
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Mobile Toggle (for future implementation)
    const mobileToggle = document.getElementById('mobileToggle');
    mobileToggle.addEventListener('click', () => {
        alert('Mobile menu - Coming soon! 📱');
    });
}

// ==============================
// Product Rendering
// ==============================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    // Filter products
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery) ||
            (product.description && product.description.toLowerCase().includes(searchQuery));
        
        return matchesCategory && matchesSearch;
    });
    
    // Clear grid
    grid.innerHTML = '';
    
    // Show/hide no results
    if (filtered.length === 0) {
        noResults.classList.add('active');
        return;
    } else {
        noResults.classList.remove('active');
    }
    
    // Render product cards
    filtered.forEach((product, index) => {
        const card = createProductCard(product, index);
        grid.appendChild(card);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="product-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-content">
            <div class="product-cat">${getCategoryName(product.category)}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">$${product.price}</div>
            <button class="product-btn">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    
    // Click on card opens modal
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.product-btn')) {
            openProductModal(product);
        }
    });
    
    // Add to cart button
    const addBtn = card.querySelector('.product-btn');
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
    });
    
    return card;
}

function getCategoryName(category) {
    const names = {
        'all': 'All Items',
        'men': 'Men',
        'ladies': 'Ladies',
        'children': 'Children'
    };
    return names[category] || category;
}

// ==============================
// Product Modal
// ==============================
function openProductModal(product) {
    const modal = document.getElementById('productModal');
    
    document.getElementById('productImage').src = product.image;
    document.getElementById('productImage').alt = product.name;
    document.getElementById('productCategory').textContent = getCategoryName(product.category);
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price}`;
    document.getElementById('productDescription').textContent = product.description || 
        'High-quality clothing item perfect for any occasion. Made with premium materials for comfort and style.';
    
    // Add to cart button in modal
    const modalAddBtn = modal.querySelector('.add-to-cart-btn');
    modalAddBtn.onclick = () => {
        addToCart(product);
    };
    
    modal.classList.add('active');
}

// ==============================
// Shopping Cart Functions
// ==============================
function addToCart(product) {
    // Check if product already in cart
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart! 🎉`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function saveCart() {
    localStorage.setItem('cityfashionwear_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('cityfashionwear_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartCount();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <p class="small">Start shopping to add items!</p>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-category">${getCategoryName(item.category)}</div>
                <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItem.querySelector('.cart-item-remove').addEventListener('click', () => {
            removeFromCart(item.id);
        });
        
        cartItems.appendChild(cartItem);
    });
    
    cartFooter.style.display = 'block';
    cartTotal.textContent = `$${getCartTotal().toFixed(2)}`;
}

// ==============================
// Notification System
// ==============================
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==============================
// Utility Functions
// ==============================

// Scroll to top button (optional enhancement)
window.addEventListener('scroll', () => {
    // Can add scroll to top button logic here
});

// Console message
console.log('%c🛍️ CityFashionWear', 'font-size: 24px; font-weight: bold; color: #ff6b6b;');
console.log('%cWelcome to happy shopping! 😊', 'font-size: 14px; color: #4ecdc4;');
