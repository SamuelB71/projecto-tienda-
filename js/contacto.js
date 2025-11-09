// Funcionalidad específica para la página de contacto

// Configurar formulario de contacto
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simular envío del formulario
            console.log('Formulario de contacto enviado:', { name, email, message });
            
            showNotification(`Gracias ${name}, tu mensaje ha sido enviado. Te contactaremos pronto.`, 'success');
            contactForm.reset();
        });
    }
}

// Inicializar página de contacto
function initContactoPage() {
    setupContactForm();
}

// Inicializar cuando esté en la página de contacto
if (window.location.pathname.includes('contacto.html')) {
    document.addEventListener('DOMContentLoaded', initContactoPage);
}