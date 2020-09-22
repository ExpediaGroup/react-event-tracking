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
import {shallow, mount} from 'enzyme';
import TrackingProvider from '../TrackingProvider.js';
import sinon from 'sinon';

const PROP_DATA = {
    eventAnalytics: {
        'datepicker.close': {
            'who': 'you'
        },
        'datepicker.open': {
            'who': 'you'
        },
        'datepicker.blur': {
            'when': 'today'
        }
    },
    eventOptions: {
        'datepicker.close': {
            'doitnow': 'yes'
        },
        'datepicker.open': {
            'doitnow': 'yes'
        },
        'datepicker.perf': {
            'pain': 'always'
        }
    },
    analytics: {
        'location': 'top',
        'action': 'test',
        'language': 'english'
    },
    options: {
        'delay': '100',
        'jump': 'yolo'
    }
};

const CONTEXT_DATA = {
    eventAnalytics: {
        'datepicker.close': {
            'who': 'me'
        },
        'datepicker.open': {
            'who': 'me'
        },
        'generic.click': {
            'dummy': 'ohyeah'
        }
    },
    eventOptions: {
        'datepicker.close': {
            'doitnow': 'no'
        },
        'datepicker.open': {
            'doitnow': 'no'
        },
        'generic.event': {
            'waitforever': 'sure'
        }
    },
    analytics: {
        'location': 'bottom',
        'action': 'failure',
        'zombie': 'walking'
    },
    options: {
        'delay': '404',
        'up': 'down'
    }
};

const MERGED_DATA = {
    eventAnalytics: {...CONTEXT_DATA.eventAnalytics, ...PROP_DATA.eventAnalytics},
    eventOptions: {...CONTEXT_DATA.eventOptions, ...PROP_DATA.eventOptions},
    analytics: {...CONTEXT_DATA.analytics, ...PROP_DATA.analytics},
    options: {...CONTEXT_DATA.options, ...PROP_DATA.options}
};

Object.keys(MERGED_DATA.eventAnalytics).forEach((key) => {
    MERGED_DATA.eventAnalytics[key] = {...CONTEXT_DATA.eventAnalytics[key], ...PROP_DATA.eventAnalytics[key]};
});
Object.keys(MERGED_DATA.eventOptions).forEach((key) => {
    MERGED_DATA.eventOptions[key] = {...CONTEXT_DATA.eventOptions[key], ...PROP_DATA.eventOptions[key]};
});


describe('<TrackingProvider/>', () => {
    const origWindow = global.window;

    afterEach(() => {
        global.window = origWindow;
    });

    describe('constructor', () => {
        it('should initialize TrackingContext with defaults', () => {
            const provider = shallow(<TrackingProvider />).instance();
            expect(provider.TrackingContext).to.deep.equal({
                _data: {
                    eventAnalytics: undefined, // eslint-disable-line no-undefined
                    eventOptions: undefined, // eslint-disable-line no-undefined
                    analytics: undefined, // eslint-disable-line no-undefined
                    options: undefined, // eslint-disable-line no-undefined
                    trigger: provider.TrackingContext._data.trigger
                },
                hasProvider: true,
                trigger: provider.trigger
            });
            expect(typeof provider.TrackingContext._data.trigger).to.equal('function');
        });

        it('should initialize TrackingContext with specified properties', () => {
            const triggerStub = sinon.stub();
            const _data = {
                eventAnalytics: {
                    myEvent: {
                        one: 'one',
                        two: 'two'
                    }
                },
                eventOptions: {
                    myEvent: {
                        three: 'four'
                    }
                },
                analytics: {
                    five: 'six',
                    seven: 'eight'
                },
                options: {
                    nine: 'ten'
                },
                trigger: triggerStub
            };

            const provider = shallow(<TrackingProvider {..._data}/>).instance();
            expect(provider.TrackingContext).to.deep.equal({
                _data,
                hasProvider: true,
                trigger: provider.trigger
            });
        });

        it('should initialize nested TrackingContext with specified properties', () => {
            const triggerStub = sinon.stub();
            const _data = {
                eventAnalytics: {
                    myEvent: {
                        one: 'one',
                        two: 'two'
                    }
                },
                eventOptions: {
                    myEvent: {
                        three: 'three'
                    }
                },
                analytics: {
                    five: 'five',
                    seven: 'seven'
                },
                options: {
                    nine: 'nine'
                },
                trigger: triggerStub
            };

            const _data2 = {
                eventAnalytics: {
                    myEvent: {
                        one: 'one2',
                        three: 'three'
                    },
                    secondEvent: {
                        one: 'one',
                        two: 'two'
                    }
                },
                eventOptions: {
                    myEvent: {
                        three: 'four2',
                        four: 'four'
                    },
                    secondEvent: {
                        three: 'three',
                        four: 'four'
                    }
                },
                analytics: {
                    five: 'six2',
                    eight: 'eight'
                },
                options: {
                    nine: 'nine',
                    ten: 'ten'
                }
            };

            // This is ugly. Essentially need to deep merge to build the expected
            // data object but just doing this manually instead.
            const expectedData = JSON.parse(JSON.stringify(_data));
            Object.assign(expectedData.eventAnalytics.myEvent, _data2.eventAnalytics.myEvent);
            expectedData.eventAnalytics.secondEvent = _data2.eventAnalytics.secondEvent;
            Object.assign(expectedData.eventOptions, _data2.eventOptions);
            Object.assign(expectedData.analytics, _data2.analytics);
            Object.assign(expectedData.options, _data2.options);
            // Should inherit the parent trigger method.
            expectedData.trigger = triggerStub;

            const provider = mount(
                <TrackingProvider {..._data}>
                    <TrackingProvider {..._data2}/>
                </TrackingProvider>
            );
            const childProvider = provider.childAt(0).instance();
            expect(childProvider.TrackingContext).to.deep.equal({
                _data: expectedData,
                hasProvider: true,
                trigger: childProvider.trigger
            });
        });


        it('should initialize nested TrackingContext empty trigger if no trigger specified', () => {
            const provider = mount(
                <TrackingProvider>
                    <TrackingProvider/>
                </TrackingProvider>
            );
            const childProvider = provider.childAt(0).instance();
            expect(typeof childProvider.TrackingContext._data.trigger).to.equal('function');
        });
    });

    describe('mergeContextData', () => {
        it('should return the specified properties as the data if overwrite is true', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA} overwrite/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(PROP_DATA);
        });

        it('should return the context data if no data properties specified and overwrite is true', () => {
            const provider = shallow(<TrackingProvider overwrite/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(CONTEXT_DATA);
        });

        it('should return the context data if no data properties specified and overwrite is false', () => {
            const provider = shallow(<TrackingProvider/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(CONTEXT_DATA);
        });

        it('should return a merge of the specified properties and data if overwrite is false', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA}/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(MERGED_DATA);
        });

        it('should return the property data if overwrite is false and context data is null', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA}/>).instance();
            const result = provider.mergeContextData();
            expect(result).to.deep.equal(PROP_DATA);
        });
    });

    describe('trigger', () => {
        let triggerSpy = sinon.spy();

        afterEach(() => {
            triggerSpy.resetHistory();
        });

        it('should throw exception if event is not specified', () => {
            const provider = shallow(<TrackingProvider trigger={triggerSpy}/>).instance();
            expect(provider.trigger).to.throw('event is a required parameter');
        });

        it('should trigger an event with merged analytics and options', () => {
            const event = 'datepicker.close';
            const provider = shallow(<TrackingProvider trigger={triggerSpy} eventAnalytics={PROP_DATA.eventAnalytics} eventOptions={PROP_DATA.eventOptions} analytics={PROP_DATA.analytics} options={PROP_DATA.options}/>).instance();
            provider.trigger(event, CONTEXT_DATA.analytics, CONTEXT_DATA.options);
            expect(triggerSpy.calledOnce).to.equal(true);
            const args = triggerSpy.args[0];
            expect(args[0]).to.equal(event);
            expect(args[1]).to.deep.equal({...PROP_DATA.analytics, ...PROP_DATA.eventAnalytics[event], ...CONTEXT_DATA.analytics});
            expect(args[2]).to.deep.equal({...PROP_DATA.options, ...PROP_DATA.eventOptions[event], ...CONTEXT_DATA.options});
        });
    });

    describe('renderProvider', () => {
        let triggerSpy = sinon.spy();

        afterEach(() => {
            triggerSpy.resetHistory();
        });

        it('should set this.TrackingContext._data to context data when no data passed', () => {
            const trackingProvider = shallow(<TrackingProvider trigger={triggerSpy} eventAnalytics={PROP_DATA.eventAnalytics} eventOptions={PROP_DATA.eventOptions} analytics={PROP_DATA.analytics} options={PROP_DATA.options}/>).instance();
            trackingProvider.renderProvider();
            expect(trackingProvider.TrackingContext._data).to.deep.equal({...PROP_DATA, trigger: triggerSpy});
        });

        it('should set this.TrackingContext._data to merge of context data', () => {
            const trackingProvider = shallow(<TrackingProvider trigger={triggerSpy} eventAnalytics={PROP_DATA.eventAnalytics} eventOptions={PROP_DATA.eventOptions} analytics={PROP_DATA.analytics} options={PROP_DATA.options}/>).instance();
            trackingProvider.renderProvider({_data: CONTEXT_DATA});
            expect(trackingProvider.TrackingContext._data).to.deep.equal({...MERGED_DATA, trigger: triggerSpy});
        });
    });

    describe('render', () => {
        it('should render successfully', () => {
            expect(shallow(<TrackingProvider/>)).to.have.length(1);
        });

        it('should render a ContextConsumer by default', () => {
            const provider = shallow(<TrackingProvider/>);
            expect(provider.find('ContextConsumer')).to.have.length(1);
        });
    });
});
