export interface AuthBundle {
  aasToken?: string;
  ac2dmToken?: string;
  androidCheckInToken?: string;
  authToken: string;
  deviceCheckInConsistencyToken: string;
  deviceConfigToken: string;
  deviceInfoProvider?: DeviceInfoProvider;
  dfeCookie: string;
  email: string;
  experimentsConfigToken: string;
  gcmToken?: string;
  gsfId: string;
  isAnonymous: boolean;
  locale: string;
  oAuthLoginToken?: string;
  tokenDispenserUrl: string;
  userProfile?: UserProfile;
}

export interface AnonymousAuthBundle {
  email: string;
  auth: string;
}

export interface Account {
  email: string;
  aasToken: string;
  password?: string;
}

export interface DeviceInfoProvider {
  authUserAgentString: string;
  localeString: string;
  mccMnc: string;
  playServicesVersion: number;
  properties?: any;
  userAgentString: string;
  sdkVersion: number;
}

export interface UserProfile {
  name: string;
  email: string;
  artwork: Artwork;
}

export interface Artwork {
  url: string;
  urlAlt?: string;
  type: number;
  width: number;
  height: number;
  aspectRatio?: number;
}
