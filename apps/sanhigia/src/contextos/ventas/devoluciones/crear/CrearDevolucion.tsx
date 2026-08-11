import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useEffect, useState } from "react";
import { LineaFacturaDevolucion } from "../diseño.ts";
import { crearDevolucionPedido } from "../infraestructura.ts";
import "./CrearDevolucion.css";
import { contextoCrearDevolucionVacio } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { PasoBuscarFacturaModal } from "./vistas/PasoBuscarFacturaModal.tsx";
import { PasoConfigurarDevolucionModal } from "./vistas/PasoConfigurarDevolucionModal.tsx";
import { PasoMotivoDevolucionModal } from "./vistas/PasoMotivoDevolucionModal.tsx";

export const CrearDevolucion = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}) => {
  const { ctx, emitir } = useMaquina(getMaquina, contextoCrearDevolucionVacio);
  const [lineasDevolucion, setLineasDevolucion] = useState<
    LineaFacturaDevolucion[]
  >([]);

  useEffect(() => {
    if (!activo) {
      setLineasDevolucion([]);
      emitir("formulario_limpiado", null, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  const idFactura = ctx.facturaSeleccionada?.valor ?? "";
  const guardando = ctx.estado === "GUARDANDO_DEVOLUCION";
  const motivoSeleccionado = ctx.motivoSeleccionado;
  const descripcionMotivo = ctx.descripcionMotivo;

  const cerrarFlujo = useCallback(() => {
    if (guardando) return;

    setLineasDevolucion([]);
    emitir("formulario_limpiado");
    onCancelar();
  }, [emitir, guardando, onCancelar]);

  const confirmarMotivoYCrear = useCallback(async () => {
    if (!ctx.factura || !idFactura || !motivoSeleccionado) return;

    const descripcionNormalizada = descripcionMotivo.trim();
    if (motivoSeleccionado.otros && !descripcionNormalizada) return;

    const descripcionFinal = motivoSeleccionado.otros
      ? descripcionNormalizada
      : String(motivoSeleccionado.descripcion ?? "").trim();

    const razonDevolucion = descripcionFinal
      ? `${descripcionFinal}`
      : motivoSeleccionado.tipo;

    await emitir("guardado_solicitado");
    try {
      const devolucionCreada = await crearDevolucionPedido({
        idFactura,
        idMotivo: String(motivoSeleccionado.id),
        razonDevolucion,
        lineasConDevoluciones: lineasDevolucion.map((linea) => ({
          idlinea: linea.id,
          referencia: String(linea.referencia ?? ""),
          descripcion: String(linea.descripcion),
          cantidad: Number(linea.cantidadDevolver ?? 0),
          esKit: Boolean(linea.esKit ?? false),
        })),
      });

      await emitir("guardado_completado");
      publicar("devolucion_creada", devolucionCreada);
      cerrarFlujo();
    } catch {
      await emitir("guardado_fallido");
    } finally {
      // no-op: el estado se gestiona desde la maquina
    }
  }, [
    ctx.factura,
    lineasDevolucion,
    descripcionMotivo,
    emitir,
    cerrarFlujo,
    idFactura,
    motivoSeleccionado,
    publicar,
  ]);

  return (
    <div className="crear-devolucion">
      <PasoBuscarFacturaModal
        abierto={activo && ctx.estado === "SELECCIONANDO_FACTURA"}
        idFactura={idFactura}
        descripcionFactura={ctx.facturaSeleccionada?.descripcion ?? ""}
        error={ctx.error}
        onCerrar={cerrarFlujo}
        onFacturaSeleccionada={(factura) =>
          emitir("factura_seleccionada", factura)
        }
        onSiguiente={() => emitir("factura_buscada", idFactura)}
      />

      <PasoConfigurarDevolucionModal
        abierto={
          activo && ctx.estado === "EDITANDO_DEVOLUCION" && !!ctx.factura
        }
        factura={ctx.factura}
        error={ctx.error}
        onCerrar={cerrarFlujo}
        onCambiarFactura={() => emitir("volver_a_busqueda")}
        onLineasCambiadas={setLineasDevolucion}
        onSolicitarConfirmacion={() => emitir("confirmacion_motivo_solicitada")}
      />

      <PasoMotivoDevolucionModal
        abierto={
          activo &&
          (ctx.estado === "SELECCIONANDO_MOTIVO" ||
            ctx.estado === "GUARDANDO_DEVOLUCION")
        }
        guardando={guardando}
        motivoSeleccionado={motivoSeleccionado}
        descripcionMotivo={descripcionMotivo}
        onCerrar={() => emitir("confirmacion_motivo_cancelada")}
        onGuardar={confirmarMotivoYCrear}
        onMotivoSeleccionado={(motivo) => emitir("motivo_seleccionado", motivo)}
        onDescripcionMotivoCambiada={(descripcion) =>
          emitir("descripcion_motivo_cambiada", descripcion)
        }
      />
    </div>
  );
};
