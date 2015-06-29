angular.module('mrlapp.service')
        .service('ServiceSvc', ['mrl', function (mrl) {

                var gateway = mrl.getGateway();
                var runtime = mrl.getRuntime();
                var platform = mrl.getPlatform();
                var registry = mrl.getRegistry();

                var isUndefinedOrNull = function (val) {
                    return angular.isUndefined(val) || val === null;
                };

                //START_Service Instances
                var serviceInstances = [];

                this.addServiceInstance = function (name, service) {
                    serviceInstances[name] = service;
                };

                this.getServiceInstance = function (name) {
                    if (isUndefinedOrNull(serviceInstances[name])) {
                        return null;
                    }
                    return serviceInstances[name];
                };

                this.removeServiceInstance = function (name) {
                    var index = serviceInstances.indexOf(name);
                    if (index != -1) {
                        serviceInstances.splice(index, 1);
                    }
                };
                //END_Service Instances

                //START_Services
                var guiData = {};
                var services = {};

                this.addService = function (name, temp) {
                    console.log('adding:', name, guiData);
                    if (isUndefinedOrNull(guiData[name])) {
                        console.log('adding#2:', name);
                        guiData[name] = {};
                        guiData[name].simpleName = temp.simpleName;
                        guiData[name].name = temp.name;
                        guiData[name].type = temp.simpleName.toLowerCase();
                        guiData[name].panelcount = 1;

                        var serviceexp = guiData[name];
                        var service = {
                            simpleName: serviceexp.simpleName,
                            name: serviceexp.name,
                            type: serviceexp.type,
                            panelcount: serviceexp.panelcount,
                            panelindex: 0
                        };
                        services[service.name + '_-_' + service.panelindex + '_-_'] = service;
                    }
                    console.log('adding#3:', name, guiData, services);
                };

                this.removeService = function (name) {
                    var panelcount = guiData[name].panelcount;
                    var index = guiData.indexOf(name);
                    if (index != -1) {
                        guiData.splice(index, 1);
                    }
                    for (var i = 0; i < panelcount; i++) {
                        var index = services.indexOf(name + '_-_' + i + '_-_');
                        if (index != -1) {
                            services.splice(index, 1);
                        }
                    }
                };

                this.getServices = function () {
                    return services;
                };

                this.notifyPanelCountChanged = function (name, oldcount, count) {
                    console.log('notifyPanelCountChanged', name, oldcount, count);
                    guiData[name].panelcount = count;
                    var diff = count - oldcount;

                    if (diff < 0) {
                        for (var i = oldcount - 1; i > count - 1; i++) {
                            var index = services.indexOf(name + '_-_' + i + '_-_');
                            if (index != -1) {
                                services.splice(index, 1);
                            }
                        }
                        for (var i = count - 1; i >= 0; i++) {
                            services[name + '_-_' + i + '_-_'].panelcount = count;
                        }
                    } else if (diff > 0) {
                        var serviceexp = guiData[name];
                        for (var i = oldcount; i < count; i++) {
                            var service = {
                                simpleName: serviceexp.simpleName,
                                name: serviceexp.name,
                                type: serviceexp.type,
                                panelcount: serviceexp.panelcount,
                                panelindex: i
                            };
                            services[service.name + '_-_' + service.panelindex + '_-_'] = service;
                        }
                    }
                };
                //END_Services
                
                _self = this;
                this.onMsg = function (msg) {
                    switch (msg.method) {
                        case 'onRegistered':
                            var newService = msg.data[0];
//                            this.addServiceInstance(newService.name, newService);
                            this.addService(newService.name, newService);
                            break;

                        case 'onReleased':
                            var name = msg.data[0];
                            this.removeServiceInstance(name);
                            this.removeService(name);
                            break;
                    }
                };
                mrl.subscribeToService(this.onMsg, runtime.name);
                
                for (var name in registry) {
                    if (registry.hasOwnProperty(name)) {
                        this.addService(name, registry[name]);
                    }
                }
            }]);