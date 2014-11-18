/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.startCardReader(); //cfries- added
    },
    startCardReader: function() {
        //alert("start cardreader");
        if(typeof cardreader != "undefined")
        {
            var success = function(uid) {
                if(localStorage.getItem("rsvp") == "true" || localStorage.getItem("enforcedeligibility") == "true")
                {
                    //reset intakeId for RSVP
                    localStorage.setItem("intakeid", -1);
                    CheckIn(uid, false, true);
                }
                else
                {
                    SignIn(uid, true);
                }
            };
            var error = function(message) {
                //alert(message);
				showCardReaderErrorAlert("Please reswipe your BruinCard");
                /*
                $( "#dialog" ).on( "dialogclose", function( event, ui ) {
                                  app.stopCardReader();
                                  window.open("login.html", "_self");} );*/
                
            };
            cardreader.startCardReader(success, error);
        }
    },
    stopCardReader: function(){
        //alert("stop cardreader");
        if(typeof cardreader != "undefined")
        {
            var success = function() { };
            var error = function(message) { //showDialog("Error: " + message);
			showCardReaderErrorAlert("Error: " + message);};
            cardreader.closeCardReader(success, error);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function ClickBruincard(){
    //debugger;
//	console.log('Cancel click..');
    $('#div_logon').css('display', 'none');
    $('#div_signin_method').css('display', 'block');
    $('#div_bruincard').css('display', 'block');
    $('#div_header').removeClass('invisible');
    $('#div_header_cancel').addClass('invisible');
    
    //app.startCardReader();
}

function ClickLogon(){
    //debugger;
    $('#div_bruincard').css('display', 'none');
    $('#div_signin_method').css('display', 'none');
    $('#div_logon').css('display', 'block');
    
    $('#div_header').addClass('invisible');
    $('#div_header_cancel').removeClass('invisible');
    
    
    app.stopCardReader();
}


function SignInWithUclaLogon(){
    var uclaLogon = $.trim($('#txt_logon').val());
    if(uclaLogon != ""){
        $('#txt_logon').removeClass('Error');
        //app.stopCardReader();
        SignIn($('#txt_logon').val());
    }
    else
    {
        //ShowFlashMessage("Please enter your UCLA logon");
        $('#txt_logon').addClass('Error');
    }
}

function HandleMultipleForms()
{
    $("#singlePostForm").addClass("invisible");
    $("#multPostForms").addClass("invisible");
    
    var postFormsList = JSON.parse(localStorage.getItem("postformidlist"));
    if(postFormsList.length == 1)
    {
        $("#singlePostForm").removeClass("invisible");
    }
    else if(postFormsList.length > 1)
    {
        $("#multPostForms").removeClass("invisible");
        
        
        for(var i = 0 ; i < postFormsList.length ; i++)
        {
            $("#multPostFormsDropdown").append("<option value='" + postFormsList[i].IntakeID + "'>" +  postFormsList[i].LastUpdated + "</option>");
        }
        $("#multPostFormsDropdown").kendoDropDownList();
    }
    app1.navigate("#viewFormSelection");
}

function StartPreSession()
{
    SetQuestions(localStorage.getItem("preformid"));
    
    app1.navigate("#questions-body");
}

function StartPostSession()
{
    var postFormsList = JSON.parse(localStorage.getItem("postformidlist"));
    var formID;
    if(postFormsList.length == 1)
    {
        formID = postFormsList[0].FormID;
        localStorage.setItem("intakeID", postFormsList[0].IntakeID);
    }
    else if(postFormsList.length > 1)
    {
        localStorage.setItem("intakeID", $("#multPostFormsDropdown").val());
        for(var i = 0 ; i < postFormsList.length ; i++)
        {
            if(postFormsList[i].IntakeID == localStorage.getItem("intakeID"))
            {
                formID = postFormsList[i].FormID;
                break;
            }
        }
    }
    
    SetQuestions(formID);
    app1.navigate("#questions-body");
}

function SetQuestions(formid)
{
    var forms = JSON.parse(localStorage.getItem("allquestions"));
    for(var i = 0 ; i < forms.Questions.length ; i++)
    {
        if(forms.Questions[i].ID.trim() == formid)
        {
            localStorage.setItem("questions", JSON.stringify(forms.Questions[i]));
            return;
        }
    }
}

var startTimer1;
//self logging in
function SignIn(logon, isCardreader){
    isCardreader = typeof isCardreader != 'undefined' ? isCardreader : false;
    localStorage.setItem("cardswiped", isCardreader);

    var isRSVP = false;
    var submitIntake = false; //if no reasons list, immediately submit intake
    var qjson = JSON.parse(localStorage.getItem("questions"));
    var allqjson = JSON.parse(localStorage.getItem("allquestions"));
    if(allqjson.HasQuestions == false)
    {
        submitIntake = true;
    }
    if(localStorage.getItem("rsvp") == "true" || localStorage.getItem("enforcedeligibility") == "true"){
        isRSVP = true;
    }
    
	if ( !isOfflineMode() )
	   {
           startTimer1 = new Date().getTime();
           
			$.ajax({
				   type: "GET",
				   url: getAPIUrl() + "/api/validlogon",
				   data: {"logon": logon, "submitIntake": submitIntake, "appkey": localStorage.getItem("key"), "initialintakestatus": localStorage.getItem("initialintakestatus"), "locationID": localStorage.getItem("selLocationID"), "cardSwiped": localStorage.getItem("cardswiped"), "intakeid": localStorage.getItem("intakeID"), "isrsvp": isRSVP},
				   beforeSend: function(){
				   app.stopCardReader();
//				   console.log('before send..');
				   loading();
				   },
				   success: function(data){
                        var jsonobj = JSON.parse(data);
                   
                   
                        if(!isRSVP){
                            SetStudentData(jsonobj, submitIntake);
                        }
                       else{
                            SetRSVPStudentData(jsonobj);
                       }
                   
					
					//window.open("login.html?key=" + $('#txtAccessKey').val() + "&deptname=" + jsonobj.Data.DeptName ,"_self");
				   },
				   error: function (jqXHR, textStatus, errorThrown) {
                   //alert(jqXHR.responseText);
                        //showDialog("Invalid UCLA logon");
                        ShowFlashMessage("Invalid UCLA logon");
                        app.startCardReader();
                        //alert(jqXHR.responseText + ";\n\n" + textStatus + ";\n\n" + errorThrown);
				   },
				   complete: function(){
                            endLoading();
                        }
				   });
//           alert((endTimer1 - startTimer1));
		 }
		 else{
				 //get offline data
				  var offlineData = GetOfflineStudentData();
				  var jsonobj = JSON.parse(offlineData);
				  SetStudentData(jsonobj, submitIntake);
		 }
}

function SearchUser()
{//RSVP user search
    //reset IntakeId
    localStorage.setItem("intakeid", -1);
    
    var logonId =$('#txt_rsvp_eleg_uid').val();
    logonId = $.trim(logonId);
    //reset the controls which display student name, UID and status
    $('#spanSearchName').text("");
    $('#spanSearchUid').text("");
//    $('#divOverrideSuccess').addClass('DisplayNone');
//    $('#divOverrideFail').addClass('DisplayNone');
    $('#divSearchSuccess').addClass('DisplayNone');
    $('#divSearchFail').addClass('DisplayNone');
    var logonCtl = $('#txt_rsvp_eleg_uid');
    
    if(logonId != ""){
        DisplayRSVPCheckInButton(true);
        logonCtl.removeClass('Error');
        SignIn(logonCtl.val());
    }
    else{
        //highlight field
        logonCtl.addClass('Error');
    }
}

function SetRSVPStudentData(jsonobj){
    if(jsonobj.Data.IsValidLogon == true){
        //display RSVP search results
        DisplayRSVPSearchResults(true);

        var dictionaryObj = jsonobj.Data.DictionaryUserInfo;
        $('#spanSearchName').text(dictionaryObj.FirstName + " " + dictionaryObj.LastName);
        $('#spanSearchUid').text(dictionaryObj.UID);
    }
    else
    {
        //showDialog("Error: Invalid logon");
        ShowFlashMessage("Invalid logon");
        
        //Remove loading image
        endLoading();
    }
    
}

function SetStudentData(jsonobj, submitIntake)
{
		if(jsonobj.Data.IsValidLogon == true)
            {
                var dictionaryObj = jsonobj.Data.DictionaryUserInfo;
                localStorage.setItem("uid", dictionaryObj.UID);
                localStorage.setItem("firstname", dictionaryObj.FirstName)
                localStorage.setItem("lastname", dictionaryObj.LastName);
                localStorage.setItem("phone", dictionaryObj.Phone);
                localStorage.setItem("email", dictionaryObj.Email);
                
                var allquestionsjsonobj = JSON.parse(localStorage.getItem("allquestions"));
                if(allquestionsjsonobj.Questions.length > 1) //multiple forms
                {
                    localStorage.setItem("postformidlist", JSON.stringify(jsonobj.Data.FormsToDisplay.PostEvaluationForms)); //jsonarray
                    localStorage.setItem("preformid", jsonobj.Data.FormsToDisplay.PreEvaluationFormID);
                    
                    if(jsonobj.Data.FormsToDisplay.PostEvaluationForms.length > 0)
                    {
                        HandleMultipleForms();
                    }
                    else
                    {
                        StartPreSession(); //no post eval forms, go directly to pre eval
                    }
                }
                else
                {
                    if(!submitIntake)
                    {
    //                    window.open("reasons.html", "_self");
                        app1.navigate("#questions-body");
                        //var endTimer1 = new Date().getTime();
                        //console.log('time taken to authenticate..' + (endTimer1 - startTimer1));

                    }
                    else
                    {
    //                    window.open("thankyou.html", "_self");
                        app1.navigate("#questions-body");                    
                    }
                    //window.open("reasons.html?key=" + getUrlParameter('key') + "&uid=" + jsonobj.Data.UID + "&rsvp=" + getUrlParameter("rsvp") + "&anon=" + getUrlParameter("anon") + "&firstname=" + jsonobj.Data.DictionaryUserInfo.FirstName + "&lastname=" + jsonobj.Data.DictionaryUserInfo.LastName + "&phone=" + jsonobj.Data.DictionaryUserInfo.Phone + "&email=" + jsonobj.Data.DictionaryUserInfo.Email + "&initialintakestatus=" + getUrlParameter("initialintakestatus"), "_self");
                }
            }
		else
            {
                //showDialog("Error: Invalid logon");
				ShowFlashMessage("Invalid logon");

                //Remove loading image
                endLoading();
                //Remove loading image on kendo div - <div class="k-loading-mask ajax-spinner" style="width:100%;height:100%"></div>
                //$('#txt_logon').focus();
                app.startCardReader();
            }
}

function OverrideCheckIn(){
	CheckIn(localStorage.getItem('uid'), true, localStorage.getItem('cardswiped'));
}
var isManualRSVPCheckIn = false;
function RSVPCheckIn(){
    var logon = $('#spanSearchUid').text()
    CheckIn(logon, false);
//    app.stopCardReader();
}

//rsvp or eligibility check
function CheckIn(logon, isoverride, isCardreader){
    isCardreader = typeof isCardreader != 'undefined' ? isCardreader : false;
    localStorage.setItem("cardswiped", isCardreader);
    var type = -1; //if rsvp or enforced eligibility
//    console.log('param logon:' + logon);
    if(localStorage.getItem("rsvp") == "true")
    {
        type = 0;
    }
    else if(localStorage.getItem("enforcedeligibility"))
    {
        type = 1;
    }
    console.log('checking in.. type:' + type + ' isoverride:' + isoverride);
    $.ajax({
           type: "GET",
           url: getAPIUrl() + "/api/checkineventuser",
           data: {"appid": localStorage.getItem("appid"), "uid": logon, "overrideRegistration": isoverride, "type": type, "initialintakestatus": localStorage.getItem("initialintakestatus"), "locationID": localStorage.getItem("selLocationID"), "appKey": localStorage.getItem("key"), "cardswiped": localStorage.getItem("cardswiped"), "intakeId": localStorage.getItem("intakeid")},
           beforeSend: function(){
                app.stopCardReader();
           loading();
           },
           success: function(data){
               //alert(data);
               var jsonobj = JSON.parse(data);
                if(jsonobj.Data.UserInfo.IsValidLogon == false)
                {
                    //showDialog("Not valid logon");
					ShowFlashMessage("Not valid logon");
                }
               else
               {
           
                   localStorage.setItem("uid", jsonobj.Data.UserInfo.DictionaryUserInfo.UID);
                   localStorage.setItem("firstname", jsonobj.Data.UserInfo.DictionaryUserInfo.FirstName)
                   localStorage.setItem("lastname", jsonobj.Data.UserInfo.DictionaryUserInfo.LastName);
                   localStorage.setItem("phone", jsonobj.Data.UserInfo.DictionaryUserInfo.Phone);
                   localStorage.setItem("email", jsonobj.Data.UserInfo.DictionaryUserInfo.Email);
                   localStorage.setItem("intakeid", jsonobj.Data.IntakeId);
//                    $('#student_name').text(localStorage.getItem("firstname") + " " + localStorage.getItem("lastname"));
                    var fullName = localStorage.getItem("firstname") + " " + localStorage.getItem("lastname");
           
                    if(isManualRSVPCheckIn){
                        $('#spanSearchName').text(fullName);
                        $('#spanSearchUid').text(localStorage.getItem("uid"));
                    }
                    else{
                            $('#spanSwipeName').text(fullName);
                            $('#spanSwipeUid').text(localStorage.getItem("uid"));
                        }
           
                    if(jsonobj.Data.IsEligible == true)
                    {
                        $('#success').removeClass('invisible');
                        $('#failed').addClass('invisible');


                        if(isManualRSVPCheckIn){
                            $('#divSearchSuccess').removeClass('DisplayNone');
                            $('#divSearchFail').addClass('DisplayNone');
                            $('#divSearchLastCheckIn').removeClass('DisplayNone');
                            $('#spanSearchLastCheckIn').text(fullName);
                               if(isoverride)
                               {
                                    $('#divSearchSuccess span').text('Override Successful');
                               }
                               else{
                                    $('#divSearchSuccess span').text('Check-in Successful');
                               }
                            DisplayRSVPCheckInButton(false);
                        }
                        else
                        {
                            $('#divSwipeSuccess').removeClass('DisplayNone');
                            $('#divSwipeFail').addClass('DisplayNone');
                            $('#divSwipeLastCheckIn').removeClass('DisplayNone');
                            $('#spanSwipeLastCheckIn').text(fullName);
                            DisplayRSVPCheckInButton(false);
                           if(isoverride)
                           {
                               $('#divSwipeSuccess span').text('Override Successful');
                           }
                           else{
                               $('#divSwipeSuccess span').text('Check-in Successful');
                           }
                        }
           
                        ClearRSVPFields(true);
                    }
                    else
                    {
                        $('#failed').removeClass('invisible');
                        $('#success').addClass('invisible');
                        if(isManualRSVPCheckIn){
                            $('#divSearchSuccess').addClass('DisplayNone');
                            $('#divSearchFail').removeClass('DisplayNone');
                            //Hide 'CheckIn' button display
                            DisplayRSVPCheckInButton(false);
                            ClearRSVPFields(true);
                        }
                        else
                        {
                            $('#divSwipeSuccess').addClass('DisplayNone');
                            $('#divSwipeFail').removeClass('DisplayNone');
                            ClearRSVPFields(true);
                        }
                    }
           
           
               }
           if(!isManualRSVPCheckIn){
           //start the card reader if rsvp flag for manual search is turned off
           //since stopping the card reader right after the check-in in RSVPCheckIn method crashes the app
           //when 'Swipe' tab is selected, condition is added here
                app.startCardReader();
           }
               //window.open("login.html?key=" + $('#txtAccessKey').val() + "&deptname=" + jsonobj.Data.DeptName ,"_self");
           },
           error: function (jqXHR, textStatus, errorThrown) {
                //showDialog("Invalid UCLA logon");
				ShowFlashMessage("Invalid UCLA logon");

               if(!isManualRSVPCheckIn){
               //start the card reader if rsvp flag for manual search is turned off
               //since stopping the card reader right after the check-in in RSVPCheckIn method crashes the app
                //when 'Swipe' tab is selected, condition is added here
                        app.startCardReader();
                   }
           //alert(jqXHR + ";\n\n" + textStatus + ";\n\n" + errorThrown);
           },
           complete: function(){
                    endLoading();
                }
           });
}

function ClearRSVPFields(canAddDelay){
    var timeout = 320000;//display the status message for 5 mins (300s) when displaying success/failed status

    if(!canAddDelay){
        if(!isManualRSVPCheckIn){
            $('#spanSwipeName').text("");
            $('#spanSwipeUid').text("");
            //                    $('#divOverrideSuccess').addClass('DisplayNone');
            $('#divSwipeSuccess').addClass('DisplayNone');
            //                    $('#divOverrideFail').addClass('DisplayNone');
            $('#divSwipeFail').addClass('DisplayNone');
        }
        else{
            DisplayRSVPSearchResults(false);
        }
    }
    else{
    //clear the fields collected through swipe/search after Successful check-in/override check-in
    setTimeout(function(){
               console.log('isManualRSVPCheckIn:'+ isManualRSVPCheckIn);
               if(!isManualRSVPCheckIn){
                    $('#spanSwipeName').text("");
                    $('#spanSwipeUid').text("");
//                    $('#divOverrideSuccess').addClass('DisplayNone');
                    $('#divSwipeSuccess').addClass('DisplayNone');
//                    $('#divOverrideFail').addClass('DisplayNone');
                    $('#divSwipeFail').addClass('DisplayNone');
                }
               else{
                    DisplayRSVPSearchResults(false);
                }
               }, timeout);
    }
}

function CloseApp(e)
{
    e.preventDefault();
    /*
    var key = window.prompt("Please enter Application Key");
    if(key == null || key == "")
    {
        //do nothing
    }
    else if(key == localStorage.getItem("key"))
    {
        app.stopCardReader();
        window.open("index.html", "_self");
        //window.location.href = "index.html";
    }
    else
    {
        alert("Incorrect key");
    }
     */
    $("#dialog-modal").dialog(
                              {
                              width: 300,
                              open: function(event, ui)
                              {
                              //var textarea = $('<textarea style="height: 276px;">');
                              
                              },
                              modal:true,
                              dialogClass: "no-close",
                              buttons: {
                              "Cancel": function() {
                                $(this).dialog("close");
                              },
                              "Submit": ValidateAppKey()
                                  },
                              open: function(event) {
                              $('.ui-dialog-buttonpane').find('button:contains("Cancel")').addClass('modal-double-button-left');
                              $('.ui-dialog-buttonpane').find('button:contains("Submit")').addClass('modal-double-button-right important');
                              }
                              });
}

function OverrideHelp(e)
{
    e.preventDefault();
    //alert("Selecting 'Override' marks the attendee as having been admitted but failed to meet the criteria set for this event.");
	showNativeDialog("Selecting 'Override' marks the attendee as having been admitted but failed to meet the criteria set for this event.");
}

function ClickRegistration()
{
    app.stopCardReader();
//    location.href='registration.html';
    //reset input controls
    $('#divRegistration input').removeClass("Error").val("").addClass("RemoveBoxShadow");
    $('span.SpanError').addClass('DisplayNone')
    app1.navigate("#divRegistrationView", "slide:left");
}

function ValidateAppKey(){
	  var key = $("#txtAccessKey").val();
	  if(key == null || key == "")
	  {//highlight the error field
          $("#txtAccessKey").addClass("Error");
	  }
	  else
	  {
          $("#txtAccessKey").removeClass("Error");
          //$('#divAppKeyError').addClass("DisplayNone");
//          $("#txtAccessKey").next().addClass("DisplayNone");
          app.stopCardReader();

          //localStorage.setItem("key", "null");
          //call launchkiosk method to launch the new kiosk / relaunch existing kiosk
          LaunchKiosk(true);
          //window.open("index.html", "_self");
	  }
}

function NavigateToReasonsPage(){
//  window.open('reasons.html', '_self');
    app1.navigate("#questions-body");
}

function HideReconfigureLobbyDialog() {
	$("#dialog-modal").kendoMobileModalView("close");  	
}

function ShowFlashMessage(message){
	$('#spanFlashMessage').text(message);
	$("#modalviewFlash").kendoMobileModalView("open");
    $(".ContentWithRoundedCorners").parent().addClass("ContentWithRoundedCorners");
	//auto close the message after 1s
	window.setTimeout(function(){
                                  $("#modalviewFlash").kendoMobileModalView("close");
                                  }, 1500
					  );
}

function FailedCardSwipe(){
    $("#modalviewAlert").kendoMobileModalView("close");
    app.stopCardReader();
    window.open("login.html", "_self");
}

function showCardReaderErrorAlert(msg) {
//    console.log(msg.toString);
    $('#spanAlertMessageCardReader').text(msg);
    $("#modalviewAlertCardReader").kendoMobileModalView("open");
}

//methods moved from login.html
var app1, initialView;
function Initialize(){
    $('#txtAccessKey').bind("keyup", function(){
                            //convert the text to uppercase
                            var key = $(this).val();
//                            $(this).val(key.toUpperCase());
                           });
    //Reset CollectedResponses
    localStorage.setItem("CollectedResponses", JSON.stringify(""));
    //app1 = new kendo.mobile.Application(document.body, {useNativeScrolling: true}); //, transition: 'overlay:up'
    
    //debugger;
    if(localStorage.getItem("anon") != "true")
    {
        app.initialize();
    }
    
    //$("#welcome_text1").text("Welcome to " + localStorage.getItem("deptname"));
    InitForm();
    if(localStorage.getItem("allowregistration") == "false")
    {
        $("#btn-register").addClass("invisible");
    }
    else{
        $("#btn-register").removeClass("invisible");
    }
    //suggested by Telerik team; Ticket# 856962
    kendo.UserEvents.defaultThreshold(9);
    app1 = new kendo.mobile.Application(document.body, {useNativeScrolling: true, initial: initialView}); //, transition: 'overlay:up'
};

function ResetLobby(){
    $('#txtAccessKey').bind("keyup", function(){
                            //convert the text to uppercase
                            var key = $(this).val();
                            //                            $(this).val(key.toUpperCase());
                            });
    //Reset CollectedResponses
    localStorage.setItem("CollectedResponses", JSON.stringify(""));
    //app1 = new kendo.mobile.Application(document.body, {useNativeScrolling: true}); //, transition: 'overlay:up'
    
    //debugger;
    if(localStorage.getItem("anon") != "true")
    {
        //app.initialize();
    }
    
    //$("#welcome_text1").text("Welcome to " + localStorage.getItem("deptname"));
    InitForm();
    if(localStorage.getItem("allowregistration") == "false")
    {
        $("#btn-register").addClass("invisible");
    }
    else
    {
        $("#btn-register").removeClass("invisible");
    }
    
    //app1 = new kendo.mobile.Application(document.body, {useNativeScrolling: true, initial: initialView}); //, transition: 'overlay:up'
    app1.navigate('#' + initialView);
    
    //reset RSVP related fields when the app is reset
    $('#spanSearchLastCheckIn').text("");
    $('#spanSwipeLastCheckIn').text("");
};

//not used
function ClickLogon(){
    app1.Navigate('#viewSigninWithUclaLogon');
    app.stopCardReader();
}

function InitForm(){
//    $("#DeptName").text(localStorage.getItem("deptname"));
    $("span[populateDeptName='true']").text(localStorage.getItem("deptname"));
    
    if(localStorage.getItem("welcome") != null && localStorage.getItem("welcome") != "null")
    {
//        $("#welcome_text").text(localStorage.getItem("welcome"));
//        $("#welcome_text1").text(localStorage.getItem("welcome"));
            $("span[populateWelcomeMessage='true']").text(localStorage.getItem("welcome"));
    }
//    else{
//        $("#welcome_text").text("Welcome to the event");    
//    }
    
    //bind keypress event for textbox
    //                $('#'+ responseId).bind('keypress',PopulateNumbers);
    
    if(localStorage.getItem("anon") == "true")
    {
        initialView = "anon";
        //$("#anon").removeClass("invisible");
        //$("#not_anon").addClass("invisible");
        //app1.navigate("#anon");
        $("#body").addClass("molecules-bg");
    }
    else if(localStorage.getItem("rsvp") == "true" || localStorage.getItem("enforcedeligibility") == "true")
    {
        
        initialView = "rsvp_eleg";
        
        $("#body").removeClass("molecules-bg");
        //$("#rsvp_eleg").removeClass("invisible");
        //$("#not_anon").addClass("invisible");
        //$("#welcome_text_div").addClass("invisible");
        $("#event_name").text(localStorage.getItem("appdescription"));
        $('#liRsvpSwipe').addClass('RSVPInputTypeHighlight');
        $('#liRsvpUidSearch').removeClass('RSVPInputTypeHighlight');
        $('span[canDisplayEventName="true"]').text(localStorage.getItem("appdescription"));
        
        //get locations
        var lobbyLocations = JSON.parse(localStorage.getItem("locations"));
        var selectedLocationId = localStorage.getItem("selLocationID");
        var locationName = "";
        if(lobbyLocations != null && lobbyLocations != undefined){
            for (var index = 0; index < lobbyLocations.length; index++){
                if(selectedLocationId == lobbyLocations[index].ID){
                    locationName =lobbyLocations[index].Name;
                }
            }
        }
        $('span[canDisplayLocation="true"]').text(locationName);
        //app1.navigate("#rsvp_eleg");
    }
    else
    {
        initialView = "not_anon";
        $("#not_anon").removeClass("invisible");
        $("#txt_logon").val("").focus();
        $('#div_logon1').click();
        $('#txt_logon').focus();
//        console.log('set default focus');
//        setTimeout(function(){console.log('focussing..');$('#txt_logon').val('').focus();}, 800);
        $("#body").addClass("molecules-bg");
    }
}


function FocusLoginControl()
{
    console.log('transition end.. focussing..');
//    $('#txt_logon').focus();
    
    setTimeout(function(){
               console.log('focussing..');
         //      $('#div_logon').click();
           //    $('#txt_logon').focus();
               }, 500);
}

function DisplayReconfigureLobbyDialog(){
    //Reset the textbox control and error highlight
    $("#txtAccessKey").val("").removeClass("Error");
    //remove error icon
    $("#txtAccessKey").next().addClass("DisplayNone");
    //remove the error message
    //$('#divAppKeyError').addClass("DisplayNone");
    $('#liLocations').addClass('invisible');
    $(".ContentWithRoundedCorners").parent().addClass("ContentWithRoundedCorners");
    $("#dialog-modal").kendoMobileModalView("open");
}

//RSVP methods
function InitRSVPSwipe(){
    //start card reader to read swipe data
    //var isCardreader1 = typeof isCardreader != 'undefined' ? isCardreader : false;

    //alert('starting card reader in RSVP');
//    if(!IsCardReaderStarted()){
//        SetCardReaderStatus(true);
//    }
    app.startCardReader();
    isManualRSVPCheckIn = false;
    $('#liRsvpSwipe').addClass('RSVPInputTypeHighlight');
    $('#liRsvpUidSearch').removeClass('RSVPInputTypeHighlight');
}

function InitRSVPSearch(){
    //stop reading swipe data
    app.stopCardReader();
    //hide RSVP Swipe results
    ClearRSVPFields(false);
    isManualRSVPCheckIn = true;
    //Highlight 'Search' pane in the left hand pane
    $('#liRsvpSwipe').removeClass('RSVPInputTypeHighlight');
    $('#liRsvpUidSearch').addClass('RSVPInputTypeHighlight');
    //hide RSVP search results
    DisplayRSVPSearchResults(false);
    DisplayRSVPCheckInButton(true);
    
    //clear the search field text
    $('#txt_rsvp_eleg_uid').val('');

}

function DisplayRSVPCheckInButton(canDisplay){
    if(canDisplay){
        //display 'Check In' button
        $('#divRSVPCheckIn').removeClass('DisplayNone');
    }
    else{
        $('#divRSVPCheckIn').addClass('DisplayNone');
    }
}

//enables the card reader to start reading
function StartCardReader(){
    app.startCardReader();
}

window.onerror = function(msg, url, line){
               //alert('login.js Error:' + msg + " -- " + line);
               };

function CapitalizeFirstLetter(ctl){
    var ctlText = $(ctl).val();
    return string.charAt(0).toUpperCase() + ctlText.slice(1);
}