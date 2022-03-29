// @flow

import commAppURLFacts from '../../facts/commapp_url';
import landingURLFacts from '../../facts/landing_url';
import squadCalURLFacts from '../../facts/squadcal_url';

export type AppURLFacts = {
  +baseDomain: string,
  +basePath: string,
  +https: boolean,
  +baseRoutePath: string,
};

function getSquadCalURLFacts(): AppURLFacts {
  return squadCalURLFacts;
}

function getCommAppURLFacts(): AppURLFacts {
  return commAppURLFacts;
}

function getAppURLFactsFromRequestURL(url: string): AppURLFacts {
  const commURLFacts = getCommAppURLFacts();
  return url.startsWith(commURLFacts.basePath)
    ? commURLFacts
    : getSquadCalURLFacts();
}

function getLandingURLFacts(): AppURLFacts {
  return landingURLFacts;
}

export {
  getSquadCalURLFacts,
  getCommAppURLFacts,
  getLandingURLFacts,
  getAppURLFactsFromRequestURL,
};
