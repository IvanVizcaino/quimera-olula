import { describe, expect, test, vi } from "vitest";
import { crearLectorFrases, separarFrases } from "./lector_frases.ts";

describe("[voz-lector-01] separarFrases", () => {
    test("separa las frases completas y deja la que va a medias", () => {
        expect(separarFrases("Tienes 12 pedidos pendientes. El mayor es de Acme por 1.500 euros. Y luego"))
            .toEqual({
                frases: ["Tienes 12 pedidos pendientes.", "El mayor es de Acme por 1.500 euros."],
                resto: "Y luego",
            });
    });

    test("no corta en números con punto ni sin espacio tras la puntuación", () => {
        expect(separarFrases("El total es 3.5 millones")).toEqual({ frases: [], resto: "El total es 3.5 millones" });
    });

    test("junta frases cortas con la siguiente", () => {
        expect(separarFrases("Vale. Tienes tres pedidos pendientes. ")).toEqual({
            frases: ["Vale. Tienes tres pedidos pendientes."], resto: "",
        });
        expect(separarFrases("Vale. Ahora")).toEqual({ frases: [], resto: "Vale. Ahora" });
    });

    test("corta también en saltos de línea, signos de interrogación y comillas de cierre", () => {
        expect(separarFrases("¿Quieres que lo cree ahora mismo?\nDime «sí, adelante» y lo hago. ").frases)
            .toEqual(["¿Quieres que lo cree ahora mismo?", "Dime «sí, adelante» y lo hago."]);
    });

    test("acumulando trozos se obtiene lo mismo que con el texto entero", () => {
        const texto = "Primera frase bastante larga. Segunda frase también larga. Final";
        let buffer = "";
        const frases: string[] = [];
        for (const trozo of texto.match(/.{1,7}/gs) ?? []) {
            buffer += trozo;
            const r = separarFrases(buffer);
            frases.push(...r.frases);
            buffer = r.resto;
        }
        expect(frases).toEqual(["Primera frase bastante larga.", "Segunda frase también larga."]);
        expect(buffer).toBe("Final");
    });
});

describe("[voz-lector-02] crearLectorFrases", () => {
    test("lee las frases en orden, de una en una, y avisa al empezar", async () => {
        const leidas: string[] = [];
        let terminarActual = () => {};
        const hablar = vi.fn((frase: string) => new Promise<void>(r => {
            leidas.push(frase);
            terminarActual = r;
        }));
        const onEmpieza = vi.fn();
        const lector = crearLectorFrases(hablar, onEmpieza);

        lector.añadir("Uno.");
        lector.añadir("Dos.");
        expect(onEmpieza).toHaveBeenCalledTimes(1);
        expect(leidas).toEqual(["Uno."]);

        terminarActual();
        await vi.waitFor(() => expect(leidas).toEqual(["Uno.", "Dos."]));
        terminarActual();
        await lector.terminar();
        expect(lector.texto()).toBe("Uno. Dos.");
    });

    test("cancelar descarta lo pendiente", async () => {
        let terminarActual = () => {};
        const hablar = vi.fn(() => new Promise<void>(r => { terminarActual = r; }));
        const lector = crearLectorFrases(hablar);
        lector.añadir("Uno.");
        lector.añadir("Dos.");
        lector.cancelar();
        lector.añadir("Tres.");
        terminarActual();
        await lector.terminar();
        expect(hablar).toHaveBeenCalledTimes(1);
    });

    test("si el TTS falla sigue con la cola", async () => {
        const hablar = vi.fn().mockRejectedValueOnce(new Error("not-allowed")).mockResolvedValue(undefined);
        const lector = crearLectorFrases(hablar);
        lector.añadir("Uno.");
        lector.añadir("Dos.");
        await lector.terminar();
        expect(hablar).toHaveBeenCalledTimes(2);
    });

    test("ignora frases vacías", async () => {
        const hablar = vi.fn(async () => undefined);
        const lector = crearLectorFrases(hablar);
        lector.añadir("   ");
        await lector.terminar();
        expect(hablar).not.toHaveBeenCalled();
    });
});
