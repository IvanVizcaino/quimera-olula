import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { componentesDesdePropuestaDashboard } from "../dominio.ts";
import { crearDashboard, proponerDashboard } from "../infraestructura.ts";
import "./ConfigurarComponente.css";

const EJEMPLOS = [
  "Seguimiento de ventas y clientes",
  "Tesorería: cobros y pagos pendientes",
  "Compras y proveedores de este año",
  "Stock y artículos sin disponible",
];

/**
 * Nuevo dashboard en blanco o propuesto por la IA a partir de lo que se quiere seguir.
 * La propuesta se crea ya colocada y se abre en edición para retocarla.
 */
export const NuevoDashboard = ({
  onCreado,
  onCancelar,
}: {
  onCreado: (id: string) => void;
  onCancelar: () => void;
}) => {
  const [peticion, setPeticion] = useState("");
  const [creando, setCreando] = useState<"blanco" | "ia" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enBlanco = async () => {
    setCreando("blanco");
    try {
      onCreado(await crearDashboard({ nombre: "Nuevo dashboard", componentes: [] }));
    } finally {
      setCreando(null);
    }
  };

  const proponer = async (texto = peticion) => {
    if (!texto.trim() || creando) return;
    setPeticion(texto);
    setCreando("ia");
    setError(null);
    try {
      const propuesta = await proponerDashboard(texto);
      onCreado(
        await crearDashboard({
          nombre: propuesta.nombre,
          componentes: componentesDesdePropuestaDashboard(propuesta),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido preguntar a la IA.");
    } finally {
      setCreando(null);
    }
  };

  return (
    <QModal nombre="nuevo-dashboard" titulo="Nuevo dashboard" abierto={true} onCerrar={onCancelar}>
      <div className="configurar-componente nuevo-dashboard">
        <p className="nuevo-dashboard-intro">
          Cuéntale a la IA qué quieres seguir y te propondrá los indicadores y gráficos. Lo
          abrirás en edición para ajustarlo antes de guardar.
        </p>
        <form
          className="preguntar-ia-pregunta"
          onSubmit={(evento) => {
            evento.preventDefault();
            proponer();
          }}
        >
          <QInput
            label="¿Qué quieres seguir?"
            nombre="peticion_dashboard"
            valor={peticion}
            maxLength={500}
            autoFocus
            onChange={setPeticion}
          />
          <QBoton tipo="submit" deshabilitado={!peticion.trim() || creando !== null}>
            {creando === "ia" ? "Montando…" : "Proponer"}
          </QBoton>
        </form>

        {creando !== "ia" && (
          <div className="preguntar-ia-ejemplos">
            <span>Por ejemplo:</span>
            {EJEMPLOS.map((ejemplo) => (
              <QBoton
                key={ejemplo}
                variante="borde"
                tamaño="pequeño"
                deshabilitado={creando !== null}
                onClick={() => proponer(ejemplo)}
              >
                {ejemplo}
              </QBoton>
            ))}
          </div>
        )}

        {creando === "ia" && (
          <p className="nuevo-dashboard-progreso" role="status">
            Eligiendo los indicadores y comprobando cada consulta… puede tardar unos segundos.
          </p>
        )}

        {error && (
          <p className="preguntar-ia-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="configurar-componente-pie">
        <QBoton variante="borde" onClick={onCancelar}>
          Cancelar
        </QBoton>
        <QBoton variante="borde" deshabilitado={creando !== null} onClick={enBlanco}>
          Empezar en blanco
        </QBoton>
      </footer>
    </QModal>
  );
};
