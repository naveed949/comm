// @flow

import type { AppState } from '../redux/redux-setup';
import {
  type FetchMessageInfosPayload,
  messageTypes,
} from 'lib/types/message-types';
import {
  type ChatMessageItem,
  chatMessageItemPropType,
} from 'lib/selectors/chat-selectors';
import { type ThreadInfo, threadInfoPropType } from 'lib/types/thread-types';
import type { TextToMeasure } from '../text-height-measurer.react';
import type { ChatMessageInfoItemWithHeight } from './message.react';
import {
  type MessageListNavProp,
  messageListNavPropType,
} from './message-list-types';

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import _differenceWith from 'lodash/fp/differenceWith';
import invariant from 'invariant';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { connect } from 'lib/utils/redux-utils';
import { threadInfoSelector } from 'lib/selectors/thread-selectors';
import { messageListData } from 'lib/selectors/chat-selectors';
import {
  messageKey,
  messageID,
  robotextToRawString,
} from 'lib/shared/message-utils';
import { onlyEmojiRegex } from 'lib/shared/emojis';

import MessageList from './message-list.react';
import MessageListHeaderTitle from './message-list-header-title.react';
import ThreadSettingsButton from './thread-settings-button.react';
import { registerChatScreen } from './chat-screen-registry';
import TextHeightMeasurer from '../text-height-measurer.react';
import ChatInputBar from './chat-input-bar.react';
import { multimediaMessageContentHeights } from './multimedia-message.react';
import {
  textMessageMaxWidthSelector,
  composedMessageMaxWidthSelector,
} from './composed-message-width';
import {
  type ChatInputState,
  chatInputStatePropType,
  withChatInputState,
} from './chat-input-state';

export type ChatMessageItemWithHeight =
  {| itemType: "loader" |} |
  ChatMessageInfoItemWithHeight;

type Props = {|
  navigation: MessageListNavProp,
  // Redux state
  threadInfo: ?ThreadInfo,
  messageListData: $ReadOnlyArray<ChatMessageItem>,
  textMessageMaxWidth: number,
  composedMessageMaxWidth: number,
  // withChatInputState
  chatInputState: ?ChatInputState,
|};
type State = {|
  textToMeasure: TextToMeasure[],
  listDataWithHeights: ?$ReadOnlyArray<ChatMessageItemWithHeight>,
  imageGalleryOpen: bool,
|};
class MessageListContainer extends React.PureComponent<Props, State> {

  static propTypes = {
    navigation: messageListNavPropType.isRequired,
    threadInfo: threadInfoPropType,
    messageListData: PropTypes.arrayOf(chatMessageItemPropType).isRequired,
    textMessageMaxWidth: PropTypes.number.isRequired,
    composedMessageMaxWidth: PropTypes.number.isRequired,
    chatInputState: chatInputStatePropType,
  };
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <MessageListHeaderTitle
        threadInfo={navigation.state.params.threadInfo}
        navigate={navigation.navigate}
      />
    ),
    headerRight:
      Platform.OS === "android"
        ? (
            <ThreadSettingsButton
              threadInfo={navigation.state.params.threadInfo}
              navigate={navigation.navigate}
            />
          )
        : null,
    headerBackTitle: "Back",
  });

  constructor(props: Props) {
    super(props);
    const textToMeasure = props.messageListData
      ? this.textToMeasureFromListData(props.messageListData)
      : [];
    const listDataWithHeights =
      props.messageListData && textToMeasure.length === 0
        ? this.mergeHeightsIntoListData()
        : null;
    this.state = {
      textToMeasure,
      listDataWithHeights,
      imageGalleryOpen: false,
    };
  }

  textToMeasureFromListData(listData: $ReadOnlyArray<ChatMessageItem>) {
    const textToMeasure = [];
    for (let item of listData) {
      if (item.itemType !== "message") {
        continue;
      }
      const { messageInfo } = item;
      if (messageInfo.type === messageTypes.TEXT) {
        const style = [
          onlyEmojiRegex.test(messageInfo.text)
            ? styles.emojiOnlyText
            : styles.text,
          { width: this.props.textMessageMaxWidth },
        ];
        textToMeasure.push({
          id: messageKey(messageInfo),
          text: messageInfo.text,
          style,
        });
      } else if (item.robotext && typeof item.robotext === "string") {
        textToMeasure.push({
          id: messageKey(messageInfo),
          text: robotextToRawString(item.robotext),
          style: styles.robotext,
        });
      }
    }
    return textToMeasure;
  }

  static getThreadInfo(props: Props): ThreadInfo {
    return props.navigation.state.params.threadInfo;
  }

  componentDidMount() {
    registerChatScreen(this.props.navigation.state.key, this);
  }

  componentWillUnmount() {
    registerChatScreen(this.props.navigation.state.key, null);
  }

  get canReset() {
    return true;
  }

  componentDidUpdate(prevProps: Props) {
    const oldReduxThreadInfo = prevProps.threadInfo;
    const newReduxThreadInfo = this.props.threadInfo;
    if (newReduxThreadInfo && newReduxThreadInfo !== oldReduxThreadInfo) {
      this.props.navigation.setParams({ threadInfo: newReduxThreadInfo });
    }

    const oldListData = prevProps.messageListData;
    const newListData = this.props.messageListData;
    if (!newListData && oldListData) {
      this.setState({
        textToMeasure: [],
        listDataWithHeights: null,
      });
    }
    if (!newListData) {
      return;
    }

    const oldNavThreadInfo = MessageListContainer.getThreadInfo(prevProps);
    const newNavThreadInfo = MessageListContainer.getThreadInfo(this.props);
    const oldChatInputState = prevProps.chatInputState;
    const newChatInputState = this.props.chatInputState;
    if (
      newListData === oldListData &&
      newNavThreadInfo === oldNavThreadInfo &&
      newChatInputState === oldChatInputState
    ) {
      return;
    }

    const newTextToMeasure = this.textToMeasureFromListData(newListData);
    this.setState({ textToMeasure: newTextToMeasure });
  }

  render() {
    const threadInfo = MessageListContainer.getThreadInfo(this.props);
    const { listDataWithHeights } = this.state;

    let messageList;
    if (listDataWithHeights) {
      messageList = (
        <MessageList
          threadInfo={threadInfo}
          messageListData={listDataWithHeights}
          navigation={this.props.navigation}
          imageGalleryOpen={this.state.imageGalleryOpen}
        />
      );
    } else {
      messageList = (
        <View style={styles.loadingIndicatorContainer}>
          <ActivityIndicator
            color="black"
            size="large"
            style={styles.loadingIndicator}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TextHeightMeasurer
          textToMeasure={this.state.textToMeasure}
          allHeightsMeasuredCallback={this.allHeightsMeasured}
        />
        {messageList}
        <ChatInputBar
          threadInfo={threadInfo}
          imageGalleryOpen={this.state.imageGalleryOpen}
          setImageGalleryOpen={this.setImageGalleryOpen}
        />
      </View>
    );
  }

  setImageGalleryOpen = (imageGalleryOpen: bool) => {
    this.setState({ imageGalleryOpen });
  }

  allHeightsMeasured = (
    textToMeasure: TextToMeasure[],
    newTextHeights: Map<string, number>,
  ) => {
    if (textToMeasure !== this.state.textToMeasure) {
      return;
    }
    if (!this.props.messageListData) {
      return;
    }
    const listDataWithHeights = this.mergeHeightsIntoListData(newTextHeights);
    this.setState({ listDataWithHeights });
  }

  mergeHeightsIntoListData(textHeights?: Map<string, number>) {
    const { messageListData: listData, chatInputState } = this.props;
    const threadInfo = MessageListContainer.getThreadInfo(this.props);
    const listDataWithHeights = listData.map((item: ChatMessageItem) => {
      if (item.itemType !== "message") {
        return item;
      }
      const { messageInfo } = item;
      const key = messageKey(messageInfo);
      if (messageInfo.type === messageTypes.MULTIMEDIA) {
        // Conditional due to Flow...
        const localMessageInfo = item.localMessageInfo
          ? item.localMessageInfo
          : null;
        const id = messageID(messageInfo);
        const pendingUploads = chatInputState
          && chatInputState.pendingUploads
          && chatInputState.pendingUploads[id];
        const heights = multimediaMessageContentHeights(
          messageInfo,
          this.props.composedMessageMaxWidth,
        );
        return {
          itemType: "message",
          messageShapeType: "multimedia",
          messageInfo,
          localMessageInfo,
          threadInfo,
          startsConversation: item.startsConversation,
          startsCluster: item.startsCluster,
          endsCluster: item.endsCluster,
          pendingUploads,
          ...heights,
        };
      }
      invariant(textHeights, "textHeights not set");
      const textHeight = textHeights.get(key);
      invariant(
        textHeight !== null && textHeight !== undefined,
        `height for ${key} should be set`,
      );
      if (messageInfo.type === messageTypes.TEXT) {
        // Conditional due to Flow...
        const localMessageInfo = item.localMessageInfo
          ? item.localMessageInfo
          : null;
        return {
          itemType: "message",
          messageShapeType: "text",
          messageInfo,
          localMessageInfo,
          threadInfo,
          startsConversation: item.startsConversation,
          startsCluster: item.startsCluster,
          endsCluster: item.endsCluster,
          contentHeight: textHeight,
        };
      } else {
        invariant(
          typeof item.robotext === "string",
          "Flow can't handle our fancy types :(",
        );
        return {
          itemType: "message",
          messageShapeType: "robotext",
          messageInfo,
          threadInfo,
          startsConversation: item.startsConversation,
          startsCluster: item.startsCluster,
          endsCluster: item.endsCluster,
          robotext: item.robotext,
          contentHeight: textHeight,
        };
      }
    });
    return listDataWithHeights;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
  },
  loadingIndicatorContainer: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Arial',
  },
  emojiOnlyText: {
    fontSize: 36,
    fontFamily: 'Arial',
  },
  robotext: {
    left: 24,
    right: 24,
    fontSize: 15,
    fontFamily: 'Arial',
  },
});

const ConnectedMessageListContainer = connect(
  (state: AppState, ownProps: { navigation: MessageListNavProp }) => {
    const threadID = ownProps.navigation.state.params.threadInfo.id;
    return {
      threadInfo: threadInfoSelector(state)[threadID],
      messageListData: messageListData(threadID)(state),
      textMessageMaxWidth: textMessageMaxWidthSelector(state),
      composedMessageMaxWidth: composedMessageMaxWidthSelector(state),
    };
  },
)(withChatInputState(MessageListContainer));

hoistNonReactStatics(ConnectedMessageListContainer, MessageListContainer);

export default ConnectedMessageListContainer;
