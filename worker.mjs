import route from './src/routing/api-routing.js';

export default {
  async fetch(request, env, ctx) {
    return route(request, env);
  },
};