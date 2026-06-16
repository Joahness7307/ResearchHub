import React from "react";
import "./ActionButton.css";

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary", // primary | secondary | danger | ghost
  type = "button",
  className = "",
  style = {},
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`action-btn ${variant} ${className}`}
      style={style}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <span className="action-btn__loading">Processing...</span> : children}
    </button>
  );
}
