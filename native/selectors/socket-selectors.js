// @flow

import { createSelector } from 'reselect';

import {
  getClientResponsesSelector,
  sessionStateFuncSelector,
} from 'lib/selectors/socket-selectors';
import { createOpenSocketFunction } from 'lib/shared/socket-utils';
import type {
  ClientServerRequest,
  ClientClientResponse,
} from 'lib/types/request-types';
import type {
  SessionIdentification,
  SessionState,
} from 'lib/types/session-types';
import type { OneTimeKeyGenerator } from 'lib/types/socket-types';

import { calendarActiveSelector } from '../navigation/nav-selectors';
import type { AppState } from '../redux/state-types';
import type { NavPlusRedux } from '../types/selector-types';

const openSocketSelector: (state: AppState) => () => WebSocket = createSelector(
  (state: AppState) => state.urlPrefix,
  // We don't actually use the cookie in the socket open function, but we do use
  // it in the initial message, and when the cookie changes the socket needs to
  // be reopened. By including the cookie here, whenever the cookie changes this
  // function will change, which tells the Socket component to restart the
  // connection.
  (state: AppState) => state.cookie,
  createOpenSocketFunction,
);

const sessionIdentificationSelector: (
  state: AppState,
) => SessionIdentification = createSelector(
  (state: AppState) => state.cookie,
  (cookie: ?string): SessionIdentification => ({ cookie }),
);

function oneTimeKeyGenerator(inc: number): string {
  // todo replace this hard code with something like
  // commCoreModule.generateOneTimeKeys()
  let str = Date.now().toString() + '_' + inc.toString() + '_';
  while (str.length < 43) {
    str += Math.random().toString(36).substr(2, 5);
  }
  str = str.substr(0, 43);
  return str;
}

const nativeGetClientResponsesSelector: (
  input: NavPlusRedux,
) => (
  serverRequests: $ReadOnlyArray<ClientServerRequest>,
) => $ReadOnlyArray<ClientClientResponse> = createSelector(
  (input: NavPlusRedux) => getClientResponsesSelector(input.redux),
  (input: NavPlusRedux) => calendarActiveSelector(input.navContext),
  (
    getClientResponsesFunc: (
      calendarActive: boolean,
      oneTimeKeyGenerator: ?OneTimeKeyGenerator,
      serverRequests: $ReadOnlyArray<ClientServerRequest>,
    ) => $ReadOnlyArray<ClientClientResponse>,
    calendarActive: boolean,
  ) => (serverRequests: $ReadOnlyArray<ClientServerRequest>) =>
    getClientResponsesFunc(calendarActive, oneTimeKeyGenerator, serverRequests),
);

const nativeSessionStateFuncSelector: (
  input: NavPlusRedux,
) => () => SessionState = createSelector(
  (input: NavPlusRedux) => sessionStateFuncSelector(input.redux),
  (input: NavPlusRedux) => calendarActiveSelector(input.navContext),
  (
    sessionStateFunc: (calendarActive: boolean) => SessionState,
    calendarActive: boolean,
  ) => () => sessionStateFunc(calendarActive),
);

export {
  openSocketSelector,
  sessionIdentificationSelector,
  nativeGetClientResponsesSelector,
  nativeSessionStateFuncSelector,
};
