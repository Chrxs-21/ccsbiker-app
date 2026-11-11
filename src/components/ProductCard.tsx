// src/components/ProductCard.tsx
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Producto } from '../types/product';

interface Props {
  producto: Producto;
  onPress: () => void;
}

export const ProductCard: React.FC<Props> = ({ producto, onPress }) => {
  const { nombre, precio, stock, categoria, imagen_url, incluye_instalacion } = producto;
  
  const estaDisponible = stock > 0;
  const esPocoStock = estaDisponible && stock <= 3; // Alerta en rojo si quedan 3 o menos

  return (
    <TouchableOpacity 
      style={styles.cardIndustrial} 
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Barra superior técnica (Categoría y Estado simple de disponibilidad) */}
      <View style={styles.headerTecnico}>
        <Text style={styles.categoriaTexto}>
          // {categoria.toUpperCase()}
        </Text>

        <Text style={[
          styles.badgeDisponibilidad,
          !estaDisponible && styles.badgeAgotado,
          esPocoStock && styles.badgePocoStock
        ]}>
          {estaDisponible 
            ? (esPocoStock ? '● DISPONIBLE (ÚLTIMAS UNIDADES)' : '● DISPONIBLE') 
            : '✕ NO DISPONIBLE'
          }
        </Text>
      </View>

      {/* Foto del accesorio */}
      <View style={styles.contenedorFoto}>
        {imagen_url ? (
          <Image source={{ uri: imagen_url }} style={styles.imagen} resizeMode="cover" />
        ) : (
          <View style={styles.sinFoto}>
            <Text style={styles.sinFotoTexto}>CCSBIKER</Text>
          </View>
        )}
      </View>

      {/* Datos del producto */}
      <View style={styles.cuerpo}>
        <Text style={styles.nombre}>{nombre.toUpperCase()}</Text>

        <View style={styles.filaPrecio}>
          <Text style={styles.precio}>${precio.toFixed(2)}</Text>
          {incluye_instalacion && (
            <View style={styles.cajaInstalacion}>
              <Text style={styles.textoInstalacion}>⚙ INSTALACIÓN DISPONIBLE</Text>
            </View>
          )}
        </View>

        {/* Botón de acción */}
        <View style={styles.botonVerDetalle}>
          <Text style={styles.botonTexto}>VER DETALLES Y ENCARGAR →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardIndustrial: {
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#252F42',
    borderRadius: 0,
    marginBottom: 20,
    ...(Platform.OS === 'web' 
      ? ({ boxShadow: '4px 4px 0px #FF6B00' } as any) 
      : { elevation: 4 }),
  },
  headerTecnico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#151D2A',
    borderBottomWidth: 1,
    borderBottomColor: '#252F42',
  },
  categoriaTexto: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  // Estados de Disponibilidad
  badgeDisponibilidad: {
    color: '#10B981', // Verde disponible
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  badgePocoStock: {
    color: '#FF4444', // Rojo alerta si stock <= 3
  },
  badgeAgotado: {
    color: '#6B7280', // Gris no disponible
  },
  contenedorFoto: {
    width: '100%',
    height: 180,
    backgroundColor: '#070A0F',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  sinFoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinFotoTexto: {
    color: '#334155',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
  },
  cuerpo: {
    padding: 14,
  },
  nombre: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  filaPrecio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  precio: {
    color: '#FF6B00',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cajaInstalacion: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  textoInstalacion: {
    color: '#FF8533',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  botonVerDetalle: {
    backgroundColor: '#171E2B',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});