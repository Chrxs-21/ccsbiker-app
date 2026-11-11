// src/components/StockBadge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INFO_MARCA, PALETA } from '../constants/theme';

interface Props {
  stock: number;
}

/**
 * Componente visual de Stock con regla estricta:
 * Si stock <= 3 se resalta en ROJO vivo como alerta de taller
 */
export const StockBadge: React.FC<Props> = ({ stock }) => {
  const esAgotado = stock <= 0;
  const esCritico = stock > 0 && stock <= INFO_MARCA.umbralStockCritico; // <= 3

  if (esAgotado) {
    return (
      <View style={[styles.badge, styles.badgeAgotado]}>
        <Text style={styles.textoAgotado}>Agotado en taller</Text>
      </View>
    );
  }

  if (esCritico) {
    return (
      <View style={[styles.badge, styles.badgeCritico]}>
        <View style={styles.puntoRojo} />
        <Text style={styles.textoCritico}>
          ¡Solo {stock} {stock === 1 ? 'disponible' : 'disponibles'}!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.badgeNormal]}>
      <Text style={styles.textoNormal}>{stock} en stock</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  // Estado Crítico (<= 3 unidades en ROJO)
  badgeCritico: {
    backgroundColor: PALETA.alertaFondoRojo,
    borderWidth: 1,
    borderColor: PALETA.alertaStockRojo,
  },
  textoCritico: {
    color: PALETA.alertaStockRojo,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  puntoRojo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETA.alertaStockRojo,
    marginRight: 6,
  },
  // Estado Normal (> 3 unidades)
  badgeNormal: {
    backgroundColor: PALETA.superficieElevada,
  },
  textoNormal: {
    color: PALETA.textoSilenciado,
    fontSize: 12,
    fontWeight: '500',
  },
  // Estado Agotado (0 unidades)
  badgeAgotado: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  textoAgotado: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
});