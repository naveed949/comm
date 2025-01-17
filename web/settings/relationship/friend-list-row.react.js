// @flow

import * as React from 'react';

import { useRelationshipCallbacks } from 'lib/hooks/relationship-prompt';
import { userRelationshipStatus } from 'lib/types/relationship-types';

import Button from '../../components/button.react';
import MenuItem from '../../components/menu-item.react';
import Menu from '../../components/menu.react';
import SWMansionIcon from '../../SWMansionIcon.react';
import css from './user-list-row.css';
import type { UserRowProps } from './user-list.react';

const dangerButtonColor = {
  color: 'var(--btn-bg-danger)',
};

function FriendListRow(props: UserRowProps): React.Node {
  const { userInfo, onMenuVisibilityChange } = props;

  const { friendUser, unfriendUser } = useRelationshipCallbacks(userInfo.id);
  const buttons = React.useMemo(() => {
    if (userInfo.relationshipStatus === userRelationshipStatus.REQUEST_SENT) {
      return (
        <Button
          variant="text"
          className={css.button}
          buttonColor={dangerButtonColor}
          onClick={unfriendUser}
        >
          Cancel request
        </Button>
      );
    }
    if (
      userInfo.relationshipStatus === userRelationshipStatus.REQUEST_RECEIVED
    ) {
      return (
        <>
          <Button variant="text" className={css.button} onClick={friendUser}>
            Accept
          </Button>
          <Button
            variant="text"
            className={css.button}
            buttonColor={dangerButtonColor}
            onClick={unfriendUser}
          >
            Reject
          </Button>
        </>
      );
    }
    if (userInfo.relationshipStatus === userRelationshipStatus.FRIEND) {
      const editIcon = <SWMansionIcon icon="edit-1" size={22} />;
      return (
        <div className={css.edit_menu}>
          <Menu
            onChange={onMenuVisibilityChange}
            icon={editIcon}
            variant="member-actions"
          >
            <MenuItem
              text="Unfriend"
              icon="user-cross"
              onClick={unfriendUser}
            />
          </Menu>
        </div>
      );
    }
    return undefined;
  }, [
    friendUser,
    unfriendUser,
    userInfo.relationshipStatus,
    onMenuVisibilityChange,
  ]);

  return (
    <div className={css.container}>
      <div className={css.usernameContainer}>{userInfo.username}</div>
      <div className={css.buttons}>{buttons}</div>
    </div>
  );
}

export default FriendListRow;
