// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
const CURRENT_RECORDING_VERSION = "1.0";

////////////////////////////////////////////////////////////////////////////////
// Switch between using dweetio.listen_for and inspireListenFor
// by changing the constant USE_DWEET_FOR_MESSAGES
////////////////////////////////////////////////////////////////////////////////
const USE_DWEET_FOR_MESSAGES = false;
const MESSAGE_LISTEN_INTERVAL_IN_MS = 500;
const MAX_DASHBOARD_PING_DELAY_IN_MS = 2000;

const INSPIRE_UID_PREFIX = "UID_";
const DASHBOARD_APP_ID = "DASHBOARD";
const ANALYZER_APP_ID = "ANALYZER";
const RECORDER_APP_ID = "RECORDER";
const BROADCAST_UID = INSPIRE_UID_PREFIX + "0000000000000000";

const zoomReminderOffCookieName = "ZOOM_REMINDER_COOKIE";
const editReminderOffCookieName = "EDIT_REMINDER_COOKIE";
const pdfReminderOffCookieName = "PDF_REMINDER_COOKIE";
const inspireSystemsLocalStorage = "KNOWN_INSPIRE_SYSTEMS";
const inspireDashboardsLocalStorage = "INSPIRE_DASHBOARDS";
const uidCookieName = "INSPIRE_UID_COOKIE";
const tagCookieName = "INSPIRE_TAG_COOKIE";
const localStorageDbName = "inspire_dbs";

const NO_BREATH = 0;
const MANDATORY_BREATH = 1;
const SPONTANEOUS_BREATH = 2;
const MAINTENANCE_BREATH = 3;
const FLOW_FILTER_WINDOW = 16;

const NOTIFICATION_YVAL = 5;
const WARNING_YVAL = 6;
const ERROR_YVAL = 7;

const ANIMATE_NUMBER_DURATION = 1000;
const TILE_UPDATE_INTERVAL_IN_MS = 2000;
const TILE_REDRAW_INTERVAL_IN_MS = 2000;

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
  { text: "40%", units: "(% Peak Flow)" },
  { text: "50%", units: "(% Peak Flow)" },
  { text: "60%", units: "(% Peak Flow)" },
  { text: "1.0", units: "(secs)" },
  { text: "1.5", units: "(secs)" },
  { text: "2.0", units: "(secs)" },
  { text: "2.5", units: "(secs)" }
] 

const INITIAL_STATE = 0;
const STANDBY_STATE = 1;
const ACTIVE_STATE = 2;
const ERROR_STATE = 3;

// For calculating flow from deltaP Q
const Q_SCALE_FACTOR = 8;

const WAVE_NUM_ROLLING_BREATHS = 12;
const WAVE_ALERT_THRESHOLD = 40;
const WAVE_MAX_SAMPLES_PER_BREATH = 32
const WAVE_MAX_SAMPLES_PER_SLICE = 8;
const WAVE_MAX_SLICES = 8;

const CHART_NUM_ROLLING_BREATHS = 60;
const CHART_ALERT_THRESHOLD = 500;
const CHART_XAXIS_MAX_TICK_MARKS = 25;
const CHART_FONT_SIZE = 50;
const CHART_INTERLACED_COLOR = 'white';
const CHART_HORIZONTAL_GRID_COLOR = '#8F99FB';

const EDIT_ICON_CLASS = "editIconButton";

const CHART_CONTAINER_ID_PREFIX = "chartContainer";
const CHART_CONTAINER_TEMPLATE_ID = "chartContainerTemplate";
const CHART_EDIT_MENU_TEMPLATE_ID = "chartEditMenuTemplate";
const CHART_BODY_CLASS = "chartBody";
const CHART_BANNER_CLASS = "chartBanner";
const CHART_EDIT_CHART_MENU_CLASS = "chartEditMenu";
const CHART_EDIT_CHART_MENU_ID = "chartDropDownMenu";
const CHART_CONTAINER_CLASS = "chartContainer";
const ALL_CHARTS_ID = "chartsDiv";
const CHART_CBOX_TREE_ROOT_ID = "chartCheckBoxTreeRoot";

const STAT_NUM_ROLLING_BREATHS = 120;
const ALERT_NUM_ROLLING_BREATHS = 120;

const WAVE_CONTAINER_ID_PREFIX = "waveContainer";
const WAVE_CONTAINER_TEMPLATE_ID = "waveContainerTemplate";
const WAVE_EDIT_MENU_TEMPLATE_ID = "waveEditMenuTemplate";
const WAVE_BODY_CLASS = "waveBody";
const WAVE_BANNER_CLASS = "waveBanner";
const WAVE_EDIT_WAVE_MENU_CLASS = "waveEditMenu";
const WAVE_EDIT_WAVE_MENU_ID = "waveDropDownMenu";
const WAVE_CONTAINER_CLASS = "waveContainer";
const ALL_WAVES_ID = "wavesDiv";
const WAVE_CBOX_TREE_ROOT_ID = "waveCheckBoxTreeRoot";

const ZOOM_TITLE_STR = "PAGE ZOOM";
const ZOOM_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'>" +
	"I will close in <b></b> seconds" + 
	"<pre>" +
  "\nUse CTRL key and +/- keys to zoom " +
  "\ntill the full page is visible." +
  "\n" +
  "\nOr hold down the CTRL key and use " +
  "\nthe mouse wheel to zoom in/out." +
  "</pre></span>";

const ON_DEMAND_TITLE_STR = "On-Demand Breath Waveform";
const ON_DEMAND_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Press 'View Waveforms' to view" +
  "</pre></span>";

const EDIT_ICON_TITLE_STR = "SELECT CHART ITEMS";
const EDIT_ICON_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Press EDIT (PEN icon) on the banner" +
  "\n" +
  "to select Chart items to display" +
  "</pre></span>";

const PDF_TITLE_STR = "INSTALL PDF VIEWER";
const PDF_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Either Install PDF Viewer Browser extension " +
  "\n" +
  "Else you must download the file to view" +
  "</pre></span>";

const RECORDING_STOP_TITLE = "Stop Recording";
const RECORDING_STOP_MSG = "<span style='font-size:var(--swalTextFontSize);'><pre>"
  + "If STOPPED, a new recording can be started\n"
  + "with a new name during this session\n"
  + "\n"
  + "If PAUSED, the same recording can be resumed\n"
  + "at a later time during this session\n"
  + "</pre></span>"
