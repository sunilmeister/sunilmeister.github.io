// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
const CURRENT_RECORDING_VERSION = "1.0";
const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const MESSAGE_LISTEN_INTERVAL_IN_MS = 350;
const MAX_DASHBOARD_PING_DELAY_IN_MS = 2000;

const INSPIRE_UID_PREFIX = "UID_";
const DASHBOARD_APP_ID = "DASHBOARD";
const MINI_DASHBOARD_APP_ID = "MINI_DASHBOARD";
const PLAYBACK_APP_ID = "PLAYBACK";
const RECORDER_APP_ID = "RECORDER";
const BROADCAST_UID = INSPIRE_UID_PREFIX + "0000000000000000";

const editReminderOffCookieName = "EDIT_REMINDER_COOKIE";
const inspireSystemsLocalStorage = "KNOWN_INSPIRE_SYSTEMS";
const inspireDashboardsLocalStorage = "INSPIRE_DASHBOARDS";
const uidCookieName = "INSPIRE_UID_COOKIE";
const tagCookieName = "INSPIRE_TAG_COOKIE";
const localStorageDbName = "inspire_dbs";

const FLOW_FILTER_WINDOW = 16;

const NO_BREATH = 0;
const MANDATORY_BREATH = 1;
const SPONTANEOUS_BREATH = 2;
const MAINTENANCE_BREATH = 3;

const RESET_NONE = 0;
const RESET_PENDING = 1;
const RESET_TIMEOUT = 2;
const RESET_CONFIRMED = 3;
const RESET_DECLINED = 4;
const RESET_CONFIRMATION_TIMEOUT_IN_MS  = 15000;

const VOLUME_CONTROL = 0;
const PRESSURE_SUPPORT = 1;
const VOLUME_CONTROL_YVAL = 9;
const PRESSURE_SUPPORT_YVAL = 10;

const NOTIFICATION_YVAL = 5;
const WARNING_YVAL = 6;
const ERROR_YVAL = 7;

const ANIMATE_NUMBER_DURATION = 1000;
const BLINK_INTERVAL_IN_MS = 3000;
const FAST_BLINK_INTERVAL_IN_MS = 1000;
const FASTEST_BLINK_INTERVAL_IN_MS = 400;
const TILE_UPDATE_INTERVAL_IN_MS = 2000;
const TILE_REDRAW_INTERVAL_IN_MS = 2000;

const SNAPSHOT_FORWARD_SPAN_IN_SECS = 5;
const SNAPSHOT_REWIND_SPAN_IN_SECS = 5;

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

const INITIAL_STATE = 0;
const STANDBY_STATE = 1;
const ACTIVE_STATE = 2;
const ERROR_STATE = 3;

