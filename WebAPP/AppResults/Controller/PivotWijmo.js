import { Message } from "../../Classes/Message.Class.js";
import { Base } from "../../Classes/Base.Class.js";
import { Html } from "../../Classes/Html.Class.js";
import { Model } from "../Model/PivotWijmo.Model.js";
import { Grid } from "../../Classes/Grid.Class.js";
import { Chart } from "../../Classes/Chart.Class.js";
import { Osemosys } from "../../Classes/Osemosys.Class.js";
import { GROUPNAMES } from "../../Classes/Const.Class.js";
import { DEF } from "../../Classes/Definition.Class.js";
import { MessageSelect } from "../../App/Controller/MessageSelect.js"
import { DataModelResult } from "../../Classes/DataModelResult.Class.js";
import { DefaultObj } from "../../Classes/DefaultObj.Class.js";

//import * as wijmo from '@grapecity/wijmo';


export default class Pivot {
    static onLoad() {
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
                    const VIEWS = Osemosys.getResultData(casename,'viewDefinitions.json');
                    promise.push(VIEWS);
                    const DATA = Osemosys.getResultData(casename, 'RYT.json');
                    promise.push(DATA);
                    return Promise.all(promise);
                } else {
                    let er = {
                        "message": 'There is no model selected!',
                        "status_code": "CaseError"
                    }
                    return Promise.reject(er);
                    // MessageSelect.init(Pivot.refreshPage.bind(Pivot));
                    // throw new Error('No model selected');
                }
            })
            .then(data => {      
                let [casename, genData, resData, PARAMETERS, VIEWS, DATA] = data;
                //console.log('views ', VIEWS)
                let model = new Model(casename, genData, resData, PARAMETERS, DATA, VIEWS);
                this.initPage(model);
                this.initEvents(model);
            })
            .catch(error => {
                if (error.status_code == 'CaseError') {
                    MessageSelect.init(Pivot.refreshPage.bind(Pivot));
                }
                else if (error.status_code == 'ActivityError') {
                    MessageSelect.activity(Pivot.refreshPage.bind(Pivot), error.casename);
                }
                Message.warning(error);
            });
    }

    static initPage(model) {
        Message.clearMessages();
        //console.log('model ', model);

        //Navbar.initPage(model.casename);
        Html.title(model.casename, model.PARAMNAMES[model.group][model.param], 'pivot');
        Html.ddlParamsAll(model.PARAMETERS, model.param);
        //console.log(model.VIEWS[model.param], model.PARAMETERS[model.group][0]['id'])
        Html.ddlViews(model.VIEWS[model.param]);


        //Grid.pivotGrid(model.pivotData);

        // var key = 'GrapeCity-Internal-Use-Only,127.0.0.1,819193671948885#B0ZZsxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34zZxUENntyT4MGbqlWaVl4ZJJESrhjYzcGS9kEcNdzbQ3STwd7TspmVEtCa0ZWSz8GcY5kVIlzKwwkZFpFeaNWayF6TvkVM5NzdPh7Ltt4bOVVQo9GN6dVWxJHWBhXTvUXM7YVTBlUYShFWoR4cRR7Sw4WZLxGW52WNStkcuJmZBJ4NnlkQmdEUFdlV8dXemJjRNpncxc6dwUDN8tCTodDRxMnT6h6Yih6Q8QEcXx6cXx6TXxEaHlGU9NHTI56V8kVaSREaCdHU9VHWRlzRutyRipGcBx6K7kmercWN7ZFdoBja9sSSMhEUINzVKRGWwEjMXd6c7EHZvRjVYdnYURleRRlQPBXbaNndWZTZ6ZHbiNVe9M6Kt3kZHNEONpkUHhmcPR4R7sSMP5UbCVjeLNDRIlVept6dntyNm3iSRVzM0h6Y6U7StN4aUNUbldlcpRzYOJ6QyllI0IyUiwiIBZUO5I4MyEjI0ICSiwSMzgDM8AjMwcTM0IicfJye#4Xfd5nIJBjMSJiOiMkIsIibvl6cuVGd8VEIgQXZlh6U8VGbGBybtpWaXJiOi8kI1xSfiUTSOFlI0IyQiwiIu3Waz9WZ4hXRgAicldXZpZFdy3GclJFIv5mapdlI0IiTisHL3JyS7gDSiojIDJCLi86bpNnblRHeFBCI73mUpRHb55EIv5mapdlI0IiTisHL3JCNGZDRiojIDJCLi86bpNnblRHeFBCIQFETPBCIv5mapdlI0IiTisHL3JyMDBjQiojIDJCLiUmcvNEIv5mapdlI0IiTisHL3JSV8cTQiojIDJCLi86bpNnblRHeFBCI4JXYoNEbhl6YuFmbpZEIv5mapdlI0IiTis7W0ICZyBlIsICNxgDM5ADIxIjMwIjMwIjI0ICdyNkIsISMuAjLw8yNyEjI0IyctRkIsISej9WZnFEI9dmcl9WRgMWat3GdBBCbh96bpRXYuJXZ49WSiojIh94QiwiI5gDO8QTOxcjNzkTM9EDOiojIklkIs4XXbpjInxmZiwiIzYXMyAjMiojIyVIdMw';
        // wijmo.setLicenseKey(key);

        // var key = 'GrapeCity-Internal-Use-Only,osemosys,819193671948885#B0nllHbhZmOiI7ckJye0ICbuFkI1pjIEJCLi4TPB5GcEREb9QTSJh5coRWa7cUQ9BTWQt4Q4xUZ6BTYxZUZjVne4FHUVZ4V7EGRTJkTp5GMKp5Z7R7NF9kZ4VnaEdGOBRzTDVXTvx4QTdGUhpGWZlVUsd6dJRmY444djRlYpN6T8c5dWZTUqNkUDhXQsBXZqVlZtBlYkdTTzQHSBVkamZTa7gVR6YDW6EnW4pXbwdXM5Q7NwJVTzFjRqRTbTZVSURDbZlXNrUTQrlWbKxkNaJzYw8kS4w6QnxmM8gFe82mWh36LnZ5KrIVNkJ7RIRUaj54azA5M4x6cHZWRJFTUxMEazJXcY56cBZ7MaNDMVZ6RSxEaTREdq9UY7QmRww6NU3SOUBnNZlTawEEZ6J7ZFZGcsJ7aQhnWPJkMLFUe9B5Ru34NExmRv5kU534KFFFSIpGS7MFbWVnYLl7MWBXaZVnSsNDdvkWZWlUN7lmYxp7Tl34aiojITJCLiQzNCVTOCZkMiojIIJCLyQjN4gTMzETN0IicfJye&Qf35VfikEMyIlI0IyQiwiIu3Waz9WZ4hXRgACdlVGaThXZsZEIv5mapdlI0IiTisHL3JSNJ9UUiojIDJCLi86bpNnblRHeFBCIyV6dllmV4J7bwVmUg2Wbql6ViojIOJyes4nILdDOIJiOiMkIsIibvl6cuVGd8VEIgc7bSlGdsVXTg2Wbql6ViojIOJyes4nI4YkNEJiOiMkIsIibvl6cuVGd8VEIgAVQM3EIg2Wbql6ViojIOJyes4nIzMEMCJiOiMkIsISZy36Qg2Wbql6ViojIOJyes4nIVhzNBJiOiMkIsIibvl6cuVGd8VEIgQnchh6QsFWaj9WYulmRg2Wbql6ViojIOJyebpjIkJHUiwiI5MDOxYDMgEjMyAjMyAjMiojI4J7QiwiI4N7boxWYj3GbiojIz5GRiwiI9NmbldWQgk7ZyVmbFByYp56b4FEIsFmbvlGdh9mclRnbJJiOiEmTDJCLiUDO8gDN9EzN6MTOxkTM8IiOiQWSiwSfdtlOicGbmJCLiMjdxIDMyIiOiIXj4zC';
        // wijmo.setLicenseKey(key);

        
        let app = {};

        app.chartTypes = [
            { name: 'Column', value: wijmo.olap.PivotChartType.Column },
            { name: 'Bar', value: wijmo.olap.PivotChartType.Bar },
            { name: 'Scatter', value: wijmo.olap.PivotChartType.Scatter },
            { name: 'Line', value: wijmo.olap.PivotChartType.Line },
            { name: 'Area', value: wijmo.olap.PivotChartType.Area },
            { name: 'Pie', value: wijmo.olap.PivotChartType.Pie },
        ];

        app.panel = new wijmo.olap.PivotPanel('#pivotPanel');

        var ng = app.panel.engine;

        app.pivotGrid = new wijmo.olap.PivotGrid('#pivotGrid', {
            itemsSource: app.panel,
            collapsibleSubtotals: true,
            showSelectedHeaders: 'All'
            
        });
        // app.pivotChart = new wijmo.olap.PivotChart('#pivotChart', {
        //     //header: 'Country GDP',
        //     itemsSource: app.panel,
        //     showLegend: 'Auto',
        //     showTitle: false,
        //     legendPosition: 4,
        //     stacking: 0,            
        //     //rotated: false
        //     //palette: wijmo.chart.Palettes.dark
        // });

        // app.cmbChartType = new wijmo.input.ComboBox('#cmbChartType', {
        //     itemsSource: app.chartTypes,
        //     displayMemberPath: 'name',
        //     selectedValuePath: 'value',
        //     selectedIndexChanged: function (s, e) {      
        //         if(s.selectedValue == 1){
        //             //console.log(s.selectedValue)
        //             app.pivotChart.rotated = 1;
        //             //app.pivotChart.stacking= 1;
        //         }
        //         app.pivotChart.chartType = s.selectedValue;
        //     }
        // });

        // app.cmbStackedChart  = new wijmo.input.ComboBox('#cmbStackedChart', {
        //     itemsSource: 'None,Stacked,Stacked100pc'.split(','),
        //     selectedIndexChanged: function(s, e) {
        //         app.pivotChart.stacking = s.text;
        //     }
        // });


        ng.itemsSource = model.pivotData
        //ng.rowFields.push('Case', 'Tech', 'Comm', 'MoId', 'Ts');
        ng.rowFields.push('Case', 'Tech');
        ng.columnFields.push('Year');
        ng.valueFields.push('Value');
        ng.showRowTotals = 'None';
        ng.showColumnTotals = 'None';

        model.DEFAULTVIEW = ng.viewDefinition;

        //console.log('view derf ', ng.viewDefinition)

        // toggle showRowTotals
        // document.getElementById('showRowTotals').addEventListener('click', function (e) {
        //     ng.showRowTotals = e.target.checked ?
        //         wijmo.olap.ShowTotals.Subtotals : wijmo.olap.ShowTotals.None;
        // });

        // document.getElementById('showColumnTotals').addEventListener('click', function (e) {
        //     ng.showColumnTotals = e.target.checked ?
        //         wijmo.olap.ShowTotals.Subtotals : wijmo.olap.ShowTotals.None;
        // });



        $("#osy-params").off('change');
        $('#osy-params').on('change', function () {
            Message.clearMessages();
            model.group = model.VARGROUPS[this.value]['group'];
            model.param = this.value;
            // console.log('model.param ', model.param);
            // console.log('param change')
            // console.log('views ', model.VIEWS[model.param])

            Osemosys.getResultData(model.casename, model.group+'.json')
            .then(DATA => {

                Html.title(model.casename, model.PARAMNAMES[model.group][model.param], 'pivot');
                Html.ddlViews(model.VIEWS[model.param]);

                //console.log('DATA ', DATA);
                let pivotData = DataModelResult.getPivot(DATA[model.param], model.genData['osy-years']);
                //console.log('pivotData ', pivotData);

                model.pivotData = pivotData;

                ng.itemsSource = model.pivotData

                if (model.param == 'D' || model.param == 'T'){
                    ng.rowFields.push('Case', 'Comm');
                    ng.columnFields.push('Year');
                    ng.valueFields.push('Value');
                }else{
                    ng.rowFields.push('Case', 'Tech');
                    ng.columnFields.push('Year');
                    ng.valueFields.push('Value');
                }
                
            })
            .catch(error => {
                Message.danger(error.message);
            });            
        });

            // NOTE: requires jszip, wijmo.xlsx, and wijmo.grid.xlsx
        $("#xlsExport").off('click');
        $('#xlsExport').on('click', function () {
            // create book with current view
            // let book = wjGridXlsx.FlexGridXlsxConverter.saveAsync(app.pivotGrid, {
            //     includeColumnHeaders: true,
            //     includeRowHeaders: true
            // });
            var book = wijmo.grid.xlsx.FlexGridXlsxConverter.save(app.pivotGrid, {
                includeColumnHeaders: true,
                includeRowHeaders: true
            });
            book.sheets[0].name = 'PivotGrid';
            // save the book
            // book.saveAsync('PivotGrid.xlsx');
            book.save('PivotGrid.xlsx');
        });

            // export the chart to an image
        $("#pngExport").off('click');
        $('#pngExport').on('click', function () {
            app.pivotChart.saveImageToFile('FlexChart.png');
        });

        $("#createView").jqxValidator({
            hintType: 'label',
            animationDuration: 500,
            rules: [
                { input: '#osy-viewname', message: "View name is required field!", action: 'keyup', rule: 'required' },
                {
                    input: '#osy-viewname', message: "Entered view name is not allowed!", action: 'keyup', rule: function (input, commit) {
                        var casename = $("#osy-viewname").val();
                        var result = (/^[a-zA-Z0-9-_ ]*$/.test(casename));
                        return result;
                    }
                }
            ]
        });

        $("#btnSaveView").off('click');
        $("#btnSaveView").on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $("#createView").jqxValidator('validate')
        });

        $("#createView").off('validationSuccess');
        $("#createView").on('validationSuccess', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var viewname = $("#osy-viewname").val();
            var desc = $("#osy-viewdesc").val();
            let param = model.param;
            let viewId = DefaultObj.getId('VIEW');

            let POSTDATA = {
                "osy-viewId": viewId,
                "osy-viewname": viewname,
                "osy-viewdesc": desc,
                "osy-viewdef": ng.viewDefinition
            }

            Osemosys.saveView(model.casename, POSTDATA, param)
                .then(response => {

                    Message.clearMessages();
                    Message.bigBoxSuccess('Model message', response.message, 3000);
                    model.VIEWS[model.param].push(POSTDATA);
                    Html.ddlViews(model.VIEWS[model.param]);
                    $('#createView').modal('toggle');
                
                })
                .catch(error => {
                    Message.bigBoxDanger('Error message', error, null);
                })
        });

        $("#deleteView").off('click');
        $("#deleteView").on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            //update model
            if ( model.VIEW != 'null'){
                $.each(model.VIEWS[model.param], function (id, obj) {
                    //console.log('obj ', obj)
                    if(obj['osy-viewId'] == model.VIEW){
                        model.VIEWS[model.param].splice(id, 1)
                        return false;
                    }
                });
                Html.ddlViews(model.VIEWS[model.param]);
            }

            Osemosys.updateViews(model.casename, model.VIEWS[model.param], model.param)
                .then(response => {

                    Message.clearMessages();
                    Message.bigBoxSuccess('Model message', response.message, 3000);
                
                })
                .catch(error => {
                    Message.bigBoxDanger('Error message', error, null);
                })
        });

        $("#loadView").off('click');
        $("#loadView").on('click', function (event) {
            //console.log('model.VIEWS ', model.VIEWS)
            // let view = $("#osy-views").val();
            // model.VIEW = view;
            //console.log('model.VIEW ', model.VIEW)
            if ( model.VIEW == 'null'){
                ng.viewDefinition = model.DEFAULTVIEW;
                app.pivotChart.header = '';
            }else{
                $.each(model.VIEWS[model.param], function (id, obj) {
                    if(obj['osy-viewId'] == model.VIEW){
                        ng.viewDefinition = obj['osy-viewdef'];
                        app.pivotChart.header = obj['osy-viewname']
                        //break;
                    }
                });
            }

        });

        $("#osy-views").off('change');
        $('#osy-views').on('change', function () {
            model.VIEW = this.value;
        });

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
                const VIEWS = Osemosys.getResultData(casename, 'viewDefinitions.json');
                promise.push(VIEWS);
                const DATA = Osemosys.getResultData(casename, 'RYT.json');
                promise.push(DATA);
                return Promise.all(promise);
            })
            .then(data => {
                
                let [casename, genData, resData, PARAMETERS, VIEWS, DATA] = data;
                let model = new Model(casename, genData, resData, PARAMETERS, DATA, VIEWS);
                this.initPage(model);
                this.initEvents(model);
            })
            .catch(error => {
                setTimeout(function () {
                    if (error.status_code == 'CaseError') {
                        MessageSelect.init(Pivot.refreshPage.bind(Pivot));
                    }
                    else if (error.status_code == 'ActivityError') {
                        MessageSelect.activity(Pivot.refreshPage.bind(Pivot), error.casename);
                    }
                    Message.warning(error.message);
                }, 500);
            });
    }

    static initEvents(model) {

        let $divGrid = $('#osy-gridPivot');
        let $divChart = $('#osy-chartPivot');

        $("#casePicker").off('click');
        $("#casePicker").on('click', '.selectCS', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var casename = $(this).attr('data-ps');
            Pivot.refreshPage(casename);
            Html.updateCasePicker(casename);
            Message.smallBoxConfirmation("Confirmation!", "Model " + casename + " selected!", 3500);
        });

        
        
        // $("#osy-params").off('change');
        // $('#osy-params').on('change', function () {
        //     Message.clearMessages();
        //     model.group = model.VARGROUPS[this.value]['group'];
        //     model.param = this.value;
        //     console.log('model.param ', model.param);
        //     console.log('param change')

        //     Osemosys.getResultData(model.casename, model.group+'.json')
        //     .then(DATA => {

        //         Html.title(model.casename, model.PARAMNAMES[model.group][model.param], 'pivot');

        //         console.log('DATA ', DATA);
        //         let pivotData = DataModelResult.getPivot(DATA[model.param], model.genData['osy-years']);
        //         console.log('pivotData ', pivotData);

        //         model.pivotData = pivotData;


        //         // let app = {};

        //         // app.chartTypes = [
        //         //     { name: 'Column', value: wijmo.olap.PivotChartType.Column },
        //         //     { name: 'Bar', value: wijmo.olap.PivotChartType.Bar },
        //         //     { name: 'Scatter', value: wijmo.olap.PivotChartType.Scatter },
        //         //     { name: 'Line', value: wijmo.olap.PivotChartType.Line },
        //         //     { name: 'Area', value: wijmo.olap.PivotChartType.Area },
        //         //     { name: 'Pie', value: wijmo.olap.PivotChartType.Pie },
        //         // ];
        
        //         // app.panel = new wijmo.olap.PivotPanel('#pivotPanel');
        
        //         // var ng = app.panel.engine;
        
        //         // app.pivotGrid = new wijmo.olap.PivotGrid('#pivotGrid', {
        //         //     itemsSource: app.panel,
        //         //     showSelectedHeaders: 'All'
        //         // });
        //         // app.pivotChart = new wijmo.olap.PivotChart('#pivotChart', {
        //         //     itemsSource: app.panel,
        //         //     showLegend: 'Auto'
        //         // });
        //         // app.cmbChartType = new wijmo.input.ComboBox('#cmbChartType', {
        //         //     itemsSource: app.chartTypes,
        //         //     displayMemberPath: 'name',
        //         //     selectedValuePath: 'value',
        //         //     selectedIndexChanged: function (s, e) {
        //         //         app.pivotChart.chartType = s.selectedValue;
        //         //     }
        //         // });
        
        
        //         // ng.itemsSource = model.pivotData
        //         // ng.rowFields.push('Case', 'Tech', 'Comm', 'MoId', 'Ts');
        //         // //ng.rowFields.push('Case', 'Tech');
        //         // ng.columnFields.push('Year');
        //         // ng.valueFields.push('Value');
                
        //     })
        //     .catch(error => {
        //         Message.danger(error.message);
        //     });            
        // });

        // $("#osy-params").off('change');
        // $('#osy-params').on('change', function () {
        //     Message.clearMessages();
        //     model.group = model.VARGROUPS[this.value]['group'];
        //     model.param = this.value;
        //     console.log('model.param ', model.param);
        //     console.log('param change')
        //     // $('#osy-pivotGrid').jqxPivotGrid('destroy');
        //     // $('#osy-pivotGridDesigner').empty();
        //     // $('#osy-pivotGrid').empty();

        //     Osemosys.getResultData(model.casename, model.group+'.json')
        //     .then(DATA => {

        //         Html.title(model.casename, model.PARAMNAMES[model.group][model.param], 'pivot');

        //         console.log('DATA ', DATA);
        //         let pivotData = DataModelResult.getPivot(DATA[model.param], model.genData['osy-years']);
        //         console.log('pivotData ', pivotData);

        //         model.pivotData = pivotData;
                

        //         ng.itemsSource = model.pivotData
        //         ng.rowFields.push('Case', 'Tech', 'Comm', 'MoId', 'Ts');
        //         ng.valueFields.push('Years');
                
        //         //Grid.pivotGrid(model.pivotData);
        //         //$('#osy-pivotGrid').jqxPivotGrid('refresh');


        //     //     $('#osy-pivotGrid').on('pivotitemselectionchanged', function (event) {
        //     //         console.log('Pivot item: ' + event.args.pivotItem + ' , selected:' + event.args );
        //     //    });

        //     //    var myPivotGridRows = $('#osy-pivotGrid').jqxPivotGrid('getPivotRows');
        //     //     console.log('rows ', myPivotGridRows.items);

        //         // var myPivotGridRows = $('#osy-pivotGrid').jqxPivotGrid('getSelectedCells');
        //         // console.log('The pivot grid has ',myPivotGridRows );

        //     })
        //     .catch(error => {
        //         Message.danger(error.message);
        //     });            
        // });




        $("#btnGridParam").off('click');
        $("#btnGridParam").on('click', function (e) {
            e.preventDefault();
            var myPivotGridRows = $('#osy-pivotGrid').jqxPivotGrid('getPivotRows');
            //console.log('rows ', myPivotGridRows.items);
            var myPivotGridCells = $('#osy-pivotGrid').jqxPivotGrid('getPivotCells');
            //console.log(myPivotGridCells)
        });



        //////////////////////////////////////////////////////////
        $("#osy-ryt").off('change');
        $('#osy-ryt').on('change', function () {
            Message.clearMessages();
            //console.log('model.RYTCdata ',model.RYTCdata[this.value])
            if (model.RYTCdata[this.value][model.case].length === 0) {
                MessageSelect.activity(RYTC.refreshPage.bind(Pivot), model.casename);
                Message.warning(`There is no data definded for ${model.PARAMNAMES[this.value]} for model ${model.casename}!`);
            } else {
                Html.title(model.casename, model.PARAMNAMES[this.value], GROUPNAMES[model.group]);
                model.param = this.value;

                // model.srcGrid.root = this.value;
                model.srcGrid.localdata = model.gridData[this.value][model.case];
                $divGrid.jqxGrid('updatebounddata');
                
                Html.ddlTechsArray(model.techs[model.param][model.case])

                var configChart = $divChart.jqxChart('getInstance');
                var tech = $("#osy-techs").val();
                // var comm = $("#osy-comms").val();
                configChart.source.records = model.chartData[this.value][model.case][tech];
                configChart.update();
                // /$('#definition').html(`${DEF[model.group][model.param].definition}`);
            }
        });

        $('#osy-cases').on('change', function () {
            model.case = this.value;
            model.srcGrid.localdata = model.gridData[model.param][this.value];
            $divGrid.jqxGrid('updatebounddata');

            var tech = $("#osy-techs").val();
            var configChart = $divChart.jqxChart('getInstance');
            //console.log(model.param,this.value,model.tech)
            configChart.source.records = model.chartData[model.param][this.value][model.tech];
            configChart.update();
        });

        $("#osy-techs").off('change');
        $('#osy-techs').on('change', function () {
            model.tech = this.value;
            var configChart = $divChart.jqxChart('getInstance');
            configChart.source.records = model.chartData[model.param][model.case][this.value];
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
        $("#exportPng").on('click', function () {
            $("#osy-chartPivot").jqxChart('saveAsPNG', 'Pivot.png', 'https://www.jqwidgets.com/export_server/export.php');
        });

        let res = true;
        $("#resizeColumns").off('click');
        $("#resizeColumns").on('click', function () {
            if (res) {
                // $divGrid.jqxGrid('autoresizecolumn', 'Sc');
                $divGrid.jqxGrid('autoresizecolumn', 'Tech');
                $divGrid.jqxGrid('autoresizecolumn', 'Comm');
            }
            else {
                $divGrid.jqxGrid('autoresizecolumns');
            }
            res = !res;
        });

        $("#xlsAll").off('click');
        $("#xlsAll").on('click', function (e) {
            e.preventDefault();
            $("#osy-gridPivot").jqxGrid('exportdata', 'xls', 'Pivot');
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