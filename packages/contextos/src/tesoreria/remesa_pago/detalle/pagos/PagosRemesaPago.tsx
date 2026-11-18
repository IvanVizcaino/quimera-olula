import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { PagoRemesaPago, RemesaPago } from "../../diseño.js";
import { remesaPagoAdmitePagos, remesaPagoConPago, remesaPagoPagable } from "../../dominio.js";

const metaTablaPagos: MetaTabla<PagoRemesaPago> = [
  { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
];

export const PagosRemesaPago = ({
  remesa,
  publicar,
}: {
  remesa: RemesaPago;
  publicar: EmitirEvento;
}) => (
  <div className="PagosRemesaPago">
    {!remesaPagoAdmitePagos(remesa) && (
      <p className="sin-pagos">
        Con pago directo de remesas de pago los recibos se pagaron al remesarlos: la remesa
        no admite pagos.
      </p>
    )}
    <ListadoSemiControlado
      metaTabla={metaTablaPagos}
      entidades={remesa.pagos}
      totalEntidades={remesa.pagos.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
      renderAcciones={() => (
        <div className="maestro-botones">
          {remesaPagoPagable(remesa) && (
            <QBoton onClick={() => publicar("pago_solicitado")}>Pagar</QBoton>
          )}
          {remesaPagoConPago(remesa) && (
            <QBoton
              advertencia
              onClick={() => publicar("deshacer_pago_solicitado")}
            >
              Deshacer pago
            </QBoton>
          )}
        </div>
      )}
    />
  </div>
);
