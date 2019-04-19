const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SystemBellPlugin = require('system-bell-webpack-plugin');
const ModuleAnalyzerPlugin = require('webpack-module-analyzer-plugin');
const merge = require('webpack-merge');
const pkg = require('./package.json');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const TerserPlugin = require('terser-webpack-plugin');

// -- Directories------------------------------

const ROOT_PATH = __dirname;
const SRC_DIR = path.join(ROOT_PATH, 'src');
const LIB_DIR = path.join(ROOT_PATH, 'lib');
const PAGES_DIR = path.join(ROOT_PATH, 'pages');

const BROWSERS = [
    'Chrome >= 41',
    'Firefox >= 52',
    'Explorer >= 11',
    'iOS >= 9',
    'Safari >= 9'
];

// -- External Libraries -----------------------

// libs that should be provided by the host application
// and not packaged with the final build.
const externals = [
    'react',
    'react-dom',
    'classnames',
    'prop-types'
];

// -- Common configuration for all targets -------

const commonConfig = {
    resolve: {
        extensions: ['.js', '.less', '.json'],
        modules: ['node_modules']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules|tests/
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: [
                            autoprefixer({BROWSERS}),
                            cssnano({safe: true})
                        ]
                    }
                }, 'less-loader']
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=100000&mimetype=image/png'
            },
            {
                test: /\.jpg$/,
                loader: 'file-loader'
            },
            {
                test: /\.svg$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.eot$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.ttf$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                query: {
                    emitWarning: true,
                    quiet: true
                },
                exclude: /node_modules|tests/
            }
        ]
    },
    plugins: [
        new SystemBellPlugin()
    ]
};

// -- Local development config --------------------

// This sets up a webpack dev server.
// It is used for running the UI locally for the development harness.
const devConfig = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            title: `${pkg.name} - ${pkg.description}`,
            template: path.join(PAGES_DIR, 'index.html')
        })
    ],
    devServer: {
        port: 8000,
        host: '0.0.0.0',
        stats: 'errors-only'
    }
});

// -- Build final output files ----------------------
// Here we configure the final build when 'npm run build' is called.
// There are two output packages being produced, webpack is only
// producing the one for legacy UMD applications. Here's that config

const buildLibUmdConfig = merge(commonConfig, {
    mode: 'production',
    devtool: 'source-map',
    entry: path.join(SRC_DIR, 'index.js'),
    output: {
        path: path.join(LIB_DIR, 'umd'),
        filename: 'index.min.js',
        libraryTarget: 'umd'
    },
    externals,
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        // we want to parse ecma 8 code. However, we don't want it
                        // to apply any minfication steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false
                    },
                    mangle: true,
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true
                    },
                    safari10: true
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: true
            })
        ]
    },
    plugins: [
        new ModuleAnalyzerPlugin()
    ]
});

// -- Final configs for each npm run target -------------

// Here we associate the npm run target with a specific config. The targets,
// such as "start" when the "npm start" script command is run, are the keys
// in the following object.
const configs = {
    'start': merge(devConfig, {
        entry: path.join(PAGES_DIR, 'harness', 'harness.js')
    }),
    'start:silent': merge(devConfig, {
        entry: path.join(PAGES_DIR, 'harness', 'harness.js')
    }),
    'build:umd': buildLibUmdConfig
};

// Export the correct config for the npm run script currently processing
module.exports = configs[process.env.npm_lifecycle_event];
