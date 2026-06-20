"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Image,
  Input,
  Modal,
  Progress,
  Tooltip,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  IMAGE_GALLERY_ACCEPT,
  IMAGE_GALLERY_MAX_COUNT,
} from "./imageGalleryConstants";
import { loadGalleryImages, saveGalleryImages } from "./imageGalleryStorage";
import {
  createGalleryItemFromFile,
  fileToDataUrl,
  toAntUploadFile,
  validateImageFile,
} from "./imageGalleryUtils";
import "./ImageGallery.scss";

function simulateUpload(onProgress) {
  return new Promise((resolve) => {
    let percent = 0;
    const timer = window.setInterval(() => {
      percent += Math.floor(Math.random() * 18) + 8;
      if (percent >= 100) {
        window.clearInterval(timer);
        onProgress(100);
        resolve();
        return;
      }
      onProgress(percent);
    }, 120);
  });
}

const ImageGalleryUpload = ({
  value,
  onChange,
  persistKey,
  maxCount = IMAGE_GALLERY_MAX_COUNT,
  disabled = false,
  title = "Images",
  description = "JPG, PNG, WEBP, or GIF · max 5 MB each · up to 5 images",
}) => {
  const [items, setItems] = useState(value || []);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (value?.length) {
      setItems(value);
      return;
    }
    if (persistKey) {
      setItems(loadGalleryImages(persistKey));
      return;
    }
    setItems([]);
  }, [persistKey, value]);

  const syncItems = useCallback(
    (nextItems) => {
      setItems(nextItems);
      onChange?.(nextItems);
      if (persistKey) {
        saveGalleryImages(persistKey, nextItems);
      }
    },
    [onChange, persistKey]
  );

  const uploadFileList = useMemo(
    () => items.map((item) => toAntUploadFile(item)),
    [items]
  );

  const handleBeforeUpload = useCallback(
    (file) => {
      if (items.filter((item) => item.status !== "error").length >= maxCount) {
        message.warning(`You can upload up to ${maxCount} images.`);
        return Upload.LIST_IGNORE;
      }

      const error = validateImageFile(file);
      if (error) {
        message.error(error);
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    [items, maxCount]
  );

  const customRequest = useCallback(
    async ({ file, onProgress, onSuccess, onError }) => {
      const uploadFile = file?.originFileObj || file;
      const draft = createGalleryItemFromFile(uploadFile);

      setItems((prev) => {
        const next = [...prev, draft];
        onChange?.(next);
        return next;
      });

      try {
        await simulateUpload((percent) => {
          onProgress?.({ percent });
          setItems((prev) =>
            prev.map((item) =>
              item.uid === draft.uid
                ? { ...item, percent, status: "uploading" }
                : item
            )
          );
        });

        const dataUrl = await fileToDataUrl(uploadFile);
        setItems((prev) => {
          const next = prev.map((item) =>
            item.uid === draft.uid
              ? { ...item, url: dataUrl, status: "done", percent: 100 }
              : item
          );
          onChange?.(next);
          if (persistKey) saveGalleryImages(persistKey, next);
          return next;
        });

        onSuccess?.("ok");
      } catch (error) {
        setItems((prev) => {
          const next = prev.filter((item) => item.uid !== draft.uid);
          onChange?.(next);
          if (persistKey) saveGalleryImages(persistKey, next);
          return next;
        });
        onError?.(error);
        message.error("Failed to process image.");
      }
    },
    [onChange, persistKey]
  );

  const handleRemove = useCallback(
    (file) => {
      const next = items.filter((item) => item.uid !== file.uid);
      syncItems(next);
    },
    [items, syncItems]
  );

  const openRename = useCallback((item) => {
    setRenameTarget(item);
    setRenameValue(item.name || "");
  }, []);

  const confirmRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (!renameTarget || !trimmed) {
      message.warning("Enter a valid image name.");
      return;
    }
    const next = items.map((item) =>
      item.uid === renameTarget.uid ? { ...item, name: trimmed } : item
    );
    syncItems(next);
    setRenameTarget(null);
    setRenameValue("");
  }, [items, renameTarget, renameValue, syncItems]);

  const renderUploadItem = useCallback(
    (_originNode, file) => {
      const item = items.find((entry) => entry.uid === file.uid);
      if (!item) return null;

      const isUploading = item.status === "uploading";

      return (
        <div className="imageGallery__card">
          <div className="imageGallery__thumbWrap">
            {item.url ? (
              <Image
                src={item.url}
                alt={item.name}
                className="imageGallery__thumb"
                preview={{ mask: "Preview" }}
              />
            ) : (
              <div className="imageGallery__thumbPlaceholder">
                <UploadOutlined />
              </div>
            )}
            {isUploading ? (
              <div className="imageGallery__progressOverlay">
                <Progress
                  type="circle"
                  percent={item.percent || 0}
                  size={52}
                  strokeColor="#1890ff"
                />
              </div>
            ) : null}
          </div>

          <div className="imageGallery__meta">
            <Tooltip title={item.name}>
              <span className="imageGallery__name">{item.name}</span>
            </Tooltip>
            <div className="imageGallery__actions">
              <Tooltip title="Rename">
                <button
                  type="button"
                  className="imageGallery__iconBtn"
                  onClick={() => openRename(item)}
                  disabled={disabled || isUploading}
                  aria-label={`Rename ${item.name}`}
                >
                  <EditOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Delete">
                <button
                  type="button"
                  className="imageGallery__iconBtn imageGallery__iconBtn--danger"
                  onClick={() => handleRemove(file)}
                  disabled={disabled || isUploading}
                  aria-label={`Delete ${item.name}`}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      );
    },
    [disabled, handleRemove, items, openRename]
  );

  const canUploadMore =
    !disabled && items.filter((item) => item.status !== "error").length < maxCount;

  return (
    <div className="imageGallery imageGallery--upload">
      <div className="imageGallery__header">
        <div>
          <h4 className="imageGallery__title">{title}</h4>
          <p className="imageGallery__description">{description}</p>
        </div>
        <span className="imageGallery__count">
          {items.filter((item) => item.status === "done").length}/{maxCount}
        </span>
      </div>

      <Upload
        accept={IMAGE_GALLERY_ACCEPT}
        listType="picture-card"
        fileList={uploadFileList}
        beforeUpload={handleBeforeUpload}
        customRequest={customRequest}
        onRemove={handleRemove}
        itemRender={renderUploadItem}
        showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
        disabled={disabled}
        multiple
        className="imageGallery__upload"
      >
        {canUploadMore ? (
          <div className="imageGallery__uploadTrigger">
            <PlusOutlined />
            <span>Upload</span>
          </div>
        ) : null}
      </Upload>

      <Modal
        title="Rename image"
        open={Boolean(renameTarget)}
        onOk={confirmRename}
        onCancel={() => {
          setRenameTarget(null);
          setRenameValue("");
        }}
        okText="Save"
        destroyOnHidden
      >
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          placeholder="Image name"
          maxLength={80}
          onPressEnter={confirmRename}
        />
      </Modal>
    </div>
  );
};

ImageGalleryUpload.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  persistKey: PropTypes.string,
  maxCount: PropTypes.number,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default ImageGalleryUpload;
