import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QAcordeon, QModal, QTextArea } from "@olula/componentes/index.js";
import { useEffect, useState } from "react";
import { MotivoDevolucion } from "../../../motivoDevolucion/diseño.ts";
import { getMotivosDevolucion } from "../../../motivoDevolucion/infraestructura.ts";
import "./PasoMotivoDevolucionModal.css";

type TipoPrincipal = "Interno" | "Externo" | "Terceros";
type GrupoAcordeonId = "interno" | "externo" | "regulatorio";

const grupoDesdeMotivo = (motivo: MotivoDevolucion): TipoPrincipal => {
  const tipo = String(motivo.tipo ?? "").trim();
  if (tipo === "Interno") return "Interno";
  if (tipo === "Terceros") return "Terceros";
  return "Externo";
};

const grupoAcordeonDesdeMotivo = (
  motivo: MotivoDevolucion
): GrupoAcordeonId => {
  const grupo = grupoDesdeMotivo(motivo);
  if (grupo === "Interno") return "interno";
  if (grupo === "Terceros") return "regulatorio";
  return "externo";
};

const ordenarPorDescripcion = (a: MotivoDevolucion, b: MotivoDevolucion) =>
  String(a.descripcion ?? "").localeCompare(String(b.descripcion ?? ""), "es", {
    sensitivity: "base",
  });

const TarjetaMotivo = ({
  motivo,
  seleccionado,
  onClick,
}: {
  motivo: MotivoDevolucion;
  seleccionado: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={`tarjeta-motivo${seleccionado ? " tarjeta-motivo--seleccionada" : ""}`}
    onClick={onClick}
  >
    {motivo.descripcion || "Otro"}
  </button>
);

export const PasoMotivoDevolucionModal = ({
  abierto,
  guardando,
  motivoSeleccionado,
  descripcionMotivo,
  onCerrar,
  onGuardar,
  onMotivoSeleccionado,
  onDescripcionMotivoCambiada,
}: {
  abierto: boolean;
  guardando: boolean;
  motivoSeleccionado: MotivoDevolucion | null;
  descripcionMotivo: string;
  onCerrar: () => void;
  onGuardar: () => void;
  onMotivoSeleccionado: (motivo: MotivoDevolucion) => void;
  onDescripcionMotivoCambiada: (descripcion: string) => void;
}) => {
  const [motivos, setMotivos] = useState<MotivoDevolucion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [grupoAbierto, setGrupoAbierto] = useState<GrupoAcordeonId | null>(
    "interno"
  );

  useEffect(() => {
    if (!abierto) return;

    const cargarMotivos = async () => {
      setCargando(true);
      setError("");
      try {
        const respuesta = await getMotivosDevolucion([], ["tipo", "ASC"], {
          limite: 200,
          pagina: 1,
        });
        setMotivos(respuesta.datos ?? []);
      } catch {
        setError("No se han podido cargar los motivos de devolución");
      } finally {
        setCargando(false);
      }
    };

    cargarMotivos();
  }, [abierto]);

  useEffect(() => {
    if (!motivoSeleccionado) return;
    setGrupoAbierto(grupoAcordeonDesdeMotivo(motivoSeleccionado));
  }, [motivoSeleccionado]);

  const internos = motivos
    .filter((m) => grupoDesdeMotivo(m) === "Interno")
    .sort(ordenarPorDescripcion);
  const externos = motivos
    .filter((m) => grupoDesdeMotivo(m) === "Externo")
    .sort(ordenarPorDescripcion);
  const terceros = motivos
    .filter((m) => grupoDesdeMotivo(m) === "Terceros")
    .sort(ordenarPorDescripcion);

  const renderBotonesMotivo = (grupo: MotivoDevolucion[]) => {
    if (!grupo.length) {
      return (
        <p className="motivo-devolucion-vacio">
          No hay motivos disponibles en este bloque.
        </p>
      );
    }

    return (
      <div className="motivo-devolucion-grid">
        {grupo.map((motivo) => (
          <TarjetaMotivo
            key={motivo.id}
            motivo={motivo}
            seleccionado={motivoSeleccionado?.id === motivo.id}
            onClick={() => onMotivoSeleccionado(motivo)}
          />
        ))}
      </div>
    );
  };

  const descripcionInformada = descripcionMotivo.trim().length > 0;
  const esOtros = !!motivoSeleccionado?.otros;
  const puedeGuardar =
    !!motivoSeleccionado && (!esOtros || descripcionInformada) && !guardando;

  return (
    <QModal
      abierto={abierto}
      nombre="motivo_devolucion"
      titulo="Motivo de devolución"
      onCerrar={onCerrar}
    >
      <div className="motivo-devolucion-modal">
        {cargando && <p>Cargando motivos...</p>}
        {!cargando && error && <p className="mensaje-error">{error}</p>}

        {!cargando && !error && (
          <>
            <QAcordeon
              permitirCerrar
              items={[
                {
                  id: "interno",
                  titulo: "Causas internas",
                  subtitulo: "Incidencias imputables a la empresa",
                  contador: internos.length,
                  contenido: renderBotonesMotivo(internos),
                },
                {
                  id: "externo",
                  titulo: "Causas externas",
                  subtitulo:
                    "Solicitudes o incidencias comunicadas por el cliente",
                  contador: externos.length,
                  contenido: renderBotonesMotivo(externos),
                },
                {
                  id: "regulatorio",
                  titulo: "Causas regulatorias / terceros",
                  subtitulo: "Calidad, trazabilidad y requisitos regulatorios",
                  contador: terceros.length,
                  contenido: renderBotonesMotivo(terceros),
                },
              ]}
              abiertoId={grupoAbierto}
              onAbiertoCambiado={(id) =>
                setGrupoAbierto(id as GrupoAcordeonId | null)
              }
            />

            <quimera-formulario>
              <QTextArea
                label="Descripción motivo"
                nombre="descripcion_motivo"
                valor={descripcionMotivo}
                onChange={(valor) =>
                  onDescripcionMotivoCambiada(String(valor ?? ""))
                }
                deshabilitado={!esOtros}
              />
            </quimera-formulario>

            <div className="botones">
              <QBoton onClick={onGuardar} deshabilitado={!puedeGuardar}>
                Guardar
              </QBoton>
              <QBoton variante="texto" onClick={onCerrar}>
                Cancelar
              </QBoton>
            </div>
          </>
        )}
      </div>
    </QModal>
  );
};
