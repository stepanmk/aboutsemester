// Načítání konfigurace z config.json
fetch('config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Chyba při načítání souboru config.json: ${response.statusText}`);
        }
        return response.json();
    })
    .then(config => {
        const language = config.language;
        const winterSemesterStart = new Date(config.winterSemesterStart);
        const summerSemesterStart = new Date(config.summerSemesterStart);

        // Texty pro češtinu a angličtinu
        const textContent = {
            cs: {
                weekText: 'týden semestru',
                semesterEnded: '',
                oddText: 'lichý',
                evenText: 'sudý',
                locale: 'cs-CZ',
                logo: 'UTKO_Inverze_RGB_CZ.png' // České logo
            },
            en: {
                weekText: 'week of semester',
                semesterEnded: '',
                oddText: 'odd',
                evenText: 'even',
                locale: 'en-GB',
                logo: 'UTKO_Inverze_RGB_EN.png' // Anglické logo
            }
        };

        // Nastavení loga podle jazyka
        const logoElement = document.querySelector('img');
        logoElement.src = textContent[language].logo; // Dynamicky změníme zdroj obrázku loga

        // Nastavení pozadí podle kalendářní zimy
        const bodyElement = document.querySelector('body');
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();

        // Kalendářní zima: od 21. prosince do 20. března
        const isWinter = (month === 11 && day >= 21) || (month >= 0 && month <= 2) || (month === 2 && day <= 20);

        if (isWinter) {
            bodyElement.style.backgroundImage = "url('uvodka_1440x540_hlavni_zima.jpg')";
        } else {
            bodyElement.style.backgroundImage = "url('uvodka_1440x540_hlavni.jpg')";
        }

        // Funkce pro manuální formátování datumu ve formátu "den v týdnu, den.měsíc.rok"
        function formatDateWithDots(date, locale) {
            const options = { weekday: 'long' }; // Získáme název dne v týdnu
            const dayOfWeek = date.toLocaleDateString(locale, options); // Den v týdnu
            const day = String(date.getDate()).padStart(2, '0'); // Den s přední nulou
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Měsíc s přední nulou
            const year = date.getFullYear(); // Rok

            return `${dayOfWeek}, ${day}.${month}.${year}`; // Finální formát
        }

        // Funkce pro zobrazení času ve 24hodinovém formátu
        function formatTime(date) {
            return date.toLocaleTimeString('cs-CZ'); // 24hodinový formát pro oba jazyky
        }

        // Funkce pro výpočet týdne v semestru
        function getSemesterWeek(startDate) {
            const now = new Date();

            if (now < startDate) {
                return null; // Pokud je aktuální datum před začátkem semestru, vrátíme null
            }

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 13 * 7); // Semestr trvá 13 týdnů

            if (now > endDate) {
                return null; // Pokud je aktuální datum po konci semestru, vrátíme null
            }

            const diffTime = now - startDate;
            const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
            return diffWeeks;
        }

        // Funkce pro zjištění, zda je týden sudý nebo lichý
        function isEvenWeek() {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const pastDaysOfYear = (now - startOfYear) / (1000 * 60 * 60 * 24);

            // ISO week calculation, where week starts on Monday
            const weekNumber = Math.ceil((pastDaysOfYear + (startOfYear.getDay() === 0 ? 6 : startOfYear.getDay() - 1)) / 7);

            return weekNumber % 2 === 0; // Sudý týden = true, lichý týden = false
        }

        // Funkce pro získání anglické pořadové číslovky (1st, 2nd, 3rd, 4th, ...)
        function getOrdinalSuffix(n) {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]); // Vrátí správnou příponu
        }

        // Funkce pro aktualizaci času, datumu a týdne semestru
        function updateTime() {
            const now = new Date();

            // Zobrazení aktuálního datumu ve formátu "den v týdnu, den.měsíc.rok"
            const dateElement = document.getElementById("date");
            dateElement.textContent = formatDateWithDots(now, textContent[language].locale);

            // Zobrazení aktuálního času ve 24hodinovém formátu
            const timeElement = document.getElementById("time");
            timeElement.textContent = formatTime(now);

            // Výpočet aktuálního týdne semestru
            const currentMonth = now.getMonth();
            const semesterStart = (currentMonth >= 8 && currentMonth <= 11)
                ? winterSemesterStart
                : summerSemesterStart;

            const weekElement = document.getElementById("week");
            const week = getSemesterWeek(semesterStart);

            // Zjištění, zda je týden sudý nebo lichý
            const evenOrOddText = isEvenWeek() ? textContent[language].evenText : textContent[language].oddText;

            if (week) {
                // V češtině běžné číslování, v angličtině pořadové číslovky
                if (language === 'cs') {
                    weekElement.textContent = `${week}. ${textContent[language].weekText} (${evenOrOddText})`;
                } else {
                    weekElement.textContent = `${getOrdinalSuffix(week)} ${textContent[language].weekText} (${evenOrOddText})`;
                }
            } else {
                weekElement.textContent = ''; // Pokud není semestr, nezobrazí se nic
            }
        }

        // Aktualizace času každou vteřinu
        setInterval(updateTime, 1000);
    })
    .catch(error => {
        console.error('Chyba při načítání konfigurace:', error);
    });
