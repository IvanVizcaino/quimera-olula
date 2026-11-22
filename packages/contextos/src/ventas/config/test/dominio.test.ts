import { correoCopiasValido } from "#/ventas/config/dominio.ts";
import { configVentasAApi, configVentasDesdeApi } from "#/ventas/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("configuración de ventas", () => {
    test("se lee de la API y vuelve igual, con el correo vacío como nulo", () => {
        const api = {
            mostrar_observaciones_cliente: true,
            facturar_albaranes_borrador: "Preguntar" as const,
            crear_facturas_borrador: "No" as const,
            correo_copias: null,
        };
        const config = configVentasDesdeApi(api);
        expect(config.correoCopias).toBe("");
        expect(configVentasAApi(config)).toEqual(api);
    });

    test("el correo de copias se recorta al enviarlo", () => {
        const config = configVentasDesdeApi({
            mostrar_observaciones_cliente: false,
            facturar_albaranes_borrador: "Si",
            crear_facturas_borrador: "Si",
            correo_copias: null,
        });
        expect(configVentasAApi({ ...config, correoCopias: "  a@b.es " }).correo_copias).toBe("a@b.es");
    });

    test("el correo de copias puede ir vacío o ser una dirección", () => {
        expect(correoCopiasValido("")).toBe(true);
        expect(correoCopiasValido("copias@empresa.es")).toBe(true);
        expect(correoCopiasValido("copias")).toBe(false);
    });
});
