var costEstimateApp = angular.module('costEstimateApp', []);

costEstimateApp.controller('costEstimateController', function ($scope) {
    var costEstimate = this;

    // CONSTANTS
    $scope.WORKING_HOURS_PER_DAY = 8; // hours
    $scope.PRICE_PER_HOUR = 25; // dollars
    $scope.TAX = 10; // Percent
    $scope.PM_QA_COST = 1.3;

    costEstimate.config = costEstimateConfig;

    /** STEP **/
    costEstimate.__step = 1;

    costEstimate.setStep = function () {
        var step = 1;

        if (costEstimate.getProductGroup() != null) {
            step = 2;

            if (costEstimate.__productTypes.hasOwnProperty([costEstimate.getProductGroup()]) &&
                Object.keys(costEstimate.__productTypes[costEstimate.getProductGroup()]).length > 0) {
                step = 3;

                if (costEstimate.getProductScale() != null) {
                    step = 4;

                    if (costEstimate.getQuality() != null) {
                        step = 5;
                    }
                }
            }
        }

        costEstimate.__step = step;
        costEstimate.setProgress(step / 5 * 100);
    };

    costEstimate.getStep = function () {
        return costEstimate.__step;
    };

    /** PRICE **/
    costEstimate.__subTotalPrice = 0;

    costEstimate.getSubPrice = function () {
        return costEstimate.__subTotalPrice;
    };

    costEstimate.getVAT = function () {
        return costEstimate.getSubPrice() * $scope.TAX / 100;
    };

    costEstimate.getTotalPrice = function () {
        return costEstimate.getSubPrice() + costEstimate.getVAT();
    };

    costEstimate.setSubPrice = function () {
        var basePrice = 0.00;
        var subPrice = 0.00;

        var productGroup = costEstimate.getProductGroup();
        var productScale = costEstimate.getProductScale();

        // PRODUCT GROUP & SCALE
        if (costEstimate.getStep() >= 4) {
            basePrice = costEstimate.config[productGroup]['scales'][productScale]['mandays'];
        }

        // PRODUCT TYPES
        if (costEstimate.getStep() >= 4) {
            var productTypes = costEstimate.__productTypes[productGroup];

            for (var productTypeSlug in productTypes) {
                var status = productTypes[productTypeSlug];

                if (status) {

                }
            }
        }

        // ADDITIONAL FEATURES
        if (costEstimate.getStep() >= 4) {

        }

        subPrice = basePrice;

        // QUALITY
        if (costEstimate.getStep() >= 5) {

            var quality = costEstimate.getQuality();
            subPrice *= costEstimate.config[productGroup]['quality'][quality]['multiplier'];
        }

        // Final total price.
        costEstimate.__subTotalPrice = subPrice * $scope.WORKING_HOURS_PER_DAY * $scope.PRICE_PER_HOUR * $scope.PM_QA_COST;
    };

    /** PROGRESS **/
    costEstimate.__progress = 0;

    costEstimate.setProgress = function (progress) {
        costEstimate.__progress = progress;
    };

    costEstimate.getProgress = function () {
        return costEstimate.__progress;
    };

    /** PRODUCT GROUP **/
    costEstimate.__productGroup = null;

    costEstimate.setProductGroup = function (productGroup) {
        // Set product group
        costEstimate.__productGroup = productGroup;

        costEstimate.setStep();
        costEstimate.setSubPrice();
    };

    costEstimate.getProductGroup = function () {
        return costEstimate.__productGroup;
    };

    /** PRODUCT TYPE **/
    costEstimate.__productTypes = {};

    costEstimate.setProductType = function (productType) {
        if (costEstimate.isProductTypeChoosen(productType)) {
            delete costEstimate.__productTypes[costEstimate.getProductGroup()][productType];
        } else {
            if (!costEstimate.__productTypes.hasOwnProperty([costEstimate.getProductGroup()])) {
                costEstimate.__productTypes[costEstimate.getProductGroup()] = {};
            }

            costEstimate.__productTypes[costEstimate.getProductGroup()][productType] = true;
        }

        costEstimate.setStep();
        costEstimate.setSubPrice();
    };

    costEstimate.isProductTypeChoosen = function (productType) {
        if (costEstimate.__productTypes.hasOwnProperty([costEstimate.getProductGroup()]) &&
            costEstimate.__productTypes[costEstimate.getProductGroup()].hasOwnProperty(productType)) {
            return costEstimate.__productTypes[costEstimate.getProductGroup()][productType];
        }

        return false;
    };

    /** PRODUCT SCALE **/
    costEstimate.__productScale = null;

    costEstimate.setProductScale = function (productScale) {
        // Set product scale
        costEstimate.__productScale = productScale;

        costEstimate.setStep();
        costEstimate.setSubPrice();
    };

    costEstimate.getProductScale = function () {
        return costEstimate.__productScale;
    };

    /** ADDITIONAL FEATURES **/
    costEstimate.__additionalFeatures = {};

    costEstimate.setFeature = function (feature) {
        if (costEstimate.isFeatureChoosen(feature)) {
            delete costEstimate.__additionalFeatures[costEstimate.getProductGroup()][feature];
        } else {
            if (!costEstimate.__additionalFeatures.hasOwnProperty([costEstimate.getProductGroup()])) {
                costEstimate.__additionalFeatures[costEstimate.getProductGroup()] = {};
            }

            costEstimate.__additionalFeatures[costEstimate.getProductGroup()][feature] = true;
        }

        costEstimate.setStep();
        costEstimate.setSubPrice();
    };

    costEstimate.isFeatureChoosen = function (feature) {
        if (costEstimate.__additionalFeatures.hasOwnProperty([costEstimate.getProductGroup()]) &&
            costEstimate.__additionalFeatures[costEstimate.getProductGroup()].hasOwnProperty(feature)) {
            return costEstimate.__additionalFeatures[costEstimate.getProductGroup()][feature];
        }

        return false;
    };

    /** SET quality **/
    costEstimate.__quality = null;

    costEstimate.setQuality = function (quality) {
        costEstimate.__quality = quality;

        costEstimate.setStep();
        costEstimate.setSubPrice();
    };

    costEstimate.getQuality = function () {
        return costEstimate.__quality;
    };
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}