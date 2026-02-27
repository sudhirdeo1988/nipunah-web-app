"use client";

import React, { useMemo, memo } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const DashboardWidgets = memo(function DashboardWidgets({ stats, loading }) {
  const { visibleDashboardComponentKeys } = useRolePermissions();

  const allWidgetData = useMemo(
    () => [
      {
        componentKey: "registered_companies",
        title: "Registered Companies",
        value: stats?.companies ?? 0,
        icon: <TeamOutlined style={{ fontSize: "24px", color: "#5fa8d3" }} />,
        color: "#5fa8d3",
        bgColor: "#f0f4ff",
      },
      {
        componentKey: "total_users",
        title: "Total Users",
        value: stats?.users ?? 0,
        icon: <UserOutlined style={{ fontSize: "24px", color: "#149b5c" }} />,
        color: "#149b5c",
        bgColor: "#f0f9f4",
      },
      {
        componentKey: "total_experts",
        title: "Experts",
        value: stats?.experts ?? 0,
        icon: <CrownOutlined style={{ fontSize: "24px", color: "#f79009" }} />,
        color: "#f79009",
        bgColor: "#fff7e6",
      },
      {
        componentKey: "active_jobs",
        title: "Active Jobs",
        value: stats?.jobs ?? 0,
        icon: <FileTextOutlined style={{ fontSize: "24px", color: "#f04438" }} />,
        color: "#f04438",
        bgColor: "#fef2f2",
      },
    ],
    [stats?.companies, stats?.users, stats?.experts, stats?.jobs]
  );

  const widgetData = useMemo(
    () =>
      allWidgetData.filter((w) =>
        visibleDashboardComponentKeys.has(w.componentKey)
      ),
    [allWidgetData, visibleDashboardComponentKeys]
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
        <div className="mt-3 color-light">Loading statistics...</div>
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {widgetData.map((widget, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            className="dashboard-widget"
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              background: `linear-gradient(135deg, ${widget.bgColor} 0%, #ffffff 100%)`,
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <div className="mb-2">
                  <Statistic
                    title={
                      <span
                        className="semiBold"
                        style={{
                          color: "#667085",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {widget.title}
                      </span>
                    }
                    value={widget.value}
                    styles={{
                      content: {
                        color: widget.color,
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1.2",
                      },
                    }}
                  />
                </div>
                <div className="d-flex align-items-center">
                  <span
                    className="semiBold"
                    style={{
                      color: widget.color,
                      fontSize: "12px",
                    }}
                  >
                    +12% from last month
                  </span>
                </div>
              </div>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: widget.bgColor,
                  border: `2px solid ${widget.color}20`,
                }}
              >
                {widget.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
});

export default DashboardWidgets;
