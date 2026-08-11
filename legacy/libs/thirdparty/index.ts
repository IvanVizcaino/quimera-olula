import { useMediaQuery } from "@mui/material";
export {
  Alert,
  AppBar,
  Autocomplete,
  Avatar,
  Backdrop,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Accordion as ExpansionPanel,
  AccordionActions as ExpansionPanelActions,
  AccordionDetails as ExpansionPanelDetails,
  AccordionSummary as ExpansionPanelSummary,
  Fab,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  Grow,
  Icon,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slide,
  Slider,
  Snackbar,
  Step,
  StepConnector,
  StepContent,
  StepLabel,
  Stepper,
  SvgIcon,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  Zoom
} from "@mui/material";
export { createTheme } from "@mui/material/styles";
export { makeStyles, ThemeProvider, useTheme } from "@mui/styles";
export {
  DatePicker,
  DateTimePicker,
  LocalizationProvider as MuiPickersUtilsProvider,
  TimePicker
} from "@mui/x-date-pickers";
export { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
export { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
export { TreeItem, SimpleTreeView as TreeView } from "@mui/x-tree-view";
export { Chart } from "chart.js";
export { default as ChartAnnotation } from "chartjs-plugin-annotation";
export { default as clsx } from "clsx";
export * as d3 from "d3";
export {
  addDays,
  addMonths,
  differenceInDays,
  endOfMonth,
  format,
  formatRelative,
  getDay,
  isSameMonth,
  isToday,
  setDay,
  subDays,
  subMonths
} from "date-fns";
export * as localesFns from "date-fns/locale";
export { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
export { initReactI18next, Trans, useTranslation } from "react-i18next";
export { default as InfiniteScroll } from "react-infinite-scroll-component";
export { NumericFormat as NumberFormat } from "react-number-format";
export { default as Plot } from "react-plotly.js";
export { default as SignaturePad } from "react-signature-canvas";
export {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  Type as SwipeListType,
  TrailingActions
} from "react-swipeable-list";

export const adaptV4Theme = (v: unknown) => v;

// Re-export keyboard pickers as aliases (they no longer exist separately in MUI v7)
export {
  DatePicker as KeyboardDatePicker,
  DateTimePicker as KeyboardDateTimePicker,
  TimePicker as KeyboardTimePicker
} from "@mui/x-date-pickers";

// //////////////////////////////////////////////////////////////////////////////////

export const isWidthUp = (breakpoint: number) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme => theme.breakpoints.up(breakpoint));
};

export const Hidden = ({ mdUp, smDown, children }: { mdUp?: boolean; smDown?: boolean; children: React.ReactNode }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hiddenMdUp = mdUp && useMediaQuery(theme => theme.breakpoints.up("md"));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hiddenSmDown = smDown && useMediaQuery(theme => theme.breakpoints.down("sm"));
  const hidden = hiddenMdUp || hiddenSmDown;

  return hidden ? null : children;
};

export { default as createCache } from "@emotion/cache";
export { CacheProvider } from "@emotion/react";

