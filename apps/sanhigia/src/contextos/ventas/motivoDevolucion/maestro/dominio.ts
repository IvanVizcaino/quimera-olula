import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { MotivoDevolucion } from "../diseño.ts";
import { getMotivosDevolucion, patchMotivoDevolucion } from "../infraestructura.ts";
import {
    ContextoMaestroMotivoDevolucion,
    EstadoMaestroMotivoDevolucion,
} from "./diseño.ts";

type ProcesarMaestroMotivoDevolucion = ProcesarContexto<
    EstadoMaestroMotivoDevolucion,
    ContextoMaestroMotivoDevolucion
>;

const conMotivosDevolucion =
    (fn: ProcesarListaActivaEntidades<MotivoDevolucion>) =>
        (ctx: ContextoMaestroMotivoDevolucion) => ({
            ...ctx,
            motivosDevolucion: fn(ctx.motivosDevolucion),
        });

export const MotivosDevolucion = accionesListaActivaEntidades(
    conMotivosDevolucion
);

export const recargarMotivosDevolucion: ProcesarMaestroMotivoDevolucion =
    async (contexto, payload) => {
        const criteria = payload as Criteria;
        const resultado = await getMotivosDevolucion(
            criteria.filtro,
            criteria.orden,
            criteria.paginacion
        );

        return MotivosDevolucion.recargar(contexto, resultado);
    };

export const ampliarMotivosDevolucion: ProcesarMaestroMotivoDevolucion =
    async (contexto, payload) => {
        const criteria = payload as Criteria;
        const resultado = await getMotivosDevolucion(
            criteria.filtro,
            criteria.orden,
            criteria.paginacion
        );

        return MotivosDevolucion.ampliar(contexto, resultado);
    };

export const cambiarOtro: ProcesarMaestroMotivoDevolucion =
    async (contexto) => {
        const motivoId = contexto.motivosDevolucion.activo;
        if (!motivoId) return contexto;

        // Encontrar el motivo actual para saber su estado
        const motivoActual = contexto.motivosDevolucion.lista.find(
            (m) => m.id === motivoId
        );
        if (!motivoActual) return contexto;

        // Toggle: si es otros, ponerlo a false; si no, ponerlo a true
        const nuevoOtros = !motivoActual.otros;

        try {
            await patchMotivoDevolucion(motivoId, {
                otros: nuevoOtros,
                descripcion: null,
            });
            // Recargar lista para actualizar el estado
            return recargarMotivosDevolucion(contexto, contexto.motivosDevolucion.criteria);
        } catch {
            // El servidor controlará si ya existe otro con 'otros: true' para ese tipo
            // El error será capturado por ContextoError en la UI
            throw new Error(
                nuevoOtros
                    ? "No se pudo marcar como Otros. Verifique que no exista otro motivo 'Otros' para este tipo."
                    : "No se pudo desmarcar como Otros."
            );
        }
    };