import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import CartItems from "../components/CartItems";
import { Link } from "react-router-dom";

const cartItems = [
  {
    productId: "Item 1",
    photo:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
    name: "MackBook",
    price: 30000,
    quantity: 4,
    stock: 10,
  },
];
const subtotal = 4000;
const tax = Math.round(subtotal * 0.18);
const shippingCharges = 200;
const discount = 400;
const total = subtotal + tax + shippingCharges;
const Cart = () => {
  const [couponCode, setCuponCode] = useState("");
  const [isValidCuponCode, setvalidCuponCode] = useState<boolean>(false);

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
  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((i, index) => <CartItems key={index} cartItem={i} />)
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
