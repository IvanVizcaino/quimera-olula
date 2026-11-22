import { OlulaWordmark } from "@olula/componentes/tema/Olula.jsx";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Periodicidad } from "../../saas_suscripcion/diseño.ts";
import { FormularioRegistro } from "../registro/FormularioRegistro.tsx";
import { usePlanRegistro } from "../registro/usePlanRegistro.ts";
import {
    ANCLA_PLANES, ANCLA_REGISTRO, construirTarjetasPlanes, diasPruebaDestacado, primerPlanConMcp, textoCtaPrueba,
} from "./dominio.ts";
import estilos from "./Landing.module.css";

const irA = (ancla: string) =>
    document.getElementById(ancla)?.scrollIntoView({ behavior: "smooth", block: "start" });

const PREGUNTAS = [
    {
        pregunta: "¿Necesito tarjeta para la prueba?",
        respuesta: "No. Creas tu empresa solo con tu email y no te pedimos ningún dato de pago hasta que decidas contratar.",
    },
    {
        pregunta: "¿Qué pasa al acabar la prueba?",
        respuesta: "Eliges el plan que prefieras. Si no eliges ninguno, tu empresa pasa a solo lectura: puedes consultar todo y no se pierde nada.",
    },
    {
        pregunta: "¿Puedo cambiar de plan?",
        respuesta: "Sí, cuando quieras, desde Ajustes › Suscripción.",
    },
    {
        pregunta: "¿Puedo irme?",
        respuesta: "Sí. Tus datos son tuyos: te llevas tu base de datos completa cuando quieras.",
    },
];

/**
 * Página de bienvenida de Olula SaaS: qué es, qué ofrece, planes y registro de empresa.
 * Es la página de acceso de quien llega sin sesión; el login queda en un enlace.
 */


/** Contacto comercial (el mismo de las landings de yeboyebo.es). */
const ENLACE_CONTACTO =
    "mailto:antonio@yeboyebo.es?subject=" + encodeURIComponent("Quiero información sobre Olula") +
    "&body=" + encodeURIComponent("Hola equipo de Yeboyebo,\n\nMe interesa Olula para mi empresa.\n\nGracias.");

/** Capturas reales del ERP (las de los mails de novedades), con su explicación. */
const FILAS_CAPTURAS = [
    {
        imagen: "/landing/Dashboard.png", ancho: 1130, alto: 560,
        alt: "Dashboard de ventas con lo facturado en el mes, la evolución de los últimos 12 meses y el reparto por agente",
        antetitulo: "Dashboards",
        titulo: "Tus números de un vistazo",
        texto: "Monta tus propios paneles con los datos del ERP, siempre al día.",
        puntos: [
            "Facturación, presupuestos y pedidos pendientes, con su variación",
            "Comparativa con el año anterior",
            "Cada persona ve su versión y la puede personalizar",
        ],
    },
    {
        imagen: "/landing/DashboardMapa.png", ancho: 1130, alto: 523,
        alt: "Mapa de España con las ventas y los clientes del año por provincia",
        antetitulo: "Análisis",
        titulo: "Sabe dónde vendes",
        texto: "Ventas y clientes por provincia sobre el mapa, para decidir dónde poner a tus comerciales y tu stock.",
        puntos: [
            "Mapas, rankings y gráficos sobre tus propios datos",
            "Datos al día, sin exportar nada a hojas de cálculo",
            "Pregúntale al asistente y te lo explica con tus cifras",
        ],
    },
    {
        imagen: "/landing/BancosConectados.png", ancho: 1108, alto: 961,
        alt: "Conexiones bancarias con los saldos de varias cuentas y su última sincronización",
        antetitulo: "Banca conectada",
        titulo: "Tus bancos, dentro del ERP",
        texto: "Conecta tus cuentas y los movimientos llegan solos, listos para conciliar con tus recibos y facturas.",
        puntos: [
            "Saldos de todas tus cuentas en una pantalla",
            "Conciliación con propuestas automáticas",
            "Cobros con tarjeta mediante enlace de pago",
        ],
    },
];

export const Landing = () => {
    const plan = usePlanRegistro();
    const { catalogo, cargando, periodicidad, setPlanId, setPeriodicidad } = plan;
    const [enviado, setEnviado] = useState(false);
    const { hash } = useLocation();

    // Enlace directo a un ancla (p. ej. desde el login): el router no hace scroll por sí solo.
    useEffect(() => {
        if (hash) irA(hash.slice(1));
    }, [hash]);

    const dias = diasPruebaDestacado(catalogo);
    const planMcp = primerPlanConMcp(catalogo);
    const tarjetas = catalogo ? construirTarjetasPlanes(catalogo, periodicidad) : [];

    const elegirPlan = (id: string) => {
        setPlanId(id);
        irA(ANCLA_REGISTRO);
    };

    return (
        <div className={estilos.pagina}>
            <header className={estilos.cabecera}>
                <div className={estilos.cabeceraContenido}>
                    <Link to="/bienvenida" className={estilos.logo} aria-label="Olula, inicio">
                        <OlulaWordmark color="currentColor" bowlColor="currentColor" className="" style={{ height: "1.75rem", width: "auto", display: "block" }} />
                    </Link>
                    <Link to="/login" className={estilos.entrar}>Entrar</Link>
                </div>
            </header>

            <main>
                <div className={estilos.heroFondo}>
                    <section className={`${estilos.seccion} ${estilos.hero}`}>
                        <h1>El ERP en la nube para tu pyme</h1>
                        <p className={estilos.lead}>
                            Almacén, TPV, contabilidad, CRM y un asistente con inteligencia artificial en un solo sitio,
                            con un precio por empresa y sin instalar nada.
                        </p>
                        <div className={estilos.heroAcciones}>
                            <button type="button" className={estilos.botonPrimario} onClick={() => irA(ANCLA_REGISTRO)}>
                                {textoCtaPrueba(dias)}
                            </button>
                            <button type="button" className={estilos.botonSecundario} onClick={() => irA(ANCLA_PLANES)}>
                                Ver planes
                            </button>
                        </div>
                        {dias > 0 && <p className={estilos.nota}>Sin tarjeta y sin compromiso.</p>}
                        <figure className={estilos.captura}>
                            <img src="/landing/ERPOnline.png" width={1138} height={603}
                                alt="Listado de facturas de Olula con el resumen de lo facturado, filtros y estados" />
                        </figure>
                    </section>
                </div>

                <section className={estilos.seccion} aria-labelledby="titulo-ventajas">
                    <h2 id="titulo-ventajas">Lo que encuentras en Olula</h2>
                    <ul className={estilos.ventajas}>
                        <li>
                            <h3>Un precio por empresa</h3>
                            <p>Cada plan incluye usuarios, sin pagar por cada persona que entra a trabajar.</p>
                        </li>
                        <li>
                            <h3>Asistente con IA en todos los planes</h3>
                            <p>Pregúntale por tus ventas, tu stock o tus clientes y te contesta con tus propios datos.</p>
                        </li>
                        <li>
                            <h3>Conecta tu ERP con Claude o ChatGPT</h3>
                            <p>
                                El conector MCP te deja usar tu ERP desde tu asistente favorito
                                {planMcp ? `, desde el plan ${planMcp}` : ""}.
                            </p>
                        </li>
                        <li>
                            <h3>Facturas con Verifactu</h3>
                            <p>Emite facturas que cumplen la normativa sin herramientas aparte.</p>
                        </li>
                        <li>
                            <h3>Almacén de verdad y TPV</h3>
                            <p>Stock por almacén, movimientos, inventarios y caja de tienda conectados con la facturación.</p>
                        </li>
                        <li>
                            <h3>Tus datos son tuyos</h3>
                            <p>Te llevas tu base de datos completa cuando quieras. Sin letra pequeña.</p>
                        </li>
                    </ul>
                </section>

                <section className={estilos.seccion} aria-labelledby="titulo-capturas">
                    <h2 id="titulo-capturas">Así se trabaja en Olula</h2>
                    <div className={estilos.filas}>
                        {FILAS_CAPTURAS.map((f) => (
                            <article key={f.imagen} className={estilos.fila}>
                                <figure className={estilos.captura}>
                                    <img src={f.imagen} width={f.ancho} height={f.alto} loading="lazy" alt={f.alt} />
                                </figure>
                                <div className={estilos.filaTexto}>
                                    <span className={estilos.antetitulo}>{f.antetitulo}</span>
                                    <h3>{f.titulo}</h3>
                                    <p>{f.texto}</p>
                                    <ul>
                                        {f.puntos.map((punto) => <li key={punto}>{punto}</li>)}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id={ANCLA_PLANES} className={estilos.seccion} aria-labelledby="titulo-planes">
                    <h2 id="titulo-planes">Planes</h2>
                    {catalogo && tarjetas.length > 0 ? (
                        <>
                            <div className={estilos.periodicidad} role="radiogroup" aria-label="Periodicidad de facturación">
                                {(["mensual", "anual"] as Periodicidad[]).map((p) => (
                                    <button key={p} type="button" role="radio" aria-checked={periodicidad === p}
                                        className={periodicidad === p ? estilos.activo : ""}
                                        onClick={() => setPeriodicidad(p)}>
                                        {p === "mensual" ? "Mensual" : "Anual"}
                                    </button>
                                ))}
                            </div>
                            <ul className={estilos.planes}>
                                {tarjetas.map((t) => (
                                    <li key={t.id} className={`${estilos.plan} ${t.destacado ? estilos.destacado : ""}`}>
                                        {t.destacado && <span className={estilos.etiqueta}>Recomendado</span>}
                                        <h3>{t.nombre}</h3>
                                        <p className={estilos.precio}>{t.precio}</p>
                                        {t.ahorro && <p className={estilos.ahorro}>{t.ahorro}</p>}
                                        {t.descripcion && <p className={estilos.descripcionPlan}>{t.descripcion}</p>}
                                        <ul className={estilos.incluye}>
                                            {t.usuarios && <li>{t.usuarios}</li>}
                                            {t.consultasIa && <li>{t.consultasIa}</li>}
                                            {t.modulos.map((m) => <li key={m}>{m}</li>)}
                                        </ul>
                                        {t.diasPrueba > 0 && <p className={estilos.nota}>{t.diasPrueba} días gratis, sin tarjeta</p>}
                                        <button type="button"
                                            className={t.destacado ? estilos.botonPrimario : estilos.botonSecundario}
                                            onClick={() => elegirPlan(t.id)}>
                                            Empezar con este plan
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className={estilos.nota}>Precios sin IVA.</p>
                        </>
                    ) : (
                        <p className={estilos.aviso} role="status">
                            {cargando
                                ? "Cargando planes…"
                                : "Ahora mismo no podemos mostrar los planes. Puedes crear tu empresa igualmente: empezarás con el plan Pro y su prueba gratuita."}
                        </p>
                    )}
                </section>

                <section id={ANCLA_REGISTRO} className={`${estilos.seccion} ${estilos.registro}`} aria-labelledby="titulo-registro">
                    <h2 id="titulo-registro">{enviado ? "Revisa tu correo" : "Crea tu empresa"}</h2>
                    {!enviado && dias > 0 && (
                        <p className={estilos.nota}>{dias} días gratis, sin tarjeta.</p>
                    )}
                    <div className={estilos.cajaRegistro}>
                        <FormularioRegistro plan={plan} tituloAviso={false} onEnviado={() => setEnviado(true)} />
                    </div>
                    <p className={estilos.yaCuenta}>
                        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
                    </p>
                </section>

                <div className={estilos.bandaFinal}>
                    <section className={estilos.seccion} aria-labelledby="titulo-faq">
                        <h2 id="titulo-faq">Preguntas frecuentes</h2>
                        <dl className={estilos.preguntas}>
                            {PREGUNTAS.map((p) => (
                                <div key={p.pregunta}>
                                    <dt>{p.pregunta}</dt>
                                    <dd>{p.respuesta}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className={estilos.contacto}>
                            <div>
                                <h3>¿Prefieres hablar con una persona?</h3>
                                <p>
                                    Te contamos cómo encaja Olula en tu empresa, te ayudamos a traer tus datos
                                    o a migrar desde Eneboo. Escríbenos y te respondemos nosotros, sin bots.
                                </p>
                            </div>
                            <a className={estilos.botonContacto} href={ENLACE_CONTACTO}>
                                Escríbenos
                            </a>
                        </div>
                    </section>
                </div>
            </main>

            <footer className={estilos.pie}>
                <div className={estilos.pieContenido}>
                    <span>
                        Olula es el ERP en la nube de{" "}
                        <a href="https://yeboyebo.es" target="_blank" rel="noopener noreferrer">yeboyebo</a>,
                        más de 15 años desarrollando software de gestión para empresas.
                    </span>
                    <nav className={estilos.pieEnlaces} aria-label="Enlaces del pie">
                        <a href={ENLACE_CONTACTO}>Contacto</a>
                        <a href="https://yeboyebo.es" target="_blank" rel="noopener noreferrer">yeboyebo.es</a>
                        <Link to="/login">Entrar</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
};
