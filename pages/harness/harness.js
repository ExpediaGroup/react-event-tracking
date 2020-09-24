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
import ReactDOM from 'react-dom';
import {TrackingProvider, TrackingTrigger} from '../../src/index';
import EventButton from './components/EventButton';
import EventButtonMultipleContext from './components/EventButtonMultipleContextType';
import TrackingChecker from './components/TrackingChecker';
import SecondContextChecker from './components/SecondContextChecker';
import './harness.less';

const SECONDCONTEXT = {
    myPayload: 'true',
    otherStuff: 'false'
};

/**
 * Development Harness
 *
 * This is the entry point for local development of the components in this
 * repository. It is mearly a harness that hosts examples of the components and
 * provides an efficient development experience.
 *
 * To work on this locally, run:
 *     npm start
 */

function harness() {
    return (
        <div>
            <p>{'Each example below will trigger an event which can be verified by opening the dev tools and viewing the message logged to the console.'}</p>
            <h3>{'Icon Key'}</h3>
            <dl className="harness-dl">
                <dt className="harness-dt">
                    <svg className="text-success" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="square" strokeMiterlimit="10" xmlns="http://www.w3.org/2000/svg">
                        <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#success"/>
                    </svg>
                </dt>
                <dd className="harness-dd">
                    {'Successfully triggered event with expected configuration.'}
                </dd>
                <dt className="harness-dt">
                    <svg className="text-danger" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="square" strokeMiterlimit="10" xmlns="http://www.w3.org/2000/svg">
                        <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#error"/>
                    </svg>
                </dt>
                <dd className="harness-dd">
                    {'Expected event did not trigger with the expected configuration.'}
                </dd>
            </dl>
            <h1>{'TrackingProvider and TrackingContext contextType'}</h1>
            <p>{'All these events have been setup to trigger on mount but can be manually triggered by clicking the related button.'}</p>
            <h2>{'Provider with no payload or options.'}</h2>
            <TrackingChecker expected={{
                event: 'generic.click',
                payload: {},
                options: {}}}
            >
                <EventButton label={'Generate generic.click'} />
            </TrackingChecker>

            <h2>{'Provider with payload and no options.'}</h2>
            <TrackingChecker payload={{
                'actionlocation': 'left',
                'eventcategory': 'harness'
            }} expected={{
                event: 'generic.click',
                payload: {
                    actionlocation: 'left',
                    eventcategory: 'harness'
                },
                options: {}}}
            >
                <EventButton label={'Generate generic.click'} />
            </TrackingChecker>

            <h2>{'Nested Provider with payload and no options.'}</h2>
            <TrackingProvider payload={{'actionlocation': 'top'}}>
                <TrackingChecker
                    payload={{'eventcategory': 'harness'}}
                    expected={{
                        event: 'generic.click',
                        payload: {
                            actionlocation: 'top',
                            eventcategory: 'harness'
                        },
                        options: {}}}
                >
                    <EventButton label={'Generate generic.click'} />
                </TrackingChecker>
            </TrackingProvider>

            <h2>{'Nested Provider with field overrides and no options.'}</h2>
            <TrackingProvider payload={{
                'actionlocation': 'left',
                'eventcategory': 'junk'}}
            >
                <TrackingChecker
                    payload={{
                        'actionlocation': 'top',
                        'eventcategory': 'harness'}}
                    expected={{
                        event: 'generic.click',
                        payload: {
                            actionlocation: 'top',
                            eventcategory: 'harness'
                        },
                        options: {}}}
                >
                    <EventButton label={'Generate generic.click'}/>
                </TrackingChecker>
            </TrackingProvider>

            <h2>{'Provider with payload and eventPayload with no options.'}</h2>
            <TrackingChecker
                payload={{
                    'actionlocation': 'left',
                    'eventcategory': 'harness'
                }} eventPayload={{
                    'generic.click': {
                        'eventlabel': 'custom'
                    },
                    'ignore.event': {
                        'display': 'no it should not'
                    }
                }}
                expected={{
                    event: 'generic.click',
                    payload: {
                        actionlocation: 'left',
                        eventcategory: 'harness',
                        eventlabel: 'custom'
                    },
                    options: {}}}
            >
                <EventButton label={'Generate generic.click'}/>
            </TrackingChecker>

            <h2>{'Nested Provider with payload and eventPayload with no options.'}</h2>
            <TrackingProvider
                payload={{
                    'actionlocation': 'left',
                    'eventcategory': 'harness',
                    'eventvalue': 'a value'
                }} eventPayload={{
                    'generic.click': {
                        'eventlabel': 'skip',
                        'highfrequency': 'false'
                    },
                    'ignore.event': {
                        'display': 'no it should not'
                    }
                }}
            >
                <TrackingChecker
                    payload={{
                        'actionlocation': 'top',
                        'eventcategory': 'test'
                    }}
                    eventPayload={{
                        'generic.click': {
                            'eventlabel': 'custom'
                        }
                    }}
                    expected={{
                        event: 'generic.click',
                        payload: {
                            actionlocation: 'top',
                            eventcategory: 'test',
                            eventvalue: 'a value',
                            eventlabel: 'custom',
                            highfrequency: 'false'
                        },
                        options: {}}}
                >
                    <EventButton label={'Generate generic.click'}/>
                </TrackingChecker>
            </TrackingProvider>

            <h2>{'Nested Provider with payload, eventPayload, options and eventOptions.'}</h2>
            <TrackingProvider payload={{
                'actionlocation': 'left',
                'eventcategory': 'harness',
                'eventvalue': 'a value'
            }} eventPayload={{
                'generic.click': {
                    'eventlabel': 'skip',
                    'highfrequency': 'false'
                },
                'ignore.event': {
                    'display': 'no it should not'
                }
            }} eventOptions={{
                'generic.click': {
                    'delayProcessing': '100'
                }
            }} options={{
                'delayProcessing': '200'
            }}
            >
                <TrackingChecker
                    payload={{
                        'actionlocation': 'top',
                        'eventcategory': 'test'
                    }}
                    eventPayload={{
                        'generic.click': {
                            'eventlabel': 'custom'
                        }
                    }}
                    eventOptions={{
                        'generic.click': {
                            'maxWaitTime': '300'
                        }
                    }}
                    options={{
                        'maxWaitTime': '400'
                    }}
                    expected={{
                        event: 'generic.click',
                        payload: {
                            actionlocation: 'top',
                            eventcategory: 'test',
                            eventvalue: 'a value',
                            eventlabel: 'custom',
                            highfrequency: 'false'
                        },
                        options: {
                            delayProcessing: '100',
                            maxWaitTime: '300'
                        }}}
                >
                    <EventButton label={'Generate generic.click'}/>
                </TrackingChecker>
            </TrackingProvider>

            <h2>{'Provider with component consuming multiple contexts with one of them being contextType.'}</h2>
            <TrackingChecker
                payload={{
                    'actionlocation': 'left',
                    'eventcategory': 'harness'
                }}
                expected={{
                    event: 'generic.click',
                    payload: {
                        actionlocation: 'left',
                        eventcategory: 'harness'
                    },
                    options: {}}}
            >
                <SecondContextChecker
                    value={SECONDCONTEXT}
                    expected={SECONDCONTEXT}
                >
                    <EventButtonMultipleContext label={'Generate generic.click'}/>
                </SecondContextChecker>
            </TrackingChecker>

            <h1>{'TrackingTrigger'}</h1>

            <h2>{'Trigger with no payload or options.'}</h2>
            <TrackingChecker
                expected={{
                    event: 'generic.click',
                    payload: {},
                    options: {}}}
            >
                <TrackingTrigger event={'generic.click'}/>
                <span>{'generic.click'}</span>
            </TrackingChecker>

            <h2>{'Trigger with payload and options for TrackingTrigger.'}</h2>
            <TrackingChecker
                expected={{
                    event: 'generic.click',
                    payload: {
                        'actionlocation': 'top',
                        'eventcategory': 'test'
                    },
                    options: {
                        'delayProcessing': '200'
                    }}}
            >
                <TrackingTrigger event={'generic.click'}
                    payload={{
                        'actionlocation': 'top',
                        'eventcategory': 'test'
                    }}
                    options={{
                        'delayProcessing': '200'
                    }}
                />
                <span>{'generic.click'}</span>
            </TrackingChecker>

            <h2>{'Trigger with payload and options for TrackingTrigger and TrackingProvider with payload and options.'}</h2>
            <TrackingChecker
                payload={{
                    'actionlocation': 'left',
                    'eventcategory': 'harness',
                    'eventvalue': 'a value'
                }}
                eventPayload={{
                    'generic.click': {
                        'eventlabel': 'skip',
                        'highfrequency': 'false'
                    },
                    'ignore.event': {
                        'display': 'no it should not'
                    }
                }}
                eventOptions={{
                    'generic.click': {
                        'delayProcessing': '100',
                        'maxWaitTime': '500'
                    }
                }}
                options={{
                    'delayProcessing': '200'
                }}
                expected={{
                    event: 'generic.click',
                    payload: {
                        'actionlocation': 'top',
                        'eventcategory': 'test',
                        'eventvalue': 'a value',
                        'eventlabel': 'skip',
                        'highfrequency': 'false'
                    },
                    options: {
                        'delayProcessing': '300',
                        'maxWaitTime': '500'
                    }}}
            >
                <TrackingTrigger event={'generic.click'}
                    payload={{
                        'actionlocation': 'top',
                        'eventcategory': 'test'
                    }}
                    options={{
                        'delayProcessing': '300'
                    }}
                />
                <span>{'generic.click'}</span>
            </TrackingChecker>

            <h2>{'Trigger with no provider should not cause hard failure.'}</h2>
            <TrackingTrigger event={'generic.click'}
                payload={{
                    'actionlocation': 'top',
                    'eventcategory': 'test'
                }}
                options={{
                    'delayProcessing': '200'
                }}
            />
        </div>
    );
}

ReactDOM.render(
    harness(),
    document.getElementById('content')
);
