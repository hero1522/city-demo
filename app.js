document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const breadcrumbContainer = document.getElementById('breadcrumb');

    let allProducts = [];

    // Use the global 'products' variable from products.js
    if (typeof products !== 'undefined') {
        allProducts = products;
        buildDynamicNavbar(allProducts);
        // Initial view
        updateBreadcrumb('all', 'all');
        renderProducts(allProducts);
    } else {
        console.error('products.js not loaded');
        productGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Error: products.js not found. Please run update_gallery.ps1</p>';
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
                html += `<span class="cat-link" data-filter="${category}" data-sub="all">${category}</span> <span class="separator">/</span> `;
                html += `<span class="cat-link active" data-filter="${category}" data-sub="${subcategory}">${subcategory}</span>`;
            }
        }
        breadcrumbContainer.innerHTML = html;
    }

    function buildDynamicNavbar(products) {
        const navLinksContainer = document.querySelector('.nav-links');

        // Extract unique categories and their subcategories
        const structure = {};

        products.forEach(p => {
            if (!structure[p.category]) {
                structure[p.category] = new Set();
            }
            if (p.subcategory && p.subcategory !== 'all') {
                structure[p.category].add(p.subcategory);
            }
        });

        // Build HTML
        let html = `<button class="filter-btn active" data-filter="all" data-sub="all">All</button>`;

        for (const [category, subcats] of Object.entries(structure)) {
            // Check if we have subcategories to make a dropdown
            if (subcats.size > 0) {
                // Dropdown
                let subLinks = `<a href="#" data-filter="${category}" data-sub="all">All ${category}</a>`;
                subcats.forEach(sub => {
                    subLinks += `<a href="#" data-filter="${category}" data-sub="${sub}">${sub}</a>`;
                });

                html += `
                <div class="dropdown">
                    <!-- Parent button is just a label now, click does nothing -->
                    <button class="filter-btn parent-btn">
                        ${category} <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-content">
                        ${subLinks}
                    </div>
                </div>`;
            } else {
                // Simple Button
                html += `<button class="filter-btn" data-filter="${category}" data-sub="all">${category}</button>`;
            }
        }

        navLinksContainer.innerHTML = html;
        attachNavListeners();
    }

    function attachNavListeners() {
        const allFilterElements = document.querySelectorAll('.filter-btn, .dropdown-content a');

        // Filter Logic
        allFilterElements.forEach(el => {
            el.addEventListener('click', (e) => {
                const isLink = el.tagName === 'A';
                if (isLink) e.preventDefault();

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

                // If no filter data (e.g. Nav Parent Button), do nothing
                if (!filterCat) return;

                // Update Breadcrumb
                updateBreadcrumb(filterCat, filterSub);

                if (filterCat === 'all') {
                    renderProducts(allProducts);
                } else {
                    let filtered = allProducts.filter(p => p.category === filterCat);
                    if (filterSub && filterSub !== 'all') {
                        filtered = filtered.filter(p => p.subcategory === filterSub);
                    }
                    renderProducts(filtered);
                }
            });
        });
    }

    function renderProducts(products) {
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Create interactive links logic
            // Main Category Link
            const mainCatHtml = `<span class="cat-link main-cat" data-filter="${product.category}" data-sub="all">${product.category}</span>`;

            // Sub Category Link (if exists)
            let subCatHtml = '';
            if (product.subcategory && product.subcategory !== 'all') {
                subCatHtml = ` <i class="fas fa-chevron-right separator-icon"></i> <span class="cat-link" data-filter="${product.category}" data-sub="${product.subcategory}">${product.subcategory}</span>`;
            }

            // Construct Message for WhatsApp
            const msg = encodeURIComponent(`Hello, I want to buy this product: ${product.name}`);

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

    // Attach click event to dynamically created images (Lightbox) and Category Links (Filtering)
    document.getElementById('productGrid').addEventListener('click', (e) => {
        // Lightbox Trigger
        if (e.target.classList.contains('card-image')) {
            openLightbox(e.target.src);
            return; // Important to return here
        }

        // Category Link Trigger
        if (e.target.classList.contains('cat-link')) {
            // Stop propagation to prevent any other card clicks (safe measure)
            e.stopPropagation();
            e.preventDefault();

            const filterCat = e.target.getAttribute('data-filter');
            const filterSub = e.target.getAttribute('data-sub');

            // Find global listener for breadcrumb updates if needed, but we can just call logic here
            // Re-using the logic from global document listener here for safety if propagation stops

            updateBreadcrumb(filterCat, filterSub);

            // Filter Logic
            if (filterCat === 'all') {
                renderProducts(allProducts);
            } else {
                let filtered = allProducts.filter(p => p.category === filterCat);
                if (filterSub && filterSub !== 'all') {
                    filtered = filtered.filter(p => p.subcategory === filterSub);
                }
                renderProducts(filtered);
            }

            // Update Navbar Visual State
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(b => b.classList.remove('active'));
            const navBtn = document.querySelector(`.filter-btn[data-filter="${filterCat}"][data-sub="all"]`);
            if (navBtn) navBtn.classList.add('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Global listener for Breadcrumb links (since they are outside productGrid)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cat-link') && !document.getElementById('productGrid').contains(e.target)) {
            e.preventDefault();
            const filterCat = e.target.getAttribute('data-filter');
            const filterSub = e.target.getAttribute('data-sub');

            updateBreadcrumb(filterCat, filterSub);

            if (filterCat === 'all') {
                renderProducts(allProducts);
            } else {
                let filtered = allProducts.filter(p => p.category === filterCat);
                if (filterSub && filterSub !== 'all') {
                    filtered = filtered.filter(p => p.subcategory === filterSub);
                }
                renderProducts(filtered);
            }

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
            renderProducts(allProducts);
            updateBreadcrumb('all', 'all');

            // Update Nav Visuals
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    lightbox.style.display = 'flex';
    lightboxImg.src = imageSrc;
    currentZoom = 1;
    lightboxImg.style.transform = `scale(${currentZoom})`;
}

// Close Lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
}

// Event Listeners for closing
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
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
