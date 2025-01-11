import path from "path";
import { propertiesToJson } from "properties-file";
import { GooglePlay } from "../compiled-proto";

import DeviceFeature = GooglePlay.DeviceFeature;
import DeviceConfigurationProto = GooglePlay.DeviceConfigurationProto;
import AndroidCheckinRequest = GooglePlay.AndroidCheckinRequest;
import AndroidBuildProto = GooglePlay.AndroidBuildProto;
import AndroidCheckinProto = GooglePlay.AndroidCheckinProto;

function getDeviceProperties(deviceName: string) {
  try {
    return propertiesToJson(
      path.resolve(`/usr/app/resources/${deviceName}.properties`)
    );
  } catch (e) {
    return propertiesToJson(
      path.resolve(`resources/${deviceName}.properties`)
    );
  }
}

function getUserAgent(properties: Record<string, string>): string {
  const platforms = properties["Platforms"].split(",").join(";");

  const deviceProperties = {
    api: 3,
    versionCode: properties["Vending.version"],
    sdk: properties["Build.VERSION.SDK_INT"],
    device: properties["Build.DEVICE"],
    hardware: properties["Build.HARDWARE"],
    product: properties["Build.PRODUCT"],
    platformVersionRelease: properties["Build.VERSION.RELEASE"],
    model: properties["Build.MODEL"],
    buildId: properties["Build.ID"],
    isWideScreen: 0,
    supportedAbis: platforms,
  };

  const devicePropertiesString = Object.entries(deviceProperties)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");

  return `Android-Finsky/${properties["Vending.versionString"]} (${devicePropertiesString})`;
}

function getDeviceConfigurationProto(properties: Record<string, string>) {
  const deviceFeatures = properties["Features"]
    .split(",")
    .map((val: string) =>
      DeviceFeature.fromObject({
        name: val,
        value: 0,
      })
    );

  return DeviceConfigurationProto.fromObject({
    touchScreen: Number(properties["TouchScreen"]),
    keyboard: Number(properties["Keyboard"]),
    navigation: Number(properties["Navigation"]),
    screenLayout: Number(properties["ScreenLayout"]),
    hasHardKeyboard: Boolean(properties["HasHardKeyboard"]),
    hasFiveWayNavigation: Boolean(properties["HasFiveWayNavigation"]),
    lowRamDevice: Boolean(properties["LowRamDevice"]),
    maxNumOf_CPUCores: Number(properties["MaxNumOfCPUCores"]),
    totalMemoryBytes: Number(properties["TotalMemoryBytes"]),
    glEsVersion: Number(properties["GL.Version"]),
    glExtension: properties["GL.Extensions"].split(","),
    systemSharedLibrary: properties["SharedLibraries"].split(","),
    systemAvailableFeature: properties["Features"].split(","),
    nativePlatform: properties["Platforms"].split(","),
    screenDensity: Number(properties["Screen.Density"]),
    screenWidth: Number(properties["Screen.Width"]),
    screenHeight: Number(properties["Screen.Height"]),
    systemSupportedLocale: properties["Locales"].split(","),
    deviceClass: 0,
    deviceFeature: deviceFeatures,
  });
}

function getCheckinRequest(properties: Record<string, string>): AndroidCheckinRequest {
  const androidBuildProto = AndroidBuildProto.fromObject({
    id: properties["Build.FINGERPRINT"],
    product: properties["Build.HARDWARE"],
    career: properties["Build.BRAND"],
    radio: properties["Build.RADIO"],
    bootloader: properties["Build.BOOTLOADER"],
    device: properties["Build.DEVICE"],
    sdkVersion: properties["Build.VERSION.SDK_INT"],
    model: properties["Build.MODEL"],
    manufacturer: properties["Build.MANUFACTURER"],
    buildProduct: properties["Build.PRODUCT"],
    client: properties["Client"],
    otsInstalled: Boolean(properties["OtaInstalled"]),
    timeStamp: Date.now(),
    googleServices: properties["GSF.version"],
  });

  const androidCheckinProto = AndroidCheckinProto.create({
    build: androidBuildProto,
    lastCheckinMsec: 0,
    cellOperator: properties["CellOperator"],
    simOperator: properties["SimOperator"],
    roaming: properties["Roaming"],
    userNumber: 0,
  });

  return AndroidCheckinRequest.create({
    id: 0,
    checkin: androidCheckinProto,
    locale: "en",
    timeZone: properties["TimeZone"],
    version: 3,
    deviceConfiguration: getDeviceConfigurationProto(properties),
    fragment: 0,
  });
}

export {
  getCheckinRequest,
  getDeviceConfigurationProto,
  getDeviceProperties,
  getUserAgent
};

