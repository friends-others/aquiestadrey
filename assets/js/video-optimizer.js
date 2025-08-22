/**
 * VIDEO OPTIMIZER - Sistema avanzado de carga progresiva de videos
 * Optimizado para videos pesados (100MB+) con lazy loading inteligente
 */

class VideoOptimizer {
    constructor() {
        this.videos = [];
        this.loadedVideos = new Set();
        this.isSafari = this.detectSafari();
        this.isMac = this.detectMac();
        this.observerOptions = {
            root: null,
            rootMargin: this.isSafari ? '50px' : '100px', // Reducir preload en Safari
            threshold: this.isSafari ? 0.2 : 0.1 // Mayor threshold para Safari
        };
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.findVideos();
        this.optimizeExistingVideos();
        this.logBrowserInfo();
        this.applySafariOptimizations();
    }

    detectSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    detectMac() {
        return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    }

    logBrowserInfo() {
        console.log(`🔍 Browser Detection: Safari=${this.isSafari}, Mac=${this.isMac}`);
        if (this.isSafari || this.isMac) {
            console.log('✅ Optimizaciones específicas para Mac/Safari activadas');
        }
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
            // Agregar clase específica para Safari/Mac
            if (this.isSafari || this.isMac) {
                container.classList.add('safari-optimized');
            }
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
        
        // Timeout específico para Safari/Mac
        const loadTimeout = this.isSafari || this.isMac ? 15000 : 10000;
        let timeoutId = setTimeout(() => {
            console.warn(`⚠️ Timeout cargando video ${videoId} en Safari/Mac`);
            this.onVideoError(container, loadingSpinner, 'timeout');
        }, loadTimeout);
        
        // Manejar eventos de carga con mayor robustez para Safari
        const onLoadSuccess = () => {
            clearTimeout(timeoutId);
            this.onVideoLoaded(container, video, thumbnail, loadingSpinner);
        };
        
        const onLoadError = (error) => {
            clearTimeout(timeoutId);
            console.error(`❌ Error cargando video ${videoId}:`, error);
            this.onVideoError(container, loadingSpinner, 'load_error');
        };
        
        // Múltiples eventos para mayor compatibilidad con Safari
        video.addEventListener('loadedmetadata', onLoadSuccess);
        video.addEventListener('canplay', onLoadSuccess);
        video.addEventListener('error', onLoadError);
        video.addEventListener('stalled', () => {
            console.warn(`⚠️ Video ${videoId} stalled (probablemente en Safari)`);
        });

        // Configuración específica para Safari antes de cargar
        if (this.isSafari || this.isMac) {
            // Forzar que Safari reconozca el video
            video.setAttribute('webkit-playsinline', 'true');
            video.setAttribute('x-webkit-airplay', 'allow');
            
            // Cargar de forma más agresiva en Safari
            setTimeout(() => {
                video.load();
            }, 100);
        } else {
            video.load();
        }
    }

    createOptimizedVideo(src, id) {
        const video = document.createElement('video');
        video.className = 'video-optimized';
        video.id = `video-${id}`;
        video.controls = true;
        
        // Configuraciones específicas para Safari/Mac
        if (this.isSafari || this.isMac) {
            video.preload = 'none'; // Safari maneja mejor 'none' que 'metadata'
            video.setAttribute('webkit-playsinline', ''); // Safari específico
        } else {
            video.preload = 'metadata';
        }
        
        video.playsInline = true;
        video.muted = true;
        
        // Atributos adicionales para compatibilidad con Safari
        video.setAttribute('playsinline', '');
        video.setAttribute('disablePictureInPicture', '');
        
        // Múltiples formatos con prioridad para Safari
        if (this.isSafari) {
            // Safari prefiere MP4 primero
            const sourceMp4 = document.createElement('source');
            sourceMp4.src = src;
            sourceMp4.type = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
            video.appendChild(sourceMp4);
            
            // WebM como fallback solo si existe
            if (src.includes('.mp4')) {
                const sourceWebm = document.createElement('source');
                sourceWebm.src = src.replace('.mp4', '.webm');
                sourceWebm.type = 'video/webm; codecs="vp9, opus"';
                video.appendChild(sourceWebm);
            }
        } else {
            // Otros navegadores: WebM primero para mejor compresión
            if (src.includes('.mp4')) {
                const sourceWebm = document.createElement('source');
                sourceWebm.src = src.replace('.mp4', '.webm');
                sourceWebm.type = 'video/webm; codecs="vp9, opus"';
                video.appendChild(sourceWebm);
            }
            
            const sourceMp4 = document.createElement('source');
            sourceMp4.src = src;
            sourceMp4.type = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
            video.appendChild(sourceMp4);
        }

        return video;
    }

    onVideoLoaded(container, video, thumbnail, loadingSpinner) {
        const videoId = container.dataset.videoId;
        
        // Ocultar spinner
        if (loadingSpinner) {
            loadingSpinner.classList.remove('video-loading--visible');
        }

        // Reemplazar thumbnail con video con transición suave
        if (thumbnail) {
            // Preparar el video antes de la transición
            video.style.opacity = '0';
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.objectPosition = 'center';
            video.style.transition = 'opacity 0.5s ease';
            
            container.appendChild(video);
            
            // Fade out thumbnail y fade in video simultáneamente
            thumbnail.style.transition = 'opacity 0.5s ease';
            thumbnail.style.opacity = '0';
            
            // Fade in del video
            requestAnimationFrame(() => {
                video.style.opacity = '1';
            });
            
            // Remover thumbnail después de la transición pero mantener la estructura
            setTimeout(() => {
                if (thumbnail.parentNode) {
                    thumbnail.style.display = 'none';
                }
                // Quitar el position absolute del video para que tome el flujo normal
                video.style.position = 'static';
                // Mantener que ocupe todo el espacio
                video.style.width = '100%';
                video.style.height = '100%';
            }, 500);
        } else {
            // Si no hay thumbnail, asegurar que el video ocupe todo el espacio
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.objectPosition = 'center';
            container.appendChild(video);
        }

        this.loadedVideos.add(videoId);
        this.setupVideoAnalytics(video, videoId);
    }

    onVideoError(container, loadingSpinner, errorType = 'unknown') {
        console.error('Error cargando video:', container.dataset.videoSrc, 'Tipo:', errorType);
        
        if (loadingSpinner) {
            loadingSpinner.classList.remove('video-loading--visible');
        }

        // Mensajes específicos según el tipo de error
        let errorMessage = '⚠️ Error cargando video';
        let suggestion = '';
        
        if (errorType === 'timeout') {
            errorMessage = '⏱️ Tiempo de carga agotado';
            suggestion = this.isSafari || this.isMac ? 
                '<small>Safari a veces necesita más tiempo. Intenta de nuevo.</small>' : 
                '<small>Conexión lenta detectada.</small>';
        } else if (errorType === 'load_error') {
            errorMessage = '❌ Error de formato de video';
            suggestion = this.isSafari || this.isMac ? 
                '<small>Probando formato compatible con Safari...</small>' : 
                '<small>Intentando formato alternativo...</small>';
        }

        // Mostrar mensaje de error
        const errorMsg = document.createElement('div');
        errorMsg.className = this.isSafari || this.isMac ? 'video-error safari-specific' : 'video-error';
        errorMsg.innerHTML = `
            <p>${errorMessage}</p>
            ${suggestion}
            <button onclick="videoOptimizer.retryVideo('${container.dataset.videoId}')">
                Reintentar
            </button>
        `;
        container.appendChild(errorMsg);
        
        // Auto-retry en Safari después de un tiempo
        if (this.isSafari || this.isMac) {
            setTimeout(() => {
                const retryButton = errorMsg.querySelector('button');
                if (retryButton && errorMsg.parentNode) {
                    console.log(`🔄 Auto-retry para video ${container.dataset.videoId} en Safari`);
                    retryButton.click();
                }
            }, 3000);
        }
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
                
                // En Safari/Mac, liberar más agresivamente la memoria
                if (this.isSafari || this.isMac) {
                    video.removeAttribute('src');
                    video.load();
                }
            }
        });
    }

    // Método específico para optimizaciones adicionales en Safari/Mac
    applySafariOptimizations() {
        if (!this.isSafari && !this.isMac) return;
        
        console.log('🍎 Aplicando optimizaciones específicas para Safari/Mac...');
        
        // Reducir el número de videos que se precargan simultáneamente
        this.maxConcurrentLoads = 1;
        
        // Agregar listener para gestión de memoria más agresiva
        const memoryCleanup = () => {
            if (performance.memory && performance.memory.usedJSHeapSize > 50000000) { // >50MB
                console.log('🧹 Limpieza de memoria Safari activada');
                this.unloadInvisibleVideos();
            }
        };
        
        // Limpiar memoria cada 10 segundos en Safari
        setInterval(memoryCleanup, 10000);
        
        // Manejar cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const videos = document.querySelectorAll('.video-optimized');
                videos.forEach(video => {
                    if (!video.paused) {
                        video.pause();
                    }
                });
            }
        });
        
        console.log('✅ Optimizaciones Safari/Mac aplicadas correctamente');
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