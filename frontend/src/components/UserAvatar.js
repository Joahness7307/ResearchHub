import React from "react";
import "./UserAvatar.css";

const UserAvatar = ({ user, size = 80, fontSize = 32, className = "" }) => {
  if (!user) return null;

  const hasPhoto = 
    user.profile_pic_url && 
    user.profile_pic_url.trim() !== "";

  // Get first letter of first name
  const firstLetter = user.full_name
    ? user.full_name.trim().charAt(0).toUpperCase()
    : "?";

  // Optional: Generate nice background color based on name (consistent per user)
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  const bgColor = stringToColor(user.full_name || "user");

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: fontSize,
        backgroundColor: hasPhoto ? "transparent" : bgColor,
      }}
    >
      {hasPhoto ? (
        <img
          src={user.profile_pic_url}
          alt={user.full_name}
          className="user-avatar-img"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className="user-avatar-letter"
        style={{ display: hasPhoto ? "none" : "flex" }}
      >
        {firstLetter}
      </span>
    </div>
  );
};

export default UserAvatar;