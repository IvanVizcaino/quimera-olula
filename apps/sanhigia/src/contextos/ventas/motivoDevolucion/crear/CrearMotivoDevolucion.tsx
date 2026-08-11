import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal, QTextArea } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { TipoMotivoDevolucion } from "../../../../componentes/tipoMotivoDevolucion.tsx";
import { NuevoMotivoDevolucion } from "../diseño.ts";
import {
  getMotivoDevolucion,
  postMotivoDevolucion,
} from "../infraestructura.ts";
import "./CrearMotivoDevolucion.css";
import {
  metaNuevoMotivoDevolucion,
  nuevoMotivoDevolucionVacio,
} from "./dominio.ts";

export const CrearMotivoDevolucion = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}) => {
  const { intentar } = useContext(ContextoError);
  const [creando, setCreando] = useState(false);
  const { modelo, uiProps, valido, init } = useModelo(
    metaNuevoMotivoDevolucion,
    nuevoMotivoDevolucionVacio
  );
  const motivoDevolucion = modelo as NuevoMotivoDevolucion;

  const cerrar = useCallback(() => {
    if (creando) return;

    init(nuevoMotivoDevolucionVacio);
    onCancelar();
  }, [creando, init, onCancelar]);

  const crear = useCallback(async () => {
    if (!valido) return;

    const descripcionNormalizada = String(
      motivoDevolucion.descripcion ?? ""
    ).trim();

    setCreando(true);
    try {
      const motivoDevolucionId: string = await intentar(() =>
        postMotivoDevolucion({
          tipo: String(motivoDevolucion.tipo ?? "").trim(),
          descripcion: descripcionNormalizada,
          otros: false,
        })
      );
      const motivoDevolucionCreado = await intentar(() =>
        getMotivoDevolucion(motivoDevolucionId)
      );

      publicar("motivo_devolucion_creado", motivoDevolucionCreado);
      init(nuevoMotivoDevolucionVacio);
      onCancelar();
    } finally {
      setCreando(false);
    }
  }, [init, intentar, motivoDevolucion, onCancelar, publicar, valido]);

  if (!activo) return null;

  return (
    <QModal
      abierto={activo}
      nombre="crear_motivo_devolucion"
      titulo="Nuevo motivo de devolución"
      onCerrar={cerrar}
    >
      <div className="crear-motivo-devolucion">
        <quimera-formulario>
          <TipoMotivoDevolucion {...uiProps("tipo")} />
          <QTextArea label="Descripción" {...uiProps("descripcion")} />
        </quimera-formulario>

        <div className="botones maestro-botones">
          <QBoton onClick={crear} deshabilitado={!valido || creando}>
            Guardar
          </QBoton>
          <QBoton onClick={cerrar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
