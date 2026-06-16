import React from "react";
import "./ActionGroup.css";

export default function ActionGroup({ children, className = "", style = {} }) {
  return (
    <div className={`action-group ${className}`} style={style}>
      {children}
    </div>
  );
}
