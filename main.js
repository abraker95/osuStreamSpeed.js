// i suck at variable naming
// don't worry we all do

clickTimes = [];
deviations = [];
timediffs  = [];
testrunning = false; // the lack of camelcase is screwing with me, TODO <----

var runNumber = 0;
var counterNumber = 0;

var baseData = {
    type: "spline",
    dataPoints: []
};
    
function beginTest() {
    testrunning = true;
    clickLimit = Math.round(parseInt(document.getElementById('clickNum').value));
    timeLimit  = Math.round(parseInt(document.getElementById('clickTime').value));
    
    if (timeLimit < 2)
    {
        alert("Please enter a value larger than 2");
        testrunning = false;
        return false;
    }
    
    if (clickLimit < 3)
    {
        alert("Please enter a value larger than 3");
        testrunning = false;
        return false;
    }
    
    clickTimes.length = 0;
    deviations.length = 0;
    timediffs.length = 0;
    beginTime = -1;
    
    key1 = $('#key1').val().toLowerCase();
    key2 = $('#key2').val().toLowerCase();
    
    key1_press = false
    key2_press = false
    
    mouse = $("input[name='cmouse']").prop("checked");
    
    $("div#status").html("Test ready, press key 1 or key 2 to begin.");
    $("div#Result").html("\
        Number of taps: 0<br> \
        Seconds elapsed: 0<br> \
        Stream Speed: 0 bpm<br>\
        Unstable Rate: 0\
    ");
    
    localStorage.setItem('clickLimit', clickLimit);
    localStorage.setItem('timeLimit', timeLimit);
    localStorage.setItem('key1', key1);
    localStorage.setItem('key2', key2);
    localStorage.setItem('mouse', mouse);
    
    std = 0;
    
    $("button#submit").hide();
    $("button#stopbtn").show();
    
    if (runNumber > 0)
    {
        $("#chartContainer").CanvasJSChart().options.data.push({
            type: "spline",
            dataPoints: []
        });
        $("#chartContainer").CanvasJSChart().options.data[runNumber - 1].visible = false;
    }
    
    $("#chartContainer").CanvasJSChart().render();
    counterNumber = 0;
    
    return true;
}

function radiof(num) 
{
    if (num == 1) 
    {
        $("#numClicks").show();
        $("#timeClicks").hide();
    }

    // Not using else because maybe implement a both option
    if (num == 2) 
    { 
        $("#timeClicks").show();
        $("#numClicks").hide();
    }
}

function endTest() 
{
    testrunning = false;
    update(false);
    
    beginTime = -1;
    
    $("button#submit").html("Retry");
    $("div#status").html("Test Finished. Hit the Retry button or press Enter to try again.");
    
    if ($("input[name='roption']:checked").val() == "time")
        window.clearInterval(endTimer);
    
    window.clearInterval(updater);

    $("button#submit").show();
    $("button#stopbtn").hide();
    
    runNumber = runNumber + 1;
    return;
}

function update(click) 
{
    if (click) 
    {    
        if (timediffs.length > 0)
        {
            num = Math.min(timediffs.length, 3)
            sum = timediffs.slice(-num).reduce((a, b) => a + b);
            avg = sum / num;
            
            avg_total = timediffs.reduce((a, b) => a + b)/timediffs.length;

            $.each(timediffs, function(i,v) {
                deviations[i] = (v - avg_total) * (v - avg_total);
            });
            
            variance = deviations.reduce(function(a, b) {return a + b;});
            std = Math.sqrt(variance / deviations.length);
            unstableRate = std * 10;
        }
        
        clickTimes.push(Date.now());
        if (clickTimes.length > 1)
            timediffs.push(clickTimes[clickTimes.length - 1] - clickTimes[clickTimes.length - 2]);
        
        if (clickTimes.length > 2) 
        {
            var chart = $("#chartContainer").CanvasJSChart();
            chart.options.data[runNumber].dataPoints.push({
                x: (Date.now() - beginTime)/1000.0,
                y: (15000/avg)
            });
            
            chart.render();
        }
    } 
    else 
    {
        counterNumber = (counterNumber + 1) % 30;
        streamtime = (Date.now() - beginTime)/1000;
        num_taps = clickTimes.length.toString();

        if (timediffs.length > 2) 
        {
            $("div#Result").html("\
                Number of taps: " + num_taps + "<br>\
                Seconds elapsed: " + streamtime.toFixed(3) + "<br> \
                Stream Speed: " + (15000/avg_total).toFixed(2) + " bpm<br>\
                Unstable Rate: " + (Math.round(unstableRate * 100000) / 100000).toFixed(3));
        }
    }
}


$(document).keyup(function(event)
{
    if (event.keyCode == 13 && testrunning == false)
        beginTest();

    if (testrunning == false)
        return;

    if ((strkey == key1) && (key1_press == true))
    {    
        key1_press = false;
        return;
    }

    if ((strkey == key2) && (key2_press == true)) 
    {
        key2_press = false;
        return;
    }
});


$(document).keydown(function(event)
{
    if (event.keyCode == 13 && testrunning == false)
        beginTest();
        
    if (testrunning == false)
        return;

    //console.log(String.fromCharCode(event.which), key1);

    strkey = String.fromCharCode(event.which).toLowerCase();
    key_ok = false;

    if (strkey == key1)
    {    
        if (key1_press == false) 
        {
            key_ok = true;
            key1_press = true;
        }
    }

    if (strkey == key2)
    {
        if (key2_press == false) 
        {
            key_ok = true;
            key2_press = true;
        }
    }
    
    if (key_ok == false) 
        return;
    
    if(beginTime == -1)
    {
        beginTime = Date.now();
        $("div#status").html("Test currently running.");
        updater = setInterval(function() { update(false); }, 16.6);
        
        if ($("input[name='roption']:checked").val() == "time") 
        {
            endTimer = setTimeout(function() { endTest(); }, timeLimit * 1000);
        }
    }
    else
    {
        update(true);
    }

    if ((clickTimes.length == clickLimit) && ($("input[name='roption']:checked").val() == "clicks"))
    {
        endTest();
        return;
    }
});


function stopEvent(event)
{
    if(event.preventDefault != undefined)
        event.preventDefault();
    
    if(event.stopPropagation != undefined)
        event.stopPropagation();
}

$(document).ready(function() 
{    
    if(!localStorage.getItem('clickLimit'))
        $("input#clickNum").val("100");
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
        
    if(!localStorage.getItem('timeLimit'))
        $("input#clickTime").val("10");
    else
        $("input#clickTime").val(localStorage.getItem('timeLimit'));
        
    if(!localStorage.getItem('mouse'))
        $("input[name='cmouse']").prop("checked", false);
    else
        $("input[name='cmouse']").prop("checked", localStorage.getItem('mouse') == "true");

    $("#chartContainer").CanvasJSChart({
        zoomEnabled: true,
        exportEnabled: true,
        title: {
            text: "BPM Chart"
        },
        axisY: {
            title: "BPM",
            includeZero: false
        },
        axisX: {
            title: "Time",
            //interval: 1
        },
        data: [{
            type: "spline", //try changing to column, area
            dataPoints: []
        }]
    });
});