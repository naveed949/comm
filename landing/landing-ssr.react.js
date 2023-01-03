// @flow

import * as React from 'react';
import { StaticRouter } from 'react-router';

import Landing from './landing.react';
import { SIWEContext } from './siwe-context.js';

export type LandingSSRProps = {
  +url: string,
  +basename: string,
  +siweNonce: ?string,
};
function LandingSSR(props: LandingSSRProps): React.Node {
  const { url, basename, siweNonce } = props;

  const siweContextValue = React.useMemo(
    () => ({
      siweNonce,
    }),
    [siweNonce],
  );
  const routerContext = React.useMemo(() => ({}), []);
  return (
    <StaticRouter location={url} basename={basename} context={routerContext}>
      <SIWEContext.Provider value={siweContextValue}>
        <Landing />
      </SIWEContext.Provider>
    </StaticRouter>
  );
}

export default LandingSSR;
