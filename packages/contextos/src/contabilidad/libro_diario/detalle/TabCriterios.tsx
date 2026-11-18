import { FormModelo } from "@olula/lib/dominio.js";
import { LibroDiario } from "../diseño.ts";
import { CamposLibroDiario } from "./CamposLibroDiario.tsx";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroDiario;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => (
    <div className="TabCriterios">
        <quimera-formulario>
            <CamposLibroDiario uiProps={form.uiProps} informe={informe} />
        </quimera-formulario>
    </div>
);
