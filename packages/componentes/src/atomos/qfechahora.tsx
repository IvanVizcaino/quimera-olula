import "./_forminput.css";
import {
  Etiqueta,
  FormInput,
  FormInputProps,
  Validacion,
} from "./_forminput.tsx";

export type QFechaHoraProps = Omit<FormInputProps, "tipo">;

export const QFechaHora = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  ...props
}: QFechaHoraProps) => {
  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
    tipo: "fecha_hora",
  };

  const inputAttrs = {
    nombre,
    deshabilitado,
    opcional,
    tipo: "fecha_hora" as const,
    ...props,
  };

  return (
    <quimera-input {...attrs}>
      <label>
        <Etiqueta label={label} />
        <FormInput {...inputAttrs} />
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-input>
  );
};
