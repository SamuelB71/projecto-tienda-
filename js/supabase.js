// Configuración de Supabase
const SUPABASE_URL = 'https://iyzbhlfcpbyutvgzzwnt.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5emJobGZjcGJ5dXR2Z3p6d250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MzEsImV4cCI6MjA3ODQ1MjQzMX0.uBk8Xe96SlGXtrzOfXy9bnsEz9se4XKV5ylJaJbfUkY';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones de autenticación
const auth = {
    // Registrar nuevo usuario
    async signUp(email, password, userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al registrar:', error);
            return { success: false, error: error.message };
        }
    },

    // Iniciar sesión
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            return { success: false, error: error.message };
        }
    },

    // Cerrar sesión
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        return new Promise((resolve) => {
            supabase.auth.getUser().then(({ data: { user } }) => {
                resolve(user);
            });
        });
    },

    // Escuchar cambios de autenticación
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// Funciones para la base de datos
const database = {
    // Guardar pedido del usuario
    async saveOrder(orderData) {
        try {
            const user = await auth.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user.id,
                        customer_name: orderData.customer_name,
                        customer_email: orderData.customer_email,
                        customer_phone: orderData.customer_phone,
                        customer_address: orderData.customer_address,
                        order_total: orderData.order_total,
                        order_items: orderData.order_items,
                        order_status: 'pending'
                    }
                ])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al guardar pedido:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener historial de pedidos del usuario
    async getUserOrders() {
        try {
            const user = await auth.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            return { success: false, error: error.message };
        }
    },

    // Guardar información del perfil
    async saveProfile(profileData) {
        try {
            const user = await auth.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: user.id,
                        full_name: profileData.full_name,
                        phone: profileData.phone,
                        address: profileData.address,
                        city: profileData.city,
                        zip_code: profileData.zip_code,
                        updated_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener perfil del usuario
    async getProfile() {
        try {
            const user = await auth.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            console.log(' Buscando perfil para usuario:', user.id);
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                // Si no encuentra el perfil, no es necesariamente un error
                if (error.code === 'PGRST116') {
                    console.log(' Perfil no encontrado, se creará uno básico');
                    return { success: true, data: null };
                }
                throw error;
            }
            
            console.log(' Perfil encontrado:', data);
            return { success: true, data };
            
        } catch (error) {
            console.error(' Error en getProfile:', error);
            return { success: false, error: error.message };
        }
    },
};

// Exportar funciones
window.supabaseAuth = auth;
window.supabaseDB = database;