import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../Route/ProductCard/ProductCard";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import { getAllEventsShop } from "../../redux/actions/event";
import { getAvatarUrl } from "../../utils/mediaUtils";
import {
  MdStore,
  MdEvent,
  MdStar,
  MdDashboard,
  MdTrendingUp,
} from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { IoSparkles } from "react-icons/io5";

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const { id } = useParams();

  const dispatch = useDispatch();
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllEventsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const [active, setActive] = useState(1);

  const allReviews =
    products && products.map((product) => product.reviews).flat();

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Classic Tab Bar */}
      <div className="border-b border-gray-200 bg-white px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-0">
          {/* Tabs */}
          <div className="flex gap-0">
            {[
              { id: 1, label: "Products", count: products?.length || 0, icon: MdStore },
              { id: 2, label: "Events", count: events?.length || 0, icon: MdEvent },
              { id: 3, label: "Reviews", count: allReviews?.length || 0, icon: MdStar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  active === tab.id
                    ? "border-slate-800 text-slate-800"
                    : "border-transparent text-gray-500 hover:text-slate-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="text-base" />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    active === tab.id
                      ? "bg-slate-800 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Dashboard Button */}
          {isOwner && (
            <Link to="/dashboard" className="mb-1 self-end sm:self-auto">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                <MdDashboard className="text-base" />
                Dashboard
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* ── Products Tab ── */}
        {active === 1 && (
          <div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Total Products",
                  value: products?.length || 0,
                  icon: MdStore,
                  bg: "bg-blue-50 border-blue-100",
                  icon_color: "text-blue-600",
                },
                {
                  label: "Total Sales",
                  value:
                    products?.reduce(
                      (acc, product) => acc + (product.sold_out || 0),
                      0
                    ) || 0,
                  icon: MdTrendingUp,
                  bg: "bg-emerald-50 border-emerald-100",
                  icon_color: "text-emerald-600",
                },
                {
                  label: "Categories",
                  value: new Set(products?.map((p) => p.category)).size || 0,
                  icon: HiOutlineChartBar,
                  bg: "bg-purple-50 border-purple-100",
                  icon_color: "text-purple-600",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl p-4 border ${stat.bg}`}
                >
                  <stat.icon className={`text-2xl flex-shrink-0 ${stat.icon_color}`} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products &&
                products.map((i, index) => (
                  <ProductCard data={i} key={index} isShop={true} />
                ))}
            </div>

            {(!products || products.length === 0) && (
              <div className="text-center py-16">
                <MdStore className="mx-auto text-5xl text-gray-200 mb-3" />
                <p className="text-base font-semibold text-gray-500">
                  No Products Yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  This shop hasn't added any products yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Events Tab ── */}
        {active === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <IoSparkles className="text-amber-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800">
                Running Events &amp; Promotions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events &&
                events.map((i, index) => (
                  <ProductCard
                    data={i}
                    key={index}
                    isShop={true}
                    isEvent={true}
                  />
                ))}
            </div>

            {(!events || events.length === 0) && (
              <div className="text-center py-16">
                <MdEvent className="mx-auto text-5xl text-gray-200 mb-3" />
                <p className="text-base font-semibold text-gray-500">
                  No Active Events
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  This shop doesn't have any running events.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {active === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <MdStar className="text-amber-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800">
                Customer Reviews
              </h2>
            </div>

            <div className="space-y-3">
              {allReviews &&
                allReviews.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150"
                  >
                    <img
                      src={getAvatarUrl(item.user.avatar, backend_url)}
                      className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0 object-cover"
                      alt={item.user.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-gray-800">
                          {item.user.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Ratings rating={item.rating} />
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item?.comment}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {(!allReviews || allReviews.length === 0) && (
              <div className="text-center py-16">
                <MdStar className="mx-auto text-5xl text-gray-200 mb-3" />
                <p className="text-base font-semibold text-gray-500">
                  No Reviews Yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  This shop hasn't received any reviews yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfileData;
