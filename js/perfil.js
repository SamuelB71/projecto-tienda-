// Gestión del perfil de usuario
class SimpleProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.setupEvents();
            await this.loadProfile();
            await this.loadOrders();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async checkAuth() {
        const user = await supabaseAuth.getCurrentUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        this.currentUser = user;
    }

    setupEvents() {
        // Formulario de perfil
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => this.saveProfile(e));
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async loadProfile() {
        if (!this.currentUser) return;

        // Mostrar información básica
        this.showUserInfo();

        // Cargar perfil desde Supabase
        try {
            const result = await supabaseDB.getProfile();
            if (result.success && result.data) {
                this.fillForm(result.data);
            } else {
                // Usar datos básicos del usuario
                this.fillForm({
                    full_name: this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0],
                    email: this.currentUser.email
                });
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        }
    }

    showUserInfo() {
        const name = this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0];
        
        // Actualizar elementos de la UI
        const nameElement = document.getElementById('profile-name');
        const emailElement = document.getElementById('profile-email');
        const userEmailElement = document.getElementById('user-email');
        const memberElement = document.getElementById('member-since');

        if (nameElement) nameElement.textContent = name;
        if (emailElement) emailElement.textContent = this.currentUser.email;
        if (userEmailElement) userEmailElement.textContent = this.currentUser.email;
        
        if (memberElement) {
            const date = new Date(this.currentUser.created_at);
            memberElement.textContent = `Miembro desde ${date.toLocaleDateString('es-ES')}`;
        }
    }

    fillForm(profile) {
        document.getElementById('profile-name-input').value = profile.full_name || '';
        document.getElementById('profile-email-input').value = profile.email || this.currentUser.email;
        document.getElementById('profile-phone').value = profile.phone || '';
        document.getElementById('profile-address').value = profile.address || '';
        document.getElementById('profile-newsletter').checked = profile.newsletter || false;
    }

    async saveProfile(e) {
        e.preventDefault();
        
        const btn = document.getElementById('profile-save-btn');
        const message = document.getElementById('profile-message');

        // Mostrar loading
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        try {
            const profileData = {
                full_name: document.getElementById('profile-name-input').value,
                phone: document.getElementById('profile-phone').value,
                address: document.getElementById('profile-address').value,
                newsletter: document.getElementById('profile-newsletter').checked
            };

            const result = await supabaseDB.saveProfile(profileData);
            
            if (result.success) {
                this.showMessage(message, 'Perfil actualizado correctamente', 'success');
                this.showUserInfo(); // Actualizar UI
            } else {
                this.showMessage(message, 'Error al guardar: ' + result.error, 'danger');
            }
        } catch (error) {
            this.showMessage(message, 'Error al guardar el perfil', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Cambios';
        }
    }

    async loadOrders() {
        const loading = document.getElementById('orders-loading');
        const container = document.getElementById('orders-container');
        const empty = document.getElementById('orders-empty');

        try {
            const result = await supabaseDB.getUserOrders();
            
            loading.classList.add('d-none');

            if (result.success && result.data && result.data.length > 0) {
                this.showOrders(result.data);
                container.classList.remove('d-none');
            } else {
                empty.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            loading.classList.add('d-none');
            empty.classList.remove('d-none');
        }
    }

    showOrders(orders) {
        const container = document.getElementById('orders-container');
        let html = '';

        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('es-ES');
            const total = parseFloat(order.order_total || 0).toFixed(2);
            
            html += `
                <div class="border-bottom pb-3 mb-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <strong class="d-block">Pedido #${order.id?.slice(-8) || 'N/A'}</strong>
                            <small class="text-muted">${date}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success">$${total}</span>
                        </div>
                    </div>
                    <small class="text-muted">
                        <strong>Envío:</strong> ${order.customer_address || 'No especificado'}
                    </small>
                    <div class="mt-2">
                        <span class="badge bg-secondary">${this.getStatusText(order.order_status)}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
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

    async logout() {
        try {
            await supabaseAuth.signOut();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    showMessage(container, text, type) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${text}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new SimpleProfileManager();
});