import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ListaSeleccionable } from "@olula/lib/diseño.ts";
import {
  cargar,
  incluirItem,
  listaSeleccionableVacia,
  quitarItem,
  seleccionarItem,
} from "@olula/lib/entidad.ts";
import { pipe } from "@olula/lib/funcional.ts";
import {
  ConfigMaquina4,
  Maquina3,
  useMaquina4,
} from "@olula/lib/useMaquina.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect } from "react";
import { OportunidadVenta } from "../../../oportunidadventa/diseño.ts";
import { metaTablaOportunidadVenta } from "../../../oportunidadventa/dominio.ts";
import { AltaOportunidadVenta } from "../../../oportunidadventa/vistas/AltaOportunidadVenta.tsx";
import { BajaOportunidadVenta } from "../../../oportunidadventa/vistas/BajaOportunidadVenta.tsx";
import { Cliente } from "../../diseño.ts";
import { getOportunidadesVentaCliente } from "../../infraestructura.ts";

type Estado = "Inactivo" | "Creando" | "Borrando" | "Cargando";

type Contexto = {
  oportunidades: ListaSeleccionable<OportunidadVenta>;
};

const setAcciones =
  (
    aplicable: (
      oportunidades: ListaSeleccionable<OportunidadVenta>
    ) => ListaSeleccionable<OportunidadVenta>
  ) =>
  (maquina: Maquina3<Estado, Contexto>) => {
    return {
      ...maquina,
      contexto: {
        ...maquina.contexto,
        oportunidades: aplicable(maquina.contexto.oportunidades),
      },
    };
  };

const configMaquina: ConfigMaquina4<Estado, Contexto> = {
  inicial: {
    estado: "Inactivo",
    contexto: {
      oportunidades: listaSeleccionableVacia<OportunidadVenta>(),
    },
  },
  estados: {
    Cargando: {
      oportunidades_cargadas: ({ maquina, payload, setEstado }) =>
        pipe(
          maquina,
          setEstado("Inactivo"),
          setAcciones(cargar(payload as OportunidadVenta[]))
        ),
    },
    Inactivo: {
      crear: "Creando",
      borrar: "Borrando",
      oportunidad_seleccionada: ({ maquina, payload }) =>
        pipe(
          maquina,
          setAcciones(seleccionarItem(payload as OportunidadVenta))
        ),
      cargar: "Cargando",
    },
    Creando: {
      oportunidad_creada: ({ maquina, payload, setEstado }) =>
        pipe(
          maquina,
          setEstado("Inactivo"),
          setAcciones(incluirItem(payload as OportunidadVenta, {}))
        ),
      creacion_cancelada: "Inactivo",
    },
    Borrando: {
      oportunidad_borrada: ({ maquina, setEstado }) => {
        const idActivo = maquina.contexto.oportunidades.idActivo;
        if (!idActivo) {
          return maquina;
        }
        return pipe(
          maquina,
          setEstado("Inactivo"),
          setAcciones(quitarItem(idActivo))
        );
      },
      borrado_cancelado: "Inactivo",
    },
  },
};

export const TabOportunidades = ({
  cliente,
}: {
  cliente: HookModelo<Cliente>;
}) => {
  const { intentar } = useContext(ContextoError);

  const idCliente = cliente.modelo.id;

  const [emitir, { estado, contexto }] = useMaquina4<Estado, Contexto>({
    config: configMaquina,
  });
  const { oportunidades } = contexto;

  useEffect(() => {
    const cargarOportunidades = async () => {
      const nuevasOportunidades = await intentar(() =>
        getOportunidadesVentaCliente(idCliente)
      );
      emitir("oportunidades_cargadas", nuevasOportunidades);
    };
    emitir("cargar");
    cargarOportunidades();
  }, [emitir, idCliente, intentar]);

  return (
    <div className="TabOportunidades">
      <div className="TabOportunidadesOportunidades maestro-botones">
        <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>

        <QBoton
          onClick={() => emitir("borrar")}
          deshabilitado={!oportunidades.idActivo}
        >
          Borrar
        </QBoton>
      </div>

      <AltaOportunidadVenta
        emitir={emitir}
        activo={estado === "Creando"}
        key={cliente.modelo.id}
        idCliente={cliente.modelo.id}
      />

      <BajaOportunidadVenta
        emitir={emitir}
        activo={estado === "Borrando"}
        idOportunidadVenta={oportunidades.idActivo || undefined}
      />

      <QTabla
        metaTabla={metaTablaOportunidadVenta}
        datos={oportunidades.lista}
        cargando={estado === "Cargando"}
        seleccionadaId={oportunidades.idActivo || undefined}
        onSeleccion={(oportunidadventa) =>
          emitir("oportunidad_seleccionada", oportunidadventa)
        }
        orden={["id", "ASC"]}
        onOrdenar={() => null}
      />
    </div>
  );
};
