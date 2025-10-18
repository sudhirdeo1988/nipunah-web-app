"use client";

import React from "react";
import { DatePicker } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;

const DashboardDateRangePicker = ({ value, onChange, style = {} }) => {
  return (
    <RangePicker
      value={value}
      onChange={onChange}
      format="DD/MM/YYYY"
      style={{ width: 280, ...style }}
      placeholder={["Start Date", "End Date"]}
      allowClear={false}
      showToday={true}
      ranges={{
        "Last 7 Days": [moment().subtract(7, "days"), moment()],
        "Last 30 Days": [moment().subtract(30, "days"), moment()],
        "Last 90 Days": [moment().subtract(90, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      }}
    />
  );
};

export default DashboardDateRangePicker;
