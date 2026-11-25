import { Catalogo, MiSuscripcion, ModuloCatalogo, PlanCatalogo } from "../diseño.ts";
import {
    fichaModuloEmpresa, fichasModulos, fichasRecomendadas, filtrarFichas, objetivoParaModulo, recuentoFichas,
    textoPrecioFicha,
} from "../dominio.ts";

const precio = (m: string, a: string) => ({ mensual: m, anual: a });

const modulo = (id: string, extra: Partial<ModuloCatalogo> = {}): ModuloCatalogo => ({
    id, nombre: id.charAt(0).toUpperCase() + id.slice(1), descripcion: "", dependeDe: [], precio: precio("10.00", "100.00"),
    contratableSuelto: true, orden: 0, categoria: "contexto", descripcionLarga: "", caracteristicas: [], palabrasClave: [],
    ...extra,
});

const pm = (moduloId: string, modo: "incluido" | "extra", p: { mensual: string; anual: string } | null = null) =>
    ({ moduloId, modo, precio: p, opciones: {} });

const plan = (id: string, mensual: string, modulos: PlanCatalogo["modulos"]): PlanCatalogo => ({
    id, nombre: id.charAt(0).toUpperCase() + id.slice(1), descripcion: "", precio: precio(mensual, "0.00"),
    diasPrueba: 0, destacado: false, orden: 0, modulos, limites: [],
});

const esencial = plan("esencial", "15.00", [pm("ventas", "incluido"), pm("almacen", "extra"), pm("tpv", "extra", precio("25.00", "250.00"))]);
const pro = plan("pro", "99.00", [pm("ventas", "incluido"), pm("almacen", "incluido"), pm("ia", "incluido"), pm("crm", "extra")]);
const empresa = plan("empresa", "199.00", [pm("ventas", "incluido"), pm("crm", "incluido")]);

const catalogo: Catalogo = {
    limites: [],
    modulos: [
        modulo("ventas", { orden: 10 }),
        modulo("almacen", { orden: 20, descripcion: "Stock e inventario", palabrasClave: ["existencias"] }),
        modulo("tpv", { orden: 30, dependeDe: ["ventas", "almacen"], descripcionLarga: "Vende en tu tienda física" }),
        modulo("ia", { orden: 40, nombre: "Asistente IA" }),
        modulo("crm", { orden: 50 }),
        modulo("nadie", { orden: 60 }),
    ],
    planes: [esencial, pro, empresa],
    extras: [],
};

const mi = (modulos: string[] = []): MiSuscripcion => ({
    suscripcion: {
        id: "s", planId: "esencial", periodicidad: "mensual", estado: "activa", inicioPeriodo: "2026-11-01",
        finPeriodo: "2026-12-01", finPrueba: null, impagadaDesde: null, cambioProgramado: null,
        cancelarAlFin: false, tieneMetodoPago: true, descuentoPct: "0.00", modulos, extras: {},
    },
    plan: esencial,
    cuota: null,
    cuotaProgramada: null,
    derechos: {
        modulos: [{ id: "ventas", nombre: "Ventas", origen: "plan" }, ...modulos.map((id) => ({ id, nombre: id, origen: "extra" }))],
        limites: [],
        soloLectura: false,
    },
    facturas: [],
    mandatoSepa: null,
});

const ficha = (id: string, m = mi()) => fichaModuloEmpresa(m, catalogo, catalogo.modulos.find((x) => x.id === id)!);

describe("situación de cada módulo para la empresa", () => {
    test("activo por el plan o como extra", () => {
        expect(ficha("ventas")).toMatchObject({ estado: "activo", origen: "plan" });
        expect(ficha("almacen", mi(["almacen"]))).toMatchObject({ estado: "activo", origen: "extra" });
    });

    test("disponible como extra del plan, con el precio del plan si lo tiene", () => {
        expect(ficha("almacen")).toMatchObject({ estado: "disponible", precio: precio("10.00", "100.00"), faltan: [] });
        expect(ficha("tpv").precio).toEqual(precio("25.00", "250.00"));
    });

    test("en otro plan: el más barato que lo ofrece", () => {
        const crm = ficha("crm");
        expect(crm.estado).toBe("otro_plan");
        expect(crm.planAlternativo?.id).toBe("pro");
        expect(crm.precio).toEqual(precio("10.00", "100.00"));
        expect(ficha("ia")).toMatchObject({ estado: "otro_plan", precio: null });
    });

    test("no disponible si ningún plan lo ofrece", () => {
        expect(ficha("nadie").estado).toBe("no_disponible");
    });

    test("recuento por estado", () => {
        expect(recuentoFichas(fichasModulos(mi(), catalogo))).toEqual({
            todos: 6, activo: 1, disponible: 2, otro_plan: 2, no_disponible: 1,
        });
    });

    test("textos de precio", () => {
        expect(textoPrecioFicha(ficha("ventas"), "mensual")).toBe("Incluido en tu plan");
        expect(textoPrecioFicha(ficha("tpv"), "mensual")).toMatch(/^\+25,00\s€\/mes$/);
        expect(textoPrecioFicha(ficha("ia"), "mensual")).toBe("Incluido en el plan Pro");
        expect(textoPrecioFicha(ficha("crm"), "mensual")).toMatch(/^Con el plan Pro \(\+10,00\s€\/mes\)$/);
    });
});

describe("lo que hay que contratar para tener un módulo", () => {
    test("un extra del plan, con las dependencias que también son extra", () => {
        expect(objetivoParaModulo(mi(), catalogo, ficha("tpv"))).toEqual({
            planId: "esencial", periodicidad: "mensual", modulos: ["almacen", "tpv"], extras: {},
        });
        expect(objetivoParaModulo(mi(["almacen"]), catalogo, ficha("tpv", mi(["almacen"])))?.modulos).toEqual(["almacen", "tpv"]);
    });

    test("en otro plan: el cambio de plan y el módulo si allí es extra", () => {
        expect(objetivoParaModulo(mi(), catalogo, ficha("crm"))).toMatchObject({ planId: "pro", modulos: ["crm"] });
        expect(objetivoParaModulo(mi(), catalogo, ficha("ia"))).toMatchObject({ planId: "pro", modulos: [] });
    });

    test("nada si ya lo tiene o no se ofrece", () => {
        expect(objetivoParaModulo(mi(), catalogo, ficha("ventas"))).toBeNull();
        expect(objetivoParaModulo(mi(), catalogo, ficha("nadie"))).toBeNull();
    });

    test("faltan dependencias que el plan no deja añadir", () => {
        const sinAlmacen = { ...esencial, modulos: [pm("ventas", "incluido"), pm("tpv", "extra")] };
        const m = { ...mi(), plan: sinAlmacen };
        const f = fichaModuloEmpresa(m, catalogo, catalogo.modulos[2]);
        expect(f.faltan).toEqual(["Almacen"]);
        expect(objetivoParaModulo(m, catalogo, f)).toBeNull();
    });
});

describe("buscador", () => {
    const fichas = fichasModulos(mi(), catalogo);
    const ids = (texto: string, filtro: Parameters<typeof filtrarFichas>[2] = "todos") =>
        filtrarFichas(fichas, texto, filtro).map((f) => f.modulo.id);

    test("busca en nombre, descripciones y palabras clave, sin tildes", () => {
        expect(ids("EXISTENCIAS")).toEqual(["almacen"]);
        expect(ids("tienda física")).toEqual(["tpv"]);
        expect(ids("tienda fisica")).toEqual(["tpv"]);
        expect(ids("asistente")).toEqual(["ia"]);
    });

    test("todas las palabras tienen que aparecer", () => {
        expect(ids("stock tienda")).toEqual([]);
    });

    test("filtra por estado", () => {
        expect(ids("", "disponible")).toEqual(["almacen", "tpv"]);
    });

    test("recomendaciones resueltas a fichas, descartando las desconocidas", () => {
        const r = fichasRecomendadas(fichas, [{ moduloId: "tpv", motivo: "Para tu tienda" }, { moduloId: "x", motivo: "" }]);
        expect(r.map((x) => [x.ficha.modulo.id, x.motivo])).toEqual([["tpv", "Para tu tienda"]]);
    });
});
