"use client";

import React, { useCallback, useState } from "react";
import { Button, Modal } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import Icon from "@/components/Icon";
import { useLogout } from "@/hooks/useLogout";

const BECOME_EXPERT_API = "/api/experts/become-expert";

const UpgradeExpertPage = () => {
  const router = useRouter();
  const { logout } = useLogout();
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const goToDashboard = useCallback(() => {
    router.push("/app/dashboard");
  }, [router]);

  const handleLogoutForExpertLogin = useCallback(() => {
    setSuccessModalOpen(false);
    logout();
  }, [logout]);

  const handleBecomeExpertSubmit = useCallback(async (payload) => {
    const requestPayload = {
      ...payload,
      role: "expert",
    };

    const res = await fetch(BECOME_EXPERT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.message || data?.error || "Failed to submit become expert request."
      );
    }
  }, []);

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Upgrade to expert profile"
        subtitle="Share your experience, skills and education to request expert access."
        children={
          <Button icon={<ArrowLeftOutlined />} onClick={goToDashboard}>
            Back to dashboard
          </Button>
        }
      />

      <div className="p-4">
        <BecomeExpertModal
          variant="page"
          onCancel={goToDashboard}
          onSubmit={handleBecomeExpertSubmit}
          title="Upgrade to expert profile (Free)"
          closeAfterSubmit={false}
          successMessage={null}
          onSuccess={() => setSuccessModalOpen(true)}
        />
      </div>

      <Modal
        open={successModalOpen}
        onCancel={handleLogoutForExpertLogin}
        footer={null}
        width={500}
        centered
        closable
        maskClosable={false}
        className="thank-you-modal becomeExpertSuccessModal"
      >
        <div className="thank-you-content text-center py-4">
          <div className="mb-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto",
                background:
                  "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name="check_circle"
                isFilled
                color="#ffffff"
                size="large"
                style={{ fontSize: "48px" }}
              />
            </div>
          </div>

          <h3 className="C-heading size-4 extraBold mb-3">
            You&apos;re on the expert list!
          </h3>

          <p
            className="C-heading size-6 color-light mb-2"
            style={{ lineHeight: "1.6" }}
          >
            Your expert profile request has been submitted successfully. To
            unlock your new expert access and permissions, please sign in
            again.
          </p>
          <p
            className="C-heading size-6 color-light mb-4"
            style={{ lineHeight: "1.6" }}
          >
            Click <strong>Login as expert</strong> to continue, or close this
            window — either way we&apos;ll log you out so your expert session
            starts fresh.
          </p>

          <Button
            type="primary"
            size="large"
            onClick={handleLogoutForExpertLogin}
            className="C-button is-filled"
            style={{
              minWidth: "180px",
              height: "48px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Login as expert
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UpgradeExpertPage;
