import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { postDireccion } from "../infraestructura.ts";
import { metaNuevaDireccion, nuevaDireccionVacia } from "./dominio.ts";

export const CrearDireccion = ({
  clienteId,
  publicar,
}: {
  clienteId: string;
  publicar: ProcesarEvento;
}) => {
  const { intentar } = useContext(ContextoError);
  const { modelo, uiProps, valido, set } = useModelo(
    metaNuevaDireccion,
    nuevaDireccionVacia
  );
  const [creando, setCreando] = useState(false);
  const focus = useFocus();

  const guardar = useCallback(async () => {
    await intentar(() => postDireccion(clienteId, modelo));
    setCreando(true);
    publicar("direccion_creada");
  }, [modelo, publicar, clienteId, intentar]);

  const cancelar = useCallback(() => {
    if (!creando) publicar("alta_cancelada");
  }, [creando, publicar]);

  return (
    <div className="CrearDireccion">
      <quimera-formulario>
        <QInput label="Tipo de Vía" {...uiProps("tipo_via")} ref={focus} />
        <QInput label="Nombre de la Vía" {...uiProps("nombre_via")} />
        <QInput label="Número" {...uiProps("numero")} />
        <QInput label="Otros" {...uiProps("otros")} />
        <QInput label="Apdo. Correos" {...uiProps("apartado")} />
        <QInput label="Cód. Postal" {...uiProps("cod_postal")} />
        <QInput label="Ciudad" {...uiProps("ciudad")} />
        <QInput label="Provincia" {...uiProps("provincia")} />
        <PaisSelector
          label="País"
          nombre="direccion/pais_id"
          valor={modelo.pais_id}
          onChange={(opcion) =>
            set({ ...modelo, pais_id: opcion?.valor ?? "" })
          }
        />
        <QInput label="Teléfono" {...uiProps("telefono")} />
      </quimera-formulario>
      <div className="botones maestro-botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          Guardar
        </QBoton>
        <QBoton tipo="reset" variante="texto" onClick={cancelar}>
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
