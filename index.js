var app = angular.module('costEstimateApp', []);

app.factory('NumberHelper', function() {
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

app.factory('CONSTANT', function () {
    return {
        WORKING_HOURS_PER_DAY: 8, // hours
        PRICE_PER_HOUR: 25, // dollars
        TAX: 0, // Percent
        PM_QA_COST: 0.3 // Percent
    };
});

app.factory('BaseCalculator', ['FilledForm', function (FilledForm) {
    var BaseCalculator = function () {
        this.__mandays = 0;
        this.__baseMandays = 0;
    };

    BaseCalculator.prototype.init = function () {
        this.__mandays = 0;
        this.__baseMandays =  0;
    };

    BaseCalculator.prototype.getMandays = function () {
        return this.__mandays;
    };

    BaseCalculator.prototype.calculateProductGroup = function () {
        var productGroup = FilledForm.getProductGroup();
        var productScale = FilledForm.getProductScale();

        this.__baseMandays = costEstimateConfig[productGroup]['scales'][productScale]['mandays'];
    };

    BaseCalculator.prototype.calculateProductTypes = function () {
        var productGroup = FilledForm.getProductGroup();
        var productTypes = FilledForm.getProductTypes()[productGroup];

        for (var productTypeSlug in productTypes) {
            var status = productTypes[productTypeSlug];

            if (status) {
                var multiple = costEstimateConfig[productGroup]['types'][productTypeSlug]['multiplier'];

                this.__mandays += this.__baseMandays * multiple;
            }
        }
    };

    BaseCalculator.prototype.calculateAdditionalFeatures = function () {
        var productGroup = FilledForm.getProductGroup();
        var additionalFeatures = FilledForm.getAdditionalFeatures()[productGroup];

        for (var featureSlug in additionalFeatures) {
            var status = additionalFeatures[featureSlug];

            if (status) {
                this.calculateFeature(featureSlug);
            }
        }
    };

    BaseCalculator.prototype.calculateFeature = function (featureSlug) {
        var productGroup = FilledForm.getProductGroup();
        var data = costEstimateConfig[productGroup]['additional-features'][featureSlug];

        if (typeof data.mandays != undefined) {
            this.__mandays += data.mandays;
        }
    };

    BaseCalculator.prototype.calculateQuality = function () {
        var quality = FilledForm.getQuality();
        var productGroup = FilledForm.getProductGroup();

        this.__mandays *= costEstimateConfig[productGroup]['quality'][quality]['multiplier'];
    };

    return BaseCalculator;
}]);

app.factory('DesktopAppCalculator',  ['BaseCalculator', 'FilledForm', function (BaseCalculator, FilledForm) {
    var DesktopAppCalculator = function () {
        BaseCalculator.apply(this, arguments);
    };

    DesktopAppCalculator.prototype = new BaseCalculator();

    DesktopAppCalculator.prototype.calculateAdditionalFeatures = function () {
        BaseCalculator.prototype.calculateAdditionalFeatures.apply(this, arguments);

        var data;
        var productGroup = FilledForm.getProductGroup();

        //SNS
        if (typeof FilledForm.getExtraFeatures()[productGroup] != typeof undefined &&
            typeof FilledForm.getExtraFeatures()[productGroup]['sns-login'] != typeof undefined
        ) {
            data = costEstimateConfig[productGroup]['additional-features']['sns-login'];

            var checkboxes = FilledForm.getExtraFeatures()[productGroup]['sns-login'];
            var total = 0;

            for (var snsSlug in checkboxes) {
                var status = checkboxes[snsSlug];

                if (status) {
                    total ++;
                }
            }

            this.__mandays += total * data['each'];
        }

        // Other service integration
        if (typeof FilledForm.getExtraFeatures()[productGroup] != typeof undefined &&
            typeof FilledForm.getExtraFeatures()[productGroup]['other-service-integration'] != typeof undefined
        ) {
            data = costEstimateConfig[productGroup]['additional-features']['other-service-integration'];

            var quantityOtherSerivce = FilledForm.getExtraFeatures()[productGroup]['other-service-integration'];

            this.__mandays += quantityOtherSerivce * data['each'];
        }
    };

    return DesktopAppCalculator;
}]);

app.factory('WebAppCalculator',  ['DesktopAppCalculator', 'FilledForm', function (DesktopAppCalculator, FilledForm) {
    var __supportBoth = false;

    var WebAppCalculator = function () {
        DesktopAppCalculator.apply(this, arguments);
    };

    WebAppCalculator.prototype = new DesktopAppCalculator();

    WebAppCalculator.prototype.calculateProductTypes = function () {
        DesktopAppCalculator.prototype.calculateProductTypes.apply(this, arguments);

        //Discount when make both pc & mobile version.
        var productGroup = FilledForm.getProductGroup();
        var productTypes = FilledForm.getProductTypes()[productGroup];

        if (typeof productTypes['pc'] != typeof undefined &&
            typeof productTypes['mobile'] != typeof undefined &&
            productTypes['pc'] && productTypes['mobile']) {

            this.__mandays = this.__baseMandays * 1.5;

            __supportBoth = true;
        } else {
            __supportBoth = false;
        }
    };

    WebAppCalculator.prototype.calculateFeature = function (featureSlug) {
        if (featureSlug == 'design') {
            this.__mandays += 5 + this.__baseMandays * 0.2;
        } else if (featureSlug == 'responsive') {
            if (!__supportBoth) {
                this.__mandays += this.__baseMandays * 0.5;
            }
        } else {
            DesktopAppCalculator.prototype.calculateFeature.apply(this, arguments);
        }
    };

    return WebAppCalculator;
}]);

app.factory('CalculatorFactory', [
    'BaseCalculator',
    'FilledForm',
    'DesktopAppCalculator',
    'WebAppCalculator',
    function (BaseCalculator, FilledForm, DesktopAppCalculator, WebAppCalculator) {

    var CalculatorFactory = {};

    CalculatorFactory.getInstance = function () {

        var Calculator;

        switch (FilledForm.getProductGroup()) {
            case 'desktop-app':
                Calculator = new DesktopAppCalculator;
                break;

            case 'mobile-app':
                Calculator = new DesktopAppCalculator;
                break;

            case 'static-website':
                Calculator = new WebAppCalculator;
                break;

            case 'web-app':
                Calculator = new WebAppCalculator;
                break;
        }

        if (!Calculator) {
            return null;
        }

        Calculator.init();

        return Calculator;
    };

    return CalculatorFactory;
}]);

app.factory('Accountant', [
    'CONSTANT',
    'FilledForm',
    'CalculatorFactory',
    function (
        CONSTANT,
        FilledForm,
        CalculatorFactory
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
            var step = this.getStep();

            if (step < 4) {
                return 0;
            }

            var Calculator = CalculatorFactory.getInstance();

            if (step >= 4) {
                Calculator.calculateProductGroup();
                Calculator.calculateProductTypes();
                Calculator.calculateAdditionalFeatures();
            }

            if (step >= 5) {
                Calculator.calculateQuality();
            }

            return Calculator.getMandays();
        };

        Accountant.getRequiredTime = function () {
            return Accountant.getMandays() * CONSTANT.WORKING_HOURS_PER_DAY;
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

app.factory('FilledForm', function () {
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

app.controller('costEstimateController', [
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