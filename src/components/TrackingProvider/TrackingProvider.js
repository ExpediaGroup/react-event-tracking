/*
 * Copyright 2019 Expedia Group, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import TrackingContext from '../../context/TrackingContext';

/**
 * A React context provider that allows nesting to generate new context that
 * builds on parent context. This component allows applications to build the
 * analytics and options for events declaratively and through nesting.
 */
class TrackingProvider extends PureComponent {
    static propTypes = {
        /** An object of event specific analytics where the event name is the key and the value is an object of field key/value pairs for the event. Event specific values will be merged with defaults from the `analytics` property. */
        eventAnalytics: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** An object of event specific options where the event name is the key and the value is an object of option key/value pairs for the event. Event specific values will be merged with defaults from the `options` property. */
        eventOptions: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** Object of string values that represents the default analytics to apply to all events within this context. */
        analytics: PropTypes.objectOf(PropTypes.any),
        /** The trigger options. */
        options: PropTypes.objectOf(PropTypes.any),
        /** When true, overwrites the current context with specified properties. Default is to merge instead of overwrite. */
        overwrite: PropTypes.bool,
        /** Tracking event trigger implementation. */
        trigger: PropTypes.func
    };

    static defaultProps = {
        overwrite: false
    };

    constructor(props) {
        super(props);

        // Use a class property to save context data instead of using state in
        // order to prevent excessive renders when context changes. This
        // structure must mimic the one defined in TrackingContext;
        this.TrackingContext = {
            _data: {
                eventAnalytics: this.props.eventAnalytics,
                eventOptions: this.props.eventOptions,
                analytics: this.props.analytics,
                options: this.props.options,
                trigger: this.props.trigger || (/* istanbul ignore next */() => {})
            },
            hasProvider: true,
            trigger: this.trigger
        };
    }

    /**
     * Overwrites or merges the specified properties with the existing context.
     *
     * @param {Object} data
     */
    mergeContextData(data = {eventAnalytics: {}, eventOptions: {}}) {
        const {eventAnalytics, eventOptions, analytics, options, overwrite} = this.props;
        const newData = {};

        if (overwrite) {
            newData.eventAnalytics = eventAnalytics || data.eventAnalytics;
            newData.eventOptions = eventOptions || data.eventOptions;
            newData.analytics = analytics || data.analytics;
            newData.options = options || data.options;
        } else {
            // Not an overwrite so merge the properties and context objects
            newData.eventAnalytics = {...data.eventAnalytics, ...eventAnalytics};
            newData.eventOptions = {...data.eventOptions, ...eventOptions};
            newData.analytics = {...data.analytics, ...analytics};
            newData.options = {...data.options, ...options};

            // if eventAnalytics or eventOptions was specified need to do a shallow
            // copy and another shallow copy one level deep for each key.

            if (eventAnalytics) {
                Object.keys(newData.eventAnalytics).forEach((key) => {
                    newData.eventAnalytics[key] = {...data.eventAnalytics[key], ...eventAnalytics[key]};
                });
            }
            if (eventOptions) {
                Object.keys(newData.eventOptions).forEach((key) => {
                    newData.eventOptions[key] = {...data.eventOptions[key], ...eventOptions[key]};
                });
            }
        }

        return newData;
    }

    /**
     * The exposed context trigger API. Merges the specified values with the
     * values in context and then invokes the implementation specific trigger
     * method.
     */
    trigger = (event, analytics = {}, options = {}) => {
        const data = this.TrackingContext._data;
        const name = event || data.event;
        const eventAnalytics = data.eventAnalytics ? data.eventAnalytics[name] : {};
        const eventOptions = data.eventOptions ? data.eventOptions[name] : {};

        if (!name) {
            throw new TypeError('event is a required parameter');
        }

        analytics = {
            ...data.analytics,
            ...eventAnalytics,
            ...analytics
        };
        options = {
            ...data.options,
            ...eventOptions,
            ...options
        };
        return data.trigger(name, analytics, options);
    }

    /**
     * React Context render prop function. Merges the components properties with
     * the parent context and then generates a new context provider.
     */
    renderProvider = ({_data} = {}) => {
        const {children, trigger} = this.props;

        this.TrackingContext._data = this.mergeContextData(_data);
        // The specified trigger property takes precedence or fallback to one
        // inherited from parent context (for nesting) or default to empty function.
        this.TrackingContext._data.trigger = trigger || _data.trigger || (/* istanbul ignore next */() => {});

        return (
            <TrackingContext.Provider value={this.TrackingContext}>
                {children}
            </TrackingContext.Provider>
        );
    }

    render() {
        return (
            // Consume the context and then generate a new context provider
            // as a merge of specified properties and existing context.
            <TrackingContext.Consumer>
                {this.renderProvider}
            </TrackingContext.Consumer>
        );
    }
}

export default TrackingProvider;
