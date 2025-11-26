const express = require('express');
const cors = require('cors');
const app = express();

// ✅ CORS CONFIGURACIÓN CORREGIDA para Render
app.use(cors({
  origin: [
    'https://mi-tienda-pwa-kned.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ✅ Middleware para logging de requests
app.use((req, res, next) => {
  console.log('🌐 Request recibida:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']
  });
  next();
});

app.use(express.json());

// ✅ Middleware CORS adicional para OPTIONS requests
app.options('*', cors());

// [EL RESTO DE TU CÓDIGO SE MANTIENE IGUAL]
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

let carritos = [];

// Ruta de productos
app.get('/api/productos', (req, res) => {
  console.log('📦 Petición recibida en /api/productos');
  console.log('📍 Origin:', req.headers.origin);
  
  res.json({
    success: true,
    productos: productos,
    count: productos.length
  });
});

// [EL RESTO DE TUS RUTAS SE MANTIENEN IGUAL]
// ... (tus rutas de carrito, health check, etc.)

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
