The `TrackingProvider` component allows an application to incrementally build the analytics and options for events that will trigger from nested components. Using the `TrackingProvider` enables components at the lowest level to trigger events with the necessary set of analytics and options. The consumer of the component is responsible for providing the implementation of the `trigger` API.

## Base Usage

Use the `TrackingProvider` component to wrap components that trigger events. Specify the desired analytics and options to include when the event is triggered and an implementation of the `trigger` API.

> **Note: It is strongly recommended that property values for the TrackingProvider be defined in state or constant variables instead of building the values dynamically on every render.**  If the values are constructed during the render, it will cause a FORCE RE-RENDER of ALL consumers of the context that are descendants of the provider even if the consumer's shouldComponentUpdate bails out. Following a pattern of defining property values as constants or via state will prevent unnecessary renders of children context consumers.

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const defaultAnalytics = {location: 'top-right'};
const defaultOptions = {asynchronous: true};
const customTrigger = (event, analytics, options) => {
    // Implement custom event tracking.
}

function App(props) {
    return (
        <TrackingProvider
            analytics={defaultAnalytics}
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
trigger(event, analytics, options)
```

Where:

- **event** - The name of the event to trigger (String).
- **analytics** - The required and optional analytics for the event (Object of string values).
- **options** - Options for the trigger API to use when triggering the event. (Object)

## TrackingProvider Nesting

Multiple `TrackingProvider` components can be nested in order to iteratively enhance the configuration where the information is known. For example, consider a scenario where a `Calendar` component uses a `EventButton` component which triggers a `button.click` event. An application can build the set of analytics needed for the `button.click` by nesting `TrackingProvider` wrappers in the areas of code that know the related information.

### Example application wrapping a nested component

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const appAnalytics = {category: 'My App'};
const customTrigger = (event, analytics, options) => {
    // Implement custom event tracking.
};

function App(props) {
    return (
        <TrackingProvider
            analytics={defaultAnalytics}
            trigger={customTrigger}
        >
            // Events triggered by the Calendar component
            // will use the context specified above.
            <Calendar/>
        </TrackingProvider>
    );
}
```

### Nested component providing additional analytics

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const buttonAnalytics = {location: 'top-right'};

function CalendarButton(props) {
    return (
        <TrackingProvider analytics={buttonAnalytics}>
            <EventButton>{'Click Me'}</EventButton>
        </TrackingProvider>
    );
}
```

When `EventButton` triggers the `button.click` event, the trigger handler will be sent the combined set of analytics (`{category: 'My App', location: 'top-right'}`) from the nested `TrackingProvider` instances.

## Event Specific Configuration

The `analytics` and `options` properties serve as defaults for all events that are triggered by the nested components. If a wrapped component triggers multiple types of events, use the `eventAnalytics` and `eventOptions` properties to configure the `TrackingProvider` with event specific configuration. Note that the event specific configuration will be merged with the default configuration if it is also specified.

### Specifying event specific details

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const defaultAnalytics = {
    eventcategory: 'My App'
}
const eventAnalytics = {
    'generic.click': {
        eventaction: 'toggle'
    },
    'generic.event': {
        eventaction: 'hit test'
    }
}

function App(props) {
    return (
        <TrackingProvider analytics={defaultAnalytics} eventAnalytics={eventAnalytics}>
            <EventButton>{'Click Me'}</EventButton>
        </TrackingProvider>
    );
}
```