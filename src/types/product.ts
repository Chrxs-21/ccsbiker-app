// src/types/product.ts

/**
 * Categorías oficiales de CCSBIKER
 */
export type CategoriaProducto = 
  | 'herrajes'      // Parrillas reforzadas, picos de pato, burros/caballetes, defensas
  | 'accesorios'    // Porta teléfonos, pantallas/cúpulas, retrovisores, luces
  | 'equipamiento'  // Guantes, impermeables, candados de disco
  | 'repuestos';    // Mantenimiento y consumibles

/**
 * Modelo de datos de un Producto o Accesorio en el inventario
 */
export interface Producto {
  id: string;                      // Identificador único (UUID de Supabase)
  nombre: string;                  // Ej: "Parrilla Reforzada Keeway RKF"
  descripcion: string;             // Compatibilidad y detalles técnicos
  categoria: CategoriaProducto;    // Clasificación
  precio: number;                  // Precio base del repuesto en USD
  precio_instalacion?: number;     // Costo adicional si desea instalación en taller (ej. $10)
  stock: number;                   // Cantidad disponible en taller
  incluye_instalacion?: boolean;   // Si esta pieza admite servicio de instalación
  imagen_url: string;              // URL de la foto en Supabase Storage
  created_at?: string;             // Marca de tiempo de registro
}

/**
 * Filtro de estado para la vista pública del catálogo
 */
export type FiltroCategoria = 'todas' | CategoriaProducto;