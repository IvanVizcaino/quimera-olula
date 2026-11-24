import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    FamiliaLectra,
    GetFamiliasLectra,
    PatchFamiliaLectraPorDefecto,
    PostActualizarFamiliasLectra,
} from "./diseño.ts";

const baseUrlFamiliasLectra = `/produccion/material_lectra/familias`;

interface FamiliaLectraAPI {
    id: string;
    referencia: string;
    valor_defecto: boolean;
}

const familiaLectraDesdeAPI = (api: FamiliaLectraAPI): FamiliaLectra => ({
    id: api.id,
    referencia: api.referencia,
    valorDefecto: api.valor_defecto,
});

export const getFamiliasLectra: GetFamiliasLectra = async (tipo) => {
    const respuesta = await RestAPI.get<{ datos: FamiliaLectraAPI[]; total: number }>(`${baseUrlFamiliasLectra}/${tipo}`);
    return { datos: respuesta.datos.map(familiaLectraDesdeAPI), total: respuesta.total };
};

export const postActualizarFamiliasLectra: PostActualizarFamiliasLectra = async () => {
    await RestAPI.post(`${baseUrlFamiliasLectra}/actualizar`, {}, "Error al actualizar las familias de Lectra");
};

export const patchFamiliaLectraPorDefecto: PatchFamiliaLectraPorDefecto = async (tipo, referencia) => {
    await RestAPI.patch(
        `${baseUrlFamiliasLectra}/${tipo}/${encodeURIComponent(referencia)}/pordefecto`,
        {},
        "Error al marcar por defecto la familia de Lectra",
    );
};
