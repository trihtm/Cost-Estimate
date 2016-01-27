var costEstimateApp = angular.module('costEstimateApp', []);

costEstimateApp.factory('NumberHelper', function() {
    var NumberHelper = {};

    NumberHelper.format = function (number, decimals, dec_point, thousands_sep) {
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            toFixedFix = function (n, prec) {
                // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };

    return NumberHelper;
});

costEstimateApp.factory('CONSTANT', function () {
    return {
        WORKING_HOURS_PER_DAY: 8, // hours
        PRICE_PER_HOUR: 25, // dollars
        TAX: 0, // Percent
        PM_QA_COST: 0.3 // Percent
    };
});

costEstimateApp.factory('Accountant', [
    'CONSTANT',
    'FilledForm',
    function (
        CONSTANT,
        FilledForm
    ) {

    var Accountant = {};

    /** STEP && PROGRESS **/
    Accountant.getStep = function () {
        var productGroup = FilledForm.getProductGroup();
        var productTypes = FilledForm.getProductTypes();
        var productScale = FilledForm.getProductScale();
        var quality = FilledForm.getQuality();
        var step = 1;

        if (productGroup != null) {
            step++;
        }

        if (step == 2 &&
            productTypes.hasOwnProperty([productGroup]) &&
            Object.keys(FilledForm.getProductTypes()[productGroup]).length > 0) {
            step++;
        }

        if (step == 3 && productScale != null) {
            step++;
        }

        if (step == 4 && quality != null) {
            step++;
        }

        return step;
    };

    Accountant.getProgress = function () {
        return this.getStep() / 5 * 100;
    };

    /**************** CALCULATE MANDAYS && COSTS *********************/
    Accountant.getMandays = function () {
        var basePrice = 0.00;
        var subPrice = 0.00;

        var productGroup = FilledForm.getProductGroup();
        var productScale = FilledForm.getProductScale();
        var step = this.getStep();
        var config = costEstimateConfig;

        // PRODUCT GROUP & SCALE
        if (step >= 4) {
            basePrice = config[productGroup]['scales'][productScale]['mandays'];
        }

        var supportBoth = false;

        // PRODUCT TYPES
        if (step >= 4) {
            var productTypes = FilledForm.getProductTypes()[productGroup];

            for (var productTypeSlug in productTypes) {
                var status = productTypes[productTypeSlug];

                if (status) {
                    var multiple = config[productGroup]['types'][productTypeSlug]['multiplier'];

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
        if (step >= 4) {
            var data;
            var additionalFeatures = FilledForm.getAdditionalFeatures()[productGroup];

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
                        data = config[productGroup]['additional-features'][featureSlug];

                        if (typeof data.mandays != undefined) {
                            subPrice += data.mandays;
                        }
                    }
                }
            }

            // SNS
            if (typeof FilledForm.getExtraFeatures()[productGroup] != typeof undefined &&
                typeof FilledForm.getExtraFeatures()[productGroup]['sns-login'] != typeof undefined
            ) {
                data = config[productGroup]['additional-features']['sns-login'];

                var checkboxes = FilledForm.getExtraFeatures()[productGroup]['sns-login'];
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
            if (typeof FilledForm.getExtraFeatures()[productGroup] != typeof undefined &&
                typeof FilledForm.getExtraFeatures()[productGroup]['other-service-integration'] != typeof undefined
            ) {
                data = config[productGroup]['additional-features']['other-service-integration'];

                var quantityOtherSerivce = FilledForm.getExtraFeatures()[productGroup]['other-service-integration'];

                subPrice += quantityOtherSerivce * data['each'];
            }
        }

        // QUALITY
        if (step >= 5) {
            var quality = FilledForm.getQuality();

            subPrice *= config[productGroup]['quality'][quality]['multiplier'];
        }

        // Final total price.
        return subPrice;
    };

    Accountant.getDevelopmentCost = function () {
        return this.getMandays() * CONSTANT.WORKING_HOURS_PER_DAY * CONSTANT.PRICE_PER_HOUR;
    };

    Accountant.getQACost = function () {
        return this.getDevelopmentCost() * CONSTANT.PM_QA_COST;
    };

    Accountant.getVAT = function () {
        return this.getDevelopmentCost() * CONSTANT.TAX / 100;
    };

    Accountant.getTotalCost = function () {
        return this.getDevelopmentCost() + this.getQACost() + this.getVAT();
    };

    return Accountant;
}]);

costEstimateApp.factory('FilledForm', function () {
    var FilledForm = {};

    /** PRODUCT GROUP **/
    FilledForm.__productGroup = null;

    FilledForm.setProductGroup = function (productGroup) {
        // Set product group
        this.__productGroup = productGroup;
    };

    FilledForm.getProductGroup = function () {
        return this.__productGroup;
    };

    /** PRODUCT TYPE **/
    FilledForm.__productTypes = {};

    FilledForm.setProductType = function (productType) {
        if (this.isProductTypeChoosen(productType)) {
            delete this.getProductTypes()[this.getProductGroup()][productType];
        } else {
            if (!this.getProductTypes().hasOwnProperty([this.getProductGroup()])) {
                this.getProductTypes()[this.getProductGroup()] = {};
            }

            this.getProductTypes()[this.getProductGroup()][productType] = true;
        }
    };

    FilledForm.getProductTypes = function () {
        return this.__productTypes;
    };

    FilledForm.isProductTypeChoosen = function (productType) {
        if (this.getProductTypes().hasOwnProperty([this.getProductGroup()]) &&
            this.getProductTypes()[this.getProductGroup()].hasOwnProperty(productType)) {
            return this.getProductTypes()[this.getProductGroup()][productType];
        }

        return false;
    };

    /** PRODUCT SCALE **/
    FilledForm.__productScale = null;

    FilledForm.setProductScale = function (productScale) {
        // Set product scale
        this.__productScale = productScale;
    };

    FilledForm.getProductScale = function () {
        return this.__productScale;
    };

    /** ADDITIONAL FEATURES **/
    FilledForm.__additionalFeatures = {};

    FilledForm.getAdditionalFeatures = function () {
        return this.__additionalFeatures;
    };

    FilledForm.setFeature = function (feature) {
        if (this.isFeatureChoosen(feature)) {
            delete this.getAdditionalFeatures()[this.getProductGroup()][feature];
        } else {
            if (!this.getAdditionalFeatures().hasOwnProperty([this.getProductGroup()])) {
                this.getAdditionalFeatures()[this.getProductGroup()] = {};
            }

            this.getAdditionalFeatures()[this.getProductGroup()][feature] = true;
        }
    };

    FilledForm.isFeatureChoosen = function (feature) {
        if (this.getAdditionalFeatures().hasOwnProperty([this.getProductGroup()]) &&
            this.getAdditionalFeatures()[this.getProductGroup()].hasOwnProperty(feature)) {
            return this.getAdditionalFeatures()[this.getProductGroup()][feature];
        }

        return false;
    };

    FilledForm.__extraFeatures = {};

    FilledForm.getExtraFeatures = function () {
        return this.__extraFeatures;
    };

    FilledForm.otherServiceFeatureChange = function () {
        // Nothing
    };

    /** SET quality **/
    FilledForm.__quality = null;

    FilledForm.setQuality = function (quality) {
        this.__quality = quality;
    };

    FilledForm.getQuality = function () {
        return this.__quality;
    };

    return FilledForm;
});

costEstimateApp.controller('costEstimateController', [
    '$scope',
    'NumberHelper',
    'Accountant',
    'FilledForm',
    'CONSTANT',
    function (
        $scope,
        NumberHelper,
        Accountant,
        FilledForm,
        CONSTANT
    ) {

    var costEstimateController = this;

    // Setup Helper
    $scope.CONFIG = costEstimateConfig;
    $scope.NumberHelper = NumberHelper;
    $scope.CONSTANT = CONSTANT;
    $scope.FilledForm = FilledForm;
    $scope.Accountant = Accountant;

    /******************* SUBMIT *****************/
    costEstimateController.submit = function () {
        if (Accountant.getStep() >= 5) {
            alert('Submit success.');
        } else {
            alert('Please choose information.');
        }
    };
}]);