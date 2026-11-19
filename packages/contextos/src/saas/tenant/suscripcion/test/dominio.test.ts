import { Catalogo } from "../../../catalogo/diseño.ts";
import { Plan } from "../../../plan/diseño.ts";
import { DatosSuscripcion, SuscripcionTenant } from "../diseño.ts";
import {
    alternarModulo, cambiarCantidadExtra, cambiarPlanElegido, cambioInicial, cambiosCondiciones, cuerpoExcepcion,
    descuentoValido, excepcionValida, facturaPendiente, formDeExcepcion, formExcepcionVacio, modulosExtraDelPlan,
    normalizarCambio, planesSeleccionables, puedePasarASoloLectura, puedeReactivarSuscripcion, textoUsoLimite,
    formCondiciones, textoIvaAplicado,
} from "../dominio.ts";
import { cambioPlanAApi, cambiosSuscripcionAApi, datosSuscripcionDesdeApi } from "../infraestructura.ts";

const plan = (id: string, extra: string[], activo = true): Plan => ({
    id, nombre: id, descripcion: "", precio: { mensual: "10.00", anual: "100.00" }, diasPrueba: 0,
    publico: true, activo, destacado: false, orden: 0, avisos: [],
    modulos: [
        ...extra.map((m) => ({ moduloId: m, modo: "extra" as const, precio: null, opciones: {} })),
        { moduloId: "ventas", modo: "incluido" as const, precio: null, opciones: {} },
    ],
    limites: [],
});

const catalogo: Catalogo = {
    limites: [],
    modulos: [],
    planes: [plan("esencial", ["tpv", "crm"]), plan("negocio", ["tpv"]), plan("viejo", [], false)],
    extras: [
        { id: "usuario", nombre: "Usuario", descripcion: "", limiteId: "usuarios", cantidad: 1, requiereModulo: null,
            precio: { mensual: "8.00", anual: "80.00" }, recurrente: true, publico: true, activo: true, orden: 0 },
    ],
};

const susc: SuscripcionTenant = {
    id: "s1", planId: "esencial", periodicidad: "anual", estado: "activa", inicioPeriodo: "2026-11-01",
    finPeriodo: "2026-12-01", finPrueba: null, impagadaDesde: null, cambioProgramado: null, cancelarAlFin: false,
    pasarelaId: null, tieneMetodoPago: false, descuentoPct: "0.00", precioFijadoHasta: null, notas: "",
    modulos: ["tpv", "crm"], extras: { usuario: 2 },
};

describe("cambio de plan", () => {
    test("los módulos extra disponibles son los que el plan declara como extra", () => {
        expect(modulosExtraDelPlan(catalogo.planes[0])).toEqual(["tpv", "crm"]);
        expect(modulosExtraDelPlan(undefined)).toEqual([]);
    });

    test("planes seleccionables: activos más el actual aunque esté archivado", () => {
        expect(planesSeleccionables(catalogo, null).map((p) => p.id)).toEqual(["esencial", "negocio"]);
        expect(planesSeleccionables(catalogo, "viejo").map((p) => p.id)).toEqual(["esencial", "negocio", "viejo"]);
    });

    test("al elegir otro plan se descartan los módulos que allí no son extra", () => {
        const cambio = { planId: "esencial", periodicidad: "mensual" as const, modulos: ["tpv", "crm"], extras: {}, conPrueba: false };
        expect(cambiarPlanElegido(cambio, "negocio", catalogo).modulos).toEqual(["tpv"]);
    });

    test("normalizarCambio quita extras con cantidad cero o desconocidos", () => {
        const cambio = { planId: "esencial", periodicidad: "mensual" as const, modulos: [], extras: { usuario: 0, otro: 3 }, conPrueba: false };
        expect(normalizarCambio({ ...cambio, extras: { ...cambio.extras, usuario: 2 } }, catalogo).extras).toEqual({ usuario: 2 });
        expect(normalizarCambio(cambio, catalogo).extras).toEqual({});
    });

    test("cambioInicial parte de la suscripción actual, sin prueba", () => {
        const datos = { suscripcion: susc } as DatosSuscripcion;
        expect(cambioInicial(datos, catalogo)).toEqual({
            planId: "esencial", periodicidad: "anual", modulos: ["tpv", "crm"], extras: { usuario: 2 }, conPrueba: false,
        });
    });

    test("sin suscripción: primer plan activo, mensual y con prueba", () => {
        expect(cambioInicial(null, catalogo)).toEqual({
            planId: "esencial", periodicidad: "mensual", modulos: [], extras: {}, conPrueba: true,
        });
    });

    test("alternar módulos y cantidades de extras", () => {
        let c = cambioInicial(null, catalogo);
        c = alternarModulo(c, "tpv", true);
        c = alternarModulo(c, "tpv", true);
        expect(c.modulos).toEqual(["tpv"]);
        c = alternarModulo(c, "tpv", false);
        expect(c.modulos).toEqual([]);
        c = cambiarCantidadExtra(c, "usuario", 3);
        expect(c.extras).toEqual({ usuario: 3 });
        c = cambiarCantidadExtra(c, "usuario", 0);
        expect(c.extras).toEqual({});
    });

    test("cambioPlanAApi usa snake_case", () => {
        expect(cambioPlanAApi({ planId: "negocio", periodicidad: "mensual", modulos: ["tpv"], extras: { usuario: 1 }, conPrueba: true }))
            .toEqual({ plan_id: "negocio", periodicidad: "mensual", modulos: ["tpv"], extras: { usuario: 1 }, con_prueba: true });
    });
});

describe("estado de la suscripción", () => {
    test("solo lectura y reactivar", () => {
        expect(puedePasarASoloLectura(susc)).toBe(true);
        expect(puedePasarASoloLectura({ ...susc, estado: "solo_lectura" })).toBe(false);
        expect(puedeReactivarSuscripcion({ ...susc, estado: "solo_lectura" })).toBe(true);
        expect(puedeReactivarSuscripcion(susc)).toBe(false);
    });

    test("solo las facturas pendientes se pueden marcar", () => {
        expect(facturaPendiente({ estado: "pendiente" })).toBe(true);
        expect(facturaPendiente({ estado: "pagada" })).toBe(false);
    });

    test("uso de un límite, con ilimitado", () => {
        expect(textoUsoLimite(1, 5)).toBe("1 / 5");
        expect(textoUsoLimite(1, null)).toBe("1 / Ilimitado");
    });
});

describe("condiciones", () => {
    test("sin tocar nada no viaja nada", () => {
        expect(cambiosCondiciones(susc, formCondiciones(susc))).toEqual({});
    });

    test("solo viajan los campos cambiados; pasarela vacía = ninguna (null)", () => {
        const form = { ...formCondiciones({ ...susc, pasarelaId: "stripe" }), descuentoPct: "10,5", pasarelaId: "", notas: "VIP" };
        expect(cambiosCondiciones({ ...susc, pasarelaId: "stripe" }, form)).toEqual({
            descuentoPct: "10.5", pasarelaId: null, notas: "VIP",
        });
    });

    test("precio fijado vacío = quitarlo", () => {
        const conFijado = { ...susc, precioFijadoHasta: "2027-01-01" };
        expect(cambiosCondiciones(conFijado, { ...formCondiciones(conFijado), precioFijadoHasta: "" }))
            .toEqual({ precioFijadoHasta: "" });
    });

    test("ampliar prueba y regalar días", () => {
        const enPrueba = { ...susc, estado: "prueba" as const, finPrueba: "2026-11-20" };
        const form = { ...formCondiciones(enPrueba), finPrueba: "2026-12-20", finPeriodo: "2026-12-15" };
        expect(cambiosCondiciones(enPrueba, form)).toEqual({ finPrueba: "2026-12-20", finPeriodo: "2026-12-15" });
    });

    test("cuerpo del PATCH en snake_case", () => {
        expect(cambiosSuscripcionAApi({ descuentoPct: "5", precioFijadoHasta: "", pasarelaId: null, finPeriodo: "2026-12-15" }))
            .toEqual({ descuento_pct: "5", precio_fijado_hasta: "", pasarela_id: null, fin_periodo: "2026-12-15" });
    });

    test("el descuento va de 0 a 100", () => {
        expect(descuentoValido("0")).toBe(true);
        expect(descuentoValido("100")).toBe(true);
        expect(descuentoValido("100.5")).toBe(false);
        expect(descuentoValido("x")).toBe(false);
    });
});

describe("excepciones de límite", () => {
    test("el motivo es obligatorio", () => {
        expect(excepcionValida({ ...formExcepcionVacio("usuarios"), valor: "10", motivo: "  " })).toBe(false);
        expect(excepcionValida({ ...formExcepcionVacio("usuarios"), valor: "10", motivo: "Piloto" })).toBe(true);
    });

    test("ilimitado no necesita valor", () => {
        expect(excepcionValida({ ...formExcepcionVacio("usuarios"), ilimitado: true, motivo: "VIP" })).toBe(true);
        expect(cuerpoExcepcion({ ...formExcepcionVacio("usuarios"), ilimitado: true, motivo: " VIP " }))
            .toEqual({ valor: null, motivo: "VIP", hasta: null });
    });

    test("el valor debe ser un entero no negativo", () => {
        const base = { ...formExcepcionVacio("usuarios"), motivo: "x" };
        expect(excepcionValida({ ...base, valor: "-1" })).toBe(false);
        expect(excepcionValida({ ...base, valor: "1.5" })).toBe(false);
        expect(excepcionValida({ ...base, valor: "" })).toBe(false);
        expect(excepcionValida({ ...base, valor: "0" })).toBe(true);
    });

    test("ida y vuelta con caducidad", () => {
        const e = { id: "usuarios", limiteId: "usuarios", valor: 12, motivo: "Piloto", hasta: "2027-01-01" };
        expect(cuerpoExcepcion(formDeExcepcion(e))).toEqual({ valor: 12, motivo: "Piloto", hasta: "2027-01-01" });
        expect(formDeExcepcion({ ...e, valor: null }).ilimitado).toBe(true);
    });
});

describe("datosSuscripcionDesdeApi", () => {
    test("sin suscripción solo hay nulos y listas vacías", () => {
        const d = datosSuscripcionDesdeApi({
            suscripcion: null, plan: null, cuota: null, cuota_programada: null, derechos: null,
        });
        expect(d.suscripcion).toBeNull();
        expect(d.facturas).toEqual([]);
        expect(d.excepciones).toEqual([]);
    });

    test("mapea cuota, derechos y excepciones", () => {
        const d = datosSuscripcionDesdeApi({
            suscripcion: {
                id: "s", plan_id: "negocio", periodicidad: "mensual", estado: "activa", inicio_periodo: "2026-11-11",
                fin_periodo: "2026-12-11", fin_prueba: null, impagada_desde: null,
                cambio_programado: { plan_id: "esencial", periodicidad: "mensual", modulos: [], extras: {} },
                cancelar_al_fin: true, pasarela_id: null, tiene_metodo_pago: false, descuento_pct: "0.00",
                precio_fijado_hasta: null, notas: "n", modulos: ["tpv"], extras: { usuario: 1 },
            },
            plan: null,
            cuota: { periodicidad: "mensual", base: "77.00", descuento: "0.00", total: "77.00",
                lineas: [{ tipo: "plan", ref_id: "negocio", concepto: "Plan Negocio", cantidad: 1, precio_unitario: "49.00", importe: "49.00" }] },
            cuota_programada: null,
            derechos: {
                modulos: [{ id: "tpv", nombre: "TPV", origen: "extra" }],
                limites: [{ id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", valor: null, uso: 1 }],
                opciones: { mcp_modo: "lectura" }, solo_lectura: false,
            },
            excepciones: [{ limite_id: "usuarios", valor: 9, motivo: "m", hasta: null }],
        });
        expect(d.suscripcion?.cancelarAlFin).toBe(true);
        expect(d.suscripcion?.cambioProgramado?.planId).toBe("esencial");
        expect(d.cuota?.lineas[0].precioUnitario).toBe("49.00");
        expect(d.derechos?.modulos[0].origen).toBe("extra");
        expect(d.derechos?.limites[0].valor).toBeNull();
        expect(d.derechos?.mcpModo).toBe("lectura");
        expect(d.excepciones[0]).toMatchObject({ limiteId: "usuarios", valor: 9, motivo: "m" });
    });
});

test("textoIvaAplicado", () => {
    expect(textoIvaAplicado("21.00")).toBe("21 %");
    expect(textoIvaAplicado("0.00")).toBe("0 %");
    expect(textoIvaAplicado(null)).toBe("");
});
