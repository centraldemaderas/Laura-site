// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.services = [];
        this.images = [];
        this.leads = [];
        this.posts = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.loadServices();
        this.loadImages();
        this.loadLeads();
        this.loadPosts();
    }

    // Navigation
    setupEventListeners() {
        // Navigation links with hash-sync
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    try { window.location.hash = section; } catch(_) {}
                }
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

    // Ensure the correct section is shown on load based on hash
    // (called from DOMContentLoaded at the bottom)

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
        const leadsCount = document.getElementById('leads-count');
        const leadsPending = document.getElementById('leads-pending');

        servicesCount && (servicesCount.textContent = `${this.services.length} servicios`);
        imagesCount && (imagesCount.textContent = `${this.images.length} imágenes`);
        if (leadsCount && leadsPending) {
            const pending = this.leads.filter(l => (l.estado||'pendiente') === 'pendiente').length;
            leadsCount.textContent = `${this.leads.length} recibidos`;
            leadsPending.textContent = `${pending} pendientes`;
        }

        // Analytics KPIs
        try{
            const analytics = JSON.parse(localStorage.getItem('siteAnalytics')||'{}');
            const kVisits = document.getElementById('kpi-visits');
            const kUsers = document.getElementById('kpi-users');
            const kTime = document.getElementById('kpi-time');
            if (kVisits && analytics.daily){
                const total = Object.values(analytics.daily).reduce((a,b)=>a+(b||0),0);
                kVisits.textContent = total;
            }
            if (kUsers && analytics.users){ kUsers.textContent = analytics.users; }
            if (kTime && analytics.time){
                const avg = analytics.time.sessions? Math.floor(analytics.time.totalSeconds/analytics.time.sessions):0;
                const mm = String(Math.floor(avg/60)).padStart(2,'0');
                const ss = String(avg%60).padStart(2,'0');
                kTime.textContent = `${mm}:${ss}`;
            }

            // Charts
            const visitsCtx = document.getElementById('visitsChart');
            if (visitsCtx && window.Chart){
                const labels = Object.keys(analytics.daily||{}).sort().slice(-14);
                const data = labels.map(d => (analytics.daily||{})[d]||0);
                new Chart(visitsCtx, { type:'line', data:{ labels, datasets:[{ label:'Visitas', data, borderColor:'#8FB7A5', backgroundColor:'rgba(143,183,165,.25)', tension:.3, fill:true }] }, options:{ plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true } } });
            }
            const pagesCtx = document.getElementById('pagesChart');
            if (pagesCtx && window.Chart){
                const entries = Object.entries(analytics.pages||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
                new Chart(pagesCtx, { type:'bar', data:{ labels: entries.map(e=>e[0]), datasets:[{ label:'Vistas', data: entries.map(e=>e[1]), backgroundColor:'#FFD873' }] }, options:{ plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true } } });
            }
        }catch(_){ }
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
            const saved = localStorage.getItem('adminServices');
            if (saved) {
                this.services = JSON.parse(saved);
            } else {
                const response = await fetch('services.json');
                this.services = await response.json();
                // Primera carga: guarda una copia editable local
                this.saveServices();
            }
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
        // Intento de persistir en Netlify Function (no bloqueante)
        try {
            fetch('/.netlify/functions/save-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.services)
            }).catch(()=>{});
        } catch(_) {}
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

    // Leads Management
    loadLeads(){
        try{
            const local = JSON.parse(localStorage.getItem('siteLeads') || '[]');
            const admin = JSON.parse(localStorage.getItem('adminLeads') || '[]');
            // Merge by createdAt+email
            const map = new Map();
            [...admin, ...local].forEach(l => {
                const key = `${l.createdAt}-${l.email}`;
                map.set(key, { ...l });
            });
            this.leads = Array.from(map.values()).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
            this.saveLeads();
            this.renderLeads();
            this.updateDashboard();
        }catch(err){
            console.error('Error loading leads', err);
        }
        // Bind actions
        const exportBtn = document.getElementById('export-leads');
        const clearBtn = document.getElementById('clear-leads');
        exportBtn && exportBtn.addEventListener('click', ()=> this.exportLeadsCSV());
        clearBtn && clearBtn.addEventListener('click', ()=> this.clearLeads());
    }

    saveLeads(){
        localStorage.setItem('adminLeads', JSON.stringify(this.leads));
    }

    renderLeads(){
        const tbody = document.querySelector('#leads-table tbody');
        if(!tbody) return;
        tbody.innerHTML = '';
        this.leads.forEach((lead, index)=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(lead.createdAt).toLocaleString()}</td>
                <td>${lead.nombre||''}</td>
                <td>${lead.email||''}</td>
                <td>${lead.telefono||''}</td>
                <td>${lead.servicio||''}</td>
                <td>
                    <select class="lead-select" data-field="estado" data-index="${index}">
                        <option ${lead.estado==='pendiente'?'selected':''} value="pendiente">Pendiente</option>
                        <option ${lead.estado==='contactado'?'selected':''} value="contactado">Contactado</option>
                        <option ${lead.estado==='cerrado'?'selected':''} value="cerrado">Cerrado</option>
                    </select>
                </td>
                <td>
                    <select class="lead-select" data-field="resultado" data-index="${index}">
                        <option ${lead.resultado===''?'selected':''} value="">—</option>
                        <option ${lead.resultado==='No contesta'?'selected':''} value="No contesta">No contesta</option>
                        <option ${lead.resultado==='Agenda llamada'?'selected':''} value="Agenda llamada">Agenda llamada</option>
                        <option ${lead.resultado==='Cita agendada'?'selected':''} value="Cita agendada">Cita agendada</option>
                        <option ${lead.resultado==='No interesado'?'selected':''} value="No interesado">No interesado</option>
                    </select>
                </td>
                <td>
                    <select class="lead-select" data-field="paciente" data-index="${index}">
                        <option ${lead.paciente==='Sin definir'?'selected':''} value="Sin definir">Sin definir</option>
                        <option ${lead.paciente==='Sí'?'selected':''} value="Sí">Sí</option>
                        <option ${lead.paciente==='No'?'selected':''} value="No">No</option>
                    </select>
                </td>
                <td><input class="lead-input" data-field="notas" data-index="${index}" value="${lead.notas||''}" placeholder="Notas"></td>
            `;
            tbody.appendChild(tr);
        });

        // Bind change events
        tbody.querySelectorAll('.lead-select, .lead-input').forEach(el=>{
            el.addEventListener('change', (e)=>{
                const field = e.target.getAttribute('data-field');
                const idx = parseInt(e.target.getAttribute('data-index'));
                const value = e.target.value;
                this.leads[idx][field] = value;
                this.saveLeads();
                this.updateDashboard();
            });
        });
    }

    exportLeadsCSV(){
        const header = ['Fecha','Nombre','Email','Teléfono','Servicio','Estado','Resultado','Paciente','Notas'];
        const rows = this.leads.map(l=>[
            new Date(l.createdAt).toLocaleString(), l.nombre||'', l.email||'', l.telefono||'', l.servicio||'', l.estado||'', l.resultado||'', l.paciente||'', (l.notas||'').replace(/\n/g,' ')
        ]);
        const csv = [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click();
        URL.revokeObjectURL(url);
    }

    clearLeads(){
        if(confirm('Esto eliminará los leads guardados localmente. ¿Continuar?')){
            this.leads = [];
            this.saveLeads();
            this.renderLeads();
            this.updateDashboard();
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
        window.updateService = () => this.updateService();
        window.closeEditServiceModal = () => this.closeEditServiceModal();
        window.saveContent = () => this.saveContent();
        window.resetContent = () => this.resetContent();
        window.saveTeam = () => this.saveTeam();
        window.saveSettings = () => this.saveSettings();
        window.savePost = () => this.savePost();
        window.deletePost = (i) => this.deletePost(i);
    }

    // Blog management
    getDefaultPosts(){
        // Semillas iniciales basadas en el sitio actual
        return [
            { slug:'autocuidado-emocional', title:'Autocuidado Emocional: Estrategias para el Día a Día', date:'2024-11-15', cover:'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop', summary:'Estrategias prácticas para cuidar tu salud emocional en la rutina diaria.', content:'<p>El autocuidado emocional es fundamental para mantener una buena salud mental.</p>', active:true },
            { slug:'tecnicas-ansiedad', title:'Técnicas para Manejar la Ansiedad', date:'2024-11-10', cover:'https://images.unsplash.com/photo-1523246191918-0a1f1a17f6d3?q=80&w=1200&auto=format&fit=crop', summary:'Técnicas y herramientas para manejar la ansiedad de manera efectiva.', content:'<p>La ansiedad es una respuesta natural del cuerpo, pero cuando se vuelve excesiva puede interferir con nuestra vida.</p>', active:true },
            { slug:'comunicacion-asertiva', title:'Comunicación Asertiva en las Relaciones', date:'2024-11-05', cover:'https://images.unsplash.com/photo-1529336953121-4d4f0b1b1a5e?q=80&w=1200&auto=format&fit=crop', summary:'Mejora tus relaciones con una comunicación clara y respetuosa.', content:'<p>La comunicación asertiva es la habilidad de expresar tus pensamientos y sentimientos de forma honesta y respetuosa.</p>', active:true },
            { slug:'mindfulness-vida-cotidiana', title:'El Poder del Mindfulness en la Vida Cotidiana', date:'2024-11-01', cover:'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?q=80&w=1200&auto=format&fit=crop', summary:'Integra mindfulness en tu día para reducir el estrés y ganar claridad.', content:'<p>Integrar mindfulness en tu día a día reduce el estrés y mejora la claridad mental.</p>', active:true },
            { slug:'superando-depresion', title:'Superando la Depresión: Un Camino hacia la Recuperación', date:'2024-10-25', cover:'https://images.unsplash.com/photo-1520975693416-35a0d6a5f0c9?q=80&w=1200&auto=format&fit=crop', summary:'Información valiosa sobre la depresión y cómo abordarla.', content:'<p>La recuperación es posible con apoyo adecuado, hábitos saludables y autocompasión.</p>', active:true },
            { slug:'desarrollo-autoestima', title:'Desarrollo de la Autoestima: Construyendo Confianza', date:'2024-10-20', cover:'https://images.unsplash.com/photo-1520975928316-56c0d6b7d3f5?q=80&w=1200&auto=format&fit=crop', summary:'Estrategias prácticas para fortalecer tu autoestima.', content:'<p>Fortalecer la autoestima implica aceptar imperfecciones y celebrar avances.</p>', active:true },
        ];
    }
    loadPosts(){
        const saved = localStorage.getItem('adminPosts');
        if (saved) {
            this.posts = JSON.parse(saved);
        } else {
            this.posts = this.getDefaultPosts();
            localStorage.setItem('adminPosts', JSON.stringify(this.posts));
        }
        this.renderPosts();
    }

    renderPosts(){
        const list = document.getElementById('blog-list');
        if (!list) return;
        list.innerHTML = '';
        if (!this.posts || !this.posts.length){
            list.innerHTML = '<p style="opacity:.7">Aún no hay artículos.</p>';
            return;
        }
        this.posts.forEach((p,i)=>{
            const item = document.createElement('div');
            item.className = 'service-item';
            item.innerHTML = `
                <div class="service-info">
                    <div style="display:flex; gap:12px; align-items:flex-start;">
                        <img src="${p.cover||''}" alt="thumb" style="width:72px; height:72px; object-fit:cover; border-radius:8px; border:1px solid #e9ecef;" onerror="this.style.display='none'"/>
                        <div>
                            <h4 style="margin:0 0 .25rem 0;">${p.title}</h4>
                            <p style="margin:0 0 .25rem 0; opacity:.75;">${(p.summary||'').substring(0,120)}${(p.summary||'').length>120?'…':''}</p>
                            <small>Slug: ${p.slug} · Fecha: ${p.date||'-'}</small>
                        </div>
                    </div>
                </div>
                <div class="service-actions">
                    <label class="switch"><input type="checkbox" ${p.active!==false?'checked':''} onchange="adminPanel.togglePostActive(${i}, this.checked)"><span class="slider"></span></label>
                    <button class="edit-btn" onclick="adminPanel.showBlogModal(${i})"><i class='fas fa-edit'></i> Editar</button>
                    <button class="delete-btn" onclick="adminPanel.deletePost(${i})"><i class='fas fa-trash'></i> Eliminar</button>
                </div>`;
            list.appendChild(item);
        });
    }

    showBlogModal(index){
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'blog-modal';
        const p = (typeof index==='number') ? this.posts[index] : { title:'', slug:'', date:'', summary:'', cover:'', content:'' };
        this.editingPostIndex = (typeof index==='number') ? index : null;
        modal.innerHTML = `
            <div class='modal-content'>
              <div class='modal-header'>
                <h2>${this.editingPostIndex!=null?'Editar Artículo':'Nuevo Artículo'}</h2>
                <button class='modal-close' onclick="document.getElementById('blog-modal').remove()"><i class='fas fa-times'></i></button>
              </div>
              <div class='modal-body'>
                <div class='form-group'><label>Título</label><input id='post-title-input' class='form-input' value='${p.title||''}'></div>
                <div class='form-row'>
                  <div class='form-group'><label>Slug</label><input id='post-slug-input' class='form-input' value='${p.slug||''}'></div>
                  <div class='form-group'><label>Fecha</label><input id='post-date-input' type='date' class='form-input' value='${p.date||''}'></div>
                </div>
                <div class='form-group'><label>Resumen</label><textarea id='post-summary-input' class='form-textarea' rows='3'>${p.summary||''}</textarea></div>
                <div class='form-group'><label>Imagen (URL)</label><input id='post-cover-input' class='form-input' value='${p.cover||''}'></div>
                <div class='form-group'><label>Contenido (HTML)</label><textarea id='post-body-input' class='form-textarea' rows='8'>${p.content||''}</textarea></div>
                <div class='form-group'><label><input type='checkbox' id='post-active-input' ${p.active!==false?'checked':''}> Activo</label></div>
              </div>
              <div class='modal-footer'>
                <button class='btn-secondary' onclick="document.getElementById('blog-modal').remove()">Cancelar</button>
                <button class='btn-primary' onclick='savePost()'>Guardar</button>
              </div>
            </div>`;
        document.body.appendChild(modal);
    }

    savePost(){
        const post = {
            title: document.getElementById('post-title-input').value.trim(),
            slug: document.getElementById('post-slug-input').value.trim(),
            date: document.getElementById('post-date-input').value,
            summary: document.getElementById('post-summary-input').value.trim(),
            cover: document.getElementById('post-cover-input').value.trim(),
            content: document.getElementById('post-body-input').value,
            active: document.getElementById('post-active-input').checked
        };
        if (!post.title || !post.slug) { this.showNotification('Título y slug son obligatorios', 'error'); return; }
        if (!this.posts) this.posts = [];
        if (this.editingPostIndex!=null) this.posts[this.editingPostIndex] = post; else this.posts.unshift(post);
        localStorage.setItem('adminPosts', JSON.stringify(this.posts));
        const m = document.getElementById('blog-modal'); if (m) m.remove();
        this.renderPosts();
        this.showNotification('Artículo guardado', 'success');
    }

    deletePost(i){
        if (!confirm('¿Eliminar este artículo?')) return;
        this.posts.splice(i,1);
        localStorage.setItem('adminPosts', JSON.stringify(this.posts));
        this.renderPosts();
        this.showNotification('Artículo eliminado', 'success');
    }

    togglePostActive(i, checked){
        this.posts[i].active = !!checked;
        localStorage.setItem('adminPosts', JSON.stringify(this.posts));
        this.showNotification(checked?'Artículo activado':'Artículo desactivado','success');
    }

    // Edit service modal logic
    showEditServiceModal(service, index) {
        this.editingIndex = index;
        const modal = document.getElementById('edit-service-modal');
        const t = service.title || '';
        const d = service.desc || '';
        const p = service.price || '';
        const du = service.duration || '';
        const f = (service.features || []).join('\n');
        document.getElementById('edit-service-title').value = t;
        document.getElementById('edit-service-desc').value = d;
        document.getElementById('edit-service-price').value = p;
        document.getElementById('edit-service-duration').value = du;
        document.getElementById('edit-service-features').value = f;
        // preview
        document.getElementById('preview-service-title').textContent = t || '—';
        document.getElementById('preview-service-desc').textContent = d || '—';
        document.getElementById('preview-service-price').textContent = p ? `$${Number(p).toLocaleString()} COP` : '$0 COP';
        document.getElementById('preview-service-duration').textContent = du || '—';
        document.getElementById('preview-service-features').textContent = (service.features||[]).length ? (service.features||[]).join('\n') : '—';
        modal.classList.add('active');
    }

    closeEditServiceModal() {
        const modal = document.getElementById('edit-service-modal');
        if (modal) modal.classList.remove('active');
    }

    updateService() {
        if (this.editingIndex === undefined || this.editingIndex === null) return;
        const title = document.getElementById('edit-service-title').value;
        const desc = document.getElementById('edit-service-desc').value;
        const price = parseInt(document.getElementById('edit-service-price').value);
        const duration = document.getElementById('edit-service-duration').value;
        const featuresText = document.getElementById('edit-service-features').value;

        if (!title || !desc || !price || !duration) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        const features = featuresText.split('\n').filter(f => f.trim());

        this.services[this.editingIndex] = {
            ...this.services[this.editingIndex],
            title, desc, price, duration, features
        };
        this.saveServices();
        this.renderServices();
        this.updateDashboard();
        this.closeEditServiceModal();
        this.showNotification('Servicio actualizado exitosamente', 'success');
    }

    // Live preview bindings
    bindServicePreviewInputs(){
        const map = [
            ['edit-service-title','preview-service-title', v=>v||'—'],
            ['edit-service-desc','preview-service-desc', v=>v||'—'],
            ['edit-service-price','preview-service-price', v=> v?`$${Number(v).toLocaleString()} COP`:'$0 COP'],
            ['edit-service-duration','preview-service-duration', v=>v||'—'],
            ['edit-service-features','preview-service-features', v=> v? v.split('\n').filter(Boolean).join('\n') : '—']
        ];
        map.forEach(([inputId, previewId, transform])=>{
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            if (input && preview) {
                input.addEventListener('input', ()=>{ preview.textContent = transform(input.value); });
            }
        });
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    adminPanel.exportToGlobal();
        adminPanel.bindServicePreviewInputs();
    // Hash routing for admin sections
    try{
        const hash = (window.location.hash||'').replace('#','');
        if (hash) {
            adminPanel.showSection(hash);
        }
    }catch(_){ }
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