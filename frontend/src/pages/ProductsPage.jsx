import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import {
  getAllCategoriesPublic,
  getSubcategoriesPublic,
} from "../redux/actions/category";
import {
  HiAdjustments,
  HiX,
  HiFilter,
  HiViewGrid,
  HiViewList,
  HiChevronRight,
  HiChevronDown,
} from "react-icons/hi";
import { useCurrency } from "../context/CurrencyContext";

// Recursive Category Tree Item Component for unlimited nesting
const CategoryTreeItem = ({
  category,
  level,
  selectedCategory,
  onSelect,
  getChildCategories,
  hasChildren,
  expandedCategories,
  toggleExpanded,
}) => {
  const categoryName = category.name || category.title;
  const categoryId = category._id || category.id;
  const isExpanded = expandedCategories.has(categoryId);
  const hasChildCategories = hasChildren(categoryId);
  const children = hasChildCategories ? getChildCategories(categoryId) : [];
  const isSelected = selectedCategory === categoryName;

  return (
    <div>
      <div
        className="flex items-center pt-1 group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-300"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {/* Expand/Collapse button */}
        {hasChildCategories ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleExpanded(categoryId);
            }}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 mr-2 rounded-md hover:bg-indigo-100 transition-all duration-200"
          >
            {isExpanded ? (
              <HiChevronDown className="w-4 h-4" />
            ) : (
              <HiChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-5 h-5 mr-2" /> // Spacer for alignment
        )}

        <label className="flex items-center flex-1 cursor-pointer group-hover:scale-[1.02] transition-transform duration-200">
          <input
            type="radio"
            name="category"
            checked={isSelected}
            onChange={() => onSelect(category)}
            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-2"
          />
          <span
            className={`ml-3 text-sm transition-all duration-200 ${level === 0 ? "font-semibold text-slate-800" : "text-slate-600"
              } ${isSelected
                ? "text-indigo-700 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                : "group-hover:text-slate-900"
              }`}
          >
            {categoryName}
          </span>
        </label>
      </div>

      {/* Render children recursively */}
      {isExpanded && hasChildCategories && (
        <div className="border-l-2 border-gradient-to-b from-indigo-200 to-purple-200 ml-3 pl-1 mt-1">
          {children.map((child) => (
            <CategoryTreeItem
              key={child._id || child.id}
              category={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              getChildCategories={getChildCategories}
              hasChildren={hasChildren}
              expandedCategories={expandedCategories}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  // Debug: Log the products when they change
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      console.log("Products loaded from Redux:", allProducts.length);
      console.log(
        "First product from Redux:",
        JSON.stringify(allProducts[0], null, 2)
      );
    }
  }, [allProducts]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getAllCategoriesPublic());
  }, [dispatch]);

  // Use API categories - all categories including subcategories
  const allCategoriesData = useMemo(() => categories || [], [categories]);
  const rootCategories = useMemo(
    () => allCategoriesData.filter((cat) => !cat.parent),
    [allCategoriesData]
  );

  // Helper function to get direct children of a category
  const getChildCategories = useCallback(
    (parentId) => {
      return allCategoriesData.filter(
        (cat) => cat.parent === parentId || cat.parent?._id === parentId
      );
    },
    [allCategoriesData]
  );

  // Check if a category has children
  const hasChildren = useCallback(
    (categoryId) => {
      return allCategoriesData.some(
        (cat) => cat.parent === categoryId || cat.parent?._id === categoryId
      );
    },
    [allCategoriesData]
  );

  // Track expanded categories for tree view
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Helper function to recursively get all subcategory IDs for a given category (unlimited depth)
  const getAllSubcategoryIds = useCallback(
    (categoryName) => {
      console.log("Getting all subcategory IDs (recursive) for:", categoryName);
      console.log("Available categories:", allCategoriesData.length);

      const category = allCategoriesData.find(
        (cat) => cat.name === categoryName || cat.title === categoryName
      );
      console.log("Found category:", category);

      if (!category) return [];

      const subcategoryIds = [category._id];

      // Recursive function to get all descendants at any depth
      const findAllDescendants = (parentId) => {
        const children = allCategoriesData.filter(
          (cat) => cat.parent === parentId || cat.parent?._id === parentId
        );

        children.forEach((child) => {
          subcategoryIds.push(child._id);
          // Recursively find children of this child (unlimited depth)
          findAllDescendants(child._id);
        });
      };

      findAllDescendants(category._id);

      console.log("Final subcategory IDs (recursive):", subcategoryIds);
      return subcategoryIds;
    },
    [allCategoriesData]
  );

  useEffect(() => {
    if (categoryData === null) {
      const d = allProducts || [];
      console.log("No category filter, loading all products:", d.length);
      setData(d);
      setFilteredData(d); // Also set filteredData for all products
    } else {
      console.log("=== FILTERING BY CATEGORY ===");
      console.log("Category to filter:", categoryData);
      console.log(
        "Total products available:",
        allProducts ? allProducts.length : 0
      );

      if (!allProducts || allProducts.length === 0) {
        console.log("❌ No products available to filter");
        setData([]);
        setFilteredData([]); // Clear filteredData when no products available
        return;
      }

      // Get all category and subcategory IDs that should be included
      const allowedCategoryIds = getAllSubcategoryIds(categoryData);
      console.log("Allowed category IDs for filtering:", allowedCategoryIds);

      const d =
        allProducts &&
        allProducts.filter((product, index) => {
          console.log(`--- Product ${index + 1}: ${product.name} ---`);
          console.log("Product category:", product.category);

          // Handle different category formats
          if (typeof product.category === "string") {
            // Old format: category is stored as string name
            // Check if it matches the selected category directly
            if (product.category === categoryData) {
              console.log("✅ Direct string match found");
              return true;
            }

            // Check if this product's category is a subcategory of the selected category
            const productCategoryObj = allCategoriesData.find(
              (cat) => cat.name === product.category
            );
            if (
              productCategoryObj &&
              allowedCategoryIds.includes(productCategoryObj._id)
            ) {
              console.log(
                "✅ String category is subcategory of selected:",
                product.category
              );
              return true;
            }

            console.log("❌ String category doesn't match");
            return false;
          } else if (product.category && product.category._id) {
            // New format: category is populated object
            // Check if product's category ID matches directly
            if (allowedCategoryIds.includes(product.category._id)) {
              console.log("Direct ObjectId match found");
              return true;
            }

            // Check if product's category name matches
            if (product.category.name === categoryData) {
              console.log("Category name matches selected");
              return true;
            }

            // Check if product's category is a subcategory and its parent matches
            if (
              product.category.parent &&
              allowedCategoryIds.includes(product.category.parent)
            ) {
              console.log(
                "✅ Product category parent matches selected category"
              );
              console.log("Product category parent:", product.category.parent);
              console.log("Allowed category IDs:", allowedCategoryIds);
              console.log(
                "Parent in allowed list:",
                allowedCategoryIds.includes(product.category.parent)
              );
              return true;
            }

            // Add detailed debugging for why it's not matching
            console.log("❌ No match found for product:");
            console.log("  Product category ID:", product.category._id);
            console.log("  Product category name:", product.category.name);
            console.log("  Product category parent:", product.category.parent);
            console.log("  Selected category:", categoryData);
            console.log("  Allowed category IDs:", allowedCategoryIds);
            console.log(
              "  Direct ID match:",
              allowedCategoryIds.includes(product.category._id)
            );
            console.log(
              "  Name match:",
              product.category.name === categoryData
            );
            console.log(
              "  Parent match:",
              product.category.parent &&
              allowedCategoryIds.includes(product.category.parent)
            );

            return false;
          } else if (product.category && product.category.name) {
            // Partial object format
            const result = product.category.name === categoryData;
            console.log("Name comparison result:", result);
            return result;
          }

          console.log("❌ Product has undefined/invalid category");
          return false;
        });

      console.log("=== FILTERING COMPLETE ===");
      console.log("Filtered products count:", d ? d.length : 0);
      if (d && d.length > 0) {
        console.log(
          "Found products:",
          d.map((p) => p.name)
        );
      } else {
        console.log("No products found for this category");
      }
      console.log(
        "About to set data state with:",
        d ? d.length : 0,
        "products"
      );
      setData(d || []);

      // ALWAYS set filteredData regardless of whether products were found or not
      console.log(
        "Setting filteredData to URL filtering results:",
        d ? d.length : 0
      );
      setFilteredData(d || []);
    }
    // Don't set selectedCategory here to avoid double filtering with sidebar
    // setSelectedCategory(categoryData || "");
  }, [allProducts, categoryData, getAllSubcategoryIds, allCategoriesData]);

  // Apply filters
  useEffect(() => {
    // Don't run sidebar filtering if we have a URL category parameter
    // The URL filtering already handles this correctly
    if (categoryData) {
      console.log("=== SIDEBAR FILTERING SKIPPED ===");
      console.log("Reason: URL category parameter exists:", categoryData);
      console.log("Using URL filtering results instead");
      return;
    }

    // Don't run sidebar filtering if data is empty or not yet loaded
    if (!data || data.length === 0) {
      console.log("=== SIDEBAR FILTERING SKIPPED ===");
      console.log("Reason: data is empty or not loaded yet");
      console.log("Data length:", data ? data.length : "undefined");
      setFilteredData([]);
      return;
    }

    console.log("=== SIDEBAR FILTERING ===");
    console.log("Input data for sidebar filtering:", data ? data.length : 0);
    console.log("selectedCategory:", selectedCategory);
    console.log("selectedSubcategory:", selectedSubcategory);

    let filtered = [...(data || [])];
    console.log("Starting with filtered array:", filtered.length);

    // Category filter (including subcategory)
    const categoryToFilter = selectedSubcategory || selectedCategory;
    if (categoryToFilter) {
      console.log("Filtering by category:", categoryToFilter);
      // If it's a subcategory, filter exactly by that subcategory
      if (selectedSubcategory) {
        console.log("Filtering by subcategory");
        filtered = filtered.filter((product) => {
          if (typeof product.category === "string") {
            return product.category === categoryToFilter;
          } else if (product.category && product.category._id) {
            return product.category._id === categoryToFilter;
          } else if (product.category && product.category.name) {
            return product.category.name === categoryToFilter;
          }
          return false;
        });
      } else {
        // If it's a parent category, include all its subcategories
        const allowedCategoryIds = getAllSubcategoryIds(categoryToFilter);
        filtered = filtered.filter((product) => {
          if (typeof product.category === "string") {
            return product.category === categoryToFilter;
          } else if (product.category && product.category._id) {
            return allowedCategoryIds.includes(product.category._id);
          } else if (product.category && product.category.name) {
            return product.category.name === categoryToFilter;
          }
          return false;
        });
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.name &&
            product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const price = product.discountPrice || product.originalPrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            (a.discountPrice || a.originalPrice) -
            (b.discountPrice || b.originalPrice)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (b.discountPrice || b.originalPrice) -
            (a.discountPrice || a.originalPrice)
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      default:
        break;
    }

    console.log("=== SIDEBAR FILTERING COMPLETE ===");
    console.log("Final filtered data:", filtered.length);
    if (filtered.length > 0) {
      console.log(
        "Final filtered products:",
        filtered.map((p) => p.name)
      );
    }
    setFilteredData(filtered);
  }, [
    data,
    selectedCategory,
    selectedSubcategory,
    priceRange,
    sortBy,
    searchTerm,
    getAllSubcategoryIds,
    categoryData,
  ]);

  const handleCategoryChange = (category, categoryObj = null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(""); // Reset subcategory when parent changes

    if (category && categoryObj) {
      // Fetch subcategories for this category
      dispatch(getSubcategoriesPublic(categoryObj._id));
    }

    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setPriceRange([0, 10000]);
    setSortBy("default");
    setSearchTerm("");
    setSearchParams({});
  };

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-indigo-600 mx-auto mb-6 shadow-lg"></div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-white/20">
              <p className="text-slate-700 text-lg font-semibold">Loading products...</p>
              <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest products</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Header activeHeading={3} />

          {/* Main Content */}
          <div className="pb-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-4">
                <div className="text-center lg:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
                    {selectedCategory ? selectedCategory : "All Products"}
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <p className="text-md font-medium">
                      {filteredData?.length || 0} products found
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 ">
                {/* Sidebar Filters */}
                <div
                  className={`lg:w-80 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"
                    }`}
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 lg:p-5 sticky top-24">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm lg:text-md font-bold text-slate-900 flex items-center">
                        <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                          <HiFilter className="w-4 h-4 text-white" />
                        </div>
                        Filters
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={clearFilters}
                          className="px-2 py-1 text-sm text-indigo-600 hover:text-indigo-700 font-semibold bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                          Clear All
                        </button>
                        {/* Mobile Close Button */}
                        <button
                          onClick={() => setShowFilters(false)}
                          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                          aria-label="Close filters"
                        >
                          <HiX className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-800 mb-3">
                        Search Products
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by name or description..."
                          className="w-full px-4 py-3 pl-4 pr-10 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <div className="w-5 h-5 text-slate-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Categories
                      </label>
                      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-4 border border-slate-200">
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          <label className="flex items-center py-2 px-3 rounded-xl hover:bg-white/60 transition-all duration-200 group cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              checked={
                                selectedCategory === "" &&
                                selectedSubcategory === ""
                              }
                              onChange={() => {
                                handleCategoryChange("");
                                setSelectedSubcategory("");
                              }}
                              className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                              All Categories
                            </span>
                          </label>

                          {/* Recursive Category Tree Component */}
                          {rootCategories.map((category) => (
                            <CategoryTreeItem
                              key={category._id || category.id}
                              category={category}
                              level={0}
                              selectedCategory={selectedCategory}
                              onSelect={(cat) => {
                                handleCategoryChange(cat.name || cat.title, cat);
                                // Auto-expand parent when selecting
                                if (cat.parent) {
                                  setExpandedCategories(
                                    (prev) => new Set([...prev, cat.parent])
                                  );
                                }
                              }}
                              getChildCategories={getChildCategories}
                              hasChildren={hasChildren}
                              expandedCategories={expandedCategories}
                              toggleExpanded={toggleExpanded}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Price Range
                      </label>
                      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-3 border border-slate-200">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Min Price</label>
                              <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) =>
                                  setPriceRange([
                                    parseInt(e.target.value) || 0,
                                    priceRange[1],
                                  ])
                                }
                                placeholder="Min"
                                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/70 backdrop-blur-sm transition-all duration-300"
                              />
                            </div>
                            <div className="flex items-center justify-center pt-6">
                              <span className="text-slate-400 text-lg font-medium">-</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Max Price</label>
                              <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) =>
                                  setPriceRange([
                                    priceRange[0],
                                    parseInt(e.target.value) || 10000,
                                  ])
                                }
                                placeholder="Max"
                                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/70 backdrop-blur-sm transition-all duration-300"
                              />
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-md border border-slate-200">
                            <div className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Sort By
                      </label>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/70 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-300 hover:border-indigo-300"
                        >
                          <option value="default">Default</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="name">Name: A to Z</option>
                          <option value="rating">Highest Rated</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <HiChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Product Area */}
                <div className="flex-1">
                  {/* Mobile Filter Toggle & View Controls */}
                  <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <HiAdjustments className="w-5 h-5 mr-2" />
                      Filters
                    </button>

                    {/* Show result count on mobile */}
                    <div className="lg:hidden text-sm font-medium text-slate-600">
                      {filteredData?.length || 0} items
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-600 hidden sm:block">
                        View:
                      </span>
                      <div className="flex items-center bg-white/80 rounded-xl p-1 shadow-md border border-slate-200">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-3 rounded-lg transition-all duration-300 ${viewMode === "grid"
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                          <HiViewGrid className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-3 rounded-lg transition-all duration-300 ${viewMode === "list"
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                          <HiViewList className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {filteredData && filteredData.length > 0 ? (
                    <div
                      className={`${viewMode === "grid"
                          ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-fr"
                          : "space-y-6"
                        }`}
                    >
                      {filteredData.map((product, index) => (
                        <div key={index} className="h-full group">
                          <div className="h-full transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                            <ProductCard data={product} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-indigo-300 rounded-2xl flex items-center justify-center">
                            <HiX className="w-7 h-7 text-slate-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                          No products found
                        </h3>
                        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                          We couldn't find any products matching your current filters. Try adjusting your search criteria.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;
