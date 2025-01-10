// Načítání konfigurace pomocí XMLHttpRequest pro lepší kompatibilitu s Tizen OS
var xhr = new XMLHttpRequest();
xhr.open('GET', 'config.json', true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            var config = JSON.parse(xhr.responseText);
            initializeApp(config); // Zavolání hlavní funkce s konfigurací
        } else {
            document.body.innerHTML = '<p style="color: red;">Chyba při načítání config.json: ' + xhr.statusText + '</p>';
        }
    }
};
xhr.send();

function initializeApp(config) {
    var language = config.language;
    var winterSemesterStart = new Date(config.winterSemesterStart);
    var summerSemesterStart = new Date(config.summerSemesterStart);

    // Texty pro češtinu a angličtinu
    var textContent = {
        cs: {
            weekText: '',
            semesterEnded: '',
            oddText: 'lichý',
            evenText: 'sudý',
            locale: 'cs-CZ',
            logo: 'UTKO_Inverze_RGB_CZ.png' // České logo
        },
        en: {
            weekText: '',
            semesterEnded: '',
            oddText: 'odd',
            evenText: 'even',
            locale: 'en-GB',
            logo: 'UTKO_Inverze_RGB_EN.png' // Anglické logo
        }
    };

    // Nastavení loga podle jazyka
    var logoElement = document.querySelector('img');
    logoElement.src = textContent[language].logo;

    // Nastavení pozadí podle kalendářní zimy
    var bodyElement = document.querySelector('body');
    var now = new Date();
    var month = now.getMonth();
    var day = now.getDate();

    var isWinter = (month === 11 && day >= 21) || (month >= 0 && month <= 2) || (month === 2 && day <= 20);

    if (isWinter) {
        bodyElement.style.backgroundImage = "url('uvodka_1440x540_hlavni_zima.jpg')";
    } else {
        bodyElement.style.backgroundImage = "url('uvodka_1440x540_hlavni.jpg')";
    }

    // Funkce pro formátování datumu
    function formatDateWithDots(date, locale) {
        var options = { weekday: 'long' };
        var dayOfWeek = date.toLocaleDateString(locale, options);
        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var year = date.getFullYear();

        return dayOfWeek + ', ' + day + '.' + month + '.' + year;
    }

    // Funkce pro zobrazení času
    function formatTime(date) {
        return date.toLocaleTimeString('cs-CZ');
    }

    // Funkce pro výpočet týdne v semestru
    function getSemesterWeek(startDate) {
        var now = new Date();

        if (now < startDate) {
            return null;
        }

        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 13 * 7);

        if (now > endDate) {
            return null;
        }

        var diffTime = now - startDate;
        var diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    }

    // Funkce pro zjištění sudého nebo lichého týdne
    function isEvenWeek() {
        var now = new Date();
        var startOfYear = new Date(now.getFullYear(), 0, 1);
        var pastDaysOfYear = (now - startOfYear) / (1000 * 60 * 60 * 24);
        var weekNumber = Math.ceil((pastDaysOfYear + (startOfYear.getDay() === 0 ? 6 : startOfYear.getDay() - 1)) / 7);
        return weekNumber % 2 === 0;
    }

    // Funkce pro získání pořadové číslovky
    function getOrdinalSuffix(n) {
        var s = ["th", "st", "nd", "rd"];
        var v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // Funkce pro aktualizaci času a týdne
    function updateTime() {
        var now = new Date();

        var dateElement = document.getElementById("date");
        dateElement.textContent = formatDateWithDots(now, textContent[language].locale);

        var timeElement = document.getElementById("time");
        timeElement.textContent = formatTime(now);

        var currentMonth = now.getMonth();
        var semesterStart = (currentMonth >= 8 && currentMonth <= 11)
            ? winterSemesterStart
            : summerSemesterStart;

        var weekElement = document.getElementById("week");
        var week = getSemesterWeek(semesterStart);

        var evenOrOddText = isEvenWeek() ? textContent[language].evenText : textContent[language].oddText;

        if (week) {
            if (language === 'cs') {
                weekElement.textContent = week + '. ' + textContent[language].weekText + ' (' + evenOrOddText + ')';
            } else {
                weekElement.textContent = getOrdinalSuffix(week) + ' ' + textContent[language].weekText + ' (' + evenOrOddText + ')';
            }
        } else {
            weekElement.textContent = '';
        }
    }

    // Aktualizace času každou sekundu
    setInterval(updateTime, 1000);
}
