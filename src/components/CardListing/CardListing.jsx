import React from "react";
import { List } from "antd";

const CardListing = ({
  data,
  CardComponent,
  pageSize = 10,
  loading = false,
  onPageChange,
}) => {
  return (
    <List
      loading={loading}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item key={item?.id} className="mb-3 p-0 border-0">
          <CardComponent data={item} />
        </List.Item>
      )}
      pagination={{
        onChange: (page) => onPageChange?.(page),
        pageSize,
        hideOnSinglePage: true,
      }}
    />
  );
};

export default CardListing;
