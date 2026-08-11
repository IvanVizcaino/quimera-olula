import { makeStyles, useTheme } from "@quimera/styles";
import { A, useAppValue, useWidth } from "quimera";
import { useState } from "react";

import { Can, MultiIcon } from "../";

const useAppStyles = makeStyles(theme => ({
  menu: {
    marginTop: "15px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    color: theme.custom.menu.main,
  },
  details: {
    flexBasis: "50%",
    padding: "1%",
    boxSizing: "border-box",
  },
  detailsMin: {
    flexBasis: "100%",
  },
  summary: {
    pointerEvents: "none",
    listStyle: "none",
  },
  hr: {
    borderColor: theme.custom.menu.accent,
  },
  appList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    justifyItems: "flex-start",
    width: "100%",
    margin: "20px 0%",
    listStyle: "none",
    padding: "0px",
  },
  appItem: {
    "flexBasis": "33%",
    "padding": "1%",
    "boxSizing": "border-box",
    "borderRadius": "5px",
    "transition": "all .2s ease-in-out",
    "&:hover": {
      transform: "scale(1.2)",
      // fontWeight: "bold",
    },
  },
  appItemContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
  },
  appIcon: {
    "filter": "drop-shadow(5px 5px 5px rgba(26, 28, 44, 0.3))",
    "&:hover > box > span": {
      cursor: "pointer",
    },
  },
  appTitle: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "11pt",
    color: theme.custom.menu.main,
  },
}));

const useSideStyles = makeStyles(theme => ({
  menu: {
    marginTop: "3%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: theme.custom.menu.main,
    color: theme.custom.menu.light,
    minWidth: "250px",
  },
  details: {
    flexBasis: "100%",
    margin: "1% 2% 0%",
    boxSizing: "border-box",
  },
  summary: {
    pointerEvents: "none",
    listStyle: "none",
  },
  hr: {
    borderColor: theme.custom.menu.accent,
  },
  appList: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    listStyle: "none",
    padding: "0px",
    margin: "0 0 5%",
  },
  appItem: {
    "padding": "2% 3%",
    "boxSizing": "border-box",
    "borderRadius": "5px 5px 5px 5px",
    "&:hover": {
      backgroundColor: theme.custom.menu.light,
    },
    "&:hover > a > span": {
      fontWeight: "bold",
      color: theme.custom.menu.main,
    },
    "&:hover > box > span": {
      cursor: "pointer",
      fontWeight: "bold",
      color: theme.custom.menu.main,
    },
  },
  appItemContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textDecoration: "none",
  },
  appIcon: {
    flexBasis: "20%",
    flexGrow: "0",
    marginRight: "5px",
  },
  appTitle: {
    flexGrow: "1",
    color: theme.custom.menu.light,
    fontSize: "11pt",
  },
}));

const translate = (key, fallback) => {
  return fallback;
  // const { t } = useTranslation();
  // const tr = t(key);

  // return tr === key ? fallback : tr;

  // const groupTitle = trGroupTitle !== '-'
  //   ? trGroupTitle
  //   : group.title, default
};

function AppMenu({ structure, size, variant = "app", closeCallback }) {
  const theme = useTheme();
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  // const { t } = useTranslation();
  const [{ user }, appDispatch] = useAppValue();


  const variants = {
    app: {
      color: theme.custom.menu.main,
      alternative: theme.custom.menu.main,
      styles: useAppStyles,
      size: 60,
    },
    side: {
      color: theme.custom.menu.light,
      alternative: theme.custom.menu.main,
      styles: useSideStyles,
      size: 25,
    },
  };

  const [hoveredItem, setHoveredItem] = useState(null);
  const classes = (variants[variant]?.styles ?? useAppStyles)();

  function miItemMenu(item, groupKey, itemKey, title) {
    return (
      <>
        <MultiIcon
          lgColor={
            hoveredItem?.title === item.title
              ? variants[variant]?.alternative
              : variants[variant]?.color
          }
          smColor={item.color && item.variant && theme.palette[item.color][item.variant]}
          fontSize={size ?? variants[variant]?.size}
          className={classes.appIcon}
        >
          {item.icons}
        </MultiIcon>
        <span className={classes.appTitle}>
          {translate(`appmenu.${groupKey}.items.${itemKey}`, title)}
        </span>
      </>
    );
  }

  return (
    <section className={classes.menu}>
      {Object.entries(structure).map(([groupKey, group]) => {
        const menuGroup = (
          <details
            key={groupKey}
            className={`${classes.details} ${mobile ? classes.detailsMin : ""}`}
            open
          >
            <summary className={classes.summary}>
              <strong>{translate(`appmenu.${groupKey}.title`, group?.title)}</strong>
            </summary>
            <hr className={classes.hr} />
            <ul className={classes.appList}>
              {Object.entries(group.items).map(([itemKey, item]) => {
                const title = typeof item?.title === "function" ? item.title(user) : item?.title;
                const menuItem = (
                  <li
                    key={itemKey}
                    className={classes.appItem}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={closeCallback}
                  >
                    {item.type === "appDispatch" ? (
                      <box
                        className={classes.appItemContent}
                        // onClick={() =>
                        //   util.getSetting("appDispatch")({
                        //     type: item.appDispatch.type,
                        //     payload: item.appDispatch.payload,
                        //   })
                        // }
                        onClick={() =>
                          appDispatch({
                            type: item.appDispatch.type,
                            payload: item.appDispatch.payload,
                          })
                        }
                      >
                        {miItemMenu(item, groupKey, itemKey, title)}
                      </box>
                    ) : (
                      <A href={item.url} className={classes.appItemContent}>
                        {miItemMenu(item, groupKey, itemKey, title)}
                      </A>
                    )}
                  </li>
                );

                return item.rule ? (
                  <Can key={item.title} rule={item.rule}>
                    {menuItem}
                  </Can>
                ) : (
                  menuItem
                );
              })}
            </ul>
          </details>
        );

        return (
          <Can key={group.title} rules={Object.values(group.items).map(item => item.rule)}>
            {menuGroup}
          </Can>
        );
      })}
    </section>
  );
}

export default AppMenu;
