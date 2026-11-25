import { describe, expect, it } from "vitest";
import { configProduccionAApi, configProduccionDesdeApi } from "../infraestructura.ts";

describe("configuración de producción", () => {
    it("ida y vuelta con la API", () => {
        const api = { pedido_completo: true, usar_tramos: false, control_tiempo: true, mostrar_formulario: false };
        const config = configProduccionDesdeApi(api);
        expect(config).toEqual({ pedidoCompleto: true, usarTramos: false, controlTiempo: true, mostrarFormulario: false });
        expect(configProduccionAApi(config)).toEqual(api);
    });
});
