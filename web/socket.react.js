// @flow

import type { AppState } from './redux-setup';

import { connect } from 'lib/utils/redux-utils';
import {
  queuedClientResponsesSelector,
  sessionStateFuncSelector,
} from 'lib/selectors/socket-selectors';
import { logInExtraInfoSelector } from 'lib/selectors/account-selectors';
import { logOut } from 'lib/actions/user-actions';
import Socket from 'lib/socket/socket.react';

import {
  openSocketSelector,
  sessionIdentificationSelector,
} from './selectors/socket-selectors';
import { activeThreadSelector } from './selectors/nav-selectors';

export default connect(
  (state: AppState) => {
    const active = state.currentUserInfo &&
      !state.currentUserInfo.anonymous &&
      state.foreground;
    const activeThread = active ? activeThreadSelector(state) : null;
    return {
      active,
      openSocket: openSocketSelector(state),
      queuedClientResponses: queuedClientResponsesSelector(state),
      activeThread: active ? activeThreadSelector(state) : null,
      sessionStateFunc: sessionStateFuncSelector(state),
      sessionIdentification: sessionIdentificationSelector(state),
      cookie: state.cookie,
      urlPrefix: state.urlPrefix,
      logInExtraInfo: logInExtraInfoSelector(state),
      connection: state.connection,
    };
  },
  { logOut },
)(Socket);
