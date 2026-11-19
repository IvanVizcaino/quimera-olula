import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CamposGrupo } from "../detalle/CamposGrupo.tsx";
import { descripcionesVacias } from "../dominio.ts";

const uiProps = (campo: string) => ({ nombre: campo, valor: "", onChange: () => {} });

describe("CamposGrupo — subcuentas del grupo contable de amortización", () => {
    test("en la ficha, el nombre de cada subcuenta va en la misma fila que su código", () => {
        const descripciones = { ...descripcionesVacias(), elemento: "Maquinaria" };
        render(
            <quimera-formulario>
                <CamposGrupo
                    uiProps={uiProps as never}
                    descripciones={descripciones}
                />
            </quimera-formulario>
        );

        const filas = [...document.querySelectorAll(".FilaFormulario")];
        expect(filas).toHaveLength(5);
        const primera = filas[0];
        expect(primera.querySelector('quimera-input[nombre="subcuentaElemento"]')).not.toBeNull();
        expect(primera.querySelector('quimera-input[nombre="nombre_elemento"]')?.textContent)
            .toContain("Maquinaria");
    });

    test("en el alta solo están los códigos", () => {
        render(
            <quimera-formulario>
                <CamposGrupo uiProps={uiProps as never} />
            </quimera-formulario>
        );

        expect(document.querySelectorAll(".FilaFormulario")).toHaveLength(5);
        expect(document.querySelector('quimera-input[nombre^="nombre_"]')).toBeNull();
    });
});
