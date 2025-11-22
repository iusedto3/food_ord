const StatusBadge = ({ status }) => {
  const classes = {
    preparing: "badge preparing",
    delivering: "badge delivering",
    completed: "badge completed",
    canceled: "badge canceled",
  };

  return <span className={classes[status]}>{status}</span>;
};

export default StatusBadge;
