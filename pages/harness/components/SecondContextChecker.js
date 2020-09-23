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
import SecondContext from './SecondContext';
import './SecondContextChecker.less';

class SecondContextChecker extends PureComponent {
    static propTypes = {
        /** Object of key/value pairs that represents the default payload to apply to all events within this context. */
        expected: PropTypes.object
    };

    static defaultProps = {
        expected: {}
    };

    state = {
        actualStr: '',
        expectedStr: '',
        isValid: null
    };

    check = (value) => {
        const {expected} = this.props;

        if (expected) {
            const expectedStr = JSON.stringify(expected);
            const actualStr = JSON.stringify(value);

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

        console.log('Second context with value: ', value);
    }

    render() {
        const {children, expected} = this.props;
        const value = {
            check: this.check,
            value: expected
        };
        return (
            <>
                <div className="SecondContextChecker__control">
                    <SecondContext.Provider value={value}>
                        {children}
                    </SecondContext.Provider>
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

export default SecondContextChecker;
