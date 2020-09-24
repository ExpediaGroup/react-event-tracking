`TrackingContext` provides acccess to the current value of the context defined by a `TrackingProvider`. Use of `TrackingProvider` and `TrackingContext` enables an application to progressively build the payload and options and then trigger events at the lowest level.

## Base Usage

Structuring a component to use `TrackingContext` will provide access to the `trigger` method to trigger events. Use one of the two methods shown below to configure the context for a React component. Once configured as shown, the component can then access the `trigger` method via `this.context.trigger`.

If the babel configuration for the application includes support for [public class fields syntax](https://babeljs.io/docs/plugins/transform-class-properties/) and the application is using **react ^16.6.0**, use a *static* class field to initialize the `contextType`:

```jsx
import React, {Component} from 'react';
import {TrackingContext} from '@vrbo/react-event-tracking'

class MyComponent extends Component {
    static contextType = TrackingContext;

    handleClick() {
        this.context.trigger(`generic.click`);
    }
    ...
}
```

Alternatively, if a component is not using public class fields syntax, set the `contextType` directly on the class:

```jsx
import React, {Component} from 'react';
import {TrackingContext} from '@vrbo/react-event-tracking'

class MyComponent extends Component {
    handleClick() {
        this.context.trigger(`generic.click`);
    }
    ...
}
MyComponent.contextType = TrackingContext;
```

## Trigger API

The `trigger` method is used to log an event with the framework. In combination with the `TrackingProvider` component, this enables an application to build the event payload and options throughout the DOM hierarchy and then trigger the event at the lowest level. Using this framework helps to ensure consistency in events as the lower level components can trigger the event generically while inheriting the payload and options defined higher in the DOM hierarchy through `TrackingProvider`.

The `trigger` API has the following signature:

```javascript
trigger(event, payload, options)
```

Where:

- **event** - The name of the event to trigger (String).
- **payload** - The required and optional payload for the event (Object of any values).
- **options** - Options for the trigger API to use when triggering the event. (Object)

## Determine if provider exists

`TrackingContext` provides a default behavior for the `trigger` API that is essentially a no-op. This allows for backwards compatibility for applications that have not yet added an `TrackingProvider`. Additionally, a component can determine if a `TrackingProvider` exists in the context chain by checking the boolean value of `hasProvider`. This is useful in scenarios where the component historically fired events using another method and is being updated to use `TrackingContext`.

```jsx
import React, {Component} from 'react';
import {TrackingContext} from '@vrbo/react-event-tracking'

class MyComponent extends Component {
    static contextType = TrackingContext;

    handleClick() {
        if (this.context.hasProvider) {
            this.context.trigger(`generic.click`);
        } else {
            // fire event using other method
        }
    }
    ...
}
```
