import { CamposLibroIva } from "#/contabilidad/comun/componentes/CamposLibroIva.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { admiteNumeroDesde, admitePorcentaje } from "../dominio.ts";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroFacturasRecibidas;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => (
    <div className="TabCriterios">
        <quimera-formulario>
            <CamposLibroIva
                uiProps={form.uiProps}
                porcentajeEditable={admitePorcentaje(informe)}
                numeroDesdeEditable={admiteNumeroDesde(informe)}
                conSerie
            />
        </quimera-formulario>
    </div>
);
