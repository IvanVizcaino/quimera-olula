import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ReciboDeRemesaPago } from "../../diseño.js";

const metaTablaRecibos: MetaTabla<ReciboDeRemesaPago> = [
  { id: "codigo", cabecera: "Código" },
  { id: "nombreProveedor", cabecera: "Proveedor" },
  { id: "fechaVencimiento", cabecera: "F. Vencimiento", tipo: "fecha" },
  { id: "estado", cabecera: "Estado" },
  { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

export const RecibosRemesaPago = ({ recibos }: { recibos: ReciboDeRemesaPago[] }) => (
  <div className="RecibosRemesaPago">
    <ListadoSemiControlado
      metaTabla={metaTablaRecibos}
      entidades={recibos}
      totalEntidades={recibos.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  </div>
);
