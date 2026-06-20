"use client";

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Empty, Image } from "antd";
import { loadGalleryImages } from "./imageGalleryStorage";
import "./ImageGallery.scss";

const ImageGalleryView = ({
  images,
  persistKey,
  title = "Images",
  emptyText = "No images uploaded yet.",
}) => {
  const [storedImages, setStoredImages] = useState([]);

  useEffect(() => {
    if (images?.length) {
      setStoredImages(images);
      return;
    }
    if (persistKey) {
      setStoredImages(loadGalleryImages(persistKey));
    }
  }, [images, persistKey]);

  const visibleImages = useMemo(
    () => (storedImages || []).filter((item) => item?.url && item?.status !== "error"),
    [storedImages]
  );

  if (!visibleImages.length) {
    return (
      <div className="imageGallery imageGallery--view">
        <h4 className="imageGallery__title">{title}</h4>
        <Empty description={emptyText} className="imageGallery__empty" />
      </div>
    );
  }

  return (
    <div className="imageGallery imageGallery--view">
      <div className="imageGallery__header">
        <h4 className="imageGallery__title">{title}</h4>
        <span className="imageGallery__count">{visibleImages.length}</span>
      </div>
      <Image.PreviewGroup>
        <div className="imageGallery__viewGrid">
          {visibleImages.map((item) => (
            <div key={item.uid} className="imageGallery__viewCard">
              <Image
                src={item.url}
                alt={item.name}
                className="imageGallery__viewImage"
              />
              <span className="imageGallery__viewName">{item.name}</span>
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  );
};

ImageGalleryView.propTypes = {
  images: PropTypes.array,
  persistKey: PropTypes.string,
  title: PropTypes.string,
  emptyText: PropTypes.string,
};

export default ImageGalleryView;
