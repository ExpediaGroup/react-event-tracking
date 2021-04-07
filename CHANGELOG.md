
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.0] - 2021-04-07
### Changed
- `mergeContextData` in `TrackingProvider` uses deep merge to merge payload and options context values.
- `trigger` function in `TrackingProvider` uses deep merge to merge context data with trigger data.