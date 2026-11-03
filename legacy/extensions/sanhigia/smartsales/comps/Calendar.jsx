import { Icon, IconButton } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { useState } from "react";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const pad = n => n.toString().padStart(2, "0");
const isoDate = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const todayIso = () => {
  const now = new Date();

  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
};

const getDayArray = (year, month) => {
  const first = new Date(year, month, 1).getDay() || 7;
  const lastDay = new Date(year, month + 1, 0);
  const dayArray = new Array(lastDay.getDate()).fill(null).map((_, idx) => idx + 1);
  new Array(first - 1).fill(null).forEach(_ => dayArray.unshift("."));
  new Array((7 - lastDay.getDay()) % 7).fill(null).forEach(_ => dayArray.push("."));

  return dayArray;
};

const useStyles = makeStyles(theme => ({
  wrapper: {
    padding: "8px 0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
  },
  title: {
    fontSize: "1.3em",
    margin: 0,
    cursor: "pointer",
    flexGrow: 1,
    textAlign: "center",
  },
  list: {
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    padding: "0 10px",
    margin: "5px 0",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  selectable: {
    cursor: "pointer",
  },
  past: {
    color: theme.palette.grey[400],
  },
  future: {
    color: "#505050",
  },
  today: {
    color: "white",
    backgroundColor: "red",
  },
  selected: {
    color: "white",
    backgroundColor: "#505050",
  },
  day: {
    borderRadius: "100%",
    // padding: '5px 0',
    display: "grid",
    placeContent: "center",
    aspectRatio: 1,
    margin: "0 7px",
    fontSize: "1.3em",
    fontWeight: "bold",
  },
  points: {
    marginLeft: "-4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0",
    flexGrow: "0",
    flexBasis: "5px",
    maxHeight: "5px",
  },
  tarea: {
    width: "8px",
    color: "red",
    fontSize: "3em",
  },
  trato: {
    width: "8px",
    color: "green",
    fontSize: "3em",
  },
}));

const Day = ({ item, fecha, hoy, seleccionado, tareas, tratos, onClick }) => {
  const classes = useStyles();
  const esHoy = fecha === hoy;
  const seleccionable = item !== "." && !esHoy;

  let dayClasses = classes.day;
  item === "." && (dayClasses += ` ${classes.past}`);
  item !== "." && fecha < hoy && (dayClasses += ` ${classes.past}`);
  item !== "." && fecha > hoy && (dayClasses += ` ${classes.future}`);
  esHoy && (dayClasses += ` ${classes.today}`);
  seleccionable && fecha === seleccionado && (dayClasses += ` ${classes.selected}`);

  return (
    <li
      className={`${classes.item} ${seleccionable ? classes.selectable : ""}`}
      onClick={() => seleccionable && onClick(fecha)}
    >
      <span className={dayClasses}>{item === "." ? "." : pad(item)}</span>
      <span className={classes.points}>
        {!esHoy &&
          tareas &&
          new Array(tareas).fill(null).map((t, idx) => (
            idx < 5 && (
              <span key={idx} className={classes.tarea}>
                ·
              </span>
            )
          ))}
        {!esHoy &&
          tratos &&
          new Array(tratos).fill(null).map((t, idx) => (
            idx < 5 && (
              <span key={idx} className={classes.trato}>
                ·
              </span>
            )
          ))}
      </span>
    </li>
  );
};

export default function Calendar({ tareas, tratos, seleccionado, onDayClick }) {
  const classes = useStyles();
  const hoy = todayIso();
  const [full, setFull] = useState(false);
  const [visible, setVisible] = useState(() => {
    const now = new Date();

    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const dayArray = getDayArray(visible.year, visible.month);
  const fechaDe = item => (item === "." ? null : isoDate(visible.year, visible.month, item));

  const foco = seleccionado ?? hoy;
  const idxFoco = dayArray.findIndex(i => fechaDe(i) === foco);
  const week = parseInt(Math.max(idxFoco, 0) / 7);
  const days = full ? dayArray : dayArray.slice(week * 7, week * 7 + 7);

  const cambiarMes = delta => {
    const fecha = new Date(visible.year, visible.month + delta, 1);
    setVisible({ year: fecha.getFullYear(), month: fecha.getMonth() });
  };

  const toggleFull = () => {
    if (full) {
      const [year, month] = foco.split("-").map(n => parseInt(n));
      setVisible({ year, month: month - 1 });
    }
    setFull(!full);
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        {full && (
          <IconButton size="small" onClick={() => cambiarMes(-1)}>
            <Icon>chevron_left</Icon>
          </IconButton>
        )}
        <h1 className={classes.title} onClick={toggleFull}>
          {`${months[visible.month]} ${visible.year}`}
          <Icon style={{ verticalAlign: "middle" }}>{full ? "expand_less" : "expand_more"}</Icon>
        </h1>
        {full && (
          <IconButton size="small" onClick={() => cambiarMes(1)}>
            <Icon>chevron_right</Icon>
          </IconButton>
        )}
      </div>
      <ol className={classes.list}>
        {days.map((i, idx) => (
          <Day
            key={idx}
            item={i}
            fecha={fechaDe(i)}
            hoy={hoy}
            seleccionado={seleccionado}
            tareas={tareas[fechaDe(i)]}
            tratos={tratos[fechaDe(i)]}
            onClick={fecha => onDayClick?.(fecha === seleccionado ? null : fecha)}
          />
        ))}
      </ol>
    </div>
  );
}
