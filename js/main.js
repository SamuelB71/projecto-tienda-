
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

// Actualizar cantidad de producto en el carrito (función global)
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = getProductById(productId);
    
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
    const product = getProductById(productId);
    
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

// Inicializar aplicación
function initApp() {
    // console.log('Inicializando aplicación...');
    initEmailJS();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);