# Store

To download directly from the Google Play Store, first you'll have to obtain an OAuth token by visiting the Google [embedded setup page](https://accounts.google.com/EmbeddedSetup)

- Opening the browser debugging console on `Network` tab
- Logging in
- If the "Google Terms of Services" pop up, click `I agree` (it can hang up on this step but it's not important)
- Select the last request from `accounts.google.com` in the `Network` tab
- Select the `Cookies` tab of this request
- One of the response cookie is `oauth_token`
- Copy the `value` field (it must start with `oauth2_4/`)

It can only be used once, in order to obtain the AAS token which can be used subsequently. To obtain this token:

```shell
apkeep -e 'someone@gmail.com' --oauth-token 'oauth2_4/...'
```

## AAS Token
AAS Token is a sort of AccessToken, that can be used to generate Auth/Bearer token with certain granted scope (PlayStore, Youtube, Gmail, etc)

- AAS Token do not expire, unless you change the account password.
- In limited scope, it can be used as your Google account password.

### How to generate AAS Token?
Use Authenticator app to generate AAS Token for your Google Account, download Authenticator from [here](https://github.com/whyorean/Authenticator/releases)      


## Usage

Store provids you with the following APIs:

1. `GET /api/auth`
   - Returns you an authBundle* generated on Dispenser with default device config.
2. `POST /api/auth`
   - Returns you an authBundle* generated on Dispenser with config** provided in body.
3. `GET /download/apk`
   - Return store apk


   
