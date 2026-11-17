import { describe, expect, test } from "vitest";
import { comandoClaudeMcp, metaNuevaApiKey, nuevaApiKeyVacia, urlMcp } from "../dominio.ts";
import { apiKeyDesdeApi } from "../infraestructura.ts";
import { modeloEsValido } from "@olula/lib/dominio.js";

describe("urlMcp", () => {
    test("cuelga /mcp de la URL de la API", () => {
        expect(urlMcp("https://api.olula.es", "https://app.olula.es")).toBe("https://api.olula.es/mcp");
    });

    test("no duplica la barra final", () => {
        expect(urlMcp("https://api.olula.es/", "https://app.olula.es")).toBe("https://api.olula.es/mcp");
    });

    test("una URL relativa se completa con el origen de la página", () => {
        expect(urlMcp("/api", "https://app.olula.es")).toBe("https://app.olula.es/api/mcp");
    });
});

describe("comandoClaudeMcp", () => {
    test("da de alta olula por HTTP con la clave en la cabecera X-Api-Key", () => {
        expect(comandoClaudeMcp("https://api.olula.es/mcp", "abc.def.ghi")).toBe(
            'claude mcp add --transport http olula https://api.olula.es/mcp --header "Authorization: X-Api-Key abc.def.ghi"'
        );
    });
});

describe("apiKeyDesdeApi", () => {
    test("pasa el id a texto y las fechas a Date", () => {
        const clave = apiKeyDesdeApi({
            id: 7, nombre: "portátil", creada: "2026-11-01", caduca: "2026-12-01", caducada: false,
        });
        expect(clave.id).toBe("7");
        expect(clave.creada?.toISOString().slice(0, 10)).toBe("2026-11-01");
        expect(clave.caduca.toISOString().slice(0, 10)).toBe("2026-12-01");
    });

    test("una clave antigua sin fecha de creación queda con creada null", () => {
        const clave = apiKeyDesdeApi({
            id: 1, nombre: "vieja", creada: null, caduca: "2026-12-01", caducada: true,
        });
        expect(clave.creada).toBeNull();
        expect(clave.caducada).toBe(true);
    });
});

describe("metaNuevaApiKey", () => {
    test("el nombre es obligatorio", () => {
        expect(modeloEsValido(metaNuevaApiKey)(nuevaApiKeyVacia)).toBe(false);
        expect(modeloEsValido(metaNuevaApiKey)({ ...nuevaApiKeyVacia, nombre: "  " })).toBe(false);
        expect(modeloEsValido(metaNuevaApiKey)({ ...nuevaApiKeyVacia, nombre: "portátil" })).toBe(true);
    });
});
