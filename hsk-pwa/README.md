# HSK 3.0 — Vocabulario Chino (PWA)

App progresiva (PWA) para estudiar las 10.421 palabras del nuevo HSK 3.0.  
**Nueva edición 2026 · Niveles 1–9 · iOS & Android**

---

## 📁 Estructura del paquete

```
hsk-pwa/
├── index.html          ← App principal (toda la lógica incluida)
├── manifest.json       ← Configuración PWA (nombre, iconos, colores)
├── sw.js               ← Service Worker (offline, notificaciones, sync)
├── icons/
│   ├── icon-72x72.png  ─┐
│   ├── icon-96x96.png   │
│   ├── icon-128x128.png │  Iconos para Android / Chrome
│   ├── icon-144x144.png │
│   ├── icon-152x152.png │
│   ├── icon-192x192.png │  (también maskable)
│   ├── icon-384x384.png │
│   ├── icon-512x512.png ─┘  (también maskable)
│   ├── apple-touch-icon.png  ← Icono iOS (180x180)
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── splash-640x1136.png   ─┐
│   ├── splash-750x1334.png    │
│   ├── splash-828x1792.png    │  Splash screens iOS
│   ├── splash-1125x2436.png   │
│   ├── splash-1242x2688.png   │
│   ├── splash-1536x2048.png   │
│   └── splash-2048x2732.png  ─┘
└── README.md
```

---

## 🚀 Cómo publicar (3 opciones gratuitas)

### Opción A — GitHub Pages (recomendado, gratis)

1. Crea una cuenta en [github.com](https://github.com) si no tienes
2. Crea un repositorio nuevo (ej: `hsk-vocabulario`)
3. Sube todos los archivos de esta carpeta al repositorio
4. Ve a **Settings → Pages → Source: main branch → /root**
5. Tu app estará en: `https://TU_USUARIO.github.io/hsk-vocabulario`

```bash
# Con Git (si lo tienes instalado):
git init
git add .
git commit -m "HSK 3.0 PWA"
git remote add origin https://github.com/TU_USUARIO/hsk-vocabulario.git
git push -u origin main
```

### Opción B — Netlify (drag & drop, gratis)

1. Ve a [netlify.com](https://netlify.com) → Sign up
2. En el dashboard, arrastra la carpeta `hsk-pwa/` completa
3. ¡Listo! Netlify te da una URL tipo `https://hsk-xxxx.netlify.app`
4. Puedes configurar un dominio personalizado

### Opción C — Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) → Sign up con GitHub
2. Import el repositorio GitHub que creaste
3. Deploy automático en cada push

---

## 📱 Cómo instalar la app en el móvil

### En Android (Chrome):
1. Abre la URL de tu app en Chrome
2. Aparecerá un banner "Añadir a pantalla de inicio"  
   (o ve al menú ⋮ → "Instalar app")
3. La app se instala como si fuera nativa

### En iOS (Safari):
1. Abre la URL en Safari (⚠️ debe ser Safari, no Chrome en iOS)
2. Toca el botón **Compartir** (□↑)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Toca **"Añadir"**
5. La app aparece en tu home screen con el icono 汉

> **Nota iOS**: Las notificaciones push en iOS requieren iOS 16.4+ y que  
> el usuario haya instalado la PWA. Safari te pedirá permiso la primera vez.

---

## ✨ Funcionalidades

| Función | Descripción |
|---------|-------------|
| 📚 Vocabulario | 10.421 palabras HSK 1–9, filtro por nivel, búsqueda |
| 🃏 Flashcards | Modo Anki con valoración (Otra vez / Difícil / Bien / Fácil) |
| 🔊 Audio | Pronunciación en chino mandarín via Web Speech API |
| 🌐 Traducción | Traducciones al español via API de Claude |
| 📊 Estadísticas | Progreso por nivel, racha de días, palabras estudiadas |
| ⚡ Offline | Funciona sin internet (vocabulario + flashcards guardados) |
| 🔔 Notificaciones | Recordatorio diario de repaso (requiere permiso) |
| 💾 Sincronización | Progreso guardado en el dispositivo (localStorage) |
| ⌨️ Atajos de teclado | Espacio=girar, ←/→=navegar, 1-4=valorar, S=audio |

---

## ⚙️ Configuración HTTPS (obligatorio para PWA)

Las PWA **requieren HTTPS** para funcionar. GitHub Pages, Netlify y Vercel  
incluyen HTTPS automático y gratuito con certificado SSL.

Si usas tu propio servidor, necesitas un certificado (Let's Encrypt es gratis).

---

## 🔧 Personalización

### Cambiar colores del tema
Edita las variables CSS en `index.html`:
```css
:root {
  --ink: #1a1a2e;    /* Color principal (fondo header) */
  --gold: #e8b86d;   /* Color dorado (acentos) */
  --cream: #faf6ef;  /* Color de fondo */
}
```

### Añadir notificaciones push reales
Para notificaciones cuando la app está cerrada necesitas un servidor backend.
Opciones gratuitas: **Firebase Cloud Messaging (FCM)** o **OneSignal**.

```javascript
// En sw.js, añade tu clave VAPID pública:
const VAPID_PUBLIC_KEY = 'TU_CLAVE_VAPID_AQUI';
```

### Sincronización en la nube real
Conecta a **Firebase Firestore** o **Supabase** para sincronizar entre dispositivos:
```javascript
// Reemplaza syncToCloud() en index.html con:
import { setDoc, doc } from 'firebase/firestore';
await setDoc(doc(db, 'users', userId), { studied: [...state.studied] });
```

---

## 📋 Requisitos técnicos

- Navegador moderno (Chrome 80+, Safari 14+, Firefox 75+)
- HTTPS obligatorio para Service Worker y notificaciones
- Almacenamiento local ~5MB (vocabulario + traducciones cacheadas)
- Internet solo para traducciones nuevas (via API de Anthropic)

---

*HSK 3.0 PWA · Nueva edición 2026 · Vocabulario chino-español*
