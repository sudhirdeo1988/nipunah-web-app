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
      presets={[
        {
          label: "Last 7 Days",
          value: [moment().subtract(7, "days"), moment()],
        },
        {
          label: "Last 30 Days",
          value: [moment().subtract(30, "days"), moment()],
        },
        {
          label: "Last 90 Days",
          value: [moment().subtract(90, "days"), moment()],
        },
        {
          label: "This Month",
          value: [moment().startOf("month"), moment().endOf("month")],
        },
        {
          label: "Last Month",
          value: [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
          ],
        },
      ]}
    />
  );
};

export default DashboardDateRangePicker;
