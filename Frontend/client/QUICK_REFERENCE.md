# Quick Reference Guide - Refactored Frontend

## Import Patterns

### Shared Components
```jsx
// Individual imports
import FormInput from "../../components/shared/FormInput";
import FormSelect from "../../components/shared/FormSelect";
import FormTextarea from "../../components/shared/FormTextarea";
import EventCard from "../../components/shared/EventCard";

// Barrel import (recommended)
import { FormInput, FormSelect, FormTextarea, EventCard } from "../../components/shared";
```

### Services
```jsx
// Individual imports
import eventService from "../../services/event.service";
import participantService from "../../services/participant.service";

// Barrel import (recommended)
import { eventService, participantService } from "../../services";
```

### Hooks
```jsx
// Individual imports
import { useForm } from "../../hooks/useForm";
import { useEventParticipant } from "../../hooks/useEventParticipant";

// Barrel import (recommended)
import { useForm, useEventParticipant } from "../../hooks";
```

## Common Patterns

### 1. Creating a Form

```jsx
import { useState } from "react";
import { FormInput, FormSelect, FormTextarea } from "../../components/shared";
import { useForm } from "../../hooks";
import { validateEventForm } from "../../utils/validation";

function MyForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { eventName: "", description: "" },
    async (values) => {
      // Submit logic
      await eventService.createEvent(values);
    },
    validateEventForm
  );

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Event name"
        name="eventName"
        value={values.eventName}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.eventName}
        touched={touched.eventName}
        required
      />
      
      <FormSelect
        label="Category"
        name="category"
        value={values.category}
        onChange={handleChange}
        options={["sports", "cultural", "workshop"]}
        defaultLabel="-- Select category --"
        required
      />
      
      <FormTextarea
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        rows={4}
        required
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 2. Displaying Event Cards

```jsx
import EventCard from "../../components/shared/EventCard";

// Basic event card
<EventCard event={event} variant="basic" />

// Participant event card
<EventCard 
  event={event} 
  variant="participant"
  additionalData={{
    identityNumber: participant.identityNumber,
    participantCode: event.participantCode,
    participantId: participant._id
  }}
/>

// Team event card
<EventCard 
  event={event} 
  variant="team"
  additionalData={{
    identityNumber: participant.identityNumber,
    participantCode: event.participantCode
  }}
/>

// Hosted event card (with animation)
<EventCard event={event} variant="hosted" index={0} />
```

### 3. Fetching Event Data

```jsx
import { eventService } from "../../services";

// Get all events
const result = await eventService.getAllEvents();

// Get single event
const result = await eventService.getEventById(eventId);

// Create event
const formData = new FormData();
formData.append("eventName", "My Event");
const result = await eventService.createEvent(formData);

// Update event
const result = await eventService.updateEvent(eventId, updatedData);

// Delete event
const result = await eventService.deleteEvent(eventId);
```

### 4. Using Custom Hooks

```jsx
import { useEventParticipant } from "../../hooks";

function MyComponent({ eventId }) {
  const { participant, loading, error, refetch } = useEventParticipant(eventId);

  if (loading) return <LoadingPage />;
  if (error) return <div>Error: {error}</div>;

  return <div>{participant.identityNumber}</div>;
}
```

### 5. Form Validation

```jsx
import { validateEventForm, required, email, compose } from "../../utils/validation";

// Use built-in validators
const errors = validateEventForm(formValues);

// Create custom validation
const customValidate = (values) => {
  const errors = {};
  
  const nameError = compose(
    (v) => required(v, "Name"),
    (v) => minLength(v, 3, "Name")
  )(values.name);
  
  if (nameError) errors.name = nameError;
  
  return errors;
};
```

## Component Props Reference

### FormInput
```jsx
<FormInput
  label="Field Label"           // Required
  name="fieldName"              // Required
  value={value}                 // Required
  onChange={handleChange}       // Required
  type="text"                   // Optional (default: "text")
  placeholder="Enter value"     // Optional
  required={true}               // Optional (shows * indicator)
  error="Error message"         // Optional
  touched={true}                // Optional (shows error only if touched)
  icon={<Icon />}              // Optional (displays before label)
  disabled={false}              // Optional
/>
```

### FormSelect
```jsx
<FormSelect
  label="Field Label"           // Required
  name="fieldName"              // Required
  value={value}                 // Required
  onChange={handleChange}       // Required
  options={["opt1", "opt2"]}   // Required
  defaultLabel="-- Select --"   // Optional (default: "-- Select --")
  required={true}               // Optional
  error="Error message"         // Optional
  touched={true}                // Optional
  disabled={false}              // Optional
/>
```

### FormTextarea
```jsx
<FormTextarea
  label="Field Label"           // Required
  name="fieldName"              // Required
  value={value}                 // Required
  onChange={handleChange}       // Required
  rows={4}                      // Optional (default: 4)
  placeholder="Enter text"      // Optional
  required={true}               // Optional
  error="Error message"         // Optional
  touched={true}                // Optional
  disabled={false}              // Optional
/>
```

### EventCard
```jsx
<EventCard
  event={eventObject}           // Required
  variant="basic"               // Optional (default: "basic")
                                // Options: "basic", "participant", "team", "hosted"
  additionalData={{}}           // Optional (for participant/team variants)
  index={0}                     // Optional (for animation delay in hosted variant)
/>
```

## Service Methods Reference

### eventService
- `getAllEvents()` - Get all events
- `getEventById(eventId)` - Get single event
- `getEventByMemberCode(memberCode)` - Get event by member code
- `getEventByParticipantCode(participantCode)` - Get event by participant code
- `createEvent(formData)` - Create new event (FormData)
- `updateEvent(eventId, data)` - Update event
- `deleteEvent(eventId)` - Delete event
- `getMyHostedEvents()` - Get user's hosted events

### participantService
- `getParticipantByEventId(eventId)` - Get participant data
- `getEventByParticipantCode(participantCode)` - Get event details
- `deleteParticipant(participantId)` - Remove participant
- `getMyParticipatedEvents()` - Get user's participated events

## Hook Returns Reference

### useForm
```jsx
const {
  values,           // Current form values object
  errors,           // Validation errors object
  touched,          // Touched fields object
  isSubmitting,     // Boolean submission state
  handleChange,     // Change handler function
  handleBlur,       // Blur handler function
  handleSubmit,     // Submit handler function
  resetForm,        // Reset form function
  setFieldValue,    // Set single field value
  setFieldError,    // Set single field error
  setValues         // Set all values
} = useForm(initialValues, onSubmit, validate);
```

### useEventParticipant
```jsx
const {
  participant,      // Participant data object
  loading,          // Boolean loading state
  error,            // Error message string
  refetch           // Refetch function
} = useEventParticipant(eventId);
```

## Best Practices

1. **Always use service layer** instead of raw fetch calls
2. **Use barrel imports** for cleaner code
3. **Validate forms** using validation utilities
4. **Handle loading states** with LoadingPage component
5. **Display errors** using form component error props
6. **Use EventCard variants** instead of creating custom cards
7. **Leverage custom hooks** for common data fetching patterns
8. **Keep components small** and focused on single responsibility

## Migration Checklist

When updating an existing component:

- [ ] Replace raw fetch with service methods
- [ ] Replace custom inputs with FormInput/FormSelect/FormTextarea
- [ ] Replace custom event cards with EventCard component
- [ ] Use useEventParticipant for participant data
- [ ] Use useForm for form state management
- [ ] Add validation using validation utilities
- [ ] Update imports to use barrel exports
- [ ] Test all functionality
