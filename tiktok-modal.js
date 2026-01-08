
// ============================================
// TikTok-Style Video Modal Implementation
// ============================================

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
function createVideoElement(product, index, allVideos) {
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
        <video class="video__player" loop muted playsinline webkit-playsinline="true" 
               data-index="${index}" src="${videoSrc}">
        </video>
        
        <!-- Play/Pause Indicator -->
        <div class="play-pause-indicator">
            <span class="material-icons">play_arrow</span>
        </div>
        
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
                <span class="material-icons">share</span>
                <p>Share</p>
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

    return videoDiv;
}

// Open the TikTok-style video modal
function openVideoModal(startProductImage, productList, startIndex) {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('videoContainer');

    if (!modal || !videoContainer) {
        console.error('Video modal elements not found');
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

    // Create all video elements
    videoProducts.forEach((product, index) => {
        const videoElement = createVideoElement(product, index, videoProducts);
        videoContainer.appendChild(videoElement);
    });

    // Show modal
    modal.style.display = 'flex';

    // Push history state for back button support
    if (!history.state || history.state.modal !== 'video') {
        history.pushState({ modal: 'video' }, '', '');
    }

    // Setup observers and interactions
    setTimeout(() => {
        setupVideoInteractions(videoProducts);
        setupVideoScrollObserver();

        // Scroll to the starting video
        const startVideo = videoContainer.children[scrollToIndex];
        if (startVideo) {
            startVideo.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }, 100);
}

// Setup all video interactions (tap, like, cart, share)
function setupVideoInteractions(videoProducts) {
    const videoContainer = document.getElementById('videoContainer');

    // Tap to play/pause
    videoContainer.addEventListener('click', (e) => {
        const video = e.target.closest('.video__player');
        if (video && !e.target.closest('.videoSideBar') && !e.target.closest('.videoFooter')) {
            const indicator = video.nextElementSibling;
            const icon = indicator.querySelector('.material-icons');

            if (video.paused) {
                video.play();
                icon.textContent = 'play_arrow';
            } else {
                video.pause();
                icon.textContent = 'pause';
            }

            // Show indicator briefly
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 500);
        }
    });

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

    // Share button
    videoContainer.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            e.stopPropagation();
            const productName = shareBtn.dataset.product;
            const baseUrl = window.location.href.split('?')[0];
            const productUrl = `${baseUrl}?product=${encodeURIComponent(productName)}`;
            const msg = encodeURIComponent(`Check out this product: ${productName}\n\n${productUrl}`);
            window.open(`https://wa.me/?text=${msg}`, '_blank');
        }
    });
}

// Setup IntersectionObserver for auto-play on scroll
function setupVideoScrollObserver() {
    const videoContainer = document.getElementById('videoContainer');

    const observerOptions = {
        root: videoContainer,
        threshold: 0.6
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('.video__player');
            if (entry.isIntersecting) {
                // Play video when in view
                video.play().catch(err => console.log('Autoplay prevented:', err));
            } else {
                // Pause video when out of view
                video.pause();
            }
        });
    }, observerOptions);

    // Observe all video containers
    const allVideoContainers = document.querySelectorAll('.video');
    allVideoContainers.forEach(container => {
        videoObserver.observe(container);
    });
}

// Close video modal
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('videoContainer');

    if (modal) {
        modal.style.display = 'none';
    }

    // Pause all videos and clear
    if (videoContainer) {
        const videos = videoContainer.querySelectorAll('video');
        videos.forEach(v => {
            v.pause();
            v.src = '';
        });
        videoContainer.innerHTML = '';
    }

    // Handle history
    if (history.state && history.state.modal === 'video') {
        history.back();
    }
}

// Make functions globally accessible
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
