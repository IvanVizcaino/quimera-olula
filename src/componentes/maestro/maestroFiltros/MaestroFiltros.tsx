import { FormEvent } from "react";
import { Entidad, Filtro } from "../../../contextos/comun/diseño.ts";
import { QBoton } from "../../atomos/qboton.tsx";
import { QIcono } from "../../atomos/qicono.tsx";
import {
  CampoFormularioGenerico,
  OpcionCampo,
} from "../../detalle/FormularioGenerico.tsx";
import {
  formatearClave,
  renderInput,
  renderSelect,
} from "../../detalle/helpers.tsx";
import "./MaestroFiltros.css";

const selectorCampo = (campos: OpcionCampo[]) => {
  const attrsCampo: CampoFormularioGenerico = {
    nombre: "campo",
    etiqueta: "Filtro",
    tipo: "select",
    requerido: true,
    opciones: campos,
    condensado: true,
  };

  return renderSelect(attrsCampo, {} as Entidad);
};

const inputFiltro = () => {
  const attrsValor: CampoFormularioGenerico = {
    nombre: "valor",
    etiqueta: "Buscar",
    placeholder: "Valor a filtrar",
    tipo: "text",
    requerido: true,
    condensado: true,
  };
  return renderInput(attrsValor, {} as Entidad);
};

type MaestroProps = {
  campos: string[];
  filtro: Filtro;
  cambiarFiltro: (clave: string, valor: string, operador?: string) => void;
  borrarFiltro: (clave: string) => void;
  resetearFiltro: () => void;
};

export const MaestroFiltros = ({
  campos,
  filtro,
  cambiarFiltro,
  borrarFiltro,
  resetearFiltro,
}: MaestroProps) => {
  const camposFormateados: OpcionCampo[] = campos.map((clave) => [
    clave,
    formatearClave(clave),
  ]);

  const filtrosActuales = filtro.map(([clave, _operador, valor]) => {
    const etiqueta = camposFormateados.find((campo) => campo[0] === clave)?.[1];
    return (
      <div key={clave} onClick={() => borrarFiltro(clave)}>
        <span className="tag">{etiqueta}:</span>
        <span className="valor">{valor}</span>
        <QIcono nombre="cerrar" tamaño="xs" />
      </div>
    );
  });

  const onBuscar = (event: FormEvent): void => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const campo = formData.get("campo") as string;
    const valor = formData.get("valor") as string;

    if (!campo) return;

    cambiarFiltro(campo, valor, "~");
  };

  const renderResetearFiltro = () => {
    if (filtro.length === 0) return null;

    return (
      <QBoton
        tipo="reset"
        variante="texto"
        tamaño="pequeño"
        onClick={resetearFiltro}
      >
        Limpiar
      </QBoton>
    );
  };

  return (
    <div className="MaestroFiltros">
      <form onSubmit={onBuscar} onReset={resetearFiltro}>
        {selectorCampo(camposFormateados)}
        {inputFiltro()}
        <QBoton tipo="submit" tamaño="pequeño">
          Buscar
        </QBoton>
      </form>
      <etiquetas-filtro>
        {filtrosActuales}
        {renderResetearFiltro()}
      </etiquetas-filtro>
    </div>
  );
};
