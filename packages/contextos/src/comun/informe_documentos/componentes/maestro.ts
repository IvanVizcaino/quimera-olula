import { Criteria, Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import { getFichaInforme, getFichasInforme } from "../infraestructura.ts";
import { ContextoMaestroInforme, EstadoMaestroInforme } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroInforme,
    ContextoMaestroInforme
>;

const conFichas =
    (fn: ProcesarListaActivaEntidades<FichaInforme>) =>
    (ctx: ContextoMaestroInforme) => ({ ...ctx, fichas: fn(ctx.fichas) });

export const Fichas = accionesListaActivaEntidades(conFichas);

const recargar =
    (pestaña: PestañaInforme): ProcesarMaestro =>
    async (contexto, payload) =>
        Fichas.recargar(
            contexto,
            await getFichasInforme(pestaña, payload as Criteria)
        );

const ampliar =
    (pestaña: PestañaInforme): ProcesarMaestro =>
    async (contexto, payload) =>
        Fichas.ampliar(
            contexto,
            await getFichasInforme(pestaña, payload as Criteria)
        );

const incluirCreada =
    (pestaña: PestañaInforme): ProcesarMaestro =>
    async (contexto, payload) => {
        const ficha = await getFichaInforme(pestaña, payload as string);
        return {
            ...contexto,
            estado: "INICIAL",
            fichas: {
                ...contexto.fichas,
                lista: [ficha, ...contexto.fichas.lista],
                total: contexto.fichas.total + 1,
                activo: ficha.id,
            },
        };
    };

export const getMaquinaMaestro =
    (
        pestaña: PestañaInforme
    ): (() => Maquina<EstadoMaestroInforme, ContextoMaestroInforme>) =>
    () => ({
        INICIAL: {
            informe_seleccionado: [Fichas.activar],
            informe_deseleccionado: [Fichas.desactivar],
            informe_cambiado: [Fichas.cambiar],
            informe_borrado: [Fichas.quitar],
            recarga_de_informes_solicitada: recargar(pestaña),
            criteria_cambiado: [Fichas.filtrar, recargar(pestaña)],
            siguiente_pagina: [Fichas.filtrar, ampliar(pestaña)],
            crear_informe_solicitado: "CREANDO",
        },
        CREANDO: {
            alta_de_informe_cancelada: "INICIAL",
            informe_creado: incluirCreada(pestaña),
        },
    });
