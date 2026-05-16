"use client";

import React from "react";
import { Input } from "antd";
import { digitsOnlyInputProps } from "@/utilities/numericInput";

/**
 * Ant Design Input that only accepts digits (blocks letters/symbols while typing and on paste).
 */
const DigitsOnlyInput = React.forwardRef(function DigitsOnlyInput(
  { maxLength, onKeyDown, onChange, onPaste, ...rest },
  ref
) {
  const digitProps = digitsOnlyInputProps({ maxLength });

  return (
    <Input
      ref={ref}
      {...rest}
      {...digitProps}
      onKeyDown={(event) => {
        digitProps.onKeyDown(event);
        onKeyDown?.(event);
      }}
      onChange={(event) => {
        digitProps.onChange(event);
        onChange?.(event);
      }}
      onPaste={(event) => {
        digitProps.onPaste(event);
        onPaste?.(event);
      }}
    />
  );
});

export default DigitsOnlyInput;
