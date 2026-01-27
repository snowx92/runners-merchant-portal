"use client";

import { Navbar } from "@/components/home/Navbar";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/orders/orders.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { orderService } from "@/lib/api/services/orderService";
import { zoneService } from "@/lib/api/services/zoneService";
import type { Order } from "@/lib/api/types/home.types";
import type { Zone, City } from "@/lib/api/types/zone.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

type OrderStatusFilter = "all" | "PENDING" | "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "FAILED";

interface FilterState {
  keyword: string;
  status: OrderStatusFilter;
  priceFrom: string;
  priceTo: string;
  fromGovId: string;
  toGovId: string;
  fromCityId: string;
  toCityId: string;
  shippingPriceFrom: string;
  shippingPriceTo: string;
}

export default function Orders() {
  const router = useRouter();
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  // Search states for dropdowns
  const [fromGovSearch, setFromGovSearch] = useState("");
  const [fromCitySearch, setFromCitySearch] = useState("");
  const [toGovSearch, setToGovSearch] = useState("");
  const [toCitySearch, setToCitySearch] = useState("");

  // Dropdown visibility states
  const [fromGovOpen, setFromGovOpen] = useState(false);
  const [fromCityOpen, setFromCityOpen] = useState(false);
  const [toGovOpen, setToGovOpen] = useState(false);
  const [toCityOpen, setToCityOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filter state with range defaults
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    status: "all",
    priceFrom: "0",
    priceTo: "10000",
    fromGovId: "",
    toGovId: "",
    fromCityId: "",
    toCityId: "",
    shippingPriceFrom: "0",
    shippingPriceTo: "500",
  });

  // Fetch zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesRes = await zoneService.getZones();
        if (zonesRes && zonesRes.data) {
          setZones(zonesRes.data);
        }
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };
    fetchZones();
  }, []);

  // Fetch orders when filters or page change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.status]);

  const fetchOrders = async (resetPage = false) => {
    try {
      setLoading(true);
      const page = resetPage ? 1 : currentPage;

      const params: Record<string, string> = {
        pageNo: page.toString(),
        limit: "10",
      };

      // Add filters to params (only if not default values)
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.status !== "all") params.status = filters.status;

      // Only add price filters if they differ from defaults
      if (filters.priceFrom && filters.priceFrom !== "0") params.priceFrom = filters.priceFrom;
      if (filters.priceTo && filters.priceTo !== "10000") params.priceTo = filters.priceTo;

      // Location filters are optional
      if (filters.fromGovId) params.fromGovId = filters.fromGovId;
      if (filters.toGovId) params.toGovId = filters.toGovId;
      if (filters.fromCityId) params.fromCityId = filters.fromCityId;
      if (filters.toCityId) params.toCityId = filters.toCityId;

      // Only add shipping price filters if they differ from defaults
      if (filters.shippingPriceFrom && filters.shippingPriceFrom !== "0") params.shippingPriceFrom = filters.shippingPriceFrom;
      if (filters.shippingPriceTo && filters.shippingPriceTo !== "500") params.shippingPriceTo = filters.shippingPriceTo;

      console.log("📤 Sending API request with params:", params);
      const response = await orderService.getOrders(params);

      if (response) {
        if (resetPage) {
          setOrders(response.items);
          setCurrentPage(1);
        } else {
          setOrders((prev) => page === 1 ? response.items : [...prev, ...response.items]);
        }
        setHasMore(!response.isLastPage);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders(true);
  };

  const handleStatusFilter = (status: OrderStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    fetchOrders(true);
  };

  const resetFilters = () => {
    // Reset all filter states
    setFilters({
      keyword: "",
      status: "all",
      priceFrom: "0",
      priceTo: "10000",
      fromGovId: "",
      toGovId: "",
      fromCityId: "",
      toCityId: "",
      shippingPriceFrom: "0",
      shippingPriceTo: "500",
    });
    // Reset search states
    setFromGovSearch("");
    setFromCitySearch("");
    setToGovSearch("");
    setToCitySearch("");
    setShowFilterModal(false);
    setCurrentPage(1);
    
    // Fetch orders after state updates
    setTimeout(() => {
      fetchOrders(true);
    }, 0);
  };

  // Get display name for selected governorate/city
  const getGovName = (govId: string) => zones.find((z) => z.id === govId)?.name || "";
  const getCityName = (govId: string, cityId: string) => {
    const cities = getCitiesForGovernorate(govId);
    return cities.find((c) => c.id === cityId)?.name || "";
  };

  const getStatusLabel = (status: Order["status"]) => {
    const statusKeys: Record<Order["status"], string> = {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      PICKED_UP: 'pickedUp',
      DELIVERED: 'delivered',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      FAILED: 'failed',
    };
    const key = statusKeys[status];
    return key ? t(`status.${key}`) : status;
  };

  const getStatusClass = (status: Order["status"]) => {
    const classMap: Record<Order["status"], string> = {
      PENDING: styles.badgePending,
      ACCEPTED: styles.badgeAccepted,
      PICKED_UP: styles.badgePickedUp,
      DELIVERED: styles.badgeDelivered,
      COMPLETED: styles.badgeCompleted,
      CANCELLED: styles.badgeCancelled,
      FAILED: styles.badgeFailed,
    };
    return classMap[status] || styles.badgePending;
  };

  const getCitiesForGovernorate = (govId: string): City[] => {
    const zone = zones.find((z) => z.id === govId);
    return zone?.cities || [];
  };

  // Filter zones/cities based on search
  const getFilteredFromGovs = () => {
    if (!fromGovSearch) return zones;
    return zones.filter((zone) =>
      zone.name.toLowerCase().includes(fromGovSearch.toLowerCase())
    );
  };

  const getFilteredFromCities = () => {
    const cities = getCitiesForGovernorate(filters.fromGovId);
    if (!fromCitySearch) return cities;
    return cities.filter((city) =>
      city.name.toLowerCase().includes(fromCitySearch.toLowerCase())
    );
  };

  const getFilteredToGovs = () => {
    if (!toGovSearch) return zones;
    return zones.filter((zone) =>
      zone.name.toLowerCase().includes(toGovSearch.toLowerCase())
    );
  };

  const getFilteredToCities = () => {
    const cities = getCitiesForGovernorate(filters.toGovId);
    if (!toCitySearch) return cities;
    return cities.filter((city) =>
      city.name.toLowerCase().includes(toCitySearch.toLowerCase())
    );
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* First Row: Title on right, Toggle Buttons on left */}
        <div className={styles.headerRow}>
          <div className={styles.toggleContainer}>
            <button
              className={styles.toggleButton}
              onClick={() => router.push("/orders/bulk")}
            >
              {t('createBulk')}
            </button>
            <button
              className={`${styles.toggleButton} ${styles.toggleButtonActive}`}
              onClick={() => router.push("/orders/add")}
            >
              {t('createNew')}
            </button>
          </div>
          <h1 className={styles.pageTitle}>{t('title')}</h1>
        </div>

        {/* Second Row: Search bar with filter button on left */}
        <div className={styles.searchSection}>
          <button
            className={styles.filterButton}
            onClick={() => setShowFilterModal(true)}
          >
            <Image src="/icons/Filter.svg" alt="Filter" width={20} height={20} />
          </button>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className={styles.searchInput}
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className={styles.statusTabs}>
          <button
            className={`${styles.statusTab} ${
              filters.status === "CANCELLED" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("CANCELLED")}
          >
            {t('status.cancelled')}
          </button>
          <button
            className={`${styles.statusTab} ${
              filters.status === "FAILED" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("FAILED")}
          >
            {t('status.failed')}
          </button>
          <button
            className={`${styles.statusTab} ${
              filters.status === "COMPLETED" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("COMPLETED")}
          >
            {t('status.completed')}
          </button>
          <button
            className={`${styles.statusTab} ${
              filters.status === "DELIVERED" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("DELIVERED")}
          >
            {t('status.delivered')}
          </button>
          <button
            className={`${styles.statusTab} ${
              filters.status === "PENDING" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("PENDING")}
          >
            {t('status.pending')}
          </button>
          <button
            className={`${styles.statusTab} ${
              filters.status === "all" ? styles.statusTabActive : ""
            }`}
            onClick={() => handleStatusFilter("all")}
          >
            {t('status.all')}
          </button>
        </div>

        {/* Orders List */}
        <div className={styles.ordersList}>
          {loading && orders.length === 0 ? (
            <div className={styles.loadingState}>{tCommon('loading')}</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>{t('noOrders')}</div>
          ) : (
            <>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={styles.orderCard}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <div className={styles.orderBadge}>
                    <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderTitle}>
                      {order.customer.name} - {order.content}
                    </h3>
                    <p className={styles.orderSubtitle}>
                      {order.customer.city}, {order.customer.gov}
                    </p>
                    <p className={styles.orderPrice}>
                      {t('price')}: {order.cash} {tCommon('currency')} - {t('shipping')}: {order.shippingAmount} {tCommon('currency')}
                    </p>
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? tCommon('loading') : tCommon('loadMore')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button
                className={styles.closeButton}
                onClick={() => setShowFilterModal(false)}
              >
                ✕
              </button>
              <h2 className={styles.modalTitle}>{t('filterOrders')}</h2>
            </div>

            <div className={styles.filterSection}>
              {/* Price Range with Slider */}
              <div className={styles.filterGroup}>
                <div className={styles.rangeHeader}>
                  <span className={styles.rangeLabel}>{t('filter.priceRange')}</span>
                  <span className={styles.rangeValues}>
                    {filters.priceFrom} - {filters.priceTo} {tCommon('currency')}
                  </span>
                </div>
                <div className={styles.dualRangeSlider}>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceFrom}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Number(val) <= Number(filters.priceTo)) {
                        setFilters((prev) => ({ ...prev, priceFrom: val }));
                      }
                    }}
                    className={`${styles.rangeSlider} ${styles.rangeSliderMin}`}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceTo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Number(val) >= Number(filters.priceFrom)) {
                        setFilters((prev) => ({ ...prev, priceTo: val }));
                      }
                    }}
                    className={`${styles.rangeSlider} ${styles.rangeSliderMax}`}
                  />
                  <div className={styles.sliderTrack}>
                    <div
                      className={styles.sliderRange}
                      style={{
                        right: `${(Number(filters.priceFrom) / 10000) * 100}%`,
                        left: `${100 - (Number(filters.priceTo) / 10000) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Price Range with Slider */}
              <div className={styles.filterGroup}>
                <div className={styles.rangeHeader}>
                  <span className={styles.rangeLabel}>{t('filter.shippingRange')}</span>
                  <span className={styles.rangeValues}>
                    {filters.shippingPriceFrom} - {filters.shippingPriceTo} {tCommon('currency')}
                  </span>
                </div>
                <div className={styles.dualRangeSlider}>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.shippingPriceFrom}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Number(val) <= Number(filters.shippingPriceTo)) {
                        setFilters((prev) => ({ ...prev, shippingPriceFrom: val }));
                      }
                    }}
                    className={`${styles.rangeSlider} ${styles.rangeSliderMin}`}
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.shippingPriceTo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Number(val) >= Number(filters.shippingPriceFrom)) {
                        setFilters((prev) => ({ ...prev, shippingPriceTo: val }));
                      }
                    }}
                    className={`${styles.rangeSlider} ${styles.rangeSliderMax}`}
                  />
                  <div className={styles.sliderTrack}>
                    <div
                      className={styles.sliderRange}
                      style={{
                        right: `${(Number(filters.shippingPriceFrom) / 500) * 100}%`,
                        left: `${100 - (Number(filters.shippingPriceTo) / 500) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* From Location with Search */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t('filter.fromLocation')} - {tCommon('optional')}</label>

                {/* Two Column Layout for Governorate and City */}
                <div className={styles.filterRow}>
                  {/* Governorate with Search */}
                  <div className={styles.searchableSelectWrapper}>
                    <input
                      type="text"
                      placeholder={filters.fromGovId ? getGovName(filters.fromGovId) : t('filter.selectGovernorate')}
                      className={styles.filterInput}
                      value={fromGovSearch}
                      onChange={(e) => {
                        setFromGovSearch(e.target.value);
                        setFromGovOpen(true);
                      }}
                      onFocus={() => setFromGovOpen(true)}
                      onBlur={() => setTimeout(() => setFromGovOpen(false), 200)}
                    />
                    {fromGovOpen && (
                      <div className={styles.searchResults}>
                        {getFilteredFromGovs().length > 0 ? (
                          getFilteredFromGovs().map((zone) => (
                            <div
                              key={zone.id}
                              className={styles.searchResultItem}
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, fromGovId: zone.id, fromCityId: "" }));
                                setFromGovSearch("");
                                setFromGovOpen(false);
                              }}
                            >
                              {zone.name}
                            </div>
                          ))
                        ) : (
                          <div className={styles.searchResultItem}>{tCommon('noResults')}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* City with Search - Always shown but disabled if no governorate */}
                  <div className={styles.searchableSelectWrapper}>
                    <input
                      type="text"
                      placeholder={filters.fromCityId ? getCityName(filters.fromGovId, filters.fromCityId) : t('filter.selectCity')}
                      className={styles.filterInput}
                      value={fromCitySearch}
                      onChange={(e) => {
                        setFromCitySearch(e.target.value);
                        setFromCityOpen(true);
                      }}
                      onFocus={() => setFromCityOpen(true)}
                      onBlur={() => setTimeout(() => setFromCityOpen(false), 200)}
                      disabled={!filters.fromGovId}
                    />
                    {fromCityOpen && filters.fromGovId && (
                      <div className={styles.searchResults}>
                        {getFilteredFromCities().length > 0 ? (
                          getFilteredFromCities().map((city) => (
                            <div
                              key={city.id}
                              className={styles.searchResultItem}
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, fromCityId: city.id }));
                                setFromCitySearch("");
                                setFromCityOpen(false);
                              }}
                            >
                              {city.name}
                            </div>
                          ))
                        ) : (
                          <div className={styles.searchResultItem}>{tCommon('noResults')}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* To Location with Search */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t('filter.toLocation')} - {tCommon('optional')}</label>

                {/* Two Column Layout for Governorate and City */}
                <div className={styles.filterRow}>
                  {/* Governorate with Search */}
                  <div className={styles.searchableSelectWrapper}>
                    <input
                      type="text"
                      placeholder={filters.toGovId ? getGovName(filters.toGovId) : t('filter.selectGovernorate')}
                      className={styles.filterInput}
                      value={toGovSearch}
                      onChange={(e) => {
                        setToGovSearch(e.target.value);
                        setToGovOpen(true);
                      }}
                      onFocus={() => setToGovOpen(true)}
                      onBlur={() => setTimeout(() => setToGovOpen(false), 200)}
                    />
                    {toGovOpen && (
                      <div className={styles.searchResults}>
                        {getFilteredToGovs().length > 0 ? (
                          getFilteredToGovs().map((zone) => (
                            <div
                              key={zone.id}
                              className={styles.searchResultItem}
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, toGovId: zone.id, toCityId: "" }));
                                setToGovSearch("");
                                setToGovOpen(false);
                              }}
                            >
                              {zone.name}
                            </div>
                          ))
                        ) : (
                          <div className={styles.searchResultItem}>{tCommon('noResults')}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* City with Search - Always shown but disabled if no governorate */}
                  <div className={styles.searchableSelectWrapper}>
                    <input
                      type="text"
                      placeholder={filters.toCityId ? getCityName(filters.toGovId, filters.toCityId) : t('filter.selectCity')}
                      className={styles.filterInput}
                      value={toCitySearch}
                      onChange={(e) => {
                        setToCitySearch(e.target.value);
                        setToCityOpen(true);
                      }}
                      onFocus={() => setToCityOpen(true)}
                      onBlur={() => setTimeout(() => setToCityOpen(false), 200)}
                      disabled={!filters.toGovId}
                    />
                    {toCityOpen && filters.toGovId && (
                      <div className={styles.searchResults}>
                        {getFilteredToCities().length > 0 ? (
                          getFilteredToCities().map((city) => (
                            <div
                              key={city.id}
                              className={styles.searchResultItem}
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, toCityId: city.id }));
                                setToCitySearch("");
                                setToCityOpen(false);
                              }}
                            >
                              {city.name}
                            </div>
                          ))
                        ) : (
                          <div className={styles.searchResultItem}>{tCommon('noResults')}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.resetButton} onClick={resetFilters}>
                {tCommon('reset')}
              </button>
              <button className={styles.applyButton} onClick={applyFilters}>
                {tCommon('apply')}
              </button>
            </div>
          </div>
        </div>
      )}
      <LoadingOverlay isLoading={loading && orders.length === 0} />
    </main>
  );
}
