import { LineaPedido } from "#/ventas/pedido/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal, QTextArea } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Calibre } from "../../comun/componentes/Calibre.tsx";
import { Marca } from "../../comun/componentes/Marca.tsx";
import { TipoPalet } from "../../comun/componentes/TipoPalet.tsx";
import { Variedad } from "../../comun/componentes/Variedad.tsx";
import { getItemsListaTipoPalet } from "../../tipo_palet/infraestructura.ts";
import { formateaCategoria } from "../dominio.ts";
import "./CambiarLinea.css";
import {
  FormEditarLineaDefecto,
  metaEditarLinea,
  patchLineaNrj,
} from "./cambiar_linea.ts";

export const CambiarLineaNrj = ({
  pedidoId,
  publicar,
  linea,
}: {
  pedidoId: string;
  linea: LineaPedido;
  publicar: ProcesarEvento;
}) => {
  const { intentar } = useContext(ContextoError);
  const formEditarLineaInicial = useMemo(
    () => ({
      ...FormEditarLineaDefecto,
      ...linea,
    }),
    [linea]
  );

  const { modelo, uiProps, valido, set } = useModelo(
    metaEditarLinea,
    formEditarLineaInicial
  );

  const [cambiando, setCambiando] = useState(false);

  const cambiar = useCallback(async () => {
    await intentar(() => patchLineaNrj(pedidoId, linea.id, modelo));
    setCambiando(true);
    publicar("linea_actualizada");
  }, [intentar, linea.id, modelo, pedidoId, publicar]);

  const cancelar = useCallback(() => {
    if (!cambiando) publicar("editar_linea_cancelado");
  }, [cambiando, publicar]);

  useEffect(() => {
    if (!linea.idTipoPalet) return;
    getItemsListaTipoPalet(criteriaDefecto).then((items) => {
      const item = items.find((i) => i.id === linea.idTipoPalet);
      if (item && item.cantidadEnvase !== modelo.envasesPorPalet) {
        set({ ...modelo, envasesPorPalet: item.cantidadEnvase });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linea.idTipoPalet]);

  const focus = useFocus();
  const cantidadEnvasesNominal = modelo.cantidadPalets * modelo.envasesPorPalet;

  return (
    <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>
      <div className="EditarLinea">
        <h2>Editar línea NRJ</h2>

        <quimera-formulario>
          <TipoPalet
            label="Tipo Palet"
            {...uiProps("idTipoPalet", "palet")}
            ref={focus}
          />
          <Variedad label="Variedad" {...uiProps("idVariedad", "variedad")} />
          <Marca
            label="Marca"
            {...uiProps("idMarca", "marca")}
            idVariedad={modelo.idVariedad}
          />
          <Calibre
            label="Calibre"
            {...uiProps("idCalibre", "calibre")}
            idVariedad={modelo.idVariedad}
            idMarca={modelo.idMarca}
          />
          <QInput
            key={modelo.categoria}
            label="Categoria"
            nombre="categoria"
            valor={modelo.categoria ? formateaCategoria(modelo.categoria) : ""}
            deshabilitado={true}
          />
          <QInput
            label="Cantidad Palets"
            {...uiProps("cantidadPalets")}
            nombre="cantidadPalets"
          />
          <div id="espacio4">
            {`Envases por palet: ${modelo.envasesPorPalet}`}
          </div>
          <div id="espacio4">
            {`Cantidad Envases Nominal: ${cantidadEnvasesNominal}`}
          </div>
          <div id="espacio4" />
          <div id="espacio4" />
          <QInput
            label="Cantidad Envases"
            {...uiProps("cantidadEnvases")}
            nombre="cantidadEnvases"
          />
          <QTextArea label="Observaciones" {...uiProps("observaciones")} />
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton texto="Guardar" onClick={cambiar} deshabilitado={!valido} />
        </div>
      </div>
    </QModal>
  );
};
