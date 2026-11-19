import { ModuloCatalogo } from "../../catalogo/diseño.ts";
import { Plan } from "../diseño.ts";
import {
    cambiarLimite, cambiarModoMcp, cambiarModoModulo, cambiarPrecioExtra, completarPlan, duplicarPlan,
    planModificado, planNuevo, planParaGuardar, problemasPlan, sustituirPlan, valorLimiteDesdeTexto,
} from "../dominio.ts";
import { planAApi, planDesdeApi } from "../infraestructura.ts";

const modulo = (id: string, contratableSuelto = true): ModuloCatalogo => ({
    id, nombre: id, descripcion: "", dependeDe: [], precio: { mensual: "5.00", anual: "50.00" },
    contratableSuelto, publico: true, aporta: {}, orden: 0,
    categoria: "contexto", plugin: null, variante: null, variantes: [],
});

const catalogo = {
    modulos: [modulo("ventas", false), modulo("compras"), modulo("mcp")],
    limites: [
        { id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento" as const, alSuperar: "bloquear" as const, umbralAviso: 80, orden: 1 },
    ],
};

describe("planNuevo / completarPlan", () => {
    test("parte de un plan vacío con una fila por módulo y límite del catálogo", () => {
        const plan = planNuevo("basico", "  Básico ", catalogo);
        expect(plan.id).toBe("basico");
        expect(plan.nombre).toBe("Básico");
        expect(plan.activo).toBe(true);
        expect(plan.publico).toBe(false);
        expect(plan.modulos.map((m) => m.moduloId)).toEqual(["ventas", "compras", "mcp"]);
        expect(plan.modulos.every((m) => m.modo === "no_disponible")).toBe(true);
        expect(plan.limites).toEqual([{ limiteId: "usuarios", valor: 0, ampliable: false }]);
    });

    test("completa lo que falta y descarta lo que ya no existe en el catálogo", () => {
        const base = planNuevo("p", "P", catalogo);
        const conSobrante: Plan = {
            ...base,
            modulos: [{ moduloId: "viejo", modo: "incluido", precio: null, opciones: {} }, { ...base.modulos[0], modo: "incluido" }],
            limites: [],
        };
        const completo = completarPlan(conSobrante, catalogo);
        expect(completo.modulos.map((m) => m.moduloId)).toEqual(["ventas", "compras", "mcp"]);
        expect(completo.modulos[0].modo).toBe("incluido");
        expect(completo.limites).toHaveLength(1);
    });
});

describe("cambiarModoModulo", () => {
    const plan = planNuevo("p", "P", catalogo);

    test("un módulo no contratable suelto no puede ser extra", () => {
        const cambiado = cambiarModoModulo(plan, "ventas", "extra", catalogo.modulos);
        expect(cambiado).toBe(plan);
    });

    test("un módulo contratable suelto sí puede ser extra", () => {
        const cambiado = cambiarModoModulo(plan, "compras", "extra", catalogo.modulos);
        expect(cambiado.modulos.find((m) => m.moduloId === "compras")?.modo).toBe("extra");
    });

    test("al dejar de ser extra se pierde el precio especial", () => {
        let p = cambiarModoModulo(plan, "compras", "extra", catalogo.modulos);
        p = cambiarPrecioExtra(p, "compras", "mensual", "3.00");
        p = cambiarPrecioExtra(p, "compras", "anual", "30.00");
        p = cambiarModoModulo(p, "compras", "incluido", catalogo.modulos);
        expect(p.modulos.find((m) => m.moduloId === "compras")?.precio).toBeNull();
    });

    test("mcp parte en lectura y se puede pasar a escritura; sin mcp se limpia la opción", () => {
        let p = cambiarModoModulo(plan, "mcp", "incluido", catalogo.modulos);
        expect(p.modulos.find((m) => m.moduloId === "mcp")?.opciones).toEqual({ mcpModo: "lectura" });
        p = cambiarModoMcp(p, "escritura");
        expect(p.modulos.find((m) => m.moduloId === "mcp")?.opciones.mcpModo).toBe("escritura");
        p = cambiarModoModulo(p, "mcp", "no_disponible", catalogo.modulos);
        expect(p.modulos.find((m) => m.moduloId === "mcp")?.opciones).toEqual({});
    });
});

describe("precio especial del extra", () => {
    const base = cambiarModoModulo(planNuevo("p", "P", catalogo), "compras", "extra", catalogo.modulos);

    test("con los dos campos vacíos no hay precio especial", () => {
        let p = cambiarPrecioExtra(base, "compras", "mensual", "3");
        p = cambiarPrecioExtra(p, "compras", "mensual", "");
        expect(p.modulos.find((m) => m.moduloId === "compras")?.precio).toBeNull();
    });

    test("un precio a medias es un problema que impide guardar", () => {
        const p = cambiarPrecioExtra({ ...base, nombre: "P" }, "compras", "mensual", "3");
        expect(problemasPlan(p)).toContain("El precio especial de un extra necesita mensual y anual (o déjalos los dos vacíos)");
    });
});

describe("límites", () => {
    test("vacío = ilimitado (null) y se trunca a entero no negativo", () => {
        expect(valorLimiteDesdeTexto("")).toBeNull();
        expect(valorLimiteDesdeTexto("5.9")).toBe(5);
        expect(valorLimiteDesdeTexto("-3")).toBe(0);
    });

    test("cambiarLimite modifica solo el límite indicado", () => {
        const plan = planNuevo("p", "P", catalogo);
        const p = cambiarLimite(plan, "usuarios", { valor: null, ampliable: true });
        expect(p.limites[0]).toEqual({ limiteId: "usuarios", valor: null, ampliable: true });
    });
});

describe("problemasPlan / planParaGuardar", () => {
    test("nombre vacío e importes inválidos son problemas", () => {
        const plan = { ...planNuevo("p", "", catalogo), precio: { mensual: "x", anual: "10" } };
        const problemas = problemasPlan(plan);
        expect(problemas).toContain("El nombre es obligatorio");
        expect(problemas).toContain("Los precios mensual y anual deben ser importes válidos");
    });

    test("un plan correcto no tiene problemas", () => {
        expect(problemasPlan({ ...planNuevo("p", "P", catalogo), precio: { mensual: "10", anual: "100" } })).toEqual([]);
    });

    test("planParaGuardar normaliza los importes a dos decimales", () => {
        let plan = { ...planNuevo("p", " P ", catalogo), precio: { mensual: "49,5", anual: "490" } };
        plan = cambiarModoModulo(plan, "compras", "extra", catalogo.modulos);
        plan = cambiarPrecioExtra(plan, "compras", "mensual", "3");
        plan = cambiarPrecioExtra(plan, "compras", "anual", "30,5");
        const listo = planParaGuardar(plan);
        expect(listo.nombre).toBe("P");
        expect(listo.precio).toEqual({ mensual: "49.50", anual: "490.00" });
        expect(listo.modulos.find((m) => m.moduloId === "compras")?.precio).toEqual({ mensual: "3.00", anual: "30.50" });
    });
});

describe("duplicarPlan", () => {
    test("copia con id y nombre nuevos, sin publicar ni destacar y sin compartir referencias", () => {
        const origen: Plan = { ...planNuevo("a", "A", catalogo), publico: true, destacado: true, avisos: ["x"] };
        const copia = duplicarPlan(origen, "b", " B ");
        expect(copia.id).toBe("b");
        expect(copia.nombre).toBe("B");
        expect(copia.publico).toBe(false);
        expect(copia.destacado).toBe(false);
        expect(copia.avisos).toEqual([]);
        expect(copia.modulos).not.toBe(origen.modulos);
        expect(copia.modulos[0]).not.toBe(origen.modulos[0]);
        expect(origen.publico).toBe(true);
    });
});

describe("planModificado / sustituirPlan", () => {
    const plan = planNuevo("p", "P", catalogo);
    test("los avisos no cuentan como cambio", () => {
        expect(planModificado(plan, { ...plan, avisos: ["algo"] })).toBe(false);
        expect(planModificado(plan, { ...plan, nombre: "Q" })).toBe(true);
    });
    test("sustituir mantiene el orden por orden y nombre", () => {
        const a = { ...plan, id: "a", nombre: "A", orden: 20 };
        const b = { ...plan, id: "b", nombre: "B", orden: 10 };
        expect(sustituirPlan([a], b).map((p) => p.id)).toEqual(["b", "a"]);
        expect(sustituirPlan([a, b], { ...a, orden: 1 }).map((p) => p.id)).toEqual(["a", "b"]);
    });
});

describe("mapeo con la API", () => {
    const api = {
        id: "negocio", nombre: "Negocio", descripcion: "d",
        precio: { mensual: "49.00", anual: "490.00" }, dias_prueba: 14, publico: true, activo: true, destacado: false, orden: 20,
        modulos: [
            { modulo_id: "compras", modo: "extra" as const, precio: { mensual: "3.00", anual: "30.00" }, opciones: {} },
            { modulo_id: "mcp", modo: "incluido" as const, precio: null, opciones: { mcp_modo: "lectura" as const } },
        ],
        limites: [{ limite_id: "usuarios", valor: null, ampliable: true }],
        avisos: ["aviso"],
    };

    test("planDesdeApi pasa a camelCase", () => {
        const plan = planDesdeApi(api);
        expect(plan.diasPrueba).toBe(14);
        expect(plan.modulos[0].moduloId).toBe("compras");
        expect(plan.modulos[1].opciones.mcpModo).toBe("lectura");
        expect(plan.limites[0]).toEqual({ limiteId: "usuarios", valor: null, ampliable: true });
        expect(plan.avisos).toEqual(["aviso"]);
    });

    test("planAApi devuelve el plan completo en snake_case, sin id ni avisos", () => {
        const cuerpo = planAApi(planDesdeApi(api));
        expect(cuerpo).not.toHaveProperty("id");
        expect(cuerpo).not.toHaveProperty("avisos");
        const { id: _id, avisos: _avisos, ...resto } = api;
        expect(cuerpo).toEqual(resto);
    });
});
