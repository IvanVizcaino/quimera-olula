import ApiUrls from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { MetaModelo } from "@olula/lib/dominio.js";

// DISEÑO

type FormEditarLinea = {
    idVariedad: string;
    idMarca: string;
    idCalibre: string;
    categoria: string;
    idEnvase: string;
    variedad: string;
    marca: string;
    calibre: string;
    palet: string;
    envase: string;
    observaciones: string;
    idTipoPalet: string;
    cantidadEnvases: number;
    cantidadPalets: number;
    envasesPorPalet: number;
}

export type PatchLineaNrj = (idPedido: string, idLinea: string, linea: FormEditarLinea) => Promise<void>;


// CONTROL

export const FormEditarLineaDefecto: FormEditarLinea = {
    idVariedad: "",
    idMarca: "",
    idCalibre: "",
    idEnvase: "",
    categoria: "",
    variedad: "",
    marca: "",
    calibre: "",
    palet: "",
    envase: "",
    observaciones: "",
    idTipoPalet: "",
    cantidadEnvases: 0,
    cantidadPalets: 0,
    envasesPorPalet: 0
};

const onChange = (modelo: FormEditarLinea, campo: string, _: unknown, otro?: Record<string, unknown>) => {

    if (campo === "idVariedad") {
        return {
            ...modelo,
            idMarca: "",
            marca: "",
            idCalibre: "",
            calibre: "",
            categoria: "",
        }
    }
    if (campo === "idMarca") {
        return {
            ...modelo,
            idCalibre: "",
            calibre: "",
            categoria: otro ? ((otro.idCategoria as string) ?? "") : "",
        }
    }
    if (campo === "idTipoPalet" && otro) {
        const envasesPorPalet = otro.cantidadEnvase as number;
        return {
            ...modelo,
            envasesPorPalet,
            cantidadEnvases: modelo.cantidadPalets * envasesPorPalet
        }
    }
    if (campo === "cantidadPalets") {
        return {
            ...modelo,
            cantidadEnvases: modelo.cantidadPalets * modelo.envasesPorPalet
        }
    }
    return modelo;
}

export const metaEditarLinea: MetaModelo<FormEditarLinea> = {
    campos: {
        idVariedad: { tipo: "texto", requerido: true },
        idTipoPalet: { tipo: "texto", requerido: false },
        idMarca: { tipo: "texto", requerido: true },
        idCalibre: { tipo: "texto", requerido: true },
        idEnvase: { tipo: "texto", requerido: false },
        categoria: { tipo: "texto", requerido: false },
        observaciones: { tipo: "texto", requerido: false },
        cantidadPalets: { tipo: "entero", requerido: false },
        cantidadEnvases: { tipo: "entero", requerido: true, positivo: true },
    },
    onChange
};

// INFRAESTRUCTURA

const baseUrl = new ApiUrls().PEDIDO;

export const patchLineaNrj: PatchLineaNrj = async (idPedido, idLinea, linea) => {

    return await RestAPI.patch(
        `${baseUrl}/${idPedido}/linea/${idLinea}`,
        {
            cambios: {
                variedad_id: linea.idVariedad,
                marca_id: linea.idMarca,
                calibre_id: linea.idCalibre,
                categoria: linea.categoria ? linea.categoria[0] : undefined,
                cantidad: linea.cantidadEnvases,
                tipo_palet_id: linea.idTipoPalet === "" ? null : linea.idTipoPalet,
                cantidad_palets: linea.cantidadPalets,
                observaciones: linea.observaciones
            }

        },
        "Error al editar la linea de pedido"
    );
}
