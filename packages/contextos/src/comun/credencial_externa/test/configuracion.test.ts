import { configurarCredenciales, getConfiguracionCredenciales } from "../configuracion.ts";
import { secretoCompleto } from "../dominio.ts";

describe("configuración de credenciales", () => {
    afterEach(() => configurarCredenciales({}));

    test("por defecto no hay ajustes", () => {
        expect(getConfiguracionCredenciales()).toEqual({});
    });

    test("configurarCredenciales registra los ajustes de la app", () => {
        configurarCredenciales({ empresaFija: "olula", sinCuentaBancaria: true });
        expect(getConfiguracionCredenciales()).toEqual({ empresaFija: "olula", sinCuentaBancaria: true });
    });
});

describe("alta de Stripe sin cuenta bancaria", () => {
    afterEach(() => configurarCredenciales({}));

    const secreto = { modo: "test", secret_key_test: "sk_test_1" };

    test("en el resto de apps la cuenta de cobros es obligatoria", () => {
        expect(secretoCompleto("Stripe", "api_key", secreto)).toBe(false);
        expect(secretoCompleto("Stripe", "api_key", { ...secreto, cuenta_banco_id: "1" })).toBe(true);
    });

    test("si la app oculta la cuenta bancaria, no se exige", () => {
        configurarCredenciales({ sinCuentaBancaria: true });
        expect(secretoCompleto("Stripe", "api_key", secreto)).toBe(true);
    });
});
