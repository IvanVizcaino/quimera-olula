export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      "@global": {
        "*::-webkit-scrollbar": {
          width: "10px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: "5px",
          background: theme.palette.scroll.alternative,
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: theme.palette.scroll.light,
        },
      },
    };
  };
};
