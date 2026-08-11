import { Box, Column, Table } from "@quimera/comps";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useRef } from "react";

function ComparativaArticulos({ useStyles }) {
  const [
    {
      anyoUno,
      anyoDos,
      artiComparativa,
      cliComparativa,
      idCliente,
      ordenArtComparativa,
      paginaArt,
      trimestre,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const ultimaLongitudPaginada = useRef(-1);

  const onScrollTablaArticulos = event => {
    if (paginaArt.next === null) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const cercaDelFinal = scrollHeight - scrollTop - clientHeight < 100;
    if (cercaDelFinal && ultimaLongitudPaginada.current !== artiComparativa.length) {
      ultimaLongitudPaginada.current = artiComparativa.length;
      dispatch({ type: "onMostrarSiguienteArtClicked" });
    }
  };

  const nombreCliente = cliComparativa.find(c => c.codCliente === idCliente)?.nombreCliente ?? "";
  const cabecera = `Cliente: ${nombreCliente ? nombreCliente : ""}; Año 1: ${
    anyoUno ? anyoUno : ""
  }; Año 2: ${anyoDos ? anyoDos : ""}; ${
    trimestre ? `Trimestre: ${trimestre}` : "Todos los trimestres"
  }`;

  return (
    <Quimera.Template id="ComparativaArticulos">
      <Box m={1} className={classes.cajaInfo}>
        {cabecera}
      </Box>
      <Box
        id="scrollableTablaArticulosComparativa"
        style={{ height: `calc(100vh - 350px)`, overflow: "auto" }}
        onScroll={onScrollTablaArticulos}
      >
        <Table
          id="tdbArticulosComparativa"
          idField="referencia"
          data={artiComparativa}
          clickMode="line"
          orderColumn={ordenArtComparativa}
          next={() => dispatch({ type: "onMostrarSiguienteArtClicked" })}
          hasMore={paginaArt.next !== null}
          bgcolorRowFunction={cliente =>
            cliente.cantidadDos > cliente.cantidadUno ? "#ace1af" : "#fa8072"
          }
        >
          <Column.Text id="referencia" header="Referencia" order="referencia" pl={2} width={120} />
          <Column.Text id="descripcion" header="Descripción" order="descripcion" flexGrow={2} />
          <Column.Decimal
            id="cantidadUno"
            header="Cantidad 1"
            order="cantidadUno"
            width={120}
            decimals={0}
          />
          <Column.Decimal
            id="cantidadDos"
            header="Cantidad 2"
            order="cantidadDos"
            width={120}
            decimals={0}
          />
        </Table>
      </Box>
    </Quimera.Template>
  );
}

export default ComparativaArticulos;
