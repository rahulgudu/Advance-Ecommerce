import { useState } from "react";
import ProductsCard from "../components/ProductsCard";
import {
  useCategoriesQuery,
  useSearchProductsQuery,
} from "../redux/api/productsAPI";
import toast from "react-hot-toast";
import { Skeleton } from "../components/Loader";
import { useDispatch } from "react-redux";
import { CartItem } from "../types/types";
import { addToCart } from "../redux/reducers/cartReducer";

const Search = () => {
  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    isError,
  } = useCategoriesQuery("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const {
    isLoading: productLoading,
    data: searchedData,
    isError: productError,
  } = useSearchProductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice,
  });


  const dispatch = useDispatch();
  const addToHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) {
      return toast.error("Out of stock");
    }
    dispatch(addToCart(cartItem));
    toast.success("Added to cart")
  };

  const isPrevPage = false;
  const isNextPage = true;

  if (isError) {
    toast.error("Cannot fetch categories");
  }
  if (productError) {
    toast.error("Cannot fetch products");
  }
  return (
    <div className="product-search-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="asc">Price (Low to High)</option>
            <option value="desc">Price (High to Low)</option>
          </select>
        </div>

        <div>
          <h4>Max Price: {maxPrice || ""}</h4>
          <input
            type="range"
            min={100}
            max={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value="">ALL</option>
            {!loadingCategories &&
              categoriesResponse?.categories.map((i) => (
                <option key={i} value={i}>
                  {i.toUpperCase()}
                </option>
              ))}
          </select>
        </div>
      </aside>
      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {productLoading ? (
          <Skeleton />
        ) : (
          <div className="search-product-list">
            {searchedData?.products.map((i) => (
              <ProductsCard
                productId={i._id}
                name={i.name}
                price={i.price}
                stock={i.stock}
                handler={addToHandler}
                photo={i.photo}
              />
            ))}
          </div>
        )}

        {searchedData && searchedData.totalPage > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}>
              Prev
            </button>
            <span>
              {page} of {searchedData.totalPage}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}>
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
};

export default Search;
