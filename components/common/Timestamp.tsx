
import { timeAgo } from "@/utils/formateDate";
import React from "react";

interface TimestampProps {
    timestamp: string; // Adjust the type based on your use case
}

const Timestamp: React.FC<TimestampProps> = ({ timestamp }) => {
    return <div>{timeAgo(timestamp)}</div>;
};

export default Timestamp;
