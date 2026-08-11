import { QBoton, QIcono } from "@olula/componentes/index.js";
import { Nota } from "../diseño.ts";
import "./TabNotasLista.css";

export const TabNotasLista = ({
  notas,
  cargando,
  onBorrar,
}: {
  notas: Nota[];
  cargando: boolean;
  onBorrar: (nota: Nota) => void;
}) => {
  if (cargando) {
    return <div className="TabNotasLista">Cargando notas...</div>;
  }

  if (notas.length === 0) {
    return <div className="TabNotasLista">No hay notas</div>;
  }

  return (
    <div className="TabNotasLista">
      {notas.map((nota) => (
        <div key={nota.id} className="NotaItem">
          <div className="NotaTexto">{nota.texto}</div>
          <div className="NotaFooter">
            <div className="NotaMeta">
              <span className="NotaAgente">{nota.agenteId}</span>
              <span className="NotaFecha">
                {new Date(nota.fecha).toLocaleDateString("es-ES")}
              </span>
            </div>
            <QBoton
              tamaño="pequeño"
              variante="texto"
              destructivo
              onClick={() => onBorrar(nota)}
            >
              <QIcono nombre="eliminar" tamaño="md" />
            </QBoton>
          </div>
        </div>
      ))}
    </div>
  );
};
