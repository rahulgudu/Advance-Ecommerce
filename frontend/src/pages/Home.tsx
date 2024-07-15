import { Link } from "react-router-dom";
import ProductsCard from "../components/ProductsCard";

const Home = () => {
  const addToHandler = () => {};
  return (
    <div className="home">
      <section></section>

      <h1>
        Latest Product
        <Link to={"/search"} className="findmore">
          More
        </Link>
      </h1>

      <main>
        <ProductsCard
          productId="asd"
          name="MacBook"
          price={2334}
          stock={435}
          handler={addToHandler}
          photo="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034"
        />
      </main>
    </div>
  );
};

export default Home;
