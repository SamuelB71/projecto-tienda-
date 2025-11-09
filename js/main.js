// Base de datos simulada de productos
let products = [
    { id: 1, name: "Laptop Gaming", price: 999.99, category: "Tecnología", stock: 5, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80", featured: true },
    { id: 2, name: "Smartphone", price: 499.99, category: "Tecnología", stock: 10, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80", featured: true },
    { id: 3, name: "Auriculares Inalámbricos", price: 79.99, category: "Audio", stock: 15, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", featured: false },
    { id: 4, name: "Tablet", price: 299.99, category: "Tecnología", stock: 8, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", featured: true }
];

// Carrito de compras - almacenado en localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Configuración de EmailJS
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_371vhxu',
    TEMPLATE_ID: 'template_m5sx5ey',  
    PUBLIC_KEY: 'maBfirreNSGonqhLY'
};

// Inicializar EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('EmailJS inicializado correctamente');
    }
}

// Guardar carrito en localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cargar componentes comunes
function loadComponents() {
    // Cargar navbar
    fetch('../components/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
            updateCartBadge();
        })
        .catch(error => console.error('Error cargando navbar:', error));

    // Cargar footer
    fetch('../components/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-container').innerHTML = html;
        })
        .catch(error => console.error('Error cargando footer:', error));
}

// Actualizar badge del carrito
function updateCartBadge() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1050';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar al documento
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Función para verificar la configuración de EmailJS
// function debugEmailJSConfig() {
//     console.log('🔧 CONFIGURACIÓN EMAILJS:');
//     console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID);
//     console.log('Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
//     console.log('Public Key:', EMAILJS_CONFIG.PUBLIC_KEY ? '✅ Configurada' : '❌ Faltante');
    
//     // Verificar formatos
//     if (!EMAILJS_CONFIG.SERVICE_ID.startsWith('service_')) {
//         console.warn('⚠️ Service ID podría tener formato incorrecto');
//     }
//     if (!EMAILJS_CONFIG.TEMPLATE_ID.startsWith('template_')) {
//         console.warn('⚠️ Template ID podría tener formato incorrecto');
//     }
//     if (!EMAILJS_CONFIG.PUBLIC_KEY) {
//         console.warn('⚠️ Public Key no configurada');
//     }
// }



// Inicializar aplicación
function initApp() {
    console.log('Inicializando aplicación...');
    loadComponents();
    // debugEmailJSConfig();
    initEmailJS();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
// ... (código anterior del main.js)

// Actualizar cantidad de producto en el carrito (función global)
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            item.quantity = newQuantity;
            updateCartDisplay && updateCartDisplay();
            updateCartBadge();
            saveCartToStorage();
        } else {
            showNotification('No hay suficiente stock disponible', 'warning');
        }
    }
}

// Eliminar producto del carrito (función global)
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay && updateCartDisplay();
    updateCartBadge();
    saveCartToStorage();
    showNotification('Producto eliminado del carrito', 'success');
}

// Agregar al carrito (función global)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (product && product.stock > 0) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                showNotification('No hay suficiente stock disponible', 'warning');
                return;
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        updateCartBadge();
        saveCartToStorage();
        showNotification('Producto agregado al carrito', 'success');
    } else {
        showNotification('Producto no disponible', 'error');
    }
}