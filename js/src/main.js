(function () {
    main = {};

    let globalVars = {};
    globalVars.interceptMap = {
        "ames-housing-gam-instance-data" : 180193.3833448762,
        "housing-gam-instance-data" : 16.51863632806001,
        "diamonds-gam-instance-data" : 10465.523403663534,
        "red-wine-gam-instance-data" : 3.597233087564209
    };
    globalVars.instanceMap = {};
    globalVars.baseInstanceId = '';
    globalVars.comparedInstanceId = '';
    globalVars.baseInstanceFeatureOrdering = undefined;

    globalVars.baseInstanceChartYScaleDomainMax = undefined;
    globalVars.comparedInstanceChartYScaleDomainMax = undefined;

    globalVars.globalFeatureDataMap = {};

    globalVars.baseInstanceTooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            let HTMLStr = "";
            HTMLStr += "<span style='color: #dddddd'>" + d['name'] + ": </span><strong>" + d['X'] + "</strong><br>";
            if(d['pdep']<0){
                HTMLStr += "<span style='color: #dddddd'>Contribution: </span>" + "<span style='color: #E57373'><strong>" + d['pdep'].toFixed(2) +"</strong></span>";
            }else {
                HTMLStr += "<span style='color: #dddddd'>Contribution: </span>" + "<span style='color: #81C784'><strong>" + d['pdep'].toFixed(2) +"</strong></span>";
            }
            return HTMLStr;
        });

    globalVars.comparedInstanceTooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            let HTMLStr = "";
            HTMLStr += "<span style='color: #dddddd'>" + d['name'] + ": </span><strong>" + d['X'] + "</strong><br>";
            if(d['pdep']<0){
                HTMLStr += "<span style='color: #dddddd'>Contribution: </span>" + "<span style='color: #E57373'><strong>" + d['pdep'].toFixed(2) +"</strong></span>";
            }else {
                HTMLStr += "<span style='color: #dddddd'>Contribution: </span>" + "<span style='color: #81C784'><strong>" + d['pdep'].toFixed(2) +"</strong></span>";
            }
            return HTMLStr;
        });

    globalVars.visWidth = 560;
    globalVars.visHeight = 250;

    globalVars.modelMinPrediction = undefined;
    globalVars.modelMaxPrediction = undefined;

    d3.json("data/housing-gam-instance-data.json",function (error, data) {
        for(let instanceObj of data){
            globalVars.instanceMap[instanceObj.id] = instanceObj;
            let featureData = instanceObj['data'];
            for(let featureDataObj of featureData){
                let feature = featureDataObj['name'];

                if(globalVars.modelMinPrediction==undefined){
                    globalVars.modelMinPrediction = featureDataObj['pdep'];
                }else if(globalVars.modelMinPrediction>featureDataObj['pdep']){
                    globalVars.modelMinPrediction = featureDataObj['pdep'];
                }

                if(globalVars.modelMaxPrediction==undefined){
                    globalVars.modelMaxPrediction = featureDataObj['pdep'];
                }else if(globalVars.modelMaxPrediction<featureDataObj['pdep']){
                    globalVars.modelMaxPrediction = featureDataObj['pdep'];
                }

                if(feature in globalVars.globalFeatureDataMap){
                    globalVars.globalFeatureDataMap[feature].push({
                        'featureVal' : featureDataObj['X'],
                        'prediction' : featureDataObj['pdep']
                    });
                }else {
                    globalVars.globalFeatureDataMap[feature] = [{
                        'featureVal' : featureDataObj['X'],
                        'prediction' : featureDataObj['pdep']
                    }];
                }
            }
        }
        globalVars.intercept = globalVars.interceptMap['housing-gam-instance-data'];
        summarizer.init(data,globalVars.intercept);
        initScreen();
        updateGlobalModelSummary("housing-gam-instance-data");
    });

    let singleChartSummaryContributionThresholdSlider = document.getElementById("contribution-threshold-slider");
    noUiSlider.create(singleChartSummaryContributionThresholdSlider, {
        start: [20],
        step: 1,
        range: {
            'min': [0],
            'max': [100]
        },
        tooltips: [wNumb({suffix: ' %'})]
    });
    singleChartSummaryContributionThresholdSlider.noUiSlider.on('slide', function (values) {
        summarizer.instanceSummaryParams.contributionThreshold = +(values[0]/100).toFixed(2);

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!=''){
            updateBaseInstanceSummary();
        }
        if(comparedInstanceId!=''){
            updateComparedInstanceSummary();
        }
    });


    let totalPredictionMinThresholdSlider = document.getElementById("total-prediction-min-threshold-slider");
    noUiSlider.create(totalPredictionMinThresholdSlider, {
        start: [.25],
        step: .01,
        range: {
            'min': [0],
            'max': [1]
        },
        tooltips: [true]
    });

    totalPredictionMinThresholdSlider.noUiSlider.on('slide', function (values) {
        summarizer.comparisonParams.totalPredictionSimilarityThreshold = +values[0];

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!='' && comparedInstanceId!=''){
            $("#instanceComparisonSummary").html('');
            updateComparisonSummary();
        }
    });

    let totalPredictionMaxThresholdSlider = document.getElementById("total-prediction-max-threshold-slider");
    noUiSlider.create(totalPredictionMaxThresholdSlider, {
        start: [.75],
        step: .01,
        range: {
            'min': [0],
            'max': [1]
        },
        tooltips: [true]
    });
    totalPredictionMaxThresholdSlider.noUiSlider.on('slide', function (values) {
        summarizer.comparisonParams.totalPredictionDifferenceThreshold = +values[0];

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!='' && comparedInstanceId!=''){
            $("#instanceComparisonSummary").html('');
            updateComparisonSummary();
        }
    });

    let featurePredictionThresholdSlider = document.getElementById("feature-prediction-threshold-slider");
    noUiSlider.create(featurePredictionThresholdSlider, {
        start: [.25],
        step: .01,
        range: {
            'min': [0],
            'max': [1]
        },
        tooltips: [true]
    });
    featurePredictionThresholdSlider.noUiSlider.on('slide', function (values) {
        summarizer.comparisonParams.featurePredictionThreshold = +values[0];

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!='' && comparedInstanceId!=''){
            $("#instanceComparisonSummary").html('');
            updateComparisonSummary();
        }
    });

    let featurePredictionCountThresholdSlider = document.getElementById("feature-prediction-count-threshold-slider");
    noUiSlider.create(featurePredictionCountThresholdSlider, {
        start: [50],
        step: 1,
        range: {
            'min': [0],
            'max': [100]
        },
        tooltips: [wNumb({suffix: ' %'})]
    });
    featurePredictionCountThresholdSlider.noUiSlider.on('slide', function (values) {
        summarizer.comparisonParams.featurePredictionCountThreshold = +values[0]/100;

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!='' && comparedInstanceId!=''){
            $("#instanceComparisonSummary").html('');
            updateComparisonSummary();
        }
    });

    // let instanceSummaryDetailLevelSlider = document.getElementById("instance-summary-detail-slider");
    // noUiSlider.create(instanceSummaryDetailLevelSlider, {
    //     start: [1],
    //     step: 1,
    //     range: {
    //         'min': [1],
    //         'max': [3]
    //     }
    // });
    // instanceSummaryDetailLevelSlider.noUiSlider.on('slide', function (values) {
    //     summarizer.instanceSummaryParams.summaryDetailLevel = +values[0];
    //
    //     let baseInstanceId = $("#vis-1-instance-selector").val();
    //     let comparedInstanceId = $("#vis-2-instance-selector").val();
    //
    //     if(baseInstanceId!=''){
    //         updateBaseInstanceSummary();
    //     }
    //     if(comparedInstanceId!=''){
    //         updateComparedInstanceSummary();
    //     }
    // });
    //
    // let summaryDetailLevelSlider = document.getElementById("summary-detail-slider");
    // noUiSlider.create(summaryDetailLevelSlider, {
    //     start: [1],
    //     step: 1,
    //     range: {
    //         'min': [1],
    //         'max': [3]
    //     }
    // });
    // summaryDetailLevelSlider.noUiSlider.on('slide', function (values) {
    //     summarizer.comparisonParams.summaryDetailLevel = +values[0];
    //
    //     let baseInstanceId = $("#vis-1-instance-selector").val();
    //     let comparedInstanceId = $("#vis-2-instance-selector").val();
    //
    //     if(baseInstanceId!='' && comparedInstanceId!=''){
    //         $("#instanceComparisonSummary").html('');
    //         updateComparisonSummary();
    //     }
    // });
    let summaryDetailLevelSlider = document.getElementById("detail-slider");
    noUiSlider.create(summaryDetailLevelSlider, {
        start: [1],
        step: 1,
        range: {
            'min': [1],
            'max': [3]
        }
    });
    summaryDetailLevelSlider.noUiSlider.on('slide', function (values) {
        summarizer.instanceSummaryParams.summaryDetailLevel = +values[0];
        summarizer.comparisonParams.summaryDetailLevel = +values[0];

        let baseInstanceId = $("#vis-1-instance-selector").val();
        let comparedInstanceId = $("#vis-2-instance-selector").val();

        if(baseInstanceId!=''){
            updateBaseInstanceSummary();
        }
        if(comparedInstanceId!=''){
            updateComparedInstanceSummary();
        }

        if(baseInstanceId!='' && comparedInstanceId!=''){
            $("#instanceComparisonSummary").html('');
            updateComparisonSummary();
        }
    });

    $("#sentenceDisplayCheckbox").click(function(evt){
        if($(this).prop("checked")){
            $("#instanceComparisonSummary").css("opacity",1);
        }else{
            $("#instanceComparisonSummary").css("opacity",0);
        }
    });


    $("#datasetSelector").on("change",function(evt){
        globalVars.instanceMap = {};
        globalVars.globalFeatureDataMap = {};
        globalVars.intercept = globalVars.interceptMap[$(this).val()];
        globalVars.modelMinPrediction = undefined;
        globalVars.modelMaxPrediction = undefined;
        let dataset = $(this).val();
        d3.json("data/"+dataset+".json",function (error, data) {
            for(let instanceObj of data){
                globalVars.instanceMap[instanceObj.id] = instanceObj;
                let featureData = instanceObj['data'];
                for(let featureDataObj of featureData){
                    let feature = featureDataObj['name'];

                    if(globalVars.modelMinPrediction==undefined){
                        globalVars.modelMinPrediction = featureDataObj['pdep'];
                    }else if(globalVars.modelMinPrediction>featureDataObj['pdep']){
                        globalVars.modelMinPrediction = featureDataObj['pdep'];
                    }

                    if(globalVars.modelMaxPrediction==undefined){
                        globalVars.modelMaxPrediction = featureDataObj['pdep'];
                    }else if(globalVars.modelMaxPrediction<featureDataObj['pdep']){
                        globalVars.modelMaxPrediction = featureDataObj['pdep'];
                    }

                    if(feature in globalVars.globalFeatureDataMap){
                        globalVars.globalFeatureDataMap[feature].push({
                            'featureVal' : featureDataObj['X'],
                            'prediction' : featureDataObj['pdep']
                        });
                    }else {
                        globalVars.globalFeatureDataMap[feature] = [{
                            'featureVal' : featureDataObj['X'],
                            'prediction' : featureDataObj['pdep']
                        }];
                    }
                }
            }

            summarizer.init(data,globalVars.intercept);
            initScreen();
            updateGlobalModelSummary(dataset);
        });
    });

    $("#sortByMagnitudeCheckbox").on("change",function(evt){
        let baseInstanceId = $("#vis-1-instance-selector").val();
        if(baseInstanceId!=''){
            updateBaseInstance(baseInstanceId);
        }
        let comparedInstanceId = $("#vis-2-instance-selector").val();
        if(comparedInstanceId!=''){
            updateComparedInstance(comparedInstanceId);
        }
    });

    function initScreen(){
        $('#vis-1-instance-selector')
            .find('option')
            .remove();
        $('#vis-2-instance-selector')
            .find('option')
            .remove();
        $('#vis-1-instance-selector').append($('<option>', {
            value: "",
            text: ""
        }));
        $('#vis-2-instance-selector').append($('<option>', {
            value: "",
            text: ""
        }));
        for(let instanceId in globalVars.instanceMap){
            $('#vis-1-instance-selector').append($('<option>', {
                value: instanceId,
                text: instanceId
            }));
            $('#vis-2-instance-selector').append($('<option>', {
                value: instanceId,
                text: instanceId
            }));
        }
        refreshCharts();
        $("#compared-instance-div").css("display","none");
        $("#instance-2-details").css("display","none");
        $("#vis-2-instance-selector").val("");
        globalVars.comparedInstanceId = "";
        $("#instanceComparisonSummary").html('');

        // $("#modelSummaryTooltip").css("width", $(window).width() * .225);
        $("#modelSummaryTooltip").css("width", "auto");
        // $("#modelSummaryTooltip").css("max-height", $(window).height() * .5);
        $("#modelSummaryTooltip").css("max-height", "400px");
    }

    function refreshCharts(){
        d3.select("#vis-1").selectAll("svg").remove();
        d3.select("#vis-2").selectAll("svg").remove();
        $("#baseInstanceSummary").html('');
        $("#comparedInstanceSummary").html('');
    }

    $("#vis-1-instance-selector").on("change",function(evt){
        let instanceId = $(this).val();
        if(instanceId!=''){
            updateBaseInstance(instanceId);
            globalVars.comparedInstanceId = "";
            $("#compared-instance-div").css("display","block");
            $("#instance-2-details").css("display","block");
            $("#vis-2-instance-selector").val("");
            d3.select("#vis-2").selectAll("svg").remove();
            $("#comparedInstanceId").html('');
            $("#vis-2-actual").html('');
            $("#vis-2-prediction").html('');
            $("#instanceComparisonSummary").html('');
        }else {
            globalVars.baseInstanceId = "";
            globalVars.comparedInstanceId = "";
            $("#compared-instance-div").css("display","none");
            $("#instance-2-details").css("display","none");
            refreshCharts();
            $("#baseInstanceId").html('');
            $("#vis-1-actual").html('');
            $("#vis-1-prediction").html('');
            $("#baseInstanceSummary").html('');
            $("#instanceComparisonSummary").html('');
        }
    });

    function updateBaseInstance(instanceId){
        globalVars.baseInstanceId = instanceId;
        $("#baseInstanceId").html(globalVars.baseInstanceId);
        let instanceObj = globalVars.instanceMap[instanceId];
        $("#vis-1-actual").html(instanceObj['y']);
        let featureDataList = instanceObj['data'];
        let useAbs = $("#sortByMagnitudeCheckbox").prop('checked');
        utils.sortObj(featureDataList,'pdep','d',useAbs);

        globalVars.baseInstanceFeatureOrdering = [];
        for(let predictionObj of featureDataList){
            globalVars.baseInstanceFeatureOrdering.push(predictionObj['name']);
        }

        renderWaterfallChart_baseInstance(utils.clone(featureDataList),useAbs);
        updateBaseInstanceSummary();
    }

    $("#vis-2-instance-selector").on("change",function(evt){
        let instanceId = $(this).val();
        if(instanceId!='') {
            updateComparedInstance(instanceId);
        }else {
            globalVars.comparedInstanceId = "";
            d3.select("#vis-2").selectAll("svg").remove();
            $("#comparedInstanceId").html('');
            $("#vis-2-actual").html('');
            $("#vis-2-prediction").html('');
            $("#comparedInstanceSummary").html('');
            $("#instanceComparisonSummary").html('');
        }
    });

    function updateComparedInstance(instanceId) {
        globalVars.comparedInstanceId = instanceId;
        $("#comparedInstanceId").html(globalVars.comparedInstanceId);
        let instanceObj = globalVars.instanceMap[instanceId];
        $("#vis-2-actual").html(instanceObj['y']);
        let useAbs = $("#sortByMagnitudeCheckbox").prop('checked');
        let featureDataList = [];
        for(let feature of globalVars.baseInstanceFeatureOrdering){
            for(let predictionObj of instanceObj['data']){
                if(predictionObj['name']==feature){
                    featureDataList.push(predictionObj);
                }
            }
        }
        renderWaterfallChart_comparedInstance(featureDataList, useAbs);
        updateComparedInstanceSummary();
        updateComparisonSummary();
    }

    function updateBaseInstanceSummary() {
        let instanceObj = globalVars.instanceMap[globalVars.baseInstanceId];
        let summaryObj = summarizer.generateInstanceSummary(instanceObj);

        $("#baseInstanceSummary")
            .attr("summaryObj",JSON.stringify(summaryObj))
            .html("<br>"+summaryObj['summarySentence']);

        d3.select("#baseInstanceSummary")
            .on("mouseover",function () {
                let summaryObj = JSON.parse(d3.select(this).attr('summaryObj'));
                d3.select("#vis-1")
                    .selectAll('.bar')
                    .classed('highlight',function (d) {
                        if(summaryObj['highlyContributingFeatures'].indexOf(d.name)!=-1){
                            return true;
                        }
                        return false;
                    });

                d3.select("#vis-1")
                    .selectAll('.x.axis .tick text')
                    .classed('highlight',function (d) {
                        if(summaryObj['highlyContributingFeatures'].indexOf(d)!=-1){
                            return true;
                        }
                        return false;
                    });
            })
            .on("mouseout",function(){
                d3.selectAll('.bar')
                    .classed('highlight',false);

                d3.selectAll('.x.axis .tick text')
                    .classed('highlight',false);
            });
    }

    function updateComparedInstanceSummary() {
        let instanceObj = globalVars.instanceMap[globalVars.comparedInstanceId];
        let summaryObj = summarizer.generateInstanceSummary(instanceObj);

        $("#comparedInstanceSummary")
            .attr("summaryObj",JSON.stringify(summaryObj))
            .html("<br>"+summaryObj['summarySentence']);

        d3.select("#comparedInstanceSummary")
            .on("mouseover",function () {
                let summaryObj = JSON.parse(d3.select(this).attr('summaryObj'));
                d3.select("#vis-2")
                    .selectAll('.bar')
                    .classed('highlight',function (d) {
                        if(summaryObj['highlyContributingFeatures'].indexOf(d.name)!=-1){
                            return true;
                        }
                        return false;
                    });

                d3.select("#vis-2")
                    .selectAll('.x.axis .tick text')
                    .classed('highlight',function (d) {
                        if(summaryObj['highlyContributingFeatures'].indexOf(d)!=-1){
                            return true;
                        }
                        return false;
                    });
            })
            .on("mouseout",function(){
                d3.selectAll('.bar')
                    .classed('highlight',false);

                d3.selectAll('.x.axis .tick text')
                    .classed('highlight',false);
            });
    }

    function updateComparisonSummary() {
        let instanceObj1 = globalVars.instanceMap[globalVars.baseInstanceId];
        let instanceObj2 = globalVars.instanceMap[globalVars.comparedInstanceId];
        let reorderedFeatureDataList = [];
        for(let feature of globalVars.baseInstanceFeatureOrdering){
            for(let predictionObj of instanceObj2['data']){
                if(predictionObj['name']==feature){
                    reorderedFeatureDataList.push(predictionObj);
                }
            }
        }
        instanceObj2['data'] = utils.clone(reorderedFeatureDataList);

        let summaryObj = summarizer.generateComparisonSummary(instanceObj1,instanceObj2);
        // $("#instanceComparisonSummary").html("<p summaryObj='"+JSON.stringify(summaryObj)+"' id='summarySentence'>"+summaryObj['summarySentence']+"</p>");
        $("#instanceComparisonSummary")
            .attr('summaryObj',JSON.stringify(summaryObj))
            .html("<br>"+summaryObj['summarySentence']);

        d3.select("#instanceComparisonSummary")
            .on("mouseover",function () {
                let summaryObj = JSON.parse(d3.select(this).attr('summaryObj'));
                let featureNames = [];
                for(let featureDiffObj of summaryObj['featurePredictionDifferenceObjs']){
                    featureNames.push(featureDiffObj['name']);
                }
                d3.selectAll('.bar')
                    .classed('highlight',function (d) {
                        if(featureNames.indexOf(d.name)!=-1){
                            return true;
                        }
                        return false;
                    });

                d3.selectAll('.x.axis .tick text')
                    .classed('highlight',function (d) {
                        if(featureNames.indexOf(d)!=-1){
                            return true;
                        }
                        return false;
                    });
            })
            .on("mouseout",function(){
                d3.selectAll('.bar')
                    .classed('highlight',false);

                d3.selectAll('.x.axis .tick text')
                    .classed('highlight',false);
            });
    }

    function renderWaterfallChart_baseInstance(featureDataList, useAbs) {
        d3.select("#vis-1").selectAll("svg").remove();
        let margin = {top: 20, right: 30, bottom: 30, left: 50},
            width = globalVars.visWidth - margin.left - margin.right,
            height = globalVars.visHeight - margin.top - margin.bottom,
            padding = 0.05;

        $(".visDiv").height(globalVars.visHeight+margin.bottom*2);

        let x = d3.scaleBand()
            .range([0, width])
            .padding(padding);

        let y = d3.scaleLinear()
            .range([height, 0]);

        let xAxis = d3.axisBottom(x);

        let yAxis = d3.axisLeft(y);

        let svg = d3.select("#vis-1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom*3)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(globalVars.baseInstanceTooltip);

        let cumulative = globalVars.intercept;
        for (let i = 0; i < featureDataList.length; i++) {
            featureDataList[i].start = cumulative;
            cumulative += +featureDataList[i].pdep;
            featureDataList[i].end = cumulative;
            featureDataList[i].class = ( +featureDataList[i].pdep >= 0 ) ? 'positive' : 'negative'
        }

        let prediction = cumulative;

        // featureDataList.push({
        //     'start' : 0,
        //     'end' : prediction,
        //     'class' : 'total',
        //     'name' : 'totalPrediction',
        //     'pdep' : prediction
        // });
        globalVars.instanceMap[globalVars.baseInstanceId]['totalPrediction'] = prediction;

        $("#vis-1-prediction").html(prediction.toFixed(2));

        x.domain(featureDataList.map(function(d) { return d.name; }));
        y.domain([d3.min(featureDataList, function(d) { return d.start; }), d3.max([globalVars.intercept,d3.max(featureDataList, function(d) { return d.end; })])]);
        globalVars.baseInstanceChartYScaleDomainMax = y.domain()[1];

        if(globalVars.baseInstanceId!='' && globalVars.comparedInstanceId!=''){
            let yMin = y.domain()[0];
            // let baseInstanceTotalPrediction = globalVars.instanceMap[globalVars.baseInstanceId]['totalPrediction'], comparedInstanceTotalPrediction = globalVars.instanceMap[globalVars.comparedInstanceId]['totalPrediction'];
            if(globalVars.comparedInstanceChartYScaleDomainMax>globalVars.baseInstanceChartYScaleDomainMax){
                y.domain([yMin,globalVars.comparedInstanceChartYScaleDomainMax]);
                globalVars.baseInstanceChartYScaleDomainMax = y.domain()[1];
            }
        }

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.5em")
            .attr("transform", "rotate(-90)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("line")
            .attr("class","interceptLine")
            .attr("x1", 0 )
            .attr("y1", y(globalVars.intercept) )
            .attr("x2", width )
            .attr("y2", y(globalVars.intercept) );

        svg.append("text")
            .attr("class","interceptLabel")
            .attr("x",width-x.bandwidth()*3)
            .attr("y", y(globalVars.intercept) - 2)
            .text("Intercept");

        if(y.domain()[0]<0){
            svg.append("line")
                .attr("class","zeroLine")
                .attr("x1", 0 )
                .attr("y1", y(0) )
                .attr("x2", width )
                .attr("y2", y(0) );
        }

        let bar = svg.selectAll(".bar")
            .data(featureDataList)
            .enter()
            .append("g")
            .attr("class", function(d) { return "bar " + d.class })
            .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

        bar.append("rect")
            .attr("id",function (d) {
                return d['name']+"-bar-baseInstance";
            })
            .attr("y", function(d) {
                return y( Math.max(d.start, d.end) );
            })
            .attr("height", function(d) {
                return Math.abs( y(d.start) - y(d.end) );
            })
            .attr("width", x.bandwidth())
            .on("mouseover",function(d){
                globalVars.baseInstanceTooltip.show(d);
                d3.select("#"+d['name']+"-bar-comparedInstance").dispatch("click");
            })
            .on("mouseout",function(d){
                globalVars.baseInstanceTooltip.hide();
                globalVars.comparedInstanceTooltip.hide();
            })
            .on("click",function(d){
                globalVars.baseInstanceTooltip.show(d);
            });
    }

    function renderWaterfallChart_comparedInstance(featureDataList, useAbs) {
        d3.select("#vis-2").selectAll("svg").remove();
        let margin = {top: 20, right: 30, bottom: 30, left: 50},
            width = globalVars.visWidth - margin.left - margin.right,
            height = globalVars.visHeight - margin.top - margin.bottom,
            padding = 0.05;

        $(".visDiv").height(globalVars.visHeight+margin.bottom*2);

        let x = d3.scaleBand()
            .range([0, width])
            .padding(padding);

        let y = d3.scaleLinear()
            .range([height, 0]);

        let xAxis = d3.axisBottom(x);

        let yAxis = d3.axisLeft(y);

        let svg = d3.select("#vis-2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom*3)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(globalVars.comparedInstanceTooltip);

        let cumulative = globalVars.intercept;
        for (let i = 0; i < featureDataList.length; i++) {
            featureDataList[i].start = cumulative;
            cumulative += +featureDataList[i].pdep;
            featureDataList[i].end = cumulative;
            featureDataList[i].class = ( +featureDataList[i].pdep >= 0 ) ? 'positive' : 'negative'
        }

        let prediction = cumulative;

        // featureDataList.push({
        //     'start' : 0,
        //     'end' : prediction,
        //     'class' : 'total',
        //     'name' : 'totalPrediction',
        //     'pdep' : prediction
        // });
        globalVars.instanceMap[globalVars.comparedInstanceId]['totalPrediction'] = prediction;

        $("#vis-2-prediction").html(prediction.toFixed(2));

        x.domain(featureDataList.map(function(d) { return d.name; }));
        y.domain([d3.min(featureDataList, function(d) { return d.start; }), d3.max([globalVars.intercept,d3.max(featureDataList, function(d) { return d.end; })])]);
        globalVars.comparedInstanceChartYScaleDomainMax = y.domain()[1];


        if(globalVars.baseInstanceId!='' && globalVars.comparedInstanceId!=''){
            let yMin = y.domain()[0];
            // let baseInstanceTotalPrediction = globalVars.instanceMap[globalVars.baseInstanceId]['totalPrediction'], comparedInstanceTotalPrediction = globalVars.instanceMap[globalVars.comparedInstanceId]['totalPrediction'];

            if(globalVars.baseInstanceChartYScaleDomainMax>globalVars.comparedInstanceChartYScaleDomainMax){
                y.domain([yMin,globalVars.baseInstanceChartYScaleDomainMax]);
                globalVars.comparedInstanceChartYScaleDomainMax = y.domain()[1];
            }else {
                renderWaterfallChart_baseInstance(utils.clone(globalVars.instanceMap[globalVars.baseInstanceId]['data']));
            }
        }

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.5em")
            .attr("transform", "rotate(-90)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("line")
            .attr("class","interceptLine")
            .attr("x1", 0 )
            .attr("y1", y(globalVars.intercept) )
            .attr("x2", width )
            .attr("y2", y(globalVars.intercept) );

        svg.append("text")
            .attr("class","interceptLabel")
            .attr("x",width-x.bandwidth()*3)
            .attr("y", y(globalVars.intercept) - 2)
            .text("Intercept");

        if(y.domain()[0]<0){
            svg.append("line")
                .attr("class","zeroLine")
                .attr("x1", 0 )
                .attr("y1", y(0) )
                .attr("x2", width )
                .attr("y2", y(0) );
        }

        let bar = svg.selectAll(".bar")
            .data(featureDataList)
            .enter()
            .append("g")
            .attr("class", function(d) { return "bar " + d.class })
            .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

        bar.append("rect")
            .attr("id",function (d) {
                return d['name']+"-bar-comparedInstance";
            })
            .attr("y", function(d) {
                return y( Math.max(d.start, d.end) );
            })
            .attr("height", function(d) {
                return Math.abs( y(d.start) - y(d.end) );
            })
            .attr("width", x.bandwidth())
            .on("mouseover",function(d){
                globalVars.comparedInstanceTooltip.show(d);
                // globalVars.baseInstanceTooltip.show(d, document.getElementById(d['name']+"-bar-baseInstance"));
                d3.select("#"+d['name']+"-bar-baseInstance").dispatch("click");
            })
            .on("mouseout",function(d){
                globalVars.comparedInstanceTooltip.hide();
                globalVars.baseInstanceTooltip.hide();
            })
            .on("click",function(d){
                globalVars.comparedInstanceTooltip.show(d);
            });
    }

    function updateGlobalModelSummary(dataset) {
        $("#modelSummary").html("");
        // let modelSummaryFacts = summarizer.globalSummaryMap[dataset];
        // let summaryHTML = "<ul>";
        // for(let summaryFact of modelSummaryFacts){
        //     summaryHTML += "<li class='globalModelSummaryFact' factData='"+JSON.stringify(summaryFact)+"'>"+summaryFact['description']+"</li>";
        // }
        // summaryHTML += "</ul>";
        // $("#modelSummary").html(summaryHTML);

        let modelSummaryFactMap = summarizer.globalSummaryMap[dataset];
        let summaryHTML = "";
        for(let trendType of ["Non-linear","Linear-positive","Linear-negative","Flat"]){
            let features = modelSummaryFactMap[trendType]["features"], description = modelSummaryFactMap[trendType]["description"];
            if(features.length>0){
                summaryHTML += "<span class='modelSummaryTrendHeader'>"+trendType+"</span><br>";
                summaryHTML += "<p class='globalModelSummaryFact' factFeatures='"+JSON.stringify(features)+"'>"+description+"</p>";
            }
        }
        $("#modelSummary").html(summaryHTML);


        $(".globalModelSummaryFact").on("mouseover",function (evt) {
            let boundingBox = this.getBoundingClientRect();
            let top = boundingBox.top, right = boundingBox.right;
            $("#modelSummaryTooltip").css("display","block").css("top",top).css("left",right+25);
            let features = JSON.parse($(this).attr("factFeatures"));
            $("#modelSummaryTooltip").html("");

            let featureIndex = 0;
            for(let feature of features){
                let featureVlSpec = {
                    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
                    "data": {"values":globalVars.globalFeatureDataMap[feature]},
                    "mark": "line",
                    "encoding": {
                        "x": {"field": "featureVal", "type": "quantitative"},
                        "y": {"field": "prediction", "type": "quantitative", "scale": {"domain": [globalVars.modelMinPrediction,globalVars.modelMaxPrediction]}}
                    }
                };

                let visDivId = 'feature-'+featureIndex;
                let visDivHTML = "<span style='font-weight: bold;margin-left: 40%;'>&nbsp;" + feature + "&nbsp;</span><br><div style='width: 100%' id='" + visDivId +"'></div><br><br>";
                $("#modelSummaryTooltip").append(visDivHTML);
                vegaEmbed('#'+visDivId, featureVlSpec, {"actions": false});
                featureIndex+=1;
            }

        })
    }

    $(window).click(function (evt) {
        $("#modelSummaryTooltip").css("display","none");
    })
})();