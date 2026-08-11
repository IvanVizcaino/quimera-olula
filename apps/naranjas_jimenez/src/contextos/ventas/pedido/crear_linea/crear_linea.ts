import ApiUrls from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { MetaModelo } from "@olula/lib/dominio.js";

// DISEÑO

type FormCrearLinea = {
    idVariedad: string;
    idMarca: string;
    idCalibre: string;
    categoria: string;
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

export type PostLineaNrj = (id: string, linea: FormCrearLinea) => Promise<string>;


// CONTROL

export const FormCrearLineaDefecto: FormCrearLinea = {
    idVariedad: "",
    idMarca: "",
    idCalibre: "",
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

const onChange = (modelo: FormCrearLinea, campo: string, _: unknown, otro?: Record<string, unknown>) => {

    if (campo === "idVariedad") {
        return {
            ...modelo,
            idMarca: "",
            marca: "",
            idCalibre: "",
            calibre: "",
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

const validarCantidadEnvases = (modelo: FormCrearLinea) => {
    console.log("modewlo", modelo);
    if (modelo.cantidadEnvases <= 0) {
        return "La cantidad de envases debe ser mayor que cero";
    }
    return true;
}

export const metaCrearLinea: MetaModelo<FormCrearLinea> = {
    campos: {
        idVariedad: { tipo: "texto", requerido: true },
        idTipoPalet: { tipo: "texto", requerido: false },
        idMarca: { tipo: "texto", requerido: true },
        idCalibre: { tipo: "texto", requerido: true },
        categoria: { tipo: "texto", requerido: false },
        observaciones: { tipo: "texto", requerido: false },
        cantidadPalets: { tipo: "entero", requerido: false },
        cantidadEnvases: { tipo: "entero", requerido: true, validacion: validarCantidadEnvases },
    },
    onChange
};

// INFRAESTRUCTURA

const baseUrl = new ApiUrls().PEDIDO;

export const postLineaNrj: PostLineaNrj = async (id, linea) => {

    return await RestAPI.post(
        `${baseUrl}/${id}/linea`,
        {
            lineas: [{
                variedad_id: linea.idVariedad,
                marca_id: linea.idMarca,
                calibre_id: linea.idCalibre,
                categoria: linea.categoria ? linea.categoria[0] : undefined,
                cantidad: linea.cantidadEnvases,
                tipo_palet_id: linea.idTipoPalet === "" ? null : linea.idTipoPalet,
                cantidad_palets: linea.cantidadPalets,
                observaciones: linea.observaciones,
            }]
        },
        "Error al crear la linea de pedido"
    ).then((respuesta) => {
        const miRespuesta = respuesta as unknown as { ids: string[] };
        return miRespuesta.ids[0];
    });
}