import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { HiOutlineUserCircle } from "react-icons/hi";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { backend_url } from "../../server";
import { getAvatarUrl, getProductImageUrl } from "../../utils/mediaUtils";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import GoogleTranslate from "./GoogleTranslate";
import { RxCross1 } from "react-icons/rx";
import { getRootCategoriesPublic } from "../../redux/actions/category";

const Header = ({ activeHeading }) => {
  const dispatch = useDispatch();
  const { isSeller, seller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu

  const dropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  // Use API categories directly - already filtered to root categories
  const rootCategories = categories || [];

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter products
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    setSearchData(filteredProducts);
  };

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      {/* Modern Gradient Top Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-1"></div>

      {/* Main Header with Logo and Navigation */}
      <div className="bg-white shadow-lg border-b border-gray-200/50 backdrop-blur-sm">
        <div className={`${styles.section}`}>
          <div className="hidden 800px:flex items-center justify-between py-2 gap-2">
            {/* Logo - Fixed width */}
            <div
              className="flex-shrink-0"
              style={{ minWidth: "180px", maxWidth: "200px" }}
            >
              <Link to="/">
                <img
                  src="/logo (10).png"
                  alt="Mall of Cayman"
                  className="h-[70px] w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation Links - Centered with even spacing */}
            <nav className="flex-1 flex items-center justify-center">
              <Navbar active={activeHeading} />
            </nav>

            {/* Right Side - Icons and Auth */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* Search Icon */}
              <button className="p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-110">
                <AiOutlineSearch size={22} />
              </button>

              {/* Wishlist */}
              <button
                className="relative p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300 hover:scale-110"
                onClick={() => setOpenWishlist(true)}
              >
                <AiOutlineHeart size={22} />
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 hover:scale-110"
                onClick={() => setOpenCart(true)}
              >
                <AiOutlineShoppingCart size={22} />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Sign In / Register or Profile */}
              {isAuthenticated || isSeller ? (
                <Link
                  to={isSeller ? "/dashboard" : "/profile"}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <img
                    src={getAvatarUrl(
                      isSeller ? seller?.avatar : user?.avatar,
                      backend_url
                    )}
                    className="w-7 h-7 rounded-full object-cover border-2 border-white/50"
                    alt="Profile"
                  />
                  <span className="text-sm font-medium">
                    {isSeller ? "Dashboard" : "Profile"}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-600 text-sm font-medium hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div
        className={`${
          active
            ? "shadow-xl fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-200/50"
            : "bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 border-b border-gray-200/50"
        } transition-all duration-300 hidden 800px:block w-full`}
      >
        <div className={`${styles.section}`}>
          <div className="flex items-center justify-center py-3">
            {/* Search Box - Centered */}
            <div className="w-full max-w-2xl relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, stores..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-2 rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <AiOutlineSearch size={18} />
                </button>
              </div>

              {searchData && searchData.length !== 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-purple-200/50 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {searchData.map((product, index) => (
                    <Link
                      key={index}
                      to={`/product/${product._id}`}
                      className="block"
                      onClick={() => setSearchData(null)}
                    >
                      <div className="flex items-center p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b border-gray-100 last:border-b-0 transition-all duration-300 hover:scale-[1.02]">
                        <img
                          src={getProductImageUrl(
                            product.images,
                            0,
                            backend_url
                          )}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-xl mr-3 shadow-sm"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                            ${product.discountPrice}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active ? "shadow-xl fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md" : ""
        } w-full h-16 bg-white border-b border-purple-100/50 shadow-sm 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between px-4 h-full">
          {/* Menu Button */}
          <div>
            <BiMenuAltLeft
              size={28}
              className="text-slate-600 cursor-pointer hover:text-purple-600 hover:bg-purple-50 p-1 rounded-xl transition-all duration-300 hover:scale-110"
              onClick={() => setOpen(true)}
            />
          </div>

          {/* Logo */}
          <div className="flex items-center flex-1 justify-center">
            <Link
              to="/"
              className="group hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <img
                src="/logo (10).png"
                alt="Mall of Cayman"
                className="h-20 w-auto object-contain transition-all duration-300"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,61,165,0.1))",
                  maxWidth: "200px",
                }}
              />
            </Link>
          </div>

          {/* Right Side Icons - Cart and Profile */}
          <div className="flex items-center space-x-3">
            {/* Profile/Login */}
            <div className="cursor-pointer">
              {isAuthenticated || isSeller ? (
                <Link to={isSeller ? "/dashboard" : "/profile"}>
                  <img
                    src={getAvatarUrl(
                      isSeller ? seller?.avatar : user?.avatar,
                      backend_url
                    )}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-110 shadow-sm"
                    alt="Profile"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="p-2 hover:bg-purple-50 rounded-xl transition-all duration-300 block hover:scale-110"
                >
                  <CgProfile
                    size={24}
                    className="text-slate-600 hover:text-purple-600 transition-colors duration-200"
                  />
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <div
              className="relative cursor-pointer p-2 hover:bg-emerald-50 rounded-xl transition-all duration-300 hover:scale-110"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={24} className="text-slate-600 hover:text-emerald-600 transition-colors duration-200" />
              {cart && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div
          className="fixed w-full bg-black/40 backdrop-blur-sm z-40 h-full top-0 left-0 animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed w-4/5 max-w-sm bg-white/95 backdrop-blur-md h-screen top-0 left-0 z-50 overflow-y-auto animate-slideInLeft shadow-2xl border-r border-purple-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header - Mall of Cayman Branding */}
            <div className="flex items-center justify-between p-4 border-b border-purple-200/50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-slideIn">
              <div className="text-white font-bold text-lg">Mall of Cayman</div>
              <RxCross1
                size={24}
                className="text-white cursor-pointer hover:text-pink-200 hover:bg-white/20 p-1 rounded-lg hover:scale-110 transition-all duration-200"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Wishlist Quick Access */}
            <div className="p-4 border-b border-purple-100/50 bg-gradient-to-r from-pink-50 to-rose-50">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-white/80 hover:shadow-lg p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => {
                  setOpenWishlist(true);
                  setOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <AiOutlineHeart size={24} className="text-pink-600" />
                  <span className="font-medium text-gray-700">
                    My Wishlist
                  </span>
                </div>
                {wishlist && wishlist.length > 0 && (
                  <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {wishlist.length}
                  </span>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div
              className="p-4 animate-slideIn"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative">
                <AiOutlineSearch
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                />
                <input
                  type="search"
                  placeholder="Search products, stores..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {searchData && searchData.length > 0 && (
                <div className="absolute bg-white/90 backdrop-blur-md border border-purple-200 rounded-xl shadow-2xl z-10 w-full left-0 mt-2 max-h-64 overflow-y-auto animate-slideInDown">
                  {searchData.map((product, index) => (
                    <Link
                      key={index}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setSearchData(null);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b border-purple-100/50 last:border-b-0 transition-all duration-300 hover:scale-[1.02]">
                        <img
                          src={getProductImageUrl(
                            product.images,
                            0,
                            backend_url
                          )}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-xl mr-3 shadow-sm"
                        />
                        <h5 className="text-sm font-medium text-gray-700 truncate">
                          {product.name}
                        </h5>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div
              className="px-4 animate-slideIn"
              style={{ animationDelay: "0.2s" }}
            >
              <Navbar active={activeHeading} />
            </div>

            {/* Become Seller Button */}
            <div
              className="p-4 animate-slideIn"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-3 rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 flex items-center justify-center hover:scale-105 transform shadow-lg hover:shadow-xl">
                  {isSeller ? "Seller Dashboard" : "Become a Seller"}
                  <IoIosArrowForward className="ml-1" size={16} />
                </button>
              </Link>
            </div>

            {/* Profile Section */}
            <div
              className="p-4 border-t border-purple-200/50 mt-4 animate-slideIn bg-gradient-to-b from-slate-50 to-purple-50"
              style={{ animationDelay: "0.4s" }}
            >
              {isAuthenticated || isSeller ? (
                <div className="flex flex-col items-center space-y-3">
                  <Link
                    to={isSeller ? "/dashboard" : "/profile"}
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={getAvatarUrl(
                        isSeller ? seller?.avatar : user?.avatar,
                        backend_url
                      )}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:scale-110 shadow-lg"
                    />
                  </Link>
                  <div className="text-center">
                    <p className="text-gray-700 font-medium">
                      {isSeller ? seller?.name : user?.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {isSeller ? seller?.email : user?.email}
                    </p>
                  </div>
                  <Link
                    to={isSeller ? "/dashboard" : "/profile"}
                    onClick={() => setOpen(false)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-2 rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {isSeller ? "Dashboard" : "View Profile"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <HiOutlineUserCircle
                      size={48}
                      className="text-purple-300 mx-auto mb-2"
                    />
                    <p className="text-gray-500 text-sm">
                      Welcome to Mall of Cayman!
                    </p>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 text-center block shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setOpen(false)}
                    className="w-full border-2 border-emerald-500 text-emerald-600 font-medium py-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all duration-300 text-center block hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
    </>
  );
};

export default Header;
