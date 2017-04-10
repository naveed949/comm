// @flow

import type { NavigationState } from 'react-navigation';
import { PropTypes as ReactNavigationPropTypes } from 'react-navigation';
import type { Dispatch } from 'lib/types/redux-types';
import type { AppState } from './redux-setup';
import type { Action } from './navigation-setup';

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import { AppRegistry, Platform, UIManager, AsyncStorage } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';
import { composeWithDevTools } from 'remote-redux-devtools';
import thunk from 'redux-thunk';
import invariant from 'invariant';
import { autoRehydrate, persistStore } from 'redux-persist';

import { registerConfig } from 'lib/utils/config';
import { setCookie } from 'lib/utils/action-utils';

import { RootNavigator } from './navigation-setup';
import { reducer, defaultState, reduxBlacklist } from './redux-setup';
import {
  resolveInvalidatedCookie,
  getNativeCookie,
} from './account/native-credentials';

class AppWithNavigationState extends React.PureComponent {

  static propTypes = {
    navigationState: ReactNavigationPropTypes.navigationState,
    dispatch: React.PropTypes.func.isRequired,
  };
  props: {
    navigationState: NavigationState,
    dispatch: Dispatch<AppState, Action>,
  };

  render() {
    const navigation = addNavigationHelpers({
      dispatch: this.props.dispatch,
      state: this.props.navigationState,
    });
    return <RootNavigator navigation={navigation} />;
  }

}

let urlPrefix;
if (!__DEV__) {
  urlPrefix = "https://squadcal.org/";
} else if (Platform.OS === "android") {
  // This is a magic IP address that forwards to the emulator's host
  urlPrefix = "http://10.0.2.2/~ashoat/squadcal/";
} else if (Platform.OS === "ios") {
  // Since iOS is simulated and not emulated, we can use localhost
  urlPrefix = "http://localhost/~ashoat/squadcal/";
  // Uncomment below and update IP address if testing on physical device
  //urlPrefix = "http://192.168.1.3/~ashoat/squadcal/";
} else {
  invariant(false, "unsupported platform");
}
registerConfig({
  urlPrefix,
  resolveInvalidatedCookie,
  getNativeCookie,
});

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ConnectedAppWithNavigationState = connect(
  (state: AppState) => ({
    navigationState: state.navInfo.navigationState,
  }),
)(AppWithNavigationState);
const store = createStore(
  reducer,
  defaultState,
  composeWithDevTools(
    applyMiddleware(thunk),
    autoRehydrate(),
  ),
);
const App = (props: {}) =>
  <Provider store={store}>
    <ConnectedAppWithNavigationState />
  </Provider>;

AppRegistry.registerComponent('SquadCal', () => App);

persistStore(
  store,
  { storage: AsyncStorage, blacklist: reduxBlacklist },
);
