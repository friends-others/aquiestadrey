# 📹 Videos Optimizados

## 🎯 **Objetivo**
Esta carpeta debe contener videos optimizados (20-40MB cada uno) en lugar de los originales pesados (100MB+).

## 📁 **Estructura Esperada**
```
assets/videos/
├── video-1.mp4      (versión MP4 optimizada)
├── video-1.webm     (versión WebM optimizada)
├── video-2.mp4
├── video-2.webm
├── video-3.mp4
├── video-3.webm
├── video-4.mp4
├── video-4.webm
├── video-5.mp4
├── video-5.webm
├── video-6.mp4
├── video-6.webm
├── video-7.mp4
├── video-7.webm
├── video-8.mp4
└── video-8.webm
```

## 🚀 **Cómo Optimizar**

### **Opción 1: Script Automático**
```bash
# Desde la raíz del proyecto
./assets/scripts/optimize-videos.sh video-original-1.mp4 video-original-2.mp4 ...
```

### **Opción 2: Manual con FFmpeg**
```bash
# MP4 optimizado
ffmpeg -i original.mp4 -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 128k video-1.mp4

# WebM optimizado  
ffmpeg -i original.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 96k video-1.webm
```

## 💡 **Beneficios de la Optimización**
- ✅ **Carga 75% más rápida**
- ✅ **Lazy loading automático**
- ✅ **Solo cargan cuando son visibles**
- ✅ **Mejor experiencia de usuario**
- ✅ **SEO optimizado**

## 📊 **Tamaños Recomendados**
| Calidad | Tamaño por video | Total 8 videos |
|---------|------------------|----------------|
| Alta    | 30-40MB         | 240-320MB     |
| Media   | 20-30MB         | 160-240MB     |
| Básica  | 10-20MB         | 80-160MB      |

*Comparado con 800MB+ sin optimización*

## 🔗 **Archivos Relacionados**
- `../images/video-thumbnail-*.jpg` - Thumbnails de videos
- `../scripts/optimize-videos.sh` - Script de optimización
- `../../VIDEO_OPTIMIZATION_GUIDE.md` - Guía completa