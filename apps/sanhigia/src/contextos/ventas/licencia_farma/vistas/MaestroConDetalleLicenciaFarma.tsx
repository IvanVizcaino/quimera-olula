import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { MetaTabla, QModal } from "@olula/componentes/index.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroTextos,
  getMetaFiltroDefecto,
  MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useLista } from "@olula/lib/useLista.ts";
import { Maquina, useMaquina } from "@olula/lib/useMaquina.ts";
import { useCallback, useEffect, useState } from "react";
import { CabeceraLicenciaFarma, LicenciaFarma } from "../diseño.ts";
import { getLicenciasFarma } from "../infraestructura.ts";
import { AltaLicenciaFarma } from "./AltaLicenciaFarma.tsx";
import { DetalleLicenciaFarma } from "./DetalleLicenciaFarma/DetalleLicenciaFarma.tsx";

const metaTablaLicenciaFarma: MetaTabla<CabeceraLicenciaFarma> = [
  { id: "tipoLicencia", cabecera: "Tipo" },
  { id: "fechaInicio", cabecera: "Fecha inicio", tipo: "fecha" },
  { id: "fechaCaducidad", cabecera: "Caducidad", tipo: "fecha" },
];

const metaFiltroLicenciaFarma: MetaFiltro = {
  ...getMetaFiltroDefecto(metaTablaLicenciaFarma),
  estado: {
    id: "estado",
    label: "Estado",
    tipo: "multiseleccion",
    opciones: [
      { valor: "En revisión", descripcion: "En revisión" },
      { valor: "Acuerdo por recibir", descripcion: "Acuerdo por recibir" },
      { valor: "Por presentar", descripcion: "Por presentar" },
      { valor: "Presentada", descripcion: "Presentada" },
    ],
    filtro: (valor) => {
      const opciones = valor as string[];
      if (!opciones?.length) return null;
      if (opciones.length === 1) return ["estado", "=", opciones[0]];
      return ["estado", "in", opciones.join("_")];
    },
  },
  nombreCliente: {
    id: "nombreCliente",
    label: "Cliente",
    tipo: "texto",
    filtro: (valor) => filtroTextos("nombreCliente", valor),
  },
  agenteId: {
    id: "agenteId",
    label: "Agente",
    tipo: "texto",
    fromFiltro: (filtro) => {
      const clausula = filtro.find(([campo]) => campo === "agente_id");
      return clausula ? clausula[2] : null;
    },
    filtro: (valor) => {
      const id = valor as string | null;
      if (!id) return null;
      return ["agente_id", "=", id];
    },
    render: (valor, onChange) => {
      return (
        <Agente
          valor={(valor as string) ?? ""}
          onChange={(o) => onChange(o ? o.valor : null)}
        />
      );
    },
  },
};

type Estado = "lista" | "alta";

export const MaestroConDetalleLicenciaFarma = () => {
  const [estado, setEstado] = useState<Estado>("lista");
  const [criteria, setCriteria] = useState<Criteria>(criteriaDefecto);
  const [cargando, setCargando] = useState(false);
  const [total, setTotal] = useState(0);
  const licencias = useLista<CabeceraLicenciaFarma>([]);

  const maquina: Maquina<Estado> = {
    alta: {
      LICENCIA_FARMA_CREADA: (payload: unknown) => {
        licencias.añadir(payload as CabeceraLicenciaFarma);
        return "lista";
      },
      ALTA_CANCELADA: "lista",
    },
    lista: {
      ALTA_INICIADA: "alta",
      LICENCIA_FARMA_CAMBIADA: (payload: unknown) => {
        licencias.modificar(payload as CabeceraLicenciaFarma);
      },
      LICENCIA_FARMA_BORRADA: (payload: unknown) => {
        licencias.eliminar(payload as CabeceraLicenciaFarma);
        return "lista";
      },
      CANCELAR_SELECCION: () => {
        licencias.limpiarSeleccion();
      },
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  const recargar = useCallback(
    async (nuevaCriteria: Criteria) => {
      setCriteria(nuevaCriteria);
      setCargando(true);
      const { datos, total } = await getLicenciasFarma(
        nuevaCriteria.filtro,
        nuevaCriteria.orden,
        nuevaCriteria.paginacion
      );
      licencias.setLista(datos);
      if (total >= 0) setTotal(total);
      setCargando(false);
    },
    [licencias]
  );

  useEffect(() => {
    void recargar(criteriaDefecto);
  }, []);

  return (
    <div className="LicenciaFarma">
      <MaestroDetalle<LicenciaFarma>
        modoDisposicion="maestro-50"
        seleccionada={licencias.seleccionada?.id}
        Maestro={
          <>
            <h2>Licencias Farma</h2>
            <div className="maestro-botones">
              {/* <QBoton onClick={() => emitir("ALTA_INICIADA")}>Nueva</QBoton> */}
            </div>
            <Listado<CabeceraLicenciaFarma>
              metaTabla={metaTablaLicenciaFarma}
              metaFiltro={metaFiltroLicenciaFarma}
              criteria={criteria}
              criteriaInicial={criteriaDefecto}
              cargando={cargando}
              entidades={licencias.lista}
              totalEntidades={total}
              seleccionada={licencias.seleccionada?.id}
              onSeleccion={(id) => {
                const item = licencias.lista.find((l) => l.id === id);
                if (item) licencias.seleccionar(item);
              }}
              onCriteriaChanged={(nuevaCriteria) =>
                void recargar(nuevaCriteria)
              }
            />
          </>
        }
        Detalle={
          <DetalleLicenciaFarma
            licenciaInicial={licencias.seleccionada}
            emitir={emitir}
          />
        }
      />
      <QModal
        nombre="modal"
        abierto={estado === "alta"}
        onCerrar={() => emitir("ALTA_CANCELADA")}
      >
        <AltaLicenciaFarma emitir={emitir} />
      </QModal>
    </div>
  );
};
