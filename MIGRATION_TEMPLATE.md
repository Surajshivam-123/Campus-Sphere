# Controller to Service Migration Template

This template helps you migrate existing controllers to use the service layer pattern.

---

## Step-by-Step Migration Guide

### Step 1: Create Service File

Create a new service file in `Backend/src/services/`

```javascript
// Backend/src/services/[entity].service.js
import { [Entity] } from "../models/[entity].model.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * [Entity] Service - Business logic for [entity] operations
 */
class [Entity]Service {
  /**
   * Create a new [entity]
   */
  async create[Entity]([entity]Data) {
    // Validation logic
    const existing = await [Entity].findOne({ /* criteria */ });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "[Entity] already exists");
    }

    // Business logic
    const [entity] = await [Entity].create([entity]Data);
    return [entity];
  }

  /**
   * Get [entity] by ID
   */
  async get[Entity]ById([entity]Id) {
    const [entity] = await [Entity].findById([entity]Id);
    if (![entity]) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "[Entity] not found");
    }
    return [entity];
  }

  /**
   * Update [entity]
   */
  async update[Entity]([entity]Id, updateData) {
    const [entity] = await [Entity].findByIdAndUpdate(
      [entity]Id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (![entity]) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "[Entity] not found");
    }
    
    return [entity];
  }

  /**
   * Delete [entity]
   */
  async delete[Entity]([entity]Id) {
    const [entity] = await [Entity].findByIdAndDelete([entity]Id);
    if (![entity]) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "[Entity] not found");
    }
    return [entity];
  }

  /**
   * Get all [entities] with pagination
   */
  async getAll[Entities](page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    const [entities] = await [Entity].find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await [Entity].countDocuments(filters);
    
    return {
      [entities],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new [Entity]Service();
```

### Step 2: Update Controller

Update the controller to use the service:

```javascript
// Backend/src/controllers/[entity].controller.js
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import [entity]Service from "../services/[entity].service.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Create [entity]
 */
const create[Entity] = asyncHandler(async (req, res) => {
  const [entity] = await [entity]Service.create[Entity](req.body);
  
  res
    .status(HTTP_STATUS.CREATED)
    .json(
      new ApiResponse(HTTP_STATUS.CREATED, [entity], "[Entity] created successfully")
    );
});

/**
 * Get [entity] by ID
 */
const get[Entity] = asyncHandler(async (req, res) => {
  const [entity] = await [entity]Service.get[Entity]ById(req.params.id);
  
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, [entity], "[Entity] retrieved successfully")
    );
});

/**
 * Update [entity]
 */
const update[Entity] = asyncHandler(async (req, res) => {
  const [entity] = await [entity]Service.update[Entity](
    req.params.id,
    req.body
  );
  
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, [entity], "[Entity] updated successfully")
    );
});

/**
 * Delete [entity]
 */
const delete[Entity] = asyncHandler(async (req, res) => {
  await [entity]Service.delete[Entity](req.params.id);
  
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, {}, "[Entity] deleted successfully")
    );
});

/**
 * Get all [entities]
 */
const getAll[Entities] = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  const result = await [entity]Service.getAll[Entities](
    parseInt(page),
    parseInt(limit),
    filters
  );
  
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, result, "[Entities] retrieved successfully")
    );
});

export {
  create[Entity],
  get[Entity],
  update[Entity],
  delete[Entity],
  getAll[Entities],
};
```

---

## Real Example: Event Controller Migration

### Before (Old Pattern)

```javascript
// Backend/src/controllers/event.controller.js
import { Event } from "../models/event.model.js";
import asyncHandler from "../utils/AsyncHandler.js";

const createEvent = asyncHandler(async (req, res) => {
  try {
    // Validation
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Check if exists
    const existing = await Event.findOne({ title: req.body.title });
    if (existing) {
      return res.status(400).json({ error: "Event already exists" });
    }

    // Create event
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Generate code
    const code = generateUniqueCode();
    event.code = code;
    await event.save();

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### After (New Pattern)

```javascript
// Backend/src/services/event.service.js
import { Event } from "../models/event.model.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

class EventService {
  generateUniqueCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createEvent(eventData, userId) {
    // Validation
    if (!eventData.title) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Title is required");
    }

    // Check if exists
    const existing = await Event.findOne({ title: eventData.title });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Event already exists");
    }

    // Create event
    const event = await Event.create({
      ...eventData,
      createdBy: userId,
      code: this.generateUniqueCode(),
    });

    return event;
  }
}

export default new EventService();
```

```javascript
// Backend/src/controllers/event.controller.js
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import eventService from "../services/event.service.js";
import { HTTP_STATUS } from "../constants/index.js";

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  
  res
    .status(HTTP_STATUS.CREATED)
    .json(
      new ApiResponse(HTTP_STATUS.CREATED, event, "Event created successfully")
    );
});

export { createEvent };
```

---

## Migration Checklist

For each controller you migrate:

- [ ] Create service file in `Backend/src/services/`
- [ ] Move business logic to service
- [ ] Move validation to service
- [ ] Move database queries to service
- [ ] Update controller to use service
- [ ] Use HTTP_STATUS constants
- [ ] Use ApiResponse for responses
- [ ] Use ApiError for errors
- [ ] Remove try-catch blocks (asyncHandler handles it)
- [ ] Test all endpoints
- [ ] Update any frontend code that calls the API

---

## Common Patterns

### Pattern 1: Authorization Check

```javascript
// In Service
async updateEvent(eventId, updateData, userId) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");
  }
  
  // Check if user is authorized
  if (event.createdBy.toString() !== userId.toString()) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Not authorized");
  }
  
  Object.assign(event, updateData);
  await event.save();
  
  return event;
}
```

### Pattern 2: File Upload

```javascript
// In Service
async updateEventImage(eventId, imagePath) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");
  }
  
  // Upload to cloudinary
  const uploadResult = await uploadOnCloudinary(imagePath);
  
  event.image = uploadResult.url;
  await event.save();
  
  return event;
}

// In Controller
const updateEventImage = asyncHandler(async (req, res) => {
  const event = await eventService.updateEventImage(
    req.params.id,
    req.file?.path
  );
  
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, event, "Image updated"));
});
```

### Pattern 3: Complex Queries

```javascript
// In Service
async searchEvents(searchParams) {
  const { query, type, startDate, endDate, page = 1, limit = 10 } = searchParams;
  
  const filters = {};
  
  if (query) {
    filters.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  
  if (type) {
    filters.type = type;
  }
  
  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const events = await Event.find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("createdBy", "fullname username");
  
  const total = await Event.countDocuments(filters);
  
  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

---

## Tips

1. **Keep controllers thin**: Only handle HTTP concerns
2. **Move all logic to services**: Validation, business logic, database queries
3. **Use constants**: No magic numbers or strings
4. **Consistent error handling**: Use ApiError
5. **Consistent responses**: Use ApiResponse
6. **Test after migration**: Ensure everything still works
7. **One service per entity**: Don't mix concerns

---

## Next Steps

After migrating controllers:

1. Create frontend service for the entity
2. Update frontend components to use the service
3. Add input validation with Zod/Joi
4. Add unit tests for services
5. Add integration tests for APIs
6. Document the API endpoints

---

**Remember**: The goal is clean, maintainable, testable code!
