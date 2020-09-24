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
import {TrackingProvider} from '../../../src/index';
import './TrackingChecker.less';

class TrackingChecker extends PureComponent {
    static propTypes = {
        /** An object of event specific payloads where the event name is the key and the value is an object of key/value pairs for the event. Event specific values will be merged with defaults from the `payload` property. */
        eventPayload: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** An object of event specific options where the event name is the key and the value is an object of option key/value pairs for the event. Event specific values will be merged with defaults from the `options` property. */
        eventOptions: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
        /** The expected data configuration. */
        expected: PropTypes.object,
        /** Object of key/value pairs that represents the default payload to apply to all events within this context. */
        payload: PropTypes.objectOf(PropTypes.any),
        /** The trigger options. */
        options: PropTypes.objectOf(PropTypes.any),
        /** When true, overwrites the current context with specified properties. Default is to merge instead of overwrite. */
        overwrite: PropTypes.bool,
    };

    static defaultProps = {
        expected: {}
    };

    state = {
        actualStr: '',
        expectedStr: '',
        isValid: null
    };

    trigger = (event, payload, options) => {
        const {expected} = this.props;

        if (expected) {
            const actual = {event, payload, options};
            const expectedStr = JSON.stringify(expected);
            const actualStr = JSON.stringify(actual);

            if (expectedStr === actualStr) {
                this.setState({
                    isValid: true
                });
            } else {
                this.setState({
                    actualStr,
                    expectedStr,
                    isValid: false
                });
            }
        }

        console.log(`Triggered ${event} with payload: `, payload, ' and options: ', options);
    }

    render() {
        const {children, expected, ...rest} = this.props; // eslint-disable-line no-unused-vars
        return (
            <>
                <div className="TrackingChecker__control">
                    <TrackingProvider {...rest} trigger={this.trigger}>
                        {children}
                    </TrackingProvider>
                    {this.state.isValid &&
                        <svg className="text-success" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="square" strokeMiterlimit="10" xmlns="http://www.w3.org/2000/svg">
                            <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#success"/>
                        </svg>
                    }
                    {this.state.isValid === false &&
                        <svg className="text-danger" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="square" strokeMiterlimit="10" xmlns="http://www.w3.org/2000/svg">
                            <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#error"/>
                        </svg>
                    }
                </div>
                {this.state.isValid === false &&
                    <>
                        <p className="text-success">{`Expected ${this.state.expectedStr}`}</p>
                        <p className="text-danger">{`Actual ${this.state.actualStr}`}</p>
                    </>
                }
            </>
        );
    }
}

export default TrackingChecker;
