import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { DirCliente } from "../diseño.ts";
import { actualizarDireccion } from "../infraestructura.ts";
import { metaDireccion } from "./dominio.ts";

export const CambiarDireccion = ({
  direccion,
  clienteId,
  publicar,
}: {
  direccion: DirCliente;
  clienteId: string;
  publicar: ProcesarEvento;
}) => {
  const direccionEditada = useModelo(metaDireccion, direccion);
  const focus = useFocus();

  const guardar_ = useCallback(async () => {
    await actualizarDireccion(clienteId, direccionEditada.modelo);
    publicar("direccion_actualizada");
  }, [direccionEditada.modelo, publicar, clienteId]);

  const cancelar_ = useCallback(
    () => publicar("edicion_cancelada"),
    [publicar]
  );

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  const opciones = [
    { valor: "Calle", descripcion: "Calle" },
    { valor: "Avenida", descripcion: "Avenida" },
    { valor: "Plaza", descripcion: "Plaza" },
    { valor: "Paseo", descripcion: "Paseo" },
    { valor: "Camino", descripcion: "Camino" },
    { valor: "Carretera", descripcion: "Carretera" },
  ];

  return (
    <div className="EdicionDireccion">
      <quimera-formulario>
        <div style={{ gridColumn: "span 2" }}>
          <QSelect
            label="Tipo de Vía"
            opciones={opciones}
            {...direccionEditada.uiProps("tipo_via")}
            ref={focus}
          />
        </div>
        <div style={{ gridColumn: "span 7" }}>
          <QInput
            label="Nombre de la Vía"
            {...direccionEditada.uiProps("nombre_via")}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput label="Número" {...direccionEditada.uiProps("numero")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label="Otros" {...direccionEditada.uiProps("otros")} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput
            label="Apdo. Correos"
            {...direccionEditada.uiProps("apartado")}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput
            label="Cód. Postal"
            {...direccionEditada.uiProps("cod_postal")}
          />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label="Ciudad" {...direccionEditada.uiProps("ciudad")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label="Provincia" {...direccionEditada.uiProps("provincia")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <PaisSelector
            label="País"
            nombre="direccion/pais_id"
            valor={direccionEditada.modelo.pais_id}
            onChange={(opcion) =>
              direccionEditada.set({
                ...direccionEditada.modelo,
                pais_id: opcion?.valor ?? "",
              })
            }
          />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label="Teléfono" {...direccionEditada.uiProps("telefono")} />
        </div>
      </quimera-formulario>
      <div className="botones maestro-botones">
        <QBoton deshabilitado={!direccionEditada.valido} onClick={guardar}>
          Guardar
        </QBoton>
        <QBoton tipo="reset" variante="texto" onClick={cancelar}>
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
