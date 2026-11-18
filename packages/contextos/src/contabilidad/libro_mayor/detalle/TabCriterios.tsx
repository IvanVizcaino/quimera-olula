import { FormModelo } from "@olula/lib/dominio.js";
import { LibroMayor } from "../diseño.ts";
import { CamposLibroMayor } from "./CamposLibroMayor.tsx";

interface TabCriteriosProps {
    form: FormModelo;
    informe: LibroMayor;
}

export const TabCriterios = ({ form, informe }: TabCriteriosProps) => (
    <div className="TabCriterios">
        <quimera-formulario>
            <CamposLibroMayor uiProps={form.uiProps} informe={informe} />
        </quimera-formulario>
    </div>
);
