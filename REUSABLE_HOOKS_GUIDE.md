# Reusable Data Fetching Hooks Guide

## Overview
This guide shows you how to eliminate repeated data fetching code using custom React hooks.

---

## 🎯 Problem: Repeated Code

### Before (Repeated in every component)
```javascript
export default function MyEvents() {
  const [events, setEvents] = useState(null);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const getEvent = async () => {
      const response = await fetch(`${API_URL}/api/cpsh/participants/my-events`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      
      if (result?.statusCode === 200) {
        setMessage("");
        setEvents(result?.data);
      } else {
        setMessage(result?.message);
      }
    };
    getEvent();
  }, []);
  
  // ... rest of component
}
```

**Problems:**
- ❌ Repeated in every component
- ❌ Manual loading state management
- ❌ Manual error handling
- ❌ No automatic token refresh
- ❌ Hard to maintain

---

## ✅ Solution: Custom Hooks

### After (Clean and reusable)
```javascript
import { useMyParticipatedEvents } from "../../hooks/useEvents";

export default function MyEvents() {
  const { events, loading, error } = useMyParticipatedEvents();
  
  if (error) return <ErrorMessage message={error} />;
  if (loading) return <LoadingPage />;
  
  return (
    <div>
      {events.map(event => <EventCard key={event._id} event={event} />)}
    </div>
  );
}
```

**Benefits:**
- ✅ One line to fetch data
- ✅ Automatic loading state
- ✅ Automatic error handling
- ✅ Automatic token refresh
- ✅ Easy to maintain

---

## 📚 Available Hooks

### 1. Generic Hooks

#### `useFetch` - Basic data fetching
```javascript
import { useFetch } from "../hooks/useFetch";

function MyComponent() {
  const { data, loading, error, refetch } = useFetch("/api/v1/events");
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <EventList events={data} />}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### `useLazyFetch` - Manual trigger
```javascript
import { useLazyFetch } from "../hooks/useFetch";

function SearchComponent() {
  const { data, loading, error, fetchData } = useLazyFetch();
  
  const handleSearch = async (query) => {
    await fetchData(`/api/v1/events/search?q=${query}`);
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {loading && <p>Searching...</p>}
      {data && <SearchResults results={data} />}
    </div>
  );
}
```

#### `useMutation` - Create, Update, Delete
```javascript
import { useMutation } from "../hooks/useFetch";

function CreateEventForm() {
  const { data, loading, error, mutate } = useMutation();
  
  const handleSubmit = async (eventData) => {
    try {
      await mutate("/api/v1/events", "POST", eventData);
      alert("Event created!");
    } catch (err) {
      console.error(err);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### 2. Specialized Hooks

#### `useList` - Fetch list with filters
```javascript
import { useList } from "../hooks/useApi";

function EventList() {
  const { items, loading, error, refetch } = useList("/api/v1/events", {
    type: "cricket",
    status: "active"
  });
  
  return (
    <div>
      {items.map(item => <EventCard key={item._id} event={item} />)}
    </div>
  );
}
```

#### `useItem` - Fetch single item
```javascript
import { useItem } from "../hooks/useApi";

function EventDetails({ eventId }) {
  const { item, loading, error, refetch } = useItem("/api/v1/events", eventId);
  
  return (
    <div>
      {item && <EventDetailsCard event={item} />}
    </div>
  );
}
```

#### `useCreate` - Create item
```javascript
import { useCreate } from "../hooks/useApi";

function CreateEvent() {
  const { create, loading, error } = useCreate();
  
  const handleSubmit = async (data) => {
    await create("/api/v1/events", data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### `useUpdate` - Update item
```javascript
import { useUpdate } from "../hooks/useApi";

function EditEvent({ eventId }) {
  const { update, loading, error } = useUpdate();
  
  const handleSubmit = async (data) => {
    await update("/api/v1/events", eventId, data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### `useDelete` - Delete item
```javascript
import { useDelete } from "../hooks/useApi";

function DeleteButton({ eventId }) {
  const { deleteItem, loading } = useDelete();
  
  const handleDelete = async () => {
    if (confirm("Are you sure?")) {
      await deleteItem("/api/v1/events", eventId);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
```

#### `usePagination` - Paginated data
```javascript
import { usePagination } from "../hooks/useApi";

function PaginatedEvents() {
  const {
    items,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  } = usePagination("/api/v1/events", 1, 10);
  
  return (
    <div>
      {items.map(item => <EventCard key={item._id} event={item} />)}
      <div>
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}
```

#### `useSearch` - Search functionality
```javascript
import { useSearch } from "../hooks/useApi";

function SearchEvents() {
  const { results, loading, search, query, setQuery } = useSearch("/api/v1/events/search");
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && search()}
      />
      <button onClick={() => search()}>Search</button>
      {loading && <p>Searching...</p>}
      {results.map(item => <EventCard key={item._id} event={item} />)}
    </div>
  );
}
```

---

### 3. Domain-Specific Hooks

#### Event Hooks
```javascript
import {
  useEvents,
  useEvent,
  useMyHostedEvents,
  useMyParticipatedEvents,
  useEventsByType
} from "../hooks/useEvents";

// Get all events
function AllEvents() {
  const { events, loading, error } = useEvents();
  return <EventList events={events} />;
}

// Get single event
function EventDetails({ eventId }) {
  const { event, loading, error } = useEvent(eventId);
  return <EventDetailsCard event={event} />;
}

// Get my hosted events
function MyHostedEvents() {
  const { events, loading, error } = useMyHostedEvents();
  return <EventList events={events} />;
}

// Get my participated events
function MyParticipatedEvents() {
  const { events, loading, error } = useMyParticipatedEvents();
  return <EventList events={events} />;
}

// Get events by type
function CricketEvents() {
  const { events, loading, error } = useEventsByType("cricket");
  return <EventList events={events} />;
}
```

#### Team Hooks
```javascript
import { useMyTeams, useTeam, useEventTeams } from "../hooks/useTeams";

// Get my teams
function MyTeams() {
  const { teams, loading, error } = useMyTeams();
  return <TeamList teams={teams} />;
}

// Get single team
function TeamDetails({ teamId }) {
  const { team, loading, error } = useTeam(teamId);
  return <TeamDetailsCard team={team} />;
}

// Get teams for an event
function EventTeams({ eventId }) {
  const { teams, loading, error } = useEventTeams(eventId);
  return <TeamList teams={teams} />;
}
```

---

## 🔄 Real-World Examples

### Example 1: Event List Page
```javascript
import { useEvents } from "../../hooks/useEvents";
import EventCard from "../../components/EventCard";
import LoadingPage from "../LoadingPage";
import ErrorMessage from "../../components/ErrorMessage";

export default function EventsPage() {
  const { events, loading, error, refetch } = useEvents();

  if (error) return <ErrorMessage message={error} />;
  if (loading) return <LoadingPage />;

  return (
    <div className="container">
      <h1>All Events</h1>
      <button onClick={refetch}>Refresh</button>
      <div className="grid">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

### Example 2: Event Details Page
```javascript
import { useEvent } from "../../hooks/useEvents";
import { useParams } from "react-router-dom";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { event, loading, error } = useEvent(eventId);

  if (error) return <ErrorMessage message={error} />;
  if (loading) return <LoadingPage />;
  if (!event) return <NotFound />;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {/* ... more details */}
    </div>
  );
}
```

### Example 3: Create Event Form
```javascript
import { useCreate } from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage() {
  const { create, loading, error } = useCreate();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = Object.fromEntries(formData);

    try {
      await create("/api/v1/events", eventData);
      navigate("/events");
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="description" required />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Event"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Example 4: Search with Filters
```javascript
import { useList } from "../../hooks/useApi";
import { useState } from "react";

export default function SearchEvents() {
  const [filters, setFilters] = useState({ type: "", status: "" });
  const { items, loading, error } = useList("/api/v1/events", filters);

  return (
    <div>
      <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
        <option value="">All Types</option>
        <option value="cricket">Cricket</option>
        <option value="cultural">Cultural</option>
      </select>

      {loading && <p>Loading...</p>}
      {items.map(event => <EventCard key={event._id} event={event} />)}
    </div>
  );
}
```

---

## 🎨 Creating Custom Hooks

### Pattern for Domain-Specific Hooks
```javascript
// hooks/useParticipants.js
import { useFetch } from "./useFetch";

export const useEventParticipants = (eventId) => {
  const { data, loading, error, refetch } = useFetch(
    eventId ? `/api/v1/participants/event/${eventId}` : null
  );

  return {
    participants: data || [],
    loading,
    error,
    refetch,
  };
};

export const useMyParticipations = () => {
  const { data, loading, error, refetch } = useFetch(
    "/api/v1/participants/my-participations"
  );

  return {
    participations: data || [],
    loading,
    error,
    refetch,
  };
};
```

---

## 📊 Comparison

### Lines of Code Comparison

#### Before (Manual Fetch)
```javascript
// 40+ lines per component
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### After (Custom Hook)
```javascript
// 1 line!
const { data, loading, error } = useFetch(url);
```

**Reduction: 97.5% less code!**

---

## ✅ Best Practices

1. **Use specific hooks when available**
   ```javascript
   // ✅ Good
   const { events } = useMyParticipatedEvents();
   
   // ❌ Avoid
   const { data } = useFetch("/api/v1/participants/my-events");
   ```

2. **Handle loading and error states**
   ```javascript
   const { data, loading, error } = useFetch(url);
   
   if (error) return <ErrorMessage message={error} />;
   if (loading) return <LoadingPage />;
   return <DataDisplay data={data} />;
   ```

3. **Use refetch for manual updates**
   ```javascript
   const { data, refetch } = useFetch(url);
   
   const handleUpdate = async () => {
    await updateSomething();
     refetch(); // Refresh data
   };
   ```

4. **Combine hooks when needed**
   ```javascript
   const { event } = useEvent(eventId);
   const { participants } = useEventParticipants(eventId);
   const { teams } = useEventTeams(eventId);
   ```

---

## 🚀 Migration Guide

### Step 1: Replace fetch calls
```javascript
// Before
const [events, setEvents] = useState([]);
useEffect(() => {
  fetch(url).then(res => res.json()).then(setEvents);
}, []);

// After
const { events } = useMyParticipatedEvents();
```

### Step 2: Remove manual state management
```javascript
// Before
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// After
// Handled automatically by the hook!
```

### Step 3: Simplify error handling
```javascript
// Before
if (message !== "") return <div>{message}</div>;

// After
if (error) return <ErrorMessage message={error} />;
```

---

## 📝 Summary

**Benefits of Custom Hooks:**
- ✅ 97% less boilerplate code
- ✅ Automatic loading/error states
- ✅ Consistent error handling
- ✅ Easy to test
- ✅ Reusable across components
- ✅ Type-safe (with TypeScript)
- ✅ Automatic token refresh
- ✅ Better maintainability

**Start using them today!**
