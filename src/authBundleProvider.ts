import axios from "axios";

import {
  getCheckinRequest,
  getDeviceConfigurationProto,
  getDeviceProperties,
  getUserAgent
} from "./builder/devicePropertyBuilder";

import {
  getCheckinHeaders,
  getDefaultHeaders
} from "./builder/headers";

import {
  getDefaultParams
} from "./builder/params";

import { GooglePlay } from "./compiled-proto";

import { Account, AnonymousAuthBundle, AuthBundle } from "./types";

import AndroidCheckinRequest = GooglePlay.AndroidCheckinRequest;
import AndroidCheckinResponse = GooglePlay.AndroidCheckinResponse;
import UploadDeviceConfigRequest = GooglePlay.UploadDeviceConfigRequest;
import ResponseWrapper = GooglePlay.ResponseWrapper;

export async function buildAuthBundle(account: Account, deviceConfig: any): Promise<AuthBundle> {
  const properties = deviceConfig;
  const userAgent = getUserAgent(properties);

  const androidCheckinResponse = await checkInDevice(properties);
  const uploadDeviceConfigResponse = await uploadDeviceConfig(
    properties,
    userAgent,
    androidCheckinResponse
  );

  const gsfId = androidCheckinResponse.androidId.toString(16);
  const deviceConfigToken = String(
    uploadDeviceConfigResponse?.uploadDeviceConfigToken
  );
  const deviceConsistencyToken =
    androidCheckinResponse.deviceCheckinConsistencyToken;

  return await generateAuthBundle(
    account,
    gsfId,
    userAgent,
    properties,
    "user",
    deviceConsistencyToken,
    deviceConfigToken
  );
}

export async function buildAnonymousAuthBundle(account: Account, deviceName: string): Promise<AnonymousAuthBundle> {
  // Load device config from server
  const deviceConfig = getDeviceProperties(deviceName);

  const authBundle: AuthBundle = await buildAuthBundle(account, deviceConfig)

  return {
    email: account.email,
    auth: authBundle.authToken,
  }
}

async function checkInDevice(properties: Record<string, any>) {
  const androidCheckinRequest =
    getCheckinRequest(properties);
  const encodedAndroidCheckinRequest = AndroidCheckinRequest.encode(
    androidCheckinRequest
  ).finish();

  const headers = getCheckinHeaders(properties);

  const { data } = await axios.post(
    "https://android.clients.google.com/checkin",
    encodedAndroidCheckinRequest,
    {
      headers: headers,
      responseType: "arraybuffer",
    }
  );

  return AndroidCheckinResponse.decode(data);
}

async function uploadDeviceConfig(
  properties: Record<string, any>,
  userAgent: string,
  androidCheckinResponse: AndroidCheckinResponse
) {
  const deviceConfigurationProto = getDeviceConfigurationProto(properties);
  const uploadDeviceConfigRequest = UploadDeviceConfigRequest.create({
    deviceConfiguration: deviceConfigurationProto,
  });
  const encodedUploadDeviceConfigRequest = UploadDeviceConfigRequest.encode(
    uploadDeviceConfigRequest
  ).finish();

  const payload = {
    userAgent,
    deviceConsistencyToken: androidCheckinResponse.deviceCheckinConsistencyToken,
    gsfId: androidCheckinResponse.androidId.toString(16),
    bearerToken: "",
  };

  const headers = getDefaultHeaders(payload);
  headers["Content-Type"] = "application/x-protobuf";

  const { data } = await axios.post(
    "https://android.clients.google.com/fdfe/uploadDeviceConfig",
    encodedUploadDeviceConfigRequest,
    {
      headers,
      responseType: "arraybuffer",
    },
  );

  return ResponseWrapper.decode(data)?.payload?.uploadDeviceConfigResponse;
}

async function generateAuthBundle(
  account: Account,
  gsfId: string,
  userAgent: string,
  properties: any,
  deviceName: string,
  consistencyToken: string,
  configToken: string
): Promise<AuthBundle> {
  const authUserAgentString = `GoogleAuth/1.4 (${properties["Build.DEVICE"]} ${properties["Build.ID"]})`;
  const headers = {
    app: "com.google.android.gms",
    device: gsfId,
    "User-Agent": authUserAgentString,
  };

  const params = getDefaultParams({
    email: account.email,
    aasToken: account.aasToken,
    gsfId: gsfId,
  }, properties);

  const { data } = await axios.post(
    "https://android.clients.google.com/auth",
    {

    },
    {
      headers: headers,
      params: params,
      responseType: "text",
    }
  );

  const authBundle = data
    .split("\n")
    .map((v: any) => v.split("="))
    // @ts-ignore
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  const tocResponse = await acceptTOC(
    {
      userAgent: userAgent,
      deviceConsistencyToken: consistencyToken,
      gsfId: gsfId,
      bearerToken: authBundle.Auth
    }
  )

  const dfeCookie = String(tocResponse?.cookie)

  return {
    aasToken: "REDACTED",
    ac2dmToken: "",
    androidCheckInToken: "",
    authToken: authBundle.Auth,
    deviceCheckInConsistencyToken: consistencyToken,
    deviceConfigToken: configToken,
    dfeCookie,
    experimentsConfigToken: "",
    gsfId,
    isAnonymous: true,
    locale: "en_US",
    tokenDispenserUrl: "https://auroraoss.com/api/auth",
    email: account.email,
    deviceInfoProvider: {
      authUserAgentString,
      localeString: "en_US",
      mccMnc: "310260",
      playServicesVersion: properties["GSF.version"],
      userAgentString: userAgent,
      sdkVersion: properties["Build.VERSION.SDK_INT"],
      properties,
    },
    userProfile: {
      name: "Anonymous",
      email: "anonymous@gmail.com",
      artwork: {
        url: "https://ssl.gstatic.com/docs/common/profile/llama_lg.png",
        type: 4,
        width: 129,
        height: 129,
      },
    }
  };
}

async function acceptTOC(payload: Record<string, any>): Promise<GooglePlay.ITocResponse | null | undefined> {
  const { data } = await axios.get(
    "https://android.clients.google.com/fdfe/toc",
    {
      headers: getDefaultHeaders(payload),
      responseType: "arraybuffer",
    }
  );

  return ResponseWrapper.decode(data)?.payload?.tocResponse;
}
