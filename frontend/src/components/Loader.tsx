import React from "react";

const Loader = () => {
  return <div>Loader</div>;
};

export default Loader;

export const Skeleton = ({ width = "unset" }: { width?: string }) => {
  return (
    <div className="skeleton-loader" style={{ width }}>
      <div className="skeleton-shape"></div>
      <div className="skeleton-shape"></div>
      <div className="skeleton-shape"></div>
    </div>
  );
};
