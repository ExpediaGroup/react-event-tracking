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
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import TrackingTrigger from '../TrackingTrigger';
import sinon from 'sinon';

describe('<TrackingTrigger/>', () => {
    const origWindow = global.window;

    afterEach(() => {
        global.window = origWindow;
    });

    describe('componentDidMount', () => {
        it('should trigger the specified event', () => {
            const event = 'use.force';
            const trigger = shallow(<TrackingTrigger event={event}/>).instance();
            const triggerSpy = sinon.spy();
            trigger.trigger = triggerSpy;
            trigger.componentDidMount();
            expect(triggerSpy.called).to.equal(true);
            expect(triggerSpy.calledWith(event)).to.equal(true);
        });

        it('should trigger the specified event, payload and options', () => {
            const event = 'use.force';
            const payload = {
                luke: 'yes',
                padme: 'no'
            };
            const options = {
                darkside: 'no'
            };
            const trigger = shallow(<TrackingTrigger event={event} payload={payload} options={options}/>).instance();
            const triggerSpy = sinon.spy();
            trigger.trigger = triggerSpy;
            trigger.componentDidMount();
            expect(triggerSpy.called).to.equal(true);
            expect(triggerSpy.calledWith(event, payload, options)).to.equal(true);
        });

        it('should trigger the specified event, fields (deprecated but falling back) and options', () => {
            const event = 'use.force';
            const fields = {
                luke: 'yes',
                padme: 'no'
            };
            const options = {
                darkside: 'no'
            };
            const trigger = shallow(<TrackingTrigger event={event} fields={fields} options={options}/>).instance();
            const triggerSpy = sinon.spy();
            trigger.trigger = triggerSpy;
            trigger.componentDidMount();
            expect(triggerSpy.called).to.equal(true);
            expect(triggerSpy.calledWith(event, fields, options)).to.equal(true);
        });

        it('should call the onTrigger callback with the specified event', () => {
            const event = 'use.force';
            const triggerSpy = sinon.spy();
            const trigger = shallow(<TrackingTrigger event={event} onTrigger={triggerSpy}/>).instance();
            trigger.trigger = () => {
                return {event};
            };
            trigger.componentDidMount();
            expect(triggerSpy.called).to.equal(true);
            expect(triggerSpy.calledWith({event})).to.equal(true);
        });

        it('should call the onTrigger callback with the specified event, payload and options', () => {
            const event = 'use.force';
            const payload = {
                luke: 'yes',
                padme: 'no'
            };
            const options = {
                darkside: 'no'
            };
            const triggerSpy = sinon.spy();
            const trigger = shallow(<TrackingTrigger event={event} payload={payload} options={options} onTrigger={triggerSpy}/>).instance();
            trigger.trigger = () => {
                return {
                    event,
                    payload,
                    options
                };
            };
            trigger.componentDidMount();
            expect(triggerSpy.called).to.equal(true);
            expect(triggerSpy.calledWith({event, payload, options})).to.equal(true);
        });
    });

    describe('handleContext', () => {
        it('should set the trigger property and return children', () => {
            const event = 'use.force';
            const children = 'this is a test';
            const triggerFunc = () => {};
            const trigger = shallow(<TrackingTrigger event={event} children={children}/>).instance();

            const rtnVal = trigger.handleContext({trigger: triggerFunc});
            expect(rtnVal).to.equal(children);
            expect(trigger.trigger).to.equal(triggerFunc);
        });
    });

    describe('render', () => {
        it('should render successfully', () => {
            expect(shallow(<TrackingTrigger event={'test'}/>)).to.have.length(1);
        });
    });
});
