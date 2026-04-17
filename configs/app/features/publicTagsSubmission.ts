import type { Feature } from './types';

import apis from '../apis';
import services from '../services';

const title = 'Public tag submission';

// Requires reCaptcha (spam prevention) and admin API host (submission endpoint).
// Does not require the metadata service — tag types are served by the same backend
// when NEXT_PUBLIC_ADMIN_SERVICE_API_HOST and NEXT_PUBLIC_METADATA_SERVICE_API_HOST
// both point to the vinuexplorer backend.
const config: Feature<{}> = (() => {
  if (services.reCaptchaV2.siteKey && apis.admin) {
    return Object.freeze({
      title,
      isEnabled: true,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
