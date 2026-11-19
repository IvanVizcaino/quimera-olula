import { configEmpresaValida, grupoIvaNegocioVisible } from "#/empresa/config/dominio.ts";
import { configEmpresaAApi, configEmpresaDesdeApi } from "#/empresa/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("configuración de empresa", () => {
    test("el grupo de IVA de negocio va y viene de la API", () => {
        const config = configEmpresaDesdeApi({ grupo_iva_negocio_id: "NACIONAL" });
        expect(config.grupoIvaNegocioId).toBe("NACIONAL");
        expect(configEmpresaAApi(config)).toEqual({ grupo_iva_negocio_id: "NACIONAL" });
        expect(config.noDisponibles).toEqual([]);
    });

    test("el grupo es obligatorio, como en el escritorio", () => {
        expect(configEmpresaValida({ grupoIvaNegocioId: "" })).toBe(false);
        expect(configEmpresaValida({ grupoIvaNegocioId: "EXENTO" })).toBe(true);
    });

    test("sin iva_nav o sin la columna, el grupo ni se ve ni es obligatorio", () => {
        const sinGrupo = { grupoIvaNegocioId: "" };
        expect(grupoIvaNegocioVisible(sinGrupo, "activo")).toBe(true);
        expect(grupoIvaNegocioVisible(sinGrupo, "inactivo")).toBe(false);
        expect(configEmpresaValida(sinGrupo, "inactivo")).toBe(true);
        const sinColumna = { grupoIvaNegocioId: "", noDisponibles: ["grupo_iva_negocio_id"] };
        expect(grupoIvaNegocioVisible(sinColumna, "activo")).toBe(false);
        expect(configEmpresaValida(sinColumna, "activo")).toBe(true);
    });
});
