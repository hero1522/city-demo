// Sample video data (you can replace these URLs with your own videos)
const videos = [
    {
        url: 'https://v3.cdnpk.net/videvo_files/video/free/video0467/large_watermarked/_import_61516692993d71.66119930_FPpreview.mp4',
        username: 'fashionista',
        description: 'Check out this amazing outfit! 🔥 #fashion #style',
        music: 'Original Sound - fashionista',
        likes: 1234,
        comments: 89,
        shares: 45
    },
    {
        url: 'https://v3.cdnpk.net/videvo_files/video/free/video0455/large_watermarked/_import_607d9a6f039078.38336240_FPpreview.mp4',
        username: 'travelvibes',
        description: 'Sunset views are unmatched 🌅 #travel #sunset',
        music: 'Chill Vibes - Music',
        likes: 5678,
        comments: 234,
        shares: 123
    },
    {
        url: 'https://v3.cdnpk.net/videvo_files/video/free/video0456/large_watermarked/_import_607d9ed625fb37.02145324_FPpreview.mp4',
        username: 'dancemoves',
        description: 'New dance challenge! Can you do it? 💃 #dance #challenge',
        music: 'Trending Audio - Dance Hits',
        likes: 9876,
        comments: 456,
        shares: 234
    },
    {
        url: 'https://v3.cdnpk.net/videvo_files/video/free/video0484/large_watermarked/_import_62a2ac3f8bd5e9.26387948_FPpreview.mp4',
        username: 'foodlover',
        description: 'Making the best pizza ever! 🍕 #food #cooking',
        music: 'Cooking Beats - Chef Sound',
        likes: 3456,
        comments: 178,
        shares: 89
    },
    {
        url: 'https://v3.cdnpk.net/videvo_files/video/free/video0485/large_watermarked/_import_62a2ad35a6f1e3.09374053_FPpreview.mp4',
        username: 'naturelove',
        description: 'Nature is beautiful 🌿 #nature #peaceful',
        music: 'Peaceful Sounds - Nature',
        likes: 2345,
        comments: 123,
        shares: 67
    }
];

const videoContainer = document.getElementById('videoContainer');
let currentVideoIndex = 0;

// Create video element
function createVideoElement(videoData, index) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'video';
    videoDiv.innerHTML = `
        <video class="video__player" loop src="${videoData.url}" data-index="${index}"></video>
        
        <!-- Play/Pause Indicator -->
        <div class="play-pause-indicator">
            <span class="material-icons">play_arrow</span>
        </div>
        
        <!-- Sidebar -->
        <section class="videoSideBar">
            <div class="videoSideBar__options like-btn" data-index="${index}">
                <span class="material-icons">favorite_border</span>
                <p class="like-count">${formatNumber(videoData.likes)}</p>
            </div>
            <div class="videoSideBar__options">
                <span class="material-icons">comment</span>
                <p>${formatNumber(videoData.comments)}</p>
            </div>
            <div class="videoSideBar__options">
                <span class="material-icons">share</span>
                <p>${formatNumber(videoData.shares)}</p>
            </div>
        </section>
        
        <!-- Footer -->
        <div class="videoFooter">
            <div class="videoFooter__text">
                <h3>@${videoData.username}</h3>
                <p class="videoFooter__description">${videoData.description}</p>
                <div class="videoFooter__music">
                    <span class="material-icons">music_note</span>
                    <div class="videoFooterMusic__text">
                        <p>${videoData.music}</p>
                    </div>
                </div>
            </div>
            <img class="videoFooter__record" 
                 src="https://firebasestorage.googleapis.com/v0/b/jornada2-eb156.appspot.com/o/vinil.png?alt=media&token=72a6362d-ca03-4b8b-975e-a4832fdeccff" 
                 alt="vinyl record">
        </div>
    `;

    return videoDiv;
}

// Format large numbers (1234 -> 1.2K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

// Load all videos
function loadVideos() {
    videos.forEach((videoData, index) => {
        const videoElement = createVideoElement(videoData, index);
        videoContainer.appendChild(videoElement);
    });

    // Play first video
    const firstVideo = document.querySelector('.video__player');
    if (firstVideo) {
        firstVideo.play().catch(err => console.log('Autoplay prevented:', err));
    }
}

// Play/Pause video on click
videoContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('video__player')) {
        const video = e.target;
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
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 500);
    }
});

// Like button functionality
videoContainer.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const index = parseInt(likeBtn.dataset.index);
        const icon = likeBtn.querySelector('.material-icons');
        const count = likeBtn.querySelector('.like-count');

        if (likeBtn.classList.contains('liked')) {
            // Unlike
            likeBtn.classList.remove('liked');
            icon.textContent = 'favorite_border';
            videos[index].likes--;
            count.textContent = formatNumber(videos[index].likes);
        } else {
            // Like
            likeBtn.classList.add('liked');
            icon.textContent = 'favorite';
            videos[index].likes++;
            count.textContent = formatNumber(videos[index].likes);
        }
    }
});

// Handle video visibility on scroll
const observerOptions = {
    root: videoContainer,
    threshold: 0.6
};

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('.video__player');
        if (entry.isIntersecting) {
            // Play video when in view
            video.play().catch(err => console.log('Play failed:', err));
        } else {
            // Pause video when out of view
            video.pause();
        }
    });
}, observerOptions);

// Observe all video containers after loading
function observeVideos() {
    const allVideoContainers = document.querySelectorAll('.video');
    allVideoContainers.forEach(container => {
        videoObserver.observe(container);
    });
}

// Initialize the app
loadVideos();
observeVideos();

// Adjust max height for smaller screens
const setMaxHeight = () => {
    const appVideos = document.querySelector('.app__videos');
    if (window.innerHeight <= 800) {
        appVideos.style.maxHeight = window.innerHeight + 'px';
    }
};

setMaxHeight();
window.addEventListener('resize', setMaxHeight);
