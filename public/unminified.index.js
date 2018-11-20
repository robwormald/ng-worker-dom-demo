var MainThread = (function (exports) {
    'use strict';

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var count = 0;
    var strings = new Map();
    /**
     * Return a string for the specified index.
     * @param index string index to retrieve.
     * @returns string in map for the index.
     */

    function get(index) {
      return strings.get(index) || '';
    }
    /**
     * Stores a string in mapping and returns the index of the location.
     * @param value string to store
     * @return location in map
     */

    function store(value) {
      strings.set(++count, value);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var count$1 = 2;
    var NODES;
    var BASE_ELEMENT;
    /**
     * Called when initializing a Worker, ensures the nodes in baseElement are known
     * for transmission into the Worker and future mutation events from the Worker.
     * @param baseElement Element that will be controlled by a Worker
     */

    function prepare(baseElement) {
      // The NODES map is populated with two default values pointing to baseElement.
      // These are [document, document.body] from the worker.
      NODES = new Map([[1, baseElement], [2, baseElement]]);
      BASE_ELEMENT = baseElement; // To ensure a lookup works correctly from baseElement
      // add an _index_ equal to the background thread document.body.

      baseElement._index_ = 2; // Lastly, it's important while initializing the document that we store
      // the default nodes present in the server rendered document.

      baseElement.childNodes.forEach(function (node) {
        return storeNodes(node);
      });
    }
    /**
     * Store the requested node and all of its children.
     * @param node node to store.
     */

    function storeNodes(node) {
      storeNode(node, ++count$1);
      node.childNodes.forEach(function (node) {
        return storeNodes(node);
      });
    }
    /**
     * Create a real DOM Node from a skeleton Object (`{ nodeType, nodeName, attributes, children, data }`)
     * @example <caption>Text node</caption>
     *   createNode({ nodeType:3, data:'foo' })
     * @example <caption>Element node</caption>
     *   createNode({ nodeType:1, nodeName:'div', attributes:[{ name:'a', value:'b' }], childNodes:[ ... ] })
     */


    function createNode(skeleton, sanitizer) {
      if (skeleton[0
      /* nodeType */
      ] === 3
      /* TEXT_NODE */
      ) {
          var _node = document.createTextNode(get(skeleton[5
          /* textContent */
          ]));

          storeNode(_node, skeleton[7
          /* _index_ */
          ]);
          return _node;
        }

      var namespace = skeleton[6
      /* namespaceURI */
      ] !== undefined ? get(skeleton[6
      /* namespaceURI */
      ]) : undefined;
      var nodeName = get(skeleton[1
      /* nodeName */
      ]);
      var node = namespace ? document.createElementNS(namespace, nodeName) : document.createElement(nodeName); // TODO(KB): Restore Properties
      // skeleton.properties.forEach(property => {
      //   node[`${property.name}`] = property.value;
      // });
      // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
      //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
      //     node.appendChild(createNode(childNode as TransferrableNode));
      //   }
      // });
      // If `node` is removed by the sanitizer, don't store it and return null.

      if (sanitizer && !sanitizer.sanitize(node)) {
        return null;
      }

      storeNode(node, skeleton[7
      /* _index_ */
      ]);
      return node;
    }
    /**
     * Returns the real DOM Element corresponding to a serialized Element object.
     * @param id
     * @return RenderableElement
     */

    function getNode(id) {
      var node = NODES.get(id);

      if (node && node.nodeName === 'BODY') {
        // If the node requested is the "BODY"
        // Then we return the base node this specific <amp-script> comes from.
        // This encapsulates each <amp-script> node.
        return BASE_ELEMENT;
      }

      return node;
    }
    /**
     * Establish link between DOM `node` and worker-generated identifier `id`.
     *
     * These _shouldn't_ collide between instances of <amp-script> since
     * each element creates it's own pool on both sides of the worker
     * communication bridge.
     * @param node
     * @param id
     */

    function storeNode(node, id) {
      node._index_ = id;
      NODES.set(id, node);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT = [8
    /* COMMENT_NODE */
    , 3
    /* TEXT_NODE */
    ];
    var initialStrings = [];
    var strings$1 = new Map();
    var count$2 = 0;

    function store$1(value) {
      if (strings$1.has(value)) {
        // Safe to cast since we verified the mapping contains the value
        return strings$1.get(value) - 1;
      }

      strings$1.set(value, ++count$2);
      initialStrings.push(value);
      return count$2 - 1;
    }

    function createHydrateableNode(element) {
      var _hydrated;

      var hydrated = (_hydrated = {}, _hydrated[7
      /* _index_ */
      ] = element._index_, _hydrated[8
      /* transferred */
      ] = 0, _hydrated[0
      /* nodeType */
      ] = element.nodeType, _hydrated[1
      /* nodeName */
      ] = store$1(element.nodeName), _hydrated[4
      /* childNodes */
      ] = [].map.call(element.childNodes || [], function (child) {
        return createHydrateableNode(child);
      }), _hydrated[2
      /* attributes */
      ] = [].map.call(element.attributes || [], function (attribute) {
        return [store$1(attribute.namespaceURI || 'null'), store$1(attribute.name), store$1(attribute.value)];
      }), _hydrated);

      if (element.namespaceURI !== null) {
        hydrated[6
        /* namespaceURI */
        ] = store$1(element.namespaceURI);
      }

      if (NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT.includes(element.nodeType) && element.textContent !== null) {
        hydrated[5
        /* textContent */
        ] = store$1(element.textContent);
      }

      return hydrated;
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Stored callbacks for the most recently created worker.
     * Note: This can be easily changed to a lookup table to support multiple workers.
     */

    var callbacks_; // TODO(KB): Fetch Polyfill for IE11.

    function createWorker(baseElement, workerDomURL, authorScriptURL, callbacks) {
      callbacks_ = callbacks;
      return Promise.all([fetch(workerDomURL).then(function (response) {
        return response.text();
      }), fetch(authorScriptURL).then(function (response) {
        return response.text();
      })]).then(function (_ref) {
        var workerScript = _ref[0],
            authorScript = _ref[1];
        // TODO(KB): Minify this output during build process.
        var keys = [];

        for (var key in document.body.style) {
          keys.push("'" + key + "'");
        }

        var hydratedNode = createHydrateableNode(baseElement);
        var code = "\n        'use strict';\n        " + workerScript + "\n        (function() {\n          var self = this;\n          var window = this;\n          var document = this.document;\n          var localStorage = this.localStorage;\n          var location = this.location;\n          var defaultView = document.defaultView;\n          var Node = defaultView.Node;\n          var Text = defaultView.Text;\n          var Element = defaultView.Element;\n          var SVGElement = defaultView.SVGElement;\n          var Document = defaultView.Document;\n          var Event = defaultView.Event;\n          var MutationObserver = defaultView.MutationObserver;\n\n          function addEventListener(type, handler) {\n            return document.addEventListener(type, handler);\n          }\n          function removeEventListener(type, handler) {\n            return document.removeEventListener(type, handler);\n          }\n          this.consumeInitialDOM(document, [" + initialStrings.map(function (string) {
          return "'" + string + "'";
        }).join(',') + "], " + JSON.stringify(hydratedNode) + ");\n          this.appendKeys([" + keys + "]);\n          document.observe();\n          " + authorScript + "\n        }).call(WorkerThread.workerDOM);\n//# sourceURL=" + encodeURI(authorScriptURL);
        return new Worker(URL.createObjectURL(new Blob([code])));
      }).catch(function (error) {
        return null;
      });
    }
    /**
     * @param worker
     * @param message
     */

    function messageToWorker(worker, message) {
      if (callbacks_ && callbacks_.onSendMessage) {
        callbacks_.onSendMessage(message);
      }

      worker.postMessage(message);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var KNOWN_LISTENERS = [];
    /**
     * Instead of a whitelist of elements that need their value tracked, use the existence
     * of a property called value to drive the decision.
     * @param node node to check if values should be tracked.
     * @return boolean if the node should have its value property tracked.
     */

    var shouldTrackChanges = function shouldTrackChanges(node) {
      return node && 'value' in node;
    };
    /**
     * When a node that has a value needing synced doesn't already have an event listener
     * listening for changed values, ensure the value is synced with a default listener.
     * @param worker whom to dispatch value toward.
     * @param node node to listen to value changes on.
     */


    var applyDefaultChangeListener = function applyDefaultChangeListener(worker, node) {
      shouldTrackChanges(node) && node.onchange === null && (node.onchange = function () {
        return fireValueChange(worker, node);
      });
    };
    /**
     * Tell the worker DOM what the value is for a Node.
     * @param worker whom to dispatch value toward.
     * @param node where to get the value from.
     */

    var fireValueChange = function fireValueChange(worker, node) {
      var _, _messageToWorker;

      messageToWorker(worker, (_messageToWorker = {}, _messageToWorker[9
      /* type */
      ] = 5, _messageToWorker[38
      /* sync */
      ] = (_ = {}, _[7
      /* _index_ */
      ] = node._index_, _[18
      /* value */
      ] = node.value, _), _messageToWorker));
    };
    /**
     * Register an event handler for dispatching events to worker thread
     * @param worker whom to dispatch events toward
     * @param _index_ node index the event comes from (used to dispatchEvent in worker thread).
     * @return eventHandler function consuming event and dispatching to worker thread
     */


    var eventHandler = function eventHandler(worker, _index_) {
      return function (event) {
        var _2, _3, _4, _messageToWorker2;

        if (shouldTrackChanges(event.currentTarget)) {
          fireValueChange(worker, event.currentTarget);
        }

        messageToWorker(worker, (_messageToWorker2 = {}, _messageToWorker2[9
        /* type */
        ] = 1, _messageToWorker2[37
        /* event */
        ] = (_4 = {}, _4[7
        /* _index_ */
        ] = _index_, _4[22
        /* bubbles */
        ] = event.bubbles, _4[23
        /* cancelable */
        ] = event.cancelable, _4[24
        /* cancelBubble */
        ] = event.cancelBubble, _4[25
        /* currentTarget */
        ] = (_2 = {}, _2[7
        /* _index_ */
        ] = event.currentTarget._index_, _2[8
        /* transferred */
        ] = 1, _2), _4[26
        /* defaultPrevented */
        ] = event.defaultPrevented, _4[27
        /* eventPhase */
        ] = event.eventPhase, _4[28
        /* isTrusted */
        ] = event.isTrusted, _4[29
        /* returnValue */
        ] = event.returnValue, _4[10
        /* target */
        ] = (_3 = {}, _3[7
        /* _index_ */
        ] = event.target._index_, _3[8
        /* transferred */
        ] = 1, _3), _4[30
        /* timeStamp */
        ] = event.timeStamp, _4[9
        /* type */
        ] = event.type, _4[32
        /* keyCode */
        ] = 'keyCode' in event ? event.keyCode : undefined, _4), _messageToWorker2));
      };
    };
    /**
     * Process commands transfered from worker thread to main thread.
     * @param nodesInstance nodes instance to execute commands against.
     * @param worker whom to dispatch events toward.
     * @param mutation mutation record containing commands to execute.
     */


    function process(worker, mutation) {
      var _index_ = mutation[10
      /* target */
      ];
      var target = getNode(_index_);
      (mutation[21
      /* removedEvents */
      ] || []).forEach(function (eventSub) {
        processListenerChange(worker, target, false, get(eventSub[9
        /* type */
        ]), eventSub[33
        /* index */
        ]);
      });
      (mutation[20
      /* addedEvents */
      ] || []).forEach(function (eventSub) {
        processListenerChange(worker, target, true, get(eventSub[9
        /* type */
        ]), eventSub[33
        /* index */
        ]);
      });
    }
    /**
     * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to
     * ensure that only a single 'change' event is attached to prevent sending values multiple times.
     * @param worker worker issuing listener changes
     * @param target node to change listeners on
     * @param addEvent is this an 'addEvent' or 'removeEvent' change
     * @param type event type requested to change
     * @param index number in the listeners array this event corresponds to.
     */

    function processListenerChange(worker, target, addEvent, type, index) {
      var changeEventSubscribed = target.onchange !== null;
      var shouldTrack = shouldTrackChanges(target);
      var isChangeEvent = type === 'change';

      if (addEvent) {
        if (isChangeEvent) {
          changeEventSubscribed = true;
          target.onchange = null;
        }

        target.addEventListener(type, KNOWN_LISTENERS[index] = eventHandler(worker, target._index_));
      } else {
        if (isChangeEvent) {
          changeEventSubscribed = false;
        }

        target.removeEventListener(type, KNOWN_LISTENERS[index]);
      }

      if (shouldTrack && !changeEventSubscribed) {
        applyDefaultChangeListener(worker, target);
      }
    }

    var _mutators;
    var MUTATION_QUEUE = [];
    var PENDING_MUTATIONS = false;
    var worker;
    function prepareMutate(passedWorker) {
      worker = passedWorker;
    }
    var mutators = (_mutators = {}, _mutators[2
    /* CHILD_LIST */
    ] = function _(mutation, target, sanitizer) {
      (mutation[12
      /* removedNodes */
      ] || []).forEach(function (node) {
        return getNode(node[7
        /* _index_ */
        ]).remove();
      });
      var addedNodes = mutation[11
      /* addedNodes */
      ];
      var nextSibling = mutation[14
      /* nextSibling */
      ];

      if (addedNodes) {
        addedNodes.forEach(function (node) {
          var newChild = null;
          newChild = getNode(node[7
          /* _index_ */
          ]);

          if (!newChild) {
            // Transferred nodes that are not stored were previously removed by the sanitizer.
            if (node[8
            /* transferred */
            ]) {
              return;
            } else {
              newChild = createNode(node, sanitizer);
            }
          }

          if (newChild) {
            target.insertBefore(newChild, nextSibling && getNode(nextSibling[7
            /* _index_ */
            ]) || null);
          }
        });
      }
    }, _mutators[0
    /* ATTRIBUTES */
    ] = function _(mutation, target, sanitizer) {
      var attributeName = mutation[15
      /* attributeName */
      ] !== undefined ? get(mutation[15
      /* attributeName */
      ]) : null;
      var value = mutation[18
      /* value */
      ] !== undefined ? get(mutation[18
      /* value */
      ]) : null;

      if (attributeName != null && value != null) {
        if (!sanitizer || sanitizer.validAttribute(target.nodeName, attributeName, value)) {
          target.setAttribute(attributeName, value);
        }
      }
    }, _mutators[1
    /* CHARACTER_DATA */
    ] = function _(mutation, target) {
      var value = mutation[18
      /* value */
      ];

      if (value) {
        // Sanitization not necessary for textContent.
        target.textContent = get(value);
      }
    }, _mutators[3
    /* PROPERTIES */
    ] = function _(mutation, target, sanitizer) {
      var propertyName = mutation[17
      /* propertyName */
      ] !== undefined ? get(mutation[17
      /* propertyName */
      ]) : null;
      var value = mutation[18
      /* value */
      ] !== undefined ? get(mutation[18
      /* value */
      ]) : null;

      if (propertyName && value) {
        if (!sanitizer || sanitizer.validProperty(target.nodeName, propertyName, value)) {
          target[propertyName] = value;
        }
      }
    }, _mutators[4
    /* COMMAND */
    ] = function _(mutation) {
      process(worker, mutation);
    }, _mutators);
    /**
     * Process MutationRecords from worker thread applying changes to the existing DOM.
     * @param nodes New nodes to add in the main thread with the incoming mutations.
     * @param mutations Changes to apply in both graph shape and content of Elements.
     * @param sanitizer Sanitizer to apply to content if needed.
     */

    function mutate(nodes, stringValues, mutations, sanitizer) {
      //mutations: TransferrableMutationRecord[]): void {
      // TODO(KB): Restore signature requiring lastMutationTime. (lastGestureTime: number, mutations: TransferrableMutationRecord[])
      // if (performance.now() || Date.now() - lastGestureTime > GESTURE_TO_MUTATION_THRESHOLD) {
      //   return;
      // }
      // this.lastGestureTime = lastGestureTime;
      stringValues.forEach(function (value) {
        return store(value);
      });
      nodes.forEach(function (node) {
        return createNode(node, sanitizer);
      });
      MUTATION_QUEUE = MUTATION_QUEUE.concat(mutations);

      if (!PENDING_MUTATIONS) {
        PENDING_MUTATIONS = true;
        requestAnimationFrame(function () {
          return syncFlush(sanitizer);
        });
      }
    }
    /**
     * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
     * mutations to apply in a single frame.
     *
     * Investigations in using asyncFlush to resolve are worth considering.
     */

    function syncFlush(sanitizer) {
      MUTATION_QUEUE.forEach(function (mutation) {
        mutators[mutation[9
        /* type */
        ]](mutation, getNode(mutation[10
        /* target */
        ]), sanitizer);
      });
      MUTATION_QUEUE = [];
      PENDING_MUTATIONS = false;
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var ALLOWABLE_MESSAGE_TYPES = [3
    /* MUTATE */
    , 2
    /* HYDRATE */
    ];
    function install(baseElement, authorURL, workerDOMUrl, workerCallbacks, sanitizer) {
      prepare(baseElement);
      createWorker(baseElement, workerDOMUrl, authorURL, workerCallbacks).then(function (worker) {
        if (worker === null) {
          return;
        }

        prepareMutate(worker);

        worker.onmessage = function (message) {
          var data = message.data;

          if (!ALLOWABLE_MESSAGE_TYPES.includes(data[9
          /* type */
          ])) {
            return;
          } // TODO(KB): Hydration has special rules limiting the types of allowed mutations.
          // Re-introduce Hydration and add a specialized handler.


          mutate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[34
          /* mutations */
          ], sanitizer); // Invoke callbacks after hydrate/mutate processing so strings etc. are stored.

          if (workerCallbacks && workerCallbacks.onReceiveMessage) {
            workerCallbacks.onReceiveMessage(message);
          }
        };
      });
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function upgradeElement(baseElement, workerDOMUrl) {
      var authorURL = baseElement.getAttribute('src');

      if (authorURL) {
        upgrade(baseElement, authorURL, workerDOMUrl);
      }
    }
    function upgrade(baseElement, authorURL, workerDOMUrl) {
      install(baseElement, authorURL, workerDOMUrl);
    }

    exports.upgradeElement = upgradeElement;
    exports.upgrade = upgrade;

    return exports;

}({}));
//# sourceMappingURL=unminified.index.js.map
