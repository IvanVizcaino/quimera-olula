import "./LoadingGif.style.scss";

import { useStateValue } from "quimera";

function LoadingGif() {
  const [_state, _dispatch] = useStateValue();

  return (
    <div id="LoadingGif">
      <img alt="Project logo" src="/cargando-app.gif" />
    </div>
  );
}

export default LoadingGif;
