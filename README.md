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

If we wanted to add backbone for example.

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

In the same `gulpfile.js` look for the task `react:compile` and add 

```js
externals: {
    "backbone": "Backbone",
    ...
}
