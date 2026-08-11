import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import {
  Detalle,
  QBoton,
  QDate,
  QInput,
  QModalConfirmacion,
  QSelect,
} from "@olula/componentes/index.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useState } from "react";
import { useParams } from "react-router";
import { CabeceraLicenciaFarma } from "../../diseño.ts";
import { licenciaFarmaVacia, metaLicenciaFarma } from "../../dominio.ts";
import {
  deleteLicenciaFarma,
  getLicenciaFarma,
  marcarDatosRevisados,
  patchLicenciaFarma,
} from "../../infraestructura.ts";
import "./DetalleLicenciaFarma.css";

export const DetalleLicenciaFarma = ({
  licenciaInicial = null,
  emitir = async () => {},
}: {
  licenciaInicial?: CabeceraLicenciaFarma | null;
  emitir?: ProcesarEvento;
}) => {
  const params = useParams();
  const licenciaId = licenciaInicial?.id ?? params.id;
  const titulo = (licencia: Entidad) => licencia.nombreCliente as string;
  const { intentar } = useContext(ContextoError);

  const licencia = useModelo(metaLicenciaFarma, licenciaFarmaVacia);
  const { modelo, init, modificado, valido } = licencia;
  const [estado, setEstado] = useState<
    "confirmarBorrado" | "revisandoDatos" | "edicion"
  >("edicion");
  const [cargando, setCargando] = useState(false);

  const onGuardarClicked = async () => {
    await intentar(() => patchLicenciaFarma(modelo.id, modelo));
    const guardada = await getLicenciaFarma(modelo.id);
    init(guardada);
    emitir("LICENCIA_FARMA_CAMBIADA", guardada);
  };

  const onBorrarConfirmado = async () => {
    await intentar(() => deleteLicenciaFarma(modelo.id));
    emitir("LICENCIA_FARMA_BORRADA", modelo);
    setEstado("edicion");
  };

  const onDatosRevisadosClicked = async () => {
    setCargando(true);
    try {
      await intentar(async () => {
        const fechaRevision = await marcarDatosRevisados(modelo.id);
        init({
          ...modelo,
          fechaRevisionDatos: fechaRevision,
        });
      });
    } finally {
      setCargando(false);
      setEstado("edicion");
    }
  };

  // console.log("mimensaje_licencia", puede("crm.trato.farma"));

  const puedeRevisarDatos =
    modelo.estado === "En revisión" &&
    !!modelo.clienteId &&
    !modelo.fechaRevisionDatos;

  return (
    <Detalle
      id={licenciaId}
      obtenerTitulo={titulo}
      setEntidad={(o) => init(o)}
      entidad={modelo}
      cargar={getLicenciaFarma}
      cerrarDetalle={() => emitir("CANCELAR_SELECCION")}
    >
      {!!licenciaId && (
        <div className="DetalleLicenciaFarma">
          <div className="maestro-botones">
            {puedeRevisarDatos && (
              <QBoton
                onClick={onDatosRevisadosClicked}
                deshabilitado={!puedeRevisarDatos || cargando}
              >
                {cargando ? "Procesando..." : "Datos revisados"}
              </QBoton>
            )}
            {/* <QBoton onClick={() => setEstado("confirmarBorrado")}>
              Borrar
            </QBoton> */}
          </div>
          <quimera-formulario>
            <QInput
              label="Tipo de licencia"
              {...licencia.uiProps("tipoLicencia")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de caducidad"
              {...licencia.uiProps("fechaCaducidad")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de inicio"
              {...licencia.uiProps("fechaInicio")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de fin"
              {...licencia.uiProps("fechaFin")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de revisión de datos"
              {...licencia.uiProps("fechaRevisionDatos")}
              // deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de recepción de acuerdos"
              {...licencia.uiProps("fechaRecepcionAcuerdos")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QDate
              label="Fecha de envío de documentación"
              {...licencia.uiProps("fechaEnvioDocumentacion")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QSelect
              label="Estado"
              opciones={[
                { valor: "En revisión", descripcion: "En revisión" },
                {
                  valor: "Acuerdo por recibir",
                  descripcion: "Acuerdo por recibir",
                },
                { valor: "Por presentar", descripcion: "Por presentar" },
                { valor: "Presentada", descripcion: "Presentada" },
              ]}
              {...licencia.uiProps("estado")}
              deshabilitado={!puede("crm.trato.farma")}
            />
            <QInput
              label={`Cliente${licencia.modelo?.clienteId ? ` (${licencia.modelo?.clienteId})` : ""}`}
              {...licencia.uiProps("nombreCliente")}
              deshabilitado={!puede("crm.trato.farma")}
            />

            <Agente
              label={`Agente`}
              {...licencia.uiProps("agenteId", "nombreAgente")}
            />

            {licencia.modelo.trato && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}
              >
                <div style={{ flex: 1 }}>
                  <QInput
                    label={`Trato ${licencia.modelo.trato?.estado}${licencia.modelo?.tratoId ? ` (${licencia.modelo?.tratoId})` : ""}`}
                    nombre="trato"
                    valor={licencia.modelo.trato?.titulo}
                    deshabilitado
                  />
                </div>
                <QBoton
                  tamaño="pequeño"
                  onClick={() =>
                    (window.location.href = `/ss/tratos/${licencia.modelo.trato?.id}`)
                  }
                >
                  Ir a trato
                </QBoton>
              </div>
            )}
          </quimera-formulario>
        </div>
      )}
      {modificado && (
        <div className="maestro-botones">
          <QBoton onClick={onGuardarClicked} deshabilitado={!valido}>
            Guardar
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => init()}
            deshabilitado={!modificado}
          >
            Cancelar
          </QBoton>
        </div>
      )}
      <QModalConfirmacion
        nombre="borrarLicenciaFarma"
        abierto={estado === "confirmarBorrado"}
        titulo="Confirmar borrar"
        mensaje="¿Está seguro de que desea borrar esta licencia?"
        onCerrar={() => setEstado("edicion")}
        onAceptar={onBorrarConfirmado}
      />
    </Detalle>
  );
};
