import { useEffect, useRef, useState } from "react";
import { FormFieldProps } from "../atomos/_forminput.tsx";
import { QInput } from "../atomos/qinput.tsx";
import { getIdUnico } from "../helpers.ts";
import "./qautocompletar.css";

type Opcion = {
  valor: string;
  descripcion: string;
  descripcionOpcion?: string;
};

export type QAutocompletarProps = Omit<
  FormFieldProps,
  "onChange" | "onBlur"
> & {
  tiempoEspera?: number;
  longitudMinima?: number;
  descripcion?: string;
  soloTexto?: boolean;
  obtenerOpciones: (texto: string, id?: string) => Promise<Opcion[]>;
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: Opcion | null,
    evento: React.FocusEvent<HTMLElement>
  ) => void;
};

export const QAutocompletar = ({
  nombre,
  valor,
  tiempoEspera = 150,
  longitudMinima = 2,
  obtenerOpciones,
  onBlur,
  onChange,
  descripcion = "",
  soloTexto = false,
  opcional,
  deshabilitado,
  ...props
}: QAutocompletarProps) => {
  const attrs = {
    nombre,
  };
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [valorDescrito, setValorDescrito] = useState<string>("");

  const valorReal = useRef<HTMLInputElement>(null);
  const editando = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const renderOpciones = opciones.map((opcion) => {
    const descripcion = opcion?.descripcionOpcion || opcion.descripcion;
    return (
      <option key={opcion.valor} value={descripcion}>
        {descripcion}
      </option>
    );
  });

  const listaId = useRef(nombre + "-datalist-" + getIdUnico());

  const regenerarOpciones = async (valor: string) => {
    clearTimeout(temporizador.current);

    if (valor.length < longitudMinima) return;

    temporizador.current = setTimeout(
      async () => setOpciones(await obtenerOpciones(valor)),
      tiempoEspera
    );
  };

  useEffect(() => {
    if (!editando.current) {
      setValorDescrito(descripcion || "");
    }
  }, [descripcion]);

  useEffect(() => {
    if (!editando.current && !valor) {
      setValorDescrito("");
    }
  }, [valor]);

  useEffect(() => {
    if (editando.current || !valor || descripcion) return;

    obtenerOpciones("", valor).then((opciones) => {
      const opcion = opciones.find((o) => o.valor === valor);
      if (opcion) {
        setValorDescrito(opcion.descripcion);
      }
    });
  }, [valor, descripcion]);

  useEffect(() => {
    if (!editando.current || opciones.length === 0) return;

    const opcion = opciones.find(
      (o) => (o?.descripcionOpcion || o.descripcion) === valorDescrito
    );
    if (opcion && valorReal.current!.value !== opcion.valor) {
      valorReal.current!.value = opcion.valor;
      onChangeRef.current?.(opcion, {} as React.ChangeEvent<HTMLElement>);
    }
  }, [opciones, valorDescrito]);

  const manejarChange = (valor: string) => {
    if (valor === valorDescrito) return;
    editando.current = true;
    setValorDescrito(valor);
  };

  const manejarInput = (valor: string, e: React.FormEvent<HTMLElement>) => {
    editando.current = true;

    const opcion = opciones.find(
      (opcion) => (opcion?.descripcionOpcion || opcion.descripcion) === valor
    );

    if (opcion) {
      clearTimeout(temporizador.current);
      const descripcion = opcion?.descripcionOpcion || opcion.descripcion;
      const objetivo = e.target as HTMLInputElement;
      objetivo.value = descripcion;

      valorReal.current!.value = opcion.valor;
      onChange?.(opcion, e as unknown as React.ChangeEvent<HTMLElement>);
    } else {
      regenerarOpciones(valor);
      if (valorReal.current!.value !== "") {
        valorReal.current!.value = "";
        onChange?.(null, e as unknown as React.ChangeEvent<HTMLElement>);
      }
    }
  };

  const manejarLimpiar = () => {
    editando.current = false;
    setValorDescrito("");
    setOpciones([]);
    valorReal.current!.value = "";
    onChange?.(null, {} as React.ChangeEvent<HTMLElement>);
  };

  const manejarBlur = (valor: string, e: React.FocusEvent<HTMLElement>) => {
    const estabaEditando = editando.current;
    editando.current = false;

    if (!estabaEditando) {
      onBlur?.(null, e);
      return;
    }

    const opcion = opciones.find(
      (opcion) => (opcion?.descripcionOpcion || opcion.descripcion) === valor
    );

    if (opcion) {
      valorReal.current!.value = opcion.valor;
      onChange?.(opcion, e as unknown as React.ChangeEvent<HTMLElement>);
      onBlur?.(opcion, e);
    } else {
      if (valorReal.current!.value !== "") {
        valorReal.current!.value = "";
        onChange?.(null, e as unknown as React.ChangeEvent<HTMLElement>);
      }
      if (valor !== "") {
        setValorDescrito("");
      }
      onBlur?.(null, e);
    }
  };

  return (
    <quimera-autocompletar {...attrs}>
      <datalist id={listaId.current}>{renderOpciones}</datalist>
      <input
        ref={valorReal}
        type="hidden"
        name={nombre}
        value={valor || ""}
        defaultValue={undefined}
        required={!opcional}
      />
      <div className="autocompletar-wrapper">
        <QInput
          {...props}
          opcional={opcional}
          deshabilitado={deshabilitado}
          nombre=""
          tipo="autocompletar"
          lista={listaId.current}
          autocompletar="off"
          onInput={manejarInput}
          onBlur={manejarBlur}
          onChange={manejarChange}
          placeholder={props.placeholder}
          valor={valorDescrito}
          soloTexto={soloTexto}
        />
        {opcional && valor && !deshabilitado && !soloTexto && (
          <button
            type="button"
            className="autocompletar-limpiar"
            onClick={manejarLimpiar}
            aria-label="Limpiar selección"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    </quimera-autocompletar>
  );
};
