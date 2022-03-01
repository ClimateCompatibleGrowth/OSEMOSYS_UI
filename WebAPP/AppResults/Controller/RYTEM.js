import { Message } from "../../Classes/Message.Class.js";
import { Base } from "../../Classes/Base.Class.js";
import { Html } from "../../Classes/Html.Class.js";
import { Model } from "../Model/RYTEM.Model.js";
import { Grid } from "../../Classes/Grid.Class.js";
import { Chart } from "../../Classes/Chart.Class.js";
import { Osemosys } from "../../Classes/Osemosys.Class.js";
import { GROUPNAMES } from "../../Classes/Const.Class.js";
import { DEF } from "../../Classes/Definition.Class.js";
import { MessageSelect } from "../../App/Controller/MessageSelect.js"

export default class RYTEM {
    static onLoad(group, param) {
        Base.getSession()
            .then(response => {
                let casename = response['session'];
                if (casename) {
                    const promise = [];
                    promise.push(casename);
                    const genData = Osemosys.getData(casename, 'genData.json');
                    promise.push(genData);
                    const resData = Osemosys.getResultData(casename, 'resData.json');
                    promise.push(resData);
                    const PARAMETERS = Osemosys.getParamFile('ResultParameters.json');
                    promise.push(PARAMETERS);
                    const RYTEMdata = Osemosys.getResultData(casename, "RYTEM.json");
                    promise.push(RYTEMdata);
                    return Promise.all(promise);
                } else {
                    let er = {
                        "message": 'There is no model selected!',
                        "status_code": "CaseError"
                    }
                    return Promise.reject(er);
                    //throw new Error(JSON.stringify(er));
                    //MessageSelect.init(RYTEM.refreshPage.bind(RYTEM));
                }
            })
            .then(data => {
                let [casename, genData, resData, PARAMETERS, RYTEMdata] = data;
                //if (RYTEMdata[param]['CS_0'].length == 0) {
                if (RYTEMdata[param][resData['osy-cases'][0]['Case']].length == 0) {
                    let er = {
                        "message": 'There is no activity defined!',
                        "status_code": "ActivityError",
                        "casename": casename
                    }
                    //throw new Error('Activity');
                    return Promise.reject(er);
                }
                let model = new Model(casename, genData, resData, RYTEMdata, group, PARAMETERS, param);
                this.initPage(model);
                this.initEvents(model);
            })
            .catch(error => {
                if (error.status_code == 'CaseError') {
                    MessageSelect.init(RYTEM.refreshPage.bind(RYTEM));
                }
                else if (error.status_code == 'ActivityError') {
                    MessageSelect.activity(RYTEM.refreshPage.bind(RYTEM), error.casename);
                }
                Message.warning(error);
            });
    }

    static initPage(model) {
        Message.clearMessages();
        //Navbar.initPage(model.casename);
        Html.title(model.casename, model.PARAMNAMES[model.param], GROUPNAMES[model.group]);
        Html.ddlCases(model.cases, model.case);
        Html.ddlParams(model.PARAMETERS['RYTEM'], model.param);
        //Html.ddlTechs(model.techs, model.techs[0]['TechId']);
        Html.ddlTechsArray(model.techs)
        Html.ddlEmisArray(model.emis)
        //Html.ddlEmis(model.emis[model.techs[0]['TechId']], model.emis[model.techs[0]['TechId']][0]['EmisId']);
        Html.ddlMods($('#osy-mods1'), model.mods);

        let $divGrid = $('#osy-gridRYTEM');
        var daGrid = new $.jqx.dataAdapter(model.srcGrid);
        Grid.Grid($divGrid, daGrid, model.columns, true, true, false, false);

        let $divChart = $('#osy-chartRYTEM');
        var daChart = new $.jqx.dataAdapter(model.srcChart, { autoBind: true });
        Chart.Chart($divChart, daChart, "RYTEM", model.series);
        //pageSetUp();
    }

    static refreshPage(casename) {
        Base.setSession(casename)
            .then(response => {
                const promise = [];
                promise.push(casename);
                const genData = Osemosys.getData(casename, 'genData.json');
                promise.push(genData);
                const resData = Osemosys.getResultData(casename, 'resData.json');
                promise.push(resData);
                const PARAMETERS = Osemosys.getParamFile('ResultParameters.json');
                promise.push(PARAMETERS);
                const RYTEMdata = Osemosys.getData(casename, "RYTEM.json");
                promise.push(RYTEMdata);
                return Promise.all(promise);
            })
            .then(data => {
                let [casename, genData, resData, PARAMETERS, RYTEMdata] = data;
                //if (RYTEMdata[PARAMETERS['RYTE'][0]['id']]['CS_0'].length == 0) {
                if (RYTEMdata[PARAMETERS['RYTEM'][0]['id']][resData['osy-cases'][0]['Case']].length == 0) {
                
                    let er = {
                        "message": 'There is no activity defined!',
                        "status_code": "ActivityError",
                        "casename": casename
                    }
                    //throw new Error('Activity');
                    return Promise.reject(er);
                }
                let model = new Model(casename, genData, resData, RYTEMdata, 'RYTEM', PARAMETERS, PARAMETERS['RYTEM'][0]['id']);
                this.initPage(model);
                this.initEvents(model);
            })
            .catch(error => {
                setTimeout(function () {
                    if (error.status_code == 'CaseError') {
                        MessageSelect.init(RYTEM.refreshPage.bind(RYTEM));
                    }
                    else if (error.status_code == 'ActivityError') {
                        MessageSelect.activity(RYTEM.refreshPage.bind(RYTEM), error.casename);
                    }
                    Message.warning(error.message);
                }, 500);

            });
    }

    static initEvents(model) {

        let $divGrid = $('#osy-gridRYTEM');
        let $divChart = $('#osy-chartRYTEM');

        $("#casePicker").off('click');
        $("#casePicker").on('click', '.selectCS', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var casename = $(this).attr('data-ps');
            Html.updateCasePicker(casename);
            RYTEM.refreshPage(casename);
            Message.smallBoxConfirmation("Confirmation!", "Model " + casename + " selected!", 3500);
        });

        $("#osy-ryt").off('change');
        $('#osy-ryt').on('change', function () {
            Message.clearMessages();
            Html.title(model.casename, model.PARAMNAMES[this.value], GROUPNAMES[model.group]);
            model.srcGrid.root = this.value;
            $divGrid.jqxGrid('updatebounddata');
            model.param = this.value;
            var configChart = $divChart.jqxChart('getInstance');
            var tech = $("#osy-techs").val();
            var emi = $("#osy-emis").val();
            var mo = $("#osy-mods1").val();
            configChart.source.records = model.chartData[this.value][tech][emi][mo];
            configChart.update();
            $('#definition').html(`${DEF[model.group][model.param].definition}`);
        });

        $("#osy-techs").off('change');
        $('#osy-techs').on('change', function () {
            model.tech = this.value;
            console.log(model.param, model.case, this.value, model.emi)
            var configChart = $divChart.jqxChart('getInstance');
            configChart.source.records = model.chartData[model.param][model.case][this.value][model.emi];
            configChart.update();
        });

        $("#osy-emis").off('change');
        $('#osy-emis').on('change', function () {
            model.emi = this.value;
            var configChart = $divChart.jqxChart('getInstance');
            configChart.source.records = model.chartData[model.param][model.case][model.tech][this.value];
            configChart.update();
        });

        $("#osy-mods1").off('change');
        $('#osy-mods1').on('change', function () {
            var param = $("#osy-ryt").val();
            var tech = $("#osy-techs").val();
            var emi = $("#osy-emis").val();
            var configChart = $divChart.jqxChart('getInstance');
            configChart.source.records = model.chartData[param][tech][emi][this.value];
            configChart.update();
        });

        $(".switchChart").off('click');
        $(".switchChart").on('click', function (e) {
            e.preventDefault();
            var configChart = $divChart.jqxChart('getInstance');
            var chartType = $(this).attr('data-chartType');
            configChart.seriesGroups[0].type = chartType;
            if (chartType == 'column') {
                configChart.seriesGroups[0].labels.angle = 90;
            } else {
                configChart.seriesGroups[0].labels.angle = 0;
            }
            configChart.update();
            // $('button a').switchClass( "green", "grey" );
            // $('#'+chartType).switchClass( "grey", "green" );
        });

        $(".toggleLabels").off('click');
        $(".toggleLabels").on('click', function (e) {
            e.preventDefault();
            var configChart = $divChart.jqxChart('getInstance');
            if (configChart.seriesGroups[0].type == 'column') {
                configChart.seriesGroups[0].labels.angle = 90;
            } else {
                configChart.seriesGroups[0].labels.angle = 0;
            }
            configChart.seriesGroups[0].labels.visible = !configChart.seriesGroups[0].labels.visible;
            configChart.update();
        });

        $("#exportPng").off('click');
        $("#exportPng").click(function () {
            $divChart.jqxChart('saveAsPNG', 'RYTEM.png', 'https://www.jqwidgets.com/export_server/export.php');
        });

        let res = true;
        $("#resizeColumns").off('click');
        $("#resizeColumns").click(function () {
            if (res) {
                $divGrid.jqxGrid('autoresizecolumn', 'Sc');
                $divGrid.jqxGrid('autoresizecolumn', 'Tech');
                $divGrid.jqxGrid('autoresizecolumn', 'Emis');
            }
            else {
                $divGrid.jqxGrid('autoresizecolumns');
            }
            res = !res;
        });

        $("#xlsAll").off('click');
        $("#xlsAll").click(function (e) {
            e.preventDefault();
            $divGrid.jqxGrid('exportdata', 'xls', 'RYTEM');
        });

        $("#decUp").off('click');
        $("#decUp").on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            model.d++;
            model.decimal = 'd' + parseInt(model.d);
            $divGrid.jqxGrid('refresh');
        });

        $("#decDown").off('click');
        $("#decDown").on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            model.d--;
            model.decimal = 'd' + parseInt(model.d);
            $divGrid.jqxGrid('refresh');
        });

        $("#showLog").off('click');
        $("#showLog").click(function (e) {
            e.preventDefault();
            $('#definition').html(`${DEF[model.group][model.param].definition}`);
            $('#definition').toggle('slow');
        });
    }
}