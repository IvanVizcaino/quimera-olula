import "./_forminput.css";
import { Etiqueta, FormFieldProps, Validacion } from "./_forminput.tsx";

type Opcion = { valor: string; descripcion: string };

type QSelectProps = Omit<FormFieldProps, "onChange" | "onBlur"> & {
  opciones: Opcion[];
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: Opcion | null,
    evento: React.FocusEvent<HTMLElement>
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
  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  const renderOpciones = opciones.map((opcion) => (
    <option key={opcion.valor} value={opcion.valor}>
      {opcion.descripcion}
    </option>
  ));

  const manejarChage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opcion = opciones.find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onChange?.(null, e);
      return;
    }

    onChange?.(opcion, e);
  };

  const manejarBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    const opcion = opciones.find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onBlur?.(null, e);
      return;
    }

    onBlur?.(opcion, e);
  };

  return (
    <quimera-select {...attrs}>
      <label>
        <Etiqueta label={label} />
        <select
          name={nombre}
          defaultValue={onChange ? undefined : valor}
          value={onChange ? valor : undefined}
          required={!opcional}
          disabled={deshabilitado}
          onChange={manejarChage}
          onBlur={manejarBlur}
        >
          <option hidden value="">
            -{placeholder}-
          </option>
          {renderOpciones}
        </select>
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-select>
  );
};
