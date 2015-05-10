clickNum = [];
testrunning = false;
function beginTest() {
        testrunning = true;
        clickLimit = parseInt(document.getElementById('clickNum').value);
        clickNum.length = 0;
        beginTime = -1;
        key1 = document.getElementById('key1').value;
        key2 = document.getElementById('key2').value;
        $("div#status").html("Test ready, press key 1 or key 2 to begin.");
        $("div#Result").html("\
            You clicked 0 times in 0 seconds.<br>\
            Your stream speed is 0 bpm\
        ");
        localStorage.setItem('clickLimit', clickLimit);
        localStorage.setItem('key1', key1);
        localStorage.setItem('key2', key2);
}
$(document).keypress(function(event)
{
    if (event.keyCode == 13 && testrunning == false)
        beginTest();
    if (testrunning == true)
    {
        if (String.fromCharCode(event.which) == key1 || String.fromCharCode(event.which) == key2)
        {
            switch (beginTime)
            {
                case -1:
                    beginTime = Date.now();
                    $("div#status").html("Test currently running.");
                default:
                    if (clickNum.length + 1 <= clickLimit)
                    {
                        clickNum.push(Date.now() - clickNum[clickNum.length]);
                        streamtime = (Date.now() - beginTime)/1000;
                        $("div#Result").html("\
                            You clicked " + clickNum.length.toString() + " times in " + streamtime.toString() + " seconds.<br>\
                            Your stream speed is " + (Math.round((((clickNum.length) / (Date.now() - beginTime) * 60000)/4) * 100) / 100).toString() + " bpm\
                        ");
                    }
                    break;
            }
            if (clickNum.length == clickLimit)
            {
                testrunning = false;
                beginTime = -1;
                $("button#submit").html("Retry");
                $("div#status").html("Time starts when you make your first click.");
                return;
            }
        }
    }
})
$(document).ready(function() {
    if(!localStorage.getItem('clickLimit'))
        $("input#clickNum").val("20");
    else
        $("input#clickNum").val(localStorage.getItem('clickLimit'));
    if(!localStorage.getItem('key1'))
        $("input#key1").val("z");
    else
        $("input#key1").val(localStorage.getItem('key1'));
    if(!localStorage.getItem('key2'))
        $("input#key2").val("x");
    else
        $("input#key2").val(localStorage.getItem('key2'));
});