import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { NewOrderRequest } from "../types/api-types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducers/cartReducer";
import { responseToast } from "../utils/features";

const stripePromise = loadStripe(
  "pk_test_51LzMEFSJq4Xt4Ij1ZehWoRdyloP8zf8fTyVDFibGPQuyE9KLKfG8w3lHbsawCHph5aeoYczbhPAHEnUzA3zjcByv00UZvJ2LBI"
);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cartReducer);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [newOrder] = useNewOrderMutation();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true); 

    const orderData: NewOrderRequest = {
      shippingInfo,
      orderItems: cartItems,
      subtotal,
      shippingCharges,
      total,
      discount,
      tax,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      user: user?._id!,
    };

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });
    if (error) {
      setIsProcessing(false);
      console.log(error.message);
      
      return toast.error(error.message || "Something went wrong");
    }

    if (paymentIntent.status === "succeeded") {
      console.log("Placing Order");
      const res = await newOrder(orderData);
      dispatch(resetCart());
      responseToast(res, navigate, "/orders");
      navigate("/orders");
    }
    setIsProcessing(false);
  };
  return (
    <div className="checkout-container">
      <form onSubmit={submitHandler}>
        <PaymentElement />
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();
  const clientSecret: string | undefined = location.state;

  if (!clientSecret) {
    return <Navigate to={"/shipping"} />;
  }
  return (
    <Elements
      options={{
        clientSecret,
      }}
      stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
