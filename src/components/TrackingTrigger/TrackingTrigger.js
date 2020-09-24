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
 * A React component to declaratively trigger an event. The event is
 * triggered when this component is mounted into the DOM.
 */
class TrackingTrigger extends PureComponent {
    static propTypes = {
        /** The event to trigger. */
        event: PropTypes.string.isRequired,
        /** (Deprecated) The event specific fields. The `payload` property takes precedence over this property if both are specified. */
        fields: PropTypes.objectOf(PropTypes.string),
        /** The event specific payload. */
        payload: PropTypes.objectOf(PropTypes.any),
        /** Callback function invoked after the event successfully triggered. */
        onTrigger: PropTypes.func,
        /** Trigger options. */
        options: PropTypes.objectOf(PropTypes.string)
    };

    static defaultProps = {
        onTrigger: () => {},
        options: {}
    };

    componentDidMount() {
        const {event, fields, onTrigger, options} = this.props;
        let {payload} = this.props;
        payload = payload || fields || {};

        if (typeof this.trigger === 'function') {
            const triggerContext = this.trigger(event, payload, options);
            onTrigger(triggerContext);
        }
    }

    handleContext = ({trigger}) => {
        const {children} = this.props;

        // Save a reference to the trigger method for use in componentDidMount.
        this.trigger = trigger;
        return children;
    };

    render() {
        return (
            <TrackingContext.Consumer>
                {this.handleContext}
            </TrackingContext.Consumer>
        );
    }
}

export default TrackingTrigger;
