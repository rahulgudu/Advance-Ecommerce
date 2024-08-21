import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Skeleton } from "../components/Loader";
import ProductsCard from "../components/ProductsCard";
import { useLatestProductsQuery } from "../redux/api/productsAPI";
import { addToCart } from "../redux/reducers/cartReducer";
import { CartItem } from "../types/types";

const Home = () => {
  const { data, isLoading, isError } = useLatestProductsQuery("");
  const dispatch = useDispatch();
  const addToHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) {
      return toast.error("Out of stock");
    }
    dispatch(addToCart(cartItem));
    toast.success("Added to cart")
  };
  if (isError) toast.error("Cannot Fetch the Products");
  return (
    <div className="home">
      <section></section>

      <h1>
        Latest Product
        <Link to={"/search"} className="findmore">
          More
        </Link>
      </h1>

      <main style={{ display: "flex" }}>
        {isLoading ? (
          <Skeleton width="80vh" />
        ) : (
          data?.products.map((i) => (
            <ProductsCard
              key={i._id}
              productId={i._id}
              name={i.name}
              price={i.price}
              stock={i.stock}
              handler={addToHandler}
              photo={i.photo}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Home;
