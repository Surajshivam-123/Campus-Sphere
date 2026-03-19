# Quick Migration Examples

## Before & After Comparisons

### Example 1: MyEvents Component

#### ❌ Before (50+ lines)
```javascript
import { useEffect, useState } from "react";
import API_URL from "../../config/api";

export default function MyEvents() {
  const [events, setEvents] = useState(null);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const getEvent = async () => {
      const response = await fetch(
        `${API_URL}/api/cpsh/participants/my-events`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
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
  
  if (message !== "") return <div><p>{message}</p></div>;
  if (!events) return <div><LoadingPage /></div>;
  
  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
        Events You Participated
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCardParticipant key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

#### ✅ After (30 lines - 40% reduction!)
```javascript
import { useMyParticipatedEvents } from "../../hooks/useEvents";
import EventCardParticipant from "./EventCardParticipant";
import LoadingPage from "../LoadingPage";

export default function MyEvents() {
  const { events, loading, error } = useMyParticipatedEvents();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
        Events You Participated
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCardParticipant key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

---

### Example 2: Event Details

#### ❌ Before
```javascript
export default function EventDetails({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/cpsh/events/${eventId}`, {
          credentials: "include",
        });
        const result = await response.json();
        
        if (result.statusCode === 200) {
          setEvent(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) fetchEvent();
  }, [eventId]);
  
  if (loading) return <LoadingPage />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <NotFound />;
  
  return <EventDetailsCard event={event} />;
}
```

#### ✅ After
```javascript
import { useEvent } from "../../hooks/useEvents";

export default function EventDetails({ eventId }) {
  const { event, loading, error } = useEvent(eventId);
  
  if (loading) return <LoadingPage />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <NotFound />;
  
  return <EventDetailsCard event={event} />;
}
```

---

### Example 3: My Teams

#### ❌ Before
```javascript
export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`${API_URL}/api/cpsh/teams/my-teams`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setTeams(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <LoadingPage />;
  
  return (
    <div>
      {teams.map(team => <TeamCard key={team._id} team={team} />)}
    </div>
  );
}
```

#### ✅ After
```javascript
import { useMyTeams } from "../../hooks/useTeams";

export default function MyTeams() {
  const { teams, loading } = useMyTeams();
  
  if (loading) return <LoadingPage />;
  
  return (
    <div>
      {teams.map(team => <TeamCard key={team._id} team={team} />)}
    </div>
  );
}
```

---

### Example 4: Create Event Form

#### ❌ Before
```javascript
export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.target);
      const response = await fetch(`${API_URL}/api/cpsh/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      
      const result = await response.json();
      
      if (result.statusCode === 201) {
        navigate("/events");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

#### ✅ After
```javascript
import { useCreate } from "../../hooks/useApi";

export default function CreateEvent() {
  const { create, loading, error } = useCreate();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await create("/api/v1/events", Object.fromEntries(formData));
      navigate("/events");
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

---

## Quick Reference

### Common Patterns

```javascript
// Fetch list
const { events } = useMyParticipatedEvents();

// Fetch single item
const { event } = useEvent(eventId);

// Create
const { create, loading } = useCreate();
await create("/api/v1/events", data);

// Update
const { update, loading } = useUpdate();
await update("/api/v1/events", eventId, data);

// Delete
const { deleteItem, loading } = useDelete();
await deleteItem("/api/v1/events", eventId);

// Pagination
const { items, page, nextPage, prevPage } = usePagination("/api/v1/events");

// Search
const { results, search, query, setQuery } = useSearch("/api/v1/events/search");
```

---

## Migration Checklist

For each component:
- [ ] Identify data fetching code
- [ ] Choose appropriate hook
- [ ] Replace useState and useEffect
- [ ] Update loading/error handling
- [ ] Test the component
- [ ] Remove unused imports

---

## Tips

1. **Start with simple components** - Migrate list pages first
2. **Test after each migration** - Ensure functionality works
3. **Use TypeScript** - Add types for better DX
4. **Create custom hooks** - For domain-specific logic
5. **Keep it simple** - Don't over-engineer

---

**Result: Cleaner, more maintainable code with 40-60% less boilerplate!**
