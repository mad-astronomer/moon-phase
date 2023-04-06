///algorithm for the moon longitude from https://www.aa.quae.nl/en/reken/hemelpositie.html#4

//display current date and time
const now = new Date();
const paragraph = document.querySelector('.date');
paragraph.innerHTML+=`${now.toLocaleDateString()} ${now.getHours()}:${now.getMinutes()<10?('0'+now.getMinutes()):now.getMinutes()}`;
///////////////

//variables for the current moonphase calculation
const day0 = new Date(Date.UTC(2000,0,1,12,0,0)).getTime();
//const today = new Date(Date.UTC(2022,5,12,22,0,0)).getTime();
const today = new Date().getTime();
let interval = (today - day0)/86400000;
let angle = getMoonAngle(interval);
console.log(angle)
////////////

//расчет долготы луны для выбранного дня
//возвращает угол между луной и солнцем (фаза)
function getMoonAngle(interval){
    let L = (218.316 + 13.176396*(interval))%360;
    let M = (134.963 + 13.064993*(interval))%360;
    let moonLongitude = L + 6.289 * Math.sin(M*0.0174533);
    let equinox = new Date(Date.UTC(2022,2,20,15,33,0)).getTime();
    let sunLongitude = ((today - equinox)/86400000)/365.256*360;
    let angle = moonLongitude - sunLongitude;
    if(angle < 0){
        //not sure if this is right
        angle += 360;
    }
    if(angle > 360){
        angle = angle % 360;
    }
    return angle;
}


let forecast = [];
let newInterval = Math.floor(interval);

while(forecast.length < 4){
    //если в массиве ничего пока нет, запускаем алгоритм с нынешним днем
    if(forecast.length==0){
        let moonAngle = getMoonAngle(newInterval);
        let nextPhaseDay = getNearestPhaseDay(newInterval, getComparisonAngle(moonAngle));
        let comparisonAngle = getComparisonAngle(moonAngle);
        let nextDate = new Date(day0);
        nextDate.setDate(nextDate.getDate()+nextPhaseDay);
        forecast.push([nextDate, getPhaseName(comparisonAngle)]);
        newInterval = nextPhaseDay+6;
    }
    else {
        let moonAngle = getMoonAngle(newInterval);
        let nextPhaseDay = getNearestPhaseDay(Math.floor(newInterval), getComparisonAngle(moonAngle));
        let comparisonAngle = getComparisonAngle(moonAngle);
        let nextDate = new Date(day0);
        nextDate.setDate(nextDate.getDate()+nextPhaseDay);
        console.log(nextPhaseDay)
        forecast.push([nextDate, getPhaseName(comparisonAngle)]);
        newInterval = nextPhaseDay + 6;
    }
}

console.log(forecast)

//какая ближайшая основная фаза луны
//принимает текущую фазу луны
//возвращает угол основной фазы луны
function getComparisonAngle(angle){
    switch (true) {
        case angle < 90:
            comparison = 90
            break
        case angle < 180:
            comparison = 180
            break
        case angle < 270:
            comparison = 270
            break
        case angle < 360:
            comparison = 360
    }
    return comparison;
}

//возвращает день ближайшей основной фазы на основе примерного дня и угла основной фазы
function getNearestPhaseDay(day,comparisonAngle){
    let nextPhaseDay=day;
    let testDay=day+1;
    while(Math.abs(getMoonAngle(nextPhaseDay)-comparisonAngle)>Math.abs(getMoonAngle(testDay)-comparisonAngle)){
        console.log('correcting');
        nextPhaseDay=testDay;
        testDay++;
    }
    return nextPhaseDay;
}

//get next main phases based on current angle between sun and moon
function makeForecast(angle){
    //moon moves ~13.5deg/day
    let daysToNextPhase = Math.floor((90-angle%90)/13);
    //console.log('Days to next phase: '+daysToNextPhase);
    let newStartInterval = Math.floor(interval+daysToNextPhase);
    let comparisonAngle = getComparisonAngle(getMoonAngle(newStartInterval));
    //how to get both angle and name from a single function
    let nearestPhaseDay = getNearestPhaseDay(newStartInterval,comparisonAngle);
    return nearestPhaseDay;
}

//display phase name
function getPhaseName(phaseAngle){
    let moonName;
    switch (true) {
        case phaseAngle < 10 || phaseAngle >= 350:
            moonName = 'Новолуние';
            break;
        case phaseAngle < 80:
            moonName = 'Молодая Луна';
            break;
        case phaseAngle < 100:
            moonName = 'Первая четверть';
            break;
        case phaseAngle < 170:
            moonName = 'Растущая Луна';
            break;
        case phaseAngle < 190:
            moonName = 'Полнолуние';
            break;
        case phaseAngle < 260:
            moonName = 'Убывающая Луна';
            break;
        case phaseAngle < 280:
            moonName = 'Последняя чеверть';
            break;
        case phaseAngle < 350:
            moonName = 'Старая Луна';
            break;
    }
    return moonName;
}

//calculating the phase %
switch(true){
    case angle < 90:
        //(R-b)/2R
        //0.0174533 = 1 degree in radians
        phase = Math.round(((1-Math.cos(angle*0.017453292))/2)*100);
        break;
    case angle < 180:
        //180-A
        //(R+b)/2R
        phase = Math.round(((1+Math.cos((180-angle)*0.017453292))/2)*100);
        break;
    case angle < 270:
        //A-180
        //(R+b)/2R
        phase = Math.round(((1+Math.cos((angle-180)*0.017453292))/2)*100);
        break;
    case angle < 360:
        //360-A
        //(R-b)/2R
        phase = Math.round(((1-Math.cos((360-angle)*0.017453292))/2)*100);
        break;
}

//displays the description
document.querySelector('.description').innerHTML=`
Луна освещена на ${phase}%`;
document.querySelector('.phase').innerHTML = `<b>${getPhaseName(angle)}</b>`;



//draws moon phase
switch (true){
    case angle < 90:
        drawMoon('#EEE','#2a303a','#2a303a',100-phase*2,100,-1);
        break;
    case angle < 180:
        drawMoon('#EEE','#2a303a','#EEE',100,(phase-50)*2,1);
        break;
    case angle < 270:
        drawMoon('#2a303a','#EEE','#EEE',(phase-50)*2,100,-1);
        break;
    case angle <= 360:
        drawMoon('#2a303a','#EEE','#2a303a',100,100-phase*2,1);
        break;
}

function drawMoon(color1,color2,color3,radius1,radius2,sign){
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Лунный диск
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, 100, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();

    //ночная часть
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, radius1, sign*Math.PI/2, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color3;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, radius2, Math.PI/2, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
}
