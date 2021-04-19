[![Build Status](https://travis-ci.org/ExpediaGroup/react-event-tracking.svg?branch=master)](https://travis-ci.org/ExpediaGroup/react-event-tracking)

# react-event-tracking

* [Overview](#overview)
* [Usage](#usage)
* [Development](#development)
* [Further Reading](#further-reading)

## Overview

The `react-event-tracking` repository provides React components for applications and other React components to build event metadata and trigger analytic events. `react-event-tracking` enables low level React components to trigger analytic tracking events while allowing higher levels in the DOM hierarchy to specify additional details that will be automatically included. Using this functionality to trigger events at the lowest level in the DOM hierarchy helps to ensure consistency in eventing across an application.

## Usage

Application developers that want to consume this component should install the package using npm:

```bash
npm install @vrbo/react-event-tracking
```

Within your javascript files, import the component:

```javascript
// ES6 module syntax:
import {TrackingProvider, TrackingContext} from '@vrbo/react-event-tracking';

// CommonJS syntax:
const {TrackingProvider, TrackingContext} = require('@vrbo/react-event-tracking');

// RequireJS syntax:
// Setup a "paths" configuration in your require config:
'@vrbo/react-event-tracking': '../../node_modules/@vrbo/react-event-tracking/lib/umd/index.min'

// Then include in your module
const {TrackingProvider, TrackingContext} = require('@vrbo/react-event-tracking');
```

Applications use a `TrackingProvider` to define the event triggering implementation and wrap components that trigger events with additional payload and options that will be merged into the triggered event.

Components make use of `TrackingContext` or `TrackingTrigger` to trigger events which will automatically merge the payload and options specified at higher levels in the DOM through one or more `TrackingProvider` components.

### TrackingProvider

The `TrackingProvider` is a [React 16 context provider](https://reactjs.org/docs/context.html) component that allows an application to define the event trigger implementation and incrementally build the payload and options for analytic events that will trigger from nested components. Using the `TrackingProvider` enables components at the lowest level to trigger events with the necessary set of payload and options. The `TrackingProvider` is intended as a generic provider that does not require the use of a specific analytic event tracking library.

> Note: It is strongly recommended that property values for the TrackingProvider be defined in state or constant variables instead of building the values dynamically on every render. If the values are constructed during the render, it will cause a FORCE RE-RENDER of ALL consumers of the context that are descendants of the provider, even if the consumer's shouldComponentUpdate bails out. Following a pattern of defining property values as constants or via state will prevent unnecessary renders of children context consumers.

| PROPERTY       | TYPE                | DEFAULT  | DESCRIPTION |
| -------------- | ------------------- | -------- | ----------- |
| eventPayload   | objectOf (objectOf) | ──       | An object of event specific payload where the event name is the key and the value is an object of field key/value pairs for the event. Event specific values will be merged with defaults from the `payload` property. |
| eventFields    | objectOf (objectOf) | ──       | (Deprecated) An object of event specific fields where the event name is the key and the value is an object of field key/value pairs for the event. Event specific values will be merged with defaults from the `fields` property. The `eventPayload` property takes precedence over this property if both are specified. |
| eventOptions   | objectOf (objectOf) | ──       | An object of event specific options where the event name is the key and the value is an object of option key/value pairs for the event. Event specific values will be merged with defaults from the `options` property. |
| payload        | objectOf (any)      | ──       | Object of any values that represents the default payload to apply to all events within this context. |
| fields         | objectOf (string)   | ──       | (Deprecated) Object of string values that represents the default fields to apply to all events within this context. The `payload` property takes precedence over this property if both are specified.  |
| options        | objectOf (any)      | ──       | The trigger options. |
| overwrite      | bool                | false    | When true, overwrites the current context with specified properties. Default is to merge instead of overwrite. |
| trigger        | func                | () => {} | Tracking event trigger implementation. |

In the example below the `Calendar` component is known to trigger some events so the consuming application wraps it with a `TrackingProvider` and the appropriate configuration of payload and options as well as the implementation of `trigger` appropriate for the application.

```jsx
import {TrackingProvider} from '@vrbo/react-event-tracking';
const defaultPayload = {location: 'top-right'};
const defaultOptions = {asynchronous: true};
const customTrigger = (event, payload, options) => {
    // Implement custom event tracking.
}

function App(props) {
    return (
        <TrackingProvider
            payload={defaultPayload}
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

For further details on usage of the `TrackingProvider` component view the [component documentation](markdown/TrackingProvider.md).

### TrackingContext

While the `TrackingProvider` component is used to incrementally build the payload and options for an event and define the trigger implementation, the `TrackingContext` module is used to trigger the analytic event. Structuring a component to use `TrackingContext` will provide access to the `trigger` method to trigger analytic events via `this.context.trigger`.

In the example below, `MyComponent` is configured to use the `TrackingContext` module and then triggers a `generic.click` event when the `handleClick()` method is invoked:

```jsx
import React, {Component} from 'react';
import {TrackingContext} from '@vrbo/react-event-tracking'

class MyComponent extends React.Component {
   static contextType = TrackingContext;

   handleClick() {
       this.context.trigger(`generic.click`);
   }
   ...
}
```

The trigger API has the following signature:

```javascript
trigger(event, payload, options)
```

Where:

* event - The name of the event to trigger (String)
* payload - The required and optional payload for the event (Object).
* options - The trigger options to use when triggering the event (Object)

For further details on usage of the `TrackingContext` module view the [module documentation](markdown/TrackingContext.md).

### TrackingTrigger

The `TrackingTrigger` component allows an application to declaratively trigger an analytic event. It is used in conjunction with the `TrackingProvider` component to trigger events in a standardized way. Specify the desired event name, payload and options to include when the event is triggered. The event will be triggered with a merge of the specified payload and options and the current context when the containing component’s `componentDidMount` is invoked.

| PROPERTY     | TYPE                | DEFAULT  | DESCRIPTION |
| ------------ | ------------------- | -------- | ----------- |
| event        | string              | ──       | The event to trigger |
| payload      | objectOf (any)      | {}       | The event specific payload |
| onTrigger    | func                | () => {} | Callback function invoked after the event successfully triggered. |
| options      | objectOf (any)      | {}       | The trigger options. |

```jsx
import {TrackingTrigger} from '@vrbo/react-event-tracking';
const eventPayload = {
    location: 'searchbar',
    name: 'Calendar'
};
const eventOptions = {asynchronous: true};

function Calendar(props) {
    return (
        ...
        <TrackingTrigger
            event={'viewed'}
            payload={eventPayload}
            options={eventOptions}
        />
    );
}
```

For further details on usage of the `TrackingTrigger` component view the [component documentation](markdown/TrackingTrigger.md).

### Usage Caveats

* The use of `contextType` in a React component requires `react: ^16.6.0`.
* Prior to React 16.8.0 it was not possible for a component to use multiple `contextType` definitions. If a component needs to consume multiple `contextType` definitions, use the [hooks api](https://reactjs.org/docs/hooks-overview.html#other-hooks) made available in React 16.8.0.
* If a `TrackingProvider` with a `trigger` implementation is not defined somewhere in the hierarchy, the `this.context.trigger` API will essentially be a no-op. This allows components to be enabled to trigger events regardless of whether the application is configured to trigger them.
* Do not dynamically construct the property values for `TrackingProvider` unless you want all descendant consumers to force re-render. See the "Note" under the `TrackingProvider` section for more details.
* Objects used in `eventPayload`, `eventOptions` and `payload` are deep merged when merging data in the `TrackingProvider`. Arrays are concatinated (nested objects within arrays are not merged), objects are merged recursively. Attributes with different types will be overwritten. 

## Development

| Script | Description |
| -------| ----------- |
| `npm install`   | Install the project dependencies; once installed `npm run build` is also executed |
| `npm start`     | Run the webpack dev server and open the test harness in a browser |
| `npm run start:silent` | Runs the webpack dev server but does not open a browser window |
| `npm run build` | Compile Less (CSS) and Javascript assets |
| `npm run test`  | Run unit tests, eslint and provide code coverage metrics |
| `npm run test:unit`     | Run unit tests only. To debug within the test suite pass the `--inspect` flag to `mocha` like so: `npm run test:unit -- --inspect` and add `debugger; //eslint-disable-line` to the line in the test file you would like to break on. If you need to break immediately, use `--inspect --inspect-brk`. |
| `npm run test:style`    | Run linters to verify code meets the configured `eslint` settings |
| `npm run test:coverage` | Run `npm run test:unit` and provide metrics about coverage |

### Notes

* Any time the scripts related to `start` are executed the documentation or project demo is available in your browser at `localhost:8000` or `0.0.0.0:8000`.
* To see a complete list of `npm scripts`, use: `npm run`

## Further Reading

* [Changelog](CHANGELOG.md)
* [Code of conduct](CODE_OF_CONDUCT.md)
* [Contributing](CONTRIBUTING.md)
* [License](LICENSE)
