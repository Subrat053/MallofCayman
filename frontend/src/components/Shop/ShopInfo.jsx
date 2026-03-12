import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import { getAvatarUrl } from "../../utils/mediaUtils";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import { logoutSeller } from "../../redux/actions/user";
import {
  MdLocationOn,
  MdPhone,
  MdStore,
  MdStar,
  MdCalendarToday,
  MdEdit,
  MdLogout,
} from "react-icons/md";
import { IoShieldCheckmark } from "react-icons/io5";
import { FiTrendingUp } from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";

const ShopInfo = ({ isOwner }) => {
  const [data, setData] = useState({});
  const { products } = useSelector((state) => state.products);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProductsShop(id));
    setIsLoading(true);
    axios
      .get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setData(res.data.shop);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [dispatch, id]);

  const logoutHandler = async () => {
    try {
      await dispatch(logoutSeller());
      toast.success("Logout successful!");
      navigate("/shop-login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Calculate total reviews and ratings more safely
  const totalReviewsLength =
    products?.reduce((acc, product) => {
      return acc + (product?.reviews?.length || 0);
    }, 0) || 0;

  const totalRatings =
    products?.reduce((acc, product) => {
      const productRatingSum =
        product?.reviews?.reduce((sum, review) => {
          return sum + (review?.rating || 0);
        }, 0) || 0;
      return acc + productRatingSum;
    }, 0) || 0;

  // Fix: Properly handle case when there are no reviews and round to 1 decimal
  const averageRating =
    totalReviewsLength > 0
      ? Math.round((totalRatings / totalReviewsLength) * 10) / 10
      : 0;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover Band */}
          <div className="h-20 bg-slate-800 relative">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 8px)",
              }}
            />
          </div>

          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="flex justify-center -mt-10 mb-3">
              <div className="relative">
                <img
                  src={getAvatarUrl(data.avatar, backend_url)}
                  alt={data.name}
                  className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-md"
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
            </div>

            {/* Name + Verified */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
                <IoShieldCheckmark className="text-emerald-500 text-lg flex-shrink-0" />
              </div>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                Verified Supplier
              </span>
            </div>

            {/* Description */}
            {data.description && (
              <p className="text-gray-500 text-sm text-center leading-relaxed mb-4 pb-4 border-b border-gray-100">
                {data.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="text-center bg-slate-50 rounded-lg py-3 px-2 border border-slate-100">
                <p className="text-2xl font-bold text-slate-800">
                  {products?.length || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                  Products
                </p>
              </div>
              <div className="text-center bg-amber-50 rounded-lg py-3 px-2 border border-amber-100">
                {totalReviewsLength > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">
                      {averageRating.toFixed(1)}
                      <span className="text-amber-400 text-base"> ★</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                      {totalReviewsLength} Reviews
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-slate-400">—</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                      No Reviews
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="space-y-3 mb-5 text-sm">
              <div className="flex items-start gap-3">
                <MdLocationOn className="text-slate-400 text-base mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    Address
                  </p>
                  <p className="text-slate-700 leading-snug">{data.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MdPhone className="text-slate-400 text-base mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    Phone
                  </p>
                  <p className="text-slate-700">{data.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MdCalendarToday className="text-slate-400 text-base mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    Member Since
                  </p>
                  <p className="text-slate-700">
                    {new Date(data?.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Trusted Supplier strip */}
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-lg mb-4 text-sm">
              <FiTrendingUp className="text-slate-500 text-base flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700 text-xs">
                  Trusted Supplier
                </p>
                <p className="text-slate-500 text-xs leading-snug">
                  Verified business with quality products
                </p>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <Link to="/settings" className="block">
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2">
                    <MdEdit className="text-base" />
                    Edit Shop
                  </button>
                </Link>
                <button
                  onClick={logoutHandler}
                  className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <MdLogout className="text-base" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ShopInfo;
