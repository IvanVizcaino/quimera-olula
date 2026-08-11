import { ContextoError } from "@olula/lib/contexto.ts";
import { procesarEvento } from "@olula/lib/dominio.js";
import { useModelo, ValorControl } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import "./contacto.css";
import { ContextoContactoCrm, getMaquina } from "./contacto.ts";

const maquina = getMaquina();

export const MoleculaContacto = ({
  contactoId = null,
}: // onChange,
{
  contactoId?: string | null;
  onChange: (valor: ValorControl) => void;
}) => {
  const { intentar } = useContext(ContextoError);

  const contacto = useModelo({}, {});
  // const { uiProps, init, valido, modificado } = contacto;

  const [ctx, setCtx] = useState<ContextoContactoCrm>({
    estado: "INICIAL",
    contacto: contacto.modelo,
  });

  const emitir = useCallback(
    async (evento: string, payload?: unknown) => {
      const [nuevoContexto, _] = await intentar(() =>
        procesarEvento(maquina, ctx, evento, payload)
      );
      setCtx(nuevoContexto);
    },
    [ctx, setCtx, intentar]
  );

  if (contactoId && contactoId !== ctx.contacto.id) {
    emitir("contacto_id_cambiado", contactoId);
  }

  // if (contactoId && !contacto.modelo.id) emitir2("contacto_id_cambiado");

  // const emitir_contacto = (evento: string, payload: unknown) => {
  //   if (evento === "contacto_creado") {
  //     emitir("contacto_creado");
  //     onChange((payload as Contacto).id);
  //   } else if (evento === "contacto_cambiado") {
  //     emitir("contacto_guardado");
  //     onChange((payload as Contacto).id);
  //   } else {
  //     emitir(evento, payload);
  //   }
  // };

  // const onGuardarClicked = async () => {
  //   await intentar(() => patchContacto(modelo.id, modelo));
  //   onRecargarContacto();
  //   emitir("contacto_guardado");
  // };

  // const onChangeContacto = (
  //   opcion: { valor: string; descripcion: string } | null
  // ) => {
  //   if (opcion?.valor === contacto.modelo.id) return;
  //   onChange(opcion ? opcion.valor : null);
  // };

  // const onRecargarContacto = async () => {
  //   const contactoRecargado = await getContacto(contacto.modelo.id);
  //   init(contactoRecargado);
  //   emitir_contacto("contacto_cambiado", contactoRecargado);
  // };

  // useEffect(() => {
  //   const cargaContacto = async () => {
  //     if (!contactoId) return;
  //     const contactoCargado = await intentar(() => getContacto(contactoId));
  //     init(contactoCargado);
  //   };

  //   emitir("cargar");
  //   if (contactoId) cargaContacto();
  //   else init(contactoVacio);
  // }, [contactoId, emitir, intentar, init]);

  return (
    <span>{"Hola"}</span>
    // <div className="MoleculaContacto">
    //   <div className="MoleculaContactoCampos">
    //     <ContactoSelector
    //       {...uiProps("id", "nombre")}
    //       onChange={() => emitir("contacto_id_cambiado")}
    //       nombre="contacto_id"
    //       label="Contacto"
    //     />
    //     {ctx.contacto.id ? (
    //       <QBoton
    //         variante="texto"
    //         tamaño="pequeño"
    //         onClick={() => emitir("edicion_solicitada")}
    //       >
    //         <QIcono nombre="editar_2" />
    //       </QBoton>
    //     ) : (
    //       <QBoton
    //         variante="texto"
    //         tamaño="pequeño"
    //         onClick={() => emitir("alta_solicitada")}
    //       >
    //         <QIcono nombre={"crear"} />
    //       </QBoton>
    //     )}
    //   </div>

    //   {ctx.estado === "CREANDO" && (
    //     <AltaContacto publicar={emitir} activo={true} />
    //   )}

    //   {ctx.estado === "EDITANDO" && (
    //     <Mostrar
    //       modo="modal"
    //       activo={true}
    //       onCerrar={() => emitir("edicion_cancelada")}
    //     >
    //       <>
    //         <TabGeneral contacto={contacto} />
    //         {contacto.modificado && (
    //           <div className="maestro-botones ">
    //             <QBoton
    //               onClick={() => emitir("contacto_cambiado")}
    //               deshabilitado={!valido}
    //             >
    //               Guardar
    //             </QBoton>
    //             <QBoton
    //               tipo="reset"
    //               variante="texto"
    //               onClick={() => init()}
    //               deshabilitado={!modificado}
    //             >
    //               Cancelar
    //             </QBoton>
    //           </div>
    //         )}
    //       </>
    //     </Mostrar>
    //   )}
    // </div>
  );
};
