document.addEventListener('DOMContentLoaded', function() {
<<<<<<< HEAD
    // 1. Show loading spinner
    const loadingElem = document.createElement('div');
    loadingElem.id = "loading-spinner";
    loadingElem.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">Loading survey results...</div>
    `;
    document.body.appendChild(loadingElem);

    const database = firebase.database();
    const surveyRef = database.ref('surveys');

    surveyRef.once('value').then(snapshot => {
        // 2. Hide loading spinner
        loadingElem.style.display = 'none';

        const surveys = [];
        snapshot.forEach(child => {
            surveys.push(child.val());
        });

        if (surveys.length === 0) {
            document.getElementById('message-container').textContent = "No survey results found.";
            return;
        }

        // 1. Participation Overview
        document.getElementById('total-surveys').textContent = surveys.length;

        // Age calculations
        const ages = surveys.map(s => {
            if (!s.personalDetails || !s.personalDetails.dob) return null;
            return getAge(s.personalDetails.dob);
        }).filter(age => age !== null);

        if (ages.length > 0) {
            const avgAge = (ages.reduce((a,b) => a + b, 0) / ages.length).toFixed(1);
            document.getElementById('avg-age').textContent = `${avgAge} years`;
            document.getElementById('min-age').textContent = `${Math.min(...ages)} years`;
            document.getElementById('max-age').textContent = `${Math.max(...ages)} years`;
        }

        // 2. Food Preferences
        let pizzaCount = 0, pastaCount = 0, papWorsCount = 0, total = surveys.length;

        surveys.forEach(survey => {
            const foods = survey.favoriteFood || {};
            if (foods.pizza) pizzaCount++;
            if (foods.pasta) pastaCount++;
            if (foods.papwors) papWorsCount++;
        });

        const pizzaPercent = total ? ((pizzaCount / total) * 100).toFixed(1) : "0.0";
        const pastaPercent = total ? ((pastaCount / total) * 100).toFixed(1) : "0.0";
        const papWorsPercent = total ? ((papWorsCount / total) * 100).toFixed(1) : "0.0";

        document.getElementById('pizza_percent').textContent = `${pizzaPercent}%`;
        document.getElementById('pasta_percent').textContent = `${pastaPercent}%`;
        document.getElementById('pap_wors_percent').textContent = `${papWorsPercent}%`;

        // 3. Activity Ratings
        const ratingValues = {
            "strongly-agree": 1,
            "agree": 2,
            "neutral": 3,
            "disagree": 4,
            "strongly-disagree": 5
        };

        const activities = [
            { key: "movies", avgId: "movies_avg", starsId: "movies_stars" },
            { key: "radio", avgId: "radio_avg", starsId: "radio_stars" },
            { key: "eatOut", avgId: "eat_out_avg", starsId: "eat_out_stars" },
            { key: "tv", avgId: "tv_avg", starsId: "tv_stars" }
        ];

        activities.forEach(activity => {
            let sum = 0, count = 0;
            surveys.forEach(survey => {
                if (survey.ratings && survey.ratings[activity.key]) {
                    const val = ratingValues[survey.ratings[activity.key]];
                    if (val) {
                        sum += val;
                        count++;
                    }
                }
            });
            const avg = count ? (sum / count).toFixed(1) : "0.0";
            document.getElementById(activity.avgId).textContent = `${avg}/5`;
        });
    });

    function getAge(dob) {
        var birth = new Date(dob);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    function setBar(barElem, percent) {
        if (barElem) {
            barElem.style.width = (percent * 100) + "%";
            barElem.style.height = "10px";
            barElem.style.backgroundColor = "#222";
        }
    }

    function getStarsHTML(avg) {
        let rounded = Math.round(5 - avg + 1); // 1 is best, 5 is worst
        let stars = "";
        for (let i = 1; i <= 5; i++) {
            stars += `<span style="color:${i <= rounded ? '#ffd700' : '#ccc'}">&#9733;</span>`;
        }
        return stars;
    }
});
=======
    // Initialize Firebase
    const database = firebase.database();
    const surveysRef = database.ref('surveys');
    
    // Show loading state
    document.body.classList.add('loading');
    
    // Fetch all survey data
    surveysRef.once('value').then(function(snapshot) {
        const surveys = snapshot.val();
        
        if (!surveys) {
            showNoDataMessage();
            return;
        }
        
        // Convert the surveys object to an array
        const surveyList = Object.keys(surveys).map(key => {
            return {
                id: key,
                ...surveys[key]
            };
        });
        
        const stats = calculateStatistics(surveyList);
        updateResultsPage(stats);
        
    }).catch(error => {
        console.error("Error fetching surveys:", error);
        showErrorMessage();
    }).finally(() => {
        document.body.classList.remove('loading');
    });
});

function calculateStatistics(surveys) {
    // 1. Basic counts
    const totalSurveys = surveys.length;
    
    // 2. Age calculations - using direct age field if available
    const ages = surveys
        .map(s => parseInt(s.age))
        .filter(age => !isNaN(age) && age > 0);
    
    const ageStats = {
        avg: ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 'N/A',
        max: ages.length ? Math.max(...ages) : 'N/A',
        min: ages.length ? Math.min(...ages) : 'N/A'
    };
    
    // 3. Food preferences (percentage)
    const foodCounts = {
        pizza: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('pizza')).length,
        pasta: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('pasta')).length,
        papwors: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('papwors')).length
    };
    
    // 4. Rating averages (1-5 scale)
    const ratingAverages = {
        movies: calculateRatingAverage(surveys, 'movies'),
        radio: calculateRatingAverage(surveys, 'radio'),
        eatOut: calculateRatingAverage(surveys, 'food'),  // Note: matches your form's radio name
        tv: calculateRatingAverage(surveys, 'tv')
    };
    
    return {
        totalSurveys,
        avgAge: ageStats.avg,
        maxAge: ageStats.max,
        minAge: ageStats.min,
        pizzaPercent: totalSurveys ? ((foodCounts.pizza / totalSurveys) * 100).toFixed(1) : '0',
        pastaPercent: totalSurveys ? ((foodCounts.pasta / totalSurveys) * 100).toFixed(1) : '0',
        papWorsPercent: totalSurveys ? ((foodCounts.papwors / totalSurveys) * 100).toFixed(1) : '0',
        moviesAvg: ratingAverages.movies,
        radioAvg: ratingAverages.radio,
        eatOutAvg: ratingAverages.eatOut,
        tvAvg: ratingAverages.tv
    };
}

// Helper functions
function calculateRatingAverage(surveys, ratingName) {
    const validRatings = surveys
        .map(s => ratingToNumber(s.ratings?.[ratingName]))
        .filter(r => !isNaN(r));
    
    if (validRatings.length === 0) return '0';
    
    const sum = validRatings.reduce((a, b) => a + b, 0);
    return (sum / validRatings.length).toFixed(1);
}

function ratingToNumber(rating) {
    const ratingMap = {
        'strongly-agree': 1,
        'agree': 2,
        'neutral': 3,
        'disagree': 4,
        'strongly-disagree': 5
    };
    return ratingMap[String(rating).toLowerCase()] || NaN;
}

function updateResultsPage(stats) {
    // Update all statistics
    document.getElementById('total-surveys').textContent = stats.totalSurveys;
    document.getElementById('avg-age').textContent = stats.avgAge;
    document.getElementById('max-age').textContent = stats.maxAge;
    document.getElementById('min-age').textContent = stats.minAge;
    
    document.getElementById('pizza_percent').textContent = `${stats.pizzaPercent}%`;
    document.getElementById('pasta_percent').textContent = `${stats.pastaPercent}%`;
    document.getElementById('pap_wors_percent').textContent = `${stats.papWorsPercent}%`;
    
    document.getElementById('movies_avg').textContent = stats.moviesAvg;
    document.getElementById('radio_avg').textContent = stats.radioAvg;
    document.getElementById('eat_out_avg').textContent = stats.eatOutAvg;
    document.getElementById('tv_avg').textContent = stats.tvAvg;
}

function showNoDataMessage() {
    const container = document.createElement('div');
    container.className = 'no-data';
    container.innerHTML = `
        <h2>No Survey Data Available</h2>
        <p>Submit surveys through the form to see results.</p>
        <a href="index.html">Go to Survey Form</a>
    `;
    document.body.appendChild(container);
}

function showErrorMessage() {
    const container = document.createElement('div');
    container.className = 'error-message';
    container.textContent = 'Failed to load survey data. Please try again later.';
    document.body.appendChild(container);
}
>>>>>>> 59c3bda7e3f335b8de3070002ed592ebfc70536a
