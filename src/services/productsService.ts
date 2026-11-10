// src/services/productsService.ts
import { supabase } from './supabase';
import { Producto, FiltroCategoria } from '../types/product';

/**
 * Obtiene el listado de productos desde Supabase
 * Permite filtrar por categoría o traer todo el catálogo
 */
export async function obtenerProductos(categoria: FiltroCategoria = 'todas'): Promise<Producto[]> {
  try {
    let query = supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    // Si el usuario seleccionó una categoría específica, aplicamos el filtro
    if (categoria !== 'todas') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener productos de Supabase:', error.message);
      throw error;
    }

    return (data as Producto[]) || [];
  } catch (error) {
    console.error('Fallo en servicio obtenerProductos:', error);
    throw error;
  }
}

/**
 * Actualiza el stock de un producto específico
 * Usado por tu papá en el taller para altas y bajas rápidas (+1 / -1)
 */
export async function actualizarStock(id: string, nuevoStock: number): Promise<Producto> {
  try {
    // Evitamos que el stock quede en números negativos
    const stockSeguro = Math.max(0, nuevoStock);

    const { data, error } = await supabase
      .from('productos')
      .update({ stock: stockSeguro })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar stock:', error.message);
      throw error;
    }

    return data as Producto;
  } catch (error) {
    console.error('Fallo en servicio actualizarStock:', error);
    throw error;
  }
}

/**
 * Incrementa rápidamente el stock en 1 unidad
 */
export async function incrementarStock(id: string, stockActual: number): Promise<Producto> {
  return actualizarStock(id, stockActual + 1);
}

/**
 * Decrementa rápidamente el stock en 1 unidad (mínimo 0)
 */
export async function decrementarStock(id: string, stockActual: number): Promise<Producto> {
  return actualizarStock(id, stockActual - 1);
}

/**
 * Agrega un nuevo producto o accesorio al catálogo
 */
export async function crearProducto(
  producto: Omit<Producto, 'id' | 'created_at'>
): Promise<Producto> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single();

    if (error) {
      console.error('Error al insertar producto:', error.message);
      throw error;
    }

    return data as Producto;
  } catch (error) {
    console.error('Fallo en servicio crearProducto:', error);
    throw error;
  }
}

/**
 * Elimina un producto por su ID
 */
export async function eliminarProducto(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error.message);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Fallo en servicio eliminarProducto:', error);
    throw error;
  }
}