const express = require('express');
const cors = require('cors');
const app = express();

// CORS config MEJORADO
app.use(cors({
  origin: [
    'https://mi-tienda-pwa-kned.vercel.app', // Tu frontend en Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Manejar preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Datos de productos (ya existe)
const productos = [
  {
    id: 1,
    nombre: "Laptop Gaming",
    precio: 1200,
    descripcion: "Laptop para gaming de alta performance",
    imagen: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=200&fit=crop"
  },
  {
    id: 2,
    nombre: "Smartphone",
    precio: 599,
    descripcion: "Teléfono inteligente última generación",
    imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop"
  }
];

// Almacenamiento en memoria del carrito (en producción usarías una base de datos)
let carritos = [];

// Ruta de productos (ya funciona)
app.get('/api/productos', (req, res) => {
  console.log('📦 Petición recibida en /api/productos');
  
  res.json({
    success: true,
    productos: productos,
    count: productos.length
  });
});

// Ruta raíz también devuelve productos (para compatibilidad)
app.get('/', (req, res) => {
  console.log('📦 Petición recibida en /');
  
  res.json({
    success: true,
    productos: productos,
    count: productos.length
  });
});

// GET /api/carrito/:usuarioId - Obtener carrito de un usuario
app.get('/api/carrito/:usuarioId', (req, res) => {
  try {
    const { usuarioId } = req.params;
    console.log('🛒 Obteniendo carrito para usuario:', usuarioId);
    
    // Filtrar items del carrito para este usuario
    const carritoUsuario = carritos.filter(item => item.usuarioId === usuarioId);
    
    console.log('🛒 Carrito encontrado:', carritoUsuario.length, 'items');
    
    res.json({
      success: true,
      carrito: carritoUsuario,
      count: carritoUsuario.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/carrito/agregar - Agregar producto al carrito
app.post('/api/carrito/agregar', (req, res) => {
  try {
    const { usuarioId, productoId, cantidad } = req.body;
    
    console.log('➕ Agregando al carrito:', { usuarioId, productoId, cantidad });
    
    // Validar datos requeridos
    if (!usuarioId || !productoId) {
      return res.status(400).json({
        success: false,
        error: 'usuarioId y productoId son requeridos'
      });
    }
    
    // Buscar el producto en la lista de productos
    const producto = productos.find(p => p.id === parseInt(productoId));
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Buscar si el producto ya está en el carrito del usuario
    const itemExistenteIndex = carritos.findIndex(
      item => item.usuarioId === usuarioId && item.productoId === productoId
    );
    
    if (itemExistenteIndex !== -1) {
      // Actualizar cantidad si ya existe
      carritos[itemExistenteIndex].cantidad += cantidad || 1;
      console.log('✅ Producto actualizado en carrito');
    } else {
      // Crear nuevo item en el carrito
      const nuevoItem = {
        id: Date.now().toString(), // ID único para el item del carrito
        usuarioId,
        productoId,
        cantidad: cantidad || 1,
        productoNombre: producto.nombre,
        productoPrecio: producto.precio,
        productoImagen: producto.imagen,
        productoDescripcion: producto.descripcion,
        fechaAgregado: new Date().toISOString()
      };
      carritos.push(nuevoItem);
      console.log('✅ Nuevo producto agregado al carrito');
    }
    
    res.json({
      success: true,
      message: 'Producto agregado al carrito'
    });
    
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/carrito/:itemId - Actualizar cantidad en el carrito
app.put('/api/carrito/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { cantidad, usuarioId } = req.body;
    
    console.log('✏️ Actualizando carrito item:', itemId, 'cantidad:', cantidad);
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        error: 'usuarioId es requerido'
      });
    }
    
    const itemIndex = carritos.findIndex(
      item => item.id === itemId && item.usuarioId === usuarioId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item del carrito no encontrado'
      });
    }
    
    if (cantidad < 1) {
      // Eliminar si la cantidad es 0
      carritos.splice(itemIndex, 1);
      console.log('🗑️ Item eliminado del carrito');
    } else {
      // Actualizar cantidad
      carritos[itemIndex].cantidad = cantidad;
      console.log('✅ Cantidad actualizada:', cantidad);
    }
    
    res.json({
      success: true,
      message: 'Carrito actualizado'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/carrito/:itemId - Eliminar item del carrito
app.delete('/api/carrito/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { usuarioId } = req.body;
    
    console.log('🗑️ Eliminando item del carrito:', itemId);
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        error: 'usuarioId es requerido'
      });
    }
    
    const itemIndex = carritos.findIndex(
      item => item.id === itemId && item.usuarioId === usuarioId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item del carrito no encontrado'
      });
    }
    
    carritos.splice(itemIndex, 1);
    console.log('✅ Item eliminado del carrito');
    
    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
    
  } catch (error) {
    console.error('❌ Error eliminando del carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    carritosCount: carritos.length
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Endpoints disponibles:`);
  console.log(`   GET  /api/productos`);
  console.log(`   GET  /`);
  console.log(`   GET  /api/carrito/:usuarioId`);
  console.log(`   POST /api/carrito/agregar`);
  console.log(`   PUT  /api/carrito/:itemId`);
  console.log(`   DELETE /api/carrito/:itemId`);
  console.log(`   GET  /health`);
});
