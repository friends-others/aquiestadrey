#!/bin/bash

# ===========================================================================
# SCRIPT DE OPTIMIZACIÓN DE VIDEOS PARA PORTFOLIO
# Automatiza la compresión de videos y generación de thumbnails
# ===========================================================================

echo "🎬 Iniciando optimización de videos para portfolio..."

# Crear directorios si no existen
mkdir -p assets/videos
mkdir -p assets/images

# Función para optimizar un video
optimize_video() {
    local input_file="$1"
    local output_name="$2"
    
    echo "📹 Procesando: $input_file -> $output_name"
    
    # Crear versión MP4 optimizada
    echo "  🔄 Creando versión MP4..."
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -crf 25 \
        -preset medium \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        "assets/videos/${output_name}.mp4" \
        -y
    
    # Crear versión WebM optimizada
    echo "  🔄 Creando versión WebM..."
    ffmpeg -i "$input_file" \
        -c:v libvpx-vp9 \
        -crf 30 \
        -b:v 0 \
        -c:a libopus \
        -b:a 96k \
        "assets/videos/${output_name}.webm" \
        -y
    
    # Generar thumbnail (9:16 para videos verticales)
    echo "  🖼️  Generando thumbnail..."
    ffmpeg -i "$input_file" \
        -ss 00:00:03 \
        -vframes 1 \
        -vf scale=360:640 \
        -q:v 2 \
        "assets/images/video-thumbnail-${output_name##*-}.jpg" \
        -y
    
    echo "  ✅ Completado: $output_name"
    echo ""
}

# Verificar si FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg no está instalado. Por favor instálalo primero:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   Windows: https://ffmpeg.org/download.html"
    exit 1
fi

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "📖 Uso del script:"
    echo "   ./optimize-videos.sh archivo1.mp4 archivo2.mov ..."
    echo ""
    echo "📁 O para procesar todos los videos en un directorio:"
    echo "   ./optimize-videos.sh directorio/*"
    echo ""
    echo "📋 Ejemplo:"
    echo "   ./optimize-videos.sh raw-videos/video1.mp4 raw-videos/video2.mov"
    exit 1
fi

# Procesar cada archivo
counter=1
for file in "$@"; do
    if [ -f "$file" ]; then
        output_name="video-$counter"
        optimize_video "$file" "$output_name"
        ((counter++))
    else
        echo "⚠️  Archivo no encontrado: $file"
    fi
done

echo "🎉 ¡Optimización completada!"
echo ""
echo "📊 Resumen:"
echo "   📁 Videos optimizados en: assets/videos/"
echo "   🖼️  Thumbnails generados en: assets/images/"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica que los videos se reproduzcan correctamente"
echo "   2. Actualiza las duraciones en index.html"
echo "   3. Ajusta títulos y descripciones de videos"
echo ""
echo "💡 Tip: Los videos WebM son más pequeños que MP4 pero MP4 tiene mejor compatibilidad"