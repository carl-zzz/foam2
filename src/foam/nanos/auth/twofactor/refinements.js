/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserTwoFactoryRefinement',
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      documentation: 'Two factor enabled flag',
      section: 'operationsInformation',
      order: 15,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'twoFactorSecret',
      documentation: 'Two factor secret',
      networkTransient: true,
      section: 'systemInformation',
      gridColumns: 6
    }
  ]
});
