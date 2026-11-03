import { Field } from "@quimera/comps";
import { API } from "quimera/lib";
import React, { useCallback, useState } from "react";

import { default as Estatico } from "./estatico";
import schemas from "./schemas";

function Cliente({ filtros = [], id, estatico, ...props }) {
  const [options, setOptions] = useState([]);

  const getOptions = useCallback((text, key) => {
    const schema = schemas.clientes;
    const filtroBase = key ? [["codcliente", "eq", key]] : [["nombre", "like_ua", text ?? ""]];

    function construyeFiltro(filtroBasico, filtrosProp) {
      const clausulaBaja = filtrosProp?.incluir_baja ? [] : [["debaja", "eq", false]];

      return {
        and: [...filtroBasico, ...clausulaBaja],
      };
    }
    API("clientes")
      .get()
      .set("todoslosagentes", props.todoslosagentes)
      .select("codcliente,nombre,cifnif")
      .filter(construyeFiltro(filtroBase, filtros))
      .success(response => {
        setOptions(
          response.data
            .map(c => schema.load(c))
            .map(cliente => ({ key: cliente.codCliente, value: cliente.nombre, option: cliente })),
        );
      })
      .error(error => console.log("Error", error))
      .page({
        limit: 10000,
      })
      .go();
  }, []);

  return estatico ? (
    <Estatico id={id} {...props} />
  ) : (
    <Field.Select
      getOptions={getOptions}
      id={id}
      options={options}
      noOptionsText="Indica el nombre del cliente"
      {...props}
      async
    />
  );
}

export default Cliente;
