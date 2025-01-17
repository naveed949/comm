// @flow

import * as React from 'react';
import { StyleSheet } from 'react-native';

import { createPendingThread } from 'lib/shared/thread-utils';
import { threadTypes } from 'lib/types/thread-types';

import Button from '../components/button.react';
import SWMansionIcon from '../components/swmansion-icon.react';
import { MessageListRouteName } from '../navigation/route-names';
import { useSelector } from '../redux/redux-utils';
import { type Colors, useColors } from '../themes/colors';
import type { ChatNavigationProp } from './chat.react';

type BaseProps = {
  +navigate: $PropertyType<ChatNavigationProp<'ChatThreadList'>, 'navigate'>,
};
type Props = {
  ...BaseProps,
  +colors: Colors,
  +viewerID: ?string,
};
class ComposeThreadButton extends React.PureComponent<Props> {
  render() {
    const { listForegroundSecondaryLabel } = this.props.colors;
    return (
      <Button onPress={this.onPress} androidBorderlessRipple={true}>
        <SWMansionIcon
          name="edit-4"
          size={26}
          style={styles.composeButton}
          color={listForegroundSecondaryLabel}
        />
      </Button>
    );
  }

  onPress = () => {
    if (this.props.viewerID) {
      this.props.navigate<'MessageList'>({
        name: MessageListRouteName,
        params: {
          threadInfo: createPendingThread({
            viewerID: this.props.viewerID,
            threadType: threadTypes.PRIVATE,
          }),
          searching: true,
        },
      });
    }
  };
}

const styles = StyleSheet.create({
  composeButton: {
    marginRight: 16,
  },
});

const ConnectedComposeThreadButton: React.ComponentType<BaseProps> = React.memo<BaseProps>(
  function ConnectedComposeThreadButton(props) {
    const colors = useColors();
    const viewerID = useSelector(
      state => state.currentUserInfo && state.currentUserInfo.id,
    );

    return (
      <ComposeThreadButton {...props} colors={colors} viewerID={viewerID} />
    );
  },
);

export default ConnectedComposeThreadButton;
