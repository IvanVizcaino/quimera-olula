import { configEmpresaValida } from "#/empresa/config/dominio.ts";
import { configEmpresaAApi, configEmpresaDesdeApi } from "#/empresa/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("configuración de empresa", () => {
    test("el grupo de IVA de negocio va y viene de la API", () => {
        const config = configEmpresaDesdeApi({ grupo_iva_negocio_id: "NACIONAL" });
        expect(config.grupoIvaNegocioId).toBe("NACIONAL");
        expect(configEmpresaAApi(config)).toEqual({ grupo_iva_negocio_id: "NACIONAL" });
    });

    test("el grupo es obligatorio, como en el escritorio", () => {
        expect(configEmpresaValida({ grupoIvaNegocioId: "" })).toBe(false);
        expect(configEmpresaValida({ grupoIvaNegocioId: "EXENTO" })).toBe(true);
    });
});
