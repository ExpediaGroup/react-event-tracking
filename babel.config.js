// Grab the env in the same fashion as Babel core
const env = process.env.BABEL_ENV || 'default';
const presetReact = require('@babel/preset-react');
const istanbul = require('babel-plugin-istanbul');
const BROWSERS = [
    'Chrome >= 41',
    'Firefox >= 52',
    'Explorer >= 11',
    'iOS >= 9',
    'Safari >= 9'
];

// Define shared configuration
const DEFAULT_PLUGINS = [
    ['@babel/plugin-proposal-class-properties', {'loose': true}],
    '@babel/plugin-transform-destructuring',
    ['@babel/plugin-proposal-object-rest-spread', {'loose': true}]
];
const PRESET_ENV_CONFIG = {
    'loose': true,
    'targets': {
        'browsers': BROWSERS
    }
};
const PRESET_ENV_CONFIG_MOD_FALSE = {
    ...PRESET_ENV_CONFIG,
    'modules': false
};
const TRANSFORM_IMPORT_CONFIG = {
    original: '^(.+?)\\.less$',
    replacement: '$1.css'
};

const environments = {
    'default': {
        'presets': [
            [require.resolve('@babel/preset-env'), PRESET_ENV_CONFIG],
            presetReact
        ],
        'plugins': DEFAULT_PLUGINS
    },
    'esm': {
        'presets': [
            [require.resolve('@babel/preset-env'), PRESET_ENV_CONFIG_MOD_FALSE],
            presetReact
        ],
        'plugins': [
            ...DEFAULT_PLUGINS,
            ['transform-rename-import', TRANSFORM_IMPORT_CONFIG]
        ]
    },
    'modern': {
        'presets': [
            [require.resolve('@babel/preset-env'), PRESET_ENV_CONFIG],
            presetReact
        ],
        'plugins': [
            ...DEFAULT_PLUGINS,
            ['transform-rename-import', TRANSFORM_IMPORT_CONFIG]
        ]
    },
    'umd': {
        'presets': [
            [require.resolve('@babel/preset-env'), PRESET_ENV_CONFIG_MOD_FALSE],
            presetReact
        ],
        'plugins': DEFAULT_PLUGINS
    },
    'test': {
        'presets': [
            [require.resolve('@babel/preset-env'), PRESET_ENV_CONFIG],
            presetReact
        ],
        'plugins': [
            istanbul,
            ...DEFAULT_PLUGINS
        ]
    }
};

const SHARED_CONFIG = environments[env];
SHARED_CONFIG.ignore = [
    '**/*.less'
];

module.exports = function(api) {
    // Only process .test.js files for the "test" environment, ignore in every
    // other environment.
    if (!api.env('test')) {
        SHARED_CONFIG.ignore.push('**/*.test.js');
    }

    return SHARED_CONFIG;
};
