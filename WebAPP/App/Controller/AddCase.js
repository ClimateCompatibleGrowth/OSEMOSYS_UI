import { Message } from "../../Classes/Message.Class.js";
import { DefaultObj } from "../../Classes/DefaultObj.Class.js";
import { Base } from "../../Classes/Base.Class.js";
import { SyncS3 } from "../../Classes/SyncS3.Class.js";
import { Html } from "../../Classes/Html.Class.js";
import { Grid } from "../../Classes/Grid.Class.js";
import { Osemosys } from "../../Classes/Osemosys.Class.js";
import { SmartAdmin } from "../../Classes/SmartAdmin.Class.js";
import { Model } from "../Model/AddCase.Model.js";
import { Navbar } from "./Navbar.js";
import { DEF } from "../../Classes/Definition.Class.js";
import { Sidebar } from "./Sidebar.js";

export default class AddCase {
    static onLoad() {
        Base.getSession()
            .then(response => {
                let casename = response.session;
                const promise = [];
                let genData = Osemosys.getData(casename, 'genData.json');
                promise.push(genData);
                const resData = Osemosys.getResultData(casename, 'resData.json');
                promise.push(resData);
                const PARAMETERS = Osemosys.getParamFile();
                promise.push(PARAMETERS);
                return Promise.all(promise);
            })
            .then(data => {
                let [genData, resData, PARAMETERS] = data;
                let model = new Model(genData, resData, PARAMETERS, "AddCase");
                
                this.initPage(model);
            })
            .catch(error => {
                Message.danger(error);
            });
    }

    static initPage(model) {
        Message.clearMessages();
        //$('a[href="#tabComms"]').click();
        //Navbar.initPage(model.casename, model.pageId);

        Html.title(model.casename, model.title, "create & edit");
        Html.genData(model);

        Grid.commGrid(model.commodities);
        Grid.techsGrid(model.techs, model.commodities, model.techGroups, model.emissions, model.commNames, model.emiNames, model.techGroupNames);
      
        Grid.techGroupGrid(model.techGroups);
        Grid.emisGrid(model.emissions);
        Grid.scenarioGrid(model.scenarios);
        Grid.constraintGrid(model.techs, model.constraints, model.techNames);

        if (model.casename == null) {
            $('#osy-save').show();
            $('#osy-update').hide();
            Message.info("Please select existing or create new model!");
        } else {
            $("#osy-new").show();
            $('#osy-update').show();
            $('#osy-save').hide();
        }
        loadScript("References/smartadmin/js/plugin/ion-slider/ion.rangeSlider.min.js", SmartAdmin.rangeSlider.bind(null, model.years));
        pageSetUp();
        this.initEvents(model);
    }

    static refreshPage(casename) {
        Base.setSession(casename)
            .then(response => {
                Message.clearMessages();
                const promise = [];
                let genData = Osemosys.getData(casename, 'genData.json');
                promise.push(genData);
                const resData = Osemosys.getResultData(casename, 'resData.json');
                promise.push(resData);
                const PARAMETERS = Osemosys.getParamFile();
                promise.push(PARAMETERS);
                return Promise.all(promise);
            })
            .then(data => {
                let [genData, resData, PARAMETERS] = data;
                let model = new Model(genData, resData, PARAMETERS, "AddCase");
                AddCase.initPage(model);
            })
            .catch(error => {
                Message.bigBoxDanger(error);
            })
    }

    static initEvents(model) {

        //console.log('model ', model)
        let $divTech = $("#osy-gridTech");
        let $divTechGroup = $("#osy-gridTechGroup");
        let $divComm = $("#osy-gridComm");
        let $divEmi = $("#osy-gridEmis");
        let $divScenario = $("#osy-gridScenario");
        let $divConstraint = $("#osy-gridConstraint");

        $("#casePicker").off('click');
        $("#casePicker").on('click', '.selectCS', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var casename = $(this).attr('data-ps');
            Html.updateCasePicker(casename);
            Sidebar.Reload(casename);
            AddCase.refreshPage(casename);
            Message.smallBoxInfo("Case selection", casename + " is selected!", 3000);
        });

        function render(message, input) {
            if (this._message) {
                this._message.remove();
            }
            this._message = $("<span class='jqx-validator-error-label'>" + message + "</span>")
            this._message.appendTo("#yearsselectmsg");
            Message.smallBoxWarning("Selection", "Model has to have one year at least!", 3000);
            return this._message;
        }

        $("#osy-caseForm").jqxValidator({
            hintType: 'label',
            animationDuration: 500,
            rules: [
                { input: '#osy-casename', message: "Model name is required field!", action: 'keyup', rule: 'required' },
                {
                    input: '#osy-casename', message: "Entered model name is not allowed!", action: 'keyup', rule: function (input, commit) {
                        var casename = $("#osy-casename").val();
                        var result = (/^[a-zA-Z0-9-_ ]*$/.test(casename));
                        return result;
                    }
                },
                { input: '#osy-mo', message: "Mode of operation is required field!", action: 'keyup', rule: 'required' },
                {
                    input: '#osy-mo', message: "Mode of operation should positive value!", action: 'keyup', rule: function (input, commit) {
                        var dr = $("#osy-mo").val();
                        return dr < 1 || isNaN(dr) ? false : true;
                    }
                },
                { input: '#osy-ns', message: "Number of seasons is required field!", action: 'keyup', rule: 'required' },
                {
                    input: '#osy-ns', message: "Number of seasons should be zero or positive value!", action: 'keyup', rule: function (input, commit) {
                        var dr = $("#osy-ns").val();
                        return dr < 0 || isNaN(dr) ? false : true;
                    }
                },
                { input: '#osy-dt', message: "Day type is required field!", action: 'keyup', rule: 'required' },
                {
                    input: '#osy-dt', message: "Day type should be zero or positive value!", action: 'keyup', rule: function (input, commit) {
                        var dr = $("#osy-dt").val();
                        return dr < 0 || isNaN(dr) ? false : true;
                    }
                },
                { input: '#osy-date', message: "Date is required field!", action: 'change', rule: 'required' },
                {
                    input: '#osy-years', message: 'Select at least one year', action: 'change', hintRender: render, rule: function () {
                        var elements = $('#osy-years').find('input[type=checkbox]');
                        var check = false;
                        var result = $.grep(elements, function (element, index) {
                            if (element.checked == true)
                                check = true;
                        });
                        return (check);
                    }
                }
            ]
        });

        $("#osy-new").on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            //$( "#wid-id-8" ).tabs({ active: 'tabComms' });
            //$("#wid-id-8").tabs("option", "active", 0);
            AddCase.refreshPage(null);
            //Sidebar.Load(null, null)
            Sidebar.Reload(null);
            $("#osy-new").hide();
            $('#osy-update').hide();
            $('#osy-save').show();
            Message.smallBoxConfirmation("Confirmation!", "Configure new Model!", 3500);
        });

        $("#osy-save").off('click');
        $("#osy-save").on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $("#osy-caseForm").jqxValidator('validate')
        });

        $("#osy-update").off('click');
        $("#osy-update").on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $("#osy-caseForm").jqxValidator('validate')
        });

        $("#osy-caseForm").off('validationSuccess');
        $("#osy-caseForm").on('validationSuccess', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var casename = $("#osy-casename").val().trim();
            var desc = $("#osy-desc").val().trim();
            var date = $("#osy-date").val();
            var currency = $("#osy-currency").val();
            var mo = $("#osy-mo").val().trim();
            var ns = $("#osy-ns").val().trim();
            var dt = $("#osy-dt").val().trim();

            var years = new Array();
            $.each($('input[type="checkbox"]:checked'), function (key, value) {
                years.push($(value).attr("id"));
            });

            let POSTDATA = {
                "osy-version": "4.5",
                "osy-casename": casename,
                "osy-desc": desc,
                "osy-date": date,
                "osy-currency": currency,
                "osy-ns": ns,
                "osy-dt": dt,
                "osy-mo": mo,
                "osy-tech": model.techs,
                "osy-techGroups": model.techGroups,
                "osy-comm": model.commodities,
                "osy-emis": model.emissions,
                "osy-scenarios": model.scenarios,
                "osy-constraints": model.constraints,
                "osy-years": years
            }

            Osemosys.saveCase(POSTDATA)
                .then(response => {
                    if (response.status_code == "created") {
                        $("#osy-new").show();
                        $('#osy-update').show();
                        $('#osy-save').hide();
                        Message.clearMessages();
                        Message.bigBoxSuccess('Model message', response.message, 3000);
                        Html.appendCasePicker(casename, casename);
                        Sidebar.Reload(casename);
                        $("#osy-case").html(casename);
                        if (Base.AWS_SYNC == 1) {
                            SyncS3.deleteResultsPreSync(casename)
                                .then(response => {
                                    SyncS3.uploadSync(casename);
                                });
                        }
                    }
                    if (response.status_code == "edited") {
                        Html.title(casename, 'Model', 'create & edit');
                        $("#osy-new").show();
                        Navbar.initPage(casename);
                        Sidebar.Reload(casename);
                        Message.bigBoxInfo('Model message', response.message, 3000);
                        if (Base.AWS_SYNC == 1) {
                            SyncS3.deleteResultsPreSync(casename)
                                .then(response => {
                                    SyncS3.uploadSync(casename);
                                });
                        }
                    }
                    if (response.status_code == "exist") {
                        $("#osy-new").show();
                        Message.bigBoxWarning('Model message', response.message, 3000);
                    }
                })
                .catch(error => {
                    Message.bigBoxDanger('Error message', error, null);
                })
        });

        //TECHNOLOGIES GRID AND EVENTS
        $("#osy-addTech").off('click');
        $("#osy-addTech").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultTech = DefaultObj.defaultTech();
            //tech grid se pravi dinalicki potrebno je updatovati model
            //JSON parse strungify potrebno da iz nekog razloga izbacino elemente uid boundindex...
            model.techs.push(JSON.parse(JSON.stringify(defaultTech[0], ['TechId', 'Tech', 'Desc', 'CapUnitId', 'ActUnitId', 'TG', 'IAR', 'OAR', "INCR", "ITCR", 'EAR'])));
            //model.techs.push(defaultTech[0]);
            //update technames
            model.techNames[defaultTech[0]['TechId']] = defaultTech[0]['Tech'];
            //add row in grid
            $divTech.jqxGrid('addrow', null, defaultTech);
            //upat eza broj techs u tabu
            model.techCount++;
            $("#techCount").text(model.techCount);
        });

        $(document).undelegate(".deleteTech", "click");
        $(document).delegate(".deleteTech", "click", function (e) {
            //$(".deleteTech").on("click", function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            if (id != 0) {
                var techId = $divTech.jqxGrid('getcellvalue', id, 'TechId');
                var rowid = $divTech.jqxGrid('getrowid', id);
                $divTech.jqxGrid('deleterow', rowid);
                model.techs.splice(id, 1);
                //update techNames
                delete model.techNames[techId];
                //update count
                model.techCount--;
                $("#techCount").text(model.techCount);
                //izbrisati iz model constraints eventualne tehnologijel koje smo izbrisali
                $.each(model.constraints, function (id, conObj) {
                    conObj['CM'] = conObj['CM'].filter(item => item !== techId);
                });
            }
        });

        $divTech.on('cellvaluechanged', function (event) {
            Pace.restart();
            var args = event.args;
            var column = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            var value = args.newvalue.trim();
            if (column == 'CapUnitId' || column == 'ActUnitId') {
                Message.bigBoxWarning('Unit change warninig!', 'Changing technology unit will not recalculate entered nor default values in the model.', 3000);
            }
            if (column != 'IAR' && column != 'OAR' && column != 'EAR' && column != 'INCR' && column != 'ITCR'  && column != 'TG') {
                model.techs[rowBoundIndex][column] = value;
            } else {
                if (value.includes(',') && value) {
                    var array = value.split(',');
                } else if (value) {
                    var array = [];
                    array.push(value);
                } else {
                    var array = [];
                }
                model.techs[rowBoundIndex][column] = array;
            }
            if (column == 'Tech') {
                var techId = $divTech.jqxGrid('getcellvalue', rowBoundIndex, 'TechId');
                model.techNames[techId] = value;
            }
        });


        $("#osy-addTechGroup").off('click');
        $("#osy-addTechGroup").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultTechGroup = DefaultObj.defaultTechGroup();
            //tech grid se pravi dinalicki potrebno je updatovati model
            //JSON parse strungify potrebno da iz nekog razloga izbacino elemente uid boundindex...
            model.techGroups.push(JSON.parse(JSON.stringify(defaultTechGroup[0], ['TechGroupId', 'TechGroup', 'Desc'])));
            //model.techs.push(defaultTech[0]);
            //update technames
            model.techGroupNames[defaultTechGroup[0]['TechGroupId']] = defaultTechGroup[0]['TechGroup'];
            //add row in grid
            $divTechGroup.jqxGrid('addrow', null, defaultTechGroup);
            //upat eza broj techs u tabu
            model.techGroupCount++;
            $("#techGroupCount").text(model.techGroupCount);
        });

        $(document).undelegate(".deleteTechGroup", "click");
        $(document).delegate(".deleteTechGroup", "click", function (e) {
            //$(".deleteTech").on("click", function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            if (id != 0) {
                var techGroupId = $divTechGroup.jqxGrid('getcellvalue', id, 'TechGroupId');
                var rowid = $divTechGroup.jqxGrid('getrowid', id);
                $divTechGroup.jqxGrid('deleterow', rowid);
                model.techGroups.splice(id, 1);
                //update techNames
                delete model.techGroupNames[techGroupId];
                //update count
                model.techGroupCount--;
                $("#techGroupCount").text(model.techGroupCount);
                //izbirsati iz modela za tech nz EAR za izbrisanu emisiju ako je slucajno odabrana za neku tehnologiju
                $.each(model.techs, function (id, techObj) {
                    techObj['TG'] = techObj['TG'].filter(item => item !== techGroupId);
                });
            }
        });

        $divTechGroup.on('cellvaluechanged', function (event) {
            var args = event.args;
            var column = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            var value = args.newvalue.trim();
            model.techGroups[rowBoundIndex][column] = value;

            if (column == 'TechGroup') {
                var techGroupId = $divTechGroup.jqxGrid('getcellvalue', rowBoundIndex, 'TechGroupId');
                model.techGroupNames[techGroupId] = value;
            }
        });

        //COMMODITIES GRID AND EVENTS
        $("#osy-addComm").off('click');
        $("#osy-addComm").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultComm = DefaultObj.defaultComm();
            model.commodities.push(JSON.parse(JSON.stringify(defaultComm[0], ['CommId', 'Comm', 'Desc', 'UnitId'])));

            //update commnames
            model.commNames[defaultComm[0]['CommId']] = defaultComm[0]['Comm'];
            //add row
            $divComm.jqxGrid('addrow', null, defaultComm);
            model.commCount++;
            $("#commCount").text(model.commCount);
        });

        $(document).undelegate(".deleteComm", "click");
        $(document).delegate(".deleteComm", "click", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            if (id != 0) {
                var commId = $divComm.jqxGrid('getcellvalue', id, 'CommId');
                var rowid = $divComm.jqxGrid('getrowid', id);
                $divComm.jqxGrid('deleterow', rowid);
                model.commodities.splice(id, 1);
                //update techNames
                delete model.commNames[commId];
                //update count
                model.commCount--;
                $("#commCount").text(model.commCount);
                //izbirsati iz modela za tech nz EAR za izbrisanu emisiju ako je slucajno odabrana za neku tehnologiju
                $.each(model.techs, function (id, techObj) {
                    techObj['IAR'] = techObj['IAR'].filter(item => item !== commId);
                    techObj['OAR'] = techObj['OAR'].filter(item => item !== commId);
                });
            }
        });

        $divComm.on('cellvaluechanged', function (event) {
            var args = event.args;
            var column = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            var value = args.newvalue.trim();
            model.commodities[rowBoundIndex][column] = value;
            if (column == 'UnitId') {
                Message.bigBoxWarning('Unit change warninig!', 'Changing commodity unit will not recalculate entered nor default values in the model.', 3000);
            }
            if (column == 'Comm') {
                var commId = $divComm.jqxGrid('getcellvalue', rowBoundIndex, 'CommId');
                model.commNames[commId] = value;
            }
        });

        //EMISSIONS GRID AND EVENTS
        $("#osy-addEmis").off('click');
        $("#osy-addEmis").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultEmi = DefaultObj.defaultEmi();
            model.emissions.push(JSON.parse(JSON.stringify(defaultEmi[0], ['EmisId', 'Emis', 'Desc', 'UnitId'])));
            //update commnames
            model.emiNames[defaultEmi[0]['EmisId']] = defaultEmi[0]['Emis'];
            //add row
            $divEmi.jqxGrid('addrow', null, defaultEmi);
            model.emisCount++;
            $("#emisCount").text(model.emisCount);
            $divEmi.jqxGrid('refresh');
        });

        $(document).undelegate(".deleteEmis", "click");
        $(document).delegate(".deleteEmis", "click", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            if (id != 0) {
                var emisId = $divEmi.jqxGrid('getcellvalue', id, 'EmisId');
                var rowid = $divEmi.jqxGrid('getrowid', id);
                $divEmi.jqxGrid('deleterow', rowid);
                model.emissions.splice(id, 1);
                //update emisnames
                delete model.emiNames[emisId];
                //update count
                model.emisCount--;
                $("#emisCount").text(model.emisCount);

                //izbirsati iz modela za tech nz EAR za izbrisanu emisiju ako je slucajno odabrana za neku tehnologiju
                $.each(model.techs, function (id, techObj) {
                    techObj['EAR'] = techObj['EAR'].filter(item => item !== emisId);
                    model.techs[id]['EAR'] = techObj['EAR'];
                });
            }
        });

        $divEmi.on('cellvaluechanged', function (event) {
            var args = event.args;
            var column = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            var value = args.newvalue.trim();
            model.emissions[rowBoundIndex][column] = value;
            if (column == 'UnitId') {
                Message.bigBoxWarning('Unit change warninig!', 'Changing emission unit will not recalculate entered nor default values in the model.', 3000);
            }
            if (column == 'Emis') {
                var emisId = $divEmi.jqxGrid('getcellvalue', rowBoundIndex, 'EmisId');
                model.emiNames[emisId] = value;
            }
        });

        //SCENARIOS GRID AND EVENTS
        $("#osy-addScenario").off('click');
        $("#osy-addScenario").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultSc = DefaultObj.defaultScenario();
            model.scenarios.push(JSON.parse(JSON.stringify(defaultSc[0], ['ScenarioId', 'Scenario', 'Desc', 'Active'])));
            //add scenario id to caserunByScenario
            model.caserunByScenario[defaultSc[0].ScenarioId] =[];
            $divScenario.jqxGrid('addrow', null, defaultSc);
            model.scenariosCount++;
            $("#scenariosCount").text(model.scenariosCount);
            $divScenario.jqxGrid('refresh');
        });

        $(document).undelegate(".deleteScenario", "click");
        $(document).delegate(".deleteScenario", "click", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            if (id != 0) {
                if(model.caserunByScenario[model.scenarios[id]['ScenarioId']].length != 0){
                    Message.bigBoxDanger('Alert', 
                        `You cannot delete this scenario. It is used in ${model.caserunByScenario[model.scenarios[id]['ScenarioId']]}  caserun(s)! 
                        Plese reomve these scenario from caseruns before deletion.`, null)
                }
                else{
                    let scId = model.scenarios[id]['ScenarioId'];
                    Osemosys.deleteScenarioCaseRuns(model.casename, scId)
                    .then(response=>{
                        //console.log('delete ', response)
                        var rowid = $divScenario.jqxGrid('getrowid', id);
                        $divScenario.jqxGrid('deleterow', rowid);
                        model.scenarios.splice(id, 1);
                        model.scenariosCount--;
                        $("#scenariosCount").text(model.scenariosCount);
                        Message.smallBoxInfo(response.message)
                    })
                    .catch(error => {
                        Message.bigBoxDanger(error);
                    })

                }
            }
        });

        $divScenario.on('cellvaluechanged', function (event) {
            var args = event.args;
            var datafield = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            var value = args.newvalue.trim();
            model.scenarios[rowBoundIndex][datafield] = value;
        });

        //CONSTRAINTS GRID AND EVENTS
        $("#osy-addConstraint").off('click');
        $("#osy-addConstraint").on("click", function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let defaultConstraint = DefaultObj.defaultConstraint();
            model.constraints.push(JSON.parse(JSON.stringify(defaultConstraint[0], ['ConId', 'Con', 'Desc', 'Tag', 'CM'])));

            $divConstraint.jqxGrid('addrow', null, defaultConstraint);
            $divConstraint.jqxGrid('updatebounddata', 'data');
            model.constraintsCount++;
            $("#constraintsCount").text(model.constraintsCount);
            //$divConstraint.jqxGrid('refresh');
        });

        $(document).undelegate(".deleteConstraint", "click");
        $(document).delegate(".deleteConstraint", "click", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = $(this).attr('data-id');
            //no condition needed, we can delete all constraints
            //if(id!=0){
            var conId = $divConstraint.jqxGrid('getcellvalue', id, 'ConId');
            var rowid = $divConstraint.jqxGrid('getrowid', id);
            $divConstraint.jqxGrid('deleterow', rowid);
            model.constraints.splice(id, 1);
            //smanji counter za broj emisjia i update html
            model.constraintsCount--;
            $("#constraintsCount").text(model.constraintsCount);

            //izbirsati iz modela za tech nz EAR za izbrisanu emisiju ako je slucajno odabrana za neku tehnologiju
            // $.each(model.techs, function (id, techObj) {
            //     techObj['EAR'] =  techObj['EAR'].filter(item => item !== emisId);
            //     model.techs[id]['EAR'] = techObj['EAR'];
            // });
            //}
        });

        $divConstraint.on('cellvaluechanged', function (event) {
            var args = event.args;
            var column = event.args.datafield;
            var rowBoundIndex = args.rowindex;
            //console.log('newvalue ', args.newvalue)
            if(typeof args.newvalue !== 'object'){
                var value = args.newvalue.trim();
            }else{
                var value = args.newvalue;
            }
            

            if (column != 'CM' && column != 'Tag') {
                model.constraints[rowBoundIndex][column] = value;
            } else if (column == 'CM') {
                if (value.includes(',') && value) {
                    var array = value.split(',');
                } else if (value) {
                    var array = [];
                    array.push(value);
                } else {
                    var array = [];
                }
                model.constraints[rowBoundIndex][column] = array;
            } else if (column == 'Tag') {
                //console.log('eqyuality ', value.value)
                model.constraints[rowBoundIndex][column] = value.value;
            }
        });

        //TABS CHANGE EVENT
        $(".nav-tabs li a").off('click');
        $('.nav-tabs li a').on("click", function (event, ui) {
            var id = $(this).attr('id');
            //update tech grid to update IAR OAR EAR with new added or removed comms and emis
            if (id == 'Techs') {
                //Grid.techsGrid(model.techs, model.commodities, model.emissions, model.commNames, model.emiNames);
                //$divTech.jqxGrid('clear');
                $divTech.jqxGrid('updatebounddata');
            }
            else if (id == 'Constraints') {
                //Grid.constraintGrid(model.techs, model.constraints, model.techNames);
                $divConstraint.jqxGrid('updatebounddata');
            }
            // else if (id == 'Techs'){
            //     $divTech.jqxGrid('updatebounddata');
            // }
        });

        //YEARS EVENTS
        $("#osy-checkAll").on("click", function (event) {
            event.preventDefault();
            var elements = $('#osy-years').find('input[type=checkbox]');
            $.grep(elements, function (element, index) {
                element.checked = true;
            });
            $("#osy-caseForm").jqxValidator('validateInput', '#osy-years');
        });

        $("#osy-uncheckAll").on("click", function (event) {
            event.preventDefault();
            var elements = $('#osy-years').find('input[type=checkbox]');
            $.grep(elements, function (element, index) {
                element.checked = false;
            });
            $("#osy-caseForm").jqxValidator('validateInput', '#osy-years');
        });

        $("#osy-x2").on("click", function (event) {
            event.preventDefault();
            var elements = $('#osy-years').find('input[type=checkbox]');
            $.grep(elements, function (element, index) {
                if ((index) % 2 == 0)
                    element.checked = true;
            });
            $("#osy-caseForm").jqxValidator('validateInput', '#osy-years');
        });

        $("#osy-x5").on("click", function (event) {
            event.preventDefault();
            var elements = $('#osy-years').find('input[type=checkbox]');
            $.grep(elements, function (element, index) {
                if ((index) % 5 == 0)
                    element.checked = true;
            });
            $("#osy-caseForm").jqxValidator('validateInput', '#osy-years');
        });

        $("#showLog").click(function (e) {
            e.preventDefault();
            $('#definition').html(`
                <h5>${DEF[model.pageId].title}</h5>
                ${DEF[model.pageId].definition}
            `);
            $('#definition').toggle('slow');
        });
    }
}





