import "./_forminput.css";
import {
  Etiqueta,
  FormInput,
  FormInputProps,
  Validacion,
} from "./_forminput.tsx";
import "./qcheckbox.css";

export type QCheckboxProps = Omit<FormInputProps, "valor" | "onChange"> & {
  valor: boolean | string;
  onChange?: (valor: string, evento: React.ChangeEvent<HTMLInputElement>) => void;
};

export const QCheckbox = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  valor = false,
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
  ...props
}: QCheckboxProps) => {
  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  const manejarChange = (
    _valor: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange?.(e.target.checked.toString(), e);
  };

  // Convertir valor a boolean si viene como string
  const valorBoolean =
    typeof valor === "string" ? valor === "true" || valor === "1" : valor;

  const inputAttrs = {
    nombre,
    deshabilitado,
    opcional,
    checked: valorBoolean,
    tipo: "checkbox" as const,
    onChange: onChange ? manejarChange : undefined,
    ...props,
  };

  return (
    <quimera-checkbox {...attrs}>
      <label>
        <FormInput {...inputAttrs} />
        <Etiqueta label={label} />
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-checkbox>
  );
};
