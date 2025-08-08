// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.services = [];
        this.images = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.loadServices();
        this.loadImages();
    }

    // Navigation
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Image upload
        const uploadZone = document.getElementById('upload-zone');
        const imageUpload = document.getElementById('image-upload');

        uploadZone.addEventListener('click', () => imageUpload.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#FFD873';
            uploadZone.style.background = 'rgba(255, 216, 115, 0.05)';
        });
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#8FB7A5';
            uploadZone.style.background = 'transparent';
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#8FB7A5';
            uploadZone.style.background = 'transparent';
            const files = e.dataTransfer.files;
            this.handleImageUpload(files);
        });

        imageUpload.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files);
        });

        // Team photo uploads
        document.getElementById('laura-photo-upload').addEventListener('change', (e) => {
            this.handleTeamPhotoUpload(e.target.files[0], 'laura');
        });

        document.getElementById('luisa-photo-upload').addEventListener('change', (e) => {
            this.handleTeamPhotoUpload(e.target.files[0], 'luisa');
        });

        // Auto-save content changes
        document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveContent();
            });
        });
    }

    showSection(section) {
        // Update navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.admin-section').forEach(s => {
            s.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
    }

    showTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-content`).classList.add('active');
    }

    // Dashboard
    updateDashboard() {
        const servicesCount = document.getElementById('services-count');
        const imagesCount = document.getElementById('images-count');

        servicesCount.textContent = `${this.services.length} servicios`;
        imagesCount.textContent = `${this.images.length} imágenes`;
    }

    // Content Management
    loadData() {
        const savedContent = localStorage.getItem('adminContent');
        if (savedContent) {
            const content = JSON.parse(savedContent);
            this.populateContentFields(content);
        }
    }

    populateContentFields(content) {
        Object.keys(content).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = content[key];
            }
        });
    }

    autoSaveContent() {
        const content = {};
        document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            content[input.id] = input.value;
        });
        localStorage.setItem('adminContent', JSON.stringify(content));
    }

    saveContent() {
        this.autoSaveContent();
        this.showNotification('Contenido guardado exitosamente', 'success');
    }

    resetContent() {
        if (confirm('¿Estás seguro de que quieres restaurar el contenido original?')) {
            localStorage.removeItem('adminContent');
            location.reload();
        }
    }

    // Services Management
    async loadServices() {
        try {
            const response = await fetch('services.json');
            this.services = await response.json();
            this.renderServices();
            this.updateDashboard();
        } catch (error) {
            console.error('Error loading services:', error);
            this.showNotification('Error al cargar servicios', 'error');
        }
    }

    renderServices() {
        const servicesList = document.getElementById('services-list');
        servicesList.innerHTML = '';

        this.services.forEach((service, index) => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'service-item';
            serviceItem.innerHTML = `
                <div class="service-info">
                    <h4>${service.title}</h4>
                    <p>${service.desc.substring(0, 100)}...</p>
                    <small>Precio: $${service.price.toLocaleString()} COP | Duración: ${service.duration}</small>
                </div>
                <div class="service-actions">
                    <button class="edit-btn" onclick="adminPanel.editService(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="adminPanel.deleteService(${index})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            servicesList.appendChild(serviceItem);
        });
    }

    editService(index) {
        const service = this.services[index];
        this.showEditServiceModal(service, index);
    }

    deleteService(index) {
        if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            this.services.splice(index, 1);
            this.saveServices();
            this.renderServices();
            this.updateDashboard();
            this.showNotification('Servicio eliminado exitosamente', 'success');
        }
    }

    showAddServiceModal() {
        document.getElementById('add-service-modal').classList.add('active');
        // Clear form
        document.getElementById('new-service-title').value = '';
        document.getElementById('new-service-desc').value = '';
        document.getElementById('new-service-price').value = '';
        document.getElementById('new-service-duration').value = '';
        document.getElementById('new-service-features').value = '';
    }

    closeAddServiceModal() {
        document.getElementById('add-service-modal').classList.remove('active');
    }

    addNewService() {
        const title = document.getElementById('new-service-title').value;
        const desc = document.getElementById('new-service-desc').value;
        const price = parseInt(document.getElementById('new-service-price').value);
        const duration = document.getElementById('new-service-duration').value;
        const featuresText = document.getElementById('new-service-features').value;

        if (!title || !desc || !price || !duration) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        const features = featuresText.split('\n').filter(f => f.trim());

        const newService = {
            id: this.generateId(),
            title,
            desc,
            price,
            duration,
            features
        };

        this.services.push(newService);
        this.saveServices();
        this.renderServices();
        this.updateDashboard();
        this.closeAddServiceModal();
        this.showNotification('Servicio agregado exitosamente', 'success');
    }

    saveServices() {
        localStorage.setItem('adminServices', JSON.stringify(this.services));
        // In a real application, you would save to the server here
    }

    generateId() {
        return 'service_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Image Management
    handleImageUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    this.showNotification('La imagen es demasiado grande. Máximo 5MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: this.generateImageId(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: e.target.result,
                        uploadedAt: new Date().toISOString()
                    };

                    this.images.push(imageData);
                    this.saveImages();
                    this.renderImages();
                    this.updateDashboard();
                    this.showNotification('Imagen subida exitosamente', 'success');
                };
                reader.readAsDataURL(file);
            } else {
                this.showNotification('Solo se permiten archivos de imagen', 'error');
            }
        });
    }

    generateImageId() {
        return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    renderImages() {
        const imagesGrid = document.getElementById('images-grid');
        imagesGrid.innerHTML = '';

        this.images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <img src="${image.data}" alt="${image.name}" class="image-preview">
                <div class="image-info">
                    <h4>${image.name}</h4>
                    <p>${(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    <div class="image-actions">
                        <button class="copy-btn" onclick="adminPanel.copyImagePath('${image.id}')">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                        <button class="delete-btn" onclick="adminPanel.deleteImage(${index})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
            imagesGrid.appendChild(imageItem);
        });
    }

    copyImagePath(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (image) {
            navigator.clipboard.writeText(image.data).then(() => {
                this.showNotification('Ruta de imagen copiada al portapapeles', 'success');
            });
        }
    }

    deleteImage(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            this.images.splice(index, 1);
            this.saveImages();
            this.renderImages();
            this.updateDashboard();
            this.showNotification('Imagen eliminada exitosamente', 'success');
        }
    }

    saveImages() {
        localStorage.setItem('adminImages', JSON.stringify(this.images));
    }

    loadImages() {
        const savedImages = localStorage.getItem('adminImages');
        if (savedImages) {
            this.images = JSON.parse(savedImages);
            this.renderImages();
        }
    }

    // Team Management
    handleTeamPhotoUpload(file, member) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById(`${member}-photo-preview`);
                if (member === 'luisa') {
                    preview.innerHTML = `<img src="${e.target.result}" alt="${member}" class="photo-preview">`;
                } else {
                    preview.src = e.target.result;
                }
                
                // Save to localStorage
                const teamData = JSON.parse(localStorage.getItem('adminTeam') || '{}');
                teamData[member] = e.target.result;
                localStorage.setItem('adminTeam', JSON.stringify(teamData));
                
                this.showNotification(`Foto de ${member} actualizada exitosamente`, 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    saveTeam() {
        const teamData = {
            laura: {
                title: document.getElementById('laura-title').value,
                description: document.getElementById('laura-description').value
            },
            luisa: {
                title: document.getElementById('luisa-title').value,
                description: document.getElementById('luisa-description').value
            }
        };

        localStorage.setItem('adminTeamData', JSON.stringify(teamData));
        this.showNotification('Información del equipo guardada exitosamente', 'success');
    }

    // Settings Management
    saveSettings() {
        const settings = {
            siteTitle: document.getElementById('site-title').value,
            siteDescription: document.getElementById('site-description').value,
            contactEmail: document.getElementById('settings-contact-email').value,
            contactPhone: document.getElementById('settings-contact-phone').value,
            calendlyUrl: document.getElementById('calendly-url').value,
            wompiKey: document.getElementById('wompi-key').value,
            googleAnalytics: document.getElementById('google-analytics').value
        };

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.showNotification('Configuración guardada exitosamente', 'success');
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Export functions to global scope
    exportToGlobal() {
        window.showSection = (section) => this.showSection(section);
        window.showAddServiceModal = () => this.showAddServiceModal();
        window.closeAddServiceModal = () => this.closeAddServiceModal();
        window.addNewService = () => this.addNewService();
        window.saveContent = () => this.saveContent();
        window.resetContent = () => this.resetContent();
        window.saveTeam = () => this.saveTeam();
        window.saveSettings = () => this.saveSettings();
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    adminPanel.exportToGlobal();
});

// Global functions for onclick handlers
function showSection(section) {
    if (adminPanel) adminPanel.showSection(section);
}

function showAddServiceModal() {
    if (adminPanel) adminPanel.showAddServiceModal();
}

function closeAddServiceModal() {
    if (adminPanel) adminPanel.closeAddServiceModal();
}

function addNewService() {
    if (adminPanel) adminPanel.addNewService();
}

function saveContent() {
    if (adminPanel) adminPanel.saveContent();
}

function resetContent() {
    if (adminPanel) adminPanel.resetContent();
}

function saveTeam() {
    if (adminPanel) adminPanel.saveTeam();
}

function saveSettings() {
    if (adminPanel) adminPanel.saveSettings();
} 