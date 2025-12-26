document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const breadcrumbContainer = document.getElementById('breadcrumb');
    const paginationContainer = document.getElementById('pagination');

    let allProducts = [];
    let currentFilteredProducts = [];
    let currentPage = 1;
    const itemsPerPage = 30;

    // Use the global 'products' variable from products.js
    if (typeof products !== 'undefined') {
        allProducts = products;

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
                setTimeout(() => openLightbox(foundProduct.image), 500);
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

        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

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

            // Construct Message for WhatsApp with Direct Link
            const baseUrl = window.location.href.split('?')[0];
            const productUrl = `${baseUrl}?product=${encodeURIComponent(product.name)}`;
            const msg = encodeURIComponent(`Hello, I want to buy: ${product.name}\n\nSee it here: ${productUrl}`);

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${product.image}" alt="${product.name}" class="card-image" loading="lazy">
                    <div class="name-tag">${product.name}</div>
                </div>
                <div class="card-content">
                    <div class="card-category">
                        ${mainCatHtml}
                        ${subCatHtml}
                    </div>
                    
                    <div class="shop-now-row">
                        <a href="https://m.me/cityfashionlamjung" target="_blank" title="Chat on Facebook" class="shop-icon"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://ig.me/m/cityfashionlamjung" target="_blank" title="Chat on Instagram" class="shop-icon"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.tiktok.com/@cityfashion_wear" target="_blank" title="Visit TikTok" class="shop-icon"><i class="fab fa-tiktok"></i></a>
                        <a href="https://wa.me/9779846181027?text=${msg}" target="_blank" title="Order via WhatsApp" class="shop-icon"><i class="fab fa-whatsapp"></i></a>
                    </div>
                </div>
            `;

            productGrid.appendChild(card);
        });
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
    }

    // --- Global Click Listeners ---

    // Attach click event to dynamically created images (Lightbox) and Category Links (Filtering)
    document.addEventListener('click', (e) => {
        // Lightbox Trigger
        if (e.target.classList.contains('card-image')) {
            openLightbox(e.target.src);
            return;
        }

        // Category Link Trigger (Nav, Cards, Breadcrumb)
        // Checks if it's a cat-link
        if (e.target.classList.contains('cat-link')) {
            e.preventDefault();
            e.stopPropagation();

            const filterCat = e.target.getAttribute('data-filter');
            const filterSub = e.target.getAttribute('data-sub');

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
            const navBtn = document.querySelector(`.filter-btn[data-filter="${filterCat}"][data-sub="all"]`);
            if (navBtn) navBtn.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });
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

});

// Lightbox Functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');

let currentZoom = 1;

// Open Lightbox
function openLightbox(imageSrc) {
    if (!lightbox) return;
    lightbox.style.display = 'flex';
    lightboxImg.src = imageSrc;
    currentZoom = 1;
    lightboxImg.style.transform = `scale(${currentZoom})`;

    // Mobile Fix: Push history state so 'Back' button closes it
    history.pushState({ lightboxOpen: true }, '', '#lightbox');
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
        e.preventDefault(); // Prevent page scrolling

        // Zoom sensitivity
        const delta = e.deltaY * -0.001;
        const newZoom = currentZoom + delta;

        // Limit zoom range
        if (newZoom > 0.5 && newZoom < 5) {
            currentZoom = newZoom;
            lightboxImg.style.transform = `scale(${currentZoom})`;
        }
    });
}
