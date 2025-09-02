import { useState } from "react";
import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { Calendario } from "../../../../../../componentes/calendario/calendario.tsx";
import { EjemploSeleccionCalendario } from "../../../../../../componentes/calendario/ejemplos/EjemploSeleccionCalendario.tsx";
import { MaestroFiltros } from "../../../../../../componentes/maestro/maestroFiltros/MaestroFiltros.tsx";
import { useEsMovil } from "../../../../../../componentes/maestro/useEsMovil.ts";
import { QModal } from "../../../../../../componentes/moleculas/qmodal.tsx";
import { Filtro } from "../../../../../../contextos/comun/diseño.ts";
import { Maquina, useMaquina } from "../../../../../../contextos/comun/useMaquina.ts";
import { TextoConTooltip } from "../../../comun/componentes/TextoConTooltip/TextoConTooltip.tsx";
import { AltaEvento } from "../../evento/vistas/AltaEvento.tsx";
import { EventoCalendario } from "../diseño.ts";
import { useEventosCalendarioInfinito } from "../useEventosCalendarioInfinito.ts";
import "./CalendarioEventos.css";
import { FichaEventoAbierto } from "./FichaEventoAbierto.tsx";

// Define Estado type for use in MaestroEvento
type Estado = "calendario" | "alta" | "evento_abierto" | "ejemplo_seleccion";

export const CalendarioEventos = () => {
  const [eventoAbierto, setEventoAbierto] = useState<EventoCalendario | null>(null);
  const [filtro, setFiltro] = useState<Filtro>([]);
  const [estado, setEstado] = useState<Estado>("calendario");
  const esMovil = useEsMovil(640);
  const camposFiltro = ["descripcionref","referencia"];

  // Usar el nuevo hook de carga infinita
  const {
    eventos,
    cargando,
    expandirRangoAnterior,
    expandirRangoPosterior,
    resetear
  } = useEventosCalendarioInfinito(filtro);

  // Definir la máquina de estados
  const maquina: Maquina<Estado> = {
    alta: {
      EVENTO_CREADO: () => {
        // TODO: Implementar añadir evento al cache local
        // Por ahora, resetear para recargar datos
        resetear();
        return "calendario";
      },
      ALTA_CANCELADA: "calendario",
    },
    calendario: {
      ALTA_INICIADA: "alta",
      ABRIR_EVENTO: (payload: unknown) => {
        const evento = payload as EventoCalendario;   
        setEventoAbierto(evento);     
        return "evento_abierto";
      },
      VER_EJEMPLO_SELECCION: "ejemplo_seleccion",
    },
    evento_abierto: {
      EVENTO_CERRADO: () => {
        setEventoAbierto(null);
        return "calendario"
      }
    },
    ejemplo_seleccion: {
      VOLVER_CALENDARIO: "calendario",
    }
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  const cambiarFiltro = (clave: string, valor: string, operador = "~") => {
    setFiltro((prev) => [
      ...prev.filter(([k]) => k !== clave),
      [clave, operador, valor],
    ]);
  };
  const borrarFiltro = (clave: string) => {
    setFiltro((prev) => prev.filter(([k]) => k !== clave));
  };
  const resetearFiltro = () => setFiltro([]);

  // Generar enlace a calendario

  return (
    <div className="calendario-eventos">
      <Calendario
        datos={eventos}
        cargando={cargando}
        config={{
          // inicioSemana: "domingo",
          // seleccion: {tipo: 'rango'},
          maxDatosVisibles: 5,
          onNecesitaDatosAnteriores: expandirRangoAnterior,
          onNecesitaDatosPosteriores: expandirRangoPosterior,
          teclado: {
            atajos: {
              nuevo: 'n',      // Atajo personalizado para crear evento
            },
            onAccion: (accion) => {
              if (accion === 'nuevo') {
                emitir("ALTA_INICIADA");
              }
              // Se pueden añadir más acciones personalizadas aquí
            }
          },
          cabecera: {        
            botonesDerModo: !esMovil ? [ 
              <MaestroFiltros
                key="filtros"
                campos={camposFiltro}
                filtro={filtro}
                cambiarFiltro={cambiarFiltro}
                borrarFiltro={borrarFiltro}
                resetearFiltro={resetearFiltro}
              />
            ] : [],
            botonesDerHoy: [   
              <QBoton key="nuevo-evento" onClick={() => emitir("ALTA_INICIADA")} variante={esMovil ? 'texto' : 'solido'}>Nuevo evento</QBoton>,
              // <QBoton key="ejemplo-seleccion" onClick={() => emitir("VER_EJEMPLO_SELECCION")} variante="texto">🎯 Demo Selección</QBoton>,
              // <BotonConTooltip tooltip="Generar enlace a calendario" tamaño={"pequeño"} onClick={generarEnlace}> 
              //   <QIcono nombre={"copiar"} tamaño={"sm"} color={"white"} style={{margin: '4px'}}/>
              // </BotonConTooltip>
            ],
            // modos: ['semana', 'mes', 'anio'],
            // mostrarBotonHoy: false,
            // mostrarCambioModo: false,
            // modoCalendario: 'anio'
          }
        }}
        renderDato={(dato: EventoCalendario) => (
          <div
            // onClick={() => window.location.href = `/eventos/calendario/evento/${dato.evento_id}`}
            onClick={() => emitir("ABRIR_EVENTO", dato)}
            className="evento-item"
          >
            <div className="texto-multilinea-wrapper">
              <TextoConTooltip texto={`${dato.hora_inicio ? `${dato.hora_inicio} - ` : ""}${dato.descripcion}`} />
            </div>
          </div>
        )}
      />
      <QModal
        nombre="modal"
        abierto={estado === "alta"}
        onCerrar={() => emitir("ALTA_CANCELADA")}
      >
        <AltaEvento emitir={emitir} />
      </QModal>

      <QModal
        nombre="fichaEvento"
        abierto={estado === "evento_abierto"}
        onCerrar={() => emitir("EVENTO_CERRADO")}
      >
        {eventoAbierto && <FichaEventoAbierto evento={eventoAbierto} />}
      </QModal>

      <QModal
        nombre="ejemploSeleccion"
        abierto={estado === "ejemplo_seleccion"}
        onCerrar={() => emitir("VOLVER_CALENDARIO")}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>🎯 Demo: Selección de Fechas en Calendario</h3>
            <QBoton onClick={() => emitir("VOLVER_CALENDARIO")} variante="texto">
              ← Volver al Calendario de Eventos
            </QBoton>
          </div>
          <EjemploSeleccionCalendario />
        </div>
      </QModal>
    </div>
  );
};