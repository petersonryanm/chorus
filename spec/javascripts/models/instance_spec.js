describe("chorus.models.Instance", function() {
    beforeEach(function() {
        this.instance = fixtures.instance();
    });

    it("has a valid showUrl", function() {
        expect(this.instance.showUrl()).toBe("#/instances/" + this.instance.get('id'));
    });

    it("has a valid url", function() {
        expect(this.instance.url()).toBe("/edc/instance/" + this.instance.get('id'));
    });

    describe("#owner", function() {
        it("returns a user", function() {
            var owner = this.instance.owner();
            expect(owner.get("id")).toBe(this.instance.get("ownerId"));
            expect(owner.get("userName")).toBe("edcadmin");
            expect(owner.get("fullName")).toBe("EDC Admin");
        })
    });

    describe("#accountForUser", function() {
        beforeEach(function() {
            this.user = fixtures.user();
            this.account = this.instance.accountForUser(this.user);
        });

        it("returns an InstanceAccount", function() {
            expect(this.account).toBeA(chorus.models.InstanceAccount);
        });

        it("sets the instance id", function() {
            expect(this.account.get("instanceId")).toBe(this.instance.get("id"));
        });

        it("sets the user name based on the current user", function() {
            expect(this.account.get("userName")).toBe(this.user.get("userName"));
        });
    });

    describe("#accountForCurrentUser", function() {
        beforeEach(function() {
            this.currentUser = fixtures.user();
            setLoggedInUser(this.currentUser.attributes);
        });

        it("memoizes", function() {
            var account = this.instance.accountForCurrentUser();
            expect(account).toBe(this.instance.accountForCurrentUser());
        });

        context("when the account is destroyed", function() {
            it("un-memoizes the account", function() {
                var previousAccount = this.instance.accountForCurrentUser();
                previousAccount.trigger("destroy");

                var account = this.instance.accountForCurrentUser();
                expect(account).not.toBe(previousAccount);
            });

            it("triggers 'change' on the instance", function() {
                spyOnEvent(this.instance, 'change');
                this.instance.accountForCurrentUser().trigger("destroy");
                expect("change").toHaveBeenTriggeredOn(this.instance);
            });
        });
    });

    describe("#accounts", function() {
        beforeEach(function() {
            this.instanceAccounts = this.instance.accounts();
        })

        it("returns an InstanceAccountSet", function() {
            expect(this.instanceAccounts).toBeA(chorus.models.InstanceAccountSet)
        });

        it("sets the instance id", function() {
            expect(this.instanceAccounts.attributes.instanceId).toBe(this.instance.get('id'));
        });

        it("memoizes", function() {
            expect(this.instanceAccounts).toBe(this.instance.accounts());
        });
    });

    describe("#sharedAccount", function() {
        context("when the instance has a shared account", function() {
            beforeEach(function() {
                this.instance = fixtures.instanceWithSharedAccount();
            });

            it("returns a instanceAccount based on the dbUserName of the instance", function() {
                var sharedAccount = this.instance.sharedAccount();
                expect(sharedAccount).toBeA(chorus.models.InstanceAccount);
                expect(sharedAccount.get('dbUserName')).toBe(this.instance.get('sharedAccount').dbUserName);
                expect(sharedAccount.get('instanceId')).toBe(this.instance.get('id'));
            });

            it("is a model in the same instance's #accounts collection'", function() {
                var account = this.instance.sharedAccount();
                expect(account.collection).toBe(this.instance.accounts());
                expect(this.instance.accounts().first()).toBe(account);
            });

            it("memoizes", function() {
                var sharedAccount = this.instance.sharedAccount();
                expect(sharedAccount).toBe(this.instance.sharedAccount());
            });
        });

        context("when the instance does not have a shared account", function() {
            it("returns undefined", function() {
                expect(this.instance.sharedAccount()).toBeUndefined();
            })
        });
    });

    describe("validations", function() {
        context("when registering an existing instance", function() {
            beforeEach(function() {
                this.attrs = {
                    name : "foo",
                    provisionType : "register",
                    host : "gillette",
                    dbUserName : "dude",
                    dbPassword : "whatever",
                    port : "1234"
                }
            })

            it("returns true when the model is valid", function() {
                expect(this.instance.performValidation(this.attrs)).toBeTruthy();
            })

            _.each(["name", "host", "dbUserName", "dbPassword", "port"], function(attr) {
                it("requires " + attr, function() {
                    this.attrs[attr] = "";
                    expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                    expect(this.instance.errors[attr]).toBeTruthy();

                })
            });

            it("requires valid name", function(){
                this.attrs.name = "foo bar"
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.name).toBeTruthy();
            })

            it("requires valid port", function(){
                this.attrs.port = "z123"
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.port).toBeTruthy();
            })
        })

        context("when creating a new instance", function() {
            beforeEach(function() {
                this.attrs = {
                    name : "foo",
                    provisionType : "create",
                    size : "100000"
                }
            })

            it("requires size", function() {
                this.attrs.size = "";
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.size).toBeTruthy();
            })

            it("requires valid size", function(){
                this.attrs.size = "1234z"
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.size).toBeTruthy();
            })
        })
    })
});
