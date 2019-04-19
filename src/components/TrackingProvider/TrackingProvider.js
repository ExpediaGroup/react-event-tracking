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
 * fields and options for events declaratively and through nesting.
 */
class TrackingProvider extends PureComponent {
    static propTypes = {
        /** An object of event specific fields where the event name is the key and the value is an object of field key/value pairs for the event. Event specific values will be merged with defaults from the `fields` property. */
        eventFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        /** An object of event specific options where the event name is the key and the value is an object of option key/value pairs for the event. Event specific values will be merged with defaults from the `options` property. */
        eventOptions: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        /** Object of string values that represents the default fields to apply to all events within this context. */
        fields: PropTypes.objectOf(PropTypes.string),
        /** The trigger options. */
        options: PropTypes.objectOf(PropTypes.string),
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
                eventFields: this.props.eventFields,
                eventOptions: this.props.eventOptions,
                fields: this.props.fields,
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
    mergeContextData(data = {eventFields: {}, eventOptions: {}}) {
        const {eventFields, eventOptions, fields, options, overwrite} = this.props;
        const newData = {};

        if (overwrite) {
            newData.eventFields = eventFields || data.eventFields;
            newData.eventOptions = eventOptions || data.eventOptions;
            newData.fields = fields || data.fields;
            newData.options = options || data.options;
        } else {
            // Not an overwrite so merge the properties and context objects
            newData.eventFields = {...data.eventFields, ...eventFields};
            newData.eventOptions = {...data.eventOptions, ...eventOptions};
            newData.fields = {...data.fields, ...fields};
            newData.options = {...data.options, ...options};

            // if eventFields or eventOptions was specified need to do a shallow
            // copy and another shallow copy one level deep for each key.

            if (eventFields) {
                Object.keys(newData.eventFields).forEach((key) => {
                    newData.eventFields[key] = {...data.eventFields[key], ...eventFields[key]};
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
    trigger = (event, fields = {}, options = {}) => {
        const data = this.TrackingContext._data;
        const name = event || data.event;
        const eventFields = data.eventFields ? data.eventFields[name] : {};
        const eventOptions = data.eventOptions ? data.eventOptions[name] : {};

        if (!name) {
            throw new TypeError('event is a required parameter');
        }

        fields = {
            ...data.fields,
            ...eventFields,
            ...fields
        };
        options = {
            ...data.options,
            ...eventOptions,
            ...options
        };
        return data.trigger(name, fields, options);
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
