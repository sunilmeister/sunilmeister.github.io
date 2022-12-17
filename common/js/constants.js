// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
const RESPIMATIC_UID_PREFIX = "UID_";
const DASHBOARD_APP_ID      = "DASHBOARD";
const ANALYZER_APP_ID       = "ANALYZER";

const SPONTANEOUS_BREATH = 0;
const MANDATORY_BREATH   = 1;
const ERROR_BREATH       = 2;

const INITIAL_STATE = 0;
const STANDBY_STATE = 1;
const ACTIVE_STATE  = 2;
const ERROR_STATE   = 3;

const SHAPE_MAX_CHARTS             = 8;
const SHAPE_MAX_SAMPLES_PER_BREATH = 60
const SHAPE_MAX_SAMPLES_PER_SLICE  = 12;
const SHAPE_MAX_SLICES             = 5;

const MAX_CHART_DATAPOINTS        = 60;
const CHART_XAXIS_MAX_TICK_MARKS  = 25;
const CHART_FONT_SIZE             = 50;
const CHART_INTERLACED_COLOR      = 'white' ;
const CHART_HORIZONTAL_GRID_COLOR = '#8F99FB' ;

const CHART_CONTAINER_ID_PREFIX   = "chartContainer";
const CHART_CONTAINER_TEMPLATE_ID = "chartContainerTemplate";
const EDIT_MENU_TEMPLATE_ID       = "editMenuTemplate";
const CHART_BODY_CLASS            = "chartBody";
const EDIT_CHART_MENU_CLASS       = "chartEditMenu";
const EDIT_CHART_MENU_ID          = "chartDropDownMenu";
const CHART_CONTAINER_CLASS       = "chartContainer";
const ALL_CHARTS_ID               = "chartsDiv";
const CBOX_TREE_ROOT_ID           = "checkBoxTreeRoot";

const SESSION_VERSION             = "1.0";

const ZOOM_TITLE_STR = "PAGE ZOOM" ;
const ZOOM_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Use CTRL key and +/- keys to" +
  "\n" +
  "increase/decrease the page zoom level" +
  "\n" +
  "till the full page is visible." +
  "\n" +
  "\n" +
  "Or hold down the CTRL key and use" +
  "\n" +
  "the mouse wheel to zoom in/out." +
  "</pre></span>";

const ON_DEMAND_TITLE_STR = "On-Demand Breath Shape";
const ON_DEMAND_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'><pre>" +
  "Press 'View Breath Shapes' to view" + 
  "</pre></span>";
