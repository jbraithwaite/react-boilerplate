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
gulp

# Build assets for production
gulp production

# Start server in production
NODE_ENV=production node index.js
```

## Adding A 3rd party plugin

```bash
npm install --save backbone
```

edit `gulpfile.js`, look for `minifyplugins`  and in the list of sources add:

```js
// in minifyplugins:development
'./node_modules/backbone/dist/backbone.js'
```

```js
// in minifyplugins:production
'./node_modules/backbone/dist/backbone.min.js'
```

In `global/server` add 

```js
global.Backbone = require('backbone');
```

After you run `gulp` (so that `minifyplugins` runs) you can use `Backbone` anywhere in the app (Server or Client) by just calling `Backbone`
