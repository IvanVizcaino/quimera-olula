import { Cliente } from "@quimera-extension/base-ventas";
import {
  Box,
  Field,
  Grid,
  QBox,
  QBoxButton,
  QSection,
  QTitleBox,
  Typography,
} from "@quimera/comps";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { ACL } from "quimera/lib";
import { useEffect } from "react";

import { ButtonContacto, ListEventos, ListTareas, ListTratos, Note } from "../../comps";

function ContactoMD({ callbackChanged, codContacto, initContacto, useStyles }) {
  const [
    { contacto, eventos, mostrarHistoricoTratos, mostrarHistoricoTareas, notas, tratos, tareas },
    dispatch,
  ] = useStateValue();
  const schema = getSchemas().contacto;
  const classes = useStyles();
  useEffect(() => {
    util.publishEvent(contacto.event, callbackChanged);
  }, [contacto.event.serial]);

  useEffect(() => {
    !!initContacto &&
      dispatch({
        type: "onInitContacto",
        payload: {
          initContacto,
          callbackChanged,
        },
      });
    !initContacto &&
      !!codContacto &&
      dispatch({
        type: "onInitContactoById",
        payload: {
          // action: "dame_contactos",
          filterContacto: ["codcontacto", "eq", codContacto],
          callbackChanged,
        },
      });
  }, [initContacto, codContacto]);

  // console.log("mimensaje_contacto", notas);

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const disableUser = !contacto.data.enlista
    ? util.getUser()?.superuser ||
      util.getUser().group === "MKT" ||
      util.getUser().group === "Responsable de marketing"
      ? false
      : true
    : false;

  const agente = util.getGlobalSetting("user_data")?.user?.agente?.toString();
  const isMKT =
    util.getUser()?.superuser ||
    util.getUser().group === "MKT" ||
    util.getUser().group === "Responsable de marketing";

  const tratosList = Object.values(tratos.dict)
    .filter(trato => (!isMKT ? trato.codAgente === agente : true))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const tareasList = Object.values(tareas.dict ?? {})
    .filter(tarea => (!isMKT ? tarea.codAgente === agente : true))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(tarea => tarea.idTarea);

  if ((!initContacto && !codContacto) || initContacto?._status === "deleted") {
    return null;
  }

  if (codContacto && !contacto.data.codContacto) {
    return null;
  }

  const puedoBorrar = () => !disableUser;
  // datosRevisados

  return (
    <Quimera.Template id="ContactoMD">
      <QBox
        width={anchoDetalle}
        titulo={contacto.buffer?.nombre}
        botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        sideButtons={
          <>
            {puedoBorrar() && (
              <QBoxButton
                id="deleteContacto"
                title="Borrar contacto"
                icon="delete"
              // disabled={!editable}
              />
            )}
            <Quimera.Block id="sideButtons" />
          </>
        }
      >
        <Grid container spacing={0} display="flex">
          <Grid size={{ xs: 12, sm: 12 }}>
            <QSection
              title="Nombre"
              actionPrefix="contacto.buffer/nombre"
              // saveDisabled={() => !schema.isValid(contacto.buffer)}
              dynamicComp={() => (
                <Field.Schema id="contacto.buffer/nombre" schema={schema} fullWidth label="" />
              )}
            >
              <Box display="flex">
                <Typography variant="body1">{contacto.buffer.nombre || "Sin datos"}</Typography>
              </Box>
            </QSection>
          </Grid>
          <Box width={1} display={"flex"} justifyContent={"space-between"} style={{ gap: "1%" }}>
            <Box minWidth={"69%"}>
              <QSection title={`Email`} actionPrefix="cliente.buffer/email" alwaysInactive>
                <Box display="flex">
                  <Typography variant="body1">{contacto.buffer.email || "Sin datos"}</Typography>
                </Box>
              </QSection>
            </Box>
            <Box minWidth={"30%"}>
              <QSection
                title="Teléfono"
                actionPrefix="contacto.buffer/telefono"
                // saveDisabled={() => !schema.isValid(contacto.buffer)}
                dynamicComp={() => (
                  <Field.Schema id="contacto.buffer/telefono" schema={schema} fullWidth label="" />
                )}
              >
                <Box display="flex">
                  <Typography variant="body1">{contacto.buffer.telefono || "Sin datos"}</Typography>
                </Box>
              </QSection>
            </Box>
          </Box>

          <Grid size={{ xs: 12, sm: 12 }}>
            <QSection
              title="Dirección"
              actionPrefix="contacto.buffer/direccion"
              // saveDisabled={() => !schema.isValid(contacto.buffer)}
              dynamicComp={() => (
                <Field.Schema id="contacto.buffer/direccion" schema={schema} fullWidth label="" />
              )}
            >
              <Box display="flex">
                <Typography variant="body1">{contacto.buffer.direccion || "Sin datos"}</Typography>
              </Box>
            </QSection>
          </Grid>

          <Box width={1} display={"flex"} justifyContent={"space-between"} style={{ gap: "1%" }}>
            <Box minWidth={"69%"}>
              <QSection
                title="Ciudad"
                actionPrefix="contacto.buffer/ciudad"
                // saveDisabled={() => !schema.isValid(contacto.buffer)}
                dynamicComp={() => (
                  <Field.Schema id="contacto.buffer/ciudad" schema={schema} fullWidth label="" />
                )}
              >
                <Box display="flex">
                  <Typography variant="body1">{contacto.buffer.ciudad || "Sin datos"}</Typography>
                </Box>
              </QSection>
            </Box>
            <Box minWidth={"30%"}>
              <QSection
                title="C. postal"
                actionPrefix="contacto.buffer/codpostal"
                // saveDisabled={() => !schema.isValid(contacto.buffer)}
                dynamicComp={() => (
                  <Field.Schema id="contacto.buffer/codpostal" schema={schema} fullWidth label="" />
                )}
              >
                <Box display="flex">
                  <Typography variant="body1">
                    {contacto.buffer.codpostal || "Sin datos"}
                  </Typography>
                </Box>
              </QSection>
            </Box>
          </Box>
          <Box width={1}>
            <QSection
              title={`Cliente${contacto.buffer.cliente ? ` (${contacto.buffer.cliente})` : ""}`}
              actionPrefix="contacto.buffer/cliente"
              alwaysInactive={false}
              dynamicComp={() => (
                <Box width={1}>
                  <Cliente
                    id="contacto.buffer/cliente"
                    label="Cliente"
                    fullWidth
                    async
                    disabled={disableUser}
                  />
                </Box>
              )}
            >
              <Box display="flex">
                <Cliente
                  id="contacto.buffer/cliente"
                  label="Cliente"
                  estatico
                  fullWidth
                  async
                  disabled={disableUser}
                />
              </Box>
            </QSection>
          </Box>
          {ACL.can("contactos:revisar_contacto") && (
            <Box my={1} width={1}>
              <Field.CheckBox
                id="contacto.buffer.datosRevisados"
                label="Contacto revisado"
                checked={contacto.buffer.datosRevisados}
              />
            </Box>
          )}

          <Box my={1} width={1}>
            <QTitleBox titulo={`Eventos(${eventos?.idList?.length})`}></QTitleBox>
            <ListEventos eventos={eventos} />
          </Box>

          <Box
            my={1}
            width={1}
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "stretch",
            }}
          >
            <ButtonContacto
              icon="phone_enabled"
              klass="error"
              disabled={!contacto?.data?.telefono}
              onClick={() => (window.location.href = `tel://+34${contacto?.telefono}`)}
            />
            <ButtonContacto
              icon="mail"
              klass="success"
              disabled={!contacto?.data?.email}
              onClick={() => (window.location.href = `mailto:${contacto?.email}`)}
            />
            <ButtonContacto
              icon="whatsapp"
              klass="success_alt"
              disabled={!contacto?.data?.telefono}
              onClick={() => window.open(`https://wa.me/34${contacto?.telefono}`, "_blank")}
            />
          </Box>

          {!disableUser && (
            <>
              <Box my={1} width={1}>
                <QTitleBox titulo={`Tratos`}></QTitleBox>
                <Field.CheckBox
                  id="mostrarHistoricoTratos"
                  label="Mostrar histórico"
                  checked={mostrarHistoricoTratos}
                />

                <ListTratos
                  tratos={{
                    ...tratos,
                    list: tratosList,
                  }}
                />
              </Box>

              <Box my={1} width={1}>
                <QTitleBox titulo={`Tareas`}></QTitleBox>
                <Field.CheckBox
                  id="mostrarHistoricoTareas"
                  label="Mostrar histórico"
                  checked={mostrarHistoricoTareas}
                />

                <ListTareas
                  tareas={{
                    ...tareas,
                    idList: tareasList,
                    dict: tareasList
                      .map(key => tareas?.dict[key])
                      .reduce(
                        (accum, tarea) => ({
                          ...accum,
                          [tarea.idTarea]: tarea,
                        }),
                        {},
                      ),
                  }}
                />
              </Box>
            </>
          )}
          <Box my={1} width={1}>
            <QTitleBox titulo={`Notas`}></QTitleBox>
            {!disableUser && (
              <Field.Text
                id="nuevaNota"
                onEnter={() => dispatch({ type: "onNuevaNotaEnter" })}
                fullWidth
                disabled={disableUser}
                multiline
              />
            )}
            {[...Object.values(notas.dict)]?.reverse().map(nota => (
              <Note key={nota.texto} text={nota.texto} date={util.formatDate(nota.fecha)} />
            ))}
          </Box>
        </Grid>
      </QBox>
    </Quimera.Template>
  );
}

export default ContactoMD;
