const api = "https://count.musahittesti.org:5001";

let restart = false;
const restartCheck = localStorage.getItem('restart') || false;
let level = localStorage.getItem('level')|| 1;

if(restartCheck === "true") {
    restart = true;
    level = localStorage.getItem('restartIndex') || 1;
    localStorage.setItem('restart', false);
}

const nextLevel = parseInt(level) + 1;

const answerTime = 60;
var quizLimit = 10; // 10
var minCorrectAnswer = 7;  // 7
var quizData = quizData1;

switch (level) {
    case "2":
        quizData = quizData2;
        break;
    case "3":
        quizData = quizData3;
        break;
    case "4":
        quizData = quizData4;
        break;
    case "5":
        quizData = quizData5;
        break;
    case "6":
        quizData = quizData6;
        quizLimit = 20; // 20
        minCorrectAnswer = 15; // 15
        break;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const screenWidth = screen.width;
let testerName = "";
let start = "";
let totalTime = "";
let tried = localStorage.getItem('tried') || 1;
const today = formatDate(new Date());
const downloadBtn = document.getElementById('download-btn');
let hideTimeout = null;

const image = new Image();
image.src = 'image/certificate.png?v=40';

if(CSS.registerProperty !== undefined){
    CSS.registerProperty({
        name: "--p",
        syntax: "<integer>",
        initialValue: 0,
        inherits: true,
    });
    document.getElementById("certPercent").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join('.');
}

function toNameCase(str) {

    try {
        return str.split(' ')
            .map(w => w[0].toLocaleUpperCase('tr-TR') + w.substring(1).toLocaleLowerCase('tr-TR'))
            .join(' ');
    } catch (e) {
        return str
    }

}

window.addEventListener('load', function() {

    WebFont.load({
        google: {
            families: ['Parisienne:400:latin-ext', 'Roboto Mono', 'Recursive']
        }
    });

    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', clearLocalStorage);

    document.getElementById("seviye").innerText = level + ". SEVİYE";
    document.getElementById("seviye").style.opacity = "1";

    const certificateContainer = document.getElementById('certificateContainer');
    if(screenWidth < 720){
        certificateContainer.style.zoom = screenWidth / 1920 / 1.13;
    } else {
        certificateContainer.style.zoom = screenWidth / 1920 / 2;
    }
    document.getElementById("timeLeft").innerText = totalAnswerTime;
    document.getElementById("qLimit").innerText = quizLimit.toString();

    getHitNumber();

    if(localStorage.getItem('allCompleted') === "true") {

        const storedDate = localStorage.getItem('date');
        const storedCertificateNumber = localStorage.getItem('certificateNumber');

        drawImage(" ", storedDate, storedCertificateNumber, 0);
    }

})

function redirectToHome(delay = 0) {
    setTimeout(function(){ window.location.href = "index.html"; }, delay);
}

function clearLocalStorage() {
    localStorage.clear();
    clearButton.innerHTML = "Sıfırlandı";
    setTimeout(function(){ clearButton.innerHTML = "Tüm Testleri Sıfırla"; }, 1000);
    redirectToHome(500);
}

function createDots() {
    let dots = "";
    for(i=0; i<tried; i++) {
        dots += "."
    }
    return dots;
}

function increaseTried() {
    tried++;
    localStorage.setItem('tried', tried);
}

function drawImage(name, date, certificateNumber, totalTime) {

    // seviye-container hide
    document.getElementById("seviye-container").style.display = "none";

    localStorage.setItem('date', date);
    localStorage.setItem('certificateNumber', certificateNumber);

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    document.getElementById("qc").style.display = "none";
    document.getElementById("loader").style.display = "block";

    let keyboard = new Audio("sound/keyboard.mp3");
    keyboard.play();

    // Tek sertifika ise...
    document.getElementById("creating-certificates-message").textContent = "SERTİFİKA OLUŞTURULUYOR...";
    const mainContainer = document.getElementById('main_container');
    if(screenWidth > 720){
        mainContainer.style.paddingTop = "5vw";
    }

    setTimeout(function() {

        document.getElementById("sertifika_img").src = canvas.toDataURL('image/png');
        document.getElementById("certificate-1").style.display = "block";

        document.getElementById("loader").style.display = "none";
        document.getElementById("certificateImageContainer").style.display = "flex";
        let created = new Audio("sound/created.mp3");
        created.play();
    }, 9500);
}

downloadBtn.addEventListener('click', function () {
    downloadBtn.href = canvas.toDataURL('image/png');
    downloadBtn.download = "sertifika-" + testerName + ".png";
});

function clearLiHighlights(){
    document.querySelectorAll('.selectedAnswer').forEach(item => {
        item.classList.remove("selectedAnswer");
    });
}

function switchKart() {
    document.getElementById("main_container").classList.toggle("gizle");
    document.getElementById("kart-container").classList.toggle("gizle");
}

document.querySelectorAll('li').forEach(item => {
    item.onclick =  function() {
        playNow("select");
        clearLiHighlights();
        item.classList.add("selectedAnswer");
        item.children[0].checked = true;
    }
});


function createProgressbar(id, duration, callback) {
    // We select the div that we want to turn into a progressbar
    let progressbar = document.getElementById(id);
    progressbar.className = 'progressbar';

    // We create the div that changes width to show progress
    let progressbarinner = document.createElement('div');
    progressbarinner.className = 'inner';

    // Now we set the animation parameters
    progressbarinner.style.animationDuration = duration;

    // Eventually couple a callback
    if (typeof(callback) === 'function') {
        progressbarinner.addEventListener('animationend', callback);
    }

    // Append the progressbar to the main progressbardiv
    progressbar.appendChild(progressbarinner);

    // When everything is set up we start the animation
    progressbarinner.style.animationPlayState = 'running';
}

const welcomeMessage = document.getElementById("welcome-message");
const quizElement = document.getElementById("quiz");
//const explanationDiv = document.getElementById("explanation");
const startButton = document.getElementById("start");
const timeLeft = document.getElementById("timeLeft");
const questionInfo = {};
let counter;

questionInfo.parent = document.getElementById("questionInfo");
questionInfo.qNumber = document.getElementById("qNumber");
questionInfo.qLimit = document.getElementById("qLimit");

const afterTime = function() {
    increaseTried();
    playNow("failed");
    quiz.innerHTML = `
                <div id="result">
                <h2>Maalesef...</h2>
                <div class="result-inner">
                    Belirlenen süre içinde soruyu cevaplayamadınız. Bu yüzden test sona erdi.
                </div>
                </div><button class="red-gradient" onclick="location.reload()">Yeniden Dene</button>
           `
};

function startTime(){
    stopTime();
    createProgressbar('time-progressbar', totalAnswerTime + 's', afterTime);
}

function stopTime(){
    let bar = document.getElementById("time-progressbar");
    bar.removeEventListener("animationend", afterTime, true);
    bar.innerHTML = "";
}

document.getElementById("info").addEventListener('click', function () {
    this.classList.toggle("open");
    document.getElementById("menuContents").classList.toggle("hideThis");
    document.getElementById("questionMark").classList.toggle("hideThis");
    document.getElementById("closeIcon").classList.toggle("hideThis");
})

startButton.addEventListener('click', function () {
    welcomeMessage.style.display = "none";
    quizElement.style.display = "block";

    loadQuiz();
    startTime();
    counter = setInterval(timer, 1000);
    start = new Date();

    getHitNumber(true);

})

function getHitNumberXXXXXXXXXXXX(add = false) {
    let xhr = new XMLHttpRequest();
    if(add){
        xhr.open("GET", api + "/incr/start");
    } else {
        xhr.open("GET", api + "/get/start");
    }
    xhr.responseType = "json";
    xhr.onload = function() {
        document.getElementById("hits").innerText = String(numberWithCommas(this.response.value));
        appendTotalCertificateNumber(this.response.value);
    }
    xhr.send();
}

function getHitNumber(add = false) {
    return;
}

function appendTotalCertificateNumber(hitNumber) {
    return;
}

function getCertificateNumber(name) {
    drawImage(" ", today, 0, 0);
}

function appendTotalCertificateNumberXXXXXXXXXXXX(hitNumber) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", api + "/get/success");
    xhr.responseType = "json";
    xhr.onload = function() {
        document.getElementById("certificates").innerText = String(numberWithCommas(this.response.value));

        let percentage = (100 * this.response.value) / hitNumber;
        document.getElementById("success_percent").innerText = "%" + String(Math.floor(percentage));
        document.getElementById("success_rate").style.display = "block";
    }
    xhr.send();
}

function getCertificateNumberXXXXXXXXXXXX(name) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", api + "/incr/success");
    xhr.responseType = "json";
    xhr.onload = function() {
        let certificateNumber = String(this.response.value).padStart(8, "0");
        drawImage(name, today, certificateNumber, totalTime);
        getHitNumber();
    }
    xhr.send();
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

//shuffle(quizData);

const quiz = document.getElementById('quiz')
const answerEls = document.querySelectorAll('.answer')
const questionEl = document.getElementById('question')
const a_container = document.getElementById('a_container')
const b_container = document.getElementById('b_container')
const c_container = document.getElementById('c_container')
const d_container = document.getElementById('d_container')
const e_container = document.getElementById('e_container')
const a_text = document.getElementById('a_text')
const b_text = document.getElementById('b_text')
const c_text = document.getElementById('c_text')
const d_text = document.getElementById('d_text')
const e_text = document.getElementById('e_text')
const prefix = document.getElementById('prefix')
const sender = document.getElementById('sender')
const sources = document.getElementById('sources')
const submitBtn = document.getElementById('submit')
const kartImage = document.getElementById('kart')

let currentQuiz = 0
let score = 0
let totalAnswerTime = quizLimit * answerTime;

function createSourceLink(URL, number) {
    var a = document.createElement('a');
    var linkText = document.createTextNode("[" + number + "]");
    a.appendChild(linkText);
    a.target = "_blank";
    a.href = URL;
    return a;
}

function updateKart(q) {
    kartImage.src = 'image/kart/'+ level +'_'+ q +'-min.png?v=40';
}

function loadQuiz() {
    deselectAnswers()

    const currentQuizData = quizData[currentQuiz]
    
    a_container.style.display = 'none';
    b_container.style.display = 'none';
    c_container.style.display = 'none';
    d_container.style.display = 'none';
    e_container.style.display = 'none';

    if (currentQuizData.a !== undefined) {
      a_container.style.display = 'flex';
    }
    if (currentQuizData.b !== undefined) {
      b_container.style.display = 'flex';
    }
    if (currentQuizData.c !== undefined) {
      c_container.style.display = 'flex';
    }
    if (currentQuizData.d !== undefined) {
      d_container.style.display = 'flex';
    }
    if (currentQuizData.e !== undefined) {
      e_container.style.display = 'flex';
    }

    questionEl.innerText = currentQuizData.question
    a_text.innerText = currentQuizData.a
    b_text.innerText = currentQuizData.b
    c_text.innerText = currentQuizData.c
    d_text.innerText = currentQuizData.d
    e_text.innerText = currentQuizData.e

    if(currentQuizData.sender){
        sender.innerText = "Gönderen: " + currentQuizData.sender;
    } else {
        sender.innerText = "";
    }

    if(currentQuizData.sources){

        if(currentQuizData.sources.length > 1){
            sources.innerText = "Kaynaklar: ";
        } else {
            sources.innerText = "Kaynak: ";
        }

        for (let i = 0; i < currentQuizData.sources.length; i++) {
            if(i !== currentQuizData.sources.length - 1){
                sources.appendChild(createSourceLink(currentQuizData.sources[i], i + 1));
                sources.appendChild(document.createTextNode(", "));
            } else {
                sources.appendChild(createSourceLink(currentQuizData.sources[i], i + 1));
            }
        }
    } else {
        sources.innerText = "";
    }

    if(currentQuizData.prefix){
        prefix.innerText = currentQuizData.prefix;
    } else {
        prefix.innerText = "";
    }

    questionInfo.qNumber.innerText = (currentQuiz + +1).toString();
    questionInfo.qLimit.innerText = quizLimit.toString();
}

function timer(){
    totalAnswerTime = totalAnswerTime-1;
    if (totalAnswerTime < 0){
        clearInterval(counter);
        return;
    }
    timeLeft.innerText = totalAnswerTime;
}

function deselectAnswers() {
    answerEls.forEach(answerEl => answerEl.checked = false)
}

function getSelected() {
    let answer

    answerEls.forEach(answerEl => {
        if(answerEl.checked) {
            answer = answerEl.id
        }
    })

    return answer
}

function playNow(sound) {
    let audio = document.getElementById(sound);
    audio.play();
}

function getName() {

    getCertificateNumber("", false)
    return;

    let nameInput = document.getElementById("name");
    let nameValue = nameInput.value;
    testerName = nameInput.value;

    if(nameValue === "" || nameValue === undefined){
        nameInput.placeholder = "Buraya adınızı yazmalısınız";
        playNow("invalid");
    } else {
      getCertificateNumber(nameValue)
    }
}

function completeTest() {
    var allCompleted = false;
    const testIndex = level-1;
    const localStorageKeys = {
      locked: ['locked2', 'locked3', 'locked4', 'locked5', 'locked6', 'locked6'],
      completed: ['completed1', 'completed2', 'completed3', 'completed4', 'completed5', 'completed6']
    };
    
  const completedKey = localStorageKeys.completed[testIndex];
  localStorage.setItem(completedKey, 'true');  // Tamamlanan testin durumunu kaydet
  
  if (testIndex < localStorageKeys.locked.length - 1) {
    const nextLockedKey = localStorageKeys.locked[testIndex + 1];
    localStorage.removeItem(nextLockedKey);  // Bir sonraki testin kilidini aç
  }

  if(level < 6){
    level++;
    localStorage.setItem("level", level);
  } else {
    localStorage.setItem("allCompleted", true);
    allCompleted = true;
  }

  return allCompleted;

}

function restartTest(testIndex) {
    localStorage.setItem("restart", true);
    localStorage.setItem("restartIndex", testIndex);
    window.location.href = "test.html";
}

submitBtn.addEventListener('click', () => {

    clearTimeout(hideTimeout);
    const answer = getSelected()
    if(answer) {
            let widthInPercent = currentQuiz * (100/quizLimit) + (100/quizLimit);
            document.getElementById("progress-bar").style.width = widthInPercent + "%";
            if(answer === quizData[currentQuiz].correct) {
                score++
                document.getElementById("false").classList.add("gizle");
                document.getElementById("true").classList.remove("gizle");
                playNow("yes");
            } else {
                document.getElementById("true").classList.add("gizle");
                document.getElementById("false").classList.remove("gizle");
                playNow("no");
            }

            hideTimeout = setTimeout(function(){
                document.getElementById("true").classList.add("gizle");
                document.getElementById("false").classList.add("gizle");
            }, 2000);

            currentQuiz++
            updateKart(currentQuiz);

            if(currentQuiz < quizLimit) {
                loadQuiz();
                clearLiHighlights();
            } else {
            clearInterval(counter);
            let endDate = new Date();
            totalTime = Math.floor((endDate.getTime() - start.getTime()) / 1000);

            stopTime();
            if(score < minCorrectAnswer){
                increaseTried();
                playNow("failed");

                if(restart){
                    quiz.innerHTML = `
                        <div id="result">
                        <h2>Maalesef...</h2>
                        <div class="result-inner">
                            ${quizLimit} sorunun ${score} tanesini doğru cevapladınız ve en az ${minCorrectAnswer} doğru cevap gerekiyordu.</br></br> Yeniden denemek ister misiniz?
                        </div>
                        </div>
                        <div class="failed-buttons-container">
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="redirectToHome()">Ana Menüye Dön</button>
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="restartTest(level)">Yeniden Dene</button>
                        </div>
                   `
                } else {
                    quiz.innerHTML = `
                        <div id="result">
                        <h2>Maalesef...</h2>
                        <div class="result-inner">
                            ${quizLimit} sorunun ${score} tanesini doğru cevapladınız ve en az ${minCorrectAnswer} doğru cevap gerekiyordu.</br></br> Yeniden denemek ister misiniz?
                        </div>
                        </div>
                        <div class="failed-buttons-container">
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="redirectToHome()">Ana Menüye Dön</button>
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="location.reload()">Yeniden Dene</button>
                        </div>
                   `
                }

            } else {
                let tada = new Audio("sound/tada.mp3");
                tada.play();

                if(restart){
                    quiz.innerHTML = `
                        <div id="result">
                        <h2>Tebrikler!</h2>
                        <div class="result-inner">
                           ${quizLimit} sorunun ${score} tanesini doğru cevapladınız.</br></br>Bu testi daha önce de tamamlamıştınız. Yeniden denemek ister misiniz?
                        </div>
                        </div>
                        <div class="failed-buttons-container">                        
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="redirectToHome()">Ana Menüye Dön</button>
                        <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="restartTest(level)">Yeniden Dene</button>
                        </div>
                    `
                } else {
                    var checkallCompleted = completeTest();
                    if(!checkallCompleted){
                        quiz.innerHTML = `
                <div id="result">
                <h2>Tebrikler!</h2>
                <div class="result-inner">
                   ${quizLimit} sorunun ${score} tanesini doğru cevapladınız.</br></br>
                </div>
                </div>
                <div class="failed-buttons-container">
                <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="redirectToHome()">Ana Menüye Dön</button>
                <button class="try-again-button_IPTAL red-gradient failed-screen-double-button" onclick="location.reload()">${nextLevel}. Seviye Testine Geç →</button>
                </div>
            `
                    } else {
                        quiz.innerHTML = `
                <div id="result">
                <h2>Tebrikler!</h2>
                <div class="result-inner">
                    <p>
                    Seçimle ilgili YSK genelgesi ve ilgili kanun hakkındaki bu testi başarıyla tamamlayarak bu sertifikayı almaya hak kazandın!
                    </br></br>
                    Sandık koruma gücünün vazgeçilmez bir neferi “Bilinçli Müşahit” olarak 28 Mayıs’a hazırsın. 
                    </br></br>
                    Sertifikanı indirip sosyal medyada paylaşarak diğer müşahitleri de bu sertifikayı almaya davet edebilirsin.
                    </p>
                </div>
                </div>
                <button class="red-gradient" onclick="getName()">Sertifikamı Oluştur →</button>
            `
                    }
                }
            }
        }
        switchKart();
    } else {
        playNow("invalid");
    }
})