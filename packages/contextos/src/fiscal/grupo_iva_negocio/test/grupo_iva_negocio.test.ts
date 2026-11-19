import { describe, expect, test } from "vitest";
import { cambiosGrupoAApi, grupoDesdeApi, nuevoGrupoAApi } from "../dominio.ts";

const api = {
    id: "EXPORT", descripcion: "Otros clientes", regimen_iva: "Exportaciones",
    sin_iva: true, isp: false, aplicar_recargo: false, modelo349: false, sii_exenta_iva: true,
    regimen_iva_verifactu: "EXPORT", descripcion_regimen_iva_verifactu: "Exportación",
    causa_exencion_iva_verifactu: "TAXABLE_EXEMPT_2", sii_clave_operacion_emitidas: null,
};

describe("grupos contables Veri*Factu (gruposcontablesivaneg)", () => {
    test("grupoDesdeApi", () => {
        const grupo = grupoDesdeApi(api);
        expect(grupo.sinIva).toBe(true);
        expect(grupo.criterioCaja).toBe(false);
        expect(grupo.siiClaveOperacionEmitidas).toBe("");
        expect(grupo.descripcionRegimenIvaVerifactu).toBe("Exportación");
    });

    test("cambios con los nombres de la API; un texto vacío va como null", () => {
        const grupo = grupoDesdeApi(api);
        expect(cambiosGrupoAApi(grupo, { ...grupo, modelo349: true, causaExencionIvaVerifactu: "" }))
            .toEqual({ modelo349: true, causa_exencion_iva_verifactu: null });
    });

    test("alta: solo lo informado", () => {
        const nuevo = { ...grupoDesdeApi({ id: "" }), id: " NUEVO ", aplicarRecargo: true, regimenIva: "General" };
        expect(nuevoGrupoAApi(nuevo)).toEqual({ id: "NUEVO", aplicar_recargo: true, regimen_iva: "General" });
    });
});
