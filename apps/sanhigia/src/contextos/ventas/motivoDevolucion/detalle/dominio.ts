import { ProcesarContexto } from "@olula/lib/diseño.js";
import {
  ejecutarListaProcesos,
  MetaModelo,
  stringNoVacio,
} from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { MotivoDevolucion } from "../diseño.ts";
import { motivoDevolucionVacio } from "../dominio.ts";
import {
  getMotivoDevolucion,
  patchMotivoDevolucion,
} from "../infraestructura.ts";
import {
  ContextoDetalleMotivoDevolucion,
  EstadoDetalleMotivoDevolucion,
} from "./diseño.ts";

export const metaMotivoDevolucion: MetaModelo<MotivoDevolucion> = {
  campos: {
    id: { requerido: true },
    tipo: {
      requerido: true,
      validacion: (motivoDevolucion: MotivoDevolucion) =>
        stringNoVacio(String(motivoDevolucion.tipo ?? "")),
    },
    descripcion: {
      requerido: true,
      validacion: (motivoDevolucion: MotivoDevolucion) =>
        stringNoVacio(String(motivoDevolucion.descripcion ?? "")),
    },
    otros: { requerido: true },
  },
};

type ProcesarDetalleMotivoDevolucion = ProcesarContexto<
  EstadoDetalleMotivoDevolucion,
  ContextoDetalleMotivoDevolucion
>;

const pipeDetalleMotivoDevolucion =
  ejecutarListaProcesos<
    EstadoDetalleMotivoDevolucion,
    ContextoDetalleMotivoDevolucion
  >;

const conMotivoDevolucion =
  (motivoDevolucion: MotivoDevolucion) =>
    (ctx: ContextoDetalleMotivoDevolucion) => ({ ...ctx, motivoDevolucion });

const conEstado =
  (estado: EstadoDetalleMotivoDevolucion) =>
    (ctx: ContextoDetalleMotivoDevolucion) => ({ ...ctx, estado });

const cargarMotivoDevolucion =
  (id: string): ProcesarDetalleMotivoDevolucion =>
    async (contexto) => {
      const motivoDevolucion = await getMotivoDevolucion(id);

      return pipe(contexto, conMotivoDevolucion(motivoDevolucion));
    };

export const refrescarMotivoDevolucion: ProcesarDetalleMotivoDevolucion =
  async (contexto) => {
    const motivoDevolucion = await getMotivoDevolucion(contexto.motivoDevolucion.id);

    return [
      pipe(
        contexto,
        conMotivoDevolucion({
          ...contexto.motivoDevolucion,
          ...motivoDevolucion,
        })
      ),
      [["motivo_devolucion_cambiado", motivoDevolucion]],
    ];
  };

export const cambiarMotivoDevolucion: ProcesarDetalleMotivoDevolucion = async (
  contexto,
  payload
) => {
  const motivoDevolucion = payload as MotivoDevolucion;
  await patchMotivoDevolucion(contexto.motivoDevolucion.id, motivoDevolucion);

  return pipeDetalleMotivoDevolucion(contexto, [
    refrescarMotivoDevolucion,
    "INICIAL",
  ]);
};

export const getContextoVacio: ProcesarDetalleMotivoDevolucion = async (
  contexto
) => {
  return pipe(
    contexto,
    conEstado("INICIAL"),
    conMotivoDevolucion(motivoDevolucionVacio)
  );
};

export const cargarContexto: ProcesarDetalleMotivoDevolucion = async (
  contexto,
  payload
) => {
  const id = payload as string;

  if (!id) return getContextoVacio(contexto);

  return pipeDetalleMotivoDevolucion(contexto, [cargarMotivoDevolucion(id)]);
};