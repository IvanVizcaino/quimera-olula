import { CredencialExterna } from "../../../comun/credencial_externa/diseño.ts";
import { Pasarela } from "../diseño.ts";
import {
    cambiarActiva, credencialesDePasarela, cambiarPorDefecto, cambiosDeForm, formDePasarela, formModificado, resumenCicloATexto,
} from "../dominio.ts";

const stripe: Pasarela = {
    id: "stripe", nombre: "Stripe", activa: true, porDefecto: false, modo: "test",
    publica: { acreedor_id: "ES01" }, ultimaPrueba: null, tipoCredencial: "Stripe", credencialId: "stripe_principal", modoDesdeCredencial: true,
    campos: [{ id: "acreedor_id", nombre: "Acreedor", secreto: false, ayuda: "" }],
    cobraSolo: true,
};
const sepa: Pasarela = { ...stripe, id: "sepa", tipoCredencial: null, credencialId: null };

describe("formulario de pasarela", () => {
    test("el formulario lleva la credencial y los campos no secretos", () => {
        expect(formDePasarela(stripe)).toMatchObject({ credencialId: "stripe_principal", valores: { acreedor_id: "ES01" } });
        expect(formDePasarela(sepa).credencialId).toBe("");
    });

    test("cambiosDeForm envía la credencial elegida y nunca secretos", () => {
        expect(cambiosDeForm(stripe, formDePasarela(stripe))).toEqual({
            activa: true, porDefecto: false, modo: "test",
            publica: { acreedor_id: "ES01" }, credencialId: "stripe_principal",
        });
    });

    test("sin credencial elegida o sin tipo de credencial se envía null", () => {
        expect(cambiosDeForm(stripe, { ...formDePasarela(stripe), credencialId: "" }).credencialId).toBeNull();
        expect(cambiosDeForm(sepa, { ...formDePasarela(sepa), credencialId: "x" }).credencialId).toBeNull();
    });

    test("cambiar la credencial cuenta como modificación", () => {
        const form = formDePasarela(stripe);
        expect(formModificado(stripe, form)).toBe(false);
        expect(formModificado(stripe, { ...form, credencialId: "otra" })).toBe(true);
    });

    test("por defecto implica activa; desactivar quita el por defecto", () => {
        const form = { ...formDePasarela(stripe), activa: false };
        expect(cambiarPorDefecto(form, true)).toMatchObject({ porDefecto: true, activa: true });
        expect(cambiarActiva({ ...form, activa: true, porDefecto: true }, false)).toMatchObject({ porDefecto: false, activa: false });
    });
});

test("credencialesDePasarela filtra por proveedor, categoría conector y activas", () => {
    const c = (id: string, proveedor: string, categoria: "llm" | "conector", activo = true) =>
        ({ id, proveedor, categoria, activo }) as CredencialExterna;
    const lista = [c("a", "Stripe", "conector"), c("b", "Gemini", "llm"), c("c", "Stripe", "conector", false), c("d", "Stripe", "llm")];
    expect(credencialesDePasarela(lista, "Stripe").map((x) => x.id)).toEqual(["a"]);
    expect(credencialesDePasarela(lista, null)).toEqual([]);
});

test("resumenCicloATexto", () => {
    expect(resumenCicloATexto({ revisadas: 10, cambios: 3, errores: 0 }))
        .toBe("Suscripciones revisadas: 10. Cambios: 3. Errores: 0.");
});
