// Producción (F2: maestros de planta). Las tablas pr_* solo existen donde está la producción de
// Eneboo (hispanicfiber): además de la regla de cada maestro, el plugin `produccion` activo.
export const menuProduccion = {
    "Producción": { icono: "menu_produccion", area: "Operaciones", plugin: "produccion" },
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
};
