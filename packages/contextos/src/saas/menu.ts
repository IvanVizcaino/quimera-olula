export const menuSaas = {
    "SaaS": { icono: "fichero" },
    "SaaS/Resumen": { url: "/dashboard/saas" },
    "SaaS/Dashboards": { url: "/comun/dashboard" },
    "SaaS/Empresas": { url: "/saas/empresas", regla: "saas.tenant" },
    "SaaS/Planes": { url: "/saas/planes", regla: "saas.catalogo" },
    "SaaS/Catálogo": { url: "/saas/catalogo", regla: "saas.catalogo" },
    "Administración/Credenciales": { url: "/comun/credencial-externa", regla: "comun.credencial_externa" },
    "SaaS/Pasarelas de cobro": { url: "/saas/pasarelas", regla: "saas.pasarela" },
};
