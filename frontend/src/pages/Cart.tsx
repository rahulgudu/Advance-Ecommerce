import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItems from "../components/CartItems";

import toast from "react-hot-toast";
import {
  addToCart,
  calculatePrice,
  removeCartItem,
} from "../redux/reducers/cartReducer";
import { CartReducerInitialState } from "../types/reducer_types";
import { CartItem } from "../types/types";

const Cart = () => {
  const { cartItems, subtotal, tax, total, shippingCharges, discount } =
    useSelector(
      (state: { cartReducer: CartReducerInitialState }) => state.cartReducer
    );
  const [couponCode, setCuponCode] = useState("");
  const [isValidCuponCode, setvalidCuponCode] = useState<boolean>(false);

  const dispatch = useDispatch();
  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity >= cartItem.stock)
      return toast.error("Maximum quantity reached");
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };
  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };

  const removeHandler = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (Math.random() > 0.5) {
        setvalidCuponCode(true);
      } else {
        setvalidCuponCode(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
      setvalidCuponCode(false);
    };
  }, [couponCode]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems]);
  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((i, index) => (
            <CartItems
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
              key={index}
              cartItem={i}
            />
          ))
        ) : (
          <h1>No Items added</h1>
        )}
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping C harges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em className="red"> - {discount}</em>
        </p>
        <p>
          <b>Total: {total}</b>
        </p>

        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCuponCode(e.target.value)}
        />

        {couponCode &&
          (isValidCuponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>{" "}
            </span>
          ) : (
            <span className="red">
              Invalid Coupoun <VscError />
            </span>
          ))}

        {cartItems.length > 0 && <Link to="/shipping">Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;
