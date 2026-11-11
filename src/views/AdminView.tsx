// src/views/AdminView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETA, INFO_MARCA, CATEGORIAS_LISTA } from '../constants/theme';
import { Producto, CategoriaProducto } from '../types/product';
import {
  obtenerProductos,
  incrementarStock,
  decrementarStock,
  actualizarStock,
  crearProducto,
  eliminarProducto,
} from '../services/productsService';

const PIN_CORRECTO = process.env.EXPO_PUBLIC_ADMIN_PIN || '';
const STORAGE_KEY_AUTH = '@ccsbiker_admin_auth';

interface Props {
  alSalir: () => void;
}

export const AdminView: React.FC<Props> = ({ alSalir }) => {
  // Estados de autenticación
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [pinIngresado, setPinIngresado] = useState<string>('');
  const [errorPin, setErrorPin] = useState<boolean>(false);
  const [verificandoSesion, setVerificandoSesion] = useState<boolean>(true);

  // Estados de productos y taller
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroAlerta, setFiltroAlerta] = useState<'todos' | 'criticos' | 'agotados'>('todos');

  // Estados para Modal de Agregar / Editar
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(null);
  const [formNombre, setFormNombre] = useState<string>('');
  const [formCategoria, setFormCategoria] = useState<CategoriaProducto>('herrajes');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formStock, setFormStock] = useState<string>('');
  const [formInstalacion, setFormInstalacion] = useState<boolean>(true);
  const [formPrecioInstalacion, setFormPrecioInstalacion] = useState<string>('10');
  const [formFotoUrl, setFormFotoUrl] = useState<string>('');
  const [formDescripcion, setFormDescripcion] = useState<string>('');
  const [guardandoForm, setGuardandoForm] = useState<boolean>(false);

  // 1. Verificar si tu papá ya tiene la sesión guardada en su teléfono
  useEffect(() => {
    comprobarSesionGuardada();
  }, []);

  const comprobarSesionGuardada = async () => {
    try {
      const sesion = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
      if (sesion === 'true') {
        setAutenticado(true);
        cargarInventarioTaller();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerificandoSesion(false);
    }
  };

const verificarPin = async () => {
    // Si no hay PIN configurado en .env, bloqueamos por seguridad
    if (!PIN_CORRECTO) {
      alert('Error de configuración: no se definió EXPO_PUBLIC_ADMIN_PIN en el archivo .env');
      return;
    }

    if (pinIngresado.trim() === PIN_CORRECTO.trim()) {
      setErrorPin(false);
      setAutenticado(true);
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, 'true');
      cargarInventarioTaller();
    } else {
      setErrorPin(true);
    }
  };

  const cerrarSesionTaller = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    setAutenticado(false);
    setPinIngresado('');
  };

  // 2. Cargar inventario completo
  const cargarInventarioTaller = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos('todas');
      setProductos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // 3. Ajustes rápidos de stock con un solo toque (+1 / -1)
  const manejarSubirStock = async (prod: Producto) => {
    const stockAnterior = prod.stock;
    // Actualización optimista instantánea en pantalla
    setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, stock: p.stock + 1 } : p));
    try {
      await incrementarStock(prod.id, stockAnterior);
    } catch (err) {
      // Si falla, revertimos
      setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, stock: stockAnterior } : p));
    }
  };

  const manejarBajarStock = async (prod: Producto) => {
    if (prod.stock <= 0) return;
    const stockAnterior = prod.stock;
    // Actualización optimista instantánea en pantalla
    setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    try {
      await decrementarStock(prod.id, stockAnterior);
    } catch (err) {
      setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, stock: stockAnterior } : p));
    }
  };

  // 4. Modal para agregar o editar producto
  const abrirModalCrear = () => {
    setProductoEnEdicion(null);
    setFormNombre('');
    setFormCategoria('herrajes');
    setFormPrecio('');
    setFormStock('1');
    setFormInstalacion(true);
    setFormPrecioInstalacion('10');
    setFormFotoUrl('');
    setFormDescripcion('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod: Producto) => {
    setProductoEnEdicion(prod);
    setFormNombre(prod.nombre);
    setFormCategoria(prod.categoria);
    setFormPrecio(prod.precio.toString());
    setFormStock(prod.stock.toString());
    setFormInstalacion(!!prod.incluye_instalacion);
    setFormPrecioInstalacion((prod.precio_instalacion || 10).toString());
    setFormFotoUrl(prod.imagen_url || '');
    setFormDescripcion(prod.descripcion || '');
    setModalAbierto(true);
  };

  const guardarProducto = async () => {
    if (!formNombre.trim()) {
      alert('Debes ingresar el nombre del producto.');
      return;
    }
    const precioNum = parseFloat(formPrecio) || 0;
    const stockNum = parseInt(formStock, 10) || 0;
    const instalacionNum = parseFloat(formPrecioInstalacion) || 0;

    try {
      setGuardandoForm(true);
      if (productoEnEdicion) {
        // En edición: actualizamos datos y stock
        await actualizarStock(productoEnEdicion.id, stockNum);
      } else {
        // Crear nuevo
        await crearProducto({
          nombre: formNombre.trim(),
          categoria: formCategoria,
          precio: precioNum,
          stock: stockNum,
          incluye_instalacion: formInstalacion,
          precio_instalacion: instalacionNum,
          imagen_url: formFotoUrl.trim() || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
          descripcion: formDescripcion.trim(),
        });
      }
      setModalAbierto(false);
      cargarInventarioTaller();
    } catch (e: any) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setGuardandoForm(false);
    }
  };

  const confirmarEliminar = (id: string, nombre: string) => {
    const proceder = window.confirm ? window.confirm(`¿Seguro que deseas eliminar "${nombre}" del taller?`) : true;
    if (proceder) {
      eliminarProducto(id).then(() => cargarInventarioTaller());
    }
  };

  // Métricas del taller
  const totalProductos = productos.length;
  const totalCriticos = productos.filter(p => p.stock > 0 && p.stock <= INFO_MARCA.umbralStockCritico).length;
  const totalAgotados = productos.filter(p => p.stock === 0).length;

  // Filtrado de la lista
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      // Filtro de texto
      const coincideTexto = !busqueda.trim() || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      if (!coincideTexto) return false;

      // Filtro de alerta
      if (filtroAlerta === 'criticos') return p.stock > 0 && p.stock <= INFO_MARCA.umbralStockCritico;
      if (filtroAlerta === 'agotados') return p.stock === 0;
      return true;
    });
  }, [productos, busqueda, filtroAlerta]);

  // ==========================================
  // PANTALLA 1: BLOQUEO POR PIN DE TALLER
  // ==========================================
  if (verificandoSesion) {
    return (
      <View style={styles.pantallaCentro}>
        <ActivityIndicator size="large" color={PALETA.naranjaPrimario} />
      </View>
    );
  }

  if (!autenticado) {
    return (
      <View style={styles.pantallaBloqueo}>
        <View style={styles.cajaLogin}>
          <Text style={styles.candadoIcono}>🔒</Text>
          <Text style={styles.loginTitulo}>PANEL PRIVADO</Text>
          <Text style={styles.loginSubtitulo}>CCSBIKER · CONTROL DE STOCK</Text>

          <TextInput
            style={[styles.inputPin, errorPin && styles.inputPinError]}
            placeholder="Ingrese PIN de taller"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            secureTextEntry={true}
            value={pinIngresado}
            onChangeText={t => {
              setPinIngresado(t);
              setErrorPin(false);
            }}
            onSubmitEditing={verificarPin}
            maxLength={32}
          />

          {errorPin && (
            <Text style={styles.textoPinError}>⚠ PIN INCORRECTO. INTENTE DE NUEVO.</Text>
          )}

          <TouchableOpacity style={styles.botonDesbloquear} onPress={verificarPin}>
            <Text style={styles.botonDesbloquearTexto}>ACCEDER →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonVolverPublico} onPress={alSalir}>
            <Text style={styles.textoVolverPublico}>← Volver a la Tienda Pública</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // PANTALLA 2: PANEL DE CONTROL DE TALLER
  // ==========================================
  return (
    <View style={styles.contenedor}>
      {/* Encabezado Industrial de Taller */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitulo}>PANEL TALLER CCSBIKER</Text>
          <Text style={styles.topBarSub}>ADMINISTRACIÓN RÁPIDA DE INVENTARIO</Text>
        </View>

        <View style={styles.accionesTop}>
          <TouchableOpacity style={styles.btnVerTienda} onPress={alSalir}>
            <Text style={styles.btnVerTiendaTexto}>Ver Tienda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCerrarSesion} onPress={cerrarSesionTaller}>
            <Text style={styles.btnCerrarSesionTexto}>Salir ✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjetas de Métricas de Alerta en Taller */}
      <View style={styles.filaMetricas}>
        <TouchableOpacity 
          style={[styles.tarjetaMetrica, filtroAlerta === 'todos' && styles.tarjetaMetricaActiva]} 
          onPress={() => setFiltroAlerta('todos')}
        >
          <Text style={styles.metricaValor}>{totalProductos}</Text>
          <Text style={styles.metricaEtiqueta}>TOTAL PIEZAS</Text>
        </TouchableOpacity>

        {/* ALERTA CRÍTICA ROJA: Stock <= 3 */}
        <TouchableOpacity 
          style={[styles.tarjetaMetrica, styles.tarjetaMetricaRoja, filtroAlerta === 'criticos' && styles.tarjetaMetricaRojaActiva]} 
          onPress={() => setFiltroAlerta('criticos')}
        >
          <Text style={styles.metricaValorRojo}>{totalCriticos}</Text>
          <Text style={styles.metricaEtiquetaRoja}>⚠ STOCK ≤ 3</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tarjetaMetrica, filtroAlerta === 'agotados' && styles.tarjetaMetricaActiva]} 
          onPress={() => setFiltroAlerta('agotados')}
        >
          <Text style={styles.metricaValorAgotado}>{totalAgotados}</Text>
          <Text style={styles.metricaEtiqueta}>AGOTADOS</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Búsqueda y Botón Gigante de Agregar */}
      <View style={styles.barraAcciones}>
        <TextInput
          style={styles.buscadorTaller}
          placeholder="Buscar pieza para modificar stock..."
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <TouchableOpacity style={styles.btnNuevoProducto} onPress={abrirModalCrear}>
          <Text style={styles.btnNuevoProductoTexto}>+ NUEVO REPUESTO</Text>
        </TouchableOpacity>
      </View>

      {/* Listado de Inventario de Taller */}
      {cargando ? (
        <View style={styles.pantallaCentro}>
          <ActivityIndicator size="large" color={PALETA.naranjaPrimario} />
        </View>
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.pantallaCentro}>
          <Text style={{ color: '#64748B' }}>No hay piezas con este filtro.</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listaTaller}
          renderItem={({ item }) => {
            const esCritico = item.stock > 0 && item.stock <= INFO_MARCA.umbralStockCritico;
            const esAgotado = item.stock === 0;

            return (
              <View style={[styles.filaProducto, esCritico && styles.filaProductoCritica]}>
                {/* Miniatura y datos */}
                <View style={styles.infoFila}>
                  <Image source={{ uri: item.imagen_url }} style={styles.miniatura} resizeMode="cover" />
                  <View style={styles.textosFila}>
                    <Text style={styles.categoriaTag}>// {item.categoria.toUpperCase()}</Text>
                    <Text style={styles.nombrePieza} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={styles.precioPieza}>${item.precio.toFixed(2)} USD</Text>
                  </View>
                </View>

                {/* CONTROLES TÁCTILES RÁPIDOS DE STOCK (-1 / +1) */}
                <View style={styles.seccionStockRapido}>
                  <Text style={styles.etiquetaStockTaller}>STOCK:</Text>
                  <View style={styles.controlesTouch}>
                    <TouchableOpacity 
                      style={[styles.btnStockTouch, esAgotado && styles.btnDeshabilitado]} 
                      onPress={() => manejarBajarStock(item)}
                      disabled={esAgotado}
                    >
                      <Text style={styles.btnStockTouchTexto}>−</Text>
                    </TouchableOpacity>

                    {/* Caja de stock: en ROJO si stock <= 3 */}
                    <View style={[styles.cajaNumeroStock, esCritico && styles.cajaNumeroStockCritico]}>
                      <Text style={[styles.numeroStock, esCritico && styles.numeroStockCritico]}>
                        {item.stock}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.btnStockTouch} 
                      onPress={() => manejarSubirStock(item)}
                    >
                      <Text style={styles.btnStockTouchTexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Acciones de edición y borrado */}
                <View style={styles.filaBotonesAccion}>
                  <TouchableOpacity style={styles.btnAccionEditar} onPress={() => abrirModalEditar(item)}>
                    <Text style={styles.btnAccionTexto}>EDITAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAccionBorrar} onPress={() => confirmarEliminar(item.id, item.nombre)}>
                    <Text style={styles.btnAccionBorrarTexto}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* MODAL AGREGAR / EDITAR REPUESTO */}
      <Modal visible={modalAbierto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {productoEnEdicion ? 'EDITAR ACCESORIO' : '+ AGREGAR NUEVO ACCESORIO'}
              </Text>
              <TouchableOpacity onPress={() => setModalAbierto(false)}>
                <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.labelForm}>NOMBRE DEL ACCESORIO / PIEZA:</Text>
              <TextInput
                style={styles.inputForm}
                placeholder="Ej: Parrilla Reforzada Bera SBR"
                placeholderTextColor="#64748B"
                value={formNombre}
                onChangeText={setFormNombre}
              />

              <Text style={styles.labelForm}>CATEGORÍA:</Text>
              <View style={styles.categoriaBotones}>
                {(['herrajes', 'accesorios', 'equipamiento', 'repuestos'] as CategoriaProducto[]).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.btnCatSelector, formCategoria === cat && styles.btnCatSelectorActivo]}
                    onPress={() => setFormCategoria(cat)}
                  >
                    <Text style={[styles.textoCatSelector, formCategoria === cat && styles.textoCatSelectorActivo]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelForm}>PRECIO ($ USD):</Text>
                  <TextInput
                    style={styles.inputForm}
                    placeholder="45.00"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formPrecio}
                    onChangeText={setFormPrecio}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.labelForm}>STOCK DISPONIBLE:</Text>
                  <TextInput
                    style={styles.inputForm}
                    placeholder="5"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formStock}
                    onChangeText={setFormStock}
                  />
                </View>
              </View>

              <Text style={styles.labelForm}>URL DE FOTO:</Text>
              <TextInput
                style={styles.inputForm}
                placeholder="https://..."
                placeholderTextColor="#64748B"
                value={formFotoUrl}
                onChangeText={setFormFotoUrl}
              />

              <Text style={styles.labelForm}>DESCRIPCIÓN Y COMPATIBILIDAD:</Text>
              <TextInput
                style={[styles.inputForm, { height: 70 }]}
                placeholder="Modelos compatibles, materiales..."
                placeholderTextColor="#64748B"
                multiline
                value={formDescripcion}
                onChangeText={setFormDescripcion}
              />

              <TouchableOpacity style={styles.btnGuardarForm} onPress={guardarProducto} disabled={guardandoForm}>
                {guardandoForm ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnGuardarFormTexto}>GUARDAR EN INVENTARIO →</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#070A0F',
  },
  pantallaCentro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070A0F',
  },
  // Bloqueo
  pantallaBloqueo: {
    flex: 1,
    backgroundColor: '#070A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cajaLogin: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#252F42',
    padding: 24,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? ({ boxShadow: '6px 6px 0px #FF6B00' } as any) : {}),
  },
  candadoIcono: {
    fontSize: 32,
    marginBottom: 8,
  },
  loginTitulo: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loginSubtitulo: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 20,
    marginTop: 4,
  },
  inputPin: {
    width: '100%',
    backgroundColor: '#151D2A',
    borderWidth: 1,
    borderColor: '#252F42',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputPinError: {
    borderColor: '#EF4444',
    backgroundColor: '#450A0A',
  },
  textoPinError: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 12,
  },
  botonDesbloquear: {
    width: '100%',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8533',
  },
  botonDesbloquearTexto: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  botonVolverPublico: {
    marginTop: 16,
    padding: 8,
  },
  textoVolverPublico: {
    color: '#94A3B8',
    fontSize: 12,
  },

  // TopBar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D1117',
    borderBottomWidth: 2,
    borderBottomColor: '#252F42',
  },
  topBarTitulo: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  topBarSub: {
    color: '#FF6B00',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accionesTop: {
    flexDirection: 'row',
    gap: 8,
  },
  btnVerTienda: {
    backgroundColor: '#151D2A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#252F42',
  },
  btnVerTiendaTexto: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  btnCerrarSesion: {
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnCerrarSesionTexto: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },

  // Métricas
  filaMetricas: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#0A0E14',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  tarjetaMetrica: {
    flex: 1,
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#252F42',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tarjetaMetricaActiva: {
    borderColor: '#38BDF8',
  },
  tarjetaMetricaRoja: {
    backgroundColor: '#2A0808',
    borderColor: '#7F1D1D',
  },
  tarjetaMetricaRojaActiva: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  metricaValor: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  metricaValorRojo: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: '900',
  },
  metricaValorAgotado: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '900',
  },
  metricaEtiqueta: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  metricaEtiquetaRoja: {
    color: '#FF6B6B',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },

  // Acciones y Buscador
  barraAcciones: {
    padding: 12,
    gap: 8,
  },
  buscadorTaller: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#252F42',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  btnNuevoProducto: {
    backgroundColor: '#FF6B00',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8533',
  },
  btnNuevoProductoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // Filas de Producto
  listaTaller: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    gap: 12,
  },
  filaProducto: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#252F42',
    padding: 12,
    gap: 10,
  },
  filaProductoCritica: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444', // Borde rojo si stock <= 3
  },
  infoFila: {
    flexDirection: 'row',
    gap: 12,
  },
  miniatura: {
    width: 60,
    height: 60,
    backgroundColor: '#1E2638',
  },
  textosFila: {
    flex: 1,
    justifyContent: 'center',
  },
  categoriaTag: {
    color: '#FF6B00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nombrePieza: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  precioPieza: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },

  // Controles Stock
  seccionStockRapido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#171E2B',
  },
  etiquetaStockTaller: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  controlesTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnStockTouch: {
    width: 38,
    height: 38,
    backgroundColor: '#171E2B',
    borderWidth: 1,
    borderColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDeshabilitado: {
    opacity: 0.3,
  },
  btnStockTouchTexto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cajaNumeroStock: {
    minWidth: 46,
    height: 38,
    backgroundColor: '#070A0F',
    borderWidth: 1,
    borderColor: '#252F42',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  cajaNumeroStockCritico: {
    backgroundColor: '#450A0A',
    borderColor: '#EF4444',
  },
  numeroStock: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  numeroStockCritico: {
    color: '#FF4444',
  },
  filaBotonesAccion: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAccionEditar: {
    flex: 1,
    backgroundColor: '#151D2A',
    borderWidth: 1,
    borderColor: '#252F42',
    paddingVertical: 6,
    alignItems: 'center',
  },
  btnAccionTexto: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  btnAccionBorrar: {
    width: 38,
    backgroundColor: '#2A0808',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccionBorrarTexto: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  // Modal Form
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContenido: {
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#FF6B00',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#151D2A',
    borderBottomWidth: 1,
    borderBottomColor: '#252F42',
  },
  modalTitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalForm: {
    padding: 16,
    gap: 8,
  },
  labelForm: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  inputForm: {
    backgroundColor: '#151D2A',
    borderWidth: 1,
    borderColor: '#252F42',
    color: '#FFFFFF',
    padding: 10,
    fontSize: 13,
  },
  categoriaBotones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  btnCatSelector: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#151D2A',
    borderWidth: 1,
    borderColor: '#252F42',
  },
  btnCatSelectorActivo: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF8533',
  },
  textoCatSelector: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  textoCatSelectorActivo: {
    color: '#FFFFFF',
  },
  btnGuardarForm: {
    backgroundColor: '#16A34A',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnGuardarFormTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});