import { CamposLibroIva } from "#/contabilidad/comun/componentes/CamposLibroIva.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { admiteNumeroDesde, admitePorcentaje } from "../dominio.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroFacturasEmitidas;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => (
    <div className="TabCriterios">
        <quimera-formulario>
            <CamposLibroIva
                uiProps={form.uiProps}
                porcentajeEditable={admitePorcentaje(informe)}
                numeroDesdeEditable={admiteNumeroDesde(informe)}
            />
        </quimera-formulario>
    </div>
);
