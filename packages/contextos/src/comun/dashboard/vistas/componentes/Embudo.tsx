import { ComponenteDashboard, RespuestaAgregado } from "../../diseño.ts";
import { formatearValor, formatoPorDefecto, pasosEmbudo } from "../../dominio.ts";
import { COLORES_SERIE } from "./colores.ts";

const porcentaje = (fraccion: number) =>
  `${(fraccion * 100).toLocaleString("es-ES", { maximumFractionDigits: 0 })} %`;

/** Pasos de un circuito de documentos con la conversión entre cada uno y el anterior. */
export const Embudo = ({
  componente,
  respuestas,
}: {
  componente: ComponenteDashboard;
  respuestas: RespuestaAgregado[];
}) => {
  const formato =
    componente.opciones.formato ?? formatoPorDefecto(componente.consultas[0]?.metricas);
  const pasos = pasosEmbudo(respuestas, componente.consultas);

  return (
    <ol className="dashboard-embudo">
      {pasos.map((paso) => (
        <li key={paso.etiqueta}>
          <span className="dashboard-embudo-etiqueta">{paso.etiqueta}</span>
          <span className="dashboard-embudo-pista">
            <span
              className="dashboard-embudo-barra"
              style={{
                width: `${Math.max(paso.proporcion * 100, 2)}%`,
                background: COLORES_SERIE[0],
              }}
            />
          </span>
          <span className="dashboard-embudo-valor">
            {formatearValor(paso.valor, formato)}
            {paso.conversion !== null && (
              <span className="dashboard-embudo-conversion"> · {porcentaje(paso.conversion)}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
};
