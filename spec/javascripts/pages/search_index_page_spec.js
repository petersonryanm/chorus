describe("chorus.pages.SearchIndexPage", function() {
    beforeEach(function() {
        this.query = "I'm a happy camper";
        this.model = new chorus.models.SearchResult({ query: this.query });
        this.page = new chorus.pages.SearchIndexPage(this.query);
    });

    it("fetches the search results for the given query", function() {
        expect(this.model).toHaveBeenFetched();
    });

    describe("when the search result fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.model, fixtures.searchResult({ query: "I'm a happy camper" }));
        });

        it("has breadcrumbs", function() {
            expect(this.page.$(".breadcrumbs li:eq(0)")).toContainTranslation('breadcrumbs.home');
            expect((this.page.$(".breadcrumbs li:eq(0) a")).attr("href")).toBe("#/");

            expect(this.page.$(".breadcrumbs li:eq(1) .slug")).toContainTranslation('breadcrumbs.search_results');
        });

        it("has the right title", function() {
            expect(this.page.$(".default_content_header h1")).toContainTranslation("search.index.title", {query: this.query});
        });

        describe("the workfile section", function() {
            beforeEach(function() {
                this.workfileLis = this.page.$(".workfile_list li");
            });

            it("shows a list of search results", function() {
                expect(this.workfileLis.length).toBeGreaterThan(0);
            });

            it("selects the first workfile by default", function() {
                expect(this.workfileLis.eq(0)).toHaveClass("selected");
            });

            describe("clicking on a workfile search result", function() {
                beforeEach(function() {
                    this.workfileLis.eq(1).trigger("click");
                });

                it("selects that workfile", function() {
                    expect(this.workfileLis.eq(1)).toHaveClass("selected");
                });

                it("shows that workfile in the sidebar", function() {
                    expect(this.page.sidebar.$(".fileName")).toHaveText("test.sql");
                });

                it("does not show the 'add a note' link in the sidebar", function() {
                    expect(this.page.sidebar.$("a[data-dialog='NotesNew']")).not.toExist()
                })

                it("sets the page model to that workfile", function() {
                    expect(this.page.model).toBe(this.page.mainContent.content.workfileList.collection.at(1));
                })
            });
        });

        describe("the workspace section", function() {
            beforeEach(function() {
                this.workspaceLis = this.page.$(".workspace_list li");
            });

            it("shows a list of search results", function() {
                expect(this.workspaceLis.length).toBeGreaterThan(0);
            });

            describe("clicking on a workspace search result", function() {
                beforeEach(function() {
                    this.workspaceLis.eq(1).trigger("click");
                });

                it("selects that workspace", function() {
                    expect(this.workspaceLis.eq(1)).toHaveClass("selected");
                });

                it("shows that workspace in the sidebar", function() {
                    expect(this.page.sidebar.$(".info .name")).toHaveText("other_ws");
                });

                it("show the 'add a note' link in the sidebar", function() {
                    expect(this.page.sidebar.$("a[data-dialog='NotesNew']")).toExist()
                })

                it("show the 'add an insight' link in the sidebar", function() {
                    expect(this.page.sidebar.$("a[data-dialog='InsightsNew']")).toExist()
                })

                it("sets the page model to that workfile", function() {
                    expect(this.page.model).toBe(this.page.mainContent.content.workspaceList.collection.at(1));
                })
            });
        });
    });
});
