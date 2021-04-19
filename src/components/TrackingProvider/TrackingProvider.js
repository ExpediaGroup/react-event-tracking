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
import deepMerge from '../../utils/DeepMerge';

/**
 * A React context provider that allows nesting to generate new context that
 * builds on parent context. This component allows applications to build the
 * payload and options for events declaratively and through nesting.
 */
class TrackingProvider extends PureComponent {
    static propTypes = {
        /** (Deprecated) An object of event specific fields where the event name is the key and the value is an object of field key/value pairs for the event. Event specific values will be merged with defaults from the `fields` property. The `eventPayload` property takes precedence over this property if both are specified. */
        eventFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        /** An object of event specific payloads where the event name is the key and the value is an object of key/value pairs for the event. Event specific values will be merged with defaults from the `payload` property. */
        eventPayload: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** An object of event specific options where the event name is the key and the value is an object of option key/value pairs for the event. Event specific values will be merged with defaults from the `options` property. */
        eventOptions: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** (Deprecated) Object of string values that represents the default payload to apply to all events within this context. The `payload` property takes precedence over this property if both specified. */
        fields: PropTypes.objectOf(PropTypes.string),
        /** Object of values that represents the default payload to apply to all events within this context. */
        payload: PropTypes.objectOf(PropTypes.any),
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
                eventPayload: this.props.eventPayload,
                eventOptions: this.props.eventOptions,
                payload: this.props.payload,
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
    mergeContextData(data = {eventPayload: {}, eventFields: {}, eventOptions: {}}) {
        const {eventFields, eventOptions, fields, options, overwrite} = this.props;
        let {eventPayload, payload} = this.props;
        const newData = {};

        // Prefer new data payload name, but fall back for backwards compatibility
        eventPayload = eventPayload || eventFields;
        payload = payload || fields;

        if (overwrite) {
            newData.eventPayload = eventPayload || data.eventPayload;
            newData.eventOptions = eventOptions || data.eventOptions;
            newData.payload = payload || data.payload;
            newData.options = options || data.options;
        } else {
            // Not an overwrite so merge the properties and context objects
            newData.eventPayload = deepMerge(data.eventPayload, eventPayload);
            newData.eventOptions = deepMerge(data.eventOptions, eventOptions);
            newData.payload = deepMerge(data.payload, payload);
            newData.options = deepMerge(data.options, options);
        }

        return newData;
    }

    /**
     * The exposed context trigger API. Merges the specified values with the
     * values in context and then invokes the implementation specific trigger
     * method.
     */
    trigger = (event, payload = {}, options = {}) => {
        const data = this.TrackingContext._data;
        const name = event || data.event;
        const eventPayload = data.eventPayload ? data.eventPayload[name] : {};
        const eventOptions = data.eventOptions ? data.eventOptions[name] : {};

        if (!name) {
            throw new TypeError('event is a required parameter');
        }

        payload = deepMerge(data.payload, eventPayload, payload);
        options = deepMerge(data.options, eventOptions, options);
        return data.trigger(name, payload, options);
    };

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
    };

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
