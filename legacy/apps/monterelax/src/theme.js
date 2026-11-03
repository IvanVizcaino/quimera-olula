import { mainTheme } from "quimera";

const palette = {
  primary: {
    light: "#7986cb",
    main: "#3f51b5",
    dark: "#303f9f",
  },
};

export default {
  ...mainTheme,
  palette: {
    ...mainTheme.palette,
    mode: "light",
    warning: {
      main: "#ff9800",
    },
    success: {
      main: "#4caf50",
    },
    common: {
      button: "#225DD4",
      seleccionado: "#DC5B80",
      ok: "#4caf50",
      white: "#ffffff",
    },
    ok: "#FF0000",
  },
  overrides: {
    MuiOutlinedInput: {
      adornedEnd: {
        paddingRight: "0px",
      },
      adornedStart: {
        paddingLeft: "0px",
      },
    },
    MuiInputLabel: {
      root: {
        "textTransform": "uppercase",
        "&$focused": {
          // color: palette.primary.dark
        },
      },
    },
    MuiInputBase: {
      root: {
        "&$disabled": {
          color: "rgba(0, 0, 0, 0.87)",
        },
      },
    },
    MuiInput: {
      root: {
        "&$focused": {
          // border: '1px solid ' + palette.primary.dark
        },
      },
    },
    MuiIconButton: {
      root: {
        "color": palette.primary.main,
        "&$disabled": {
          color: "lightgrey",
        },
        "&:hover": {
          color: palette.primary.dark,
        },
        "&:active": {
          color: palette.primary.light,
        },
      },
    },
    // ,
    // MuiTypography: {
    //   h5: {
    //     fontWeight: '400',
    //     color: 'black'
    //   }
    // }
  },
  custom: {
    menu: {
      ...mainTheme.custom.menu,
      main: "#222",
    },
    scroll: {
      ...mainTheme.custom.scroll,
      main: "#222",
      alternative: "#6f6f6f",
      light: "#9b9b9b",
    },
  },
};
