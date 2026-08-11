import { OlulaIntro } from "../tema/Olula.jsx";
import { useEffect, useState } from "react";
import "./InicioOlula.css";

const INTRO_KEY = "olula-intro-vista";

export const InicioOlula = () => {
  const [visible, setVisible] = useState(
    () => !sessionStorage.getItem(INTRO_KEY)
  );
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timerSalida = setTimeout(() => {
      setSaliendo(true);
    }, 3100);

    const timerOcultar = setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, "1");
      setVisible(false);
    }, 3900);

    return () => {
      clearTimeout(timerSalida);
      clearTimeout(timerOcultar);
    };
  }, [visible]);

  return (
    <>
      {/* <FondoInicio /> */}
      {visible && (
        <div className={`intro-overlay${saliendo ? " intro-overlay--saliendo" : ""}`}>
          <OlulaIntro color="#1a1714" className="" style={{}} />
        </div>
      )}
    </>
  );
};
