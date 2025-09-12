import React from "react";
import { List } from "antd";
import { motion } from "framer-motion";

const CardListing = ({
  data,
  CardComponent,
  pageSize = 10,
  loading = false,
  onPageChange,
  size,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };
  return (
    <List
      loading={loading}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => (
        <motion.div
          key={item?.id}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          <List.Item key={item?.id} className="mb-3 p-0 border-0">
            <CardComponent data={item} />
          </List.Item>
        </motion.div>
      )}
      pagination={{
        onChange: (page) => onPageChange?.(page),
        pageSize,
        hideOnSinglePage: false,
        showSizeChanger: true,
      }}
      grid={{
        gutter: 16,
        xs: size?.xs || 1,
        sm: size?.sm || 1,
        md: size?.md || 2,
        lg: size?.lg || 2,
        xl: size?.xl || 2,
        xxl: size?.xxl || 2,
      }}
    />
  );
};

export default CardListing;
