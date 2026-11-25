import { DemoModulo } from "../diseño.ts";
import { CLIENTES, fecha } from "./comun.ts";

const oportunidad = (id: string, descripcion: string, cliente: number, importe: number, estado: string,
    descripcionEstado: string, probabilidad: number, cierre: number) => ({
    id, descripcion, cliente_id: CLIENTES[cliente].id, nombre_cliente: CLIENTES[cliente].nombre, importe,
    estado_id: estado, descripcion_estado: descripcionEstado, probabilidad, fecha_cierre: fecha(cierre),
    contacto_id: null, nombre_contacto: null, tarjeta_id: null, nombre_tarjeta: null, usuario_id: "demo",
    observaciones: null, valor_defecto: false, agente_id: null, acciones_pendientes: 1,
});

export const demo: DemoModulo = {
    pantallas: [{ nombre: "Oportunidades", ruta: "/crm/oportunidadventa" }],
    guia: "Mueve oportunidades entre fases, ábrelas o crea una nueva.",
    colecciones: {
        "crm/estado_oportunidad_venta": [
            { id: "nueva", estadobase: "Pendiente", descripcion: "Nueva", probabilidad: 10, valor_defecto: true },
            { id: "propuesta", estadobase: "Pendiente", descripcion: "Propuesta enviada", probabilidad: 40, valor_defecto: false },
            { id: "negociacion", estadobase: "Pendiente", descripcion: "Negociación", probabilidad: 70, valor_defecto: false },
            { id: "ganada", estadobase: "Ganada", descripcion: "Ganada", probabilidad: 100, valor_defecto: false },
            { id: "perdida", estadobase: "Perdida", descripcion: "Perdida", probabilidad: 0, valor_defecto: false },
        ],
        "crm/oportunidad_venta": [
            oportunidad("o1", "Suministro semanal de tomate", 1, 18400, "negociacion", "Negociación", 70, 12),
            oportunidad("o2", "Cajas de cítricos para Navidad", 0, 6200, "propuesta", "Propuesta enviada", 40, 20),
            oportunidad("o3", "Verdura de temporada para carta", 2, 3150, "nueva", "Nueva", 10, 35),
            oportunidad("o4", "Contrato anual cooperativa", 3, 42000, "propuesta", "Propuesta enviada", 40, 45),
            oportunidad("o5", "Pedido de prueba ecológico", 1, 950, "ganada", "Ganada", 100, -5),
            oportunidad("o6", "Ampliación de surtido", 0, 2800, "perdida", "Perdida", 0, -12),
        ],
        "crm/accion": [
            { id: "a1", descripcion: "Llamar para cerrar precio", fecha: fecha(1), estado: "Pendiente", tipo: "Llamada", oportunidad_id: "o1" },
            { id: "a2", descripcion: "Enviar muestras", fecha: fecha(3), estado: "Pendiente", tipo: "Visita", oportunidad_id: "o2" },
        ],
        "crm/cliente": CLIENTES,
        "crm/contacto": [
            { id: "k1", nombre: "Laura Gómez", email: "laura@ejemplo.test", telefono1: "600 000 001" },
            { id: "k2", nombre: "Javier Ruiz", email: "javier@ejemplo.test", telefono1: "600 000 002" },
        ],
    },
};
