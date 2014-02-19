chorus.models.License = chorus.models.Base.extend({
    constructorName: "License",
    urlTemplate: "license",

    branding: function() {
        return this.get("branding");
    },

    fullSearchEnabled: function() {
        return this.get("fullSearchEnabled");
    },

    workflowEnabled: function() {
        return this.get("workflowEnabled");
    },

    limitWorkspaceMembership: function() {
        return this.get("limitWorkspaceMembership");
    },

    limitMilestones: function() {
        return this.get("limitMilestones");
    },

    limitJobs: function() {
        return this.get("limitJobs");
    },

    advisorNowEnabled: function() {
        return this.get("advisorNowEnabled");
    },

    homePage: function() {
        return this.get("homePage") || "Dashboard";
    },

    applicationKey: function() {
        var vendor = this.get("vendor");
        switch (vendor) {
            case "alpine":
                return "alpine_" + this.get("level");
            default:
                return vendor;
        }
    }
});
