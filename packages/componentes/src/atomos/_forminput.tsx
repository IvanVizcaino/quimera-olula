import { useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useEsMovil } from "../maestro/useEsMovil.ts";

export type FormFieldProps = {
  id?: string;
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: string;
  maxLength?: number;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  autoSeleccion?: boolean;
  autoFocus?: boolean;
  ref?: React.RefObject<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
  >;
  onChange?: (
    valor: string,
    evento: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onKeyDown?: (evento: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (valor: string, evento: React.FocusEvent<HTMLElement>) => void;
  onEnterKeyUp?: (
    valor: string,
    evento: React.KeyboardEvent<HTMLElement>
  ) => void;
};

const tiposFormInput = {
  texto: "text",
  numero: "number",
  entero: "number",
  decimal: "number",
  fecha: "date",
  hora: "time",
  fecha_hora: "datetime-local",
  contraseña: "password",
  email: "email",
  checkbox: "checkbox",
  radio: "radio",
  telefono: "tel",
  color: "color",
  fichero: "file",
  url: "url",
  rango: "range",
  moneda: "number",
  autocompletar: "text",
  selector: "text",
  intervalo_fechas: "date",
  intervalo_numeros: "number",
  multiseleccion: "checkbox",
} as const;

const TIPOS_NUMERICOS = new Set<string>([
  "numero", "entero", "decimal", "moneda", "rango", "intervalo_numeros",
]);

export type FormInputProps = FormFieldProps & {
  lista?: string;
  autocompletar?: "off" | "on";
  onInput?: (valor: string, evento: React.FormEvent<HTMLInputElement>) => void;
  tipo?: keyof typeof tiposFormInput;
  evaluarCambio?: () => void;
};

type InputProps = Omit<FormInputProps, "label"> & {
  checked?: boolean;
  autoFocus?: boolean;
};

export const FormInput = ({
  id,
  nombre,
  deshabilitado,
  placeholder,
  tipo = "texto",
  valor = "",
  checked,
  opcional,
  lista,
  autocompletar,
  autoSeleccion,
  autoFocus,
  maxLength,
  ref,
  onChange,
  onBlur,
  onInput,
  onEnterKeyUp,
  evaluarCambio,
}: InputProps) => {
  const evaluarCambioRef = useRef(evaluarCambio);
  useLayoutEffect(() => {
    evaluarCambioRef.current = evaluarCambio;
  });
  const esMovil = useEsMovil();
  const obtenerValorPorDefecto = () => {
    if (valor !== undefined && valor !== "" && valor != null) return valor;

    switch (tipo) {
      case "numero":
      case "moneda":
      case "rango":
        return "";
      default:
        return "";
    }
  };

  const valorFinal = onChange ? obtenerValorPorDefecto() : undefined;

  const manejarFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (autoSeleccion || (esMovil && TIPOS_NUMERICOS.has(tipo))) {
      e.target.select();
    }
  };

  const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    onChange?.(target.type === 'checkbox' ? target.checked.toString() : target.value, e);
  };

  const manejarBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e.target.value, e);
    evaluarCambio?.();
  };

  const manejarInput = (e: React.FormEvent<HTMLInputElement>) => {
    onInput?.((e.target as HTMLInputElement).value, e);
  };

  const manejarKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const evento = e.target as unknown as {
        value: string;
      };
      onEnterKeyUp?.(evento.value, e);
    }
  };

  const manejarLimpiar = () => {
    if (onChange) {
      flushSync(() => {
        onChange("", { target: { value: "", type: "time" } } as React.ChangeEvent<HTMLInputElement>);
      });
    }
    evaluarCambioRef.current?.();
  };

  const inputProps = {
    id: id,
    type: tiposFormInput[tipo] ?? "text",
    name: nombre,
    placeholder: placeholder,
    disabled: deshabilitado,
    required: !opcional,
    maxLength: maxLength,
    list: lista,
    autoComplete: autocompletar,
    onChange: manejarChange,
    onBlur: manejarBlur,
    onFocus: manejarFocus,
    onInput: manejarInput,
    onKeyUp: manejarKeyUp,
    autoFocus: autoFocus,
    ref: ref as React.RefObject<HTMLInputElement>,
  }
  if (tipo === "checkbox") {
    const checkedValue = checked ?? valor === "true";
    return (
      <input
        {...inputProps}
        checked={onChange ? checkedValue : undefined}
        defaultChecked={onChange ? undefined : checkedValue}
      />
    );
  }

  if (tipo === "hora") {
    return (
      <div className="hora-wrapper">
        <input
          {...inputProps}
          value={valorFinal as string}
          defaultValue={onChange ? undefined : valor as string}
        />
        {opcional && valor && !deshabilitado && (
          <button
            type="button"
            className="hora-limpiar"
            onClick={manejarLimpiar}
            aria-label="Limpiar hora"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <input
      {...inputProps}
      value={valorFinal as string}
      defaultValue={onChange ? undefined : valor as string}
    />
  );
};


export const Etiqueta = ({ label }: { label: string }) => {
  return (
    <span className="etiqueta">
      {label}
      <span className="etiqueta-opcional">(opcional)</span>
    </span>
  );
};

export const Validacion = ({
  textoValidacion,
}: {
  textoValidacion: string;
}) => {
  if (!textoValidacion) return null;

  return <span className="texto-validacion">{textoValidacion}</span>;
};
