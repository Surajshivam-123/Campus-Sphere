import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Compass, RefreshCw, XCircle } from "lucide-react";
import eventService from "../../services/event.service";
import EventCard from "../../components/shared/EventCard";
import LoadingPage from "../LoadingPage";

export default function PublicEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state if URL changes externally (e.g. back navigation)
  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  // Debounce searchVal -> updates search URL query parameter after 300ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchVal !== currentSearch) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (searchVal.trim()) {
            newParams.set("search", searchVal.trim());
          } else {
            newParams.delete("search");
          }
          return newParams;
        });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchVal, searchParams, setSearchParams]);

  // Category change -> updates category URL query parameter
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (newCat && newCat !== "all") {
        newParams.set("category", newCat);
      } else {
        newParams.delete("category");
      }
      return newParams;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchVal("");
    setCategory("all");
    setSearchParams(new URLSearchParams());
  };

  // Fetch events whenever URL search parameters change
  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const searchParam = searchParams.get("search") || "";
        const categoryParam = searchParams.get("category") || "all";
        const res = await eventService.getPublicEvents(searchParam, categoryParam);
        if (active) {
          if (res?.success) {
            setEvents(res.data || []);
          } else {
            setError("Failed to fetch events.");
          }
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Something went wrong while fetching events.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 bg-page">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left space-y-2 border-b border-soft pb-6"
        >
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 rounded-xl bg-surface border border-base text-[var(--color-gold)] shadow-sm">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-navy gradient-text">
              Browse Events
            </h1>
          </div>
          <p className="text-sm md:text-base max-w-2xl leading-relaxed text-secondary font-medium">
            Explore exciting campus activities, tournaments, hackathons, and cultural festivals happening around you.
          </p>
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-surface p-4 rounded-xl border border-base shadow-sm"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search by event name, description or keywords..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-base w-full pl-10"
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--color-gold)] transition-colors"
                aria-label="Clear search"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[200px] flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
            <select
              value={category}
              onChange={handleCategoryChange}
              className="input-base w-full pl-9 cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="coding">Coding</option>
              <option value="cultural">Cultural</option>
              <option value="workshop">Workshop</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Reset Filters Button (Visible only when filters are active) */}
          {(searchParams.get("search") || searchParams.get("category")) && (
            <button
              onClick={handleClearFilters}
              className="btn-secondary flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 flex flex-col items-center justify-center gap-4 text-center"
            >
              <RefreshCw className="h-10 w-10 animate-spin text-[var(--color-gold)]" />
              <p className="text-sm font-medium text-secondary">Fetching latest events...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center max-w-md mx-auto"
            >
              <div className="alert-error flex flex-col items-center gap-2">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center max-w-md mx-auto bg-surface border border-base rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4"
            >
              <div className="p-4 rounded-full bg-surface-2 border border-base text-[var(--color-gold)]">
                <Calendar className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-navy">No Events Found</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  We couldn't find any public events matching your search criteria. Try modifying your search keywords or choosing a different category.
                </p>
              </div>
              <button onClick={handleClearFilters} className="btn-gold px-6">
                Browse All Events
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, index) => (
                <EventCard
                  key={event._id || index}
                  event={event}
                  variant="basic"
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
