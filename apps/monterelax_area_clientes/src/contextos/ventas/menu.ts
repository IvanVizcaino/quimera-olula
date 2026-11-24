export const menuVentas = {
    "Catálogo": { icono: "tienda" },
    "Catálogo/Categorías": { url: "/admin/catalogo/categorias", icono: "lista" },
    "Catálogo/Catálogo": { url: "/catalogo", icono: "fichero" },

    "Área de clientes": { icono: "usuario_circle" },
    "Área de clientes/Pedidos": {
        url: "/areaclientes/pedidos",
        regla: "AreaClientes:visit",
        icono: "lista",
    },
    "Área de clientes/Mis albaranes": {
        url: "/areaclientes/albaranes",
        regla: "AreaClientes:visit",
        icono: "fichero",
    },
    "Área de clientes/Mis facturas": {
        url: "/areaclientes/facturas",
        regla: "AreaClientes:visit",
        icono: "fichero",
    },
    "Área de clientes/Mis tarifas": {
        url: "/areaclientes/tarifas",
        regla: "AreaClientes:visit",
        icono: "etiqueta_compra",
    },
    "Área de clientes/Reparaciones": {
        url: "/areaclientes/reparaciones",
        regla: "AreaClientes:visit",
        icono: "llave_inglesa",
    },
};