import { DataModel } from "../../Classes/DataModel.Class.js";
import { DataModelResult } from "../../Classes/DataModelResult.Class.js";

export class Model {

    constructor(casename, genData, resData, RYTEMdata, group, PARAMETERS, param) {
        this.d = 2;
        this.decimal = 'd' + this.d;
        if (casename) {

            let datafields = [];
            let datafieldsChart = [];
            let columns = [];
            let series = [];

            let years = genData['osy-years'];
            let cases = resData['osy-cases'];
            let cs = cases[0].Case;

            let RYTEMgrid = DataModelResult.RYTEMgrid(RYTEMdata, genData, PARAMETERS);

        
            let RYTEMchart = DataModelResult.RYTEMchart(genData, RYTEMdata);
            let ActivityTechs = DataModelResult.RYTEMTechs(RYTEMdata);            
            let ActivityEmis = DataModelResult.RYTEMEmis(RYTEMdata);

            let PARAMNAMES = DataModel.ParamName(PARAMETERS[group]);
            let mods = DataModel.Mods(genData);



            datafieldsChart.push({ name: 'Year', type: 'string' });
            $.each(mods, function (id, mod) {
                datafieldsChart.push({ name: mod, type: 'number' });
                series.push({ dataField: mod, displayText: `Mod ${mod}` });
            });

            // datafields.push({ name: 'ScId', type: 'string' });
            // datafields.push({ name: 'Sc', type: 'string' });

            // datafields.push({ name: 'TechId', type: 'string' });
            datafields.push({ name: 'Tech', type: 'string' });
            // datafields.push({ name: 'EmisId', type: 'string' });
            datafields.push({ name: 'Emi', type: 'string' });
            datafields.push({ name: 'MoId', type: 'string' });
            datafields.push({ name: 'UnitId', type: 'string' });

            // datafields.push({ name: 'ScDesc', type: 'string' });
            datafields.push({ name: 'EmiDesc', type: 'string' });
            datafields.push({ name: 'TechDesc', type: 'string' });


            let cellsrenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                if (value === null || value === '') {
                    return '<span style="margin: 4px; float:right; ">n/a</span>';
                } else {
                    var formattedValue = $.jqx.dataFormat.formatnumber(value, this.decimal);
                    return '<span style="margin: 4px; float:right; ">' + formattedValue + '</span>';
                }

            }.bind(this);


            //columns.push({ text: 'Scenario', datafield: 'Sc', pinned: true, editable: false, align: 'left' });
            columns.push({ text: 'Technology', datafield: 'Tech', pinned: true, editable: false, align: 'center' });
            columns.push({ text: 'Emission', datafield: 'Emi', pinned: true, editable: false, align: 'center' });
            columns.push({ text: 'MoO', datafield: 'MoId', pinned: true, editable: false, align: 'center', cellsalign: 'center' });
            columns.push({ text: 'Unit', datafield: 'UnitId', pinned: true, editable: false, align: 'center', cellsalign: 'center' });
            
            $.each(years, function (id, year) {
                datafields.push({ name: year, type: 'number' });
                columns.push({
                    text: year, datafield: year, cellsalign: 'right', align: 'center', columntype: 'numberinput', cellsformat: 'd2',
                    groupable: false,
                    cellsrenderer: cellsrenderer
                });
            });

            var srcGrid = {
                datatype: "json",
                localdata: RYTEMgrid[param][cs],
                //root: param,
                datafields: datafields,
            };

            console.log(ActivityTechs[param][cs][0] , ActivityEmis[param][cs][ActivityTechs[param][cs][0]][0])
            var srcChart = {
                datatype: "json",
                localdata: RYTEMchart[param][cs][ActivityTechs[param][cs][0]][ActivityEmis[param][cs][ActivityTechs[param][cs][0]][0]],
                //root: param + '>' + ActivityTechsEmis[0]['TechId'] + '>' + ActivityEmis[ActivityTechsEmis[0]['TechId']][0]['EmisId'] + '>' + mods[0],
                datafields: datafieldsChart,
            };

            this.casename = casename;
            this.years = years;
            this.cases = cases;
            this.case = cs;
            this.techs = ActivityTechs[param][cs];
            this.tech = ActivityTechs[param][cs][0];
            this.emis = ActivityEmis[param][cs][this.tech];
            this.emi = ActivityEmis[param][cs][this.tech][0];     
            this.mods = mods;
            this.datafields = datafields;
            this.datafieldsChart = datafieldsChart;
            this.columns = columns;
            this.series = series;
            this.gridData = RYTEMgrid;
            this.chartData = RYTEMchart;
            this.genData = genData;
            this.param = param;
            this.PARAMNAMES = PARAMNAMES;
            this.group = group;
            this.srcGrid = srcGrid;
            this.srcChart = srcChart;
            this.PARAMETERS = PARAMETERS;
        } else {
            this.casename = null;
            this.years = null;
            this.techs = null;
            this.datafields = null;
            this.datafieldsChart = null;
            this.columns = null;
            this.columns = null;
            this.gridData = null;
            this.chartData = null;
            this.genData = null;
            this.param = param;
            this.PARAMNAMES = PARAMNAMES;
            this.group = group;
            this.srcGrid = null;
            this.srcChart = null;
            this.PARAMETERS = PARAMETERS;
        }
    }
}