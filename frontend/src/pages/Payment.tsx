import React from 'react';
import { useParams } from 'react-router-dom';
import PaymentStatus from '../components/payment/PaymentStatus';

const Payment: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();

  return (
    <div>
      <PaymentStatus />
    </div>
  );
};

export default Payment;
