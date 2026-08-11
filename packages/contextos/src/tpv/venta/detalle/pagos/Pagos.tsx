import { PagoVentaTpv } from "#/tpv/venta/diseño.ts";
import { QBoton } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { PagosLista } from "./PagosLista.tsx";
export const Pagos = ({
  pagos,
  pagoActivo,
  publicar= async () => { },
}: {
  pagos: PagoVentaTpv[];
  pagoActivo: PagoVentaTpv | null;
  publicar?: EmitirEvento;

}) => {

  return (
    <>
      {pagoActivo?.arqueoAbierto && (
        <div className="botones maestro-botones ">
          <QBoton texto='Borrar'
            deshabilitado={!pagoActivo}
            onClick={() => publicar("borrar_pago_solicitado")}
          />
        </div>
      )}
      <PagosLista
        pagos={pagos}
        pagoActivo={pagoActivo}
        publicar={publicar}
      />
    </>
  );
};
