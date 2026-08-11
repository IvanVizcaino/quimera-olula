import { MetaTabla, QBoton, QIcono, QTarjetaGenerica } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { CuentaBanco } from "../../diseño.ts";
import { metaTablaCuentasBanco as metaTablaBase } from "./dominio.ts";
import "./TabCuentasBancoLista.css";

export const TabCuentasBancoLista = ({
  cuentas,
  seleccionada,
  emitir,
  cargando,
  cuentaDomiciliadaId,
  acciones,
  descripcionCuentaRemesa,
  onSeleccionarRemesa,
}: {
  clienteId: string;
  cuentas: CuentaBanco[];
  seleccionada: CuentaBanco | null;
  emitir: (evento: string, payload?: unknown) => void;
  cargando: boolean;
  cuentaDomiciliadaId: string;
  acciones: Parameters<typeof QuimeraAcciones>[0]["acciones"];
  descripcionCuentaRemesa: string;
  onSeleccionarRemesa: () => void;
}) => {
  const metaTablaCuentasBanco = [
    {
      id: "domiciliada",
      cabecera: "",
      render: (cuenta: CuentaBanco) =>
        cuenta.id === cuentaDomiciliadaId ? (
          <div className="cuenta-domiciliada-badge">
            <QIcono
              nombre="check"
              tamaño="sm"
              color="var(--color-exito-oscuro)"
            />
          </div>
        ) : null,
    },
    ...metaTablaBase,
  ] as MetaTabla<CuentaBanco>;

  return (
    <div className="CuentasBanco">
      <div className="cuenta-remesa">
        <span className="cuenta-remesa-label">Remesa:</span>
        <span className="cuenta-remesa-valor">
          {descripcionCuentaRemesa || "Sin asignar"}
        </span>
        <QBoton variante="borde" onClick={onSeleccionarRemesa}>
          Seleccionar
        </QBoton>
      </div>

      <ListadoSemiControlado
        metaTabla={metaTablaCuentasBanco}
        tarjeta={(cuenta) => (
          <QTarjetaGenerica
            arribaIzquierda={cuenta.descripcion}
            abajoIzquierda={cuenta.iban}
            abajoDerecha={cuenta.bic}
          />
        )}
        entidades={cuentas}
        totalEntidades={cuentas.length}
        cargando={cargando}
        seleccionada={seleccionada}
        onSeleccion={(cuenta) => emitir("cuenta_seleccionada", cuenta)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        renderAcciones={() => (
          <div className="detalle-cliente-tab-contenido maestro-botones">
            <QBoton onClick={() => emitir("alta_solicitada")}>Nueva</QBoton>
            <QBoton
              variante="borde"
              deshabilitado={!seleccionada}
              onClick={() => seleccionada && emitir("edicion_solicitada")}
            >
              Editar
            </QBoton>
            <QuimeraAcciones acciones={acciones} vertical />
          </div>
        )}
      />
    </div>
  );
};
