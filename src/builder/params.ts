function getDefaultParams(payload: Record<string, string>, properties: any): Record<string, string> {
  return {
    app: "com.android.vending",
    oauth2_foreground: "1",
    Email: payload.email,
    token_request_options: "CAA4AVAB",
    client_sig: "38918a453d07199354f8b19af05ec6562ced5788",
    Token: payload.aasToken,
    google_play_services_version: `${properties["GSF.version"]}`,
    check_email: "1",
    system_partition: "1",
    sdk_version: `${properties["Build.VERSION.SDK_INT"]}`,
    callerPkg: "com.google.android.gms",
    device_country: "IN",
    lang: "en",
    androidId: payload.gsfId,
    callerSig: "38918a453d07199354f8b19af05ec6562ced5788",
    service: "oauth2:https://www.googleapis.com/auth/googleplay"
  };
}

export {
  getDefaultParams
};
