"use client";

import React, { useEffect, useState } from "react";
import { isEmpty as _isEmpty } from "lodash-es";
import "./Icon.scss";

const Icon = (props) => {
  const {
    size,
    shade,
    name,
    attrColor,
    isFilled,
    onClick = null,
    className = "",
    color,
    style,
  } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (_isEmpty(name)) return null;

  return (
    <i
      className={`material-symbols-rounded g-icon ${
        attrColor ? "attrColor" : ""
      } ${isFilled ? "filled" : "bordered"} ${!_isEmpty(size) ? size : ""} ${
        !_isEmpty(shade) ? shade : ""
      } ${className} ${isMounted ? "loaded" : ""}`}
      onClick={onClick}
      role="button"
      style={{ color: color || "", ...style }}
    >
      {name}
    </i>
  );
};

export default Icon;
