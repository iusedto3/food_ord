import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuccessOrder from "../../components/SuccessOrder/SuccessOrder";
import CheckoutProgress from "../../components/CheckoutProgress/CheckoutProgress";

const Success = () => {
  return (
    <>
      <CheckoutProgress step={3} />
      <SuccessOrder />
    </>
  );
};

export default Success;
