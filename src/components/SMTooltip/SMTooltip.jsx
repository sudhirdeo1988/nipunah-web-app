import React from 'react';
import { Tooltip } from 'antd';

const SMTooltip = props => {
  const { children, shouldShow, ...restProps } = props;
  if (shouldShow) {
    return <Tooltip {...restProps}>{children}</Tooltip>;
  }

  return children;
};

export default SMTooltip;
