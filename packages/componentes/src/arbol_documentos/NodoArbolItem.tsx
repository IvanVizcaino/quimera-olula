import { QBoton, QIcono } from "@olula/componentes/index.js";
import {
  DocumentoArbol,
  esCarpetaArbol,
  NodoArbol,
} from "@olula/lib/api/documentos.ts";
import {
  formatearFechaString,
  formatearHoraString,
} from "@olula/lib/dominio.ts";
import "./NodoArbolItem.css";
import { useSeleccionArchivosMovil } from "./useSeleccionArchivosMovil.ts";

export interface NodoArbolItemProps {
  nodo: NodoArbol;
  nivel: number;
  expandidos: Set<string>;
  onToggle: (id: string) => void;
  onDescargar: (documento: DocumentoArbol) => void;
  onCrearCarpeta: (carpetaPadreId: string) => void;
  onAnadirDocumento: (
    carpetaPadreId: string | null,
    archivosIniciales?: File[]
  ) => void;
}

export const NodoArbolItem = ({
  nodo,
  nivel,
  expandidos,
  onToggle,
  onDescargar,
  onCrearCarpeta,
  onAnadirDocumento,
}: NodoArbolItemProps) => {
  const sangria = { paddingLeft: `${nivel * 1.25}rem` };
  const { inputRef, handleClick, handleChange } = useSeleccionArchivosMovil(
    nodo.id,
    onAnadirDocumento
  );

  if (esCarpetaArbol(nodo)) {
    const abierta = expandidos.has(nodo.id);
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(nodo.id);
      }
    };
    return (
      <div className="NodoArbolItem">
        <div
          className="NodoArbolItem-fila NodoArbolItem-carpeta"
          style={sangria}
          onClick={() => onToggle(nodo.id)}
          onKeyDown={handleKeyDown}
          role="treeitem"
          aria-expanded={abierta}
          tabIndex={0}
        >
          <span className="NodoArbolItem-chevron">
            <QIcono nombre={abierta ? "abajo" : "derecha"} tamaño="md" />
          </span>
          <span className="NodoArbolItem-icono">
            <QIcono
              nombre={abierta ? "carpeta_abierta" : "carpeta"}
              tamaño="lg"
              relleno
            />
          </span>
          <span className="NodoArbolItem-nombre">{nodo.nombre}</span>
          <QBoton
            tamaño="pequeño"
            variante="texto"
            props={{ "aria-label": `Nueva carpeta dentro de ${nodo.nombre}` }}
            onClick={(e) => {
              e.stopPropagation();
              onCrearCarpeta(nodo.id);
            }}
          >
            <QIcono nombre="carpeta_nueva" tamaño="md" />
          </QBoton>
          <QBoton
            tamaño="pequeño"
            variante="texto"
            props={{ "aria-label": `Añadir documento dentro de ${nodo.nombre}` }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <QIcono nombre="documento_nuevo" tamaño="md" />
          </QBoton>
        </div>
        {/*
          Input oculto para el selector nativo de archivos en móvil (ver useSeleccionArchivosMovil).
          Se coloca FUERA de la fila con onClick={() => onToggle(...)}: inputRef.current.click()
          dispara un evento "click" real que burbujea por el DOM, y si el input estuviera anidado
          dentro de la fila, ese burbujeo abriría/cerraría la carpeta cada vez que se elige un archivo.
        */}
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleChange}
        />
        {abierta &&
          nodo.contenido.map((hijo) => (
            <NodoArbolItem
              key={hijo.id}
              nodo={hijo}
              nivel={nivel + 1}
              expandidos={expandidos}
              onToggle={onToggle}
              onDescargar={onDescargar}
              onCrearCarpeta={onCrearCarpeta}
              onAnadirDocumento={onAnadirDocumento}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="NodoArbolItem">
      <div
        className="NodoArbolItem-fila NodoArbolItem-documento"
        style={sangria}
        role="treeitem"
      >
        <span className="NodoArbolItem-chevron" />
        <span className="NodoArbolItem-icono">
          <QIcono nombre="fichero" tamaño="lg" />
        </span>
        <span className="NodoArbolItem-nombre">{nodo.nombre}</span>
        <span className="NodoArbolItem-fecha">
          {formatearFechaString(nodo.fechaSubida)}{" "}
          {formatearHoraString(nodo.horaSubida)}
        </span>
        <QBoton
          tamaño="pequeño"
          variante="texto"
          props={{ "aria-label": `Descargar ${nodo.nombre}` }}
          onClick={() => onDescargar(nodo)}
        >
          <QIcono nombre="descargar" tamaño="md" />
        </QBoton>
      </div>
    </div>
  );
};
