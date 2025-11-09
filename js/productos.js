// Funcionalidad específica para la página de productos

// Cargar productos destacados (para index.html)
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) {
        console.log('Contenedor de productos destacados no encontrado');
        return;
    }
    
    console.log('Cargando productos destacados...');
    
    container.innerHTML = '';
    
    const featuredProducts = getFeaturedProducts();
    console.log('Productos destacados filtrados:', featuredProducts);
    
    if (featuredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-cart-message">
                    <i class="bi bi-star"></i>
                    <h4>No hay productos destacados</h4>
                    <p>Próximamente agregaremos más productos</p>
                </div>
            </div>
        `;
        return;
    }
    
    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
    
    console.log('Productos destacados cargados:', featuredProducts.length);
}

// Cargar todos los productos (para productos.html)
function loadAllProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Cargar categorías en el filtro
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
    }
    
    // Mostrar productos
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const stockStatus = product.stock > 0 
        ? `<span class="badge bg-success stock-badge">En stock: ${product.stock}</span>` 
        : `<span class="badge bg-danger stock-badge">Sin stock</span>`;
        
    const addButton = product.stock > 0 
        ? `<button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Agregar</button>`
        : `<button class="btn btn-secondary btn-sm" disabled>Sin Stock</button>`;
        
    return `
        <div class="col-6 col-md-6 col-lg-4 col-xl-3 mb-3">
            <div class="card product-card h-100 mx-1">
                <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                <div class="card-body d-flex flex-column p-2">
                    <h6 class="card-title mb-1">${product.name}</h6>
                    <small class="text-muted mb-1">${product.brand} - ${product.category}</small>
                    <p class="card-text fw-bold text-primary price-tag mb-1">$${product.price.toFixed(2)}</p>
                    <div class="mb-2">${stockStatus}</div>
                    <div class="mt-auto">
                        ${addButton}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configurar filtros de búsqueda
function setupFilters() {
    const searchInput = document.getElementById('search-product');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const categoryValue = categoryFilter ? categoryFilter.value : 'all';
            filterProducts(searchTerm, categoryValue);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterProducts(searchTerm, this.value);
        });
    }
}

// Filtrar productos
function filterProducts(searchTerm, categoryFilter) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let filteredProducts;
    
    if (searchTerm) {
        filteredProducts = searchProducts(searchTerm);
    } else {
        filteredProducts = getProductsByCategory(categoryFilter);
    }
    
    // Aplicar filtro de categoría si hay búsqueda
    if (searchTerm && categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-cart-message">
                    <i class="bi bi-search"></i>
                    <h4>No se encontraron productos</h4>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Inicializar página de productos
function initProductosPage() {
    console.log('Inicializando página de productos...');
    loadAllProducts();
    setupFilters();
}

// Inicializar según la página actual
console.log('Ruta actual:', window.location.pathname);

if (window.location.pathname.includes('index.html') || 
    window.location.pathname === '/' || 
    window.location.pathname.endsWith('/')) {
    console.log('Cargando productos destacados para index.html');
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
} else if (window.location.pathname.includes('productos.html')) {
    console.log('Cargando todos los productos para productos.html');
    document.addEventListener('DOMContentLoaded', initProductosPage);
}