// @flow

import type { NavigationParams } from 'react-navigation/src/TypeDefinition';
import type { ThreadInfo } from 'lib/types/thread-types';
import { threadInfoPropType } from 'lib/types/thread-types';

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderTitle from 'react-navigation/src/views/Header/HeaderTitle';

import Button from '../components/button.react';
import { ThreadSettingsRouteName } from './settings/thread-settings.react';

class MessageListHeaderTitle extends React.PureComponent {

  props: {
    threadInfo: ThreadInfo,
    navigate: (
      routeName: string,
      params?: NavigationParams,
    ) => bool,
    sceneKey: string,
    onWidthChange: (key: string, width: number) => void,
  };
  static propTypes = {
    threadInfo: threadInfoPropType.isRequired,
    navigate: PropTypes.func.isRequired,
    sceneKey: PropTypes.string.isRequired,
    onWidthChange: PropTypes.func.isRequired,
  };

  render() {
    let icon, fakeIcon;
    if (Platform.OS === "ios") {
      icon = (
        <Icon
          name="ios-arrow-forward"
          size={20}
          style={styles.forwardIcon}
          color="#036AFF"
        />
      );
      fakeIcon = (
        <Icon
          name="ios-arrow-forward"
          size={20}
          style={styles.fakeIcon}
        />
      );
    } else {
      icon = (
        <Icon
          name="md-arrow-forward"
          size={20}
          style={styles.forwardIcon}
          color="#0077CC"
        />
      );
    }
    return (
      <Button
        onPress={this.onPress}
        style={styles.button}
        topStyle={styles.button}
        androidBorderlessRipple={true}
      >
        <View style={styles.container}>
          {fakeIcon}
          <HeaderTitle onLayout={this.onLayout}>
            {this.props.threadInfo.name}
          </HeaderTitle>
          {icon}
        </View>
      </Button>
    );
  }

  onLayout = (event: { nativeEvent: { layout: { width: number } } }) => {
    this.props.onWidthChange(
      this.props.sceneKey,
      event.nativeEvent.layout.width,
    );
  }

  onPress = () => {
    this.props.navigate(
      ThreadSettingsRouteName,
      { threadInfo: this.props.threadInfo },
    );
  }

}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forwardIcon: {
    flex: 1,
    minWidth: 25,
  },
  fakeIcon: {
    flex: 1,
    minWidth: 25,
    opacity: 0,
  },
});

export default MessageListHeaderTitle;
