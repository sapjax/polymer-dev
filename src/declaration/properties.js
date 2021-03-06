/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {

  // element api

  var properties = {
    inferObservers: function(prototype) {
      // called before prototype.observe is chained to inherited object
      var observe = prototype.observe, property;
      for (var n in prototype) {
        if (n.slice(-7) === 'Changed') {
          if (!observe) {
            observe  = (prototype.observe = {});
          }
          property = n.slice(0, -7)
          observe[property] = observe[property] || n;
        }
      }
    },
    explodeObservers: function(prototype) {
      // called before prototype.observe is chained to inherited object
      var o = prototype.observe;
      if (o) {
        var exploded = {};
        for (var n in o) {
          var names = n.split(' ');
          for (var i=0, ni; ni=names[i]; i++) {
            exploded[ni] = o[n];
          }
        }
        prototype.observe = exploded;
      }
    },
    optimizePropertyMaps: function(prototype) {
      if (prototype.observe) {
        // construct name list
        var a = prototype._observeNames = [];
        for (var n in prototype.observe) {
          var names = n.split(' ');
          for (var i=0, ni; ni=names[i]; i++) {
            a.push(ni);
          }
        }
      }
      if (prototype.publish) {
        // construct name list
        var a = prototype._publishNames = [];
        for (var n in prototype.publish) {
          a.push(n);
        }
      }
    },
    publishProperties: function(prototype, base) {
      // if we have any properties to publish
      var publish = prototype.publish;
      if (publish) {
        // transcribe `publish` entries onto own prototype
        this.requireProperties(publish, prototype, base);
        // construct map of lower-cased property names
        prototype._publishLC = this.lowerCaseMap(publish);
      }
    },
    // sync prototype to property descriptors; 
    // desriptor format contains default value and optionally a 
    // hint for reflecting the property to an attribute.
    // e.g. {foo: 5, bar: {value: true, reflect: true}}
    // reflect: {foo: true} is also supported
    // 
    requireProperties: function(propertyDescriptors, prototype, base) {
      // reflected properties
      prototype.reflect = prototype.reflect || {};
      // ensure a prototype value for each property
      // and update the property's reflect to attribute status 
      for (var n in propertyDescriptors) {
        var propertyDescriptor = propertyDescriptors[n];
        var reflects = this.reflectHintForDescriptor(propertyDescriptor);
        if (prototype.reflect[n] === undefined && reflects !== undefined) {
          prototype.reflect[n] = reflects;
        }
        if (prototype[n] === undefined) {
          prototype[n] = this.valueForDescriptor(propertyDescriptor); 
        }
      }
    },
    valueForDescriptor: function(propertyDescriptor) {
      var value = typeof propertyDescriptor === 'object' && 
          propertyDescriptor ? propertyDescriptor.value : propertyDescriptor;
      return value !== undefined ? value : null;
    },
    // returns the value of the descriptor's 'reflect' property or undefined
    reflectHintForDescriptor: function(propertyDescriptor) {
      if (typeof propertyDescriptor === 'object' &&
          propertyDescriptor && propertyDescriptor.reflect !== undefined) {
        return propertyDescriptor.reflect;
      }
    },
    lowerCaseMap: function(properties) {
      var map = {};
      for (var n in properties) {
        map[n.toLowerCase()] = n;
      }
      return map;
    },
    createPropertyAccessors: function(prototype) {
      var n$ = prototype._publishNames;
      if (n$ && n$.length) {
        for (var i=0, l=n$.length, n, fn; (i<l) && (n=n$[i]); i++) {
          Observer.createBindablePrototypeAccessor(prototype, n);
        }
      }
    }
  };

  // exports

  scope.api.declaration.properties = properties;

})(Polymer);
