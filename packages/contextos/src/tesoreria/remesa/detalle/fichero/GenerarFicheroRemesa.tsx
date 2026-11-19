import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useState } from "react";
import { Remesa } from "../../diseño.js";
import {
  AvisoDomiciliacion,
  FormatoFicheroRemesa,
  getDomiciliacionesRemesa,
  getFicheroRemesa,
} from "../../infraestructura.js";
import "./GenerarFicheroRemesa.css";

const FORMATOS = [
  { valor: "csb19", descripcion: "CSB19 (cuaderno 19, como el ERP)" },
  { valor: "sepa", descripcion: "SEPA adeudos directos (pain.008)" },
];

const descargar = (blob: Blob, nombre: string) => {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};

/**
 * TES-07: genera y descarga el fichero bancario de la remesa. Antes comprueba
 * las domiciliaciones (`comprobarCuentasDom` del ERP) y, si hay avisos, pide
 * confirmación para seguir.
 */
export const GenerarFicheroRemesa = ({
  remesa,
  publicar,
}: {
  remesa: Remesa;
  publicar: EmitirEvento;
}) => {
  const [formato, setFormato] = useState<FormatoFicheroRemesa>("csb19");
  const [agruparPorCliente, setAgruparPorCliente] = useState(false);
  const [incluirLineas, setIncluirLineas] = useState(false);
  const [avisos, setAvisos] = useState<AvisoDomiciliacion[] | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const cerrar = () => publicar("fichero_cerrado");

  const generar = async () => {
    setTrabajando(true);
    try {
      const blob = await getFicheroRemesa(remesa.id, {
        formato,
        agruparPorCliente,
        incluirLineas: incluirLineas && !agruparPorCliente,
      });
      descargar(blob, formato === "sepa" ? `remesa-${remesa.id}.xml` : `remesa-${remesa.id}.txt`);
      cerrar();
    } finally {
      setTrabajando(false);
    }
  };

  const comprobarYGenerar = async () => {
    setTrabajando(true);
    try {
      const encontrados = await getDomiciliacionesRemesa(remesa.id, formato);
      if (encontrados.length > 0) {
        setAvisos(encontrados);
        return;
      }
    } finally {
      setTrabajando(false);
    }
    await generar();
  };

  return (
    <QModal abierto={true} nombre="generar_fichero_remesa" titulo="Fichero bancario de la remesa" onCerrar={cerrar}>
      <div className="GenerarFicheroRemesa">
        {avisos === null ? (
          <>
            <quimera-formulario>
              <QSelect
                label="Formato"
                nombre="formato"
                valor={formato}
                opciones={FORMATOS}
                onChange={(opcion) => setFormato((opcion?.valor as FormatoFicheroRemesa) ?? "csb19")}
              />
              {formato === "csb19" && (
                <>
                  <QCheckbox
                    label="Agrupar recibos por cliente"
                    nombre="agrupar_por_cliente"
                    valor={agruparPorCliente}
                    onChange={(_, evento) => setAgruparPorCliente(evento.target.checked)}
                  />
                  <QCheckbox
                    label="Incluir las líneas de la factura"
                    nombre="incluir_lineas"
                    valor={incluirLineas && !agruparPorCliente}
                    deshabilitado={agruparPorCliente}
                    onChange={(_, evento) => setIncluirLineas(evento.target.checked)}
                  />
                </>
              )}
            </quimera-formulario>
            <div className="botones maestro-botones">
              <QBoton onClick={comprobarYGenerar} deshabilitado={trabajando}>
                Generar
              </QBoton>
            </div>
          </>
        ) : (
          <>
            <p>Los siguientes recibos no tienen una domiciliación válida:</p>
            <ul className="avisos-domiciliacion">
              {avisos.map((aviso, indice) => (
                <li key={`${aviso.reciboId}-${indice}`}>
                  Cliente: {aviso.nombreCliente} ({aviso.clienteId}), recibo {aviso.codigo}: {aviso.aviso}
                </li>
              ))}
            </ul>
            <p>¿Desea continuar?</p>
            <div className="botones maestro-botones">
              <QBoton tipo="reset" variante="texto" onClick={() => setAvisos(null)}>
                Volver
              </QBoton>
              <QBoton onClick={generar} deshabilitado={trabajando}>
                Generar de todos modos
              </QBoton>
            </div>
          </>
        )}
      </div>
    </QModal>
  );
};
