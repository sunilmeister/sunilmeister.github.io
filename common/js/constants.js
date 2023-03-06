// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
const RESPIMATIC_UID_PREFIX = "UID_";
const DASHBOARD_APP_ID = "DASHBOARD";
const ANALYZER_APP_ID = "ANALYZER";

const zoomReminderOffCookieName = "ZOOM_REMINDER_COOKIE";
const editReminderOffCookieName = "EDIT_REMINDER_COOKIE";
const pdfReminderOffCookieName = "PDF_REMINDER_COOKIE";
const respimaticSystemsLocalStorage = "KNOWN_RESPIMATIC_SYSTEMS";
const uidCookieName = "RESPIMATIC_UID_COOKIE";
const tagCookieName = "RESPIMATIC_TAG_COOKIE";
const localStorageDbName = "respimatic_dbs";

const NO_BREATH = 0;
const MANDATORY_BREATH = 1;
const SPONTANEOUS_BREATH = 2;
const MAINTENANCE_BREATH = 3;

const MODE_DECODER = [
  "CMV",
  "ACV",
  "SIMV",
  "PSV",
];

const EI_DECODER = [
  "0:0",
  "1:1",
  "1:2",
  "1:3",
];

const TPS_DECODER = [
  { text: "10%", units: "(% Peak Flow)" },
  { text: "20%", units: "(% Peak Flow)" },
  { text: "30%", units: "(% Peak Flow)" },
  { text: "1.0", units: "(secs)" },
  { text: "1.5", units: "(secs)" },
  { text: "2.0", units: "(secs)" },
  { text: "2.5", units: "(secs)" }
] 

const INITIAL_STATE = 0;
const STANDBY_STATE = 1;
const ACTIVE_STATE = 2;
const ERROR_STATE = 3;

const SHAPE_MAX_CHARTS = 10;
const SHAPE_MAX_SAMPLES_PER_BREATH = 64
const SHAPE_MAX_SAMPLES_PER_SLICE = 8;
const SHAPE_MAX_SLICES = 8;

const MAX_CHART_DATAPOINTS = 60;
const CHART_XAXIS_MAX_TICK_MARKS = 25;
const CHART_FONT_SIZE = 50;
const CHART_INTERLACED_COLOR = 'white';
const CHART_HORIZONTAL_GRID_COLOR = '#8F99FB';

const CHART_CONTAINER_ID_PREFIX = "chartContainer";
const CHART_CONTAINER_TEMPLATE_ID = "chartContainerTemplate";
const CHART_EDIT_MENU_TEMPLATE_ID = "chartEditMenuTemplate";
const CHART_BODY_CLASS = "chartBody";
const CHART_EDIT_CHART_MENU_CLASS = "chartEditMenu";
const CHART_EDIT_CHART_MENU_ID = "chartDropDownMenu";
const CHART_CONTAINER_CLASS = "chartContainer";
const ALL_CHARTS_ID = "chartsDiv";
const CHART_CBOX_TREE_ROOT_ID = "chartCheckBoxTreeRoot";

const SHAPE_CONTAINER_ID_PREFIX = "shapeContainer";
const SHAPE_CONTAINER_TEMPLATE_ID = "shapeContainerTemplate";
const SHAPE_EDIT_MENU_TEMPLATE_ID = "shapeEditMenuTemplate";
const SHAPE_BODY_CLASS = "shapeBody";
const SHAPE_EDIT_SHAPE_MENU_CLASS = "shapeEditMenu";
const SHAPE_EDIT_SHAPE_MENU_ID = "shapeDropDownMenu";
const SHAPE_CONTAINER_CLASS = "shapeContainer";
const ALL_SHAPES_ID = "shapesDiv";
const SHAPE_CBOX_TREE_ROOT_ID = "shapeCheckBoxTreeRoot";

const SESSION_VERSION = "1.0";

const ZOOM_TITLE_STR = "PAGE ZOOM";
const ZOOM_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Use CTRL key and +/- keys to zoom " +
  "till the full page is visible." +
  "\n" +
  "Or hold down the CTRL key and use " +
  "the mouse wheel to zoom in/out." +
  "</pre></span>";

const ON_DEMAND_TITLE_STR = "On-Demand Breath Shape";
const ON_DEMAND_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Press 'View Breath Shapes' to view" +
  "</pre></span>";

const EDIT_ICON_TITLE_STR = "SELECT CHART ITEMS";
const EDIT_ICON_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Press EDIT (PEN icon) on the banner" +
  "\n" +
  "to select Chart items to display" +
  "</pre></span>";

const PDF_TITLE_STR = "INSTALL PDF VIEWER";
const PDF_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Install PDF Viewer Browser extension " +
  "for Online viewing" +
  "\n" +
  "Else you must download the file to view" +
  "</pre></span>";
