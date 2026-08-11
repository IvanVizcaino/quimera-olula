import { QBoton, QIcono } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useRef, useState } from "react";
import "./ArrastraSuelta.css";

export const ArrastraSuelta = ({ emitir }: { emitir: EmitirEvento }) => {
  const [arrastrado, setArrastrado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const procesarArchivos = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        emitir("archivos_seleccionados", files);
      }
    },
    [emitir]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrado(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrado(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setArrastrado(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await procesarArchivos(files);
      }
    },
    [procesarArchivos]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        await procesarArchivos(files);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [procesarArchivos]
  );

  return (
    <div className="ArrastraSuelta">
      <div
        className={`ArrastraSuelta-zona ${arrastrado ? "activo" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="ArrastraSuelta-contenido">
          <div className="ArrastraSuelta-icono">
            <QIcono nombre="subir" tamaño="xl" />
          </div>
          <p className="ArrastraSuelta-titulo">Arrastra archivos aquí</p>
          <p className="ArrastraSuelta-subtitulo">o</p>
          <QBoton onClick={() => inputRef.current?.click()}>
            Seleccionar archivos
          </QBoton>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
};
