function SubmitReasons()
{
    event.preventDefault();
    
    if($('input[type=checkbox]:checked').length == 0)
    {
        alert("Please select at least 1 checkbox.");
        return;
    }
    
    var myJsonObj = {
        UID: localStorage.getItem("uid"),
        FirstName: localStorage.getItem("firstname"),
        LastName: localStorage.getItem("lastname"),
        Phone: localStorage.getItem("phone"),
        Email: localStorage.getItem("email"),
        AppID: localStorage.getItem("key"),
        InitialIntakeStatus: localStorage.getItem("initialintakestatus"),
        Reasons: {
            IntakeID: 0,
            ReasonsList: []
        }
    };
    
    $('input[type=checkbox]:checked').each(function () {
                                   myJsonObj.Reasons.ReasonsList.push({"ReasonID": $(this).attr('id'), "ReasonDetails": ""});
                                   });
    
    $.ajax({
           type: "POST",
           contentType: "application/json; charset=utf-8",
           url: "http://sait-test.uclanet.ucla.edu/sawebnew2/api/submitstudentinfo",
           dataType: "json",
           data: JSON.stringify(
            myJsonObj
           ),
           beforeSend: function(){
           $('body').addClass('ajax-spinner');
           },
           success: function(data){
            //alert(data);
            window.open("thankyou.html", "_self");
           },
           error: function (jqXHR, textStatus, errorThrown) {
           //alert("The access key you entered is incorrect. Please click 'Retry' to reenter your access key.");
           alert(jqXHR + ";\n\n" + textStatus + ";\n\n" + errorThrown);
           },
           complete: function(){
           $('body').removeClass('ajax-spinner');
           }
           
    });
}