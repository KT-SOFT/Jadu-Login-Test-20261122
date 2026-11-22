(()=>{const mode=new URLSearchParams(location.search).get("mode")||"popup";const __publicField=(o,k,v)=>(o[k]=v);
  var key = "jaduPhoneAuth";
  var CarHistoryPersistence = class {
    constructor() {
      this.type = "SESSION";
    }
    async _isAvailable() {
      try {
        history.replaceState({ ...history.state, [key]: history.state?.[key] || {} }, "");
        return true;
      } catch {
        return false;
      }
    }
    async _set(name, value) {
      history.replaceState({ ...history.state, [key]: { ...history.state?.[key], [name]: value } }, "");
    }
    async _get(name) {
      const value = history.state?.[key]?.[name];
      return value == null ? null : JSON.parse(JSON.stringify(value));
    }
    async _remove(name) {
      const values = { ...history.state?.[key] };
      delete values[name];
      history.replaceState({ ...history.state, [key]: values }, "");
    }
    _addListener() {
    }
    _removeListener() {
    }
  };
  __publicField(CarHistoryPersistence, "type", "SESSION");

  // D:/00_리습프로그램/00_KTOOL작업/자두홈_1112/vehicle0107/source/native-auth.js
  function nativeGoogleAvailable() {
    return location.origin === "https://kt-soft.github.io" && location.pathname.startsWith("/Jadu-Web/inapp/") && typeof window.jaduNativeAuth?.signIn === "function";
  }
  async function nativeGoogleSignIn(options) {
    const result = await window.jaduNativeAuth.signIn(options);
    if (!result || typeof result.idToken !== "string" || typeof result.accessToken !== "string" || result.idToken.length < 20 || result.accessToken.length < 20)
      throw Object.assign(new Error("Google \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694."), { code: "auth/invalid-credential" });
    return result;
  }
  function nativeGoogleSignOut() {
    if (nativeGoogleAvailable()) window.jaduNativeAuth.signOut().catch(() => {
    });
  }

  // D:/00_리습프로그램/00_KTOOL작업/자두홈_1112/vehicle0107/source/auth-config.js?v=20261105-shared12b
  var firebaseConfig = Object.freeze({
    "apiKey": "AIzaSyBEzuAoC0WBnJp-HghCZ-xPuUfDCDMlJ-A",
    "authDomain": "jadu-web.firebaseapp.com",
    "projectId": "jadu-web",
    "appId": "1:511414741782:web:e2e1ed4fd5cb619a63be37"
  });

  // D:/00_리습프로그램/00_KTOOL작업/자두홈_1112/vehicle0107/source/auth.js?v=20261105-shared12b
  var configured = ["apiKey", "authDomain", "projectId", "appId"].every((key2) => typeof firebaseConfig[key2] === "string" && firebaseConfig[key2].trim());
  var youtubeLibraryEnabled = /\/(?:iPhone|i|account-test|inapp)\/(?:index\.html)?$/.test(location.pathname);
  var tokenKey = "jadu:youtube-access:" + new URL(".", location.href).pathname;
  var listeners = /* @__PURE__ */ new Set();
  var sdk;
  var auth;
  var initialization;
  var unsubscribe;
  var bearer = null;
  var accessVersion = 0;
  var permissionVerified = false;
  var status = { configured: Boolean(configured), initializing: Boolean(configured), busy: false, signedIn: false, user: null, youtubeAccessAvailable: false, youtubeAuthorized: false, message: configured ? "\uACC4\uC815 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694." : "\uACC4\uC815 \uC5F0\uACB0 \uB4F1\uB85D\uC774 \uD544\uC694\uD574\uC694." };
  function copyStatus() {
    return { ...status, youtubeAccessAvailable: hasAccess(), youtubeAuthorized: hasAccess() && permissionVerified, user: status.user ? { ...status.user } : null };
  }
  function emit(patch2 = {}) {
    status = { ...status, ...patch2, youtubeAccessAvailable: hasAccess(), youtubeAuthorized: hasAccess() && permissionVerified };
    for (const callback of listeners) callback(copyStatus());
  }
  function hasAccess() {
    if (!youtubeLibraryEnabled) return false;
    if (bearer && bearer.expiresAt <= Date.now() + 1e4) clearAccess();
    return Boolean(bearer && bearer.uid === auth?.currentUser?.uid && bearer.expiresAt > Date.now() + 1e4);
  }
  function clearAccess() {
    bearer = null;
    permissionVerified = false;
    accessVersion++;
    try {
      sessionStorage.removeItem(tokenKey);
    } catch {
    }
  }
  function restoreAccess(uid) {
    if (!youtubeLibraryEnabled) return;
    if (bearer?.uid === uid && bearer.expiresAt > Date.now() + 1e4) return;
    bearer = null;
    permissionVerified = false;
    try {
      const value = JSON.parse(sessionStorage.getItem(tokenKey) || "null");
      if (value && value.uid === uid && typeof value.token === "string" && value.token.length >= 20 && value.token.length <= 4096 && !/[\r\n]/.test(value.token) && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now() + 1e4 && value.expiresAt < Date.now() + 36e5) {
        bearer = value;
        return;
      }
      sessionStorage.removeItem(tokenKey);
    } catch {
    }
  }
  function errorMessage(error) {
    const code = String(error?.code || "");
    if (/popup-blocked/.test(code)) return "\uB85C\uADF8\uC778 \uCC3D\uC744 \uC5F4\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC5F0\uACB0 \uBC84\uD2BC\uC744 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.";
    if (/popup-closed|cancelled-popup/.test(code)) return "\uB85C\uADF8\uC778\uC744 \uCDE8\uC18C\uD588\uC5B4\uC694. \uC800\uC7A5\uB41C \uB178\uB798\uB294 \uADF8\uB300\uB85C\uC608\uC694.";
    if (/unauthorized-domain/.test(code)) return "\uD604\uC7AC \uC790\uB450 \uC8FC\uC18C\uC758 Google \uB85C\uADF8\uC778 \uB4F1\uB85D\uC774 \uD544\uC694\uD574\uC694.";
    if (/network-request-failed/.test(code)) return "Google\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC778\uD130\uB137\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.";
    if (/operation-not-allowed/.test(code)) return "Google \uB85C\uADF8\uC778 \uC5F0\uACB0 \uC124\uC815\uC744 \uD655\uC778\uD574\uC57C \uD574\uC694.";
    if (/account-exists-with-different-credential/.test(code)) return "\uC774 \uACC4\uC815\uC758 \uAE30\uC874 \uB85C\uADF8\uC778 \uBC29\uBC95\uC73C\uB85C \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.";
    const type = ["Error", "FirebaseError", "SecurityError", "TypeError", "ReferenceError", "NotAllowedError", "NotSupportedError", "AbortError"].includes(error?.name) ? error.name : "unknown";
    const detail = /^auth\/[a-z0-9-]+$/.test(code) ? code : type;
    const original = error?.customData?.originalError?.name;
    const storageType = ["SecurityError", "InvalidStateError", "QuotaExceededError", "NotAllowedError"].includes(original) ? " / " + original : "";
    return "\uACC4\uC815 \uC5F0\uACB0\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. (" + detail + storageType + ") \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.";
  }
  function getAuthStatus() {
    return copyStatus();
  }
  function subscribeAuth(callback) {
    listeners.add(callback);
    callback(copyStatus());
    return () => listeners.delete(callback);
  }
  function initAuth() {
    if (initialization) return initialization;
    if (!configured) return Promise.resolve(copyStatus());
    initialization = (async () => {
      try {
        const [appSDK, authSDK] = await Promise.all([
          import("https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js"),
          import("https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js")
        ]);
        sdk = authSDK;
        const app = appSDK.getApps().find((app2) => app2.name === "jadu-home-login-sdk1280-test-20261122-"+mode) || appSDK.initializeApp(firebaseConfig, "jadu-home-login-sdk1280-test-20261122-"+mode);
        auth = sdk.initializeAuth(app, { persistence: [sdk.browserLocalPersistence, sdk.indexedDBLocalPersistence, sdk.browserSessionPersistence, CarHistoryPersistence], popupRedirectResolver: sdk.browserPopupRedirectResolver });
        await new Promise((resolve, reject) => {
          unsubscribe = sdk.onAuthStateChanged(auth, (user) => {
            const oldUID = status.user?.uid;
            if (oldUID && oldUID !== user?.uid) clearAccess();
            if (user) restoreAccess(user.uid);
            else clearAccess();
            emit({ initializing: false, signedIn: Boolean(user), user: user ? { uid: user.uid, name: user.displayName || "", email: user.email || "", photoURL: user.photoURL || "" } : null, message: user ? "\uBCF4\uAD00\uD568 \uACC4\uC815\uC744 \uC5F0\uACB0\uD588\uC5B4\uC694." : "Google \uACC4\uC815\uC73C\uB85C \uC5F0\uACB0\uD560 \uC218 \uC788\uC5B4\uC694." });
            resolve();
          }, reject);
        });
      } catch (error) {
        emit({ initializing: false, message: errorMessage(error) });
        initialization = null;
        throw new Error(status.message);
      }
      return copyStatus();
    })();
    return initialization;
  }
  async function openGoogleLogin({ switchAccount = false, readYouTube = false } = {}) {
    if (!configured) throw new Error(status.message);
    if (!auth || !sdk) throw new Error("\uACC4\uC815 \uC5F0\uACB0\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC5B4\uC694. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.");
    if (status.busy) return;
    const provider = new sdk.GoogleAuthProvider();
    if (youtubeLibraryEnabled && readYouTube) provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
    if (switchAccount || !auth.currentUser) provider.setCustomParameters({ prompt: "select_account" });
    else provider.setCustomParameters({ login_hint: auth.currentUser.email || "" });
    emit({ busy: true, message: "Google \uACF5\uC2DD \uB85C\uADF8\uC778 \uCC3D\uC5D0\uC11C \uC5F0\uACB0\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694." });
    try {
      let result, credential;
      if (nativeGoogleAvailable()) {
        const native = await nativeGoogleSignIn({ switchAccount, readYouTube: youtubeLibraryEnabled && readYouTube });
        credential = sdk.GoogleAuthProvider.credential(native.idToken, native.accessToken);
        result = await sdk.signInWithCredential(auth, credential);
      } else {
        result = await sdk.signInWithPopup(auth, provider);
        credential = sdk.GoogleAuthProvider.credentialFromResult(result);
      }
      if (!youtubeLibraryEnabled || !readYouTube) {
        emit({ message: "\uBCF4\uAD00\uD568 \uACC4\uC815\uC744 \uC5F0\uACB0\uD588\uC5B4\uC694." });
        return;
      }
      if (!credential?.accessToken) throw new Error("no-youtube-access");
      clearAccess();
      bearer = { uid: result.user.uid, token: credential.accessToken, expiresAt: Date.now() + 50 * 60 * 1e3 };
      try {
        sessionStorage.setItem(tokenKey, JSON.stringify(bearer));
      } catch {
      }
      emit({ message: "\uC720\uD29C\uBE0C \uBAA9\uB85D \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694." });
    } catch (error) {
      window.jaduTestAuthError={code:/^auth\/[a-z0-9-]+$/.test(error?.code||'')?error.code:'',name:error?.name||'',originalName:error?.customData?.originalError?.name||'',originalCode:/^[A-Z0-9_-]+$/.test(error?.customData?.originalError?.code||'')?error.customData.originalError.code:''};
      emit({ message: errorMessage(error) });
      throw new Error(status.message);
    } finally {
      emit({ busy: false });
    }
  }
  async function logout() {
    clearAccess();
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key2 = sessionStorage.key(i);
        if (key2?.startsWith("jadu:youtube-access:")) sessionStorage.removeItem(key2);
      }
    } catch {
    }
    nativeGoogleSignOut();
    if (auth && sdk) await sdk.signOut(auth);
    emit({ message: "\uC790\uB450\uC5D0\uC11C \uB85C\uADF8\uC544\uC6C3\uD588\uC5B4\uC694. \uC800\uC7A5\uB41C \uB178\uB798\uB294 \uADF8\uB300\uB85C\uC608\uC694." });
  }
  async function youtubeGet(resource, parameters = {}, { signal } = {}) {
    if (!youtubeLibraryEnabled) throw new Error("\uAC1C\uC778 \uC7AC\uC0DD\uBAA9\uB85D \uC5F0\uACB0\uC740 \uC2DC\uD5D8 \uC8FC\uC18C\uC5D0\uC11C \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    if (!["videos", "playlistItems"].includes(resource)) throw new Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC720\uD29C\uBE0C \uC870\uD68C\uC608\uC694.");
    if (!hasAccess()) {
      clearAccess();
      emit();
      const error = new Error("\uC720\uD29C\uBE0C \uBAA9\uB85D\uC744 \uBCF4\uB824\uBA74 \uC5F0\uACB0\uD558\uAE30\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694.");
      error.code = "youtube-connect-required";
      throw error;
    }
    const epoch = accessVersion, uid = auth.currentUser.uid;
    const url = new URL("https://www.googleapis.com/youtube/v3/" + resource);
    for (const [key2, value] of Object.entries(parameters)) if (value !== void 0 && value !== null && value !== "") url.searchParams.set(key2, String(value));
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, 15e3);
    try {
      const response = await fetch(url, { headers: { Authorization: "Bearer " + bearer.token, Accept: "application/json" }, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal });
      const data = await response.json();
      if (epoch !== accessVersion || uid !== auth.currentUser?.uid) {
        const error = new Error("\uACC4\uC815\uC774 \uBCC0\uACBD\uB418\uC5B4 \uC774\uC804 \uC870\uD68C\uB97C \uBA48\uCDC4\uC5B4\uC694.");
        error.name = "AbortError";
        throw error;
      }
      if (!response.ok) {
        const reason = String(data?.error?.errors?.[0]?.reason || data?.error?.status || "");
        let message = "\uC720\uD29C\uBE0C \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.", code = "youtube-read-failed";
        if (response.status === 401 || /authError|UNAUTHENTICATED/.test(reason)) {
          clearAccess();
          emit();
          message = "\uC720\uD29C\uBE0C \uC5F0\uACB0\uC744 \uAC31\uC2E0\uD574\uC57C \uD574\uC694. \uC5F0\uACB0\uD558\uAE30\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694.";
          code = "youtube-connect-required";
        } else if (/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT/.test(reason)) {
          clearAccess();
          emit();
          message = "Google \uC5F0\uACB0\uC5D0\uC11C YouTube \uACC4\uC815 \uBCF4\uAE30 \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.";
          code = "youtube-permission-required";
        } else if (/accessNotConfigured|SERVICE_DISABLED/.test(reason)) {
          message = "\uC720\uD29C\uBE0C \uBAA9\uB85D \uC5F0\uACB0 \uB4F1\uB85D\uC774 \uC544\uC9C1 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694.";
          code = "youtube-api-disabled";
        } else if (/quotaExceeded|dailyLimitExceeded|rateLimitExceeded|RESOURCE_EXHAUSTED/.test(reason)) {
          message = "\uC9C0\uAE08\uC740 \uC720\uD29C\uBE0C \uC870\uD68C \uD55C\uB3C4\uB97C \uB118\uC5C8\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.";
          code = "youtube-quota";
        } else if (/channelNotFound/.test(reason)) {
          message = "현재 연결한 유튜브 계정·채널에서 이 목록을 찾지 못했어요. 좋아요를 누른 계정으로 ‘계정 바꾸기’를 해 주세요.";
          code = "youtube-channel-not-found";
        } else if (/youtubeSignupRequired/.test(reason)) {
          message = "\uACF5\uC2DD \uC720\uD29C\uBE0C\uC5D0\uC11C \uCC44\uB110 \uC124\uC815\uC744 \uBA3C\uC800 \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
          code = "youtube-channel-required";
        } else if (/playlistNotFound|playlistForbidden/.test(reason)) {
          message = "\uC774 \uC7AC\uC0DD\uBAA9\uB85D\uC744 \uBCFC \uC218 \uC5C6\uC5B4\uC694. \uACC4\uC815\uACFC \uACF5\uAC1C \uBC94\uC704\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
          code = "youtube-playlist-unavailable";
        }
        const error = new Error(message);
        const detail=/^[A-Za-z0-9_.-]{1,80}$/.test(reason)?reason:'unknown';
        error.message+=' ('+({videos:'좋아요',playlistItems:'곡 목록'}[resource]||'유튜브')+' '+response.status+': '+detail+')';
        error.code = code;
        throw error;
      }
      if (!permissionVerified) {
        permissionVerified = true;
        emit();
      }
      return data;
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      if (error?.code) throw error;
      throw new Error("Google\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uB20C\uB7EC \uC8FC\uC138\uC694.");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  async function getIdentityToken() {
    await initAuth();
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  }


window.authTest={init:initAuth,subscribe:subscribeAuth,status:getAuthStatus,login:openGoogleLogin,async redirect(){const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});return sdk.signInWithRedirect(auth,provider)},async result(){return Boolean(await sdk.getRedirectResult(auth))}};})();
