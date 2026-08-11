import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { Lead } from "../../diseño.ts";
import { patchLead } from "../../infraestructura.ts";
import "./CambiarDireccionLead.css";

const metaDireccionLead: MetaModelo<Lead> = {
  campos: {
    direccion: { requerido: false },
    ciudad: { requerido: false },
    cod_postal: { requerido: false },
    provincia: { requerido: false },
    pais_id: { requerido: false },
    pais: { requerido: false },
  },
};

export const CambiarDireccionLead = ({
  lead,
  onCerrar,
}: {
  lead: HookModelo<Lead>;
  onCerrar: () => void;
}) => {
  const { modelo, uiProps, valido } = useModelo(metaDireccionLead, lead.modelo);

  const guardar_ = useCallback(async () => {
    await patchLead(lead.modelo.id, modelo);
    lead.init(modelo);
    onCerrar();
  }, [modelo, lead, onCerrar]);

  const [guardar, cancelar] = useForm(guardar_, onCerrar);

  return (
    <QModal
      abierto={true}
      nombre="cambiarDireccionLead"
      titulo="Dirección"
      onCerrar={cancelar}
    >
      <div className="CambiarDireccionLead">
        <quimera-formulario>
          <QInput label="Dirección" {...uiProps("direccion")} />
          <QInput label="Ciudad" {...uiProps("ciudad")} />
          <QInput label="Código Postal" {...uiProps("cod_postal")} />
          <QInput label="Provincia" {...uiProps("provincia")} />
          <PaisSelector label="País" {...uiProps("pais_id", "pais")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            Guardar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
