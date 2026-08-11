import "./ResumenPda.style.scss";

import { Icon } from "@quimera/comps";
import PropTypes from "prop-types";
import { useStateValue, util } from "quimera";
import { useEffect, useState } from "react";

const getDbInstance = (dbName, storeName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

const getDbValue = async (dbName, storeName, key) => {
  const db = await getDbInstance(dbName, storeName);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(key);

    request.onsuccess = event => {
      resolve(event.target.result ? event.target.result.value : undefined);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

function ResumenPda({ _estilos, ...props }) {
  const usuario = util.getUser();
  const [state, dispatch] = useStateValue();
  const [numEnviosPendientes, setNumEnviosPendientes] = useState(0);
  const [numRecepcionesPendientes, setNumRecepcionesPendientes] = useState(0);
  const [numInventariosPendientes, setNumInventariosPendientes] = useState(0);

  useEffect(() => {
    getDbValue("ElGansoApp2", "Envios", "enviosDbIndex").then(enviosIndexados => {
      if (enviosIndexados) {
        const enviosPendientes = enviosIndexados.filter(
          envio =>
            "lineasModificadas" in envio &&
            envio.usuarioenvio === usuario.user &&
            envio.codalmaorigen === usuario.codtienda,
        );
        setNumEnviosPendientes(enviosPendientes.length);
      }
    });
    getDbValue("ElGansoApp3", "Recepciones", "recepcionesDbIndex").then(recepcionesIndexadas => {
      if (recepcionesIndexadas) {
        const recepcionesPendientes = recepcionesIndexadas.filter(
          recepcion =>
            "lineasModificadas" in recepcion &&
            recepcion.usuariorecepcion === usuario.user &&
            recepcion.codalmadestino === usuario.codtienda,
        );
        setNumRecepcionesPendientes(recepcionesPendientes.length);
      }
    });
    // Obtener inventarios
    getDbValue("ElGansoAppInv", "Inventarios", "inventariosDbIndex").then(inventariosIndexados => {
      if (inventariosIndexados) {
        const inventariosPendientes = inventariosIndexados.filter(
          recepcion => "lineasModificadas" in recepcion,
        );
        setNumInventariosPendientes(inventariosPendientes.length);
      }
    });
  }, [dispatch]);

  const datosPrueba = {
    numArticulos: 0,
    inventariosPendientes: 0,
    paquetes: 0,
  };

  return (
    <div id="ResumenPda">
      <div className="row">
        <div className="buttonResumenPda">
          <Icon className="iconButton">store</Icon>
          <span className="iconTitle">{usuario.codtienda}</span>
        </div>
      </div>
      <div className="row">
        <div className="buttonResumenPda">
          <Icon
            className={`iconButton ${datosPrueba.numArticulos ? "iconPendiente" : "iconCompletado"
              }`}
          >
            list_alt
          </Icon>
          <span className="iconTitle">Artículos: {datosPrueba.numArticulos}</span>
        </div>
      </div>
      <div className="row">
        <div className="buttonResumenPda">
          <Icon
            className={`iconButton ${numEnviosPendientes ? "iconPendiente" : "iconCompletado"}`}
          >
            arrow_circle_right
          </Icon>
          <span className="iconTitle">Envíos: {numEnviosPendientes} </span>
        </div>
      </div>
      <div className="row">
        <div className="buttonResumenPda">
          <Icon
            className={`iconButton ${numRecepcionesPendientes ? "iconPendiente" : "iconCompletado"
              }`}
          >
            arrow_circle_left
          </Icon>
          <span className="iconTitle">Recepciones: {numRecepcionesPendientes}</span>
        </div>
      </div>
      <div className="row">
        <div className="buttonResumenPda">
          <Icon
            className={`iconButton ${numInventariosPendientes ? "iconPendiente" : "iconCompletado"
              }`}
          >
            content_paste
          </Icon>
          <span className="iconTitle">Inventarios: {numInventariosPendientes}</span>
        </div>
      </div>
      <div className="row">
        <div className="buttonResumenPda">
          <Icon
            className={`iconButton ${datosPrueba.paquetes ? "iconPendiente" : "iconCompletado"}`}
          >
            inbox
          </Icon>
          <span className="iconTitle">Stocks Nuevos: {datosPrueba.paquetes}</span>
        </div>
      </div>
    </div>
  );
}

ResumenPda.propTypes = {
  estilos: PropTypes.object,
};
ResumenPda.defaultProps = {};

export default ResumenPda;
