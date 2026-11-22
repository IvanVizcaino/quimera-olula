import {
    Catalogo, DerechoLimite, Objetivo, PlanCatalogo, Presupuesto, Suscripcion, SuscripcionWhoami,
} from "../diseño.ts";
import {
    accionErrorSuscripcion, ahorroAnual, avisoSuscripcion, claveObjetivo, estadoFactura, estadoVisible,
    extrasOfrecidos, fechaCorta, leerSuscripcionWhoami, limitesDePlan, metaNuevoMandato, modulosExtraOfrecidos,
    motivoModuloBloqueado, objetivoConExtra, objetivoConModulo, objetivoConPlan, objetivoDeSuscripcion,
    planPorDefecto, puedeCancelar, puedeConfirmarCambio, puedeReanudar, resultadoPagoDeUrl, textoCambioProgramado,
    textoEfecto, textoExceso, textoPrueba, urlsRetornoPago, usoLimite,
} from "../dominio.ts";

const precio = (m: string, a: string) => ({ mensual: m, anual: a });

const catalogo: Catalogo = {
    limites: [
        { id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", orden: 10 },
        { id: "puntos_tpv", nombre: "Puntos de venta TPV", unidad: "puntos de venta", tipo: "recuento", orden: 20 },
        { id: "consultas_ia", nombre: "Consultas al asistente", unidad: "consultas", tipo: "consumo_mensual", orden: 40 },
        { id: "llamadas_mcp", nombre: "Llamadas", unidad: "llamadas", tipo: "consumo_mensual", orden: 50 },
    ],
    modulos: [
        { id: "ventas", nombre: "Ventas", descripcion: "", dependeDe: [], precio: precio("0.00", "0.00"), contratableSuelto: false, orden: 10 },
        { id: "almacen", nombre: "Almacén", descripcion: "Stock", dependeDe: [], precio: precio("10.00", "100.00"), contratableSuelto: true, orden: 30 },
        { id: "tpv", nombre: "TPV", descripcion: "Cajas", dependeDe: ["ventas", "almacen"], precio: precio("20.00", "200.00"), contratableSuelto: true, orden: 70 },
        { id: "ia", nombre: "Asistente IA", descripcion: "", dependeDe: [], precio: precio("0.00", "0.00"), contratableSuelto: false, orden: 110 },
    ],
    planes: [],
    extras: [
        { id: "usuario", nombre: "Usuario adicional", descripcion: "", limiteId: "usuarios", cantidad: 1, requiereModulo: null, precio: precio("8.00", "80.00"), orden: 10 },
        { id: "punto_tpv", nombre: "Punto TPV", descripcion: "", limiteId: "puntos_tpv", cantidad: 1, requiereModulo: "tpv", precio: precio("12.00", "120.00"), orden: 20 },
        { id: "pack_ia", nombre: "Pack IA", descripcion: "", limiteId: "consultas_ia", cantidad: 500, requiereModulo: "ia", precio: precio("10.00", "100.00"), orden: 30 },
    ],
};

const plan = (id: string, orden: number, extra: Partial<PlanCatalogo> = {}): PlanCatalogo => ({
    id, nombre: id.charAt(0).toUpperCase() + id.slice(1), descripcion: "", precio: precio("49.00", "490.00"),
    diasPrueba: 0, destacado: false, orden,
    modulos: [
        { moduloId: "ventas", modo: "incluido", precio: null, opciones: {} },
        { moduloId: "ia", modo: "incluido", precio: null, opciones: {} },
        { moduloId: "almacen", modo: "extra", precio: null, opciones: {} },
        { moduloId: "tpv", modo: "extra", precio: null, opciones: {} },
    ],
    limites: [
        { limiteId: "usuarios", valor: 4, ampliable: true },
        { limiteId: "puntos_tpv", valor: 0, ampliable: true },
        { limiteId: "consultas_ia", valor: 300, ampliable: true },
        { limiteId: "llamadas_mcp", valor: null, ampliable: false },
    ],
    ...extra,
});

const negocio = plan("negocio", 20);
const pro = plan("pro", 30, { destacado: true, diasPrueba: 30 });
const esencial = plan("esencial", 10, {
    modulos: [
        { moduloId: "ventas", modo: "incluido", precio: null, opciones: {} },
        { moduloId: "almacen", modo: "extra", precio: null, opciones: {} },
        { moduloId: "tpv", modo: "extra", precio: null, opciones: {} },
    ],
    limites: [{ limiteId: "usuarios", valor: 1, ampliable: false }],
});
catalogo.planes = [negocio, pro, esencial];

const objetivo = (o: Partial<Objetivo> = {}): Objetivo =>
    ({ planId: "negocio", periodicidad: "mensual", modulos: [], extras: {}, ...o });

describe("formato", () => {
    test("fechaCorta pasa ISO a dd/mm/aaaa sin zona horaria", () => {
        expect(fechaCorta("2026-12-11")).toBe("11/12/2026");
        expect(fechaCorta("2026-12-11T00:00:00")).toBe("11/12/2026");
        expect(fechaCorta(null)).toBe("");
    });

    test("ahorroAnual", () => {
        expect(ahorroAnual(precio("49.00", "490.00"))).toBe(98);
        expect(ahorroAnual(precio("10.00", "120.00"))).toBe(0);
    });
});

describe("estado de la suscripción", () => {
    const base: Suscripcion = {
        id: "s", planId: "negocio", periodicidad: "mensual", estado: "activa", inicioPeriodo: "2026-11-11",
        finPeriodo: "2026-12-11", finPrueba: null, impagadaDesde: null, cambioProgramado: null,
        cancelarAlFin: false, tieneMetodoPago: true, descuentoPct: "0.00", modulos: [], extras: {},
    };

    test("estados visibles", () => {
        expect(estadoVisible(base)).toEqual({ texto: "Activa", variante: "exito" });
        expect(estadoVisible({ ...base, estado: "prueba", finPrueba: "2026-12-01" }).texto).toBe("En prueba hasta el 01/12/2026");
        expect(estadoVisible({ ...base, estado: "impagada" }).texto).toBe("Pago pendiente");
        expect(estadoVisible({ ...base, estado: "solo_lectura" }).texto).toBe("Solo lectura");
        expect(estadoVisible({ ...base, cancelarAlFin: true }).texto).toBe("Cancelada: activa hasta el 11/12/2026");
    });

    test("cancelar y reanudar; el legado no se cancela", () => {
        expect(puedeCancelar(base)).toBe(true);
        expect(puedeCancelar({ ...base, planId: "legado" })).toBe(false);
        expect(puedeCancelar({ ...base, cancelarAlFin: true })).toBe(false);
        expect(puedeReanudar({ ...base, cancelarAlFin: true })).toBe(true);
        expect(puedeReanudar(base)).toBe(false);
        expect(puedeCancelar({ ...base, estado: "finalizada" })).toBe(false);
    });

    test("cambio programado con nombre del plan", () => {
        const s = { ...base, cambioProgramado: objetivo({ planId: "pro", periodicidad: "anual" }) };
        expect(textoCambioProgramado(s, catalogo)).toBe("El 11/12/2026 pasarás al plan Pro (anual).");
        expect(textoCambioProgramado(base, catalogo)).toBeNull();
    });

    test("objetivoDeSuscripcion normaliza", () => {
        expect(objetivoDeSuscripcion({ ...base, modulos: ["tpv"], extras: { usuario: 1, punto_tpv: 0 } }))
            .toEqual({ planId: "negocio", periodicidad: "mensual", modulos: ["tpv"], extras: { usuario: 1 } });
    });
});

describe("uso de límites", () => {
    const l = (valor: number | null, uso: number, extra: Partial<DerechoLimite> = {}): DerechoLimite =>
        ({ id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", valor, uso, ...extra });

    test("normal, alto y excedido", () => {
        expect(usoLimite(l(4, 3))).toMatchObject({ porcentaje: 75, nivel: "normal", texto: "3 de 4 usuarios" });
        expect(usoLimite(l(300, 250, { unidad: "consultas", tipo: "consumo_mensual" })))
            .toMatchObject({ nivel: "alto", texto: "250 de 300 consultas este mes" });
        expect(usoLimite(l(4, 6))).toMatchObject({ porcentaje: 100, nivel: "excedido" });
    });

    test("ilimitado no tiene porcentaje", () => {
        const u = usoLimite(l(null, 12));
        expect(u.porcentaje).toBeNull();
        expect(u.texto).toContain("ilimitado");
    });

    test("valor cero", () => {
        expect(usoLimite(l(0, 0)).texto).toBe("No incluido en tu plan");
        expect(usoLimite(l(0, 2)).nivel).toBe("excedido");
    });
});

describe("construcción del objetivo", () => {
    test("claveObjetivo ignora el orden y las cantidades a cero", () => {
        expect(claveObjetivo(objetivo({ modulos: ["tpv", "almacen"], extras: { a: 0, usuario: 2 } })))
            .toBe(claveObjetivo(objetivo({ modulos: ["almacen", "tpv"], extras: { usuario: 2 } })));
    });

    test("módulos extra ofrecidos con el precio de la periodicidad", () => {
        const m = modulosExtraOfrecidos(negocio, catalogo, "anual");
        expect(m.map((x) => [x.id, x.precio])).toEqual([["almacen", "100.00"], ["tpv", "200.00"]]);
    });

    test("el precio propio del plan manda sobre el del catálogo", () => {
        const p = plan("x", 1, {
            modulos: [{ moduloId: "almacen", modo: "extra", precio: precio("7.00", "70.00"), opciones: {} }],
        });
        expect(modulosExtraOfrecidos(p, catalogo, "mensual")[0].precio).toBe("7.00");
    });

    test("depende_de: TPV bloqueado hasta tener Almacén", () => {
        const tpv = modulosExtraOfrecidos(negocio, catalogo, "mensual").find((m) => m.id === "tpv")!;
        expect(motivoModuloBloqueado(tpv, new Set(["ventas"]), catalogo)).toBe("Necesita Almacén");
        expect(motivoModuloBloqueado(tpv, new Set(["ventas", "almacen"]), catalogo)).toBeNull();
        expect(motivoModuloBloqueado(tpv, new Set(), catalogo)).toBe("Necesita Ventas y Almacén");
    });

    test("quitar un módulo quita en cascada los que dependían de él", () => {
        const o = objetivo({ modulos: ["almacen", "tpv"], extras: { punto_tpv: 2 } });
        const sin = objetivoConModulo(o, "almacen", false, negocio, catalogo);
        expect(sin.modulos).toEqual([]);
        expect(sin.extras).toEqual({});
    });

    test("marcar un módulo lo añade", () => {
        expect(objetivoConModulo(objetivo(), "almacen", true, negocio, catalogo).modulos).toEqual(["almacen"]);
    });

    test("extras: solo ampliables, con módulo requerido presente", () => {
        expect(extrasOfrecidos(negocio, catalogo, objetivo()).map((e) => e.id)).toEqual(["usuario", "pack_ia"]);
        expect(extrasOfrecidos(negocio, catalogo, objetivo({ modulos: ["almacen", "tpv"] })).map((e) => e.id))
            .toEqual(["usuario", "punto_tpv", "pack_ia"]);
        // Esencial: usuarios no ampliable y sin IA
        expect(extrasOfrecidos(esencial, catalogo, objetivo({ planId: "esencial" }))).toEqual([]);
    });

    test("cambiar de plan conserva lo compatible y descarta el resto", () => {
        const o = objetivo({ modulos: ["almacen", "tpv"], extras: { usuario: 2, punto_tpv: 1, pack_ia: 1 } });
        const aEsencial = objetivoConPlan(o, esencial, catalogo);
        expect(aEsencial).toEqual({ planId: "esencial", periodicidad: "mensual", modulos: ["almacen", "tpv"], extras: {} });
        // Pro incluye tpv: ya no es extra
        const proConTpvIncluido = plan("pro2", 5, {
            modulos: [
                { moduloId: "ventas", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "almacen", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "tpv", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "ia", modo: "incluido", precio: null, opciones: {} },
            ],
        });
        expect(objetivoConPlan(o, proConTpvIncluido, catalogo).modulos).toEqual([]);
    });

    test("cantidad de un extra acotada", () => {
        expect(objetivoConExtra(objetivo(), "usuario", 3).extras).toEqual({ usuario: 3 });
        expect(objetivoConExtra(objetivo({ extras: { usuario: 1 } }), "usuario", -2).extras).toEqual({});
        expect(objetivoConExtra(objetivo(), "usuario", 500).extras).toEqual({ usuario: 99 });
    });
});

describe("presupuesto", () => {
    const cuota = (total: string) => ({ periodicidad: "mensual" as const, base: total, descuento: "0.00", total, lineas: [] });
    const p = (extra: Partial<Presupuesto> = {}): Presupuesto => ({
        objetivo: objetivo({ planId: "pro" }), cuotaActual: cuota("77.00"), cuotaNueva: cuota("99.00"),
        efecto: "inmediato", fechaEfecto: "2026-11-11", prorrateo: "22.00", aplicable: true, avisos: [], excesos: [], ...extra,
    });

    test("efecto inmediato con prorrateo", () => {
        expect(textoEfecto(p())).toMatch(/^Se aplica hoy\. Cobramos 22,00\s€ por lo que queda del periodo actual\.$/);
    });

    test("efecto inmediato sin cobro", () => {
        expect(textoEfecto(p({ prorrateo: "0.00" }))).toBe("Se aplica hoy, sin cargo adicional por lo que queda del periodo.");
    });

    test("efecto a fin de periodo con fecha", () => {
        expect(textoEfecto(p({ efecto: "fin_periodo", fechaEfecto: "2026-12-11" }))).toContain("Se aplica el 11/12/2026");
    });

    test("texto de exceso de recuento y de consumo", () => {
        const e = { limiteId: "usuarios", nombre: "Usuarios", uso: 7, limite: 4 };
        const lim: DerechoLimite = { id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", valor: 10, uso: 7 };
        expect(textoExceso(e, "Negocio", lim))
            .toBe("Tienes 7 usuarios y Negocio permite 4: libera 3 antes de hacer este cambio.");
        expect(textoExceso({ ...e, limiteId: "consultas_ia", uso: 212, limite: 50 }, "Esencial",
            { ...lim, id: "consultas_ia", unidad: "consultas", tipo: "consumo_mensual" }))
            .toContain("Este mes llevas 212 consultas");
    });

    test("puedeConfirmarCambio exige presupuesto vigente, aplicable y con cambio", () => {
        const actual = objetivo();
        const nuevo = objetivo({ planId: "pro" });
        expect(puedeConfirmarCambio(p(), nuevo, actual)).toBe(true);
        expect(puedeConfirmarCambio(null, nuevo, actual)).toBe(false);
        expect(puedeConfirmarCambio(p({ aplicable: false }), nuevo, actual)).toBe(false);
        expect(puedeConfirmarCambio(p({ excesos: [{ limiteId: "u", nombre: "U", uso: 5, limite: 4 }] }), nuevo, actual)).toBe(false);
        // presupuesto de otro objetivo (el usuario siguió cambiando)
        expect(puedeConfirmarCambio(p(), objetivo({ planId: "esencial" }), actual)).toBe(false);
        // sin cambio respecto a lo actual
        expect(puedeConfirmarCambio(p({ objetivo: actual }), actual, actual)).toBe(false);
    });
});

describe("planes", () => {
    test("plan por defecto: Pro, o el destacado, o el primero", () => {
        expect(planPorDefecto(catalogo.planes)?.id).toBe("pro");
        expect(planPorDefecto([negocio, esencial])?.id).toBe("esencial");
        expect(planPorDefecto([negocio, { ...esencial, destacado: true }])?.id).toBe("esencial");
        expect(planPorDefecto([])).toBeNull();
    });

    test("textos de prueba y límites del plan", () => {
        expect(textoPrueba(pro)).toBe("30 días gratis, sin tarjeta");
        expect(textoPrueba(negocio)).toBe("");
        expect(limitesDePlan(negocio, catalogo)).toEqual(["4 usuarios", "300 consultas al mes", "Llamadas: ilimitado"]);
    });
});

describe("pago", () => {
    test("urls de retorno", () => {
        expect(urlsRetornoPago("https://app.example.com")).toEqual({
            ok: "https://app.example.com/ajustes/suscripcion?pago=ok",
            cancelado: "https://app.example.com/ajustes/suscripcion?pago=cancelado",
        });
    });

    test("resultado del pago desde la URL", () => {
        expect(resultadoPagoDeUrl("?pago=ok")).toBe("ok");
        expect(resultadoPagoDeUrl("pago=cancelado")).toBe("cancelado");
        expect(resultadoPagoDeUrl("?pago=raro")).toBeNull();
        expect(resultadoPagoDeUrl("")).toBeNull();
    });

    test("validación del mandato SEPA", () => {
        const iban = metaNuevoMandato.campos!.iban.validacion!;
        expect(iban({ titular: "A", iban: "ES9121000418450200051332" })).toBe(true);
        expect(iban({ titular: "A", iban: "ES0000" })).toBe("El IBAN no es válido");
        expect(metaNuevoMandato.campos!.titular.validacion!({ titular: "  ", iban: "" })).toBe(false);
    });
});

describe("facturas", () => {
    test("estados", () => {
        const f = (estado: string) => ({ id: "1", periodoDesde: "", periodoHasta: "", concepto: "", base: "0", iva: "0", total: "0", estado, numeroFactura: null, urlPdf: null });
        expect(estadoFactura(f("pagada")).variante).toBe("exito");
        expect(estadoFactura(f("devuelta")).variante).toBe("error");
        expect(estadoFactura(f("rara")).texto).toBe("Rara");
    });
});

describe("aviso global", () => {
    const w = (extra: Partial<SuscripcionWhoami> = {}): SuscripcionWhoami => ({
        planId: "pro", plan: "Pro", estado: "activa", finPrueba: null, finPeriodo: "2026-12-11",
        cancelarAlFin: false, tieneMetodoPago: true, ...extra,
    });

    test("sin aviso si todo va bien", () => {
        expect(avisoSuscripcion(null)).toBeNull();
        expect(avisoSuscripcion(w())).toBeNull();
        expect(avisoSuscripcion(w({ estado: "prueba", tieneMetodoPago: true }))).toBeNull();
    });

    test("prueba sin método de pago", () => {
        const a = avisoSuscripcion(w({ estado: "prueba", tieneMetodoPago: false, finPrueba: "2026-12-01" }))!;
        expect(a.mensaje).toContain("Tu prueba termina el 01/12/2026. Añade un método de pago");
        expect(a.variante).toBe("info");
    });

    test("impagada y solo lectura son errores", () => {
        expect(avisoSuscripcion(w({ estado: "impagada" }))?.variante).toBe("error");
        expect(avisoSuscripcion(w({ estado: "solo_lectura" }))?.variante).toBe("error");
    });

    test("cancelada al final del periodo", () => {
        const a = avisoSuscripcion(w({ cancelarAlFin: true }))!;
        expect(a.mensaje).toContain("terminará el 11/12/2026");
        expect(a.accion).toBe("Reanudar suscripción");
    });

    test("lee la clave del whoami", () => {
        const raw = JSON.stringify({ saas: { suscripcion: {
            plan_id: "pro", plan: "Pro", estado: "prueba", fin_prueba: "2026-12-01", fin_periodo: "2026-12-01",
            cancelar_al_fin: false, tiene_metodo_pago: false,
        } } });
        expect(leerSuscripcionWhoami(raw)).toEqual({
            planId: "pro", plan: "Pro", estado: "prueba", finPrueba: "2026-12-01", finPeriodo: "2026-12-01",
            cancelarAlFin: false, tieneMetodoPago: false,
        });
        expect(leerSuscripcionWhoami(JSON.stringify({ saas: { suscripcion: null } }))).toBeNull();
        expect(leerSuscripcionWhoami(JSON.stringify({}))).toBeNull();
        expect(leerSuscripcionWhoami("no json")).toBeNull();
        expect(leerSuscripcionWhoami(null)).toBeNull();
    });
});

describe("acción en errores de límites", () => {
    test("con permiso, enlace a la suscripción", () => {
        expect(accionErrorSuscripcion({ tipo: "limite", mensaje: "x" }, true))
            .toEqual({ texto: "Ver mi suscripción", url: "/ajustes/suscripcion" });
    });

    test("sin permiso, indicación sin enlace", () => {
        const a = accionErrorSuscripcion({ tipo: "limite", mensaje: "x" }, false);
        expect(a.url).toBeUndefined();
        expect(a.texto).toMatch(/administrador/);
    });
});
