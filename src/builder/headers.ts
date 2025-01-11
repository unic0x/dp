
import { getUserAgent } from "./devicePropertyBuilder";

function getCheckinHeaders(payload: Record<string, string>): Record<string, string> {
  return {
    app: "com.google.android.gms",
    "Content-Type": "application/x-protobuffer",
    Host: "android.clients.google.com",
    "User-Agent": getUserAgent(payload),
  };
}

function getDefaultHeaders(payload: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${payload.bearerToken}`,
    "X-DFE-Encoded-Targets": "",
    "User-Agent": payload.userAgent,
    "X-DFE-Cookie": payload.dfeCookie,
    "X-DFE-Content-Filters": "",
    "X-DFE-Device-Checkin-Consistency-Token": payload.deviceConsistencyToken,
    "X-DFE-Device-Config-Token": payload.deviceConfigToken,
    "X-DFE-MCCMNC": "21601",
    "X-DFE-Client-Id": "am-android-google",
    "X-DFE-UserLanguages": "en",
    "X-DFE-Phenotype": "",
    "X-DFE-Device-Id": payload.gsfId,
    "X-DFE-Network-Type": "4",
    "Accept-Language": "en",
    "X-DFE-Request-Params": "timeoutMs=4000",
    "X-DFE-Enabled-Experiments": "cl:billing.select_add_instrument_by_default",
    "X-DFE-Unsupported-Experiments": "nocache:billing.use_charging_poller,market_emails,buyer_currency,prod_baseline,checkin.set_asset_paid_app_field,shekel_test,content_ratings,buyer_currency_in_app,nocache:encrypted_apk,recent_changes",
    "Host": "android.clients.google.com"
  };
}

export {
  getCheckinHeaders,
  getDefaultHeaders
};
