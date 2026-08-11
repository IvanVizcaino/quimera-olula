import {
  criteriaLineasDefecto,
  LineasListaProps,
} from "#/ventas/pedido/detalle/lineas/LineasLista.tsx";
import {
  ListadoSemiControlado,
  QuimeraAcciones,
} from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.js";
import { LineaPedidoNrj } from "../../diseño.ts";
import { formateaCategoria, formateaEstado } from "../../dominio.ts";
import "./LineasLista.css";
export const LineasListaNrj = ({
  lineas,
  seleccionada,
  // onCambioCantidad,
  pedidoEditable,
  // cantidadEditable = false,
  acciones,
  publicar,
}: LineasListaProps<LineaPedidoNrj>) => {
  const setSeleccionada = (linea: LineaPedidoNrj) => {
    if (!pedidoEditable) return;
    publicar("linea_seleccionada", linea);
  };

  return (
    <ListadoSemiControlado
      metaTabla={getMetaTablaLineas()}
      tarjeta={(linea) => (
        <TarjetaLineaNrj
          linea={linea}
          // cantidadEditable={cantidadEditable}
          // onCambioCantidad={onCambioCantidad}
        />
      )}
      entidades={lineas}
      totalEntidades={lineas.length}
      seleccionada={lineas.find((linea) => linea.id === seleccionada) ?? null}
      onSeleccion={setSeleccionada}
      criteriaInicial={criteriaLineasDefecto}
      onCriteriaChanged={(_: Criteria) => null}
      renderAcciones={() =>
        acciones && acciones.length > 0 ? (
          <div className="botones maestro-botones ">
            <QuimeraAcciones acciones={acciones} />
          </div>
        ) : null
      }
    />
  );
};

// export const LineasListaNrj = ({
//   lineas,
//   seleccionada,
//   publicar,
// }: LineasListaProps<LineaPedidoNrj>) => {
//   const esMovil = useEsMovil();

//   const setSeleccionada = (linea: LineaPedidoNrj) => {
//     publicar("linea_seleccionada", linea);
//   };

//   return (
//     <>
//       {!esMovil ? (
//         <QTabla
//           metaTabla={getMetaTablaLineas()}
//           datos={lineas as LineaPedidoNrj[]}
//           cargando={false}
//           seleccionadaId={seleccionada}
//           onSeleccion={setSeleccionada}
//           orden={["id", "ASC"]}
//           onOrdenar={(_: string) => null}
//         />
//       ) : (
//         <div className="lineas-tarjetas">
//           {(lineas as LineaPedidoNrj[]).map((linea) => (
//             <TarjetaLineaNrj
//               key={linea.id}
//               linea={linea}
//               seleccionada={seleccionada === linea.id}
//               onClick={() => setSeleccionada(linea)}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

const TarjetaLineaNrj = ({
  linea,
  // seleccionada,
  // onClick,
}: {
  linea: LineaPedidoNrj;
  // seleccionada: boolean;
  // onClick: () => void;
}) => (
  <div className="tarjeta-linea">
    <div className="tarjeta-linea-estado">
      {formateaEstado(String(linea.estado_palets ?? ""))}
    </div>
    <div className="tarjeta-linea-cuerpo">
      <div className="tarjeta-linea-principal">
        <span className="tarjeta-linea-variedad">{linea.descVariedad}</span>
        <span className="tarjeta-linea-marca">{linea.descMarca}</span>
        <span className="tarjeta-linea-calibre">{linea.descCalibre}</span>
        <span className="tarjeta-linea-categoria">
          {formateaCategoria(linea.categoria)}
        </span>
      </div>
      <div className="tarjeta-linea-secundario">
        <span>{linea.descPalet}</span>
        <span>{linea.descEnvase}</span>
      </div>
    </div>
    <div className="tarjeta-linea-cantidades">
      <CantidadEnvasesLinea linea={linea} />
      <span className="tarjeta-linea-total">{linea.cantidadEnvases}</span>
    </div>
  </div>
);

const CantidadEnvasesLinea = ({ linea }: { linea: LineaPedidoNrj }) => (
  <span className="tarjeta-linea-cantidad-envases">
    {`Cantidad de envases: ${linea.cantidadEnvasesAsignados ?? 0}`}
  </span>
);

/*
const AsignacionesLinea = ({ linea }: { linea: LineaPedidoNrj }) => {
  const [mostrando, setMostrando] = useState(false);

  return linea.cantidadEnvasesAsignados ? (
    <div>
      <QBoton
        texto={`${linea.cantidadEnvasesAsignados}`}
        tamaño="pequeño"
        onClick={() => setMostrando(true)}
      />
      <QModal
        abierto={mostrando}
        nombre="mostrar"
        onCerrar={() => setMostrando(false)}
      >
        <div className="CrearLinea">
          <h2>Asignaciones</h2>
          <QTabla
            metaTabla={getMetaTablaPalets()}
            datos={linea.palets}
            cargando={false}
            orden={["id", "ASC"]}
            onOrdenar={(_: string) => null}
          />
        </div>
      </QModal>
    </div>
  ) : (
    <span>0</span>
  );
};
*/

const getMetaTablaLineas = () => {
  return [
    {
      id: "id",
      cabecera: "Línea",
    },
    {
      id: "estado_palets",
      cabecera: "Estado",
      render: (linea: LineaPedidoNrj) =>
        formateaEstado(String(linea.estado_palets ?? "")),
    },
    {
      id: "descVariedad",
      cabecera: "Variedad",
    },
    {
      id: "descMarca",
      cabecera: "Marca",
    },
    {
      id: "descCalibre",
      cabecera: "Calibre",
    },
    {
      id: "categoria",
      cabecera: "Categoría",
      render: (linea: LineaPedidoNrj) => formateaCategoria(linea.categoria),
    },
    {
      id: "descPalet",
      cabecera: "Palet",
    },
    {
      id: "descEnvase",
      cabecera: "Envase",
    },
    {
      id: "cantidad",
      cabecera: "Cantidad de envases",
      tipo: "numero" as const,
    },
    {
      id: "cantidad_envases_asignados",
      cabecera: "Cantidad de envases",
      tipo: "numero" as const,
      // Si en el futuro vuelve a habilitarse el sumatorio por palets,
      // sustituir esta renderización por `AsignacionesLinea({ linea })`.
      render: (linea: LineaPedidoNrj) => linea.cantidadEnvasesAsignados ?? 0,
    },
  ];
};

/*
const getMetaTablaPalets = () => {
  return [
    {
      id: "cantidadEnvases",
      cabecera: "Envases",
      tipo: "numero" as const,
    },
  ];
};
*/
