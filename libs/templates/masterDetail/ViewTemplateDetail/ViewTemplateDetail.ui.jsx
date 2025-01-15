import { Box, QBox, QBoxButton, QListModel, QModelBox, QSection } from "@quimera/comps";
import { Totales } from "@quimera-extension/base-area_clientes";
import Quimera, { getSchemas, PropValidation, useStateValue, useWidth, util } from "quimera";
import React, { useCallback, useEffect } from "react";

import {
  LineaAlbaranCliComp,
} from "../../comps";
import {
  DocAgente,
  DocClienteYDir,
  DocDirCliente,
  DocFecha,
} from "@quimera-extension/base-ventas";

function AlbaranCli({ callbackChanged, initAlbaran, useStyles }) {
  const [{ lineas, logic, albaran, vistaDetalle }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    util.publishEvent(albaran.event, callbackChanged);
  }, [albaran.event.serial]);

  useEffect(() => {
    console.log("onInitAlbaranChanged useffecting", initAlbaran);
    dispatch({
      type: "onInitAlbaran",
      payload: {
        initAlbaran,
      },
    });
  }, [initAlbaran]);

  // Necesario para que no salte el useEffect de onInit en cada render de LineaAlbaranCliNueva
  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().albaranescli;
  // const editable = logic.albaranEditable(albaran.data);
  const editable = true;

  if (!initAlbaran || initAlbaran?._status === "deleted") {
    return null;
  }
  console.log("PAlbaran", albaran);

  return (
    <Quimera.Template id="AlbaranDetalle">
      {albaran && (
        <QBox
          width={anchoDetalle}
          titulo={`Albaran ${albaran.data.codigo}`}
          botonesCabecera={[
            { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              <QBoxButton
                id="deleteAlbaran"
                title="Borrar albaran"
                icon="delete"
                disabled={!editable}
              />
              <Quimera.Block id="sideButtons" />
            </>
          }
        >
          <QModelBox id="albaran.buffer" disabled={!editable} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box>
                <DocClienteYDir />
                <DocDirCliente />
                <Quimera.Block id="afterDireccion" />
                <Box display="flex" justifyContent="space-between">
                  <DocFecha />
                  <QSection actionPrefix="totales" alwaysInactive>
                    <Totales
                      totales={[
                        { name: "Neto", value: albaran.buffer.neto },
                        { name: "Total IVA", value: albaran.buffer.totalIva },
                        { name: "Total", value: albaran.buffer.total },
                      ]}
                    />
                  </QSection>
                </Box>
                {editable && (
                  <Quimera.View
                    id="LineaAlbaranCliNueva"
                    idAlbaran={albaran.data.idAlbaran}
                    inline
                    callbackGuardada={callbackNuevaLinea}
                  />
                )}
                <QListModel
                  data={lineas}
                  title="Líneas"
                  modelName="lineas"
                  ItemComponent={LineaAlbaranCliComp}
                  itemProps={{
                    variant: "section",
                  }}
                  disabled={!editable}
                />
                <Quimera.Block id="afterLineas" />
              </Box>
            ) : (
              <Box width={1}>
                <DocAgente />
              </Box>
            )}
          </QModelBox>
        </QBox>
      )}
    </Quimera.Template>
  );
}

AlbaranCli.propTypes = PropValidation.propTypes;
AlbaranCli.defaultProps = PropValidation.defaultProps;
export default AlbaranCli;
