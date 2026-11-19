import { ExtraCatalogo, LimiteCatalogo, ModuloCatalogo } from "../diseño.ts";
import {
    claveAporta, textoGrupoIva, extraAForm, formAExtra, formALimite, formAModulo, limiteAForm, metaExtra, metaLimite, moduloAForm, modulosDeCategoria,
} from "../dominio.ts";

const limites: LimiteCatalogo[] = [
    { id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", alSuperar: "bloquear", umbralAviso: 80, orden: 10 },
    { id: "puntos_tpv", nombre: "Puntos TPV", unidad: "puntos", tipo: "recuento", alSuperar: "bloquear", umbralAviso: 80, orden: 20 },
];

const tpv: ModuloCatalogo = {
    id: "tpv", nombre: "TPV", descripcion: "Punto de venta", dependeDe: ["ventas"],
    precio: { mensual: "20.00", anual: "200.00" }, contratableSuelto: true, publico: true,
    aporta: { puntos_tpv: 1 }, orden: 70,
    categoria: "contexto", plugin: null, variante: null, variantes: [],
};

const centroCoste: ModuloCatalogo = {
    ...tpv, id: "centro_coste", nombre: "Centros de coste", dependeDe: [], aporta: {},
    precio: { mensual: "0.00", anual: "0.00" }, publico: false,
    categoria: "plugin", plugin: "centro_coste", variante: "activo", variantes: ["activo", "inactivo"],
};

describe("módulo", () => {
    test("moduloAForm lleva una entrada por límite del catálogo", () => {
        const form = moduloAForm(tpv, limites);
        expect(form[claveAporta("puntos_tpv")]).toBe("1");
        expect(form[claveAporta("usuarios")]).toBe("");
    });

    test("formAModulo solo envía los límites con aportación mayor que cero", () => {
        const form = { ...moduloAForm(tpv, limites), precioMensual: "25,5", [claveAporta("usuarios")]: "0", [claveAporta("puntos_tpv")]: "2" };
        const m = formAModulo(tpv, form, limites);
        expect(m.aporta).toEqual({ puntos_tpv: 2 });
        expect(m.precio).toEqual({ mensual: "25.50", anual: "200.00" });
        expect(m.dependeDe).toEqual(["ventas"]);
    });
});

describe("límite", () => {
    test("ida y vuelta", () => {
        expect(formALimite(limiteAForm(limites[0]))).toEqual(limites[0]);
    });

    test("el id solo se valida en el alta y no puede repetirse", () => {
        const meta = metaLimite(true, ["usuarios"]);
        const form = limiteAForm(limites[0]);
        expect(meta.campos?.id.validacion?.({ ...form, id: "usuarios" })).toBe("Ya existe un límite con ese identificador");
        expect(meta.campos?.id.validacion?.({ ...form, id: "Nuevo" })).toEqual(expect.any(String));
        expect(meta.campos?.id.validacion?.({ ...form, id: "nuevo" })).toBe(true);
        expect(metaLimite(false, ["usuarios"]).campos?.id.validacion?.({ ...form, id: "usuarios" })).toBe(true);
    });

    test("el umbral de aviso va de 1 a 100", () => {
        const meta = metaLimite(false, []);
        const form = limiteAForm(limites[0]);
        expect(meta.campos?.umbralAviso.validacion?.({ ...form, umbralAviso: "0" })).toBe("Entre 1 y 100");
        expect(meta.campos?.umbralAviso.validacion?.({ ...form, umbralAviso: "101" })).toBe("Entre 1 y 100");
        expect(meta.campos?.umbralAviso.validacion?.({ ...form, umbralAviso: "100" })).toBe(true);
    });
});

describe("extra", () => {
    const extra: ExtraCatalogo = {
        id: "punto_tpv", nombre: "Punto TPV", descripcion: "Una caja más", limiteId: "puntos_tpv", cantidad: 1,
        requiereModulo: "tpv", precio: { mensual: "12.00", anual: "120.00" }, recurrente: true, publico: true,
        activo: true, orden: 20,
    };

    test("ida y vuelta", () => {
        expect(formAExtra(extraAForm(extra))).toEqual(extra);
    });

    test("sin límite que ampliar no lleva cantidad ni módulo requerido", () => {
        const form = { ...extraAForm(extra), limiteId: "", requiereModulo: "", cantidad: "5" };
        const e = formAExtra(form);
        expect(e.limiteId).toBeNull();
        expect(e.cantidad).toBe(0);
        expect(e.requiereModulo).toBeNull();
    });

    test("la cantidad solo se exige si amplía un límite", () => {
        const meta = metaExtra(false, []);
        const form = extraAForm(extra);
        expect(meta.campos?.cantidad.validacion?.({ ...form, cantidad: "0" })).toBe("Entero mayor que 0");
        expect(meta.campos?.cantidad.validacion?.({ ...form, limiteId: "", cantidad: "0" })).toBe(true);
    });
});

test("textoGrupoIva muestra la descripción y el porcentaje sin ceros sobrantes", () => {
    expect(textoGrupoIva({ id: "GEN", descripcion: "General", iva: "21.00" })).toBe("General (21 %)");
    expect(textoGrupoIva({ id: "RED", descripcion: "Reducido", iva: "10.50" })).toBe("Reducido (10.5 %)");
});

describe("plugins", () => {
    test("se reparten por categoría", () => {
        expect(modulosDeCategoria([tpv, centroCoste], "plugin").map((m) => m.id)).toEqual(["centro_coste"]);
        expect(modulosDeCategoria([tpv, centroCoste], "contexto").map((m) => m.id)).toEqual(["tpv"]);
    });

    test("la variante viaja solo en los plugins", () => {
        const form = { ...moduloAForm(centroCoste, limites), variante: "inactivo" };
        expect(formAModulo(centroCoste, form, limites).variante).toBe("inactivo");
        const formTpv = { ...moduloAForm(tpv, limites), variante: "activo" };
        expect(formAModulo(tpv, formTpv, limites).variante).toBeNull();
    });
});
