// simulacion de base de datos 
let products = [
    {
        id: 1,
        name: "Nissin Cup Noodles",
        price: 2000,
        category: "Copa",
        stock: 25,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
        featured: true,
        description: "Fideos instantáneos en copa, sabor pollo",
        brand: "Nissin"
    },
    {
        id: 2,
        name: "Maruchan Ramen",
        price: 1000,
        category: "Sobre",
        stock: 40,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        featured: true,
        description: "Fideos instantáneos en sobre, sabor res",
        brand: "Maruchan"
    },
    {
        id: 4,
        name: "Indomie Mi Goreng",
        price: 2000,
        category: "Fritos",
        stock: 30,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        featured: true,
        description: "Fideos instantáneos fritos estilo indonesio",
        brand: "Indomie"
    },
    {
        id: 6,
        name: "Mama Noodles",
        price: 1000,
        category: "Sobre",
        stock: 35,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        featured: false,
        description: "Fideos tailandeses sabor pollo",
        brand: "Mama"
    },
    {
        id: 8,
        name: "Wai Wai Noodles",
        price: 1000,
        category: "Fritos",
        stock: 28,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        featured: false,
        description: "Fideos instantáneos estilo tailandés",
        brand: "Wai Wai"
    },
    {
        id: 9,
        name: "Nissin Demae Ramen",
        price: 2000,
        category: "Sobre",
        stock: 22,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        featured: true,
        description: "Fideos japoneses auténticos",
        brand: "Nissin"
    },
    {
        id: 11,
        name: "Sapporo Ichiban",
        price: 2000,
        category: "Sobre",
        stock: 26,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        featured: false,
        description: "Fideos japoneses estilo Sapporo",
        brand: "Sapporo"
    },
    {
        id: 12,
        name: "Nongshim Chapagetti",
        price: 3029,
        category: "Fritos",
        stock: 16,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        featured: false,
        description: "Fideos fritos con salsa negra",
        brand: "Nongshim"
    }
];

// Carrito de compras - inicializado vacío
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Categorías disponibles para filtros
const categories = [...new Set(products.map(product => product.category))];

// Funciones de utilidad para la base de datos
function getProductById(id) {
    return products.find(product => product.id === id);
}

function updateProductStock(productId, quantity) {
    const product = getProductById(productId);
    if (product) {
        product.stock -= quantity;
        return true;
    }
    return false;
}

function getFeaturedProducts() {
    return products.filter(product => product.featured);
}

function getProductsByCategory(category) {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
}

function searchProducts(searchTerm) {
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
}