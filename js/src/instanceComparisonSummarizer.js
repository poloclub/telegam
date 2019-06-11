(function () {
    summarizer = {};

    summarizer.instanceMap = {};
    summarizer.featureMap = {};

    summarizer.intercept = null;

    summarizer.globalSummaryMap = {
        "housing-gam-instance-data" : {
            "Linear-positive" : {
                "description" : "For <b>1 feature</b>, the final prediction increases when any feature value increases.",
                "features" : ["CHAS"]
            },
            "Linear-negative" : {
                "description" : "For <b>4 features</b>, the final prediction decreases when any feature value decreases.",
                "features" : ["INDUS","RAD","PTRATIO","LSTAT"]
            },
            "Non-linear" : {
                "description" : "For <b>8 features</b>, the final prediction is not proportional to a change in any feature value.",
                "features" : ["CRIM","ZN","NOX","RM","AGE","DIS","TAX","B"]
            },
            "Flat": {
                "description" : "",
                "features" : []
            }
        },
        "diamonds-gam-instance-data" : {
            "Linear-positive" : {
                "description" : "For <b>5 features</b>, the final prediction increases when any feature value increases.",
                "features" : ["carat","color","clarity","depth","y"]
            },
            "Linear-negative" : {
                "description" : "",
                "features" : []
            },
            "Non-linear" : {
                "description" : "For <b>2 features</b>, the final prediction is not proportional to a change in any feature value.",
                "features" : ["x","z"]
            },
            "Flat": {
                "description" : "For <b>2 features</b>, the final prediction remains constant when any feature value changes.",
                "features" : ["cut","table"]
            }
        },
        "red-wine-gam-instance-data" : {
            "Linear-positive" : {
                "description" : "For <b>2 features</b>, the final prediction increases when any feature value increases.",
                "features" : ["alcohol","residualSugar"]
            },
            "Linear-negative" : {
                "description" : "For <b>4 features</b>, the final prediction decreases when any feature value decreases.",
                "features" : ["volatileAcidity","chlorides","density","pH"]
            },
            "Non-linear" : {
                "description" : "For <b>5 features</b>, the final prediction is not proportional to a change in any feature value.",
                "features" : ["fixedAcidity","citricAcid","freeSulfurDioxide","totalSulfurDioxide","sulphates"]
            },
            "Flat" : {
                "description" : "",
                "features" : []
            }
        },
        "ames-housing-gam-instance-data" : {
            "Linear-positive" : {
                "description" : "For <b>9 features</b>, the final prediction increases when any feature value increases.",
                "features" : ["LotFrontage","LotArea","OverallQual","OverallCond","TotalBsmtSF","FirstFlrSF"
                    ,"SecondFlrSF","GarageCars","ThreeSsnPorch"]
            },
            "Linear-negative" : {
                "description" : "For <b>2 features</b>, the final prediction decreases when any feature value decreases.",
                "features" : ["KitchenAbvGr","EnclosedPorch"]
            },
            "Non-linear" : {
                "description" : "For <b>6 features</b>, the final prediction is not proportional to a change in any feature value.",
                "features" : ["GarageArea","GrLivArea","BsmtFinSFOne","WoodDeckSF","OpenPorchSF","PoolArea"]
            },
            "Flat" : {
                "description" : "For <b>18 features</b>, the final prediction remains constant when any feature value changes.",
                "features" : ["MSSubClass","YearRemodAdd","TotRmsAbvGrd","MasVnrArea","BsmtFinSFTwo","BsmtUnfSF",
                    "LowQualFinSF","BsmtFullBath","BsmtHalfBath","FullBath","HalfBath","BedroomAbvGr",
                    "Fireplaces","ScreenPorch","MiscVal","GarageYrBlt","MoSold","YrSold"]
            }
        }
    };


    summarizer.globalSummaryMap_old = {
        "ames-housing-gam-instance-data" : [
            {
                "description":"Not coded yet",
                "features" : []
            }
        ],
        "housing-gam-instance-data" : [
            {
                "description":"5/13 features (<b>CRIM</b>, <b>ZN</b>, <b>NOX</b>, <b>AGE</b>, <b>RAD</b>) have a varying trend in predictions",
                "features" : ["CRIM", "ZN", "NOX", "AGE", "RAD"]
            },
            {
                "description":"3/13 features (<b>CHAS</b>, <b>RM</b>, <b>B</b>) have an upward trend in predictions (i.e., the prediction increases with an increase in data values)",
                "features" : ["CHAS", "RM", "B"]
            },
            {
                "description":"5/13 features (<b>INDUS</b>, <b>DIS</b>, <b>TAX</b>, <b>PTRATIO</b>, <b>LSTAT</b>) have a downward trend in predictions (i.e., the prediction decreases with an increase in data values)",
                "features" : ["INDUS", "DIS", "TAX", "PTRATIO", "LSTAT"]
            }
        ],
        "diamonds-gam-instance-data" : [
            {
                "description":"6/9 features (<b>carat</b>, <b>cut</b>, <b>color</b>, <b>clarity</b>, <b>depth</b>, <b>y</b>) have a varying trend in predictions",
                "features" : ["carat","cut","color","clarity","depth","y"]
            },
            {
                "description":"2/9 features (<b>x</b>, <b>z</b>) have an upward trend in predictions (i.e., the prediction increases with an increase in data values)",
                "features" : ["x","z"]
            },
            {
                "description":"1/9 features (<b>table</b>) have a downward trend in predictions (i.e., the prediction decreases with an increase in data values)",
                "features" : ["table"]
            }
        ],
        "red-wine-gam-instance-data" : [
            {
                "description":"3/11 features (<b>residualSugar</b>,<b>freeSulfurDioxide</b>, <b>alcohol</b>) have a varying trend in predictions",
                "features" : ["residualSugar", "freeSulfurDioxide","alcohol"]
            },
            {
                "description":"4/11 features (<b>volatileAcidity</b>, <b>chlorides</b>, <b>density</b>, <b>pH</b>) have an upward trend in predictions (i.e., the prediction increases with an increase in data values)",
                "features" : ["volatileAcidity", "chlorides", "density", "pH"]
            },
            {
                "description":"4/11 features (<b>fixedAcidity</b>, <b>citricAcid</b>, <b>totalSulfurDioxide</b>, <b>sulphates</b>) have a downward trend in predictions (i.e., the prediction decreases with an increase in data values)",
                "features" : ["fixedAcidity", "citricAcid", "totalSulfurDioxide", "sulphates"]
            }
        ]
    };

    summarizer.instanceSummaryParams = {};
    summarizer.instanceSummaryParams.contributionThreshold = .2;
    summarizer.instanceSummaryParams.summaryDetailLevel = 1;

    summarizer.comparisonParams = {};
    summarizer.comparisonParams.totalPredictionSimilarityThreshold = .25;
    summarizer.comparisonParams.totalPredictionDifferenceThreshold = .75;
    summarizer.comparisonParams.featurePredictionThreshold = .25;
    summarizer.comparisonParams.featurePredictionCountThreshold = .5;
    summarizer.comparisonParams.summaryDetailLevel = 1;

    summarizer.init = function (data, intercept) {
        summarizer.instanceMap = {};
        summarizer.featureMap = {};
        for(let instanceObj of data){
            let predictionObjs = instanceObj['data'];
            let totalPrediction = intercept;

            summarizer.intercept = intercept;

            summarizer.instanceMap[instanceObj['id']] = instanceObj;

            for(let predictionObj of predictionObjs){
                let feature = predictionObj['name'];
                let predictedValue = +predictionObj['pdep'];
                if(feature in summarizer.featureMap){
                    summarizer.featureMap[feature]['values'].push(predictedValue);
                    if(summarizer.featureMap[feature]['min']>predictedValue){
                        summarizer.featureMap[feature]['min'] = predictedValue;
                    }
                    if(summarizer.featureMap[feature]['max']<predictedValue){
                        summarizer.featureMap[feature]['max'] = predictedValue;
                    }
                }else{
                    summarizer.featureMap[feature] = {};
                    summarizer.featureMap[feature]['values'] = [predictedValue];
                    summarizer.featureMap[feature]['min'] = predictedValue;
                    summarizer.featureMap[feature]['max'] = predictedValue;
                }
                totalPrediction += +(predictionObj['pdep']);
            }
            if('totalPrediction' in summarizer.featureMap){
                summarizer.featureMap['totalPrediction']['values'].push(totalPrediction);
                if(summarizer.featureMap['totalPrediction']['min']>totalPrediction){
                    summarizer.featureMap['totalPrediction']['min'] = totalPrediction;
                }
                if(summarizer.featureMap['totalPrediction']['max']<totalPrediction){
                    summarizer.featureMap['totalPrediction']['max'] = totalPrediction;
                }
            }else{
                summarizer.featureMap['totalPrediction'] = {};
                summarizer.featureMap['totalPrediction']['values'] = [totalPrediction];
                summarizer.featureMap['totalPrediction']['min'] = totalPrediction;
                summarizer.featureMap['totalPrediction']['max'] = totalPrediction;
            }

            summarizer.instanceMap[instanceObj['id']]['totalPrediction'] = totalPrediction;
        }
        for(let feature in summarizer.featureMap){
            let featureMinValue = summarizer.featureMap[feature]['min'];
            let featureMaxValue = summarizer.featureMap[feature]['max'];
            summarizer.featureMap[feature]['scale'] = d3.scaleLinear().domain([featureMinValue,featureMaxValue]).range([0,1]);
        }

        summarizer.featureCount = Object.keys(summarizer.featureMap).length-1;
    };


    summarizer.generateInstanceSummary = function(instanceObj) {
        let summaryObj = {}, instanceObjPredictionObjs = instanceObj['data'];
        let totalIndividualPredictions = 0;
        for(let i=0;i<instanceObjPredictionObjs.length;i++){
            totalIndividualPredictions += Math.abs(instanceObjPredictionObjs[i]['pdep']);
        }

        let featureContributionMap = {}, highlyContributingFeatures = [], highlyContributingFeaturesTotalContribution = 0;
        for(let i=0;i<instanceObjPredictionObjs.length;i++){
            featureContributionMap[instanceObjPredictionObjs[i]['name']] = Math.abs(instanceObjPredictionObjs[i]['pdep'])/totalIndividualPredictions;
            if(featureContributionMap[instanceObjPredictionObjs[i]['name']]>summarizer.instanceSummaryParams.contributionThreshold){
                highlyContributingFeatures.push(instanceObjPredictionObjs[i]['name']);
                highlyContributingFeaturesTotalContribution += featureContributionMap[instanceObjPredictionObjs[i]['name']];
            }
        }

        highlyContributingFeaturesTotalContribution = (highlyContributingFeaturesTotalContribution*100).toFixed(2);

        if(highlyContributingFeatures.length==0){
            summaryObj = {
                "highlyContributingFeatures":[],
                "highlyContributingFeaturesTotalContribution":0,
                "summarySentence":"<b>None</b> of the features individually have a notable impact on the prediction."
            }
        }else {
            summaryObj = {
                "highlyContributingFeatures":highlyContributingFeatures,
                "highlyContributingFeaturesTotalContribution":highlyContributingFeaturesTotalContribution
            };
            if(summarizer.instanceSummaryParams.summaryDetailLevel==1){
                summaryObj["summarySentence"]="<b>Some features</b> <b>have a notable impact</b> on the prediction.";
            }else if(summarizer.instanceSummaryParams.summaryDetailLevel==2){
                if(highlyContributingFeatures.length==1){
                    summaryObj["summarySentence"]="<b>1 feature</b> has a notable impact and <b>individually accounts for over "+summarizer.instanceSummaryParams.contributionThreshold*100+"%</b> of the prediction.";
                }else {
                    summaryObj["summarySentence"]= "<b>"+highlyContributingFeatures.length + " features</b> have a notable impact and <b>individually account for over "+summarizer.instanceSummaryParams.contributionThreshold*100+"%</b> of the prediction.";
                }
            }else if(summarizer.instanceSummaryParams.summaryDetailLevel==3){
                if(highlyContributingFeatures.length==1){
                    summaryObj["summarySentence"]="<b>1 feature</b> individually has a notable impact <b>accounting for " + highlyContributingFeaturesTotalContribution + "%</b> of the prediction.";
                }else {
                    summaryObj["summarySentence"]= "<b>"+highlyContributingFeatures.length + " features</b> individually have a notable impact and <b>account for a total of " + highlyContributingFeaturesTotalContribution + "%</b> of the prediction.";
                }
            }
        }
        return summaryObj;
    };

    summarizer.generateComparisonSummary = function (instanceObj1, instanceObj2, method) {
        let summaryObj;
        if(method=='quartiles'){

        }else {
            summaryObj = getComparisonSummaryUsingThresholds(instanceObj1,instanceObj2);
        }
        return summaryObj;
    };

    function getComparisonSummaryUsingThresholds(instanceObj1,instanceObj2){
        let summaryObj;
        let totalPredictionDifferenceStatus = 'MODERATE', totalPredictionRawDifference;

        let totalPredictionScale = summarizer.featureMap['totalPrediction']['scale'];
        let instanceObj1TotalPrediction = summarizer.instanceMap[instanceObj1.id]['totalPrediction'], instanceObj2TotalPrediction = summarizer.instanceMap[instanceObj2.id]['totalPrediction'];
        let totalPredictionDiff = totalPredictionScale(instanceObj1TotalPrediction) - totalPredictionScale(instanceObj2TotalPrediction);
        totalPredictionRawDifference = Math.abs(instanceObj1TotalPrediction-instanceObj2TotalPrediction);

        if(Math.abs(totalPredictionDiff)<=summarizer.comparisonParams.totalPredictionSimilarityThreshold){
            totalPredictionDifferenceStatus = 'SMALL';
        }else if(Math.abs(totalPredictionDiff)>=summarizer.comparisonParams.totalPredictionDifferenceThreshold){
            totalPredictionDifferenceStatus = 'LARGE';
        }

        let instanceObj1PredictionObjs = instanceObj1['data'], instanceObj2PredictionObjs = instanceObj2['data'];

        let featurePredictionDifferenceStatus, featurePredictionDifferenceObjs = [];
        for(let i in instanceObj1PredictionObjs){
            let instanceObj1PredictionObj = instanceObj1PredictionObjs[i];
            let instanceObj2PredictionObj = instanceObj2PredictionObjs[i];
            // console.log(instanceObj1PredictionObj['name'],instanceObj2PredictionObj['name']);

            let instanceObj1FeaturePrediction = instanceObj1PredictionObj['pdep'];
            let instanceObj2FeaturePrediction = instanceObj2PredictionObj['pdep'];

            let feature = instanceObj1PredictionObj['name'];

            if(feature!='totalPrediction'){
                let featureScale = summarizer.featureMap[feature]['scale'];
                let featurePredictionDiff = featureScale(instanceObj1FeaturePrediction) - featureScale(instanceObj2FeaturePrediction);

                if(Math.abs(featurePredictionDiff)>summarizer.comparisonParams.featurePredictionThreshold){
                    featurePredictionDifferenceObjs.push({
                        'name' : feature,
                        'diff' : Math.abs(instanceObj1FeaturePrediction-instanceObj2FeaturePrediction),
                        'diff_normalized' : Math.abs(featurePredictionDiff)
                    });
                }
            }
        }

        let totalPredictionDifferenceObj = {
            'totalPredictionDifferenceStatus' : totalPredictionDifferenceStatus,
            'totalPredictionRawDifference' : totalPredictionRawDifference,
            'instance1TotalPrediction': instanceObj1TotalPrediction,
            'instance2TotalPrediction': instanceObj2TotalPrediction
        };
        let featurePredictionDifferenceObj;

        if((featurePredictionDifferenceObjs.length/(summarizer.featureCount))<summarizer.comparisonParams.featurePredictionCountThreshold){ // -1 for totalPrediction
            if(featurePredictionDifferenceObjs.length==0){
                featurePredictionDifferenceObj = {
                    'featurePredictionDifferenceStatus': 'CONSISTENT_SIMILAR',
                    'featurePredictionDifferenceObjs' : featurePredictionDifferenceObjs
                }
            }else {
                featurePredictionDifferenceObj = {
                    'featurePredictionDifferenceStatus': 'VARIED',
                    'featurePredictionDifferenceObjs' : featurePredictionDifferenceObjs
                }
            }
            summaryObj = generateComparisonSummaryObj(totalPredictionDifferenceObj,featurePredictionDifferenceObj);
        }else{
            featurePredictionDifferenceObj = {
                'featurePredictionDifferenceStatus': 'CONSISTENT_DIFFERENT',
                'featurePredictionDifferenceObjs' : featurePredictionDifferenceObjs
            };
            summaryObj = generateComparisonSummaryObj(totalPredictionDifferenceObj,featurePredictionDifferenceObj);
        }
        return summaryObj;
    }

    function generateComparisonSummaryObj(totalPredictionDifferenceObj,featurePredictionDifferenceObj){
        let totalPredictionDifferenceStatus = totalPredictionDifferenceObj['totalPredictionDifferenceStatus'];
        let totalPredictionRawDifference = totalPredictionDifferenceObj['totalPredictionRawDifference'];

        let featurePredictionDifferenceStatus = featurePredictionDifferenceObj['featurePredictionDifferenceStatus'];
        let featurePredictionDifferenceObjs = featurePredictionDifferenceObj['featurePredictionDifferenceObjs'];

        let summary;

        if(totalPredictionDifferenceStatus=='SMALL'){
            if(featurePredictionDifferenceStatus=="CONSISTENT_SIMILAR"){
                if(summarizer.comparisonParams.summaryDetailLevel==1){
                    summary = "<b>Overall predictions are similar</b> with <b>all features contributing similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are similar</b> with <b>all " + (summarizer.featureCount) + " features contributing similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are similar</b> with <b>all " + (summarizer.featureCount) + " features contributing similarly</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="CONSISTENT_DIFFERENT"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions are similar</b> but <b>most features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are similar</b> but <b>over "+(summarizer.comparisonParams.featurePredictionCountThreshold*100).toFixed(2)+"% of the features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are similar</b> but <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" (i.e. over "+(summarizer.comparisonParams.featurePredictionCountThreshold*100).toFixed(2)+"%) features contribute differently</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="VARIED"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions are similar</b> but <b>some features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are similar</b> but <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are similar</b> but <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features (i.e. "+((featurePredictionDifferenceObjs.length/summarizer.featureCount)*100).toFixed(2)+"%) contribute differently</b> from both instances";
                }
            }
        }else if(totalPredictionDifferenceStatus=='MODERATE'){
            if(featurePredictionDifferenceStatus=="CONSISTENT_SIMILAR"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions vary</b> but <b>all features contribute similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions vary</b> but <b>all "+summarizer.featureCount+" features contribute similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" vary</b> but <b>all "+summarizer.featureCount+" features contribute similarly</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="CONSISTENT_DIFFERENT"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions vary</b> and <b>most features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions vary</b> and <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" vary</b> and <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features (i.e. over "+(summarizer.comparisonParams.featurePredictionCountThreshold*100).toFixed(2)+"%) contribute differently</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="VARIED"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions vary</b> potentially due to <b>some features contributing differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions vary</b> potentially due to <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features contributing differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" vary</b> potentially due to <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features (i.e. "+((featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length/summarizer.featureCount)*100).toFixed(2)+"%) contributing differently</b> from both instances";
                }
            }
        }else if(totalPredictionDifferenceStatus=='LARGE'){
            if(featurePredictionDifferenceStatus=="CONSISTENT_SIMILAR"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions are very different</b> but <b>all features contribute similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are very different</b> but <b>all "+summarizer.featureCount+" features contribute similarly</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are very different</b> but <b>all "+summarizer.featureCount+" features contribute similarly</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="CONSISTENT_DIFFERENT"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions are very different</b> with <b>most features contributing differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are very different</b> with <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features contributing differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are very different</b> with <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features (i.e. over "+(summarizer.comparisonParams.featurePredictionCountThreshold*100).toFixed(2)+"%) contributing differently</b> from both instances";
                }
            }else if(featurePredictionDifferenceStatus=="VARIED"){
                if(summarizer.comparisonParams.summaryDetailLevel==1) {
                    summary = "<b>Overall predictions are very different</b> potentially due to <b>some features that contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==2){
                    summary = "<b>Overall predictions are very different</b> potentially due to the <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features that contribute differently</b> from both instances";
                }else if(summarizer.comparisonParams.summaryDetailLevel==3){
                    summary = "<b>Overall predictions of "+totalPredictionDifferenceObj['instance1TotalPrediction'].toFixed(2)+" and "+totalPredictionDifferenceObj['instance2TotalPrediction'].toFixed(2)+" are very different</b> potentially due to the <b>"+featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length+" features (i.e. "+((featurePredictionDifferenceObj['featurePredictionDifferenceObjs'].length/summarizer.featureCount)*100)+"%) that contribute differently</b> from both instances";
                }
            }
        }

        let summaryObj = {
            "totalPredictionDifferenceStatus" : totalPredictionDifferenceStatus,
            "totalPredictionRawDifference" : totalPredictionRawDifference,
            "featurePredictionDifferenceStatus" : featurePredictionDifferenceStatus,
            "featurePredictionDifferenceObjs" : featurePredictionDifferenceObjs,
            "summarySentence" : summary
        };

        return summaryObj;
    }

})();