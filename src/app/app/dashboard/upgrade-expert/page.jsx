"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Button, Modal } from "antd";
import { useRouter } from "next/navigation";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import ExpertProfileFormLayout from "@/components/BecomeExpertModal/ExpertProfileFormLayout";
import Icon from "@/components/Icon";
import { useLogout } from "@/hooks/useLogout";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import {
  expertBasicInfoFormValues,
  expertCareerFormValues,
} from "@/utilities/expertProfileNormalize";

const BECOME_EXPERT_API = "/api/experts/become-expert";

const UpgradeExpertPage = () => {
  const router = useRouter();
  const { logout } = useLogout();
  const { user } = useNormalizedProfileUser();
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const formInitialValues = useMemo(
    () => ({
      ...expertBasicInfoFormValues(user),
      ...expertCareerFormValues(user),
    }),
    [user]
  );

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
    <>
      <ExpertProfileFormLayout
        title="Upgrade to expert profile"
        subtitle="Share your experience, skills and education to request expert access."
        onBack={goToDashboard}
        backLabel="Back to dashboard"
      >
        <BecomeExpertModal
          variant="page"
          includeBasicInfo
          profileData={user}
          initialValues={formInitialValues}
          onCancel={goToDashboard}
          onSubmit={handleBecomeExpertSubmit}
          closeAfterSubmit={false}
          successMessage={null}
          okText="Submit"
          onSuccess={() => setSuccessModalOpen(true)}
        />
      </ExpertProfileFormLayout>

      <Modal
        open={successModalOpen}
        onCancel={handleLogoutForExpertLogin}
        footer={null}
        width={500}
        centered
        closable
        mask={{ closable: false }}
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
            className="C-heading size-6 color-light mb-4"
            style={{ lineHeight: "1.6" }}
          >
            Your expert profile request has been submitted successfully. To
            unlock your new expert access and permissions, please sign in
            again.
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
    </>
  );
};

export default UpgradeExpertPage;
