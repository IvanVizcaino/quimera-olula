import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { PickingFijo } from "../../picking_fijo/diseño.ts";
import { getPickingsFijos } from "../../picking_fijo/infraestructura.ts";

/** Huecos de picking fijo de un artículo. */
export const ListaPickingFijoArticulo = ({ articuloId }: { articuloId: string }) => {
  const [huecos, setHuecos] = useState<PickingFijo[]>([]);

  useEffect(() => {
    let vigente = true;
    getPickingsFijos({ ...criteriaDefecto, filtro: [["articulo_id", "=", articuloId]] })
      .then((r) => vigente && setHuecos(r.datos))
      .catch(() => vigente && setHuecos([]));
    return () => {
      vigente = false;
    };
  }, [articuloId]);

  if (huecos.length === 0) return null;

  return (
    <div className="ListaPickingFijoArticulo">
      <h4>Picking fijo</h4>
      <table>
        <thead>
          <tr>
            <th>Ubicación</th>
            <th>Mín.</th>
            <th>Máx.</th>
            <th>Unidad</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {huecos.map((h) => (
            <tr key={h.id}>
              <td>{h.ubicacion}</td>
              <td>{h.minimo}</td>
              <td>{h.maximo}</td>
              <td>{h.unidadReposicion}</td>
              <td>{h.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
