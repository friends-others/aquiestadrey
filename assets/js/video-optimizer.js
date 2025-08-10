/**
 * VIDEO OPTIMIZER - Sistema avanzado de carga progresiva de videos
 * Optimizado para videos pesados (100MB+) con lazy loading inteligente
 */

class VideoOptimizer {
    constructor() {
        this.videos = [];
        this.loadedVideos = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '100px', // Precargar cuando esté a 100px de ser visible
            threshold: 0.1
        };
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.findVideos();
        this.optimizeExistingVideos();
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                this.handleIntersection.bind(this),
                this.observerOptions
            );
        }
    }

    findVideos() {
        // Buscar todos los contenedores de video con lazy loading
        const videoContainers = document.querySelectorAll('.video-lazy-container');
        videoContainers.forEach(container => {
            this.observeVideo(container);
        });
    }

    observeVideo(container) {
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(container);
        }
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadVideo(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }

    loadVideo(container) {
        const videoSrc = container.dataset.videoSrc;
        const videoId = container.dataset.videoId;
        const thumbnail = container.querySelector('.video-thumbnail');
        const loadingSpinner = container.querySelector('.video-loading');
        
        if (this.loadedVideos.has(videoId)) {
            return;
        }

        // Mostrar spinner de carga
        if (loadingSpinner) {
            loadingSpinner.classList.add('video-loading--visible');
        }

        // Crear elemento video optimizado
        const video = this.createOptimizedVideo(videoSrc, videoId);
        
        // Manejar eventos de carga
        video.addEventListener('loadedmetadata', () => {
            this.onVideoLoaded(container, video, thumbnail, loadingSpinner);
        });

        video.addEventListener('error', () => {
            this.onVideoError(container, loadingSpinner);
        });

        // Iniciar precarga de metadata solamente
        video.load();
    }

    createOptimizedVideo(src, id) {
        const video = document.createElement('video');
        video.className = 'video-optimized';
        video.id = `video-${id}`;
        video.controls = true;
        video.preload = 'metadata'; // Solo metadata, no el video completo
        video.playsInline = true;
        video.muted = true; // Para permitir autoplay en móviles si es necesario
        
        // Múltiples formatos para mejor compatibilidad
        if (src.includes('.mp4')) {
            const source1 = document.createElement('source');
            source1.src = src.replace('.mp4', '.webm');
            source1.type = 'video/webm';
            video.appendChild(source1);
        }
        
        const source2 = document.createElement('source');
        source2.src = src;
        source2.type = 'video/mp4';
        video.appendChild(source2);

        return video;
    }

    onVideoLoaded(container, video, thumbnail, loadingSpinner) {
        const videoId = container.dataset.videoId;
        
        // Ocultar spinner
        if (loadingSpinner) {
            loadingSpinner.classList.remove('video-loading--visible');
        }

        // Reemplazar thumbnail con video
        if (thumbnail) {
            thumbnail.style.opacity = '0';
            setTimeout(() => {
                container.appendChild(video);
                video.style.opacity = '0';
                video.style.transition = 'opacity 0.5s ease';
                
                // Fade in del video
                requestAnimationFrame(() => {
                    video.style.opacity = '1';
                });
                
                // Remover thumbnail después de la transición
                setTimeout(() => {
                    if (thumbnail.parentNode) {
                        thumbnail.parentNode.removeChild(thumbnail);
                    }
                }, 500);
            }, 300);
        } else {
            container.appendChild(video);
        }

        this.loadedVideos.add(videoId);
        this.setupVideoAnalytics(video, videoId);
    }

    onVideoError(container, loadingSpinner) {
        console.error('Error cargando video:', container.dataset.videoSrc);
        
        if (loadingSpinner) {
            loadingSpinner.classList.remove('video-loading--visible');
        }

        // Mostrar mensaje de error
        const errorMsg = document.createElement('div');
        errorMsg.className = 'video-error';
        errorMsg.innerHTML = `
            <p>⚠️ Error cargando video</p>
            <button onclick="videoOptimizer.retryVideo('${container.dataset.videoId}')">
                Reintentar
            </button>
        `;
        container.appendChild(errorMsg);
    }

    setupVideoAnalytics(video, videoId) {
        let hasStarted = false;
        
        video.addEventListener('play', () => {
            if (!hasStarted) {
                console.log(`📹 Video iniciado: ${videoId}`);
                hasStarted = true;
            }
        });

        video.addEventListener('pause', () => {
            console.log(`⏸️ Video pausado: ${videoId}`);
        });

        video.addEventListener('ended', () => {
            console.log(`✅ Video completado: ${videoId}`);
        });
    }

    retryVideo(videoId) {
        const container = document.querySelector(`[data-video-id="${videoId}"]`);
        if (container) {
            // Limpiar errores previos
            const errorMsg = container.querySelector('.video-error');
            if (errorMsg) {
                errorMsg.remove();
            }
            
            // Reintentar carga
            this.loadVideo(container);
        }
    }

    optimizeExistingVideos() {
        // Optimizar videos que ya están en el DOM
        const existingVideos = document.querySelectorAll('video:not(.video-optimized)');
        existingVideos.forEach(video => {
            video.preload = 'metadata';
            video.playsInline = true;
        });
    }

    // Método para precargar el siguiente video cuando el usuario esté viendo uno
    preloadNext(currentVideoId) {
        const allContainers = document.querySelectorAll('.video-lazy-container');
        const currentIndex = Array.from(allContainers).findIndex(
            container => container.dataset.videoId === currentVideoId
        );
        
        if (currentIndex >= 0 && currentIndex < allContainers.length - 1) {
            const nextContainer = allContainers[currentIndex + 1];
            if (!this.loadedVideos.has(nextContainer.dataset.videoId)) {
                // Precargar siguiente video con prioridad baja
                setTimeout(() => {
                    this.loadVideo(nextContainer);
                }, 2000);
            }
        }
    }

    // Método para liberar memoria de videos no visibles
    unloadInvisibleVideos() {
        const videos = document.querySelectorAll('.video-optimized');
        videos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight + 200 && 
                             rect.bottom > -200;
            
            if (!isVisible && !video.paused) {
                video.pause();
            }
        });
    }
}

// Inicializar optimizador cuando el DOM esté listo
let videoOptimizer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoOptimizer = new VideoOptimizer();
    });
} else {
    videoOptimizer = new VideoOptimizer();
}

// Optimizar memoria cada 30 segundos
setInterval(() => {
    if (videoOptimizer) {
        videoOptimizer.unloadInvisibleVideos();
    }
}, 30000);

// Export para uso global
window.videoOptimizer = videoOptimizer;