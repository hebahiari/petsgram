import "./notificationsPopover.css";
import { Notifications } from "@mui/icons-material";
import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { clearNotifications } from "../../utils/api";
import { useHistory } from "react-router-dom";

export default function NotificationsPopover({
  user,
  handleOpenNotifications,
  notifications,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();
  const [opened, setOpened] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    clearNotifications(user?._id);
    setOpened = true;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificaion = (notification) => {
    if (notification.postId) {
      history.push(`/posts/${notification.postId}`);
    } else if (notification.username) {
      history.push(`/profile/${notification.username}`);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Notifications
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
      <span
        className={
          notifications?.filter((notification) => notification.opened === false)
            .length
            ? "topbarIconBadge"
            : "topbarIconBadgeHide"
        }
        onClick={handleOpenNotifications}
      >
        {
          notifications?.filter((notification) => notification.opened === false)
            .length
        }
      </span>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 2 }}>
          {notifications
            ?.map((notification) => (
              <>
                <div
                  className={
                    notification.opened ? "notification" : "notificationNew"
                  }
                  onClick={() => handleNotificaion(notification)}
                >
                  {notification.desc}
                </div>
                {/* <hr className="notificationsHr" /> */}
              </>
            ))
            .reverse()}
        </Typography>
      </Popover>
    </div>
  );
}
