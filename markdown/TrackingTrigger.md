The `TrackingTrigger` component allows an application to declaratively trigger a tracking event. It is used in conjunction with the `TrackingProvider` component to trigger events in a standardized way.

## Base Usage

Use the `TrackingTrigger` component within a `TrackingProvider` component hierarchy. Specify the desired event name, payload and options to include when the event is triggered. The event will be triggered with a merge of the specified payload and options and the current context when the component's `componentDidMount` is invoked.

```jsx
import {TrackingTrigger} from '@vrbo/react-event-tracking';
const eventPayload = {
    location: 'searchbar',
    name: 'SomeComponent'
};
const eventOptions = {asynchronous: true};

function SomeComponent(props) {
    return (
        ...
        <TrackingTrigger
            event={'visible'}
            payload={eventPayload}
            options={eventOptions}
        />
    );
}
```
