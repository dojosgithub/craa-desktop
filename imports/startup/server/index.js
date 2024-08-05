// Import server startup through a single index entry point

import '/imports/lib/server/aggregate.js'

// import './db-config.js'

import './startup.js'
import './fixtures.js'
import './register-api.js'
import './s3-config.js'
import './crontab.js'

import './register-v1-api.js'
