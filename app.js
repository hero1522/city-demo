document.addEventListener('DOMContentLoaded', () => {
    // Proactively unregister any service workers that might have been installed by ad scripts
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }

    // --- Global State Variables ---
    let allProducts = [];
    let currentFilteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 28;
    let isAutoScrollEnabled = false;

    // --- Global Function Assignments will be done at the end of DOMContentLoaded ---

    const productGrid = document.getElementById('productGrid');
    const breadcrumbContainer = document.getElementById('breadcrumb');
    const paginationContainer = document.getElementById('pagination');

    // --- Global Observers for reuse ---

    // 1. Intersection Observer for Video Autoplay (Lazy Loading)
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Play when visible
                video.preload = 'auto'; // Start loading
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Auto-play was prevented
                        console.log('Autoplay prevented:', error);
                    });
                }
            } else {
                // Pause when out of view
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Play when 50% visible
    });

    // 2. Intersection Observer for Card Animations
    const cardVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible-scroll');
                cardVisibilityObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // Trigger a bit before bottom
    });

    // Initialize Theme Toggle
    initializeThemeToggle();


    console.log('App Initialized');

    console.log('App Initialized');

    // Speed Control Variables (Global within DOMContentLoaded scope)
    let speedHoldTimer;
    let isLongPress = false;
    let activeSpeedVideo = null;
    let activeSpeedIndicator = null;

    const resetSpeed = () => {
        clearTimeout(speedHoldTimer);
        if (activeSpeedVideo) {
            activeSpeedVideo.playbackRate = 1.0;
            activeSpeedVideo = null;
        }
        if (activeSpeedIndicator) {
            activeSpeedIndicator.classList.remove('show');
            activeSpeedIndicator = null;
        }
        // Delay resetting isLongPress to catch the click event
        if (isLongPress) {
            setTimeout(() => { isLongPress = false; }, 100);
        }
    };

    // Global listeners for reliable reset
    window.addEventListener('pointerup', resetSpeed);
    window.addEventListener('pointercancel', resetSpeed);

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

                // Auto-open lightbox for better visibility
                setTimeout(() => openLightbox(foundProduct.image, foundProduct.name), 500);
            } else {
                // Product not found, redirect to 404
                window.location.href = '404.html';
            }
        } else {
            // Check for Category Link
            const categoryParam = urlParams.get('category');
            const subParam = urlParams.get('sub');

            if (categoryParam) {
                // Restore from URL params
                const sub = subParam || 'all';
                handleCategoryNavigation(categoryParam, sub, false);
                history.replaceState({ category: categoryParam, sub: sub }, '', window.location);
            } else {
                // Standard Load
                handleCategoryNavigation('all', 'all', false);
                history.replaceState({ category: 'all', sub: 'all' }, '', window.location);
            }
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
    // Renders the actual cards to the DOM (The "View" layer)
    function renderGrid(productsToDisplay) {
        productGrid.innerHTML = '';
        let hasContent = false;



        // 1. Render Products FIRST
        if (productsToDisplay.length > 0) {
            hasContent = true;
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
                    // Detect iOS
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

                    if (isIOS) {
                        // iOS Hack: Add #t=0.001 to src to force loading start frame
                        contentEl.src = product.image + '#t=0.001';
                    } else {
                        // Android/Desktop: Clean URL avoids decoding artifacts (green tint)
                        contentEl.src = product.image;
                    }

                    contentEl.className = 'card-image'; // Re-use same class for styling
                    contentEl.muted = true;
                    contentEl.loop = true;
                    contentEl.playsInline = true;
                    contentEl.setAttribute('webkit-playsinline', 'true');
                    contentEl.autoplay = false; // Disable initial autoplay
                    contentEl.controls = false;

                    // Lazy load strategy: preload none initially
                    contentEl.preload = 'none';

                    // Attach to observer
                    videoObserver.observe(contentEl);
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
                        console.log('Video clicked! Opening TikTok modal...');
                        console.log('typeof openVideoModal:', typeof openVideoModal);
                        console.log('typeof window.openVideoModal:', typeof window.openVideoModal);

                        const currentList = currentFilteredProducts.length > 0 ? currentFilteredProducts : products;
                        const index = currentList.findIndex(p => p === product);

                        // Try to call the function
                        try {
                            if (typeof openVideoModal === 'function') {
                                openVideoModal(product.image, currentList, index);
                            } else if (typeof window.openVideoModal === 'function') {
                                window.openVideoModal(product.image, currentList, index);
                            } else {
                                console.error('openVideoModal function not found!');
                                alert('Video player is not ready. Please refresh the page.');
                            }
                        } catch (error) {
                            console.error('Error calling openVideoModal:', error);
                            alert('Error opening video: ' + error.message);
                        }
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

            // Observer logic moved to end of function


            // 2. Render Subgroups (Folders) - REMOVED per user request to flatten view
            // Products are already shown above (productsToDisplay contains all recursive items)

        }

        if (!hasContent) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
        }

        // Assign directions and observe all cards currently in the grid
        const allCards = productGrid.querySelectorAll('.product-card');
        allCards.forEach((card, index) => {
            // Apply initial opacity/transform classes if not already present
            if (index % 2 === 0) {
                card.classList.add('slide-from-left');
            } else {
                card.classList.add('slide-from-right');
            }
            // Ensure opacity is 0 initially via class (handled by CSS usually, but let's be safe)
            // CSS likely has .product-card { opacity: 0; } or similar.

            cardVisibilityObserver.observe(card);
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
            // Push state for back button handling
            if (!history.state || history.state.modal !== 'cart') {
                history.pushState({ modal: 'cart' }, '', '');
            }
        };
    }

    // Function to close cart safely
    function closeCartModal() {
        if (!cartModal) return;
        cartModal.style.display = 'none';

        // Go back if we pushed state
        if (history.state && history.state.modal === 'cart') {
            history.back();
        }
    }

    if (closeCart) {
        closeCart.onclick = closeCartModal;
    }

    if (clearCartBtn) {
        clearCartBtn.onclick = clearCart;
    }

    if (cartModal) {
        cartModal.onclick = (e) => {
            if (e.target === cartModal) closeCartModal();
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
        window.globalCategoryTree = {};
        const tree = window.globalCategoryTree;
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

        // Add Home button with data-i18n
        let html = `<button class="filter-btn active" data-filter="all" data-sub="all" data-i18n="home">HOME</button>`;

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
            const lowerCat = cat.toLowerCase();
            const upperCat = cat.toUpperCase();

            if (tree[cat]) {
                // Has subcategories
                html += `
                    <div class="dropdown">
                        <button class="filter-btn parent-btn" data-filter="${cat}" data-sub="all">
                            <span data-i18n="${lowerCat}">${upperCat}</span> <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <a href="#" data-filter="${cat}" data-sub="all" data-i18n="all_${lowerCat}">All ${cat}</a>
                            ${renderSubMenuItems(cat, tree[cat])}
                        </div>
                    </div>`;
            } else {
                // No subcategories
                html += `<button class="filter-btn" data-filter="${cat}" data-sub="all" data-i18n="${lowerCat}">${upperCat}</button>`;
            }
        });

        navLinksContainer.innerHTML = html;
        attachNavListeners();

        // Language updated removed
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

                // Handle Mobile Nested Toggle (Accordion) for Submenus
                if (window.innerWidth <= 768) {
                    // Check if this link has a chevron-right icon (indicates it's a submenu parent)
                    if (el.tagName === 'A' && el.querySelector('i.fa-chevron-right')) {
                        const hasChildren = el.closest('.has-children');
                        if (hasChildren) {
                            e.stopPropagation(); // prevent closing main menu
                            hasChildren.classList.toggle('active');
                            // return; // Removed to allow filtering
                        }
                    }

                    // Handle Top-Level Mobile Dropdown Toggle (Ladies, Baby, etc)
                    if (el.classList.contains('parent-btn')) { // It's a top level parent
                        e.preventDefault();
                        e.stopPropagation();

                        const dropdown = el.closest('.dropdown');
                        const wasActive = dropdown.classList.contains('active');

                        // Close others
                        document.querySelectorAll('.dropdown.active').forEach(d => {
                            d.classList.remove('active');
                        });

                        // Toggle current (if it wasn't already active, open it)
                        // If it WAS active, we just closed it via the remove-all loop above
                        if (!wasActive) {
                            dropdown.classList.add('active');
                        }

                        // return; // Removed to allow filtering
                    }
                }

                // Visual Active State (skip on mobile for dropdowns to prevent toggle conflicts)
                // This is now handled by handleCategoryNavigation for consistency
                // if (window.innerWidth > 768) {
                //     document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

                //     if (el.classList.contains('filter-btn')) {
                //         el.classList.add('active');
                //     } else {
                //         const parentBtn = el.closest('.dropdown').querySelector('.filter-btn');
                //         if (parentBtn) parentBtn.classList.add('active');
                //     }
                // }

                // Filtering Data
                const filterCat = el.getAttribute('data-filter');
                const filterSub = el.getAttribute('data-sub');

                if (!filterCat) return;

                // Centralize navigation logic
                handleCategoryNavigation(filterCat, filterSub, true);

                // Close mobile menu if open ONLY IF it's a leaf node (no further sub-items/groups)
                // This allows parent items to expand without closing the whole menu bar
                const isTopParent = el.classList.contains('parent-btn');
                const isSubParent = el.tagName === 'A' && el.querySelector('.fa-chevron-right');

                if (!isTopParent && !isSubParent) {
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
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

    // Function to show/hide footer Home-only sections (About Section Only)
    function toggleFooterAbout(category) {
        const aboutSection = document.getElementById('footer-about-section');

        // Note: Info Bar (Payment/Awards) should remain visible everywhere as per latest user request
        // (Red circle marked only the About section as restricted)

        if (aboutSection) {
            // Show only on home page (category === 'all')
            if (category === 'all') {
                aboutSection.style.display = 'block';
                aboutSection.style.visibility = 'visible';
                aboutSection.style.height = 'auto';
            } else {
                aboutSection.style.setProperty('display', 'none', 'important');
                aboutSection.style.visibility = 'hidden';
                aboutSection.style.height = '0';
                aboutSection.style.margin = '0';
                aboutSection.style.padding = '0';
                aboutSection.style.border = 'none';
            }
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
        // Category Link Trigger (Nav, Cards, Breadcrumb)
        // Checks if it's a cat-link OR filter-btn
        if (e.target.classList.contains('cat-link') || e.target.closest('.filter-btn')) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target.classList.contains('cat-link') ? e.target : e.target.closest('.filter-btn');
            const filterCat = target.getAttribute('data-filter');
            const filterSub = target.getAttribute('data-sub');

            if (!filterCat) return;

            if (!filterCat) return;

            // Use centralized navigation function
            handleCategoryNavigation(filterCat, filterSub, true);

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });

    // Centralized Navigation Function with History Support
    function handleCategoryNavigation(filterCat, filterSub, addToHistory = true) {
        updateBreadcrumb(filterCat, filterSub);

        if (filterCat === 'all') {
            applyFilterAndRender(allProducts);
        } else {
            let filtered = allProducts.filter(p => p.category === filterCat);
            if (filterSub && filterSub !== 'all') {
                // Inclusive Filtering: Match exact subcategory OR any children (starts with "sub/")
                filtered = filtered.filter(p => {
                    if (!p.subcategory) return false;
                    const sub = p.subcategory.trim();
                    const filter = filterSub.trim();
                    return sub === filter || sub.startsWith(filter + '/');
                });
            }
            applyFilterAndRender(filtered);
        }

        // Update Navbar Visual State
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // Find button that matches current filter
        const navBtn = document.querySelector(`.filter-btn[data-filter="${filterCat}"]`);
        if (navBtn) navBtn.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // History Management
        if (addToHistory) {
            const url = new URL(window.location);
            url.searchParams.set('category', filterCat);
            if (filterSub && filterSub !== 'all') {
                url.searchParams.set('sub', filterSub);
            } else {
                url.searchParams.delete('sub');
            }
            // Clear product param if navigating categories
            url.searchParams.delete('product');

            history.pushState({ category: filterCat, sub: filterSub }, '', url);
        }
    }



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
            if (e.key === 'Enter') {
                performSearch();
                searchInput.blur(); // Close keyboard on mobile
            }
        });
    }



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
        // 1. Lightbox Closure
        if (lightbox && lightbox.style.display === 'flex') {
            closeLightboxUI();
        }

        // 2. Video Modal Closure (TikTok style)
        const videoModal = document.getElementById('video-modal');
        if (videoModal && videoModal.style.display === 'flex') {
            // Close logic that doesn't trigger history.back()
            videoModal.style.display = 'none';
            const videoContainer = document.getElementById('videoContainer');
            if (videoContainer) {
                const videos = videoContainer.querySelectorAll('video');
                videos.forEach(v => {
                    v.playbackRate = 1.0;
                    v.pause();
                    v.src = '';
                });
                videoContainer.innerHTML = '';
                resetSpeed();
            }
        }

        // 3. Cart Modal Closure
        const cartModalPop = document.getElementById('cart-modal');
        if (cartModalPop && cartModalPop.style.display === 'flex') {
            cartModalPop.style.display = 'none';
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
    // Make it globally accessible
    window.handleNewsletterSignup = handleNewsletterSignup;

    // Location Link Handler
    function openLocation(event) {
        event.preventDefault();
        // Open specific Google Maps location for CityFashionWear
        const mapsUrl = 'https://maps.app.goo.gl/beBVWEEzxhGrD69y5';
        window.open(mapsUrl, '_blank');
    }

    // Make it globally accessible
    // ========== REEL / TIKTOK-STYLE NAVIGATION SYSTEM ==========
    let currentReelIndex = 0;
    // === OLD VIDEO REEL/MODAL SYSTEM COMPLETELY REMOVED ===
    // New TikTok-style video modal implementation is at the end of this file

    // Helper: Fisher-Yates Shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }



    // Theme Toggle Initialization
    function initializeThemeToggle() {
        const checkbox = document.getElementById('theme-checkbox');
        if (!checkbox) return;

        // Load saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            checkbox.checked = true;
        }

        // Toggle event
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    /* --- Language Toggle & Translations --- */
    function initializeLanguageToggle() {
        console.log('[Lang] initializeLanguageToggle called');
        const langCheckbox = document.getElementById('lang-checkbox');
        console.log('[Lang] Checkbox found:', langCheckbox);
        if (!langCheckbox) return;

        // Dictionary
        const translations = {
            en: {
                home: "HOME",
                men: "MEN",
                ladies: "LADIES",
                baby: "BABY",
                all_men: "All Men",
                tshirts: "T-Shirts",
                all_ladies: "All Ladies",
                all_baby: "All Baby",
                all_products: "ALL PRODUCTS",
                search_placeholder: "Search by code, name, or category...",
                hero_title: "Premium Collection",
                hero_subtitle: "Discover the latest trends in city fashion.",
                loading: "Loading more products...",
                shop_facebook: "Shop on Facebook",
                shop_insta: "Shop on Insta",
                shop_tiktok: "Shop on TikTok",
                shop_whatsapp: "Shop on WhatsApp",
                contact_us: "Contact Us",
                address: "Besishahar, Lamjung, Nepal",
                open_daily: "Open Daily: 9 AM - 8 PM",
                about_title: "About CityFashionWear",
                about_tagline: "\"Your Love Wrapped in Our Fashion — Thank You!\"",
                about_desc: "At City Fashion Wear, we believe fashion is more than just clothing—it's a way to express love, celebrate connections, and make moments memorable. Based in Lamjung, Nepal, we're your one-stop destination for the latest trends in Men's, Women's, and Kids' fashion that combines quality you can trust with style you'll love.",
                values_title: "What We Stand For:",
                value_1_title: "Premium Quality",
                value_1_desc: "Every piece is carefully curated for durability and style",
                value_2_title: "Personal Connection",
                value_2_desc: "We treat each customer like family, not just a transaction",
                value_3_title: "Fashion as a Gift",
                value_3_desc: "Whether shopping for yourself or that special someone, we make every purchase feel personal",
                value_4_title: "Community-Driven",
                value_4_desc: "From Besishahar to across Nepal, we're building relationships, one outfit at a time",
                promise_title: "Our Promise to You:",
                promise_desc: "We're grateful for every customer who chooses City Fashion Wear. Your trust, feedback, and loyalty inspire us to bring you better collections, better service, and better fashion.",
                newsletter_title: "Newsletter",
                newsletter_desc: "Subscribe for exclusive offers & new collections!",
                email_placeholder: "Enter your email",
                newsletter_note: "Join our fashion family and never miss a deal!",
                we_accept: "We Accept",
                bank_transfer: "Bank Transfer",
                cod: "Cash on Delivery",
                awards_title: "Awards & Recognition",
                award_1: "Trusted by 50000+ Customers",
                award_2: "Top Fashion Seller - Lamjung",
                rights_reserved: "All rights reserved.",
                made_with: "Made with",
                in_nepal: "in Nepal",
                thank_you_msg: "Thank You for Being Part of Our Fashion Family! 🎉"
            },
            np: {
                home: "गृहपृष्ठ",
                men: "पुरुष",
                ladies: "महिला",
                baby: "बच्चा",
                all_men: "सबै पुरुष",
                tshirts: "टी-शर्ट",
                all_ladies: "सबै महिला",
                all_baby: "सबै बच्चा",
                all_products: "सबै उत्पादनहरू",
                search_placeholder: "कोड, नाम वा श्रेणी अनुसार खोज्नुहोस्...",
                hero_title: "उत्कृष्ट संकलन",
                hero_subtitle: "सहरी फेसनमा नवीनतम प्रचलनहरू पत्ता लगाउनुहोस्।",
                loading: "थप उत्पादनहरू लोड हुँदैछ...",
                shop_facebook: "फेसबुकमा किन्नुहोस्",
                shop_insta: "ईन्स्टामा किन्नुहोस्",
                shop_tiktok: "टिकटकमा किन्नुहोस्",
                shop_whatsapp: "ह्वाट्सएपमा किन्नुहोस्",
                contact_us: "सम्पर्क गर्नुहोस्",
                address: "बेंसीशहर, लमजुङ, नेपाल",
                open_daily: "खुल्ने समय: बिहान ९ देखि बेलुका ८ बजेसम्म",
                about_title: "CityFashionWear को बारेमा",
                about_tagline: "\"हाम्रो फेसनमा बेरिएको तपाईंको माया — धन्यवाद!\"",
                about_desc: "City Fashion Wear मा, हामी विश्वास गर्छौं कि फेसन केवल लुगा मात्र होइन—यो माया व्यक्त गर्ने, सम्बन्धहरू मनाउने र पलहरूलाई अविस्मरणीय बनाउने एउटा माध्यम हो। लमजुङ, नेपालमा आधारित, हामी पुरुष, महिला र बालबालिकाको फेसनका नवीनतम प्रचलनहरूका लागि तपाईंको एक-स्टप गन्तव्य हौं, जसले तपाईंले विश्वास गर्न सक्ने गुणस्तर र तपाईंलाई मन पर्ने शैलीलाई संयोजन गर्दछ।",
                values_title: "हाम्रा मान्यताहरू:",
                value_1_title: "उत्कृष्ट गुणस्तर",
                value_1_desc: "हरेक टुक्रा टिकाउपन र शैलीका लागि होसियारीपूर्वक छानिएको छ",
                value_2_title: "व्यक्तिगत सम्बन्ध",
                value_2_desc: "हामी प्रत्येक ग्राहकलाई कारोबार मात्र नभई परिवारजस्तै व्यवहार गर्छौं",
                value_3_title: "उपहारको रूपमा फेसन",
                value_3_desc: "चाहे आफ्नै लागि होस् वा विशेष व्यक्तिका लागि, हामी हरेक खरिदलाई व्यक्तिगत बनाउँछौं",
                value_4_title: "समुदायमा आधारित",
                value_4_desc: "बेंसीशहरदेखि नेपालभरि, हामी एक पटकमा एउटा पहिरनमार्फत सम्बन्ध गाँसिरहेका छौं",
                promise_title: "तपाईंलाई हाम्रो वाचा:",
                promise_desc: "City Fashion Wear रोज्नुहुने हरेक ग्राहकप्रति हामी आभारी छौं। तपाईंको विश्वास, प्रतिक्रिया र वफादारीले हामीलाई अझ राम्रा संकलन, सेवा र फेसन ल्याउन प्रेरित गर्छ।",
                newsletter_title: "समाचार पत्र",
                newsletter_desc: "विशेष अफर र नयाँ संकलनका लागि सब्सक्राइब गर्नुहोस्!",
                email_placeholder: "तपाईंको इमेल लेख्नुहोस्",
                newsletter_note: "हाम्रो फेसन परिवारमा सामेल हुनुहोस् र कुनै पनि अफर नछुटाउनुहोस्!",
                we_accept: "हामी स्वीकार गर्छौं",
                bank_transfer: "बैंक ट्रान्सफर",
                cod: "डेलिभरीमा नगद भुक्तानी",
                awards_title: "पुरस्कार र सम्मान",
                award_1: "५००००+ ग्राहकहरूद्वारा विश्वास गरिएको",
                award_2: "लमजुङको उत्कृष्ट फेसन बिक्रेता",
                rights_reserved: "सर्वाधिकार सुरक्षित।",
                made_with: "माया",
                in_nepal: "नेपालमा बनाइएको",
                thank_you_msg: "हाम्रो फेसन परिवारको हिस्सा बन्नुभएकोमा धन्यवाद! 🎉"
            }
        };

        const updateLanguage = (lang) => {
            const data = translations[lang];
            console.log('[Lang] updateLanguage called with:', lang);
            console.log('[Lang] Data object exists?', !!data);
            if (data) console.log('[Lang] Sample: data.home =', data.home);

            // Update elements with data-i18n attribute
            const elements = document.querySelectorAll('[data-i18n]');
            console.log('[Lang] Found', elements.length, 'elements with data-i18n');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (data[key]) {
                    console.log('[Lang] Updating', key, '→', data[key]);
                    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                        el.placeholder = data[key];
                    } else {
                        el.textContent = data[key];
                    }
                }
            });

            // Persist
            localStorage.setItem('language', lang);
        };



        // Load saved preference
        const savedLang = localStorage.getItem('language') || 'en';
        console.log('[Lang] Saved language:', savedLang);
        if (savedLang === 'np') {
            langCheckbox.checked = true;
        } else {
            langCheckbox.checked = false;
        }
        // Force update on init
        console.log('[Lang] Calling updateLanguage with:', savedLang);
        updateLanguage(savedLang);

        // Event Listener
        langCheckbox.addEventListener('change', () => {
            console.log('[Lang] Checkbox changed, checked:', langCheckbox.checked);
            if (langCheckbox.checked) {
                updateLanguage('np');
            } else {
                updateLanguage('en');
            }
        });
    }
    console.log('App.js Loaded');



    // --- Seasonal Product Sorting ---
    async function detectSeason() {
        console.log('[Season] Detecting user location...');
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            console.log('[Season] Location:', data.country_name, data.latitude);

            const latitude = data.latitude;
            const month = new Date().getMonth(); // 0-11 (Jan is 0)

            // Determine Hemisphere
            const isNorth = latitude >= 0;

            // Determine Season (Simplified)
            // Winter: Dec, Jan, Feb
            // Summer: Jun, Jul, Aug
            let season = '';

            if (month === 11 || month === 0 || month === 1) { // Dec, Jan, Feb
                season = isNorth ? 'Winter' : 'Summer';
            } else if (month >= 5 && month <= 7) { // Jun, Jul, Aug
                season = isNorth ? 'Summer' : 'Winter';
            } else {
                season = 'Transition'; // Spring/Autumn
            }

            console.log('[Season] Detected Season:', season);

            if (season === 'Winter' || season === 'Summer') {
                sortProductsBySeason(season);
            }

        } catch (error) {
            console.warn('[Season] Failed to detect location:', error);
            // Default to Winter (Nepal Context) or do nothing
        }
    }

    function sortProductsBySeason(season) {
        console.log('[Season] Sorting products for:', season);

        // Prioritize items containing the season keyword in their subcategory
        // We need to modify the global 'allProducts' array and re-render
        if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
            allProducts.sort((a, b) => {
                const aSub = (a.subcategory || '').toLowerCase();
                const bSub = (b.subcategory || '').toLowerCase();
                const term = season.toLowerCase();

                const aHas = aSub.includes(term);
                const bHas = bSub.includes(term);

                if (aHas && !bHas) return -1; // a comes first
                if (!aHas && bHas) return 1;  // b comes first
                return 0; // maintain relative order
            });

            // Re-render
            console.log('[Season] Re-rendering grid...');
            applyFilterAndRender(allProducts);
        }
    }

    // Initialize Seasonal Check (Async)
    detectSeason();

    console.log('App Initialized Fully');

    // ============================================
    // TikTok-Style Video Modal Implementation
    // ============================================

    // ============================================

    function toggleAutoScroll() {
        isAutoScrollEnabled = !isAutoScrollEnabled;
        const btn = document.getElementById('auto-scroll-toggle');
        if (!btn) return;

        const status = btn.querySelector('.auto-scroll-status');

        if (isAutoScrollEnabled) {
            btn.classList.add('active');
            if (status) status.textContent = 'ON';
        } else {
            btn.classList.remove('active');
            if (status) status.textContent = 'OFF';
        }
    }

    // Format numbers like TikTok (1234 -> 1.2K)
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    }

    // Video likes storage (localStorage)
    function getVideoLikes() {
        const likes = localStorage.getItem('videoLikes');
        return likes ? JSON.parse(likes) : {};
    }

    function saveVideoLikes(likesData) {
        localStorage.setItem('videoLikes', JSON.stringify(likesData));
    }

    // Create a single video element for TikTok-style view
    function createTikTokVideoElement(product, index, allVideos) {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video';
        videoDiv.dataset.index = index;

        // Check if user has liked this video
        const likes = getVideoLikes();
        const likeCount = likes[product.name] || 0;
        const isLiked = localStorage.getItem(`liked_${product.name}`) === 'true';

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const videoSrc = isIOS ? product.image + '#t=0.001' : product.image;

        videoDiv.innerHTML = `
        <!-- 2x Speed Indicator -->
        <div class="speed-indicator">
            <span class="material-icons">fast_forward</span>
            <span>2x Speed</span>
        </div>

        <video class="video__player" 
               playsinline 
               webkit-playsinline="true" 

               data-index="${index}" 
               src="${videoSrc}"
               controls="controls">
        </video>



        
        <!-- Sidebar Actions -->
        <section class="videoSideBar">
            <div class="videoSideBar__options like-btn ${isLiked ? 'liked' : ''}" data-product="${product.name}">
                <span class="material-icons">${isLiked ? 'favorite' : 'favorite_border'}</span>
                <p class="like-count">${formatNumber(likeCount)}</p>
            </div>
            <div class="videoSideBar__options cart-btn" data-index="${index}">
                <span class="material-icons">shopping_cart</span>
                <p>Cart</p>
            </div>
            <div class="videoSideBar__options share-btn" data-product="${product.name}">
                <i class="fab fa-whatsapp" style="font-size: 32px;"></i>
                <p>Order</p>
            </div>
        </section>
        
        <!-- Footer Info -->
        <div class="videoFooter">
            <div class="videoFooter__text">
                <h3>@CityFashionWear</h3>
                <p class="videoFooter__description">${product.name}</p>
                <div class="videoFooter__music">
                    <span class="material-icons">music_note</span>
                    <div class="videoFooterMusic__text">
                        <p>${product.category}${product.subcategory ? ' • ' + product.subcategory : ''}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

        // Handle Auto Scroll
        const video = videoDiv.querySelector('video');
        if (video) {
            video.onended = () => {
                const videoContainer = document.getElementById('videoContainer');
                if (!videoContainer) return;

                if (isAutoScrollEnabled) {
                    const videos = videoContainer.querySelectorAll('.video');
                    const currentScroll = videoContainer.scrollTop;
                    const videoHeight = window.innerHeight;
                    const currentIndex = Math.round(currentScroll / videoHeight);

                    let nextIndex = currentIndex + 1;
                    if (nextIndex >= videos.length) {
                        nextIndex = 0; // Loop back to start
                    }

                    const nextVideoContainer = videos[nextIndex];
                    if (nextVideoContainer) {
                        nextVideoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

                        // Play the next video after scroll finishes
                        setTimeout(() => {
                            const nextVideo = nextVideoContainer.querySelector('.video__player');
                            if (nextVideo) {
                                nextVideo.muted = false;
                                nextVideo.volume = 1.0;
                                nextVideo.play().catch(console.error);
                            }
                        }, 600);
                    }
                } else {
                    // Auto-scroll is OFF, so loop the same video
                    video.currentTime = 0;
                    video.play().catch(console.error);
                }
            };

            // Force unmute and full volume on the element itself
            video.muted = false;
            video.volume = 1.0;
        }

        return videoDiv;
    }


    // Open the TikTok-style video modal
    function openVideoModal(startProductImage, productList, startIndex) {
        const modal = document.getElementById('video-modal');
        const videoContainer = document.getElementById('videoContainer');

        if (!modal || !videoContainer) {
            return;
        }


        // Filter to only video products
        const videoProducts = productList.filter(p => {
            const isVideo = p.image.toLowerCase().endsWith('.mov') || p.image.toLowerCase().endsWith('.mp4');
            return isVideo;
        });



        if (videoProducts.length === 0) {
            console.error('No video products found');
            return;
        }



        // Find the correct start index in video-only list
        const actualStartIndex = videoProducts.findIndex(p => p.image === startProductImage);
        const scrollToIndex = actualStartIndex >= 0 ? actualStartIndex : 0;

        // Clear and rebuild the video container
        videoContainer.innerHTML = '';
        videoContainer.tabIndex = -1; // Make it focusable for keyboard events
        videoProducts.forEach((product, index) => {
            const videoElement = createTikTokVideoElement(product, index, videoProducts);
            videoContainer.appendChild(videoElement);
        });

        // Show modal
        modal.style.display = 'flex';
        videoContainer.focus(); // Focus for immediate keyboard support


        // Push history state for back button support
        if (!history.state || history.state.modal !== 'video') {
            history.pushState({ modal: 'video' }, '', '');
        }

        // Setup observers and interactions immediately
        setupTikTokVideoInteractions(videoProducts);
        setupTikTokVideoScrollObserver();

        // Scroll to the starting video
        const startVideoContainer = videoContainer.children[scrollToIndex];
        if (startVideoContainer) {
            startVideoContainer.scrollIntoView({ behavior: 'instant', block: 'start' });

            // Explicitly play and unmute the first video
            const firstVideo = startVideoContainer.querySelector('.video__player');
            if (firstVideo) {
                firstVideo.muted = false;
                firstVideo.volume = 1.0;
                // Use a short delay only if necessary, but try immediately first
                firstVideo.play().catch(err => {
                    console.log('First video play blocked, trying with muted=true as fallback:', err);
                    // If it really fails, we might have to mute, but let's try to stay unmuted
                });
            }
        }
    }

    // Setup all video interactions (tap, like, cart, share)
    function setupTikTokVideoInteractions(videoProducts) {
        const videoContainer = document.getElementById('videoContainer');

        // Navigation gestures
        let navTouchStartY = 0;
        let isNavigating = false;

        videoContainer.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            navTouchStartY = touch.clientY;
        }, { passive: true });

        // Handle vertical navigation swipe
        videoContainer.addEventListener('touchend', (e) => {
            if (isNavigating) return;

            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = navTouchStartY - touchEndY;
            const threshold = 50; // Minimum swipe distance

            if (Math.abs(deltaY) > threshold) {
                isNavigating = true;
                const videoHeight = window.innerHeight;
                const currentScroll = videoContainer.scrollTop;
                const currentIndex = Math.round(currentScroll / videoHeight);
                const videos = videoContainer.querySelectorAll('.video');

                let targetIndex = currentIndex;
                if (deltaY > 0) { // Swipe up -> Next
                    targetIndex = Math.min(videos.length - 1, currentIndex + 1);
                } else { // Swipe down -> Prev
                    targetIndex = Math.max(0, currentIndex - 1);
                }

                videoContainer.scrollTo({
                    top: targetIndex * videoHeight,
                    behavior: 'smooth'
                });

                // Re-enable navigation after transition
                setTimeout(() => { isNavigating = false; }, 500);
            }
        }, { passive: true });




        // Like button functionality
        videoContainer.addEventListener('click', (e) => {
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                e.stopPropagation();
                const productName = likeBtn.dataset.product;
                const icon = likeBtn.querySelector('.material-icons');
                const count = likeBtn.querySelector('.like-count');
                const likes = getVideoLikes();

                if (likeBtn.classList.contains('liked')) {
                    // Unlike
                    likeBtn.classList.remove('liked');
                    icon.textContent = 'favorite_border';
                    likes[productName] = Math.max(0, (likes[productName] || 0) - 1);
                    localStorage.removeItem(`liked_${productName}`);
                } else {
                    // Like
                    likeBtn.classList.add('liked');
                    icon.textContent = 'favorite';
                    likes[productName] = (likes[productName] || 0) + 1;
                    localStorage.setItem(`liked_${productName}`, 'true');
                }

                count.textContent = formatNumber(likes[productName]);
                saveVideoLikes(likes);
            }
        });

        // Add to cart button
        videoContainer.addEventListener('click', (e) => {
            const cartBtn = e.target.closest('.cart-btn');
            if (cartBtn) {
                e.stopPropagation();
                const index = parseInt(cartBtn.dataset.index);
                const product = videoProducts[index];
                if (product && typeof addToCart === 'function') {
                    addToCart(product);
                    // Visual feedback
                    const icon = cartBtn.querySelector('.material-icons');
                    icon.classList.add('fa-bounce');
                    setTimeout(() => icon.classList.remove('fa-bounce'), 1000);
                }
            }
        });

        // Keyboard navigation is now handled by a single persistent listener
        // attached at the end of DOMContentLoaded to prevent accumulation.

        // Speed hold is now handled by the global trackers and listeners 
        // initialized at the top of DOMContentLoaded
        videoContainer.addEventListener('pointerdown', (e) => {
            const shareBtn = e.target.closest('.share-btn');
            if (shareBtn) {
                isLongPress = false;
                const video = e.target.closest('.video').querySelector('.video__player');
                const speedIndicator = e.target.closest('.video').querySelector('.speed-indicator');

                if (video && speedIndicator) {
                    activeSpeedVideo = video;
                    activeSpeedIndicator = speedIndicator;

                    // Start timer to detect long press
                    speedHoldTimer = setTimeout(() => {
                        isLongPress = true;
                        if (activeSpeedVideo) activeSpeedVideo.playbackRate = 2.0;
                        if (activeSpeedIndicator) activeSpeedIndicator.classList.add('show');
                    }, 200); // 200ms threshold for 2x speed
                }
            }
        });

        // Also reset if user scrolls away
        videoContainer.addEventListener('scroll', resetSpeed, { passive: true });

        videoContainer.addEventListener('click', (e) => {
            const shareBtn = e.target.closest('.share-btn');
            if (shareBtn) {
                e.stopPropagation();

                // If it was a long press (2x speed), don't open the share link
                if (isLongPress) {
                    isLongPress = false;
                    return;
                }

                const productName = shareBtn.dataset.product;
                const baseUrl = window.location.href.split('?')[0];
                const productUrl = `${baseUrl}?product=${encodeURIComponent(productName)}`;
                const phone = "9779846181027";
                const msg = encodeURIComponent(`Hello, I want to buy: ${productName} See it here: ${productUrl}`);
                window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
            }
        });


    }

    // Setup IntersectionObserver for auto-play on scroll
    function setupTikTokVideoScrollObserver() {
        const videoContainer = document.getElementById('videoContainer');

        const observerOptions = {
            root: videoContainer,
            threshold: 0.6
        };

        const tikTokVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('.video__player');
                if (entry.isIntersecting) {
                    // Play video when in view
                    video.muted = false;
                    video.volume = 1.0;
                    video.play().catch(err => {
                        console.log('Autoplay prevented, trying muted:', err);
                        // If blocked, some browsers allow muted autoplay as fallback
                        // but the user wants unmuted, so we just log it.
                    });

                } else {
                    // Pause video when out of view
                    video.pause();
                }
            });
        }, observerOptions);

        // Observe all video containers
        const allVideoContainers = document.querySelectorAll('.video');
        allVideoContainers.forEach(container => {
            tikTokVideoObserver.observe(container);
        });
    }

    // Close video modal
    function closeVideoModal() {
        // If we're coming from a UI button click (not popstate), we go back in history
        // This will trigger the popstate listener which handles the actual UI closing
        if (history.state && history.state.modal === 'video') {
            history.back();
        } else {
            // Fallback: If no history state but modal is open, close manually
            const modal = document.getElementById('video-modal');
            const videoContainer = document.getElementById('videoContainer');
            if (modal) modal.style.display = 'none';
            if (videoContainer) {
                const videos = videoContainer.querySelectorAll('video');
                videos.forEach(v => {
                    v.playbackRate = 1.0; // Ensure speed is reset on close
                    v.pause();
                    v.src = '';
                });
                videoContainer.innerHTML = '';
                resetSpeed(); // Clear variables
            }
        }
    }



    // Single persistent Keyboard navigation handler
    const handleKeyDown = (e) => {
        const modal = document.getElementById('video-modal');
        const videoContainer = document.getElementById('videoContainer');
        if (!modal || modal.style.display !== 'flex' || !videoContainer) return;

        const videos = videoContainer.querySelectorAll('.video');
        if (videos.length === 0) return;

        const currentScroll = videoContainer.scrollTop;
        const videoHeight = window.innerHeight;
        const currentIndex = Math.round(currentScroll / videoHeight);

        if (e.key === 'ArrowDown') {
            if (currentIndex < videos.length - 1) {
                e.preventDefault();
                videos[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (e.key === 'ArrowUp') {
            if (currentIndex > 0) {
                e.preventDefault();
                videos[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (e.key === ' ' || e.key === 'k') { // Space or K to play/pause
            e.preventDefault();
            const currentVideo = videos[currentIndex].querySelector('.video__player');
            if (currentVideo) {
                if (currentVideo.paused) {
                    currentVideo.muted = false;
                    currentVideo.volume = 1.0;
                    currentVideo.play();
                } else {
                    currentVideo.pause();
                }
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    // --- Global Function Assignments (Expose to HTML) ---
    // Assigned at the end to ensure all functions are defined
    window.toggleAutoScroll = toggleAutoScroll;
    window.openVideoModal = openVideoModal;
    window.closeVideoModal = closeVideoModal;
    window.openLocation = openLocation;
    window.handleNewsletterSignup = handleNewsletterSignup;
    window.downloadSearchHistory = downloadSearchHistory;
    window.toggleVideoSpeed = toggleVideoSpeed;

    console.log('TikTok video modal functions initialized');

}); // End of DOMContentLoaded
