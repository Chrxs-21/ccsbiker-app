// src/constants/theme.ts

/**
 * Paleta de colores oficial de CCSBIKER
 * Extraída de la identidad visual de la marca y logo oficial
 */
export const PALETA = {
  // Naranjas de alta competición (Logo BIKER y acentos activos)
  naranjaPrimario: '#FF6B00',
  naranjaOscuro: '#D95700',
  naranjaHover: '#FF8533',

  // Fondos y superficies de asfalto y fibra de carbón
  fondoOscuro: '#0B0E14',      // Fondo general de la app
  superficieCard: '#151B26',   // Fondo de tarjetas de producto y modales
  superficieElevada: '#1E2638', // Elementos destacados y pestañas activas
  bordeSutil: '#283144',       // Divisores y bordes finos

  // Tonos metálicos y cromados (Logo CCS y textos legibles)
  textoBlanco: '#F8FAFC',
  textoPlata: '#CBD5E1',
  textoSilenciado: '#94A3B8',

  // Colores de acción funcional
  whatsapp: '#22C55E',         // Botón directo de compra/consulta en WhatsApp
  alertaStockRojo: '#EF4444',  // Regla estricta: visible cuando stock <= 3
  alertaFondoRojo: '#450A0A',  // Fondo de advertencia para stock bajo
  stockDisponibleVerde: '#10B981',
} as const;

/**
 * Datos y canales oficiales de CCSBIKER
 */
export const INFO_MARCA = {
  nombre: 'CCSBIKER',
  subtitulo: 'Caracas - Venezuela',
  eslogan: 'Accesorios, Herrajes e Instalaciones para Motos',
  instagram: '@ccsbiker',
  tiktok: '@ccsbiker_',
  // Teléfono de WhatsApp para recibir pedidos (lo ajustaremos con el número real de tu papá)
  whatsappTelefono: '584120000000',
  // Regla de negocio de la app
  umbralStockCritico: 3,
} as const;

/**
 * Lista de categorías para filtros y formularios
 */
export const CATEGORIAS_LISTA = [
  { id: 'todas', label: 'Todos' },
  { id: 'herrajes', label: 'Herrajes e Instalación' },
  { id: 'accesorios', label: 'Accesorios Moto' },
  { id: 'equipamiento', label: 'Equipamiento Motero' },
  { id: 'repuestos', label: 'Repuestos' },
] as const;