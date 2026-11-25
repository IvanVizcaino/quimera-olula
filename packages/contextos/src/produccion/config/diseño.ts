/**
 * Configuración de producción: las dos tablas de una sola fila de Eneboo,
 * `prodppal_general` (pedido completo, tramos) y `pr_config` (control de tiempo, formulario).
 */
export interface ConfigProduccion {
    /** El asistente de órdenes propone fabricar todo lo pendiente del pedido, no solo lo que falta (`pedidocompleto`). */
    pedidoCompleto: boolean;
    /** El Terminal declara la producción por tramos: cantidad y lotes consumidos (`usartramos`). */
    usarTramos: boolean;
    /** Se controla el tiempo de los trabajadores en las tareas (`controltiempo`). */
    controlTiempo: boolean;
    /** El Terminal muestra el formulario de la tarea (`mostrarformulario`). */
    mostrarFormulario: boolean;
}

export type GetConfigProduccion = () => Promise<ConfigProduccion>;
export type PatchConfigProduccion = (config: ConfigProduccion) => Promise<void>;
