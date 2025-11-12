// Funcionalidad específica para la página de checkout

// Mostrar resumen del pedido en checkout
function showCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary');
    const totalElement = document.getElementById('checkout-total');
    
    if (!summaryContainer || !totalElement) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p class="text-muted">No hay productos en el carrito</p>';
        totalElement.textContent = '0.00';
        return;
    }
    
    let summaryHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        summaryHTML += `
            <div class="checkout-item">
                <img src="${item.image}" class="checkout-item-image" alt="${item.name}">
                <div class="checkout-item-details">
                    <h6 class="mb-1">${item.name}</h6>
                    <small class="text-muted">Cantidad: ${item.quantity} × $${item.price.toFixed(2)}</small>
                </div>
                <div class="checkout-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    summaryContainer.innerHTML = summaryHTML;
    totalElement.textContent = total.toFixed(2);
}

// Formatear items del pedido para el correo
function formatOrderItems() {
    let itemsText = 'PRODUCTOS DEL PEDIDO:\n\n';
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        itemsText += `${index + 1}. ${item.name}\n`;
        itemsText += `   Cantidad: ${item.quantity}\n`;
        itemsText += `   Precio: $${item.price.toFixed(2)}\n`;
        itemsText += `   Subtotal: $${itemTotal.toFixed(2)}\n\n`;
    });
    return itemsText;
}

// Función CORREGIDA para enviar el correo
async function sendOrderEmail(formData) {
    // console.log(' Iniciando envío de correo...');
    
    
    const toEmail = 'samuelbello482@gmail.com'; // 
    
    console.log(' Email destino:', toEmail);
    
    // Preparar datos del pedido
    const orderData = {
        order_id: 'ORD-' + Date.now(),
        order_date: new Date().toLocaleDateString('es-ES'),
        order_total: document.getElementById('checkout-total').textContent,
        order_items: formatOrderItems(),
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: `${formData.customer_address}, ${formData.customer_city}`
    };
    
    // Parámetros
    const templateParams = {
        to_email: toEmail,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        order_id: orderData.order_id,
        order_date: orderData.order_date,
        order_total: orderData.order_total,
        order_items: orderData.order_items
    };
    
    // console.log(' Enviando correo con parámetros:', templateParams);
    
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        console.log(' Correo enviado exitosamente!');
        return response;
        
    } catch (error) {
        console.error('  Error al enviar correo:', error);
        if (error.text) {
            console.error('Mensaje de error:', error.text);
        }
        throw error;
    }
}

// Procesar pedido exitoso
// En processSuccessfulOrder, después de enviar el email:
async function processSuccessfulOrder(formData) {
    try {
        // 1. Enviar email (existente)
        await sendOrderEmail(formData);
        
        // 2. Guardar en Supabase si el usuario está logueado
        const user = await supabaseAuth.getCurrentUser();
        if (user) {
            const orderData = {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_address: `${formData.customer_address}, ${formData.customer_city}, ${formData.customer_zip}`,
                order_total: document.getElementById('checkout-total').textContent,
                order_items: cart
            };
            
            await supabaseDB.saveOrder(orderData);
        }
        
        // 3. Actualizar stock y limpiar carrito (existente)
        cart.forEach(cartItem => {
            updateProductStock(cartItem.id, cartItem.quantity);
        });
        
        cart = [];
        localStorage.removeItem('cart');
        updateCartBadge();
        
        showNotification('¡Pedido realizado con éxito!', 'success');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error en checkout:', error);
        showNotification('Error al procesar el pedido', 'error');
    }
}

// Configurar formulario de checkout
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const confirmOrderText = document.getElementById('confirm-order-text');
    const confirmOrderSpinner = document.getElementById('confirm-order-spinner');
    
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar que el carrito no esté vacío
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío', 'warning');
            return;
        }
        
        // Obtener datos del formulario
        const formData = {
            customer_name: document.getElementById('customer-name').value,
            customer_email: document.getElementById('customer-email').value,
            customer_phone: document.getElementById('customer-phone').value,
            customer_address: document.getElementById('customer-address').value,
            customer_city: document.getElementById('customer-city').value,
            customer_zip: document.getElementById('customer-zip').value
        };
        
        // Validar datos requeridos
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
            showNotification('Por favor completa todos los campos requeridos', 'warning');
            return;
        }
        
        // Mostrar spinner de carga
        if (confirmOrderText && confirmOrderSpinner) {
            confirmOrderText.textContent = 'Procesando...';
            confirmOrderSpinner.classList.remove('d-none');
        }
        if (confirmOrderBtn) {
            confirmOrderBtn.disabled = true;
        }
        
        try {
            // Enviar pedido por correo
            await sendOrderEmail(formData);
            
            // Procesar pedido exitoso
            processSuccessfulOrder();
            
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            showNotification('Error: ' + (error.text || 'No se pudo enviar el correo'), 'error');
        } finally {
            // Restaurar botón
            if (confirmOrderText && confirmOrderSpinner) {
                confirmOrderText.textContent = 'Confirmar Pedido';
                confirmOrderSpinner.classList.add('d-none');
            }
            if (confirmOrderBtn) {
                confirmOrderBtn.disabled = false;
            }
        }
    });
}

// Inicializar página de checkout
function initCheckoutPage() {
    showCheckoutSummary();
    setupCheckoutForm();
}

// Inicializar cuando esté en la página de checkout
if (window.location.pathname.includes('checkout.html')) {
    document.addEventListener('DOMContentLoaded', initCheckoutPage);
}