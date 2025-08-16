import { List } from "antd";
import React from "react";
import CompanyCard from "../CompanyCard";

const data = [
  {
    id: 1,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 hours ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
  },
  {
    id: 2,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 hours ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
  },
];

const CompanyListing = () => {
  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item key={item?.id} className="mb-3 p-0 border-0">
            <CompanyCard data={item} />
          </List.Item>
        )}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 10,
          hideOnSinglePage: true,
        }}
      />
    </>
  );
};

export default CompanyListing;
