// @flow
import classNames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { userSearchIndexForPotentialMembers } from 'lib/selectors/user-selectors';
import { getPotentialMemberItems } from 'lib/shared/search-utils';
import type { AccountUserInfo, UserListItem } from 'lib/types/user-types';

import Label from '../components/label.react';
import Search from '../components/search.react';
import type { InputState } from '../input/input-state';
import { useSelector } from '../redux/redux-utils';
import SWMansionIcon from '../SWMansionIcon.react';
import { updateNavInfoActionType } from '../types/nav-types';
import css from './chat-thread-composer.css';

type Props = {
  +userInfoInputArray: $ReadOnlyArray<AccountUserInfo>,
  +otherUserInfos: { [id: string]: AccountUserInfo },
  +threadID: string,
  +inputState: InputState,
};

function ChatThreadComposer(props: Props): React.Node {
  const { userInfoInputArray, otherUserInfos, threadID, inputState } = props;

  const [usernameInputText, setUsernameInputText] = React.useState('');

  const dispatch = useDispatch();
  const userSearchIndex = useSelector(userSearchIndexForPotentialMembers);

  const userInfoInputIDs = React.useMemo(
    () => userInfoInputArray.map(userInfo => userInfo.id),
    [userInfoInputArray],
  );

  const userListItems = React.useMemo(
    () =>
      getPotentialMemberItems(
        usernameInputText,
        otherUserInfos,
        userSearchIndex,
        userInfoInputIDs,
      ),
    [usernameInputText, otherUserInfos, userSearchIndex, userInfoInputIDs],
  );

  const onSelectUserFromSearch = React.useCallback(
    (id: string) => {
      const selectedUserIDs = userInfoInputArray.map(user => user.id);
      dispatch({
        type: updateNavInfoActionType,
        payload: {
          selectedUserList: [...selectedUserIDs, id],
        },
      });
      setUsernameInputText('');
    },
    [dispatch, userInfoInputArray],
  );

  const onRemoveUserFromSelected = React.useCallback(
    (id: string) => {
      const selectedUserIDs = userInfoInputArray.map(user => user.id);
      if (!selectedUserIDs.includes(id)) {
        return;
      }
      dispatch({
        type: updateNavInfoActionType,
        payload: {
          selectedUserList: selectedUserIDs.filter(userID => userID !== id),
        },
      });
    },
    [dispatch, userInfoInputArray],
  );

  const userSearchResultList = React.useMemo(() => {
    if (
      !userListItems.length ||
      (!usernameInputText && userInfoInputArray.length)
    ) {
      return null;
    }

    return (
      <ul className={css.searchResultsContainer}>
        {userListItems.map((userSearchResult: UserListItem) => (
          <li
            className={css.searchResultsItem}
            key={userSearchResult.id}
            onClick={() => onSelectUserFromSearch(userSearchResult.id)}
          >
            <div className={css.userName}>{userSearchResult.username}</div>
            <div className={css.userInfo}>{userSearchResult.alertTitle}</div>
          </li>
        ))}
      </ul>
    );
  }, [
    onSelectUserFromSearch,
    userInfoInputArray.length,
    userListItems,
    usernameInputText,
  ]);

  const hideSearch = React.useCallback(() => {
    dispatch({
      type: updateNavInfoActionType,
      payload: {
        chatMode: 'view',
        activeChatThreadID: threadID,
      },
    });
  }, [dispatch, threadID]);

  const tagsList = React.useMemo(() => {
    if (!userInfoInputArray?.length) {
      return null;
    }
    const labels = userInfoInputArray.map(user => {
      return (
        <Label key={user.id} onClose={() => onRemoveUserFromSelected(user.id)}>
          {user.username}
        </Label>
      );
    });
    return <div className={css.userSelectedTags}>{labels}</div>;
  }, [userInfoInputArray, onRemoveUserFromSelected]);

  React.useEffect(() => {
    if (!inputState) {
      return;
    }
    inputState.registerSendCallback(hideSearch);
    return () => inputState.unregisterSendCallback(hideSearch);
  }, [hideSearch, inputState]);

  const threadSearchContainerStyles = React.useMemo(
    () =>
      classNames(css.threadSearchContainer, {
        [css.fullHeight]: !userInfoInputArray.length,
      }),
    [userInfoInputArray.length],
  );

  return (
    <div className={threadSearchContainerStyles}>
      <div className={css.searchRow}>
        <div className={css.searchField}>
          <Search
            onChangeText={setUsernameInputText}
            searchText={usernameInputText}
            placeholder="Select users for chat"
          />
        </div>
        <div className={css.closeSearch} onClick={hideSearch}>
          <SWMansionIcon size={25} icon="cross" />
        </div>
      </div>
      {tagsList}
      {userSearchResultList}
    </div>
  );
}

export default ChatThreadComposer;