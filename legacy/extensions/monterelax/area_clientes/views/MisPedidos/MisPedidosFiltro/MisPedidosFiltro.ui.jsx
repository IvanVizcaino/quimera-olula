import { Filter, FilterBox } from "@quimera/comps";
import Quimera, { getSchemas, PropValidation, useStateValue } from "quimera";
import React from "react";

function MisPedidosFiltro() {
  const [{ filtroVisible }, dispatch] = useStateValue();

  return (
    <Quimera.Template id="MisPedidosFiltro">
      <FilterBox id="pedidos.filter" schema={getSchemas().misPedidos} open={filtroVisible}
        initialFilter={{
          servido: {
            value: "No",
            filter: ["servido", "eq", "No"],
          },
        }}
      >
        <Filter.Schema id="referencia" label="Referencia de cliente" />
        <Filter.Schema id="servido" label="Servido" />
      </FilterBox>
    </Quimera.Template>
  );
}

export default MisPedidosFiltro;
