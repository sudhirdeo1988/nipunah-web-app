import React, { useMemo } from "react";
import { List } from "antd";
import { motion } from "framer-motion";

const DEFAULT_GRID_COLUMNS = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 2,
  xl: 2,
  xxl: 2,
};

const CardListing = ({
  data,
  CardComponent,
  pageSize = 20,
  loading = false,
  onPageChange,
  size,
  total,
  current,
}) => {
  /**
   * Ant Design List grid picks the first matching breakpoint from
   * ['xxxl','xxl','xl',...]. If that key is missing on `grid`, columnCount is
   * undefined and cells get no width (one card per row). We set `xxxl` and
   * `column` so layout always resolves.
   */
  const listGrid = useMemo(() => {
    const xs = size?.xs ?? DEFAULT_GRID_COLUMNS.xs;
    const sm = size?.sm ?? DEFAULT_GRID_COLUMNS.sm;
    const md = size?.md ?? DEFAULT_GRID_COLUMNS.md;
    const lg = size?.lg ?? DEFAULT_GRID_COLUMNS.lg;
    const xl = size?.xl ?? DEFAULT_GRID_COLUMNS.xl;
    const xxl = size?.xxl ?? DEFAULT_GRID_COLUMNS.xxl;
    const xxxl = size?.xxxl ?? xxl;
    return {
      gutter: 16,
      // Used when breakpoint is not resolved yet; prefer single column until `screens` loads.
      column: xs,
      xs,
      sm,
      md,
      lg,
      xl,
      xxl,
      xxxl,
    };
  }, [
    size?.xs,
    size?.sm,
    size?.md,
    size?.lg,
    size?.xl,
    size?.xxl,
    size?.xxxl,
  ]);

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
        <List.Item key={item?.id} className="mb-3 p-0 border-0 h-100">
          <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{ height: "100%", width: "100%" }}
          >
            <CardComponent data={item} />
          </motion.div>
        </List.Item>
      )}
      pagination={{
        onChange: (page, pageSize) => onPageChange?.(page, pageSize),
        pageSize,
        total: total,
        current: current,
        hideOnSinglePage: false,
        showSizeChanger: true,
        defaultPageSize: pageSize || 20,
      }}
      grid={listGrid}
    />
  );
};

export default CardListing;
