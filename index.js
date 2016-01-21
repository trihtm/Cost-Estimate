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

        if (this.getProductGroup() != null) {
            step = 2;

            if (this.__productTypes.hasOwnProperty([this.getProductGroup()]) &&
                Object.keys(this.__productTypes[this.getProductGroup()]).length > 0) {
                step = 3;

                if (this.getProductScale() != null) {
                    step = 4;

                    if (this.getQuality() != null) {
                        step = 5;
                    }
                }
            }
        }

        this.__step = step;
        this.setProgress(step / 5 * 100);
    };

    costEstimate.getStep = function () {
        return this.__step;
    };

    /** PRICE **/
    costEstimate.__subTotalPrice = 0;

    costEstimate.getSubPrice = function () {
        return this.__subTotalPrice;
    };

    costEstimate.getVAT = function () {
        return this.getSubPrice() * $scope.TAX / 100;
    };

    costEstimate.getTotalPrice = function () {
        return this.getSubPrice() + this.getVAT();
    };

    costEstimate.setSubPrice = function () {
        var basePrice = 0.00;
        var subPrice = 0.00;

        var productGroup = this.getProductGroup();
        var productScale = this.getProductScale();

        // PRODUCT GROUP & SCALE
        if (this.getStep() >= 4) {
            basePrice = this.config[productGroup]['scales'][productScale]['mandays'];
        }

        var supportBoth = false;

        // PRODUCT TYPES
        if (this.getStep() >= 4) {
            var productTypes = this.__productTypes[productGroup];

            for (var productTypeSlug in productTypes) {
                var status = productTypes[productTypeSlug];

                if (status) {
                    var multiple = this.config[productGroup]['types'][productTypeSlug]['multiplier'];

                    subPrice += basePrice * multiple;
                }
            }

            // Discount when make both pc & mobile version.
            if (typeof productTypes['pc'] != typeof undefined &&
                typeof productTypes['mobile'] != typeof undefined &&
                productTypes['pc'] && productTypes['mobile']) {
                subPrice = basePrice * 1.5;
                supportBoth = true;
            }
        }

        // ADDITIONAL FEATURES
        if (this.getStep() >= 4) {
            var data;
            var additionalFeatures = this.__additionalFeatures[productGroup];

            for (var featureSlug in additionalFeatures) {
                var status = additionalFeatures[featureSlug];

                if (status) {
                    if (featureSlug == 'design') {
                        subPrice += 5 + basePrice * 0.2;
                    } else if (featureSlug == 'responsive') {
                        if (!supportBoth) {
                            subPrice += basePrice * 0.5;
                        }
                    } else {
                        data = this.config[productGroup]['additional-features'][featureSlug];

                        if (typeof data.mandays != undefined) {
                            subPrice += data.mandays;
                        }
                    }
                }
            }

            // SNS
            if (typeof this.__extraFeatures[this.getProductGroup()] != typeof undefined &&
                typeof this.__extraFeatures[this.getProductGroup()]['sns-login'] != typeof undefined
            ) {
                data = this.config[productGroup]['additional-features']['sns-login'];

                var checkboxes = this.__extraFeatures[this.getProductGroup()]['sns-login'];
                var total = 0;

                for (var snsSlug in checkboxes) {
                    var status = checkboxes[snsSlug];

                    if (status) {
                        total ++;
                    }
                }

                subPrice += total * data['each'];
            }

            // Other service integration
            if (typeof this.__extraFeatures[this.getProductGroup()] != typeof undefined &&
                typeof this.__extraFeatures[this.getProductGroup()]['other-service-integration'] != typeof undefined
            ) {
                data = this.config[productGroup]['additional-features']['other-service-integration'];

                var quantityOtherSerivce = this.__extraFeatures[this.getProductGroup()]['other-service-integration'];

                subPrice += quantityOtherSerivce * data['each'];
            }
        }

        // QUALITY
        if (this.getStep() >= 5) {

            var quality = this.getQuality();
            subPrice *= this.config[productGroup]['quality'][quality]['multiplier'];
        }

        console.log(subPrice);
        // Final total price.
        this.__subTotalPrice = subPrice * $scope.WORKING_HOURS_PER_DAY * $scope.PRICE_PER_HOUR * $scope.PM_QA_COST;
    };

    /** PROGRESS **/
    costEstimate.__progress = 0;

    costEstimate.setProgress = function (progress) {
        this.__progress = progress;
    };

    costEstimate.getProgress = function () {
        return this.__progress;
    };

    /** PRODUCT GROUP **/
    costEstimate.__productGroup = null;

    costEstimate.setProductGroup = function (productGroup) {
        // Set product group
        this.__productGroup = productGroup;

        this.setStep();
        this.setSubPrice();
    };

    costEstimate.getProductGroup = function () {
        return this.__productGroup;
    };

    /** PRODUCT TYPE **/
    costEstimate.__productTypes = {};

    costEstimate.setProductType = function (productType) {
        if (this.isProductTypeChoosen(productType)) {
            delete this.__productTypes[this.getProductGroup()][productType];
        } else {
            if (!this.__productTypes.hasOwnProperty([this.getProductGroup()])) {
                this.__productTypes[this.getProductGroup()] = {};
            }

            this.__productTypes[this.getProductGroup()][productType] = true;
        }

        this.setStep();
        this.setSubPrice();
    };

    costEstimate.isProductTypeChoosen = function (productType) {
        if (this.__productTypes.hasOwnProperty([this.getProductGroup()]) &&
            this.__productTypes[this.getProductGroup()].hasOwnProperty(productType)) {
            return this.__productTypes[this.getProductGroup()][productType];
        }

        return false;
    };

    /** PRODUCT SCALE **/
    costEstimate.__productScale = null;

    costEstimate.setProductScale = function (productScale) {
        // Set product scale
        this.__productScale = productScale;

        this.setStep();
        this.setSubPrice();
    };

    costEstimate.getProductScale = function () {
        return this.__productScale;
    };

    /** ADDITIONAL FEATURES **/
    costEstimate.__additionalFeatures = {};

    costEstimate.setFeature = function (feature) {
        if (this.isFeatureChoosen(feature)) {
            delete this.__additionalFeatures[this.getProductGroup()][feature];
        } else {
            if (!this.__additionalFeatures.hasOwnProperty([this.getProductGroup()])) {
                this.__additionalFeatures[this.getProductGroup()] = {};
            }

            this.__additionalFeatures[this.getProductGroup()][feature] = true;
        }

        this.setStep();
        this.setSubPrice();
    };

    costEstimate.isFeatureChoosen = function (feature) {
        if (this.__additionalFeatures.hasOwnProperty([this.getProductGroup()]) &&
            this.__additionalFeatures[this.getProductGroup()].hasOwnProperty(feature)) {
            return this.__additionalFeatures[this.getProductGroup()][feature];
        }

        return false;
    };

    costEstimate.__extraFeatures = {};

    costEstimate.otherServiceFeatureChange = function () {
        this.setStep();
        this.setSubPrice();
    };

    /** SET quality **/
    costEstimate.__quality = null;

    costEstimate.setQuality = function (quality) {
        this.__quality = quality;

        this.setStep();
        this.setSubPrice();
    };

    costEstimate.getQuality = function () {
        return this.__quality;
    };
});