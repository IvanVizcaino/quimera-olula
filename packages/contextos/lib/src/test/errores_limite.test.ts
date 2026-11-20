import {
    accionErrorLimite, analizarErrorLimite, configurarAccionErrorLimite, tituloErrorLimite,
} from "../errores_limite.ts";

describe("analizarErrorLimite", () => {
    test("409 con prefijo de límite", () => {
        expect(analizarErrorLimite("[limite:usuarios] Has llegado al máximo de usuarios de tu plan (4)."))
            .toEqual({ tipo: "limite", id: "usuarios", mensaje: "Has llegado al máximo de usuarios de tu plan (4)." });
    });

    test("402 solo lectura, sin id", () => {
        expect(analizarErrorLimite("[solo_lectura] Tu empresa está en solo lectura."))
            .toEqual({ tipo: "solo_lectura", id: undefined, mensaje: "Tu empresa está en solo lectura." });
    });

    test("403 de módulo", () => {
        const e = analizarErrorLimite("[modulo:mcp] El acceso por API no está en tu plan");
        expect(e?.tipo).toBe("modulo");
        expect(e?.id).toBe("mcp");
    });

    test("403 de módulo no contratado, sin prefijo, quita la regla", () => {
        expect(analizarErrorLimite("El módulo TPV no está contratado (regla tpv.venta.leer)"))
            .toEqual({ tipo: "modulo_no_contratado", mensaje: "El módulo TPV no está contratado." });
    });

    test("un error cualquiera no se reconoce", () => {
        expect(analizarErrorLimite("Error al guardar")).toBeNull();
        expect(analizarErrorLimite("[otra:cosa] x")).toBeNull();
        expect(analizarErrorLimite(undefined)).toBeNull();
        expect(analizarErrorLimite("")).toBeNull();
    });
});

describe("acciones", () => {
    afterEach(() => configurarAccionErrorLimite(null));

    test("sin resolutor no hay acción", () => {
        expect(accionErrorLimite({ tipo: "limite", mensaje: "x" })).toBeNull();
    });

    test("con resolutor se devuelve su acción", () => {
        configurarAccionErrorLimite(() => ({ texto: "Ver mi suscripción", url: "/ajustes/suscripcion" }));
        expect(accionErrorLimite({ tipo: "limite", mensaje: "x" })?.url).toBe("/ajustes/suscripcion");
    });

    test("títulos", () => {
        expect(tituloErrorLimite({ tipo: "limite", mensaje: "" })).toMatch(/límite/);
        expect(tituloErrorLimite({ tipo: "solo_lectura", mensaje: "" })).toMatch(/solo lectura/);
    });
});
