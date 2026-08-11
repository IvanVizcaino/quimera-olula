import { PuntoVentaTpv as CompPuntoVentaTpv } from "#/tpv/comun/componentes/PuntoVentaTpv.tsx";
import { puntoVentaLocal } from "#/tpv/comun/infraestructura.ts";
import { QBoton } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo, useState } from "react";
import { PuntoVentaTpv } from "../diseño.ts";
import "./PuntoVentaTpvActual.css";
import { metaCambioPuntoVentaActual } from "./punto_actual.ts";

const miPuntoVentaLocal = puntoVentaLocal.obtenerSeguro();
export const PuntoVentaTpvActual = ({
  onChange,
}:{
  onChange?: () => void
}) => {

  const [cambiando, setCambiando] = useState(false);
  const [punto, setPunto] = useState<PuntoVentaTpv | null>(miPuntoVentaLocal);

  const cambiarPuntoVenta = async (punto: PuntoVentaTpv) => {

    const puntoAnterior = puntoVentaLocal.obtenerSeguro();
    puntoVentaLocal.actualizar(punto);
    setPunto(punto);
    setCambiando(false);
    if (onChange && (!puntoAnterior || punto.id !== puntoAnterior.id)) {
      onChange();
    }
  };

  return (
    <div className="AgenteActual">
      {cambiando ? (
        <CambiarPuntoVentaTpv
          puntoActual={punto}
          cambiar={cambiarPuntoVenta}
          cancelar={() => setCambiando(false)}
        />
      ) : (
        <div className="inactivo">
          <h2>{punto?.nombre ?? ""} </h2>
          <QBoton
            texto="..."
            onClick={() => setCambiando(true)}
            tamaño="pequeño"
          />
        </div>
      )}
    </div>
  );
};

const CambiarPuntoVentaTpv = ({
  puntoActual,
  cambiar,
  cancelar,
}: {
  puntoActual: PuntoVentaTpv | null;
  cambiar: (punto: PuntoVentaTpv) => void;
  cancelar: () => void;
}) => {

  const puntoInicial = useMemo(
    () => ({
      idPunto: puntoActual?.id ?? null,
      nombre: puntoActual?.nombre ?? null,
      punto: puntoActual,
    }),
    [puntoActual]
  )
  const { modelo, uiProps, valido } = useModelo(metaCambioPuntoVentaActual, puntoInicial);

  const focus = useFocus();

  const cambiarPuntoVenta = () => {
    cambiar(modelo.punto!);
  };

  return (
    <div className="seccion-activa">
      <quimera-formulario>
        <CompPuntoVentaTpv
          {...uiProps("idPunto", "nombre")}
          nombre="punto_venta_id"
          ref={focus}
        />
      </quimera-formulario>

      <div className="maestro-botones">
        <QBoton texto="Cancelar" onClick={cancelar} />
        <QBoton
          texto="Cambiar"
          onClick={cambiarPuntoVenta}
          deshabilitado={!valido}
        />
      </div>
    </div>
  );
};
