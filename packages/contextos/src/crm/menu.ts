export const menuCrm = {
    "CRM": { icono: "menu_crm", area: "Comercial" },
    "CRM/Resumen": { url: "/dashboard/crm" },
    "CRM/Oportunidades de venta": { url: "/crm/oportunidadventa", regla: "crm.oportunidad_venta.leer" },
    "CRM/Clientes": { url: "/crm/cliente", regla: "crm.cliente.leer" },
    "CRM/Contactos": { url: "/crm/contacto", regla: "crm.contacto.leer" },
    "CRM/Acciones": { url: "/crm/accion", regla: "crm.accion.leer" },
    "CRM/Leads": { alias: ["prospectos"], url: "/crm/lead", regla: "crm.lead.leer" },
    "CRM/Incidencias": { url: "/crm/incidencia", regla: "crm.incidencia.leer" },
    "CRM/Agentes": { url: "/crm/agente", regla: "ventas.agente" },
    "CRM/Otros": { url: "/crm/otros", regla: "crm.lead.leer" },
};