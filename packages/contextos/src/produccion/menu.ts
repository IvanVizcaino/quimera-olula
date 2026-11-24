// Producción (F2: maestros de planta; F3: maestros de procesos; F4: órdenes de producción). Las tablas pr_* solo existen donde está la producción de
// Eneboo (hispanicfiber): además de la regla de cada maestro, el plugin `produccion` activo.
export const menuProduccion = {
    "Producción": { icono: "menu_produccion", area: "Operaciones", plugin: "produccion" },
    "Producción/Órdenes de producción": {
        alias: ["órdenes de fabricación", "OP", "lotes de fabricación"],
        url: "/produccion/ordenes",
        regla: "produccion.orden",
        plugin: "produccion",
    },
    "Producción/Secciones": {
        url: "/produccion/secciones",
        regla: "produccion.seccion",
        plugin: "produccion",
    },
    "Producción/Trabajadores": {
        alias: ["operarios"],
        url: "/produccion/trabajadores",
        regla: "produccion.trabajador",
        plugin: "produccion",
    },
    "Producción/Tipos de centro de coste": {
        url: "/produccion/tipos_centro_coste",
        regla: "produccion.tipo_centro_coste",
        plugin: "produccion",
    },
    "Producción/Centros de coste": {
        url: "/produccion/centros_coste",
        regla: "produccion.centro_coste",
        plugin: "produccion",
    },
    "Producción/Horarios": {
        url: "/produccion/horarios",
        regla: "produccion.horario",
        plugin: "produccion",
    },
    "Producción/Calendario laboral": {
        alias: ["calendario", "festivos"],
        url: "/produccion/calendario",
        regla: "produccion.calendario",
        plugin: "produccion",
    },
    "Producción/Tipos de tarea": {
        url: "/produccion/tipos_tarea",
        regla: "produccion.tipo_tarea",
        plugin: "produccion",
    },
    "Producción/Tipos de proceso": {
        alias: ["procesos", "secuencias de tareas"],
        url: "/produccion/tipos_proceso",
        regla: "produccion.tipo_proceso",
        plugin: "produccion",
    },
    "Producción/Tiempos de tarea": {
        alias: ["costes de tareas", "tiempos de fabricación"],
        url: "/produccion/tiempos_tarea",
        regla: "produccion.tiempo_tarea",
        plugin: "produccion",
    },
    "Producción/Fabricación de artículos": {
        alias: ["artículos fabricados", "componentes", "escandallo"],
        url: "/produccion/articulos",
        regla: "produccion.articulo",
        plugin: "produccion",
    },
    "Producción/Configuración": {
        alias: ["control de tiempo", "tramos"],
        url: "/produccion/config",
        regla: "produccion.config",
        plugin: "produccion",
    },
};
