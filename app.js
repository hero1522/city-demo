document.addEventListener('DOMContentLoaded', () => {
    // Proactively unregister any service workers that might have been installed by ad scripts
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }

    const productGrid = document.getElementById('productGrid');
    const breadcrumbContainer = document.getElementById('breadcrumb');
    const paginationContainer = document.getElementById('pagination');

    let allProducts = [];
    let currentFilteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 30;

    // Use the global 'products' variable from products.js
    if (typeof products !== 'undefined') {
        // Randomize products for "For You" feel
        allProducts = shuffleArray([...products]);

        buildDynamicNavbar(allProducts);

        // Check for Deep Link (query param ?product=Name)
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');

        if (productParam) {
            const foundProduct = allProducts.find(p => p.name === productParam);
            if (foundProduct) {
                // If found, show only this product and open it
                // Logic: Filter to this product (1 item), so pagination is 1 page.
                updateBreadcrumb(foundProduct.category, foundProduct.subcategory);
                applyFilterAndRender([foundProduct]);
                applyFilterAndRender([foundProduct]);
                // Auto-open lightbox for better visibility
                setTimeout(() => openLightbox(foundProduct.image, foundProduct.name), 500);
            } else {
                // Product not found, show all
                updateBreadcrumb('all', 'all');
                applyFilterAndRender(allProducts);
            }
        } else {
            // Standard Load
            updateBreadcrumb('all', 'all');
            applyFilterAndRender(allProducts);
        }
    } else {
        console.error('products.js not loaded');
        productGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Error: products.js not found. Please run update_gallery.ps1</p>';
    }

    // --- Core Pagination Logic ---

    // Entry point for any filter change
    function applyFilterAndRender(items) {
        currentFilteredProducts = items;
        currentPage = 1;
        displayCurrentPage();
    }

    // Renders the specific page based on currentPage
    function displayCurrentPage() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const slice = currentFilteredProducts.slice(start, end);

        renderGrid(slice);
        renderPaginationControls();
    }

    // Renders the actual cards to the DOM (The "View" layer)
    function renderGrid(productsToDisplay) {
        productGrid.innerHTML = '';

        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
            return;
        }

        productsToDisplay.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            // Staggered animation delay
            card.style.animationDelay = `${index * 50}ms`;

            // Create interactive links logic
            // Main Category Link
            const mainCatHtml = `<span class="cat-link main-cat" data-filter="${product.category}" data-sub="all">${product.category}</span>`;

            // Sub Category Link (if exists)
            let subCatHtml = '';
            if (product.subcategory && product.subcategory !== 'all') {
                const parts = product.subcategory.split('/');
                let currentSub = '';

                parts.forEach(part => {
                    // Reconstruct path for the data-sub attribute
                    currentSub = currentSub ? `${currentSub}/${part}` : part;

                    subCatHtml += `<span class="separator-icon"><i class="fas fa-chevron-right"></i></span>
                               <a href="#" class="cat-link" data-filter="${product.category}" data-sub="${currentSub}">${part}</a>`;
                });
            }

            // 1. Add to Cart Button
            const addToCartBtn = document.createElement('button');
            addToCartBtn.className = 'dual-btn add-to-cart-btn';
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add';
            addToCartBtn.onclick = (e) => {
                e.preventDefault();
                addToCart(product);
            };

            // 2. Direct Order Button (WhatsApp)
            const baseUrl = window.location.href.split('?')[0];
            const productUrl = `${baseUrl}?product=${encodeURIComponent(product.name)}`;
            const msg = encodeURIComponent(`Hello, I want to buy: ${product.name}\n\nSee it here: ${productUrl}`);

            const directOrderBtn = document.createElement('a');
            directOrderBtn.href = `https://wa.me/9779846181027?text=${msg}`;
            directOrderBtn.target = '_blank';
            directOrderBtn.className = 'dual-btn direct-order-btn';
            directOrderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Buy';

            const shopRow = document.createElement('div');
            shopRow.className = 'shop-now-row';

            // Append Both
            shopRow.appendChild(addToCartBtn);
            shopRow.appendChild(directOrderBtn);

            card.innerHTML = `
                <div class="card-image-container">
                    <!-- Image inserted via JS below -->
                    <div class="name-tag">${product.name}</div>
                </div>
                <div class="card-content">
                    <div class="card-category">
                        ${mainCatHtml}
                        ${subCatHtml}
                    </div>
                    <!-- Buttons inserted below -->
                </div>
            `;

            // Create Content Element Programmatically (Image or Video)
            let contentEl;
            const isVideo = product.image.toLowerCase().endsWith('.mov') || product.image.toLowerCase().endsWith('.mp4');

            if (isVideo) {
                contentEl = document.createElement('video');
                contentEl.src = product.image;
                contentEl.className = 'card-image'; // Re-use same class for styling
                contentEl.muted = true;
                contentEl.loop = true;
                contentEl.playsInline = true;
                contentEl.autoplay = false; // DISABLED AUTOPLAY per user request
                contentEl.controls = false;
                contentEl.preload = 'metadata'; // Load metadata to show first frame
            } else {
                contentEl = document.createElement('img');
                contentEl.src = product.image;
                contentEl.alt = product.name;
                contentEl.className = 'card-image';
                contentEl.loading = 'lazy';
            }

            // Robust Click Handler
            contentEl.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop bubbling

                if (isVideo) {
                    // Pass current list and index for navigation
                    const currentList = currentFilteredProducts.length > 0 ? currentFilteredProducts : products;
                    const index = currentList.findIndex(p => p === product);
                    openVideoModal(product.image, currentList, index);
                } else {
                    // Also enable Reel view for images if user prefers unified experience, 
                    // but for now stick to lightbox for images as per previous design, 
                    // or switch to openVideoModal if unified. 
                    // User said: "if user scroll down show next product... like tiktok reel"
                    // implies unified view. Let's try to route ALL to reel?
                    // User request was specific to "video modal upgrades". 
                    // Let's keep images in lightbox strictly for now to avoid breaking zoom feature.
                    // BUT for navigation, if next is image, loadReelItem handles it.
                    openLightbox(product.image, product.name, false);
                }
            };

            // Append to container
            const imgContainer = card.querySelector('.card-image-container');
            imgContainer.prepend(contentEl); // Insert before name-tag

            // Add Play Overlay if video
            if (isVideo) {
                const playOverlay = document.createElement('div');
                playOverlay.className = 'play-overlay';
                playOverlay.innerHTML = '<i class="fas fa-play"></i>';
                imgContainer.appendChild(playOverlay);
            }

            // Append button row logic separate to attach event listener properly
            card.querySelector('.card-content').appendChild(shopRow);

            productGrid.appendChild(card);
        });

        // Initialize Scroll Observer for Animations
        const observerOptions = {
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Trigger a bit before bottom
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible-scroll');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        // Assign directions and observe
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            if (index % 2 === 0) {
                card.classList.add('slide-from-left');
            } else {
                card.classList.add('slide-from-right');
            }
            observer.observe(card);
        });
    }

    // --- Cart Logic Implementation ---
    let cart = [];

    // Load Cart from LocalStorage on Init
    const savedCart = localStorage.getItem('cityFashionCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    function addToCart(product) {
        // Check if item already exists
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            // Clone product to avoid mutating reference and init quantity
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();

        // Simple Feedback Animation
        const cartIcon = document.getElementById('cart-icon');
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }

    // Make addToCart globally accessible for reel functions
    window.addToCart = addToCart;

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }

    function saveCart() {
        localStorage.setItem('cityFashionCart', JSON.stringify(cart));
    }

    function clearCart() {
        if (confirm('Are you sure you want to remove all items?')) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    }

    // Expose clear function
    window.clearCart = clearCart; // Not strictly needed if we attach listener, but good for debug

    function updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItemsContainer = document.getElementById('cart-items');

        // Calculate Total Quantity for Badge
        const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // Update Badge
        cartCount.innerText = totalQty;
        if (totalQty > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }

        // Render Cart Items
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                // Show quantity if > 1
                const qtyDisplay = (item.quantity && item.quantity > 1) ? `<span class="qty-tag">x${item.quantity}</span>` : '';

                // Check if item is a video
                const isVideo = item.image.toLowerCase().endsWith('.mov') || item.image.toLowerCase().endsWith('.mp4');

                // For videos, show a play icon overlay instead of broken image
                const mediaDisplay = isVideo ?
                    `<div style="position: relative; width: 60px; height: 60px; background: #1a1a1a; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-play" style="color: white; font-size: 24px;"></i>
                        ${qtyDisplay}
                    </div>` :
                    `<div style="position: relative;">
                        <img src="${item.image}" alt="${item.name}">
                        ${qtyDisplay}
                    </div>`;

                itemEl.innerHTML = `
                    ${mediaDisplay}
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-cat">${item.category} <small style="color:#3b82f6">${item.quantity > 1 ? `(Qty: ${item.quantity})` : ''}</small></span>
                    </div>
                    <button class="remove-btn" onclick="removeCartItem(${index})"><i class="fas fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
    }

    // Expose remove function to global scope for onclick handler
    window.removeCartItem = removeFromCart;

    // Cart Modal Handling
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cartIcon) {
        cartIcon.onclick = () => {
            cartModal.style.display = 'flex';
        };
    }

    if (closeCart) {
        closeCart.onclick = () => {
            cartModal.style.display = 'none';
        };
    }

    if (clearCartBtn) {
        clearCartBtn.onclick = clearCart;
    }

    if (cartModal) {
        cartModal.onclick = (e) => {
            if (e.target === cartModal) cartModal.style.display = 'none';
        };
    }

    // Checkout Logic
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            let message = "Hello, I would like to order the following items:\n\n";
            let totalQty = 0;

            cart.forEach((item, index) => {
                const qty = item.quantity || 1;
                totalQty += qty;
                message += `${index + 1}. ${item.name} (${item.category}) - Qty: ${qty}\n`;
            });

            message += `\nTotal Unique Items: ${cart.length}`;
            message += `\nTotal Quantity: ${totalQty}\n\nPlease confirm availability.`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/9779846181027?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        };
    }

    // Renders the pagination buttons
    function renderPaginationControls() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(currentFilteredProducts.length / itemsPerPage);

        // Hide if only 1 page
        if (totalPages <= 1) return;

        let html = '';

        // Simple Pagination: 1 2 3 ...
        // For many pages, we might want to limit this, but for now simple list is fine
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
        }
        paginationContainer.innerHTML = html;

        // Add listeners
        paginationContainer.querySelectorAll('.page-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                currentPage = index + 1;
                displayCurrentPage();

                // Scroll to top of grid
                const yOffset = -150;
                const element = document.getElementById('productGrid');
                if (element) {
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        });
    }

    // --- Navigation & Filtering ---

    function buildDynamicNavbar(products) {
        const navLinksContainer = document.querySelector('.nav-links');

        // 1. Build Taxonomy Tree
        // { "Men": { "pant": { __children: { "gens pant": ... }, __path: "pant" } } }
        const tree = {};
        const categories = new Set();

        products.forEach(p => {
            categories.add(p.category);
            if (p.subcategory && p.subcategory !== 'all') {
                if (!tree[p.category]) tree[p.category] = {};

                const parts = p.subcategory.split('/');
                let currentLevel = tree[p.category];

                parts.forEach((part, index) => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = {
                            __children: {},
                            __path: parts.slice(0, index + 1).join('/')
                        };
                    }
                    currentLevel = currentLevel[part].__children;
                });
            }
        });

        let html = `<button class="filter-btn active" data-filter="all" data-sub="all">Home</button>`;

        // Custom sort order: Men, Ladies, then others
        const sortOrder = ['Men', 'Ladies', 'baby'];

        const sortedCategories = Array.from(categories).sort((a, b) => {
            const indexA = sortOrder.indexOf(a);
            const indexB = sortOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedCategories.forEach(cat => {
            if (tree[cat]) {
                // Has subcategories
                html += `
                    <div class="dropdown">
                        <button class="filter-btn parent-btn">
                            ${cat} <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <a href="#" data-filter="${cat}" data-sub="all">All ${cat}</a>
                            ${renderSubMenuItems(cat, tree[cat])}
                        </div>
                    </div>`;
            } else {
                // No subcategories
                html += `<button class="filter-btn" data-filter="${cat}" data-sub="all">${cat}</button>`;
            }
        });

        navLinksContainer.innerHTML = html;
        attachNavListeners();
    }

    function renderSubMenuItems(category, nodes) {
        let html = '';
        Object.keys(nodes).sort().forEach(key => {
            const node = nodes[key];
            const hasChildren = Object.keys(node.__children).length > 0;
            const path = node.__path;

            if (hasChildren) {
                html += `
                 <div class="has-children">
                    <a href="#" data-filter="${category}" data-sub="${path}">
                        ${key} <i class="fas fa-chevron-right"></i>
                    </a>
                    <div class="submenu">
                        ${renderSubMenuItems(category, node.__children)}
                    </div>
                 </div>`;
            } else {
                html += `<a href="#" data-filter="${category}" data-sub="${path}">${key}</a>`;
            }
        });
        return html;
    }

    function attachNavListeners() {
        const allFilterElements = document.querySelectorAll('.filter-btn, .dropdown-content a');

        allFilterElements.forEach(el => {
            el.addEventListener('click', (e) => {
                const isLink = el.tagName === 'A';
                if (isLink) e.preventDefault();

                // Handle Mobile Nested Toggle (Accordion)
                // If it's a parent item in a dropdown
                if (window.innerWidth <= 768) {
                    const hasChildren = el.closest('.has-children');
                    if (hasChildren && el.parentElement === hasChildren) { // exact link click
                        e.stopPropagation(); // prevent closing main menu
                        hasChildren.classList.toggle('active');
                    }
                }

                // Visual Active State
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

                if (el.classList.contains('filter-btn')) {
                    el.classList.add('active');
                } else {
                    const parentBtn = el.closest('.dropdown').querySelector('.filter-btn');
                    if (parentBtn) parentBtn.classList.add('active');
                }

                // Filtering Data
                const filterCat = el.getAttribute('data-filter');
                const filterSub = el.getAttribute('data-sub');

                if (!filterCat) return;

                updateBreadcrumb(filterCat, filterSub);

                if (filterCat === 'all') {
                    applyFilterAndRender(allProducts);
                } else {
                    let filtered = allProducts.filter(p => p.category === filterCat);

                    if (filterSub && filterSub !== 'all') {
                        // Inclusive Filtering: Match exact subcategory OR any children (starts with "sub/")
                        filtered = filtered.filter(p =>
                            p.subcategory === filterSub ||
                            p.subcategory.startsWith(filterSub + '/')
                        );
                    }
                    applyFilterAndRender(filtered);
                }
            });
        });
    }

    function updateBreadcrumb(category, subcategory) {
        if (!breadcrumbContainer) return;

        let html = '';
        if (category === 'all') {
            html = '<span class="cat-link active" data-filter="all" data-sub="all">All Products</span>';
        } else {
            html = `<span class="cat-link" data-filter="all" data-sub="all">Home</span> <span class="separator">/</span> `;
            html += `<span class="cat-link active" data-filter="${category}" data-sub="all">${category}</span>`;

            if (subcategory && subcategory !== 'all') {
                html = `<span class="cat-link" data-filter="all" data-sub="all">Home</span> <span class="separator">/</span> `;
                html += `<span class="cat-link" data-filter="${category}" data-sub="all">${category}</span>`;

                const parts = subcategory.split('/');
                let currentSub = '';

                parts.forEach((part, index) => {
                    currentSub = currentSub ? `${currentSub}/${part}` : part;

                    // Mark the last item as active
                    const isActive = index === parts.length - 1;

                    html += ` <span class="separator">/</span> `;
                    html += `<span class="cat-link ${isActive ? 'active' : ''}" data-filter="${category}" data-sub="${currentSub}">${part}</span>`;
                });
            }
        }
        breadcrumbContainer.innerHTML = html;

        // Toggle footer About section visibility
        toggleFooterAbout(category);
    }

    // Function to show/hide footer Home-only sections (About + Info Bar)
    function toggleFooterAbout(category) {
        console.log('toggleFooterAbout called with category:', category);
        const aboutSection = document.getElementById('footer-about-section');
        const infoBar = document.getElementById('footer-info-bar');

        if (aboutSection && infoBar) {
            // Show only on home page (category === 'all')
            if (category === 'all') {
                aboutSection.style.display = '';  // Use default display
                infoBar.style.display = '';       // Use default display
                console.log('✓ Footer Sections: SHOWN (viewing all products)');
            } else {
                aboutSection.style.display = 'none';
                infoBar.style.display = 'none';
                console.log('✗ Footer Sections: HIDDEN (viewing:', category, ')');
            }
        } else {
            console.error('Footer sections not found!',
                aboutSection ? '' : '#footer-about-section missing',
                infoBar ? '' : '#footer-info-bar missing');
        }
    }

    // Make it globally accessible for debugging
    window.toggleFooterAbout = toggleFooterAbout;

    // --- Global Click Listeners ---

    // Attach click event to dynamically created images (Lightbox) and Category Links (Filtering)
    document.addEventListener('click', (e) => {
        // Lightbox Trigger
        // Check if click is on the image container (handles image, name-tag, overlays)
        const imageContainer = e.target.closest('.card-image-container');
        if (imageContainer) {
            const img = imageContainer.querySelector('.card-image');
            const nameTag = imageContainer.querySelector('.name-tag');
            if (img) {
                openLightbox(img.src, nameTag ? nameTag.innerText : '');
                return;
            }
        }

        // Category Link Trigger (Nav, Cards, Breadcrumb)
        // Checks if it's a cat-link
        // Category Link Trigger (Nav, Cards, Breadcrumb)
        // Checks if it's a cat-link OR filter-btn
        if (e.target.classList.contains('cat-link') || e.target.closest('.filter-btn')) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target.classList.contains('cat-link') ? e.target : e.target.closest('.filter-btn');
            const filterCat = target.getAttribute('data-filter');
            const filterSub = target.getAttribute('data-sub');

            if (!filterCat) return;

            updateBreadcrumb(filterCat, filterSub);

            if (filterCat === 'all') {
                applyFilterAndRender(allProducts);
            } else {
                let filtered = allProducts.filter(p => p.category === filterCat);
                if (filterSub && filterSub !== 'all') {
                    filtered = filtered.filter(p => p.subcategory === filterSub);
                }
                applyFilterAndRender(filtered);
            }

            // Update Navbar Visual State
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Find button that matches current filter
            const navBtn = document.querySelector(`.filter-btn[data-filter="${filterCat}"][data-sub="all"]`);
            if (navBtn) navBtn.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });

    // Logo Click Handler (Home)
    const logoLink = document.querySelector('.logo');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Reset to All
            applyFilterAndRender(allProducts);
            updateBreadcrumb('all', 'all');

            // Update Nav Visuals
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        navLinks.addEventListener('click', (e) => {
            // Check for Mobile Dropdown Toggle (Parent Button)
            const parentBtn = e.target.closest('.parent-btn');
            if (parentBtn) {
                e.preventDefault();
                e.stopPropagation();

                const dropdown = parentBtn.closest('.dropdown');
                dropdown.classList.toggle('active');

                // Rotate chevron if needed (css)
                return;
            }

            // Close menu when a regular link/button is clicked
            if (e.target.closest('.filter-btn') || e.target.closest('a')) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // --- Search & History Logic ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Helper: Calculate Levenshtein distance for fuzzy matching
    function levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    // Helper: Normalize text for better matching
    function normalizeText(text) {
        return text.toLowerCase()
            .replace(/[-_\s]/g, '') // Remove dashes, underscores, spaces
            .trim();
    }

    // Helper: Check if query matches with fuzzy tolerance
    function fuzzyMatch(text, query, threshold = 2) {
        const normalizedText = normalizeText(text);
        const normalizedQuery = normalizeText(query);

        // Exact match after normalization
        if (normalizedText.includes(normalizedQuery)) {
            return true;
        }

        // Fuzzy match using Levenshtein distance
        const distance = levenshteinDistance(normalizedText, normalizedQuery);
        return distance <= threshold;
    }

    // Helper: Get search score for ranking
    function getSearchScore(product, query) {
        const normalizedQuery = normalizeText(query);
        const name = normalizeText(product.name);
        const cat = normalizeText(product.category);
        const sub = normalizeText(product.subcategory || '');

        let score = 0;

        // Exact matches get highest score
        if (name === normalizedQuery) score += 100;
        if (cat === normalizedQuery) score += 80;
        if (sub === normalizedQuery) score += 60;

        // Partial matches
        if (name.includes(normalizedQuery)) score += 50;
        if (cat.includes(normalizedQuery)) score += 40;
        if (sub.includes(normalizedQuery)) score += 30;

        // Fuzzy matches (lower score)
        if (fuzzyMatch(name, query, 2)) score += 20;
        if (fuzzyMatch(cat, query, 2)) score += 15;
        if (fuzzyMatch(sub, query, 2)) score += 10;

        return score;
    }

    // Category and keyword synonyms/aliases
    const searchSynonyms = {
        // Women/Ladies synonyms
        'women': 'ladies',
        'woman': 'ladies',
        'womens': 'ladies',
        'girl': 'ladies',
        'girls': 'ladies',
        'female': 'ladies',

        // Men synonyms
        'man': 'men',
        'mens': 'men',
        'boy': 'men',
        'boys': 'men',
        'male': 'men',
        'gents': 'men',
        'gentlemen': 'men',

        // Baby/Kids synonyms
        'kid': 'baby',
        'kids': 'baby',
        'child': 'baby',
        'children': 'baby',
        'toddler': 'baby',
        'infant': 'baby',

        // Product type synonyms
        'pants': 'pant',
        'trousers': 'pant',
        'jeans': 'pant',
        'tshirts': 'tshirt',
        't-shirts': 'tshirt',
        'shirts': 'shirt',
        'shoe': 'shoes',
        'footwear': 'shoes',
        'sneakers': 'shoes'
    };

    // Helper: Replace synonyms in query
    function applySynonyms(query) {
        const words = query.toLowerCase().split(/\s+/);
        const replacedWords = words.map(word => {
            // Check if word has a synonym
            return searchSynonyms[word] || word;
        });
        return replacedWords.join(' ');
    }

    function performSearch() {
        let query = searchInput.value.toLowerCase().trim();

        if (!query) {
            // If empty, reset to all
            applyFilterAndRender(allProducts);
            updateBreadcrumb('all', 'all');
            return;
        }

        // save to history (save original query)
        saveSearchHistory(query);

        // Apply synonyms to improve search accuracy
        // e.g., "women pants" → "ladies pant"
        query = applySynonyms(query);

        // Split query into words for multi-word search
        const queryWords = query.split(/\s+/);

        // Enhanced Filter Logic with scoring
        const scoredProducts = allProducts.map(p => {
            const name = p.name.toLowerCase();
            const cat = p.category.toLowerCase();
            const sub = (p.subcategory || '').toLowerCase();
            const img = (p.image || '').toLowerCase();

            // Combine all searchable text
            const combinedText = `${name} ${cat} ${sub} ${img}`;

            let matchScore = 0;
            let wordMatches = 0;

            // Check each word in the query
            queryWords.forEach(word => {
                // Direct includes (exact substring match)
                if (name.includes(word)) matchScore += 50;
                if (cat.includes(word)) matchScore += 40;
                if (sub.includes(word)) matchScore += 30;
                if (img.includes(word)) matchScore += 10;

                // Fuzzy matching for misspellings
                if (fuzzyMatch(name, word, 2)) matchScore += 20;
                if (fuzzyMatch(cat, word, 2)) matchScore += 15;
                if (fuzzyMatch(sub, word, 2)) matchScore += 10;

                // Track how many words matched
                if (combinedText.includes(word) ||
                    fuzzyMatch(combinedText, word, 2)) {
                    wordMatches++;
                }
            });

            // Bonus for matching all query words (important for "men pant")
            if (wordMatches === queryWords.length) {
                matchScore += 100;
            }

            return {
                product: p,
                score: matchScore
            };
        });

        // Filter products with score > 0 and sort by score
        const filtered = scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.product);

        // Update Breadcrumb & Render with suggestions
        if (breadcrumbContainer) {
            if (filtered.length === 0) {
                // Find suggestions using fuzzy matching
                const suggestions = findSuggestions(query);
                let suggestionHtml = '';

                if (suggestions.length > 0) {
                    suggestionHtml = `<div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #856404;">
                            <i class="fas fa-lightbulb"></i> No exact matches found. Did you mean:
                        </p>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${suggestions.map(s =>
                        `<button class="suggestion-btn" onclick="document.getElementById('search-input').value='${s}'; document.getElementById('search-btn').click();" 
                                    style="padding: 0.4rem 0.8rem; background: white; border: 1px solid #ffc107; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;">
                                    ${s}
                                </button>`
                    ).join('')}
                        </div>
                    </div>`;
                }

                breadcrumbContainer.innerHTML = `<span class="cat-link" data-filter="all" data-sub="all">Home</span> <span class="separator">/</span> <span style="color: #ef4444;">No results for "${query}"</span>${suggestionHtml}`;
            } else {
                breadcrumbContainer.innerHTML = `<span class="cat-link" data-filter="all" data-sub="all">Home</span> <span class="separator">/</span> <span>Search: "${query}" (${filtered.length} result${filtered.length !== 1 ? 's' : ''})</span>`;
            }
        }

        applyFilterAndRender(filtered);
    }

    // Find search suggestions based on existing products
    function findSuggestions(query) {
        const suggestions = new Set();
        const normalizedQuery = normalizeText(query);

        // Collect unique terms from all products
        const terms = new Set();
        allProducts.forEach(p => {
            terms.add(p.category.toLowerCase());
            if (p.subcategory && p.subcategory !== 'all') {
                p.subcategory.split('/').forEach(sub => terms.add(sub.toLowerCase()));
            }
            // Add common product type keywords from names
            const words = p.name.toLowerCase().split(/[-_\s]+/);
            words.forEach(w => {
                if (w.length > 2) terms.add(w);
            });
        });

        // Find close matches
        Array.from(terms).forEach(term => {
            const distance = levenshteinDistance(normalizedQuery, normalizeText(term));
            // If within edit distance of 3, it's a good suggestion
            if (distance <= 3 && distance > 0) {
                suggestions.add(term);
            }
        });

        // If no suggestions, try partial matches
        if (suggestions.size === 0) {
            Array.from(terms).forEach(term => {
                if (term.includes(normalizedQuery.substring(0, 3)) ||
                    normalizedQuery.includes(term.substring(0, 3))) {
                    suggestions.add(term);
                }
            });
        }

        return Array.from(suggestions).slice(0, 5); // Max 5 suggestions
    }

    function saveSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        // Add new query to top, remove duplicates
        history = [query, ...history.filter(q => q !== query)].slice(0, 50); // Keep last 50
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    function downloadSearchHistory() {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (history.length === 0) {
            alert('No search history found.');
            return;
        }

        const content = "Search History Log:\n" + history.map((q, i) => `${i + 1}. ${q}`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'search_history.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    // Expose for usage
    window.downloadSearchHistory = downloadSearchHistory;

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

});

// Lightbox Functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');

let currentZoom = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// Open Lightbox
// Open Lightbox
function openLightbox(imageSrc, captionText, isVideo = false) {
    if (!lightbox) return;
    lightbox.style.display = 'flex';

    // Get Elements
    const lightboxImg = document.getElementById('lightbox-img');
    let lightboxVideo = document.getElementById('lightbox-video');

    if (isVideo) {
        // Hide Image
        if (lightboxImg) lightboxImg.style.display = 'none';

        // Create Video Element (re-create to ensure clean state)
        // Remove old if exists
        const oldVid = document.getElementById('lightbox-video');
        if (oldVid) oldVid.remove();

        lightboxVideo = document.createElement('video');
        lightboxVideo.id = 'lightbox-video';
        lightboxVideo.controls = true;
        lightboxVideo.autoplay = true;

        // sizing
        lightboxVideo.style.width = '100%';
        lightboxVideo.style.height = 'auto';
        lightboxVideo.style.maxWidth = '90vw';
        lightboxVideo.style.maxHeight = '80vh';
        lightboxVideo.style.minWidth = '320px';  // Minimum width
        lightboxVideo.style.minHeight = '180px'; // Minimum height to prevent collapse
        lightboxVideo.style.objectFit = 'contain';
        lightboxVideo.style.background = '#000'; // Black background clearly shows area

        // Insert after img
        const contentContainer = document.querySelector('.lightbox-content');
        contentContainer.insertBefore(lightboxVideo, contentContainer.firstChild);

        lightboxVideo.style.display = 'block';
        lightboxVideo.src = imageSrc;
        lightboxVideo.play().catch(e => console.log('Auto-play blocked:', e));

        // Add 2x Speed Button if not exists
        let speedBtn = document.getElementById('lightbox-speed-btn');
        if (!speedBtn) {
            speedBtn = document.createElement('button');
            speedBtn.id = 'lightbox-speed-btn';
            speedBtn.innerText = '2x Speed';
            speedBtn.style.position = 'absolute';
            speedBtn.style.top = '20px';
            speedBtn.style.right = '60px'; // Next to close button
            speedBtn.style.zIndex = '1001';
            speedBtn.style.padding = '5px 10px';
            speedBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            speedBtn.style.color = '#fff';
            speedBtn.style.border = '1px solid #fff';
            speedBtn.style.cursor = 'pointer';
            speedBtn.style.borderRadius = '4px';

            speedBtn.onclick = () => {
                const vid = document.getElementById('lightbox-video');
                if (vid) {
                    if (vid.playbackRate === 1.0) {
                        vid.playbackRate = 2.0;
                        speedBtn.innerText = '1x Speed';
                        speedBtn.style.background = 'rgba(255, 255, 255, 0.8)';
                        speedBtn.style.color = '#000';
                    } else {
                        vid.playbackRate = 1.0;
                        speedBtn.innerText = '2x Speed';
                        speedBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                        speedBtn.style.color = '#fff';
                    }
                }
            };

            document.querySelector('.lightbox-content').appendChild(speedBtn);
        }
        // Reset button state on open
        speedBtn.style.display = 'block';
        speedBtn.innerText = '2x Speed';
        speedBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        speedBtn.style.color = '#fff';

    } else {
        // Hide Video and Speed Button
        const speedBtn = document.getElementById('lightbox-speed-btn');
        if (speedBtn) speedBtn.style.display = 'none';

        if (lightboxVideo) {
            lightboxVideo.style.display = 'none';
            lightboxVideo.pause();
            lightboxVideo.src = '';
        }

        // Show Image
        if (lightboxImg) {
            lightboxImg.style.display = 'block';
            lightboxImg.src = imageSrc;
        }
    }

    // Set Caption
    const captionEl = document.getElementById('lightbox-caption');
    if (captionEl) {
        // HIDE CAPTION ALWAYS per user request
        captionEl.style.display = 'none';
        captionEl.innerText = '';
    }

    // Reset Zoom & Position
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();

    // Mobile Fix: Push history state so 'Back' button closes it
    history.pushState({ lightboxOpen: true }, '', '#lightbox');
}

// Close Lightbox Handler Update (ensure video stops)
function closeLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'none';

    const lightboxVideo = document.getElementById('lightbox-video');
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = ''; // Release memory
    }

    // Clear history
    if (history.state && history.state.lightboxOpen) {
        history.back();
    }
}

// Smart Map Redirection
function openLocation(e) {
    if (e) e.preventDefault();

    // Specific Coordinates from user's Google Maps Link (Pin Location)
    // Link: https://www.google.com/maps/place/CityFashionwear/...3d28.2311634!4d84.3775144...
    const lat = "28.2311634";
    const lng = "84.3775144";
    const label = "CityFashionwear";

    // Direct Google Maps URL provided by user
    const googleMapsUrl = "https://www.google.com/maps/place/CityFashionwear/@28.2311161,84.3754652,17z/data=!4m6!3m5!1s0x39957303c8794f97:0xdbb7819cfa293da3!8m2!3d28.2311634!4d84.3775144!16s%2Fg%2F11p5_ts6wr?entry=ttu";

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS (iPhone, iPad, iPod)
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        // Apple Maps: Use precise coordinates
        window.location.href = `http://maps.apple.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`;
    } else {
        // Android/Desktop: Use the exact link provided
        window.open(googleMapsUrl, '_blank');
    }
}
window.openLocation = openLocation;

function updateImageTransform() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

// Close Lightbox (UI Action)
function closeLightboxUI() {
    if (!lightbox) return;
    lightbox.style.display = 'none';
    lightboxImg.src = ''; // Clear source
}

// Handle Browser Back Button
window.addEventListener('popstate', (event) => {
    // If lightbox is visible, close it
    if (lightbox && lightbox.style.display === 'flex') {
        closeLightboxUI();
    }
});

// User Intent to Close (Button or Click Outside)
function requestCloseLightbox() {
    // If hash is #lightbox, go back (which triggers popstate -> closeLightboxUI)
    if (window.location.hash === '#lightbox') {
        history.back();
    } else {
        // Fallback or if opened without pushing state
        closeLightboxUI();
    }
}

// Event Listeners for closing
if (closeBtn) closeBtn.addEventListener('click', requestCloseLightbox);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) requestCloseLightbox();
    });

    // Zoom with Mouse Wheel
    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY * -0.001;
        const newZoom = currentZoom + delta;

        if (newZoom > 0.5 && newZoom < 5) {
            currentZoom = newZoom;
            // Auto-reset position if zoomed out to normal or less
            if (currentZoom <= 1) {
                translateX = 0;
                translateY = 0;
            }
            updateImageTransform();
        }
    });

    // --- Drag / Pan Logic ---
    lightboxImg.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            lightboxImg.style.cursor = 'grabbing';
            lightboxImg.style.transition = 'none'; // Disable transition for instant drag response
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            lightboxImg.style.cursor = 'grab';
            lightboxImg.style.transition = 'transform 0.3s ease'; // Restore transition
        }
    });
}

// Newsletter Signup Handler
function handleNewsletterSignup(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput.value;

    if (email) {
        // For now, send to WhatsApp (you can later integrate with a proper email service)
        const message = encodeURIComponent(`Hello! I'd like to subscribe to the CityFashionWear newsletter.\n\nEmail: ${email}\n\nPlease add me to your mailing list for exclusive offers and new collections!`);
        const whatsappUrl = `https://wa.me/9779846181027?text=${message}`;

        window.open(whatsappUrl, '_blank');

        // Clear form and show confirmation
        emailInput.value = '';
        alert('Thank you for subscribing! We\'ll contact you via WhatsApp to confirm.');
    }
}

// Dedicated Video Modal Functions
function openVideoModal(videoSrc) {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');
    if (modal && player) {
        modal.style.display = 'flex';
        player.src = videoSrc;
        player.playbackRate = 1.0; // Reset speed

        // Reset button text
        const speedBtn = document.getElementById('video-speed-btn');
        if (speedBtn) {
            speedBtn.innerText = '2x Speed';
            speedBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            speedBtn.style.color = '#fff';
        }

        player.play().catch(e => console.log('Autoplay blocked:', e));
    }
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');
    if (modal) {
        modal.style.display = 'none';
        if (player) {
            player.pause();
            player.src = ''; // Clear source
        }
    }
}

function toggleVideoSpeed() {
    const player = document.getElementById('main-video-player');
    const speedText = document.getElementById('speed-text');

    if (player) {
        if (player.playbackRate === 1.0) {
            player.playbackRate = 2.0;
            if (speedText) {
                speedText.innerText = '2x';
                speedText.style.color = '#ffc107'; // Yellow active
            }
        } else {
            player.playbackRate = 1.0;
            if (speedText) {
                speedText.innerText = '1x';
                speedText.style.color = 'white';
            }
        }
    }
}

// Make functions globally available for inline onclick handlers
// Make functions globally available for inline onclick handlers
window.closeVideoModal = closeVideoModal;
window.toggleVideoSpeed = toggleVideoSpeed;

function shareVideoToWhatsApp() {
    const message = encodeURIComponent("Check out this product from CityFashionWear!");
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
}
window.shareVideoToWhatsApp = shareVideoToWhatsApp;

// Make it globally accessible
window.handleNewsletterSignup = handleNewsletterSignup;

// Location Link Handler
function openLocation(event) {
    event.preventDefault();
    // Open Google Maps location for Besishahar, Lamjung, Nepal
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Besishahar,+Lamjung,+Nepal';
    window.open(mapsUrl, '_blank');
}

// Make it globally accessible
window.openLocation = openLocation;

// ========== REEL / TIKTOK-STYLE NAVIGATION SYSTEM ==========
let currentReelIndex = 0;
let currentReelList = []; // Array of product objects
let autoScrollEnabled = false; // Will be used for TikTok auto-scroll feature

// Open Reel with full context for navigation
function openVideoModal(videoSrc, filteredProducts = [], startIndex = 0) {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');

    // Fallback: if called without list, find product from src
    if (filteredProducts.length === 0 && typeof products !== 'undefined') {
        currentReelList = products;
        currentReelIndex = currentReelList.findIndex(p => p.image === videoSrc);
        if (currentReelIndex === -1) currentReelIndex = 0;
    } else {
        currentReelList = filteredProducts;
        currentReelIndex = startIndex >= 0 ? startIndex : 0;
    }

    if (modal && player) {
        modal.style.display = 'flex';

        // Push state to history to support "Back Button Closes Modal"
        // Check if we already pushed state to avoid duplicates if called logic is complex
        if (!history.state || history.state.modal !== 'video') {
            history.pushState({ modal: 'video' }, '', '');
        }

        // Load auto-scroll preference from localStorage
        const savedAutoScroll = localStorage.getItem('reelAutoScroll');
        if (savedAutoScroll !== null) {
            autoScrollEnabled = savedAutoScroll === 'true';
        }

        // Update toggle UI
        const toggle = document.querySelector('.auto-scroll-toggle');
        const text = document.getElementById('auto-scroll-text');
        if (autoScrollEnabled && toggle) {
            toggle.classList.add('active');
            if (text) text.innerText = 'Auto Scroll (ON)';
        } else if (toggle) {
            toggle.classList.remove('active');
            if (text) text.innerText = 'Auto Scroll (OFF)';
        }

        loadReelItem(currentReelIndex);
    }
}

// Load specific reel item (video or image)
function loadReelItem(index) {
    if (index < 0 || index >= currentReelList.length) return;

    const product = currentReelList[index];
    const player = document.getElementById('main-video-player');
    const isVideo = product.image.toLowerCase().endsWith('.mov') || product.image.toLowerCase().endsWith('.mp4');

    // Reset UI state
    const loveBtn = document.querySelector('.love-reel');
    if (loveBtn) loveBtn.classList.remove('active');

    // Reset speed
    const speedText = document.getElementById('speed-text');
    if (speedText) {
        speedText.innerText = '1x';
        speedText.style.color = 'white';
    }
    if (player) player.playbackRate = 1.0;

    // Load media
    handleReelMediaType(product.image, isVideo);
}

// Handle both video and image display in reel
function handleReelMediaType(src, isVideo) {
    let player = document.getElementById('main-video-player');
    let imgView = document.getElementById('reel-image-view');

    // Create image viewer if it doesn't exist
    if (!imgView) {
        const container = document.querySelector('.reel-container');
        if (container) {
            imgView = document.createElement('img');
            imgView.id = 'reel-image-view';
            imgView.style.cssText = "width: 100%; height: 100%; max-height: 100vh; object-fit: contain; display: none; background: black; position: absolute; top: 0; left: 0;";
            container.insertBefore(imgView, player);
        }
    }

    if (isVideo) {
        if (player) {
            player.style.display = 'block';
            player.src = src;
            player.play().catch(e => console.log('Autoplay:', e));

            // Setup auto-scroll listener for this video
            setupAutoScrollListener(player);
        }
        if (imgView) imgView.style.display = 'none';
    } else {
        if (player) {
            player.pause();
            player.style.display = 'none';
        }
        if (imgView) {
            imgView.style.display = 'block';
            imgView.src = src;
        }
    }
}

// Auto-scroll functionality
function setupAutoScrollListener(player) {
    // Remove any existing listener to avoid duplicates
    player.onended = null;

    // Add new listener if auto-scroll is enabled
    if (autoScrollEnabled) {
        player.onended = () => {
            console.log('Video ended, auto-scrolling to next...');
            setTimeout(() => {
                showNextReel();
            }, 500); // Small delay before auto-advance
        };
    }
}

function toggleAutoScroll() {
    autoScrollEnabled = !autoScrollEnabled;

    // Save preference
    localStorage.setItem('reelAutoScroll', autoScrollEnabled);

    // Update UI
    const toggle = document.querySelector('.auto-scroll-toggle');
    const text = document.getElementById('auto-scroll-text');

    if (autoScrollEnabled) {
        toggle.classList.add('active');
        if (text) text.innerText = 'Auto Scroll (ON)';

        // Setup listener for current video
        const player = document.getElementById('main-video-player');
        if (player && player.style.display !== 'none') {
            setupAutoScrollListener(player);
        }
    } else {
        toggle.classList.remove('active');
        if (text) text.innerText = 'Auto Scroll (OFF)';

        // Remove listener
        const player = document.getElementById('main-video-player');
        if (player) player.onended = null;
    }

    console.log('Auto-scroll:', autoScrollEnabled ? 'ON' : 'OFF');
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('main-video-player');
    if (modal) {
        modal.style.display = 'none';
        if (player) {
            player.pause();
            player.src = '';
        }
    }
}

// Speed control: 1x -> 2x -> 4x cycle
function toggleVideoSpeed() {
    const player = document.getElementById('main-video-player');
    const speedText = document.getElementById('speed-text');

    if (player) {
        let rate = player.playbackRate;
        if (rate === 1.0) rate = 2.0;
        else if (rate === 2.0) rate = 4.0;
        else rate = 1.0;

        player.playbackRate = rate;

        if (speedText) {
            speedText.innerText = rate + 'x';
            speedText.style.color = rate > 1.0 ? '#ffc107' : 'white';
        }
    }
}

// Love button - add to cart with visual feedback
function loveProductReel() {
    const btn = document.querySelector('.love-reel');
    if (btn) btn.classList.add('active');
    addToCartReel();
}

// Add current product to cart
function addToCartReel() {
    console.log('addToCartReel called'); // Debug log
    const product = currentReelList[currentReelIndex];
    console.log('Current product:', product); // Debug log

    if (product) {
        // Call the global addToCart function with the FULL product object
        if (typeof addToCart === 'function') {
            console.log('Calling addToCart with product:', product);
            addToCart(product); // Pass the entire product object, not just name/price
        } else {
            console.error('addToCart function not found!');
        }

        // Visual feedback
        const cartBtn = document.querySelector('.cart-reel i');
        if (cartBtn) {
            cartBtn.classList.add('fa-bounce');
            setTimeout(() => cartBtn.classList.remove('fa-bounce'), 1000);
        }
    } else {
        console.error('No product found at index:', currentReelIndex);
    }
}

// Visual Heart Pop Effect (TikTok Style)
function spawnHeart(x, y) {
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart floating-heart';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    // Add randomness to rotation and scale for natural feel
    const randomAngle = (Math.random() - 0.5) * 40; // -20 to 20 deg
    heart.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg) scale(0)`;

    document.body.appendChild(heart);

    // Animate
    requestAnimationFrame(() => {
        heart.style.transform = `translate(-50%, -150%) rotate(${randomAngle}deg) scale(1.5)`;
        heart.style.opacity = '0';
    });

    // Cleanup
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

// Global hook for tap handling if needed
window.spawnHeart = spawnHeart;

// Initialize Tap Listener for Hearts
document.addEventListener('DOMContentLoaded', () => {
    const reelContainer = document.querySelector('.reel-container');
    if (reelContainer) {
        reelContainer.addEventListener('click', (e) => {
            // Ignore clicks on controls
            if (e.target.closest('button') ||
                e.target.closest('.auto-scroll-toggle') ||
                e.target.closest('.reel-btn')) return;

            // Spawn heart at click position
            spawnHeart(e.clientX, e.clientY);
        });
    }
});

// Share to WhatsApp
function shareVideoToWhatsApp() {
    const product = currentReelList[currentReelIndex];
    const name = product ? product.name : "this product";
    const message = encodeURIComponent(`Check out ${name} from CityFashionWear!`);
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
}

// Navigation functions
function showNextReel() {
    if (currentReelIndex < currentReelList.length - 1) {
        currentReelIndex++;
        loadReelItem(currentReelIndex);
    }
}

function showPrevReel() {
    if (currentReelIndex > 0) {
        currentReelIndex--;
        loadReelItem(currentReelIndex);
    }
}

// Scroll navigation with debouncing
let isScrolling = false;
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('video-modal');

    if (modalEl) {
        // Mouse wheel navigation
        modalEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (isScrolling) return;
            isScrolling = true;

            if (e.deltaY > 0) {
                showNextReel(); // Scroll down = next
            } else {
                showPrevReel(); // Scroll up = previous
            }

            setTimeout(() => isScrolling = false, 500);
        });

        // Touch swipe navigation
        let touchStartY = 0;
        modalEl.addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        });

        modalEl.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 50) {
                if (diff > 0) showNextReel(); // Swipe up = next
                else showPrevReel(); // Swipe down = previous
            }
        });
    }
});

// Global exports
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
window.toggleVideoSpeed = toggleVideoSpeed;
window.loveProductReel = loveProductReel;
window.addToCartReel = addToCartReel;
window.shareVideoToWhatsApp = shareVideoToWhatsApp;
// Helper: Fisher-Yates Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.toggleAutoScroll = toggleAutoScroll;


