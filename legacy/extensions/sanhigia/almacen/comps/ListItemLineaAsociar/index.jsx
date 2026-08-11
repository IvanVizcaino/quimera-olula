import { Column, Table } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Checkbox, FormControlLabel } from "@quimera/thirdparty";
import { useStateValue } from "quimera";
import React from "react";

const useStyles = makeStyles(theme => ({}));

function ListItemLineaAsociar({ disabled, dispatch, lineas, hideSecondary = false, selected = false, ...props }) {
  const classes = useStyles();
  const [{ selectedAsociar }] = useStateValue();
  // console.log("selectedItem", selectedLote);
  // console.log(lineas);

  return (
    <Table id="tdbClientes" data={lineas}>
      <Column.Action
        id="marcarLote"
        width={35}
        value={linea => (
          <FormControlLabel
            style={{ margin: "0px", padding: "0px" }}
            labelPlacement="start"
            control={
              <Checkbox
                color="default"
                checked={linea.idLinea === selectedAsociar ? true : false}
                onClick={() =>
                  dispatch({
                    type: "onAsociarItemSelected",
                    payload: { item: linea.idLinea },
                  })
                }
              />
            }
          />
        )}
      />
      <Column.Text
        id="referencia"
        header="Referencia"
        value={linea => linea.referencia}
        width={100}
      />
      <Column.Text
        id="descripcion"
        header="Descripción"
        value={linea => linea.descripcion}
        width={500}
      />
      <Column.Text
        id="referenciaProv"
        header="referencia Prov."
        value={linea => linea.referenciaProv}
        width={180}
      />
    </Table>
  );
}

export default React.memo(ListItemLineaAsociar);
