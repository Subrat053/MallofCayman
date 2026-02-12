import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Star, 
  Search, 
  ChevronRight,
  Monitor,
  Shirt,
  Heart,
  Home as HomeIcon,
  Building2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Crown,
  UtensilsCrossed,
  DoorOpen,
  Anchor
} from 'lucide-react';

const MallDirectory = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredStore, setHoveredStore] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const categories = [
    { 
      id: 'electronics', 
      name: 'Electronics', 
      icon: Monitor, 
      count: 45, 
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'fashion', 
      name: 'Fashion', 
      icon: Shirt, 
      count: 38, 
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      id: 'health', 
      name: 'Health', 
      icon: Heart, 
      count: 25, 
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
      color: 'from-purple-500 to-indigo-500'
    },
    { 
      id: 'home', 
      name: 'Home Beauty', 
      icon: HomeIcon, 
      count: 30, 
      image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=100&h=100&fit=crop',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'realestate', 
      name: 'Real Estate', 
      icon: Building2, 
      count: 12, 
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop',
      color: 'from-orange-500 to-amber-500'
    },
  ];

  // Virtual mall map stores with positions
  const mallStores = [
    // Gold Members Row (Center)
    { 
      id: 1, 
      name: 'TechGadgets', 
      category: 'electronics',
      type: 'gold',
      position: { top: '50%', left: '25%' },
      zone: 'Center Plaza',
      rating: 4.8,
      products: 234
    },
    { 
      id: 2, 
      name: 'Space Mania', 
      category: 'fashion',
      type: 'gold',
      position: { top: '50%', left: '50%' },
      zone: 'Center Plaza',
      rating: 4.6,
      products: 189
    },
    { 
      id: 3, 
      name: 'Amazing Finds', 
      category: 'home',
      type: 'gold',
      position: { top: '50%', left: '75%' },
      zone: 'Center Plaza',
      rating: 4.7,
      products: 156
    },
    
    // Upper Level Stores
    { 
      id: 4, 
      name: 'Fashion Hub', 
      category: 'fashion',
      type: 'retail',
      position: { top: '25%', left: '20%' },
      zone: 'North Wing',
      rating: 4.5,
      products: 98
    },
    { 
      id: 5, 
      name: 'Health Plus', 
      category: 'health',
      type: 'anchor',
      position: { top: '25%', left: '50%' },
      zone: 'North Wing',
      rating: 4.9,
      products: 267
    },
    { 
      id: 6, 
      name: 'Style Corner', 
      category: 'fashion',
      type: 'retail',
      position: { top: '25%', left: '80%' },
      zone: 'North Wing',
      rating: 4.6,
      products: 123
    },
    
    // Lower Level Stores
    { 
      id: 7, 
      name: 'Home Decor', 
      category: 'home',
      type: 'retail',
      position: { top: '75%', left: '20%' },
      zone: 'South Wing',
      rating: 4.4,
      products: 145
    },
    { 
      id: 8, 
      name: 'Tech World', 
      category: 'electronics',
      type: 'anchor',
      position: { top: '75%', left: '50%' },
      zone: 'South Wing',
      rating: 4.7,
      products: 312
    },
    { 
      id: 9, 
      name: 'Real Estate Pro', 
      category: 'realestate',
      type: 'retail',
      position: { top: '75%', left: '80%' },
      zone: 'South Wing',
      rating: 4.3,
      products: 78
    },
    
    // Side Stores
    { 
      id: 10, 
      name: 'Beauty Boutique', 
      category: 'health',
      type: 'retail',
      position: { top: '35%', left: '10%' },
      zone: 'West Wing',
      rating: 4.5,
      products: 156
    },
    { 
      id: 11, 
      name: 'Electronics Plus', 
      category: 'electronics',
      type: 'retail',
      position: { top: '65%', left: '10%' },
      zone: 'West Wing',
      rating: 4.6,
      products: 189
    },
    { 
      id: 12, 
      name: 'Smart Home', 
      category: 'home',
      type: 'retail',
      position: { top: '35%', left: '90%' },
      zone: 'East Wing',
      rating: 4.4,
      products: 134
    },
    { 
      id: 13, 
      name: 'Property Hub', 
      category: 'realestate',
      type: 'retail',
      position: { top: '65%', left: '90%' },
      zone: 'East Wing',
      rating: 4.2,
      products: 45
    },
  ];

  // Map legend items
  const legendItems = [
    { label: 'Gold Members', color: 'bg-amber-400', icon: Crown, type: 'gold' },
    { label: 'Anchor Stores', color: 'bg-blue-600', icon: Anchor, type: 'anchor' },
    { label: 'Retail', color: 'bg-purple-500', icon: Store, type: 'retail' },
    { label: 'Food & Entertainment', color: 'bg-emerald-500', icon: UtensilsCrossed, type: 'food' },
    { label: 'Entrances', color: 'bg-green-500', icon: DoorOpen, type: 'entrance' },
  ];

  const filteredStores = selectedCategory 
    ? mallStores.filter(store => store.category === selectedCategory)
    : mallStores;

  const goldMembersCount = mallStores.filter(s => s.type === 'gold').length;

  return (
    <section className=" lg:py-4 rounded-xl bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto lg:px-4 max-w-7xl">
        {/* Section Header */}
        {/* <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-start font-bold text-gray-900 mb-2">
              Explore Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Mall</span>
            </h2>
            <p className="text-gray-600 text-lg">Interactive store directory & categories</p>
          </div>
          <Link 
            to="/directory" 
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-lg"
          >
            View All Stores <ArrowRight className="w-5 h-5" />
          </Link>
        </div> */}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-2 lg:gap-4">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-3 space-y-2">
            {/* Categories Card */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div className=''>
                    <h3 className="font-bold text-white text-md">Shop by Category</h3>
                    <p className="text-blue-100 text-sm">Browse our collection</p>
                  </div>
                </div>
              </div>

              {/* Categories List */}
              <div className="p-4 space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(isActive ? null : category.id)}
                      className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4 p-2">
                        {/* Category Image/Icon */}
                        <div className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        }`}>
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center ${
                            isActive ? 'bg-black/20' : 'bg-gradient-to-br ' + category.color + ' opacity-0 group-hover:opacity-90'
                          } transition-opacity`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-base">{category.name}</p>
                          <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            Explore collection
                          </p>
                        </div>

                        {/* Count Badge */}
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          isActive ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-3">
                <Link
                  to="/all-products"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className='text-[13px]'>Browse All Products</span>
                </Link>
                <Link
                  to="/become-seller"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-pink-500/30 hover:shadow-xl"
                >
                  <Store className="w-5 h-5" />
                  <span className='text-[14px]'>Become a Seller</span>
                </Link>
              </div>
            </div>
          </div>


          {/* Center - Interactive Mall Map */}
          <div className="lg:col-span-9">
            {/* Mall Directory Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-2xl overflow-hidden mb-6">
              <div className="relative p-3 lg:p-6">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-2 lg:gap-4">
                      <div className="w-18 h-18 lg:h-16 lg:w-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-md md:text-2xl font-bold text-white">Mall Directory</h3>
                          <span className="px-3 py-1 bg-amber-400 text-amber-900 text-[10px] lg:text-xs font-bold rounded-full uppercase">
                            Interactive
                          </span>
                        </div>
                        <p className="text-blue-100 text-start text-sm lg:text-md">Explore our premium stores & discover amazing deals</p>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-evenly">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl  px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center text-white mb-1">
                          <Store className="w-5 h-5" />
                          <span className="text-xl lg:text-3xl font-bold">{mallStores.length}+</span>
                        </div>
                        <p className="text-blue-200 text-[12px] lg:text-sm font-medium">STORES</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center text-white mb-1">
                          <ShoppingBag className="w-5 h-5" />
                          <span className="text-xl lg:text-3xl font-bold">1+</span>
                        </div>
                        <p className="text-blue-200 text-[12px] lg:text-sm font-medium">PRODUCTS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Location Header */}
            <div className="bg-white rounded-xl px-3 py-2 mb-6 shadow-md border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-[14px] lg:text-base text-gray-700">Mall of Cayman - Promenade Level</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Interactive Virtual Mall Map */}
            <div className="bg-white rounded-xl  shadow-2xl overflow-hidden border-2 border-gray-200">
              {/* Mall Map Container */}
              <div className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 p-2 md:p-4 lg:p-6 overflow-x-auto">
                {/* Parking Area Label */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-gray-400/80 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl text-[10px] lg:text-sm font-bold shadow-lg z-10">
                  🅿️ PARKING AREA
                </div>

                {/* Main Mall Building */}
                <div 
                  className="relative mx-auto max-w-6xl min-h-[300px] md:min-h-[600px] lg:min-h-[500px]"
                  style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.3s ease' }}
                >
                  {/* Mall Island Structure with Clear Zones */}
                  <div className="relative aspect-[16/12] bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-3xl shadow-2xl border-4 border-gray-300">
                    
                    {/* Grid Lines for Reference */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-400"></div>
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400"></div>
                      <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-400"></div>
                      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-400"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                      <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-400"></div>
                    </div>

                    {/* North Wing Zone */}
                    <div className="absolute top-[10%] left-[15%] right-[15%] h-[20%] bg-gradient-to-b from-blue-100/60 to-transparent rounded-2xl border-2 border-blue-200/40">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        NORTH WING
                      </div>
                    </div>

                    {/* Center Plaza Zone */}
                    <div className="absolute top-[40%] left-[20%] right-[20%] h-[20%] bg-gradient-to-br from-amber-100/70 to-orange-100/50 rounded-2xl border-2 border-amber-300/60 shadow-lg">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        CENTER PLAZA - GOLD MEMBERS
                      </div>
                      {/* Center Courtyard */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white">
                        <MapPin className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                      </div>
                    </div>

                    {/* South Wing Zone */}
                    <div className="absolute bottom-[10%] left-[15%] right-[15%] h-[20%] bg-gradient-to-t from-purple-100/60 to-transparent rounded-2xl border-2 border-purple-200/40">
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        SOUTH WING
                      </div>
                    </div>

                    {/* West Wing Zone */}
                    <div className="absolute top-[28%] left-[5%] w-[15%] h-[40%] bg-gradient-to-r from-green-100/60 to-transparent rounded-2xl border-2 border-green-200/40">
                      <div className="absolute top-21 left-2 -translate-x-1/2 bg-green-600 text-white px-1 py-2 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                        <span style={{ writingMode: 'vertical-rl' }}>WEST</span>
                      </div>
                    </div>

                    {/* East Wing Zone */}
                    <div className="absolute top-[28%] right-[5%] w-[15%] h-[40%] bg-gradient-to-l from-pink-100/60 to-transparent rounded-2xl border-2 border-pink-200/40">
                      <div className="absolute top-21 right-2 translate-x-1/2 bg-pink-600 text-white px-1 py-2 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                        <span style={{ writingMode: 'vertical-rl' }}>EAST</span>
                      </div>
                    </div>

                    {/* Food Court Area */}
                    <div className="absolute top-[35%] left-[35%] w-[10%] h-[10%] bg-emerald-200/80 rounded-xl border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                      <UtensilsCrossed className="w-6 h-6 text-emerald-700" />
                    </div>

                    {/* Mall Entrance (Main - South) */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t-2xl shadow-2xl border-4 border-white overflow-hidden group hover:scale-110 transition-transform">
                      <div className="px-1 md:px-2 lg:px-4 py-2 text-center flex items-center justify-center gap-2">
                        <DoorOpen className="w-3 h-3 lg:w-7 lg:h-7 text-white mx-auto mb-1" />
                        <p className="text-white font-bold text-[10px] lg:text-xs whitespace-nowrap">MAIN ENTRANCE</p>
                      </div>
                    </div>

                    {/* Side Entrance (West) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-r-2xl shadow-2xl border-4 border-white group hover:scale-110 transition-transform">
                      <div className="px-3 py-6 flex flex-col items-center justify-center">
                        <DoorOpen className="w-6 h-6 text-white rotate-90 mb-2" />
                        <p className="text-white font-bold text-xs writing-mode-vertical whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>WEST</p>
                      </div>
                    </div>

                    {/* Side Entrance (East) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-l-2xl shadow-2xl border-4 border-white group hover:scale-110 transition-transform">
                      <div className="px-3 py-6 flex flex-col items-center justify-center">
                        <DoorOpen className="w-6 h-6 text-white -rotate-90 mb-2" />
                        <p className="text-white font-bold text-xs writing-mode-vertical whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>EAST</p>
                      </div>
                    </div>

                    {/* Store Markers */}
                    {filteredStores.map((store) => {
                      const storeColor = store.type === 'gold' 
                        ? 'from-amber-400 via-amber-500 to-yellow-500' 
                        : store.type === 'anchor'
                        ? 'from-blue-500 via-blue-600 to-indigo-600'
                        : 'from-purple-500 via-purple-600 to-pink-600';

                      const storeBorder = store.type === 'gold'
                        ? 'ring-4 ring-amber-300'
                        : store.type === 'anchor'
                        ? 'ring-4 ring-blue-300'
                        : 'ring-2 ring-purple-300';

                      const isHovered = hoveredStore === store.id;
                      
                      return (
                        <div
                          key={store.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                          style={{ top: store.position.top, left: store.position.left }}
                          onMouseEnter={() => setHoveredStore(store.id)}
                          onMouseLeave={() => setHoveredStore(null)}
                        >
                          {/* Store Marker Container */}
                          <div className="relative">
                            {/* Store Icon with Better Visibility */}
                            <div className={`relative transition-all duration-300 ${
                              isHovered ? 'scale-125 z-50' : 'scale-100'
                            }`}>
                              {/* Glow Effect */}
                              {isHovered && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${storeColor} blur-xl opacity-60 animate-pulse`}></div>
                              )}
                              
                              {/* Main Store Box */}
                              <div className={`relative w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br ${storeColor} shadow-2xl ${storeBorder} transition-all duration-300`}>
                                <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center p-1">
                                  <Store className="w-8 h-8 md:w-10 md:h-5 lg:w-6 lg:h-6 text-white mb-1" />
                                  <span className="text-white font-bold text-[8px] md:text-[10px] text-center leading-tight line-clamp-2">
                                    {store.name}
                                  </span>
                                </div>
                                
                                {/* Premium Badge */}
                                {store.type === 'gold' && (
                                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-xl ring-2 ring-amber-400">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                  </div>
                                )}

                                {/* Anchor Badge */}
                                {store.type === 'anchor' && (
                                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-xl ring-2 ring-blue-400">
                                    <Anchor className="w-5 h-5 text-blue-600" />
                                  </div>
                                )}

                                {/* Rating Badge */}
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-1 shadow-lg flex items-center gap-1">
                                  <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
                                  <span className="text-[10px] font-bold text-gray-700">{store.rating}</span>
                                </div>

                                {/* Pulse Effect */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${storeColor} animate-ping opacity-20`}></div>
                              </div>

                              {/* Location Pin */}
                              {/* <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent ${
                                store.type === 'gold' ? 'border-t-amber-500' :
                                store.type === 'anchor' ? 'border-t-blue-600' : 'border-t-purple-600'
                              }`}></div> */}
                            </div>

                            {/* Enhanced Store Info Tooltip */}
                            {isHovered && (
                              <div className="absolute top-100 left-1/2 -translate-x-1/2 mt-6 w-72 bg-white rounded-2xl shadow-2xl p-5 z-50 border-2 border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-start gap-4">
                                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${storeColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                    <Store className="w-8 h-8 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-gray-900 text-lg truncate">{store.name}</h4>
                                      {store.type === 'gold' && <Crown className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">📍 {store.zone}</p>
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-semibold text-gray-700">{store.rating}</span>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        <ShoppingBag className="w-4 h-4 inline mr-1" />
                                        {store.products} items
                                      </div>
                                    </div>
                                    <Link
                                      to={`/store/${store.id}`}
                                      className="inline-flex items-center gap-1 text-sm bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                      Visit Store <ChevronRight className="w-4 h-4" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Map Legend - Enhanced */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl">Store Directory Legend</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {legendItems.map((item) => {
                    const Icon = item.icon;
                    const count = mallStores.filter(s => s.type === item.type).length;
                    return (
                      <div key={item.type} className="flex items-center gap-2 bg-white rounded-xl p-2  shadow-md hover:shadow-lg transition-shadow">
                        <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900">{item.label}</p>
                          {count > 0 && <p className="text-[10px] text-gray-500">{count} locations</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Zone Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-3 text-sm">MALL ZONES</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-blue-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-blue-900">North Wing</p>
                    </div>
                    <div className="bg-amber-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-amber-900">Center Plaza</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-purple-900">South Wing</p>
                    </div>
                    <div className="bg-green-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-green-900">West Wing</p>
                    </div>
                    <div className="bg-pink-100 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-bold text-pink-900">East Wing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Sellers Banner */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-6 border-2 border-amber-200 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-md lg:text-lg">{goldMembersCount} Premium Gold Sellers Featured</h4>
                    <p className="text-gray-600 text-xs lg:text-base">Top rated stores with verified quality</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/stores" className="inline-flex items-center gap-2 text-sm lg:text-base bg-white hover:bg-gray-50 text-gray-700 font-semibold px-3 py-2 lg:px-6 lg:py-3 rounded-xl transition-all shadow-md">
                    <Store className="w-5 h-5" />
                    View All Stores
                  </Link>
                  <Link to="/mall" className="inline-flex items-center gap-2 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-3 py-2 lg:px-6 lg:py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MallDirectory;
