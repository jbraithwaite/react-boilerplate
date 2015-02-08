# React Boilerplate

## Goals
- Server side React rendering
- In development, great debugging experience (live edit React components, fast compiles, simple gulp file, etc)
- In production, best practices for deployment (uglify, gzipped, etc)
- Skeleton for future React projects

## Installation 
```bash
# Install node modules
npm install

# Start development
npm run develop

# Build assets for production
npm run compile

# Start server in production
NODE_ENV=production node index.js
```
    
## Adding A 3rd party libraries

Why bloat our "application.js" file with third party plugins? If we move these files to `external.js`, this file can be more aggresively cached by the user's browser since it won't change as often as our "application.js" file will. This is a two step process. In `gulpfile.js`:

- Step one: Add the files to both `paths.minifyplugins.development` and `paths.minifyplugins.production`  (make sure to link to the minified version in production)
- Step two: Configure `webpack` to not bundle those modules. This can be done by editing `externals`
