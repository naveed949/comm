// @flow

import invariant from 'invariant';
import _debounce from 'lodash/debounce';
import * as React from 'react';

import type { ChatMessageInfoItem } from 'lib/selectors/chat-selectors';
import { localIDPrefix, createMessageReply } from 'lib/shared/message-utils';
import { useCanCreateReactionFromMessage } from 'lib/shared/reaction-utils';
import {
  threadHasPermission,
  useSidebarExistsOrCanBeCreated,
} from 'lib/shared/thread-utils';
import { isComposableMessageType, messageTypes } from 'lib/types/message-types';
import type { ThreadInfo } from 'lib/types/thread-types';
import { threadPermissions } from 'lib/types/thread-types';
import { longAbsoluteDate } from 'lib/utils/date-utils';

import {
  tooltipButtonStyle,
  tooltipLabelStyle,
  tooltipStyle,
} from '../chat/chat-constants';
import MessageLikeTooltipButton from '../chat/message-like-tooltip-button.react';
import MessageTooltip from '../chat/message-tooltip.react';
import type { PositionInfo } from '../chat/position-types';
import { useOnClickReact } from '../chat/reaction-message-utils';
import { useTooltipContext } from '../chat/tooltip-provider';
import CommIcon from '../CommIcon.react';
import { InputStateContext } from '../input/input-state';
import { useSelector } from '../redux/redux-utils';
import {
  useOnClickPendingSidebar,
  useOnClickThread,
} from '../selectors/thread-selectors';
import { calculateMaxTextWidth } from '../utils/text-utils';

export const tooltipPositions = Object.freeze({
  LEFT: 'left',
  RIGHT: 'right',
  LEFT_BOTTOM: 'left-bottom',
  RIGHT_BOTTOM: 'right-bottom',
  LEFT_TOP: 'left-top',
  RIGHT_TOP: 'right-top',
  TOP: 'top',
  BOTTOM: 'bottom',
});

type TooltipSize = {
  +height: number,
  +width: number,
};

export type TooltipPositionStyle = {
  +anchorPoint: {
    +x: number,
    +y: number,
  },
  +verticalPosition: 'top' | 'bottom',
  +horizontalPosition: 'left' | 'right',
  +alignment: 'left' | 'center' | 'right',
};

export type TooltipPosition = $Values<typeof tooltipPositions>;

export type MessageTooltipAction = {
  +label: string,
  +onClick: (SyntheticEvent<HTMLDivElement>) => mixed,
  +actionButtonContent: React.Node,
};

const appTopBarHeight = 65;

const font =
  '14px "Inter", -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", ' +
  '"Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", ui-sans-serif';

type FindTooltipPositionArgs = {
  +sourcePositionInfo: PositionInfo,
  +tooltipSize: TooltipSize,
  +availablePositions: $ReadOnlyArray<TooltipPosition>,
  +defaultPosition: TooltipPosition,
  +preventDisplayingBelowSource?: boolean,
};

function findTooltipPosition({
  sourcePositionInfo,
  tooltipSize,
  availablePositions,
  defaultPosition,
  preventDisplayingBelowSource,
}: FindTooltipPositionArgs): TooltipPosition {
  if (!window) {
    return defaultPosition;
  }
  const appContainerPositionInfo: PositionInfo = {
    height: window.innerHeight - appTopBarHeight,
    width: window.innerWidth,
    top: appTopBarHeight,
    bottom: window.innerHeight,
    left: 0,
    right: window.innerWidth,
  };

  const pointingTo = sourcePositionInfo;
  const {
    top: containerTop,
    left: containerLeft,
    right: containerRight,
    bottom: containerBottom,
  } = appContainerPositionInfo;

  const tooltipWidth = tooltipSize.width;
  const tooltipHeight = tooltipSize.height;

  const canBeDisplayedOnLeft = containerLeft + tooltipWidth <= pointingTo.left;
  const canBeDisplayedOnRight =
    tooltipWidth + pointingTo.right <= containerRight;

  const willCoverSidebarOnTopSideways =
    preventDisplayingBelowSource &&
    pointingTo.top + tooltipHeight > pointingTo.bottom;

  const canBeDisplayedOnTopSideways =
    pointingTo.top >= containerTop &&
    pointingTo.top + tooltipHeight <= containerBottom &&
    !willCoverSidebarOnTopSideways;

  const canBeDisplayedOnBottomSideways =
    pointingTo.bottom <= containerBottom &&
    pointingTo.bottom - tooltipHeight >= containerTop;

  const verticalCenterOfPointingTo = pointingTo.top + pointingTo.height / 2;
  const horizontalCenterOfPointingTo = pointingTo.left + pointingTo.width / 2;

  const willCoverSidebarInTheMiddleSideways =
    preventDisplayingBelowSource &&
    verticalCenterOfPointingTo + tooltipHeight / 2 > pointingTo.bottom;

  const canBeDisplayedInTheMiddleSideways =
    verticalCenterOfPointingTo - tooltipHeight / 2 >= containerTop &&
    verticalCenterOfPointingTo + tooltipHeight / 2 <= containerBottom &&
    !willCoverSidebarInTheMiddleSideways;

  const canBeDisplayedOnTop =
    pointingTo.top - tooltipHeight >= containerTop &&
    horizontalCenterOfPointingTo - tooltipWidth / 2 >= containerLeft &&
    horizontalCenterOfPointingTo + tooltipWidth / 2 <= containerRight;

  const canBeDisplayedOnBottom =
    pointingTo.bottom + tooltipHeight <= containerBottom &&
    horizontalCenterOfPointingTo - tooltipWidth / 2 >= containerLeft &&
    horizontalCenterOfPointingTo + tooltipWidth / 2 <= containerRight &&
    !preventDisplayingBelowSource;

  for (const tooltipPosition of availablePositions) {
    if (
      tooltipPosition === tooltipPositions.RIGHT &&
      canBeDisplayedOnRight &&
      canBeDisplayedInTheMiddleSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.RIGHT_BOTTOM &&
      canBeDisplayedOnRight &&
      canBeDisplayedOnBottomSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.LEFT &&
      canBeDisplayedOnLeft &&
      canBeDisplayedInTheMiddleSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.LEFT_BOTTOM &&
      canBeDisplayedOnLeft &&
      canBeDisplayedOnBottomSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.LEFT_TOP &&
      canBeDisplayedOnLeft &&
      canBeDisplayedOnTopSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.RIGHT_TOP &&
      canBeDisplayedOnRight &&
      canBeDisplayedOnTopSideways
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.TOP &&
      canBeDisplayedOnTop
    ) {
      return tooltipPosition;
    } else if (
      tooltipPosition === tooltipPositions.BOTTOM &&
      canBeDisplayedOnBottom
    ) {
      return tooltipPosition;
    }
  }
  return defaultPosition;
}

type GetMessageActionTooltipStyleParams = {
  +sourcePositionInfo: PositionInfo,
  +tooltipSize: TooltipSize,
  +tooltipPosition: TooltipPosition,
};

function getMessageActionTooltipStyle({
  sourcePositionInfo,
  tooltipSize,
  tooltipPosition,
}: GetMessageActionTooltipStyleParams): TooltipPositionStyle {
  if (tooltipPosition === tooltipPositions.RIGHT_TOP) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.right,
        y: sourcePositionInfo.top,
      },
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      alignment: 'left',
    };
  } else if (tooltipPosition === tooltipPositions.LEFT_TOP) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.left,
        y: sourcePositionInfo.top,
      },
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      alignment: 'right',
    };
  } else if (tooltipPosition === tooltipPositions.RIGHT_BOTTOM) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.right,
        y: sourcePositionInfo.bottom,
      },
      horizontalPosition: 'right',
      verticalPosition: 'top',
      alignment: 'left',
    };
  } else if (tooltipPosition === tooltipPositions.LEFT_BOTTOM) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.left,
        y: sourcePositionInfo.bottom,
      },
      horizontalPosition: 'left',
      verticalPosition: 'top',
      alignment: 'right',
    };
  } else if (tooltipPosition === tooltipPositions.LEFT) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.left,
        y:
          sourcePositionInfo.top +
          sourcePositionInfo.height / 2 -
          tooltipSize.height / 2,
      },
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      alignment: 'right',
    };
  } else if (tooltipPosition === tooltipPositions.RIGHT) {
    return {
      anchorPoint: {
        x: sourcePositionInfo.right,
        y:
          sourcePositionInfo.top +
          sourcePositionInfo.height / 2 -
          tooltipSize.height / 2,
      },
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      alignment: 'left',
    };
  } else if (tooltipPosition === tooltipPositions.TOP) {
    return {
      anchorPoint: {
        x:
          sourcePositionInfo.left +
          sourcePositionInfo.width / 2 -
          tooltipSize.width / 2,
        y: sourcePositionInfo.top,
      },
      horizontalPosition: 'right',
      verticalPosition: 'top',
      alignment: 'center',
    };
  } else if (tooltipPosition === tooltipPositions.BOTTOM) {
    return {
      anchorPoint: {
        x:
          sourcePositionInfo.left +
          sourcePositionInfo.width / 2 -
          tooltipSize.width / 2,
        y: sourcePositionInfo.bottom,
      },
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      alignment: 'center',
    };
  }
  invariant(false, `Unexpected tooltip position value: ${tooltipPosition}`);
}

type CalculateTooltipSizeArgs = {
  +tooltipLabels: $ReadOnlyArray<string>,
  +timestamp: string,
};

function calculateTooltipSize({
  tooltipLabels,
  timestamp,
}: CalculateTooltipSizeArgs): {
  +width: number,
  +height: number,
} {
  const textWidth =
    calculateMaxTextWidth([...tooltipLabels, timestamp], font) +
    2 * tooltipLabelStyle.padding;
  const buttonsWidth =
    tooltipLabels.length *
    (tooltipButtonStyle.width +
      tooltipButtonStyle.paddingLeft +
      tooltipButtonStyle.paddingRight);
  const width =
    Math.max(textWidth, buttonsWidth) +
    tooltipStyle.paddingLeft +
    tooltipStyle.paddingRight;
  const height =
    (tooltipLabelStyle.height + 2 * tooltipLabelStyle.padding) * 2 +
    tooltipStyle.rowGap * 2 +
    tooltipButtonStyle.height;
  return {
    width,
    height,
  };
}

function useMessageTooltipSidebarAction(
  item: ChatMessageInfoItem,
  threadInfo: ThreadInfo,
): ?MessageTooltipAction {
  const { threadCreatedFromMessage, messageInfo } = item;
  const sidebarExists = !!threadCreatedFromMessage;
  const sidebarExistsOrCanBeCreated = useSidebarExistsOrCanBeCreated(
    threadInfo,
    item,
  );
  const openThread = useOnClickThread(threadCreatedFromMessage);
  const openPendingSidebar = useOnClickPendingSidebar(messageInfo, threadInfo);
  return React.useMemo(() => {
    if (!sidebarExistsOrCanBeCreated) {
      return null;
    }
    const buttonContent = <CommIcon icon="sidebar-filled" size={16} />;
    const onClick = (event: SyntheticEvent<HTMLElement>) => {
      if (threadCreatedFromMessage) {
        openThread(event);
      } else {
        openPendingSidebar(event);
      }
    };
    return {
      actionButtonContent: buttonContent,
      onClick,
      label: sidebarExists ? 'Go to thread' : 'Create thread',
    };
  }, [
    openPendingSidebar,
    openThread,
    sidebarExists,
    sidebarExistsOrCanBeCreated,
    threadCreatedFromMessage,
  ]);
}

function useMessageTooltipReplyAction(
  item: ChatMessageInfoItem,
  threadInfo: ThreadInfo,
): ?MessageTooltipAction {
  const { messageInfo } = item;
  const inputState = React.useContext(InputStateContext);
  invariant(inputState, 'inputState is required');
  const { addReply } = inputState;
  return React.useMemo(() => {
    if (
      !isComposableMessageType(item.messageInfo.type) ||
      !threadHasPermission(threadInfo, threadPermissions.VOICED)
    ) {
      return null;
    }
    const buttonContent = <CommIcon icon="reply-filled" size={18} />;
    const onClick = () => {
      if (!messageInfo.text) {
        return;
      }
      addReply(createMessageReply(messageInfo.text));
    };
    return {
      actionButtonContent: buttonContent,
      onClick,
      label: 'Reply',
    };
  }, [addReply, item.messageInfo.type, messageInfo, threadInfo]);
}

const copiedMessageDurationMs = 2000;
function useMessageCopyAction(
  item: ChatMessageInfoItem,
): ?MessageTooltipAction {
  const { messageInfo } = item;

  const [successful, setSuccessful] = React.useState(false);
  const resetStatusAfterTimeout = React.useRef(
    _debounce(() => setSuccessful(false), copiedMessageDurationMs),
  );

  const onSuccess = React.useCallback(() => {
    setSuccessful(true);
    resetStatusAfterTimeout.current();
  }, []);

  React.useEffect(() => resetStatusAfterTimeout.current.cancel, []);

  return React.useMemo(() => {
    if (messageInfo.type !== messageTypes.TEXT) {
      return null;
    }
    const buttonContent = <CommIcon icon="copy-filled" size={18} />;
    const onClick = async () => {
      try {
        await navigator.clipboard.writeText(messageInfo.text);
        onSuccess();
      } catch (e) {
        setSuccessful(false);
      }
    };
    return {
      actionButtonContent: buttonContent,
      onClick,
      label: successful ? 'Copied!' : 'Copy',
    };
  }, [messageInfo.text, messageInfo.type, onSuccess, successful]);
}

function useMessageReactAction(
  item: ChatMessageInfoItem,
  threadInfo: ThreadInfo,
): ?MessageTooltipAction {
  const { messageInfo, reactions } = item;

  const nextLocalID = useSelector(state => state.nextLocalID);
  const localID = `${localIDPrefix}${nextLocalID}`;

  const reactionInput = '👍';
  const viewerReacted = !!reactions.get(reactionInput)?.viewerReacted;
  const action = viewerReacted ? 'remove_reaction' : 'add_reaction';

  const onClickReact = useOnClickReact(
    messageInfo.id,
    localID,
    threadInfo.id,
    reactionInput,
    action,
  );

  const canCreateReactionFromMessage = useCanCreateReactionFromMessage(
    threadInfo,
    messageInfo,
  );

  return React.useMemo(() => {
    if (!canCreateReactionFromMessage) {
      return null;
    }

    const buttonContent = (
      <MessageLikeTooltipButton viewerReacted={viewerReacted} />
    );

    return {
      actionButtonContent: buttonContent,
      onClick: onClickReact,
      label: viewerReacted ? 'Unlike' : 'Like',
    };
  }, [canCreateReactionFromMessage, onClickReact, viewerReacted]);
}

function useMessageTooltipActions(
  item: ChatMessageInfoItem,
  threadInfo: ThreadInfo,
): $ReadOnlyArray<MessageTooltipAction> {
  const sidebarAction = useMessageTooltipSidebarAction(item, threadInfo);
  const replyAction = useMessageTooltipReplyAction(item, threadInfo);
  const copyAction = useMessageCopyAction(item);
  const reactAction = useMessageReactAction(item, threadInfo);
  return React.useMemo(
    () => [replyAction, sidebarAction, copyAction, reactAction].filter(Boolean),
    [replyAction, sidebarAction, copyAction, reactAction],
  );
}

type UseMessageTooltipArgs = {
  +availablePositions: $ReadOnlyArray<TooltipPosition>,
  +item: ChatMessageInfoItem,
  +threadInfo: ThreadInfo,
};

type UseMessageTooltipResult = {
  onMouseEnter: (event: SyntheticEvent<HTMLElement>) => void,
  onMouseLeave: ?() => mixed,
};

type CreateTooltipParams = {
  +tooltipMessagePosition: ?PositionInfo,
  +tooltipSize: TooltipSize,
  +availablePositions: $ReadOnlyArray<TooltipPosition>,
  +containsInlineEngagement: boolean,
  +tooltipActions: $ReadOnlyArray<MessageTooltipAction>,
  +messageTimestamp: string,
};

function createTooltip(params: CreateTooltipParams) {
  const {
    tooltipMessagePosition,
    tooltipSize,
    availablePositions,
    containsInlineEngagement,
    tooltipActions,
    messageTimestamp,
  } = params;
  if (!tooltipMessagePosition) {
    return;
  }
  const tooltipPosition = findTooltipPosition({
    sourcePositionInfo: tooltipMessagePosition,
    tooltipSize,
    availablePositions,
    defaultPosition: availablePositions[0],
    preventDisplayingBelowSource: containsInlineEngagement,
  });
  if (!tooltipPosition) {
    return;
  }

  const tooltipPositionStyle = getMessageActionTooltipStyle({
    tooltipPosition,
    sourcePositionInfo: tooltipMessagePosition,
    tooltipSize,
  });

  const { alignment } = tooltipPositionStyle;

  const tooltip = (
    <MessageTooltip
      actions={tooltipActions}
      messageTimestamp={messageTimestamp}
      alignment={alignment}
    />
  );
  return { tooltip, tooltipPositionStyle };
}

function useMessageTooltip({
  availablePositions,
  item,
  threadInfo,
}: UseMessageTooltipArgs): UseMessageTooltipResult {
  const [onMouseLeave, setOnMouseLeave] = React.useState<?() => mixed>(null);

  const { renderTooltip } = useTooltipContext();
  const tooltipActions = useMessageTooltipActions(item, threadInfo);

  const containsInlineEngagement = !!item.threadCreatedFromMessage;

  const messageTimestamp = React.useMemo(() => {
    const time = item.messageInfo.time;
    return longAbsoluteDate(time);
  }, [item.messageInfo.time]);

  const tooltipSize = React.useMemo(() => {
    if (typeof document === 'undefined') {
      return {
        width: 0,
        height: 0,
      };
    }
    const tooltipLabels = tooltipActions.map(action => action.label);
    return calculateTooltipSize({
      tooltipLabels,
      timestamp: messageTimestamp,
    });
  }, [messageTimestamp, tooltipActions]);

  const updateTooltip = React.useRef();
  const [tooltipMessagePosition, setTooltipMessagePosition] = React.useState();

  const onMouseEnter = React.useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      if (!renderTooltip) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const { top, bottom, left, right, height, width } = rect;
      const messagePosition = { top, bottom, left, right, height, width };
      setTooltipMessagePosition(messagePosition);

      const tooltipResult = createTooltip({
        tooltipMessagePosition,
        tooltipSize,
        availablePositions,
        containsInlineEngagement,
        tooltipActions,
        messageTimestamp,
      });
      if (!tooltipResult) {
        return;
      }

      const { tooltip, tooltipPositionStyle } = tooltipResult;
      const renderTooltipResult = renderTooltip({
        newNode: tooltip,
        tooltipPositionStyle,
      });
      if (renderTooltipResult) {
        const { onMouseLeaveCallback: callback } = renderTooltipResult;
        setOnMouseLeave((() => callback: () => () => mixed));
        updateTooltip.current = renderTooltipResult.updateTooltip;
      }
    },
    [
      availablePositions,
      containsInlineEngagement,
      messageTimestamp,
      renderTooltip,
      tooltipActions,
      tooltipMessagePosition,
      tooltipSize,
    ],
  );

  React.useEffect(() => {
    if (!updateTooltip.current) {
      return;
    }

    const tooltipResult = createTooltip({
      tooltipMessagePosition,
      tooltipSize,
      availablePositions,
      containsInlineEngagement,
      tooltipActions,
      messageTimestamp,
    });
    if (!tooltipResult) {
      return;
    }

    updateTooltip.current?.(tooltipResult.tooltip);
  }, [
    availablePositions,
    containsInlineEngagement,
    messageTimestamp,
    tooltipActions,
    tooltipMessagePosition,
    tooltipSize,
  ]);

  return {
    onMouseEnter,
    onMouseLeave,
  };
}

export {
  findTooltipPosition,
  calculateTooltipSize,
  getMessageActionTooltipStyle,
  useMessageTooltipSidebarAction,
  useMessageTooltipReplyAction,
  useMessageReactAction,
  useMessageTooltipActions,
  useMessageTooltip,
};
