/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'SUGAR',

  documentation: 'SUGAR : Service Unified GAteway Relay - Perform non-DAO operations against a web service',

  tableColumns: [
    'id',
    'serviceKey',
    'method'
  ],

  requires: [
    'foam.nanos.dig.Argument'
  ],

  css: `
    .property-argumentInfo button {
      display: none;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 40
    },
    {
      class: 'String',
      name: 'serviceKey',
      label: 'Service',
      documentation: 'non DAOs list as service',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.AND(E.EQ(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'), false), E.EQ(foam.nanos.boot.NSpec.SERVE, true)))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      },
      postSet: function() {
        var service = this.__context__[this.serviceKey];

        if ( ! service ) return;

        if ( ! service.cls_.getAxiomByName('delegate') ) {
          this.interfaceName = "";
          this.argumentInfo = null;
          this.currentMethod = "";

          return;
        }
        var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

        if ( ! of ) return;

        this.interfaceName = of.id.toString();
        var methods = of.getOwnAxiomsByClass(foam.core.Method);
        //var methodName = methods.map(function(m) { return m.name; }).sort();

        var filteredMethod =
          methods.filter(function(fm) {
            for ( var j = 0 ; j < fm.args.length ; j++ ) {
               if ( fm.args[j].javaType.toString() == "foam.core.X" ) {
                  return false;
               }
               return true;
             }
             //return true;
          }).map(function(m) { return m.name; }).sort();

        if ( filteredMethod.length > 0 ) {
            methods.find((item) => {
              if ( item.name == filteredMethod[0] ) {
                this.currentMethod = item.name;
                this.argumentInfo = item.args;
              }
            });
        } else { // if the service doesn't have a filtered method, the following should be empty
          this.argumentInfo = null;
          this.currentMethod = "";
        }
      }
    },
    {
      class: 'String',
      name: 'method',
      label: 'Method',
      documentation: 'the methods list of the picked service key',
      view: function(_, X) {
        return X.data.slot(function(serviceKey) {
          var service = this.__context__[serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);
          //var methodNames = methods.map(function(m) { return m.name; }).sort();

          var filteredMethod =
            methods.filter(function(fm) {
              for ( var j = 0 ; j < fm.args.length ; j++ ) {
                 if ( fm.args[j].javaType == "foam.core.X" ) {
                    return false;
                 }
                 return true;
              }
            }).map(function(m) { return m.name; }).sort();

          return foam.u2.view.ChoiceView.create({choices: filteredMethod, data$: this.method$});
        });
      },
      postSet: function(old, nu) {
        if ( old != nu ) {
          var data = "";
          var service = this.__context__[this.serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);

          methods.find((item) => {
            if ( item.name == this.method ) {
              this.currentMethod = item.name;

              if ( item.args.length > 0 )
                this.argumentInfo = item.args;
              else this.argumentInfo = "";
            }
          });
       }
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.dig.Argument',
      name: 'argumentInfo',
      documentation: 'Set the arguments Info of the method',
      postSet: function() {
        var self = this;

        for ( var j = 0 ; j < this.argumentInfo.length ; j++ ) {
          this.argumentInfo[j].sub(function(argInfo) {
            self.flag = !self.flag;
          });

          if ( this.argumentInfo[j].objectType ) {
            this.argumentInfo[j].objectType.sub(function(ot) {
               self.objFlag = !self.objFlag;
            });
          }
        }
      }
    },
    {
      class: 'String',
      name: 'interfaceName',
      documentation: 'service class name',
      displayWidth: 60,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'flag',
      documentation: 'to give a change event for argumentInfo',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'objFlag',
      documentation: 'to give a change event for Object argumentInfo',
      hidden: true
    },
    {
      class: 'String',
      name: 'currentMethod',
      documentation: 'to set a current method for URL',
      hidden: true
    },
    {
      class: 'URL',
      // TODO: appears not to work if named 'url', find out why.
      name: 'sugarURL',
      label: 'URL',
      displayWidth: 120,
      documentation: 'dynamic URL according to picking service, method, parameters against web agent',
      view: 'foam.nanos.dig.LinkView',
      setter: function() {}, // Prevent from ever getting set
      expression: function(serviceKey, method, interfaceName, argumentInfo, flag, currentMethod, objFlag) {
        var query = false;
        var url = "/service/sugar";

        if ( serviceKey ) {
          url += query ? "&" : "?";
          query = true;
          url += "service=" + serviceKey;
        }
        if ( interfaceName ) {
          url += query ? "&" : "?";
          query = true;
          url += "interfaceName=" + interfaceName;
        }
        if ( currentMethod ) {
          url += query ? "&" : "?";
          query = true;
          url += "method=" + currentMethod;
        }

        for ( var k = 0 ; k < argumentInfo.length ; k++ ) {
          query = true;

          if ( argumentInfo[k].value != "" ) {
            url += query ? "&" : "?";
            url += argumentInfo[k].name + "=" + argumentInfo[k].value;
          }

          if ( argumentInfo[k].objectType ) {
            var javaType_ = argumentInfo[k].javaType;
            var prop = foam.lookup(javaType_).getAxiomsByClass(foam.core.Property);
            url += "&" + argumentInfo[k].name + "=" + argumentInfo[k].name + "&";

            for ( var i = 0 ; i < prop.length ; i++ ) {
              if ( argumentInfo[k].objectType.instance_[prop[i].name] ) {
                url += query ? "&" : "?";
                query = true;

                url += prop[i].name + "=" + argumentInfo[k].objectType.instance_[prop[i].name];
              }
            }
          }
        }

        return encodeURI(url);
      }
    }
  ]
});