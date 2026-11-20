import { catalogoDesdeApi, miSuscripcionDesdeApi, objetivoAApi, presupuestoDesdeApi } from "../infraestructura.ts";

describe("mappers de la API", () => {
    test("objetivoAApi en snake_case y sin cantidades a cero", () => {
        expect(objetivoAApi({ planId: "pro", periodicidad: "anual", modulos: ["tpv"], extras: { usuario: 2, x: 0 } }))
            .toEqual({ plan_id: "pro", periodicidad: "anual", modulos: ["tpv"], extras: { usuario: 2 } });
    });

    test("presupuesto con excesos", () => {
        const p = presupuestoDesdeApi({
            objetivo: { plan_id: "esencial", periodicidad: "mensual", modulos: [], extras: {} },
            cuota_actual: null,
            cuota_nueva: { periodicidad: "mensual", base: "15.00", descuento: "0.00", total: "15.00", lineas: [] },
            efecto: "fin_periodo", fecha_efecto: "2026-12-11", prorrateo: "0.00", aplicable: false, avisos: [],
            excesos: [{ limite_id: "usuarios", nombre: "Usuarios", uso: 3, limite: 1 }],
        });
        expect(p.objetivo.planId).toBe("esencial");
        expect(p.excesos).toEqual([{ limiteId: "usuarios", nombre: "Usuarios", uso: 3, limite: 1 }]);
        expect(p.cuotaActual).toBeNull();
    });

    test("catálogo y mi suscripción", () => {
        const plan = {
            id: "negocio", nombre: "Negocio", descripcion: "", precio: { mensual: "49.00", anual: "490.00" },
            dias_prueba: 0, destacado: false, orden: 20,
            modulos: [{ modulo_id: "tpv", modo: "extra" as const, precio: null, opciones: {} }],
            limites: [{ limite_id: "usuarios", valor: null, ampliable: true }],
        };
        const c = catalogoDesdeApi({
            limites: [{ id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", orden: 1 }],
            modulos: [{ id: "tpv", nombre: "TPV", descripcion: "", depende_de: ["ventas"], precio: { mensual: "20.00", anual: "200.00" }, contratable_suelto: true, orden: 1 }],
            planes: [plan], extras: [],
        });
        expect(c.modulos[0].dependeDe).toEqual(["ventas"]);
        expect(c.planes[0].modulos[0].moduloId).toBe("tpv");
        expect(c.planes[0].limites[0].valor).toBeNull();

        const mi = miSuscripcionDesdeApi({
            suscripcion: {
                id: "s", plan_id: "negocio", periodicidad: "mensual", estado: "activa", inicio_periodo: "2026-11-11",
                fin_periodo: "2026-12-11", fin_prueba: null, impagada_desde: null, cambio_programado: null,
                cancelar_al_fin: false, tiene_metodo_pago: false, descuento_pct: "0.00", modulos: ["tpv"], extras: { usuario: 1 },
            },
            plan, cuota: null, cuota_programada: null,
            derechos: { modulos: [], limites: [], solo_lectura: false },
            facturas: [{ id: "f", periodo_desde: "2026-11-11", periodo_hasta: "2026-12-11", concepto: "Cuota", base: "10.00", iva: "2.10", total: "12.10", estado: "pagada", factura_olula: "F-1", url_pdf: null }],
            mandato_sepa: { referencia: "R1", titular: "Ana", iban: "…1332", fecha_firma: "2026-11-11" },
        });
        expect(mi.suscripcion?.tieneMetodoPago).toBe(false);
        expect(mi.facturas[0].numeroFactura).toBe("F-1");
        expect(mi.mandatoSepa?.fechaFirma).toBe("2026-11-11");
    });
});
