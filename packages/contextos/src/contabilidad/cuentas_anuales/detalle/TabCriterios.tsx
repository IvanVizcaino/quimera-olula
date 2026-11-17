import { FormModelo } from "@olula/lib/dominio.js";
import { CuentasAnuales } from "../diseño.ts";
import { CamposCuentasAnuales } from "./CamposCuentasAnuales.tsx";

interface TabCriteriosProps {
    form: FormModelo;
    informe: CuentasAnuales;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => (
    <div className="TabCriterios">
        <quimera-formulario>
            <CamposCuentasAnuales uiProps={form.uiProps} informe={informe} conOmitirEpigrafes />
        </quimera-formulario>
    </div>
);
