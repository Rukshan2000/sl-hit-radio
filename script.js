// Radio Player JavaScript
class RadioPlayer {
    constructor() {
        this.audio = document.getElementById('radioStream');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.nowPlaying = document.getElementById('nowPlaying');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.equalizerBars = document.querySelectorAll('.equalizer-bar');
        
        this.isPlaying = false;
        this.isLoading = false;
        
        this.init();
        this.setupAutoplay();
    }
    
    init() {
        // Set initial volume
        this.audio.volume = this.volumeSlider.value;
        
        // Event listeners
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
        
        // Audio event listeners
        this.audio.addEventListener('loadstart', () => this.onLoadStart());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        this.audio.addEventListener('playing', () => this.onPlaying());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onError(e));
        this.audio.addEventListener('waiting', () => this.onWaiting());
        this.audio.addEventListener('stalled', () => this.onStalled());
        
        // Handle page visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Handle space bar for play/pause
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.togglePlayPause();
            }
        });
    }
    
    async togglePlayPause() {
        if (this.isLoading) return;
        
        try {
            if (this.isPlaying) {
                this.pause();
            } else {
                await this.play();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            this.showError('Failed to play stream. Please try again.');
        }
    }
    
    async play() {
        this.isLoading = true;
        this.updatePlayButton('loading');
        this.nowPlaying.textContent = 'Connecting to stream...';
        
        try {
            // Reload the audio source to ensure fresh connection
            this.audio.load();
            await this.audio.play();
        } catch (error) {
            this.isLoading = false;
            this.updatePlayButton('play');
            throw error;
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton('play');
        this.nowPlaying.textContent = 'Stream paused';
        this.stopEqualizer();
    }
    
    setVolume(value) {
        this.audio.volume = parseFloat(value);
    }
    
    updatePlayButton(state) {
        const icon = this.playPauseIcon;
        
        switch(state) {
            case 'play':
                icon.className = 'fas fa-play ml-1';
                this.playPauseBtn.disabled = false;
                break;
            case 'pause':
                icon.className = 'fas fa-pause';
                this.playPauseBtn.disabled = false;
                break;
            case 'loading':
                icon.className = 'fas fa-spinner fa-spin';
                this.playPauseBtn.disabled = true;
                break;
        }
    }
    
    startEqualizer() {
        this.equalizerBars.forEach(bar => {
            bar.style.animationPlayState = 'running';
        });
    }
    
    stopEqualizer() {
        this.equalizerBars.forEach(bar => {
            bar.style.animationPlayState = 'paused';
        });
    }
    
    toggleMobileMenu() {
        this.mobileMenu.classList.toggle('hidden');
    }
    
    // Audio event handlers
    onLoadStart() {
        console.log('Started loading stream...');
    }
    
    onCanPlay() {
        console.log('Stream can start playing');
        this.isLoading = false;
    }
    
    onPlaying() {
        this.isPlaying = true;
        this.isLoading = false;
        this.updatePlayButton('pause');
        this.nowPlaying.textContent = 'Now streaming live music...';
        this.startEqualizer();
        console.log('Stream is now playing');
    }
    
    onPause() {
        this.isPlaying = false;
        this.updatePlayButton('play');
        this.stopEqualizer();
        console.log('Stream paused');
    }
    
    onWaiting() {
        this.nowPlaying.textContent = 'Buffering...';
        console.log('Stream is buffering...');
    }
    
    onStalled() {
        this.nowPlaying.textContent = 'Connection issues, trying to reconnect...';
        console.log('Stream stalled, attempting to reconnect...');
    }
    
    onError(event) {
        this.isLoading = false;
        this.isPlaying = false;
        this.updatePlayButton('play');
        this.stopEqualizer();
        
        const error = this.audio.error;
        let errorMessage = 'Unable to play stream';
        
        if (error) {
            switch(error.code) {
                case error.MEDIA_ERR_ABORTED:
                    errorMessage = 'Stream loading was aborted';
                    break;
                case error.MEDIA_ERR_NETWORK:
                    errorMessage = 'Network error occurred';
                    break;
                case error.MEDIA_ERR_DECODE:
                    errorMessage = 'Stream format not supported';
                    break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = 'Stream source not supported';
                    break;
                default:
                    errorMessage = 'Unknown playback error';
            }
        }
        
        this.showError(errorMessage);
        console.error('Audio error:', error);
    }
    
    showError(message) {
        this.nowPlaying.textContent = message;
        this.nowPlaying.style.color = '#fca5a5'; // Light red color
        
        // Reset color after 5 seconds
        setTimeout(() => {
            this.nowPlaying.style.color = '';
            if (!this.isPlaying) {
                this.nowPlaying.textContent = 'Click play to start listening';
            }
        }, 5000);
    }
    
    handleVisibilityChange() {
        // Optional: pause when tab becomes hidden to save bandwidth
        // Uncomment the following lines if you want this behavior
        /*
        if (document.hidden && this.isPlaying) {
            this.pause();
        }
        */
    }
    
    setupAutoplay() {
        // Handle autoplay restrictions in modern browsers
        const audio = this.audio;
        
        // Try to autoplay when page loads
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(async () => {
                try {
                    audio.muted = false; // Unmute after user interaction
                    await this.play();
                    console.log('Autoplay started successfully');
                } catch (error) {
                    console.log('Autoplay blocked, waiting for user interaction');
                    this.setupAutoplayFallback();
                }
            }, 1000);
        });
    }
    
    setupAutoplayFallback() {
        // Add click listener to start autoplay on first user interaction
        const startAutoplay = async () => {
            try {
                this.audio.muted = false;
                await this.play();
                document.removeEventListener('click', startAutoplay);
                document.removeEventListener('touchstart', startAutoplay);
                console.log('Autoplay started after user interaction');
            } catch (error) {
                console.error('Failed to start autoplay:', error);
            }
        };
        
        document.addEventListener('click', startAutoplay, { once: true });
        document.addEventListener('touchstart', startAutoplay, { once: true });
    }
}

// Enhanced Now Playing functionality
function updateNowPlaying(track) {
    const nowPlayingElement = document.getElementById('hero-now-playing');
    const artistElement = document.getElementById('hero-artist');
    const albumElement = document.getElementById('hero-album');
    const progressIndicator = document.getElementById('progress-indicator');
    
    // Add loading state
    nowPlayingElement.classList.add('loading-skeleton');
    
    setTimeout(() => {
        nowPlayingElement.textContent = track.title;
        artistElement.textContent = track.artist;
        albumElement.textContent = track.album;
        
        // Remove loading state
        nowPlayingElement.classList.remove('loading-skeleton');
        
        // Add entrance animation
        nowPlayingElement.style.animation = 'slideInUp 0.5s ease-out';
        
        // Show progress indicator when playing
        if (track.isPlaying) {
            progressIndicator.classList.add('active');
        }
    }, 300);
}

// Track details toggle
document.addEventListener('DOMContentLoaded', function() {
    const detailsButton = document.querySelector('[title="Track details"]');
    const detailsPanel = document.getElementById('track-details');
    
    if (detailsButton && detailsPanel) {
        detailsButton.addEventListener('click', function() {
            const isHidden = detailsPanel.classList.contains('hidden');
            
            if (isHidden) {
                detailsPanel.classList.remove('hidden');
                detailsPanel.style.animation = 'slideInUp 0.3s ease-out';
            } else {
                detailsPanel.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    detailsPanel.classList.add('hidden');
                }, 300);
            }
        });
    }
    
    // Interactive button effects
    const interactiveButtons = document.querySelectorAll('.group');
    interactiveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('div');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Enhanced UI functionality with scroll animations and new features
class UIEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize scroll animations
        this.initScrollAnimations();
        
        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Mobile menu functionality
        this.setupMobileMenu();
        
        // Navigation highlight on scroll
        this.setupNavigationHighlight();
        
        // Form submission handling
        this.setupContactForm();
        
        // Chart interactions
        this.setupChartInteractions();
        
        // Custom volume slider styling
        this.styleVolumeSlider();
    }
    
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe all elements with scroll-fade class
        document.querySelectorAll('.scroll-fade').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupMobileMenu() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('mobile-menu').classList.add('hidden');
            });
        });
    }
    
    setupNavigationHighlight() {
        const sections = document.querySelectorAll('section[id], main[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all nav links
                    navLinks.forEach(link => {
                        link.classList.remove('bg-white/20');
                    });
                    
                    // Add active class to current section's nav link
                    const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('bg-white/20');
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    setupContactForm() {
        const contactForm = document.querySelector('form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const button = contactForm.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                
                // Show loading state
                button.textContent = 'Sending...';
                button.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    button.textContent = 'Message Sent!';
                    button.classList.add('bg-green-500');
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                        button.classList.remove('bg-green-500');
                    }, 3000);
                }, 2000);
            });
        }
    }
    
    setupChartInteractions() {
        // Add click animations to chart items
        document.querySelectorAll('.space-y-4 > div').forEach(item => {
            item.addEventListener('click', function() {
                // Add a subtle pulse animation
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
        
        // Add hover sound effect simulation (visual feedback)
        document.querySelectorAll('.card-hover').forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Add a subtle glow effect
                this.style.boxShadow = '0 25px 50px rgba(255, 255, 255, 0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
            });
        });
    }
    
    styleVolumeSlider() {
        const style = document.createElement('style');
        style.textContent = `
            .slider::-webkit-slider-thumb {
                appearance: none;
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .slider::-moz-range-thumb {
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .slider::-webkit-slider-track {
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
            }
            
            .slider::-moz-range-track {
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                border: none;
            }
        `;
        document.head.appendChild(style);
    }
}

// News Manager Class
class NewsManager {
    constructor() {
        this.newsData = [];
        this.init();
    }
    
    async init() {
        await this.loadNewsData();
        this.displayFeaturedNews();
    }
    
    async loadNewsData() {
        try {
            const response = await fetch('newsData.json');
            const data = await response.json();
            this.newsData = data.articles;
        } catch (error) {
            console.error('Error loading news data:', error);
            this.newsData = this.getFallbackNews();
        }
    }
    
    displayFeaturedNews() {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;
        
        // Show only featured articles or first 3 articles
        const featuredNews = this.newsData.filter(article => article.featured).slice(0, 3) ||
                           this.newsData.slice(0, 3);
        
        newsGrid.innerHTML = featuredNews.map(article => `
            <article class="glass rounded-2xl overflow-hidden card-hover scroll-fade">
                <img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex items-center text-white/60 text-sm mb-3">
                        <i class="fas fa-calendar mr-2"></i>
                        <span>${article.date}</span>
                        <span class="mx-2">•</span>
                        <span class="bg-white/20 px-2 py-1 rounded text-xs">${article.category}</span>
                    </div>
                    <h3 class="text-white font-bold text-xl mb-3">${article.title}</h3>
                    <p class="text-white/80 mb-4">${article.excerpt}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center text-white/60 text-sm">
                            <i class="fas fa-user mr-2"></i>
                            <span>${article.author}</span>
                        </div>
                        <button class="text-white/80 hover:text-white text-sm glow-hover" onclick="window.open('news.html', '_blank')">
                            Read More <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    }
    
    getFallbackNews() {
        return [
            {
                id: 1,
                title: "Welcome to SL Hit Radio News",
                excerpt: "Stay tuned for the latest updates from the music world and our radio station.",
                author: "SL Hit Radio Team",
                date: "2025-01-15",
                category: "Station News",
                image: "https://via.placeholder.com/400x200/667eea/ffffff?text=SL+Hit+Radio",
                featured: true
            }
        ];
    }
}

// Dynamic content updates
class ContentManager {
    constructor() {
        this.currentSongIndex = 0;
        this.songs = [
            { title: "Blinding Lights", artist: "The Weeknd" },
            { title: "Shape of You", artist: "Ed Sheeran" },
            { title: "Anti-Hero", artist: "Taylor Swift" },
            { title: "As It Was", artist: "Harry Styles" },
            { title: "Flowers", artist: "Miley Cyrus" },
            { title: "Unholy", artist: "Sam Smith ft. Kim Petras" },
            { title: "Bad Habit", artist: "Steve Lacy" },
            { title: "About Damn Time", artist: "Lizzo" }
        ];
        this.init();
    }
    
    init() {
        this.updateCurrentTime();
        this.startSongRotation();
        this.updateScheduleHighlight();
        
        // Update time every minute
        setInterval(() => this.updateCurrentTime(), 60000);
        setInterval(() => this.updateScheduleHighlight(), 60000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update any time displays
        const timeElements = document.querySelectorAll('.current-time');
        timeElements.forEach(el => {
            el.textContent = timeString;
        });
    }
    
    startSongRotation() {
        // Only rotate songs when radio is playing
        setInterval(() => {
            const radioPlayer = window.radioPlayerInstance;
            if (radioPlayer && radioPlayer.isPlaying) {
                this.updateNowPlaying();
            }
        }, 180000); // Change song every 3 minutes
    }
    
    updateNowPlaying() {
        const nowPlayingElement = document.getElementById('nowPlaying');
        if (nowPlayingElement && nowPlayingElement.textContent === 'Now streaming live music...') {
            const currentSong = this.songs[this.currentSongIndex];
            nowPlayingElement.textContent = `${currentSong.title} - ${currentSong.artist}`;
            
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
    }
    
    updateScheduleHighlight() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Remove previous highlights
        document.querySelectorAll('.schedule-active').forEach(el => {
            el.classList.remove('schedule-active', 'bg-white/10');
        });
        
        // Highlight current time slot
        const scheduleRows = document.querySelectorAll('.grid.grid-cols-3.gap-4.p-4');
        scheduleRows.forEach(row => {
            const timeText = row.querySelector('div:first-child')?.textContent;
            if (timeText && this.isCurrentTimeSlot(timeText, currentHour)) {
                row.classList.add('schedule-active', 'bg-white/10');
            }
        });
    }
    
    isCurrentTimeSlot(timeText, currentHour) {
        const timeMatch = timeText.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/);
        if (!timeMatch) return false;
        
        const startHour = parseInt(timeMatch[1]);
        const endHour = parseInt(timeMatch[3]);
        
        if (startHour <= endHour) {
            return currentHour >= startHour && currentHour < endHour;
        } else {
            // Handle overnight slots
            return currentHour >= startHour || currentHour < endHour;
        }
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Lazy load social media scripts only when needed
        this.setupIntersectionObserver();
        
        // Preload the audio stream when user shows intent to play
        this.setupStreamPreloading();
        
        // Optimize images
        this.setupImageOptimization();
        
        // Debounce scroll events
        this.setupScrollOptimization();
    }
    
    setupIntersectionObserver() {
        // Observe footer for social media interactions
        const footer = document.querySelector('footer');
        if (footer) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Footer is visible, user might interact with social links
                        console.log('Footer visible - social media ready');
                    }
                });
            });
            observer.observe(footer);
        }
    }
    
    setupStreamPreloading() {
        const playButton = document.getElementById('playPauseBtn');
        let preloadTriggered = false;
        
        // Preload on hover (desktop) or touch start (mobile)
        ['mouseenter', 'touchstart'].forEach(event => {
            playButton.addEventListener(event, () => {
                if (!preloadTriggered) {
                    const audio = document.getElementById('radioStream');
                    audio.preload = 'metadata';
                    preloadTriggered = true;
                    console.log('Stream preloading initiated');
                }
            }, { once: true });
        });
    }
    
    setupImageOptimization() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    setupScrollOptimization() {
        let ticking = false;
        
        function updateScrollEffects() {
            // Add any scroll-based effects here
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('SL Hit Radio - Initializing...');
    
    // Initialize main components
    const radioPlayer = new RadioPlayer();
    const uiEnhancements = new UIEnhancements();
    const contentManager = new ContentManager();
    const performanceOptimizer = new PerformanceOptimizer();
    const newsManager = new NewsManager();
    
    // Make radio player globally accessible for content manager
    window.radioPlayerInstance = radioPlayer;
    
    console.log('SL Hit Radio - Ready to stream!');
    
    // Add a subtle fade-in animation to the main content
    setTimeout(() => {
        document.querySelector('main').style.opacity = '0';
        document.querySelector('main').style.transition = 'opacity 0.5s ease-in-out';
        document.querySelector('main').style.opacity = '1';
    }, 100);
    
    // Add welcome message to console
    console.log(`
    🎵 Welcome to SL Hit Radio! 🎵
    
    Features loaded:
    ✅ Live audio streaming
    ✅ Responsive glassmorphism design
    ✅ Smooth scroll animations
    ✅ Dynamic content updates
    ✅ Mobile-friendly interface
    ✅ Performance optimizations
    
    Press SPACE to play/pause
    Enjoy the music! 🎶
    `);
});