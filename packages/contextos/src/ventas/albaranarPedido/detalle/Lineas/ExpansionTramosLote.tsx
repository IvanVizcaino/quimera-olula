import { QBoton, QIcono, QInput, getIdUnico } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useContext } from "react";
import { LineaAlbaranarPedido, Tramo } from "../../diseño.ts";
import { calcularDisponible } from "../../dominio.ts";
import { patchCerrarLineaPedido } from "../../infraestructura.ts";
import "./ExpansionTramosLote.css";

export const ExpansionTramosLote = ({
  linea,
  pedidoId,
  publicar,
}: {
  linea: LineaAlbaranarPedido;
  pedidoId: string;
  publicar: ProcesarEvento;
}) => {
  const { intentar } = useContext(ContextoError);

  const tramos = linea.tramos ?? [];
  const disponible = calcularDisponible(linea);

  const toggleCerrada = async () => {
    if (!linea.id) return;
    const cerrada = !linea.cerrada;
    await intentar(() => patchCerrarLineaPedido(pedidoId, linea.id, cerrada));
    publicar("linea_cerrada_actualizada", { id: linea.id, cerrada });
  };

  const anadirTramo = () => {
    if (disponible <= 0) return;
    publicar("tramos_actualizados", {
      id: linea.id,
      tramos: [...tramos, { id: getIdUnico(), cantidad: disponible } as Tramo],
    });
  };

  const eliminarTramo = (tramoId: string) =>
    publicar("tramos_actualizados", {
      id: linea.id,
      tramos: tramos.filter((t) => String(t.id) !== String(tramoId)),
    });

  const cambiarCantidad = (tramo: Tramo, valor: string) => {
    const cantidad = Math.max(0, Number(valor) || 0);
    if (cantidad === tramo.cantidad) return;
    publicar("tramo_actualizado", { id: linea.id, tramo: { ...tramo, cantidad } });
  };

  return (
    <div className="ExpansionTramos">
      <div className="expansion-barra">
        <button
          type="button"
          className={`chip-estado ${linea.cerrada ? "cerrada" : "abierta"}`}
          onClick={toggleCerrada}
          title={linea.cerrada ? "Abrir línea" : "Cerrar línea"}
        >
          <QIcono
            nombre={linea.cerrada ? "candado" : "candado_abierto"}
            tamaño="sm"
          />
          {linea.cerrada ? "Línea cerrada" : "Línea abierta"}
        </button>
        <QBoton
          tamaño="pequeño"
          variante="borde"
          deshabilitado={linea.cerrada || disponible <= 0}
          onClick={anadirTramo}
        >
          {disponible > 0 ? `+ Añadir tramo (${disponible} disp.)` : "+ Añadir tramo"}
        </QBoton>
      </div>

      {tramos.length === 0 ? (
        <p className="expansion-vacia">
          Sin tramos. Pulsa «Aprobar» para enviar todo, o añade un tramo para
          enviar una cantidad parcial.
        </p>
      ) : (
        <ul className="lista-tramos">
          {tramos.map((tramo, i) => (
            <li key={tramo.id} className="fila-tramo">
              <span className="fila-tramo-num">#{i + 1}</span>
              <QInput
                label=""
                nombre={`tramo-cantidad-${tramo.id}`}
                tipo="numero"
                condensado
                opcional
                deshabilitado={linea.cerrada}
                valor={String(tramo.cantidad ?? "")}
                onBlur={(v) => cambiarCantidad(tramo, v)}
              />
              <button
                type="button"
                className="boton-borrar-tramo"
                onClick={() => eliminarTramo(tramo.id)}
                disabled={linea.cerrada}
                title="Eliminar tramo"
              >
                <QIcono nombre="eliminar" tamaño="sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
