// src/components/ProductDetailModal.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { PALETA, INFO_MARCA } from '../constants/theme';
import { Producto } from '../types/product';

interface Props {
  producto: Producto | null;
  visible: boolean;
  onCerrar: () => void;
}

export const ProductDetailModal: React.FC<Props> = ({ producto, visible, onCerrar }) => {
  if (!producto) return null;

  const {
    id,
    nombre,
    descripcion,
    precio,
    stock,
    categoria,
    imagen_url,
    precio_instalacion = 10,
    incluye_instalacion = false,
  } = producto;

  const [cantidad, setCantidad] = useState<number>(1);
  const [conInstalacion, setConInstalacion] = useState<boolean>(false);
  const [alertaStock, setAlertaStock] = useState<string | null>(null);

  useEffect(() => {
    setCantidad(1);
    setConInstalacion(false);
    setAlertaStock(null);
  }, [producto]);

  const esAgotado = stock <= 0;
  const esCritico = stock > 0 && stock <= 3;

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
      setAlertaStock(null);
    }
  };

  const incrementar = () => {
    if (cantidad < stock) {
      setCantidad(cantidad + 1);
      setAlertaStock(null);
    } else {
      setAlertaStock(`Solo disponemos de ${stock} unidades en taller.`);
    }
  };

  const precioUnitario = precio + (conInstalacion ? precio_instalacion : 0);
  const total = precioUnitario * cantidad;

  const enviarPedidoWhatsApp = () => {
    const detalleInstalacion = conInstalacion 
      ? `⚙️ *Servicio:* Con instalación en taller (+$${precio_instalacion * cantidad} USD)` 
      : '📦 *Servicio:* Solo producto';

    const mensaje = encodeURIComponent(
      `¡Hola ${INFO_MARCA.nombre}! 👋 Vengo desde su catálogo web y deseo encargar:\n\n` +
      `🏍️ *Producto:* ${nombre}\n` +
      `🔢 *Cantidad:* ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}\n` +
      `${detalleInstalacion}\n` +
      `💰 *Total:* $${total.toFixed(2)} USD\n\n` +
      `¿Tienen disponibilidad en taller?`
    );

    const url = `https://wa.me/${INFO_MARCA.whatsappTelefono}?text=${mensaje}`;
    Linking.openURL(url).catch((err) => console.error('Error al abrir WhatsApp:', err));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.modalContainerIndustrial}>
          
          {/* Header Superior del Modal Industrial */}
          <View style={styles.headerModal}>
            <Text style={styles.headerCategoria}>// FICHA TÉCNICA: {categoria.toUpperCase()}</Text>
            <TouchableOpacity style={styles.botonCerrar} onPress={onCerrar}>
              <Text style={styles.textoCerrar}>[ CERRAR ✕ ]</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Foto con marco técnico */}
            <View style={styles.contenedorFoto}>
              {imagen_url ? (
                <Image source={{ uri: imagen_url }} style={styles.imagen} resizeMode="cover" />
              ) : (
                <View style={styles.sinFoto}>
                  <Text style={styles.sinFotoTexto}>CCSBIKER</Text>
                </View>
              )}
            </View>

            <View style={styles.cuerpo}>
              {/* Título de producto */}
              <Text style={styles.nombre}>{nombre.toUpperCase()}</Text>

              {/* Barra de estado y precio base */}
              <View style={styles.filaBase}>
                <View style={styles.cajaEstadoStock}>
                  <Text style={[styles.estadoStockTexto, esCritico && styles.estadoStockCritico]}>
                    {esAgotado ? 'ESTADO: AGOTADO' : esCritico ? `¡ALERTA: SOLO ${stock} EN TALLER!` : `ESTADO: ${stock} DISPONIBLES`}
                  </Text>
                </View>
                <Text style={styles.precioBase}>${precio.toFixed(2)}</Text>
              </View>

              {/* Descripción */}
              {descripcion ? (
                <View style={styles.seccionDetalle}>
                  <Text style={styles.etiquetaSeccion}>ESPECIFICACIONES / COMPATIBILIDAD:</Text>
                  <Text style={styles.textoDescripcion}>{descripcion}</Text>
                </View>
              ) : null}

              {/* Selector de Instalación si aplica */}
              {(incluye_instalacion || categoria === 'herrajes') && !esAgotado && (
                <View style={styles.seccionInstalacion}>
                  <Text style={styles.etiquetaSeccion}>SERVICIO DE MONTAJE EN TALLER:</Text>
                  <View style={styles.selectorInstalacion}>
                    <TouchableOpacity
                      style={[styles.opcionInstalacion, !conInstalacion && styles.opcionInstalacionActiva]}
                      onPress={() => setConInstalacion(false)}
                    >
                      <Text style={[styles.textoOpcion, !conInstalacion && styles.textoOpcionActiva]}>
                        SOLO REPUESTO (${precio.toFixed(2)})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.opcionInstalacion, conInstalacion && styles.opcionInstalacionActiva]}
                      onPress={() => setConInstalacion(true)}
                    >
                      <Text style={[styles.textoOpcion, conInstalacion && styles.textoOpcionActiva]}>
                        + INSTALACIÓN (+${precio_instalacion})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Selector de Cantidad táctil */}
              {!esAgotado && (
                <View style={styles.seccionCantidad}>
                  <Text style={styles.etiquetaSeccion}>CANTIDAD A ENCARGAR:</Text>
                  <View style={styles.filaControlesCantidad}>
                    <TouchableOpacity
                      style={[styles.btnCantidad, cantidad <= 1 && styles.btnDeshabilitado]}
                      onPress={decrementar}
                      disabled={cantidad <= 1}
                    >
                      <Text style={styles.btnCantidadTexto}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.cajaCantidad}>
                      <Text style={styles.cantidadNumero}>{cantidad}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.btnCantidad, cantidad >= stock && styles.btnDeshabilitado]}
                      onPress={incrementar}
                      disabled={cantidad >= stock}
                    >
                      <Text style={styles.btnCantidadTexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Alerta de Stock insuficiente */}
              {alertaStock && (
                <View style={styles.cajaAlertaStock}>
                  <Text style={styles.textoAlertaStock}>⚠ {alertaStock.toUpperCase()}</Text>
                </View>
              )}

              {/* Resumen Total y Botón de WhatsApp */}
              <View style={styles.seccionFinal}>
                <View>
                  <Text style={styles.etiquetaTotal}>TOTAL ESTIMADO:</Text>
                  <Text style={styles.montoTotal}>${total.toFixed(2)} USD</Text>
                </View>

                <TouchableOpacity
                  style={[styles.botonWhatsAppIndustrial, esAgotado && styles.botonAgotado]}
                  onPress={enviarPedidoWhatsApp}
                  disabled={esAgotado}
                  activeOpacity={0.85}
                >
                  <Text style={styles.textoBotonWhatsApp}>
                    {esAgotado ? 'PIEZA AGOTADA' : 'PEDIR POR WHATSAPP →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainerIndustrial: {
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#252F42',
    borderRadius: 0,
    maxHeight: '90%',
    ...(Platform.OS === 'web' 
      ? ({ boxShadow: '6px 6px 0px #FF6B00' } as any) 
      : { elevation: 6 }),
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#151D2A',
    borderBottomWidth: 1,
    borderBottomColor: '#252F42',
  },
  headerCategoria: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  botonCerrar: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  textoCerrar: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scroll: {
    paddingBottom: 20,
  },
  contenedorFoto: {
    width: '100%',
    height: 220,
    backgroundColor: '#05070A',
    borderBottomWidth: 1,
    borderBottomColor: '#252F42',
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
    fontSize: 20,
    letterSpacing: 2,
  },
  cuerpo: {
    padding: 16,
  },
  nombre: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filaBase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2638',
  },
  cajaEstadoStock: {
    backgroundColor: '#151D2A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#252F42',
  },
  estadoStockTexto: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  estadoStockCritico: {
    color: '#FF4444',
  },
  precioBase: {
    color: '#FF6B00',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  seccionDetalle: {
    marginBottom: 16,
  },
  etiquetaSeccion: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textoDescripcion: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
  seccionInstalacion: {
    backgroundColor: '#121722',
    padding: 12,
    borderWidth: 1,
    borderColor: '#252F42',
    marginBottom: 16,
  },
  selectorInstalacion: {
    flexDirection: 'row',
    gap: 8,
  },
  opcionInstalacion: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#1A2232',
    borderWidth: 1,
    borderColor: '#2E3B52',
    alignItems: 'center',
  },
  opcionInstalacionActiva: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderColor: '#FF6B00',
  },
  textoOpcion: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  textoOpcionActiva: {
    color: '#FF8533',
    fontWeight: '900',
  },
  seccionCantidad: {
    marginBottom: 16,
  },
  filaControlesCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnCantidad: {
    width: 44,
    height: 44,
    backgroundColor: '#171E2B',
    borderWidth: 1,
    borderColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDeshabilitado: {
    opacity: 0.3,
  },
  btnCantidadTexto: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
  },
  cajaCantidad: {
    minWidth: 50,
    height: 44,
    backgroundColor: '#070A0F',
    borderWidth: 1,
    borderColor: '#252F42',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  cantidadNumero: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cajaAlertaStock: {
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#DC2626',
    padding: 10,
    marginBottom: 16,
  },
  textoAlertaStock: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  seccionFinal: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#252F42',
    gap: 12,
  },
  etiquetaTotal: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  montoTotal: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  botonWhatsAppIndustrial: {
    backgroundColor: '#16A34A',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingVertical: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web' 
      ? ({ boxShadow: '4px 4px 0px #0F5132' } as any) 
      : { elevation: 4 }),
  },
  botonAgotado: {
    backgroundColor: '#262626',
    borderColor: '#404040',
  },
  textoBotonWhatsApp: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});