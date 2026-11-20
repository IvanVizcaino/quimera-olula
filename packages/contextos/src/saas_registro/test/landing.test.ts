import { Catalogo } from "../../saas_suscripcion/diseño.ts";
import {
    construirTarjetasPlanes, destinoSinSesion, diasPruebaDestacado, primerPlanConMcp, RUTA_LANDING,
    textoAhorro, textoCtaPrueba,
} from "../landing/dominio.ts";

const p = (m: string, a: string) => ({ mensual: m, anual: a });

const catalogo: Catalogo = {
    limites: [
        { id: "usuarios", nombre: "Usuarios", unidad: "usuarios", tipo: "recuento", orden: 10 },
        { id: "consultas_ia", nombre: "Consultas", unidad: "consultas", tipo: "consumo_mensual", orden: 40 },
        { id: "llamadas_mcp", nombre: "Llamadas", unidad: "llamadas", tipo: "consumo_mensual", orden: 50 },
    ],
    modulos: [
        { id: "ventas", nombre: "Ventas", descripcion: "", dependeDe: [], precio: p("0", "0"), contratableSuelto: false, orden: 10 },
        { id: "tpv", nombre: "TPV", descripcion: "", dependeDe: [], precio: p("0", "0"), contratableSuelto: true, orden: 70 },
    ],
    planes: [
        {
            id: "pro", nombre: "Pro", descripcion: "", precio: p("99.00", "990.00"), diasPrueba: 30, destacado: true, orden: 20,
            modulos: [
                { moduloId: "tpv", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "ventas", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "mcp", modo: "incluido", precio: null, opciones: {} },
            ],
            limites: [
                { limiteId: "usuarios", valor: 5, ampliable: true },
                { limiteId: "consultas_ia", valor: 1000, ampliable: true },
                { limiteId: "llamadas_mcp", valor: null, ampliable: false },
            ],
        },
        {
            id: "basico", nombre: "Básico", descripcion: "", precio: p("49.00", "588.00"), diasPrueba: 14, destacado: false, orden: 10,
            modulos: [
                { moduloId: "ventas", modo: "incluido", precio: null, opciones: {} },
                { moduloId: "mcp", modo: "extra", precio: null, opciones: {} },
            ],
            limites: [
                { limiteId: "usuarios", valor: 2, ampliable: true },
                { limiteId: "consultas_ia", valor: 0, ampliable: false },
                { limiteId: "llamadas_mcp", valor: 2000, ampliable: false },
            ],
        },
    ],
    extras: [],
};

describe("tarjetas de planes", () => {
    test("ordena y resume límites y módulos", () => {
        const t = construirTarjetasPlanes(catalogo, "mensual");
        expect(t.map((x) => x.id)).toEqual(["basico", "pro"]);
        expect(t[1].usuarios).toBe("5 usuarios incluidos");
        expect(t[1].consultasIa).toBe("1.000 consultas al asistente al mes");
        expect(t[1].modulos).toEqual(["Ventas", "TPV"]);
        expect(t[0].consultasIa).toBeNull();
        expect(t[1].destacado).toBe(true);
    });

    test("el ahorro solo aparece en anual y si compensa", () => {
        const t = construirTarjetasPlanes(catalogo, "anual");
        expect(t[1].ahorro).toContain("198");
        expect(t[0].ahorro).toBeNull();
        expect(construirTarjetasPlanes(catalogo, "mensual")[1].ahorro).toBeNull();
        expect(textoAhorro(catalogo.planes[0], "anual")).toContain("Ahorras");
    });
});

describe("datos del catálogo", () => {
    test("días de prueba del destacado", () => {
        expect(diasPruebaDestacado(catalogo)).toBe(30);
        expect(diasPruebaDestacado(null)).toBe(0);
        expect(textoCtaPrueba(30)).toBe("Prueba 30 días gratis");
        expect(textoCtaPrueba(0)).toBe("Crea tu empresa");
    });

    test("primer plan con MCP", () => {
        expect(primerPlanConMcp(catalogo)).toBe("Pro");
        expect(primerPlanConMcp(null)).toBeNull();
    });
});

describe("destino sin sesión", () => {
    test("la raíz va a la landing y el resto al login", () => {
        expect(destinoSinSesion("/", "/login")).toBe(RUTA_LANDING);
        expect(destinoSinSesion("/ventas", "/login")).toBe("/login");
        expect(destinoSinSesion("/", "/otro")).toBe("/otro");
    });
});
