import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.js";
import "./AltaRapida.css";
import { metaAltaRapida, nuevaAltaRapidaVacia } from "./alta_rapida.ts";

export const AltaRapida = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, init } = useModelo(metaAltaRapida, nuevaAltaRapidaVacia);

  const focus = useFocus();

  const altaRapida = (barcode: string) => {
    if (modelo.cantidad !== 0) {
      publicar("alta_de_linea_por_barcode_lista", { barcode, cantidad: modelo.cantidad });
      init(nuevaAltaRapidaVacia);
    }
  };

  return (
    <div className="alta-rapida">
      <QInput label="Cantidad" {...uiProps("cantidad")} />
      <QInput
        label="Barcode"
        {...uiProps("barcode")}
        onEnterKeyUp={altaRapida}
        ref={focus}
      />
    </div>
  );
};
