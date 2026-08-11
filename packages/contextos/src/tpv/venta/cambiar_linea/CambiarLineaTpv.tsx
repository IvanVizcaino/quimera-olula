import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QCheckbox, QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { LineaFactura, VentaTpv } from "../diseño.ts";
import { metaLineaFactura } from "../dominio.ts";
import { patchLinea } from "../infraestructura.ts";
import "./CambiarLineaTpv.css";

export const CambiarLineaTpv = ({
  publicar,
  venta,
  linea,
}: {
  linea: LineaFactura;
  venta: VentaTpv;
  publicar: EmitirEvento;
}) => {
  const { intentar } = useContext(ContextoError);

  const { modelo, uiProps, valido } = useModelo(metaLineaFactura, linea);

  const [cambiando, setCambiando] = useState(false);

  const cambiar = useCallback(
    async () => {
      await intentar(() => patchLinea(venta.id, modelo));
      setCambiando(true);
      publicar("linea_cambiada", linea);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelo, publicar, venta.id]
  );

  const cancelar = useCallback(() => {
    if (!cambiando) publicar("cambio_de_linea_cancelado");
  }, [cambiando, publicar]);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Cambiar línea"
      onCerrar={cancelar}
    >
      <div className="CambiarLineaTpv">
        <quimera-formulario>
          <div id="titulo">
            <h3>{`${linea.descripcion}`}</h3>
            {`Ref: ${linea.referencia}`}
          </div>

          <QInput label="Cantidad" {...uiProps("cantidad")} />

          <QInput label="Precio" {...uiProps("pvp_unitario")} />

          <QInput label="% Descuento" {...uiProps("dto_porcentual")} />

          <QInput label="Dto. Lineal" {...uiProps("dto_lineal")} />

          <QCheckbox label="IVA incluido" {...uiProps("iva_incluido")} />
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            Cambiar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
