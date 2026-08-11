import "./BarcodeScanner.style.scss";

import { Icon, IconButton } from "@quimera/comps";
import PropTypes from "prop-types";
import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

/**
 * BarcodeScanner Component.
 *
 * @param parentDispatch - Funcion a la que le pasamos el texto leído por el escaner
 * @param visualizeData - Permitimos mostrar el texto leído junto a los botones
 * @param defaultText - Texto para mostrar por defecto mientras no escaneamos nada
 * @param defaultFlash - Habilitar el flash la primera vez que se carga el componente
 * @param focus - Funcion con la que podemos hacer focus a un elemento de nuestro componente
 * @param cameraMode - Cambiar entre camara frontal('user')/trasera('enviroment') si el dispositivo lo permite, default 'enviroment'
 * @param enableReadUrls - Permitimos la lectura de urls, por ejemplo provenientes de un qr
 */
function BarcodeScanner({
  parentDispatch,
  visualizeData = true,
  defaultText = "Esperando escaneo...",
  defaultFlash = false,
  focus = null,
  enableReadUrls = false,
}) {
  // BARCODE SCANNER
  const [data, setData] = useState(defaultText);
  const [torchOn, setTorchOn] = useState(defaultFlash);
  const [facingMode, setFacingMode] = useState("environment");

  return (
    <div id="barcodeScanner">
      <BarcodeScannerComponent
        width={"100%"}
        torch={torchOn}
        facingMode={facingMode}
        delay={1000}
        onUpdate={(_, result) => {
          if (result) {
            if (enableReadUrls || (!enableReadUrls && !result.text.includes("http"))) {
              setData(result.text);
              parentDispatch(result.text);
            }
          } else {
            setData("Esperando escaneo...");
          }
        }}
      />
      <div className="barcodeScanner-buttons-container">
        {visualizeData ? `${data} ` : ""}

        <IconButton
          id="button-flash-reader"
          className={`button-flash-barcode ${torchOn ? "activeFlash" : ""}`}
          onClick={() => {
            setTorchOn(!torchOn);
            focus ? focus.focus() : null;
          }}
        >
          <Icon>flash_on</Icon>
        </IconButton>
        <IconButton
          id="button-mode-reader"
          onClick={() => {
            setFacingMode(facingMode === "enviroment" ? "user" : "enviroment");
            focus ? focus.focus() : null;
          }}
        >
          <Icon>cameraswitch</Icon>
        </IconButton>
      </div>
    </div>
  );
}

BarcodeScanner.propTypes = {
  estilos: PropTypes.object,
};
BarcodeScanner.defaultProps = {};

export default BarcodeScanner;
