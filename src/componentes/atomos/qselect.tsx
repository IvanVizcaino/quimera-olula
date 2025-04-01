import "./qselect.css";

type QSelectProps = {
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  opciones: { valor: string; descripcion: string }[];
  valor?: string;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  onChange?: (
    valor: string,
    evento?: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onBlur?: (
    valor: string,
    evento?: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export const QSelect = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  opciones,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
  onBlur,
}: QSelectProps) => {
  const attrs = { erroneo, advertido, valido, opcional, condensado };

  const renderOpciones = opciones.map((opcion) => (
    <option key={opcion.valor} value={opcion.valor}>
      {opcion.descripcion}
    </option>
  ));

  return (
    <quimera-select {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <select
          name={nombre}
          defaultValue={onChange ? undefined : valor}
          value={onChange ? valor : undefined}
          disabled={deshabilitado}
          onChange={onChange ? (e) => onChange(e.target.value, e) : undefined}
          onBlur={onBlur ? (e) => onBlur(e.target.value, e) : undefined}
        >
          <option hidden value="">
            -{placeholder}-
          </option>
          {renderOpciones}
        </select>
        <span className="texto-validacion">{textoValidacion}</span>
      </label>
    </quimera-select>
  );
};
