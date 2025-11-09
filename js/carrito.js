// Funcionalidad específica para la página del carrito

// Actualizar visualización del carrito
function updateCartDisplay() {
    const container = document.getElementById('cart-container');
    const totalElement = document.getElementById('cart-total');
    
    if (!container || !totalElement) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <i class="bi bi-cart-x"></i>
                <h4>Tu carrito está vacío</h4>
                <p>¡Descubre nuestros productos!</p>
                <a href="productos.html" class="btn btn-primary mt-3">Ver Productos</a>
            </div>
        `;
        totalElement.textContent = '0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="card mb-3">
                <div class="row g-0 align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" class="img-fluid rounded-start cart-item-image" alt="${item.name}">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">Precio unitario: $${item.price.toFixed(2)}</p>
                            <p class="card-text fw-bold">Subtotal: $${itemTotal.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="d-flex align-items-center justify-content-center">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="mx-3 fw-bold">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-center justify-content-center">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = cartHTML;
    totalElement.textContent = total.toFixed(2);
}

// Actualizar cantidad de producto en el carrito
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            item.quantity = newQuantity;
            updateCartDisplay();
            updateCartBadge();
            saveCartToStorage();
        } else {
            showNotification('No hay suficiente stock disponible', 'warning');
        }
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartBadge();
    saveCartToStorage();
    showNotification('Producto eliminado del carrito', 'success');
}

// Configurar botón de checkout
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Tu carrito está vacío', 'warning');
                return;
            }
            
            // Redirigir a la página de checkout
            window.location.href = 'checkout.html';
        });
    }
}

// Inicializar página del carrito
function initCarritoPage() {
    updateCartDisplay();
    setupCheckoutButton();
}

// Inicializar cuando esté en la página del carrito
if (window.location.pathname.includes('carrito.html')) {
    document.addEventListener('DOMContentLoaded', initCarritoPage);
}