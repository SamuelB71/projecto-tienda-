// Gestión unificada del navbar para todas las páginas
class NavbarManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadNavbar();
        await this.checkAuthState();
        this.updateCartBadge();
        this.setupEventListeners();
    }

    async loadNavbar() {
        // Cargar navbar desde components/navbar.html
        try {
            const response = await fetch('../components/navbar.html');
            if (!response.ok) throw new Error('No se pudo cargar el navbar');
            
            const navbarHTML = await response.text();
            const navbarContainer = document.getElementById('navbar-container');
            
            if (navbarContainer) {
                navbarContainer.innerHTML = navbarHTML;
            } else {
                console.warn('No se encontró el contenedor del navbar');
            }
        } catch (error) {
            console.error('Error cargando navbar:', error);
            this.createFallbackNavbar();
        }
    }

    createFallbackNavbar() {
        // Navbar de respaldo si falla la carga
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        navbarContainer.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="../index.html">
                        <i class="bi bi-cup-hot-fill me-2"></i>Noodle Shop
                    </a>
                    <div class="d-flex">
                        <a href="carrito.html" class="btn btn-outline-light position-relative">
                            <i class="bi bi-cart"></i>
                            <span id="cart-badge" class="cart-badge">0</span>
                        </a>
                    </div>
                </div>
            </nav>
        `;
    }

    async checkAuthState() {
        try {
            this.currentUser = await supabaseAuth.getCurrentUser();
            this.updateAuthUI();
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }
    }

    updateAuthUI() {
        const authStatus = document.getElementById('auth-status');
        const logoutBtn = document.getElementById('logout-btn');
        const loginBtn = document.getElementById('login-btn');
        const profileBtn = document.getElementById('profile-btn');
        const userEmail = document.getElementById('user-email');

        if (!this.currentUser) {
            // Usuario no autenticado
            if (authStatus) authStatus.classList.add('d-none');
            if (logoutBtn) logoutBtn.classList.add('d-none');
            if (profileBtn) profileBtn.classList.add('d-none');
            if (loginBtn) loginBtn.classList.remove('d-none');
            return;
        }

        // Usuario autenticado
        if (authStatus) {
            authStatus.classList.remove('d-none');
            if (userEmail) {
                userEmail.textContent = this.currentUser.email;
            }
        }
        if (logoutBtn) logoutBtn.classList.remove('d-none');
        if (profileBtn) profileBtn.classList.remove('d-none');
        if (loginBtn) loginBtn.classList.add('d-none');
    }

    updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartBadge = document.getElementById('cart-badge');
        
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            if (totalItems === 0) {
                cartBadge.style.display = 'none';
            } else {
                cartBadge.style.display = 'flex';
            }
        }
    }

    setupEventListeners() {
        // Los event listeners se configurarán después de que el DOM se actualice
        setTimeout(() => {
            this.setupLogoutListener();
            this.setupActiveLink();
        }, 100);
    }

    setupLogoutListener() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        }
    }

    setupActiveLink() {
        // Marcar el enlace activo según la página actual
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPage.includes(href.replace('../', '').replace('./', ''))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    async handleLogout() {
        try {
            const result = await supabaseAuth.signOut();
            if (result.success) {
                window.location.href = '../index.html';
            } else {
                console.error('Error al cerrar sesión:', result.error);
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
}

// Inicializar navbar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
});

// Función para actualizar el badge del carrito desde otras páginas
window.updateNavbarCart = function() {
    if (window.navbarManager) {
        window.navbarManager.updateCartBadge();
    }
};