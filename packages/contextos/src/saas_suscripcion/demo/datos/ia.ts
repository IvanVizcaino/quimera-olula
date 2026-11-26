import { PeticionDemo, RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { ARTICULOS, CLIENTES, fechaHora } from "./comun.ts";

/**
 * Demo del asistente: el chat en modo estándar (POST /comun/ia, una petición normal; el
 * modo «Streaming» usa SSE y en la demo no responde), su historial de conversaciones y las
 * pantallas de memoria de empresa, flujos y tareas programadas. Las respuestas del chat son
 * fijas, elegidas por palabras clave de la pregunta, con cifras coherentes con las demás demos.
 */

const CATALOGO = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const euros = (n: number) => `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

let respuestas = 0;

/** Superficie a2ui con una tarjeta de métrica y, opcionalmente, una tabla. */
const superficie = (metrica: { titulo: string; valor: string; detalle: string },
    tabla?: { columnas: { id: string; cabecera: string }[]; filas: Record<string, string>[] }) => {
    const id = `demo-${++respuestas}`;
    const componentes: Record<string, unknown>[] = [
        { id: "root", component: "Column", children: tabla ? ["metrica", "tabla"] : ["metrica"] },
        { id: "metrica", component: "TarjetaMetrica", ...metrica },
    ];
    if (tabla) componentes.push({ id: "tabla", component: "Tabla", ...tabla });
    return [
        { version: "v0.9", createSurface: { surfaceId: id, catalogId: CATALOGO } },
        { version: "v0.9", updateComponents: { surfaceId: id, components: componentes } },
    ];
};

const TOP_CLIENTES = [
    { cliente: CLIENTES[0].nombre, importe: euros(256310.4) },
    { cliente: CLIENTES[1].nombre, importe: euros(203540.75) },
    { cliente: CLIENTES[3].nombre, importe: euros(143218.1) },
    { cliente: CLIENTES[2].nombre, importe: euros(90472.36) },
];

type Respuesta = { respuesta: string; a2ui_messages?: unknown[] };

const responderPregunta = (pregunta: string): Respuesta => {
    const p = pregunta.toLowerCase();
    if (/client|mejor|top/.test(p)) {
        return {
            respuesta: "Estos son tus mejores clientes del año por importe facturado. **Frutas Martín S.L.** "
                + "concentra el 34 % de la facturación; te sugiero revisar con Marta Sánchez la renovación de su tarifa.",
            a2ui_messages: superficie(
                { titulo: "Facturado a los 4 primeros clientes", valor: euros(693541.61), detalle: "92 % del total del año" },
                { columnas: [{ id: "cliente", cabecera: "Cliente" }, { id: "importe", cabecera: "Facturado" }], filas: TOP_CLIENTES },
            ),
        };
    }
    if (/stock|almac|existencia|agot/.test(p)) {
        const bajos = ARTICULOS.filter((a) => ["TOM01", "NAR01", "LIM01"].includes(a.referencia));
        return {
            respuesta: "Hay **3 referencias** con menos de dos semanas de cobertura según la previsión de ventas:\n\n"
                + bajos.map((a) => `- ${a.descripcion}: ${a.stock} en stock`).join("\n")
                + "\n\n¿Quieres que prepare un pedido a Semillas del Levante S.A. con las cantidades sugeridas?",
        };
    }
    if (/cobr|deud|recibo|impag/.test(p)) {
        return {
            respuesta: "Tienes **14 recibos pendientes de cobro** por 18.640,20 €. El más antiguo es de "
                + "Restaurante El Puerto (2.315,40 €, vencido hace 24 días). Puedo redactarle un recordatorio de pago si quieres.",
        };
    }
    if (/pedido|servir/.test(p)) {
        return {
            respuesta: "Hay **6 pedidos pendientes de servir** por 11.980,55 €. Dos son de Supermercados La Huerta "
                + "y salen mañana con la ruta de Granada; el resto puede servirse desde el almacén central esta semana.",
        };
    }
    if (/vent|factur|mes|año|resumen|cómo va|como va/.test(p)) {
        return {
            respuesta: "Este mes llevas facturados **48.575,63 €**, un 7,9 % más que en el mismo periodo del año pasado. "
                + "En lo que va de año suman 757.204,40 €, el 84 % del objetivo anual de 900.000 €. "
                + "Julio fue el mejor mes (89.926,15 €) y los tomates y las naranjas siguen siendo lo más vendido.",
            a2ui_messages: superficie({
                titulo: "Facturado este mes", valor: euros(48575.63), detalle: "+7,9 % frente al año anterior",
            }),
        };
    }
    return {
        respuesta: "Soy el asistente de Hortalizas del Sur (en esta demo mis respuestas son de ejemplo). Puedo ayudarte con:\n\n"
            + "- **Ventas**: «¿cómo van las ventas este mes?»\n"
            + "- **Clientes**: «¿quiénes son mis mejores clientes?»\n"
            + "- **Cobros**: «¿qué recibos tengo pendientes?»\n"
            + "- **Stock**: «¿qué artículos se van a agotar?»\n\n"
            + "También puedo abrir pantallas, crear presupuestos o preparar informes en PDF.",
    };
};

const responderChat = ({ cuerpo }: { url: string; cuerpo: unknown }) => {
    const { pregunta, thread_id } = (cuerpo ?? {}) as { pregunta?: string; thread_id?: string | null };
    return {
        ...responderPregunta(pregunta ?? ""),
        thread_id: thread_id || "demo-hilo-nuevo",
        capacidades_hash: "demo",
        necesita_capacidades: false,
    };
};

const HILOS = [
    { thread_id: "h1", titulo: "Ventas de este mes", actualizado_en: fechaHora(-1, "09:12:00"), canal: "web" },
    { thread_id: "h2", titulo: "Recibos pendientes de Restaurante El Puerto", actualizado_en: fechaHora(-3, "17:40:00"), canal: "web" },
    { thread_id: "h3", titulo: "Informe semanal de stock", actualizado_en: fechaHora(-4, "08:00:00"), canal: "tarea_programada" },
];

const MENSAJES: Record<string, [string, string][]> = {
    h1: [
        ["¿Cómo van las ventas este mes?", responderPregunta("ventas").respuesta],
    ],
    h2: [
        ["¿Qué le debe Restaurante El Puerto?", "Restaurante El Puerto tiene **2 recibos pendientes** por 3.105,80 €; uno vencido hace 24 días."],
        ["Redáctale un recordatorio amable", "Aquí lo tienes:\n\n«Hola, os escribimos de Hortalizas del Sur para recordaros que el recibo RC26-0412 de 2.315,40 € venció el pasado mes. Si ya lo habéis pagado, ignorad este mensaje. ¡Gracias!»"],
    ],
    h3: [
        ["Ejecuta el flujo «Informe semanal de stock»", responderPregunta("stock").respuesta],
    ],
};

const mensajesHilo = ({ url }: { url: string; cuerpo: unknown }) => {
    const id = /hilos\/([^/]+)\/mensajes/.exec(url)?.[1] ?? "";
    return {
        thread_id: id,
        mensajes: (MENSAJES[id] ?? []).flatMap(([pregunta, respuesta], i) => [
            { id: `${id}-u${i}`, rol: "user", texto: pregunta },
            { id: `${id}-a${i}`, rol: "assistant", texto: respuesta },
        ]),
    };
};

/** Alta en una colección con los campos que pone el servidor (fechas, autor…). */
const alta = (coleccion: string, extra: () => Record<string, unknown>): RespuestaFija => ({
    metodo: "POST",
    ruta: coleccion,
    cuerpo: ({ cuerpo, colecciones, nuevoId }: PeticionDemo) => {
        const id = nuevoId();
        (colecciones[coleccion] ??= []).unshift({ ...extra(), ...(cuerpo as Record<string, unknown> ?? {}), id });
        return { id };
    },
});

const ahora = () => fechaHora(0, new Date().toTimeString().slice(0, 8));

const fijas: RespuestaFija[] = [
    { metodo: "POST", ruta: "comun/ia", cuerpo: responderChat },
    {
        metodo: "POST", ruta: "comun/ia/a2ui-action",
        cuerpo: { respuesta: "Hecho (en la demo no se guarda nada).", thread_id: "demo-hilo-nuevo" },
    },
    { metodo: "GET", ruta: "comun/ia/hilos", cuerpo: { hilos: HILOS } },
    { metodo: "GET", ruta: /^comun\/ia\/hilos\/[^/]+\/mensajes$/, cuerpo: mensajesHilo },
    { metodo: "DELETE", ruta: /^comun\/ia\/hilos\/[^/]+$/, cuerpo: {} },
    { metodo: "GET", ruta: "comun/ia-memoria/estado-rag", cuerpo: { disponible: true } },
    alta("comun/ia-memoria", () => ({
        activo: true, origen: "texto", empresa_id: "1", creado_por: "demo", creado_en: ahora(), actualizado_en: ahora(),
        indexado: true, indexado_en: ahora(), modelo_desactualizado: false,
    })),
    alta("comun/ia-flujo", () => ({ activo: true, creado_por: "demo", creado_en: ahora(), actualizado_en: ahora() })),
    alta("comun/ia-tarea-programada", () => ({
        empresa_id: "1", usuario_id: "demo", proxima_ejecucion: fechaHora(1, "08:00:00"), credencial_ids: [],
    })),
    // Los maestros piden los recursos agregables para sus widgets: aquí no hay.
    { metodo: "GET", ruta: "comun/agregado", cuerpo: [] },
];

// ---------------------------------------------------------------------------
// Memoria de empresa, flujos y tareas programadas
// ---------------------------------------------------------------------------

const memoria = (id: string, titulo: string, contenido: string, activo: boolean, dias: number) => ({
    id, titulo, contenido, activo, origen: "texto", proveedor_externo: null, externo_modificado_en: null,
    empresa_id: "1", creado_por: "demo", creado_en: fechaHora(-dias - 30, "10:00:00"),
    actualizado_en: fechaHora(-dias, "16:20:00"), indexado: activo, indexado_en: activo ? fechaHora(-dias, "16:21:00") : undefined,
    modelo_desactualizado: false,
});

const flujo = (id: string, nombre: string, descripcionCorta: string, pasos: string[], activo: boolean, dias: number) => ({
    id, nombre, descripcion_corta: descripcionCorta, contenido: pasos.map((p, i) => `${i + 1}. ${p}`).join("\n"),
    activo, creado_por: "demo", creado_en: fechaHora(-dias - 20, "11:00:00"), actualizado_en: fechaHora(-dias, "11:45:00"),
});

const tarea = (id: string, nombre: string, flujoId: string, cron: string, activo: boolean, proxima: number, hora: string,
    credenciales: string[]) => ({
    id, nombre, ia_flujo_id: flujoId, empresa_id: "1", expresion_cron: cron, activo,
    proxima_ejecucion: fechaHora(proxima, hora), usuario_id: "demo", credencial_ids: credenciales,
});

const ejecucion = (id: string, tareaId: string, dias: number, hora: string, estado: string, resumen: string | null) => ({
    id, tarea_id: Number(tareaId), timestamp: fechaHora(-dias, hora), estado, resumen, thread_id: null,
});

const credencial = (id: string, nombre: string, proveedor: string) => ({
    id, empresa_id: "1", nombre, proveedor, tipo_auth: "api_key", activo: true, creado_por: "demo",
    creado_en: fechaHora(-60), actualizado_en: fechaHora(-10), propietario_id: null, categoria: "conector",
});

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Asistente", ruta: "/comun/asistente" },
        { nombre: "Memoria de empresa", ruta: "/comun/ia-memoria" },
        { nombre: "Flujos", ruta: "/comun/ia-flujo" },
        { nombre: "Tareas programadas", ruta: "/comun/ia-tarea-programada" },
    ],
    guia: "Pregunta al asistente por tus ventas, clientes o stock y revisa lo que sabe de tu empresa y lo que hace solo.",
    colecciones: {
        "comun/ia-memoria": [
            memoria("m6", "Política de precios", "Los precios de tarifa se revisan cada lunes según la lonja de Almería. "
                + "Descuento máximo sin aprobación: 5 %. Clientes de la cooperativa: tarifa B.", true, 2),
            memoria("m5", "Horario de reparto", "Rutas de reparto: Almería y Granada de lunes a viernes; Cádiz martes y jueves. "
                + "Pedidos antes de las 13:00 salen al día siguiente.", true, 5),
            memoria("m4", "Clientes prioritarios", "Frutas Martín S.L. y Supermercados La Huerta tienen prioridad en roturas de stock. "
                + "Restaurante El Puerto paga a 30 días y suele retrasarse.", true, 9),
            memoria("m3", "Calidades y calibres", "Tomate pera: calibre G y GG. Naranja de zumo: calibre 6-8. "
                + "El aguacate se vende por unidad, no por kilo.", true, 14),
            memoria("m2", "Proveedores habituales", "Semillas del Levante S.A. para semilla y plantel; Envases Andaluces S.L. para cajas; "
                + "Transportes Rápidos del Sur para las rutas largas.", true, 21),
            memoria("m1", "Campaña de verano (borrador)", "Ideas para la campaña de verano: packs de gazpacho, promoción de sandía "
                + "en cadenas y ampliar la ruta de Málaga.", false, 40),
        ],
        "comun/ia-flujo": [
            flujo("f5", "Informe semanal de stock", "Revisa la cobertura de stock y propone pedidos", [
                "Consulta el stock de todos los artículos y la previsión de ventas de las próximas 2 semanas.",
                "Lista los artículos con menos de 2 semanas de cobertura.",
                "Propón un pedido de compra al proveedor habitual de cada uno.",
                "Envía el resumen por Telegram al responsable de compras.",
            ], true, 3),
            flujo("f4", "Recordatorio de cobros vencidos", "Avisa a los clientes con recibos vencidos", [
                "Busca recibos de cobro vencidos hace más de 15 días.",
                "Agrupa por cliente y redacta un recordatorio amable.",
                "Envía el correo desde la cuenta de administración.",
            ], true, 6),
            flujo("f3", "Resumen diario de ventas", "Cifras del día anterior para dirección", [
                "Calcula lo facturado ayer y compáralo con el mismo día del año pasado.",
                "Destaca los 3 clientes y los 3 artículos con más ventas.",
                "Envía el resumen por Telegram a dirección.",
            ], true, 1),
            flujo("f1", "Alta de cliente desde correo", "Crea clientes a partir de solicitudes recibidas", [
                "Lee los correos con asunto «Alta de cliente».",
                "Extrae nombre, CIF, dirección y correo de facturación.",
                "Crea el cliente y pide confirmación antes de guardarlo.",
            ], false, 18),
            flujo("f2", "Tarifa semanal", "Actualiza precios según la lonja", [
                "Lee el boletín de precios de la lonja de esta semana.",
                "Calcula la nueva tarifa con el margen de cada familia.",
                "Prepara la propuesta de cambio de precios para revisión.",
            ], true, 7),
        ],
        "comun/ia-tarea-programada": [
            tarea("3", "Stock de los lunes", "f5", "0 8 * * 1", true, 5, "08:00:00", ["cr1"]),
            tarea("2", "Cobros vencidos", "f4", "30 9 * * 3", true, 0, "09:30:00", ["cr2"]),
            tarea("4", "Ventas de ayer", "f3", "0 7 * * *", true, 1, "07:00:00", ["cr1"]),
            tarea("1", "Tarifa de la semana", "f2", "0 18 * * 5", false, 2, "18:00:00", []),
        ],
        "comun/ia-tarea-programada/3/ejecuciones": [
            ejecucion("e31", "3", 2, "08:00:12", "ok", "3 artículos con poca cobertura: tomate pera, naranja de zumo y limón. Pedido propuesto a Semillas del Levante S.A."),
            ejecucion("e32", "3", 9, "08:00:09", "ok", "Stock suficiente para las próximas 2 semanas. Sin pedidos propuestos."),
            ejecucion("e33", "3", 16, "08:00:15", "error", "No se pudo enviar el mensaje de Telegram: la credencial había caducado."),
        ],
        "comun/ia-tarea-programada/2/ejecuciones": [
            ejecucion("e21", "2", 7, "09:30:05", "ok", "Enviados 2 recordatorios: Restaurante El Puerto y Cooperativa Vega Baja."),
            ejecucion("e22", "2", 14, "09:30:04", "bloqueada", "Pendiente de confirmar el envío de 3 correos en la cola de aprobaciones."),
        ],
        "comun/ia-tarea-programada/4/ejecuciones": [
            ejecucion("e41", "4", 0, "07:00:03", "ok", "Ayer: 2.840,15 € facturados (+6 % frente al año anterior). Mejor cliente: Frutas Martín S.L."),
            ejecucion("e42", "4", 1, "07:00:04", "ok", "Ayer: 3.105,92 € facturados (+11 % frente al año anterior)."),
            ejecucion("e43", "4", 2, "07:00:02", "ok", "Ayer: 1.960,40 € facturados (-3 % frente al año anterior)."),
        ],
        "comun/ia-tarea-programada/1/ejecuciones": [],
        "comun/credencial-externa": [
            credencial("cr1", "Telegram de dirección", "telegram"),
            credencial("cr2", "Correo de administración", "smtp"),
        ],
    },
    fijas,
};
