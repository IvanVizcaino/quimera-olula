import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { getCredencialesExterna } from "../../../comun/credencial_externa/infraestructura.js";
import { CambiosPasarela } from "../diseño.js";
import { sustituirPasarela } from "../dominio.js";
import {
    avanzarCiclo, getPasarelas, patchPasarela, probarPasarela, sincronizarPasarela,
} from "../infraestructura.js";
import { ContextoMaestroPasarela, EstadoMaestroPasarela } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPasarela, ContextoMaestroPasarela>;

export const contextoMaestroPasarelaInicial: ContextoMaestroPasarela = {
    estado: "INICIAL",
    pasarelas: [],
    credenciales: [],
    mensajes: {},
    resumenCiclo: null,
};

export const recargarPasarelas: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    pasarelas: await getPasarelas(),
    credenciales: await getCredencialesExterna({ ...criteriaDefecto, paginacion: { limite: 200, pagina: 1 } })
        .then((r) => r.datos).catch(() => contexto.credenciales),
});

export const guardarPasarela: ProcesarMaestro = async (contexto, payload) => {
    const { id, cambios } = payload as { id: string; cambios: CambiosPasarela };
    const pasarela = await patchPasarela(id, cambios);
    // Activar o marcar por defecto una pasarela puede cambiar las demás: se relee la lista.
    const pasarelas = await getPasarelas().catch(() => sustituirPasarela(contexto.pasarelas, pasarela));
    return { ...contexto, pasarelas, mensajes: { ...contexto.mensajes, [id]: "Guardado." } };
};

/** La prueba deja constancia en el servidor (última prueba): se relee la lista. */
export const probarConexion: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    await probarPasarela(id);
    return { ...contexto, pasarelas: await getPasarelas(), mensajes: { ...contexto.mensajes, [id]: "" } };
};

export const sincronizarCatalogo: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const creados = await sincronizarPasarela(id);
    return {
        ...contexto,
        mensajes: { ...contexto.mensajes, [id]: `Catálogo sincronizado: ${creados} precios creados.` },
    };
};

export const pasarCiclo: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    resumenCiclo: await avanzarCiclo(),
});
