// Gestión unificada de autenticación (login + registro)
class UnifiedAuthManager {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Validación de contraseña en tiempo real
        this.setupPasswordValidation();
    }

    setupTabSwitching() {
        // Cambio entre pestañas
        const authTabs = document.getElementById('authTabs');
        if (authTabs) {
            authTabs.addEventListener('shown.bs.tab', (e) => {
                this.currentTab = e.target.getAttribute('data-bs-target').replace('#', '');
                this.clearMessages();
                
                // Limpiar formularios al cambiar de pestaña
                if (this.currentTab === 'login') {
                    document.getElementById('register-form').reset();
                    this.resetPasswordIndicators();
                } else {
                    document.getElementById('login-form').reset();
                }
            });
        }
    }

    setupPasswordValidation() {
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.checkPasswordStrength());
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.checkPasswordMatch());
        }
    }

    async checkExistingSession() {
        const user = await supabaseAuth.getCurrentUser();
        if (user) {
            // Si ya está logueado, redirigir al perfil
            window.location.href = 'perfil.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageDiv = document.getElementById('login-message');
        const submitBtn = document.getElementById('login-submit');

        // Validaciones básicas
        if (!email || !password) {
            this.showMessage(messageDiv, 'Por favor completa todos los campos', 'warning');
            return;
        }

        // Mostrar estado de carga
        this.setLoading(submitBtn, true, 'Iniciando sesión...');

        try {
            const result = await supabaseAuth.signIn(email, password);
            
            if (result.success) {
                this.showMessage(messageDiv, '¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                this.showMessage(messageDiv, result.error, 'danger');
                this.setLoading(submitBtn, false, 'Iniciar Sesión');
            }
        } catch (error) {
            this.showMessage(messageDiv, 'Error al iniciar sesión', 'danger');
            this.setLoading(submitBtn, false, 'Iniciar Sesión');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        // Validar formulario primero
        if (!this.validateRegisterForm()) {
            return;
        }

        const formData = this.getRegisterFormData();
        const messageDiv = document.getElementById('register-message');
        const submitBtn = document.getElementById('register-submit');

        // Mostrar estado de carga
        this.setLoading(submitBtn, true, 'Creando cuenta...');

        try {
            const userData = {
                full_name: formData.name,
                newsletter: formData.newsletter
            };

            const result = await supabaseAuth.signUp(formData.email, formData.password, userData);
            
            if (result.success) {
                this.showMessage(messageDiv, 
                    '¡Cuenta creada exitosamente! Revisa tu email para confirmar.', 
                    'success'
                );
                
                // Limpiar formulario
                document.getElementById('register-form').reset();
                this.resetPasswordIndicators();
                
                // Cambiar a pestaña de login después de 3 segundos
                setTimeout(() => {
                    this.switchToTab('login');
                    this.showMessage(messageDiv, '', '');
                }, 3000);
                
            } else {
                this.showMessage(messageDiv, result.error, 'danger');
                this.setLoading(submitBtn, false, 'Crear Cuenta');
            }
        } catch (error) {
            this.showMessage(messageDiv, 'Error al crear la cuenta: ' + error.message, 'danger');
            this.setLoading(submitBtn, false, 'Crear Cuenta');
        }
    }

    validateRegisterForm() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const terms = document.getElementById('register-terms');
        const messageDiv = document.getElementById('register-message');

        // Validaciones
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage(messageDiv, 'Por favor completa todos los campos obligatorios', 'warning');
            return false;
        }

        if (password !== confirmPassword) {
            this.showMessage(messageDiv, 'Las contraseñas no coinciden', 'danger');
            return false;
        }

        if (password.length < 6) {
            this.showMessage(messageDiv, 'La contraseña debe tener al menos 6 caracteres', 'danger');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage(messageDiv, 'Por favor ingresa un email válido', 'danger');
            return false;
        }

        if (!terms.checked) {
            this.showMessage(messageDiv, 'Debes aceptar los términos y condiciones', 'warning');
            return false;
        }

        return true;
    }

    getRegisterFormData() {
        return {
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            newsletter: document.getElementById('register-newsletter').checked
        };
    }

    // Validación de contraseña en tiempo real
    checkPasswordStrength() {
        const password = document.getElementById('register-password').value;
        const strengthBar = document.getElementById('password-strength');
        
        if (!strengthBar) return;

        let strength = 0;

        // Reset
        strengthBar.className = 'password-strength';
        strengthBar.style.width = '0%';

        if (password.length === 0) {
            return;
        }

        // Longitud
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        
        // Complejidad
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!]+/)) strength++;

        // Aplicar estilos según fuerza
        if (strength <= 2) {
            strengthBar.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthBar.classList.add('strength-medium');
        } else if (strength <= 4) {
            strengthBar.classList.add('strength-strong');
        } else {
            strengthBar.classList.add('strength-very-strong');
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const matchText = document.getElementById('password-match');
        
        if (!matchText) return;

        if (confirmPassword.length === 0) {
            matchText.textContent = '';
            matchText.className = 'form-text';
        } else if (password === confirmPassword) {
            matchText.textContent = '✓ Las contraseñas coinciden';
            matchText.className = 'form-text text-success';
        } else {
            matchText.textContent = '✗ Las contraseñas no coinciden';
            matchText.className = 'form-text text-danger';
        }
    }

    resetPasswordIndicators() {
        const strengthBar = document.getElementById('password-strength');
        const matchText = document.getElementById('password-match');
        
        if (strengthBar) {
            strengthBar.className = 'password-strength';
            strengthBar.style.width = '0%';
        }
        
        if (matchText) {
            matchText.textContent = '';
            matchText.className = 'form-text';
        }
    }

    // Utilidades
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setLoading(button, loading, text = '') {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = `<span class="btn-spinner"></span> ${text}`;
        } else {
            button.disabled = false;
            const icon = button.id.includes('login') ? 'bi-box-arrow-in-right' : 'bi-person-plus';
            button.innerHTML = `<i class="bi ${icon} me-2"></i>${text}`;
        }
    }

    showMessage(container, message, type) {
        if (!container) return;

        if (!message) {
            container.innerHTML = '';
            return;
        }

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

    clearMessages() {
        const loginMessage = document.getElementById('login-message');
        const registerMessage = document.getElementById('register-message');
        
        if (loginMessage) loginMessage.innerHTML = '';
        if (registerMessage) registerMessage.innerHTML = '';
    }

    switchToTab(tabName) {
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }
    }

    // Método para cambiar a registro con datos prellenados (útil desde otras páginas)
    prefillRegister(email = '') {
        this.switchToTab('register');
        if (email) {
            document.getElementById('register-email').value = email;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.unifiedAuth = new UnifiedAuthManager();
});

// Función global para cambiar a registro desde otras páginas
window.showRegister = function(email = '') {
    if (window.unifiedAuth) {
        window.unifiedAuth.prefillRegister(email);
    }
};