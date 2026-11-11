// App.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Linking,
  RefreshControl,
  Image
} from 'react-native';
import { PALETA, INFO_MARCA, CATEGORIAS_LISTA } from './src/constants/theme';
import { Producto, FiltroCategoria } from './src/types/product';
import { obtenerProductos } from './src/services/productsService';
import { ProductCard } from './src/components/ProductCard';
import { ProductDetailModal } from './src/components/ProductDetailModal';
import { AdminView } from './src/views/AdminView';

export default function App() {
  // Detección de ruta secreta: si la URL contiene 'admin'
  const [esRutaAdmin, setEsRutaAdmin] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.hash.includes('admin') || window.location.pathname.includes('admin');
    }
    return false;
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [categoriaActiva, setCategoriaActiva] = useState<FiltroCategoria>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Escuchar cambios de URL en la barra del navegador
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const verificarHash = () => {
        setEsRutaAdmin(window.location.hash.includes('admin') || window.location.pathname.includes('admin'));
      };
      window.addEventListener('hashchange', verificarHash);
      return () => window.removeEventListener('hashchange', verificarHash);
    }
  }, []);

  useEffect(() => {
    if (!esRutaAdmin) {
      cargarInventario();
    }
  }, [categoriaActiva, esRutaAdmin]);

  const cargarInventario = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos(categoriaActiva);
      setProductos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    if (refrescando) return;
    try {
      setRefrescando(true);
      const data = await obtenerProductos(categoriaActiva);
      setProductos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefrescando(false);
    }
  };

  const abrirInstagram = () => {
    Linking.openURL('https://instagram.com/ccsbiker').catch(() => {});
  };

  const abrirTikTok = () => {
    Linking.openURL('https://tiktok.com/@ccsbiker_').catch(() => {});
  };

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const termino = busqueda.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(termino))
    );
  }, [productos, busqueda]);

  // Si la URL contiene '#admin' cargamos el Panel Privado del Taller
  if (esRutaAdmin) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <StatusBar barStyle="light-content" backgroundColor="#070A0F" />
        <AdminView 
          alSalir={() => {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.location.hash = '';
            }
            setEsRutaAdmin(false);
          }} 
        />
      </SafeAreaView>
    );
  }

  // ==========================================
  // VISTA PÚBLICA DE CATÁLOGO (CLIENTES)
  // ==========================================
  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.footerDivisor} />
      <Text style={styles.footerTitulo}>CCS BIKER · CARACAS</Text>
      <Text style={styles.footerSubtitulo}>Accesorios, Herrajes e Instalaciones para Motos</Text>
      
      <View style={styles.redesFila}>
        <TouchableOpacity style={styles.botonRedSocial} onPress={abrirInstagram}>
          <Text style={styles.textoRedSocial}>📸 Instagram @ccsbiker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonRedSocial} onPress={abrirTikTok}>
          <Text style={styles.textoRedSocial}>🎵 TikTok @ccsbiker_</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyright}>© {new Date().getFullYear()} CCSBIKER. Todos los derechos reservados.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#070A0F" />

      {/* Header Limpio con Logo Oficial */}
      <View style={styles.headerCentrado}>
        <View style={styles.contenedorLogoCircular}>
          <Image 
            source={require('./assets/logo.png')} 
            style={styles.logoImagen} 
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Buscador de repuestos */}
      <View style={styles.contenedorBuscador}>
        <TextInput
          style={styles.inputBuscador}
          placeholder="Buscar repuesto o moto (Keeway, V-Strom, burro...)"
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')} style={styles.botonLimpiarBusqueda}>
            <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selector de Categorías */}
      <View style={styles.contenedorCategorias}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollCategorias}>
          {CATEGORIAS_LISTA.map((cat) => {
            const activa = categoriaActiva === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.botonCategoria, activa && styles.botonCategoriaActiva]}
                onPress={() => setCategoriaActiva(cat.id as FiltroCategoria)}
              >
                <Text style={[styles.textoCategoria, activa && styles.textoCategoriaActiva]}>
                  {cat.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Catálogo */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={PALETA.naranjaPrimario} />
        </View>
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.textoVacio}>No hay productos disponibles con ese filtro.</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={alRefrescar}
              tintColor={PALETA.naranjaPrimario}
              colors={[PALETA.naranjaPrimario]}
            />
          }
          renderItem={({ item }) => (
            <ProductCard 
              producto={item} 
              onPress={() => setProductoSeleccionado(item)} 
            />
          )}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Modal de Detalle */}
      <ProductDetailModal
        producto={productoSeleccionado}
        visible={!!productoSeleccionado}
        onCerrar={() => setProductoSeleccionado(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#070A0F',
  },
  headerCentrado: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#0D1117',
    borderBottomWidth: 2,
    borderBottomColor: '#252F42',
  },
  contenedorLogoCircular: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF6B00',
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' 
      ? ({ boxShadow: '0px 0px 10px rgba(255,107,0,0.35)' } as any) 
      : { elevation: 5 }),
  },
  logoImagen: {
    width: '100%',
    height: '100%',
  },
  contenedorBuscador: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
  },
  inputBuscador: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#252F42',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  botonLimpiarBusqueda: {
    position: 'absolute',
    right: 28,
    top: 22,
  },
  contenedorCategorias: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
    backgroundColor: '#070A0F',
  },
  scrollCategorias: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  botonCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#252F42',
  },
  botonCategoriaActiva: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF8533',
  },
  textoCategoria: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textoCategoriaActiva: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  lista: {
    padding: 16,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoVacio: {
    color: '#64748B',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  footerDivisor: {
    width: 60,
    height: 2,
    backgroundColor: '#FF6B00',
    marginBottom: 16,
  },
  footerTitulo: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerSubtitulo: {
    color: '#64748B',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  redesFila: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  botonRedSocial: {
    backgroundColor: '#151D2A',
    borderWidth: 1,
    borderColor: '#252F42',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  textoRedSocial: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  copyright: {
    color: '#475569',
    fontSize: 10,
  },
});