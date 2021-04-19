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
    eventPayload: {
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
    payload: {
        'location': 'top',
        'action': 'test',
        'language': 'english'
    },
    options: {
        'delay': '100',
        'jump': 'yolo'
    }
};

const PROP_DATA_FIELDS = {
    eventFields: {
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
    fields: {
        'location': 'top',
        'action': 'test',
        'language': 'english'
    },
    options: {
        'delay': '100',
        'jump': 'yolo'
    }
};

const PROP_DATA_FIELDS_PAYLOAD = {
    eventFields: {
        'datepicker.close': {
            'who': 'not you'
        },
        'datepicker.open': {
            'who': 'not you'
        },
        'datepicker.blur': {
            'when': 'not today'
        }
    },
    eventPayload: {
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
    fields: {
        'location': 'bottom',
        'action': 'test2',
        'language': 'french'
    },
    payload: {
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
    eventPayload: {
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
    payload: {
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
    eventPayload: {...CONTEXT_DATA.eventPayload, ...PROP_DATA.eventPayload},
    eventOptions: {...CONTEXT_DATA.eventOptions, ...PROP_DATA.eventOptions},
    payload: {...CONTEXT_DATA.payload, ...PROP_DATA.payload},
    options: {...CONTEXT_DATA.options, ...PROP_DATA.options}
};

Object.keys(MERGED_DATA.eventPayload).forEach((key) => {
    MERGED_DATA.eventPayload[key] = {...CONTEXT_DATA.eventPayload[key], ...PROP_DATA.eventPayload[key]};
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
                    eventPayload: undefined, // eslint-disable-line no-undefined
                    eventOptions: undefined, // eslint-disable-line no-undefined
                    payload: undefined, // eslint-disable-line no-undefined
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
                eventPayload: {
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
                payload: {
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
                eventPayload: {
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
                payload: {
                    five: 'five',
                    seven: 'seven'
                },
                options: {
                    nine: 'nine'
                },
                trigger: triggerStub
            };

            const _data2 = {
                eventPayload: {
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
                payload: {
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
            Object.assign(expectedData.eventPayload.myEvent, _data2.eventPayload.myEvent);
            expectedData.eventPayload.secondEvent = _data2.eventPayload.secondEvent;
            Object.assign(expectedData.eventOptions, _data2.eventOptions);
            Object.assign(expectedData.payload, _data2.payload);
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

        it('should return the specified properties as the data if overwrite is true even when using fields instead of payload', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA_FIELDS} overwrite/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(PROP_DATA); // Everything gets mapped back from eventFields/fields to eventPayload/payload
        });

        it('should return the context data if no data properties specified and overwrite is true', () => {
            const provider = shallow(<TrackingProvider overwrite/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(CONTEXT_DATA);
        });

        it('should return the context data if no data properties specified and overwrite is true even when using fields instead of payload', () => {
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

        it('should return a merge of the specified properties and data if overwrite is false even when using fields instead of payload', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA_FIELDS}/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(MERGED_DATA);
        });

        it('should prefer payload over fields if overwrite is true', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA_FIELDS_PAYLOAD} overwrite/>).instance();
            const result = provider.mergeContextData(CONTEXT_DATA);
            expect(result).to.deep.equal(PROP_DATA);
        });

        it('should prefer payload over fields if overwrite is false', () => {
            const provider = shallow(<TrackingProvider {...PROP_DATA_FIELDS_PAYLOAD}/>).instance();
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

        it('should trigger an event with merged payload and options', () => {
            const event = 'pageview';
            const defaultPayload = {
                hello: 'world',
                foo: {
                    bar: 'one',
                    bike: 'one'
                }
            };
            const nestedEventPayload = {
                pageview: {
                    something: 'new',
                    foo: {
                        bar: 'two'
                    }
                }
            };

            const triggerPayload = {
                hello: 'world2',
                foo: {
                    bar: 'three',
                    car: 'three'
                }
            };

            const defaultOptions = {
                hi: 'there',
                who: {
                    are: 'you'
                }
            };

            const nestedEventOptions = {
                pageview: {
                    hello: 'world',
                    who: {
                        am: 'i',
                        are: 'we'
                    }
                }
            };

            const triggerOptions = {
                hi: 'you',
                who: {
                    are: 'they'
                }
            };

            const expectedPayload = {
                hello: 'world2',
                something: 'new',
                foo: {
                    bar: 'three',
                    bike: 'one',
                    car: 'three'
                }
            };

            const expectedOptions = {
                hello: 'world',
                hi: 'you',
                who: {
                    am: 'i',
                    are: 'they'
                }
            };

            const nestedTrackingProvider = React.createRef();
            mount(
                <TrackingProvider trigger={triggerSpy} payload={defaultPayload} options={defaultOptions}>
                    <TrackingProvider ref={nestedTrackingProvider} eventPayload={nestedEventPayload} eventOptions={nestedEventOptions}/>
                </TrackingProvider>
            ).instance();

            nestedTrackingProvider.current.trigger(event, triggerPayload, triggerOptions);
            expect(triggerSpy.calledOnce).to.equal(true);
            const args = triggerSpy.args[0];
            expect(args[1]).to.deep.equal(expectedPayload);
            expect(args[2]).to.deep.equal(expectedOptions);
        });
    });

    describe('renderProvider', () => {
        let triggerSpy = sinon.spy();

        afterEach(() => {
            triggerSpy.resetHistory();
        });

        it('should set this.TrackingContext._data to context data when no data passed', () => {
            const trackingProvider = shallow(<TrackingProvider trigger={triggerSpy} eventPayload={PROP_DATA.eventPayload} eventOptions={PROP_DATA.eventOptions} payload={PROP_DATA.payload} options={PROP_DATA.options}/>).instance();
            trackingProvider.renderProvider();
            expect(trackingProvider.TrackingContext._data).to.deep.equal({...PROP_DATA, trigger: triggerSpy});
        });

        it('should set this.TrackingContext._data to merge of context data', () => {
            const trackingProvider = shallow(<TrackingProvider trigger={triggerSpy} eventPayload={PROP_DATA.eventPayload} eventOptions={PROP_DATA.eventOptions} payload={PROP_DATA.payload} options={PROP_DATA.options}/>).instance();
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
