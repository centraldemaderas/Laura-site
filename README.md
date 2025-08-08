# Laura Giraldo - Sitio Web Profesional

Sitio web profesional para Laura Giraldo, psicóloga clínica. Desarrollado con HTML, CSS y JavaScript vanilla, incluye sistema de reservas, pagos online, chat integrado y **panel de administración** para gestión de contenido.

## 🚀 Características

### Diseño y UX
- **Diseño Responsivo**: Se adapta perfectamente a todos los dispositivos
- **Paleta de Colores Profesional**: 
  - Brand Navy (#0D1625) - Fondo principal
  - Brand Gold (#FFD873) - Logotipo y acentos
  - Brand Sage (#8FB7A5) - Botones secundarios y hover
- **Tipografía**: Inter para texto, Great Vibes para títulos
- **Animaciones Modernas**: Efectos de entrada y transiciones suaves

### Funcionalidades Principales
- **Navegación Multipágina**: 6 páginas principales con navegación consistente
- **Sistema de Reservas**: Integración con Calendly para agendar citas
- **Pagos Online**: Integración con Wompi para procesamiento de pagos
- **Chat GPT-4**: Widget de chat con respuestas automáticas y FAQ
- **Servicios Dinámicos**: Carga desde JSON con precios y descripciones
- **Formularios Interactivos**: Validación en tiempo real y notificaciones
- **Panel de Administración**: Interfaz intuitiva para gestionar contenido sin conocimientos técnicos

### Tecnologías Utilizadas
- **HTML5**: Estructura semántica moderna
- **CSS3**: Flexbox, Grid, animaciones y media queries
- **JavaScript ES6+**: Funcionalidades interactivas y APIs
- **Font Awesome**: Iconos vectoriales
- **Google Fonts**: Tipografía Inter y Great Vibes

## 📁 Estructura del Proyecto

```
sitio-prueba/
├── index.html              # Página principal
├── sobre-mi.html           # Página sobre Laura
├── servicios.html          # Página de servicios
├── reserva.html            # Página de reservas
├── contacto.html           # Página de contacto
├── confirmacion.html       # Página de confirmación de pago
├── admin.html              # Panel de administración
├── styles.css              # Estilos CSS principales
├── admin-styles.css        # Estilos del panel admin
├── script.js               # JavaScript principal
├── services.json           # Datos de servicios
├── admin-config.json       # Configuración del admin
├── robots.txt              # Configuración SEO
├── sitemap.xml             # Sitemap para SEO
├── assets/
│   ├── logo.svg            # Logo de Laura Giraldo
│   ├── logo.png            # Logo alternativo
│   └── laura-giraldo.jpg   # Foto de Laura
├── js/
│   ├── services.js         # Lógica de servicios
│   ├── wompi.js            # Integración de pagos
│   ├── chat.js             # Widget de chat
│   └── admin.js            # Funcionalidad del panel admin
└── README.md               # Documentación
```

## 🛠️ Configuración

### 0. Panel de Administración

El sitio incluye un **panel de administración** completo que permite gestionar todo el contenido sin conocimientos técnicos:

#### Acceso al Panel
- URL: `https://tudominio.com/admin.html`
- No requiere contraseña (configurar autenticación en producción)

#### Funcionalidades del Panel
- **Dashboard**: Vista general del sitio con estadísticas
- **Editor de Contenido**: Modificar textos de todas las páginas
- **Gestión de Servicios**: Agregar, editar y eliminar servicios
- **Gestión de Imágenes**: Subir y administrar imágenes del sitio
- **Gestión del Equipo**: Actualizar información y fotos del equipo
- **Configuración**: Ajustar integraciones y datos de contacto

#### Uso del Panel
1. Abrir `admin.html` en el navegador
2. Navegar por las diferentes secciones usando el menú lateral
3. Realizar cambios en los formularios
4. Hacer clic en "Guardar Cambios" para aplicar modificaciones
5. Los cambios se guardan automáticamente en el navegador

#### Características Técnicas
- **Almacenamiento Local**: Los cambios se guardan en localStorage del navegador
- **Interfaz Responsiva**: Funciona en móviles, tablets y desktop
- **Drag & Drop**: Para subir imágenes fácilmente
- **Auto-guardado**: Los cambios se guardan automáticamente
- **Notificaciones**: Feedback visual para todas las acciones

### 1. Cambiar Llaves de API

#### Wompi (Pagos)
En `reserva.html` y `js/wompi.js`:
```javascript
// Cambiar la llave pública de Wompi
data-wompi-public-key="pub_test_TU_LLAVE_REAL"
```

#### Google Analytics
En todas las páginas HTML:
```javascript
// Cambiar el ID de Google Analytics
gtag('config', 'G-TU_ID_REAL');
```

#### Calendly
En `reserva.html`:
```html
<!-- Cambiar la URL de Calendly -->
data-url="https://calendly.com/TU_USUARIO/consulta?hide_landing_page_details=1"
```

### 2. Personalizar Contenido

#### Información de Contacto
Actualizar en todas las páginas:
- Email: `laura@lauragiraldo.com`
- Teléfono: `+57 300 123 4567`
- Ubicación: `Bogotá, Colombia`

#### Servicios
**Opción 1 - Panel de Administración (Recomendado):**
- Usar el panel de administración en `admin.html`
- Sección "Servicios" para agregar, editar y eliminar servicios
- Interfaz intuitiva sin necesidad de editar código

**Opción 2 - Edición Manual:**
Editar `services.json` para modificar:
- Precios
- Descripciones
- Características
- Duración de sesiones

#### Logo
Reemplazar `assets/logo.png` con el logo real de Laura Giraldo.

## 📝 Agregar Nuevos Contenidos

### Nuevos Servicios
**Opción 1 - Panel de Administración (Recomendado):**
1. Abrir `admin.html`
2. Ir a la sección "Servicios"
3. Hacer clic en "Agregar Servicio"
4. Completar el formulario con la información del servicio
5. Hacer clic en "Agregar Servicio"

**Opción 2 - Edición Manual:**
1. Editar `services.json`
2. Agregar nuevo objeto con estructura:
```json
{
  "id": "nuevo-servicio",
  "title": "Nuevo Servicio",
  "desc": "Descripción del servicio",
  "price": 100000,
  "duration": "60 minutos",
  "features": ["Característica 1", "Característica 2"]
}
```

### Nuevos Posts de Blog
1. Crear archivo en `posts/` con formato MDX
2. Agregar entrada en `posts.json`
3. El blog se actualizará automáticamente

### Modificar FAQ del Chat
**Opción 1 - Panel de Administración (Próximamente):**
- Sección dedicada para gestionar FAQ en el panel de administración

**Opción 2 - Edición Manual:**
Editar en `js/chat.js`:
```javascript
loadFAQ() {
    this.faq = [
        {
            question: 'Nueva pregunta',
            answer: 'Nueva respuesta'
        }
    ];
}
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `WOMPI_PUBLIC_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_ANALYTICS_ID`
3. Desplegar automáticamente

### Netlify
1. Arrastrar carpeta del proyecto a Netlify
2. Configurar variables de entorno
3. Desplegar

### GitHub Pages
1. Subir código a repositorio GitHub
2. Activar GitHub Pages en Settings
3. Seleccionar rama main como fuente

## 🔧 Desarrollo Local

### Instalación
1. Clonar repositorio
2. Abrir `index.html` en navegador
3. Para desarrollo con servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Estructura de Archivos
- **HTML**: Páginas principales con estructura semántica
- **CSS**: Estilos modulares y responsivos
- **JavaScript**: Funcionalidades interactivas
- **JSON**: Datos dinámicos de servicios
- **Assets**: Imágenes y recursos estáticos

## 📱 Responsive Design

El sitio está optimizado para:
- **Móviles**: 320px - 768px
- **Tablets**: 768px - 1024px
- **Desktop**: 1024px+

### Breakpoints CSS
```css
@media (max-width: 768px) { /* Mobile */ }
@media (max-width: 480px) { /* Small Mobile */ }
```

## ⚡ Performance

### Optimizaciones Implementadas
- CSS y JS minificados
- Imágenes optimizadas
- Lazy loading para recursos
- Caché de navegador
- Compresión gzip

### Lighthouse Score Objetivo
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## 🔒 Seguridad

### Implementado
- Validación de formularios
- Sanitización de inputs
- HTTPS obligatorio
- Headers de seguridad

### Recomendaciones
- Usar HTTPS en producción
- Configurar CSP headers
- Validar inputs en servidor
- Mantener dependencias actualizadas

## 📊 Analytics y SEO

### Google Analytics
- Tracking de páginas
- Eventos personalizados
- Conversiones de reservas
- Análisis de comportamiento

### SEO
- Meta tags optimizados
- Sitemap XML
- Robots.txt
- Estructura de datos
- URLs amigables

## 🆘 Soporte

### Problemas Comunes
1. **Chat no funciona**: Verificar conexión a internet
2. **Pagos no procesan**: Verificar llaves de Wompi
3. **Calendly no carga**: Verificar URL de Calendly
4. **Estilos no cargan**: Verificar rutas de archivos CSS
5. **Panel admin no carga**: Verificar que `admin.html` esté en la raíz del sitio
6. **Cambios no se guardan**: Verificar que localStorage esté habilitado en el navegador

### Contacto
Para soporte técnico o personalizaciones:
- Email: soporte@lauragiraldo.com
- Documentación: Este README
- Issues: Repositorio GitHub

## 📄 Licencia

Este proyecto está desarrollado para Laura Giraldo. Todos los derechos reservados.

---

**Desarrollado con ❤️ para el bienestar emocional** 