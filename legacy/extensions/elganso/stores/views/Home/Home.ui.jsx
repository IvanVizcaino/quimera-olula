import "./Home.style.scss";

import { Icon, IconButton } from "@quimera/comps";
import { navigate } from "hookrouter";
import Quimera, { PropValidation, useStateValue } from "quimera";

import { ResumenPda } from "../../comps";

function Home() {
  const [, _dispatch] = useStateValue();

  const render = () => {
    return (
      <div id="Home">
        <div className="rowButtons">
          <IconButton
            id="botonInventarios"
            className="buttonHome"
            onClick={() => navigate("/inventarios")}
          >
            <Icon className="iconButton">content_paste</Icon>
            <span className="iconTitle">Inventarios</span>
          </IconButton>
          <IconButton
            id="botonRecepciones"
            className="buttonHome"
            onClick={() => navigate("/recepciones")}
          >
            <Icon className="iconButton">assignment_return_outlined</Icon>
            <span className="iconTitle">Recepciones</span>
          </IconButton>
          <IconButton id="botonEnvios" className="buttonHome" onClick={() => navigate("/envios")}>
            <Icon className="iconButton">content_paste_go</Icon>
            <span className="iconTitle">Envios</span>
          </IconButton>
        </div>
        <ResumenPda />
      </div>
    );
  };

  return <Quimera.Template id="Home">{render()}</Quimera.Template>;
}

Home.propTypes = PropValidation.propTypes;
Home.defaultProps = PropValidation.defaultProps;
export default Home;
