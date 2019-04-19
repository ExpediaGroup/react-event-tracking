The `TrackingProvider` component allows an application to incrementally build the fields and options for events that will trigger from nested components. Using the `TrackingProvider` enables components at the lowest level to trigger events with the necessary set of fields and options. The consumer of the component is responsible for providing the implementation of the `trigger` API.

## Base Usage

Use the `TrackingProvider` component to wrap components that trigger events. Specify the desired fields and options to include when the event is triggered and an implementation of the `trigger` API.

> **Note: It is strongly recommended that property values for the TrackingProvider be defined in state or constant variables instead of building the values dynamically on every render.**  If the values are constructed during the render, it will cause a FORCE RE-RENDER of ALL consumers of the context that are descendants of the provider even if the consumer's shouldComponentUpdate bails out. Following a pattern of defining property values as constants or via state will prevent unnecessary renders of children context consumers.

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const defaultFields = {location: 'top-right'};
const defaultOptions = {asynchronous: true};
const customTrigger = (event, fields, options) => {
    // Implement custom event tracking.
}

function App(props) {
    return (
        <TrackingProvider
            fields={defaultFields}
            options={defaultOptions}
            trigger={customTrigger}
        >
            // Events triggered by the Calendar component
            // will use the context specified above.
            <Calendar/>
        </TrackingProvider>
    );
}
```

## Trigger Implementation

The consumer is responsible for providing an implementation of the trigger method via the `trigger` property. The provided implementation is expected to have the following signature:

```javascript
trigger(event, fields, options)
```

Where:

- **event** - The name of the event to trigger (String).
- **fields** - The required and optional fields for the event (Object of string values).
- **options** - Options for the trigger API to use when triggering the event. (Object)

## TrackingProvider Nesting

Multiple `TrackingProvider` components can be nested in order to iteratively enhance the configuration where the information is known. For example, consider a scenario where a `Calendar` component uses a `EventButton` component which triggers a `button.click` event. An application can build the set of fields needed for the `button.click` by nesting `TrackingProvider` wrappers in the areas of code that know the related information.

### Example application wrapping a nested component

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const appFields = {category: 'My App'};
const customTrigger = (event, fields, options) => {
    // Implement custom event tracking.
};

function App(props) {
    return (
        <TrackingProvider
            fields={defaultFields}
            trigger={customTrigger}
        >
            // Events triggered by the Calendar component
            // will use the context specified above.
            <Calendar/>
        </TrackingProvider>
    );
}
```

### Nested component providing additional fields

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const buttonFields = {location: 'top-right'};

function CalendarButton(props) {
    return (
        <TrackingProvider fields={buttonFields}>
            <EventButton>{'Click Me'}</EventButton>
        </TrackingProvider>
    );
}
```

When `EventButton` triggers the `button.click` event, the trigger handler will be sent the combined set of fields (`{category: 'My App', location: 'top-right'}`) from the nested `TrackingProvider` instances.

## Event Specific Configuration

The `fields` and `options` properties serve as defaults for all events that are triggered by the nested components. If a wrapped component triggers multiple types of events, use the `eventFields` and `eventOptions` properties to configure the `TrackingProvider` with event specific configuration. Note that the event specific configuration will be merged with the default configuration if it is also specified.

### Specifying event specific details

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const defaultFields = {
    eventcategory: 'My App'
}
const eventFields = {
    'generic.click': {
        eventaction: 'toggle'
    },
    'generic.event': {
        eventaction: 'hit test'
    }
}

function App(props) {
    return (
        <TrackingProvider fields={defaultFields} eventFields={eventFields}>
            <EventButton>{'Click Me'}</EventButton>
        </TrackingProvider>
    );
}
```