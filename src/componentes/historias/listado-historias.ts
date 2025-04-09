import * as HistoriasBoton from "../atomos/qboton.stories.tsx";
import * as HistoriasCheckbox from "../atomos/qcheckbox.stories.tsx";
import * as HistoriasDate from "../atomos/qdate.stories.tsx";
import * as HistoriasInput from "../atomos/qinput.stories.tsx";
import * as HistoriasSelect from "../atomos/qselect.stories.tsx";
import { HistoriasComponente } from "./diseño.tsx";

export const listadoHistorias = [
    HistoriasBoton,
    HistoriasInput,
    HistoriasSelect,
    HistoriasDate,
    HistoriasCheckbox,
] as unknown as HistoriasComponente[];
