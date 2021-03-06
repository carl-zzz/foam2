/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'ArgumentSwiftRefinement',
  refines: 'foam.core.Argument',
  flags: ['swift'],
  requires: [
    'foam.swift.Argument',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftLocalName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftExternalName',
      value: '_',
    },
    {
      class: 'String',
      name: 'swiftDefaultValue',
    },
    {
      class: 'StringArray',
      name: 'swiftAnnotations',
      preSet: function(_, n) {
        var i = n.indexOf('inout');
        if ( i != -1 ) {
          console.log('Warning: found "inout" in swiftAnnotations. Set swiftMutable instead.');
          n.splice(i, 1);
          this.swiftMutable = true;
        }
        return n;
      },
    },
    {
      class: 'Boolean',
      name: 'swiftMutable',
    },
    {
      class: 'foam.swift.SwiftTypeProperty',
      expression: function(type) {
        return foam.swift.toSwiftType(type, true);
      },
    },
  ],
  methods: [
    function toSwiftArg() {
      var arg = this.Argument.create({
        localName: this.swiftLocalName,
        externalName: this.swiftExternalName,
        type: this.swiftType,
        annotations: this.swiftAnnotations,
        mutable: this.swiftMutable,
      });
      if (this.swiftDefaultValue) arg.defaultValue = this.swiftDefaultValue;
      return arg;
    },
  ]
});
