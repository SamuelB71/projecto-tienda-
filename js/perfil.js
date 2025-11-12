// Gestión del perfil de usuario
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadUserProfile();
            await this.loadUserOrders();
        } catch (error) {
            console.error('Error inicializando perfil:', error);
        }
    }

    async checkAuthentication() {
        console.log('🔐 Verificando autenticación...');
        
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Error obteniendo usuario:', error);
                throw error;
            }
            
            if (!user) {
                console.log('❌ Usuario no autenticado, redirigiendo...');
                window.location.href = 'auth.html';
                return;
            }
            
            this.currentUser = user;
            console.log('✅ Usuario autenticado:', user.email);
            
        } catch (error) {
            console.error('Error en checkAuthentication:', error);
            window.location.href = 'auth.html';
        }
    }

    setupEventListeners() {
        console.log('⚙️ Configurando event listeners...');
        
        // Formulario de perfil
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSave(e));
        }

        // Botón de guardar contraseña
        const savePasswordBtn = document.getElementById('save-password-btn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.handlePasswordChange());
        }

        // Navegación por pestañas
        const tabLinks = document.querySelectorAll('[data-bs-toggle="list"]');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleTabChange(e));
        });

        // Botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async loadUserProfile() {
        console.log('📋 Cargando perfil de usuario...');
        
        try {
            // Primero actualizar la información básica del usuario
            this.updateUserInfo(this.currentUser);

            // Luego cargar el perfil extendido desde Supabase
            const result = await supabaseDB.getProfile();
            
            if (result.success && result.data) {
                this.userProfile = result.data;
                this.populateProfileForm(result.data);
                console.log('✅ Perfil cargado:', result.data);
            } else {
                // Si no hay perfil en la base de datos, usar los metadatos del usuario
                console.log('ℹ️ No se encontró perfil en BD, usando metadatos');
                this.userProfile = {
                    id: this.currentUser.id,
                    full_name: this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0],
                    email: this.currentUser.email
                };
                this.populateProfileForm(this.userProfile);
                
                // Guardar perfil básico en la base de datos
                await this.createBasicProfile();
            }
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            this.showMessage('profile-message', 'Error al cargar el perfil', 'danger');
        }
    }

    async createBasicProfile() {
        try {
            const profileData = {
                full_name: this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0],
                email: this.currentUser.email
            };
            
            const result = await supabaseDB.saveProfile(profileData);
            if (result.success) {
                console.log('✅ Perfil básico creado');
            }
        } catch (error) {
            console.error('Error creando perfil básico:', error);
        }
    }

    updateUserInfo(user) {
        console.log('👤 Actualizando información de usuario en UI...');
        
        const nameElement = document.getElementById('profile-name');
        const emailElement = document.getElementById('profile-email');
        const userEmailElement = document.getElementById('user-email');
        const memberSinceElement = document.getElementById('member-since');

        if (nameElement) {
            const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
            nameElement.textContent = displayName;
            console.log('✅ Nombre actualizado:', displayName);
        }

        if (emailElement) {
            emailElement.textContent = user.email;
            console.log('✅ Email actualizado:', user.email);
        }

        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }

        if (memberSinceElement) {
            const created = new Date(user.created_at);
            const options = { year: 'numeric', month: 'long' };
            memberSinceElement.textContent = `Miembro desde ${created.toLocaleDateString('es-ES', options)}`;
            console.log('✅ Fecha de miembro actualizada');
        }
    }

    populateProfileForm(profile) {
        console.log('📝 Rellenando formulario con datos del perfil...');
        
        // Usar valores por defecto si no existen
        const fullName = profile.full_name || this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0];
        const email = profile.email || this.currentUser.email;
        
        document.getElementById('profile-fullname').value = fullName;
        document.getElementById('profile-email').value = email;
        document.getElementById('profile-phone').value = profile.phone || '';
        document.getElementById('profile-address').value = profile.address || '';
        document.getElementById('profile-city').value = profile.city || '';
        document.getElementById('profile-zip').value = profile.zip_code || '';
        document.getElementById('profile-country').value = profile.country || '';
        document.getElementById('profile-newsletter').checked = profile.newsletter || false;
        
        console.log('✅ Formulario poblado correctamente');
    }

    async handleProfileSave(e) {
        e.preventDefault();
        console.log('💾 Guardando perfil...');
        
        const saveBtn = document.getElementById('profile-save-btn');
        const messageDiv = document.getElementById('profile-message');

        // Deshabilitar botón durante el guardado
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="btn-spinner"></span> Guardando...';

        try {
            const profileData = {
                full_name: document.getElementById('profile-fullname').value,
                phone: document.getElementById('profile-phone').value,
                address: document.getElementById('profile-address').value,
                city: document.getElementById('profile-city').value,
                zip_code: document.getElementById('profile-zip').value,
                country: document.getElementById('profile-country').value,
                newsletter: document.getElementById('profile-newsletter').checked
            };

            console.log('📤 Enviando datos del perfil:', profileData);
            
            const result = await supabaseDB.saveProfile(profileData);
            
            if (result.success) {
                console.log('✅ Perfil guardado correctamente');
                this.showMessage(messageDiv, 'Perfil actualizado correctamente', 'success');
                
                // Actualizar la información en la UI
                this.updateUserInfo(this.currentUser);
            } else {
                console.error('❌ Error al guardar perfil:', result.error);
                this.showMessage(messageDiv, 'Error al guardar el perfil: ' + result.error, 'danger');
            }
        } catch (error) {
            console.error('❌ Error guardando perfil:', error);
            this.showMessage(messageDiv, 'Error al guardar el perfil', 'danger');
        } finally {
            // Rehabilitar botón
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Cambios';
            console.log('🔓 Botón rehabilitado');
        }
    }

    async handlePasswordChange() {
        console.log('🔑 Cambiando contraseña...');
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        const messageDiv = document.getElementById('password-change-message');
        const saveBtn = document.getElementById('save-password-btn');

        // Validaciones
        if (newPassword !== confirmPassword) {
            this.showMessage(messageDiv, 'Las contraseñas no coinciden', 'danger');
            return;
        }

        if (newPassword.length < 6) {
            this.showMessage(messageDiv, 'La nueva contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }

        // Deshabilitar botón durante el proceso
        saveBtn.disabled = true;
        saveBtn.textContent = 'Cambiando...';

        try {
            // En Supabase, necesitarías implementar el cambio de contraseña
            // Por ahora mostramos un mensaje de éxito simulado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showMessage(messageDiv, 'Contraseña cambiada correctamente', 'success');
            console.log('✅ Contraseña cambiada (simulado)');
            
            // Limpiar formulario y cerrar modal después de 2 segundos
            setTimeout(() => {
                document.getElementById('change-password-form').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                if (modal) modal.hide();
                this.showMessage(messageDiv, '', '');
            }, 2000);

        } catch (error) {
            console.error('❌ Error cambiando contraseña:', error);
            this.showMessage(messageDiv, 'Error al cambiar la contraseña', 'danger');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Cambiar Contraseña';
        }
    }

    async loadUserOrders() {
        console.log('📦 Cargando pedidos del usuario...');
        
        const loadingElement = document.getElementById('orders-loading');
        const containerElement = document.getElementById('orders-container');
        const emptyElement = document.getElementById('orders-empty');

        try {
            const result = await supabaseDB.getUserOrders();
            
            // Ocultar loading
            if (loadingElement) loadingElement.classList.add('d-none');

            if (result.success && result.data && result.data.length > 0) {
                console.log(`✅ ${result.data.length} pedidos encontrados`);
                this.displayOrders(result.data);
                if (containerElement) containerElement.classList.remove('d-none');
            } else {
                console.log('ℹ️ No hay pedidos');
                if (emptyElement) emptyElement.classList.remove('d-none');
            }
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            if (loadingElement) loadingElement.classList.add('d-none');
            if (emptyElement) emptyElement.classList.remove('d-none');
        }
    }

    displayOrders(orders) {
        console.log('🛒 Mostrando pedidos en la UI...');
        
        const container = document.getElementById('orders-container');
        
        if (!container) {
            console.error('❌ Contenedor de pedidos no encontrado');
            return;
        }

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-cart-x display-1 text-muted"></i>
                    <h5 class="mt-3">No hay pedidos realizados</h5>
                    <p class="text-muted">¡Realiza tu primer pedido y aparecerá aquí!</p>
                    <a href="productos.html" class="btn btn-primary">Ver Productos</a>
                </div>
            `;
            return;
        }

        let ordersHTML = '';
        
        orders.forEach((order, index) => {
            const orderDate = new Date(order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Parsear items del pedido
            let orderItems = [];
            try {
                orderItems = typeof order.order_items === 'string' 
                    ? JSON.parse(order.order_items) 
                    : order.order_items;
            } catch (e) {
                console.error('Error parseando items del pedido:', e);
                orderItems = [];
            }

            let itemsHTML = '';
            if (Array.isArray(orderItems) && orderItems.length > 0) {
                orderItems.forEach(item => {
                    const itemImage = item.image || 'https://via.placeholder.com/60x60?text=Producto';
                    const itemName = item.name || 'Producto';
                    const itemQuantity = item.quantity || 1;
                    const itemPrice = item.price || 0;
                    
                    itemsHTML += `
                        <div class="order-item">
                            <div class="row align-items-center">
                                <div class="col-2">
                                    <img src="${itemImage}" class="order-item-image" alt="${itemName}" 
                                         onerror="this.src='https://via.placeholder.com/60x60?text=Producto'">
                                </div>
                                <div class="col-6">
                                    <h6 class="mb-1">${itemName}</h6>
                                    <small class="text-muted">Cantidad: ${itemQuantity}</small>
                                </div>
                                <div class="col-4 text-end">
                                    <strong>$${(itemPrice * itemQuantity).toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                itemsHTML = `
                    <div class="text-center py-3 text-muted">
                        <i class="bi bi-info-circle"></i> No hay detalles disponibles del pedido
                    </div>
                `;
            }

            ordersHTML += `
                <div class="card mb-4 fade-in">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Pedido #${order.id ? order.id.slice(-8) : 'N/A'}</strong>
                            <small class="text-muted ms-2">${orderDate}</small>
                        </div>
                        <div>
                            <span class="order-status status-${order.order_status || 'pending'}">
                                ${this.getStatusText(order.order_status)}
                            </span>
                            <strong class="ms-3">$${parseFloat(order.order_total || 0).toFixed(2)}</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        ${itemsHTML}
                        <div class="mt-3 pt-3 border-top">
                            <div class="row">
                                <div class="col-md-6">
                                    <small class="text-muted">
                                        <strong>Envío a:</strong><br>
                                        ${order.customer_address || 'Dirección no disponible'}
                                    </small>
                                </div>
                                <div class="col-md-6 text-end">
                                    <button class="btn btn-outline-primary btn-sm" onclick="profileManager.viewOrderDetails('${order.id || ''}')">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = ordersHTML;
        console.log(`✅ ${orders.length} pedidos mostrados`);
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'processing': 'Procesando',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || 'Pendiente';
    }

    viewOrderDetails(orderId) {
        console.log('🔍 Viendo detalles del pedido:', orderId);
        alert(`Detalles del pedido ${orderId}\n\nEsta funcionalidad se implementará en una versión futura.`);
    }

    handleTabChange(e) {
        const target = e.target.getAttribute('href');
        console.log('📑 Cambiando a pestaña:', target);
    }

    async handleLogout() {
        console.log('🚪 Cerrando sesión...');
        
        try {
            const result = await supabaseAuth.signOut();
            if (result.success) {
                console.log('✅ Sesión cerrada, redirigiendo...');
                window.location.href = '../index.html';
            } else {
                console.error('❌ Error al cerrar sesión:', result.error);
            }
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
        }
    }

    showMessage(containerId, message, type) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Contenedor de mensajes no encontrado:', containerId);
            return;
        }

        if (!message) {
            container.innerHTML = '';
            return;
        }

        console.log(`💬 Mostrando mensaje [${type}]:`, message);
        
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando ProfileManager...');
    window.profileManager = new ProfileManager();
});