///algorithm for the moon longitude from https://www.aa.quae.nl/en/reken/hemelpositie.html#4

//display current date and time
const now = new Date();
const paragraph = document.querySelector('.date');
paragraph.innerHTML+=`${now.toLocaleDateString()} ${now.getHours()}:${now.getMinutes()<10?('0'+now.getMinutes()):now.getMinutes()}`;
///////////////
const equinox = getEquinoxDate().getTime();

//variables for the current moonphase calculation
const day0 = new Date(Date.UTC(2000,0,1,12,0,0)).getTime();
const today = new Date().getTime();
//const today = new Date().getTime();
const interval = (today - day0)/86400000;
let angle = getMoonAngle(interval,today);
////////////

function getEquinoxDate(){
    let okEquinox = new Date(Date.UTC(2022,2,20,15,33,0)).getTime();
    let newEquinox = okEquinox;
    while(newEquinox < now.getTime()){
        okEquinox = newEquinox;
        newEquinox+=365.2425*864e5;
    }
    return new Date(okEquinox);
}

function fullMoonName(){
    const name=[
        'Волчья Луна',
        'Снежная Луна',
        'Штормовая Луна',
        'Розовая Луна',
        'Цветочная Луна',
        'Клубничная Луна',
        'Оленья Луна',
        'Осетровая Луна',
        'Урожайная Луна',
        'Охотничья Луна',
        'Бобровая Луна',
        'Холодная Луна'
    ];
    if (now.getDate() > 29){
        return 'Синяя Луна';
    }
    else return name[now.getMonth()];
}

//calculates longitude for the provided day
//returns angle difference between sun and moon (phase)
function getMoonAngle(days,dayNow){
    let L = (218.316 + 13.176396*(days))%360;
    let M = (134.963 + 13.064993*(days))%360;
    let moonLongitude = L + 6.289 * Math.sin(M*0.0174533);
    let sunLongitude = ((dayNow - equinox)/86400000)/365.256*360;
    let angle = moonLongitude - sunLongitude;
    if(angle < 0){
        angle += 360;
    }
    if(angle > 360){
        angle = angle % 360;
    }
    return angle;
}

//how close is the calculated phase to a main phase
function proximityToPhase(a){
    let remain = a%90;
    if(Math.abs(remain-90)<remain){
        return(Math.abs(remain-90));
    }
        return remain
}

//converts interval to date
function intervalToDate(days){
    let date = new Date(day0);
    date.setDate(date.getDate()+days);
    return date.toDateString();
}

function addLeadZero(number){
    if(number < 10){
        return number = '0'+number;
    }
    return number;
}

//do the month forecast for moon phases
function makeForecast(){
    let dateNow = new Date (intervalToDate(interval)).getTime();
    let forecast = [];
    let newInterval = Math.floor(interval);
    let angularDifference = 90;
    let currentAngle, newBestDay, oldComparisonAngle, newComparisonAngle,proximity;
    
    while(forecast.length < 4){
        newInterval++;
        dateNow+=86400000;
        currentAngle = getMoonAngle(newInterval,(dateNow));
        
        //comparing to an angle a bit smaller
        //if the angle is less than 90, add 360 to do right comparison with the previous date which was almost 360
        if(currentAngle<7){
            currentAngle+=360
        }

        newComparisonAngle = getComparisonAngle(currentAngle-7);

        proximity = proximityToPhase(currentAngle);

        if(proximity < angularDifference) {
            newBestDay = newInterval;
            angularDifference = Math.abs(newComparisonAngle - currentAngle);
            bestAngle = currentAngle;
            oldComparisonAngle = newComparisonAngle;
        }
        if(proximity > angularDifference){
            newComparisonAngle = getComparisonAngle(currentAngle-7);
            angularDifference = 90;
            if(oldComparisonAngle == newComparisonAngle){newInterval}
            forecast.push([intervalToDate(newBestDay),oldComparisonAngle])
        }
        let date = new Date(day0);
        date.setDate(date.getDate()+newInterval);
    }
    return forecast;
}
let forecast = makeForecast();

//nearest main phase
//receives moon-sun angle
//returns main phase angle
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
        case phaseAngle < 160:
            moonName = 'Растущая Луна';
            break;
        case phaseAngle < 200:
            moonName = 'Полнолуние' + `</br><i>"${fullMoonName()}"</i>`;
            break;
        case phaseAngle < 260:
            moonName = 'Убывающая Луна';
            break;
        case phaseAngle < 280:
            moonName = 'Последняя четверть';
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
Диск Луны освещен на ${phase}%`;
document.querySelector('.phase').innerHTML = `<b>${getPhaseName(angle)}</b>`;


//rgb(42, 50, 58) inside 25 31 35
//rgb(17, 19, 23) outside
let red = Math.floor(17+(phase/100)*25);
let green = Math.floor(19+(phase/100)*31);
let blue = Math.floor(23+(phase/100)*35);
document.querySelector('body').style.background = `no-repeat center radial-gradient(circle at 50% 270px, rgb(${red},${green},${blue}) 10%,rgb(17, 19, 23) 60%`;


const forecastDiv = document.querySelector('.forecast');
for(i=0; i<forecast.length; i++){
    let date = new Date(forecast[i][0]).getDate();
    let month = new Date(forecast[i][0]).getMonth()+1;
    let year = new Date(forecast[i][0]).getFullYear();
    let li = document.createElement('li');
    li.innerHTML=`<li><img src='${forecast[i][1]}.png'>${addLeadZero(date)}.${addLeadZero(month)}.${year}</li>`;
    forecastDiv.appendChild(li);
}


let moonNightColor = `${Math.floor(42-(25*((phase+1)/100)))},${Math.floor(48-(29*((phase+1)/100)))},${Math.floor(58-(35*((phase+1)/100)))}`;

//draws moon phase
switch (true){
    case angle < 90:
        drawMoon('#EEE',`rgb(${moonNightColor})`,`rgb(${moonNightColor})`,100-phase*2,100,-1);
        break;
    case angle < 180:
        drawMoon('#EEE',`rgb(${moonNightColor})`,'#EEE',100,(phase-50)*2,1);
        break;
    case angle < 270:
        drawMoon(`rgb(${moonNightColor})`,'#EEE','#EEE',(phase-50)*2,100,-1);
        break;
    case angle <= 360:
        drawMoon(`rgb(${moonNightColor})`,'#EEE',`rgb(${moonNightColor})`,100,100-phase*2,1);
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
    ctx.strokeStyle = `rgb(${moonNightColor})`;
    ctx.stroke();

    //ночная часть
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, radius1, sign*Math.PI/2, 0, Math.PI);
    ctx.fill();
    //ctx.stroke();

    ctx.fillStyle = color3;
    ctx.beginPath();
    ctx.ellipse(100, 100, 100, radius2, Math.PI/2, 0, Math.PI);
    ctx.fill();
    //ctx.stroke();
}
