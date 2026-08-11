import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { BotonLoginPasskey } from "../../passkey/vistas/BotonLoginPasskey.tsx";
import { EnlaceMagicoPasskey } from "../../passkey/vistas/EnlaceMagicoPasskey.tsx";
import { login } from "../dominio.ts";
import { permisosGrupo, whoAmI, whoAmIStorage } from "../infraestructura.ts";
import estilos from "./Login.module.css";
import { OlvideMiContrasena } from "./OlvideMiContrasena.tsx";

type TipoFormato = "email" | "texto";

export const Login = () => {
  const navigate = useNavigate();

  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [id, setId] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleLogin = async () => {
    return login(id, contraseña)
      .then(() =>
        whoAmI().then((datosWhoAmI) => {
          whoAmIStorage.actualizar(datosWhoAmI);
          permisosGrupo.actualizar(datosWhoAmI.permisos);
        })
      )
      .then(() => navigate("/"));
  };

  const { app } = useContext(FactoryCtx);
  if (!app.Auth) {
    return null;
  }
  // El formato de login se define en la factory de cada proyecto, y puede ser "email" o "texto". Esto permite adaptar el formulario de login a las necesidades de cada proyecto sin modificar el componente Login.

  const label_login = app.Auth.formato_login === "email" ? "Email" : "Usuario";

  return (
    <section className={estilos.login}>
      <div className="title">
        <h1>Iniciar sesión</h1>
      </div>
      <div className={estilos.loginForm}>
        <quimera-formulario>
          <QInput
            label={label_login}
            nombre="id"
            tipo={app.Auth.formato_login as TipoFormato}
            valor={id}
            onChange={(v) => setId(v)}
          />
          <QInput
            label="Contraseña"
            nombre="contraseña"
            tipo={mostrarContraseña ? "texto" : "contraseña"}
            valor={contraseña}
            onChange={(v) => setContraseña(v)}
          />
          <div>
            <QCheckbox
              label="Mostrar contraseña"
              nombre=""
              valor={mostrarContraseña}
              onChange={(valor) => setMostrarContraseña(valor === "true")}
              opcional={true}
            />
          </div>
          <div>
            <QBoton tamaño="mediano" ancho onClick={handleLogin}>
              Iniciar sesión
            </QBoton>
          </div>
        </quimera-formulario>
        <div style={{ marginTop: "0.0rem" }}>
          <OlvideMiContrasena />
        </div>

        <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--color-texto-secundario, #666)" }}>
          o continúa con
        </div>
        <BotonLoginPasskey />
        <div style={{ marginTop: "1rem" }}>
          <EnlaceMagicoPasskey />
        </div>
      </div>
    </section>
  );
};
