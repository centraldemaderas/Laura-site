// Fallback local por si no se puede leer el JSON (p.ej. abriendo el HTML con file://)
const DEFAULT_SERVICES = [
    { id: 'individual', title: 'Terapia Individual', desc: 'Sesiones personalizadas para trabajar en tu crecimiento personal, manejo de emociones y superación de dificultades. Enfoque en ansiedad, depresión, autoestima y desarrollo personal.', price: 80000, duration: '50 minutos', features: ['Sesión personalizada 1 a 1', 'Enfoque en tus necesidades específicas', 'Herramientas prácticas para el día a día', 'Seguimiento continuo de tu progreso', 'Espacio seguro y confidencial'] },
    { id: 'pareja', title: 'Terapia de Pareja', desc: 'Acompañamiento especializado para mejorar la comunicación, resolver conflictos y fortalecer tu relación. Trabajamos juntos para construir una relación más saludable.', price: 120000, duration: '80 minutos', features: ['Sesiones para ambos miembros de la pareja', 'Mejora en la comunicación', 'Resolución de conflictos', 'Fortalecimiento del vínculo afectivo', 'Herramientas para el día a día'] },
    { id: 'online', title: 'Terapia Online', desc: 'Sesiones virtuales desde la comodidad de tu hogar, manteniendo la misma calidad y profesionalismo. Ideal para personas con horarios ocupados o que prefieren la comodidad.', price: 70000, duration: '50 minutos', features: ['Sesiones desde cualquier lugar', 'Misma calidad que sesiones presenciales', 'Horarios flexibles', 'Plataforma segura y confidencial', 'Sin necesidad de desplazamiento'] },
    { id: 'adolescentes', title: 'Terapia para Adolescentes', desc: 'Acompañamiento especializado para adolescentes que enfrentan desafíos emocionales, sociales y de desarrollo. Creo un espacio seguro donde pueden expresarse libremente.', price: 75000, duration: '50 minutos', features: ['Enfoque especializado en adolescentes', 'Espacio seguro para expresión', 'Manejo de ansiedad y estrés', 'Desarrollo de habilidades sociales', 'Acompañamiento en el proceso de crecimiento'] },
    { id: 'familia', title: 'Terapia Familiar', desc: 'Trabajo con toda la familia para mejorar la dinámica familiar, resolver conflictos y fortalecer los vínculos afectivos. Enfoque sistémico para el bienestar colectivo.', price: 150000, duration: '90 minutos', features: ['Sesiones con toda la familia', 'Mejora en la dinámica familiar', 'Resolución de conflictos', 'Fortalecimiento de vínculos', 'Herramientas para la comunicación familiar'] },
    { id: 'evaluacion', title: 'Evaluación Psicológica', desc: 'Evaluación completa para identificar necesidades específicas y crear un plan de tratamiento personalizado. Incluye entrevista clínica y pruebas estandarizadas.', price: 200000, duration: '120 minutos', features: ['Evaluación completa', 'Entrevista clínica detallada', 'Pruebas estandarizadas', 'Informe escrito detallado', 'Plan de tratamiento personalizado'] }
];

// Función para cargar servicios priorizando los guardados desde el administrador
async function loadServices() {
    try {
        const local = JSON.parse(localStorage.getItem('adminServices') || '[]');
        if (Array.isArray(local) && local.length) {
            renderServices(local);
            return;
        }
        const response = await fetch('services.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo cargar los servicios');
        const services = await response.json();
        renderServices(services && services.length ? services : DEFAULT_SERVICES);
    } catch (error) {
        console.warn('Cargando servicios desde fallback local. Motivo:', error.message);
        renderServices(DEFAULT_SERVICES);
    }
}

// Función para renderizar los servicios
function renderServices(services) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = '';

    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${getServiceIcon(service.id)}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.desc}</p>
            <div class="service-details">
                <div class="service-duration">
                    <i class="fas fa-clock"></i>
                    <span>${service.duration}</span>
                </div>
                <div class="service-price">$${formatPrice(service.price)} COP</div>
            </div>
            <div class="service-features">
                <ul>
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <button class="btn btn-primary" onclick="showServiceDetails('${service.id}')">
                Más Información
            </button>
        `;
        servicesGrid.appendChild(serviceCard);
    });

    // Animar las tarjetas cuando aparezcan
    animateServiceCards();
}

// Función para obtener el ícono según el tipo de servicio
function getServiceIcon(serviceId) {
    const icons = {
        'individual': 'fas fa-user',
        'pareja': 'fas fa-heart',
        'online': 'fas fa-video',
        'adolescentes': 'fas fa-graduation-cap',
        'familia': 'fas fa-users',
        'evaluacion': 'fas fa-clipboard-list'
    };
    return icons[serviceId] || 'fas fa-brain';
}

// Función para formatear el precio
function formatPrice(price) {
    return price.toLocaleString('es-CO');
}

// Función para mostrar detalles del servicio (placeholder)
function showServiceDetails(serviceId) {
    // Aquí puedes implementar un modal o redirección
    console.log('Mostrar detalles del servicio:', serviceId);
    // Por ahora, redirigir a la página de reserva
    window.location.href = 'reserva.html';
}

// Función para animar las tarjetas de servicios
function animateServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Función para mostrar error
function showError() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = `
        <div class="error-container" style="text-align: center; grid-column: 1 / -1; padding: 3rem;">
            <div style="font-size: 4rem; color: #FFD873; margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 style="color: #FFD873; margin-bottom: 1rem;">Error al cargar servicios</h3>
            <p style="color: #FFFFFF; margin-bottom: 2rem;">Error al cargar los servicios. Por favor, recarga la página.</p>
            <button class="btn btn-primary" onclick="location.reload()">Recargar Página</button>
        </div>
    `;
}

// Cargar servicios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo cargar servicios si estamos en la página de servicios
    if (document.querySelector('.services-grid')) {
        loadServices();
    }
});

// Exportar funciones para uso global
window.loadServices = loadServices;
window.showServiceDetails = showServiceDetails; 