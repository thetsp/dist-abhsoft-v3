const isDev = location.origin.indexOf('localhost') !== -1
let serverUrl = isDev ? 'http://localhost:3005' : 'https://ajsingservices.com'

const transformData = (_portfolio) => {
    const jsonKeys = [
        'education', 'experience', 'skills', 'projects', 'hobbies', 'strengths', 'achievements', 'certifications', 'gallery', 'languages', 'links', 'strengths'
    ]
    for (let i = 0; i < jsonKeys?.length; i++) {
        try {
            const key = jsonKeys[i]
            // @ts-ignore
            _portfolio[key] = JSON.parse(_portfolio[key])
        } catch (error) {
            console.log(`error`, error)
        }
    }
    // _portfolio.skills = JSON.parse(_portfolio.skills)
    // _portfolio.skills = JSON.parse(_portfolio.skills)
    // _portfolio.projects = JSON.parse(_portfolio.projects)
}

const encode = (data, replaceChar = '=', replaceBy = '-') => {
    const result = btoa(data)
    if (replaceChar) {
        return result.replaceAll(replaceChar, replaceBy)
    }

    return result
}

const fetchPortfolio = async (url) => {
    try {
        const response = await fetch(url)
        const result = await response.json()
        if (!result.d) { return }
        const _portfolio = (result.d[0])
        transformData(_portfolio)
        document.title = `${document.title} (${_portfolio.name})`
        return _portfolio
    } catch (error) {
        console.log(`error`, error)
    }
}

const main = async () => {
    const slices = location.search.split('?')
    const id = slices[slices.length - 1]
    let portfolio;
    const db = await openDB()
    if (id === 'local') {
        serverUrl = ''
        let storageKey = 'form-data-portfolio-create-form'
        let _portfolio = await getFormData(db, storageKey)
        if (!_portfolio) {
            const dataFromStorage = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || ''
            _portfolio = JSON.parse(dataFromStorage)
        }
        for (const key in _portfolio) {
            const keySlices = key.split('$')
            if (keySlices?.length > 1) {
                // @ts-ignore
                _portfolio[keySlices[0]] = _portfolio[keySlices[0]] || []
                // @ts-ignore
                _portfolio[keySlices[0]][keySlices[2]] = _portfolio[keySlices[0]][keySlices[2]] || {}
                // @ts-ignore
                _portfolio[keySlices[0]][keySlices[2]][keySlices[1]] = _portfolio[key]
            }
        }
        // transformData(_portfolio)
        portfolio = _portfolio
    } else {
        /** @type {$model.MyModels['tspSoftPortfolio']['fieldsNames']} */
        const approvedFieldName = 'approved'
        /** @type {$server.StoreQueryStringObject<$model.MyModels['tspSoftPortfolio']['fieldsNames']>} */
        const storeQSObj = { match: [approvedFieldName, '==', 1] }
        const str = encode(JSON.stringify(storeQSObj))
        const api = `/api/tspsoft/portfolio/${id}?str=${str}`
        portfolio = await fetchPortfolio(api)
        if (!portfolio) {
            portfolio = await fetchPortfolio(`${serverUrl}${api}`)
        }
    }
    // console.log(`portfolio`, portfolio)
    document.getElementById('spinner').classList.remove('show')

    if (portfolio) {
        document.getElementById('name').textContent = portfolio.name
        document.getElementById('role').textContent = portfolio.currentRole
        document.getElementById('address').textContent = portfolio.address
        document.getElementById('phone').textContent = portfolio.phone
        document.getElementById('email').textContent = portfolio.email
        document.getElementById('desc').textContent = portfolio.desc
        document.getElementById('age').textContent = portfolio.age
        document.getElementById('profile').src = serverUrl + portfolio.picture + '.jpeg'

        const skillsContainer = document.getElementById('skills-container')
        for (let i = 0; i < portfolio.skills.length; i++) {
            const skill = portfolio.skills[i];
            skillsContainer.innerHTML += /* html */`
                <div class="skill mb-4">
                    <div class="d-flex justify-content-between">
                        <h6 class="font-weight-bold">${skill.skill}</h6>
                    </div>
                </div>
            `
        }

        const experienceContainer = document.getElementById('experience-container')
        for (let i = 0; i < portfolio.experience.length; i++) {
            const experience = portfolio.experience[i];
            experienceContainer.innerHTML += /* html */`
                <div class="col-sm-6">
                    <h5>${experience.role}</h5>
                    <hr class="text-primary my-2">
                    <p class="text-primary mb-1">${experience.startDate}${experience.endDate ? `- ${experience.endDate}` : ''}</p>
                    <h6 class="mb-0">${experience.company}</h6>
                </div>
            `
        }

        const educationContainer = document.getElementById('education-container')
        for (let i = 0; i < portfolio.education.length; i++) {
            const education = portfolio.education[i];
            educationContainer.innerHTML += /* html */`
                <div class="col-sm-6">
                    <h5>${education.school}</h5>
                    <hr class="text-primary my-2">
                    <p class="text-primary mb-1">Completion Date: ${education.date}</p>
                    <h6 class="mb-0">Grades/Marks: ${education.grades}</h6>
                </div>
            `
        }

        const projectsContainer = document.getElementById('projects-container')
        if (portfolio.projects?.[0].project) {
            for (let i = 0; i < portfolio.projects.length; i++) {
                const project = portfolio.projects[i];
                projectsContainer.innerHTML += /* html */`
                    <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div class="service-item d-flex flex-column flex-sm-row bg-white rounded h-100 p-4 p-lg-5">
                            <div class="bg-icon flex-shrink-0 mb-3">
                                <i class="fa fa-code fa-2x text-dark"></i>
                            </div>
                            <div class="ms-sm-4">
                                <h4 class="mb-3">${project.project}</h4>
                                ${project.link ? `<h6 class="mb-3">Link: <a href="${project.link}" class="text-primary">${project.link.slice(0, 30)}</a></h6>` : ''}
                                <div class="project-desc">${project.desc}</div>
                            </div>
                        </div>
                    </div>
                `
            }
        } else {
            document.getElementById('service').remove()
        }

        const galleryContainer = document.getElementById('gallery-container')
        if (portfolio.gallery?.[0].gpicture) {
            for (let i = 0; i < portfolio.gallery.length; i++) {
                const gallery = portfolio.gallery[i];
                galleryContainer.innerHTML += /* html */`
                    <div class="col-lg-4 col-md-6 portfolio-item">
                        <div class="portfolio-img img-wrapper rounded overflow-hidden">
                            <img class="img-fluid" src="${serverUrl + gallery.gpicture + '.jpeg'}" alt="">
                        </div>
                    </div>
                `
            }
        } else {
            document.getElementById('project').remove()
        }

        const achievementsContainer = document.getElementById('achievements-container')
        if (portfolio.achievements?.[0].achievement) {
            for (let i = 0; i < portfolio.achievements.length; i++) {
                const achievement = portfolio.achievements[i];
                achievementsContainer.innerHTML += /* html */`
                    <div class="col-lg-4 col-md-6 portfolio-item ">
                        <div class="portfolio-img img-wrapper rounded overflow-hidden">
                            <img class="img-fluid" src="${serverUrl + achievement.achievement_picture + '.jpeg'}" alt="">
                        </div>
                        <div class="title">${achievement.achievement}</div>
                    </div>
                `
            }
        } else {
            document.getElementById('achievements').remove()
        }

        const certificationsContainer = document.getElementById('certifications-container')
        if (portfolio.certifications?.[0].certification) {
            for (let i = 0; i < portfolio.certifications.length; i++) {
                const certification = portfolio.certifications[i];
                certificationsContainer.innerHTML += /* html */`
                    <div class="col-lg-4 col-md-6 portfolio-item ">
                        <div class="portfolio-img img-wrapper rounded overflow-hidden">
                            <img class="img-fluid" src="${serverUrl + certification.certification_picture + '.jpeg'}" alt="">
                        </div>
                        <div class="title">${certification.certification}</div>
                    </div>
                `
            }
        } else {
            document.getElementById('certifications').remove()
        }

        const linksContainer = document.getElementById('links-container')
        if (portfolio.links?.[0].link) {
            for (let i = 0; i < portfolio.links.length; i++) {
                const link = portfolio.links[i];
                linksContainer.innerHTML += /* html */`
                    <a class="btn btn-primary me-2" href="${link.link}">
                        ${link.link.slice(0, 20)}
                    </a>
                `
            }
        } else {
            document.getElementById('links').remove()
        }

        const strengthsContainer = document.getElementById('strengths-container')
        for (let i = 0; i < portfolio.strengths.length; i++) {
            const strength = portfolio.strengths[i];
            strengthsContainer.innerHTML += /* html */`
                <div class="skill mb-4">
                    <div class="d-flex justify-content-between">
                        <h6 class="font-weight-bold">${strength.strength}</h6>
                    </div>
                </div>
            `
        }

        const hobbiesContainer = document.getElementById('hobbies-container')
        for (let i = 0; i < portfolio.hobbies.length; i++) {
            const hobby = portfolio.hobbies[i];
            hobbiesContainer.innerHTML += /* html */`
                <div class="skill mb-4">
                    <div class="d-flex justify-content-between">
                        <h6 class="font-weight-bold">${hobby.hobby}</h6>
                    </div>
                </div>
            `
        }

        const languagesContainer = document.getElementById('languages-container')
        for (let i = 0; i < portfolio.languages.length; i++) {
            const language = portfolio.languages[i];
            languagesContainer.innerHTML += /* html */`
                <div class="skill mb-4">
                    <div class="d-flex justify-content-between">
                        <h6 class="font-weight-bold">${language.language}</h6>
                    </div>
                </div>
            `
        }
    }

    (function ($) {
        "use strict";


        // Initiate the wowjs
        new WOW().init();


        // Navbar on scrolling
        $(window).scroll(function () {
            if ($(this).scrollTop() > 300) {
                $('.navbar').fadeIn('slow').css('display', 'flex');
            } else {
                $('.navbar').fadeOut('slow').css('display', 'none');
            }
        });


        // Smooth scrolling on the navbar links
        $(".navbar-nav a").on('click', function (event) {
            if (this.hash !== "") {
                event.preventDefault();

                $('html, body').animate({
                    scrollTop: $(this.hash).offset().top - 45
                }, 1500, 'easeInOutExpo');

                if ($(this).parents('.navbar-nav').length) {
                    $('.navbar-nav .active').removeClass('active');
                    $(this).closest('a').addClass('active');
                }
            }
        });


        // Back to top button
        $(window).scroll(function () {
            if ($(this).scrollTop() > 300) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
        });
        $('.back-to-top').click(function () {
            $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
            return false;
        });


        // Typed Initiate
        if ($('.typed-text-output').length == 1) {
            var typed_strings = $('.typed-text').text();
            var typed = new Typed('.typed-text-output', {
                strings: typed_strings.split(', '),
                typeSpeed: 100,
                backSpeed: 20,
                smartBackspace: false,
                loop: true
            });
        }


        // Modal Video
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);
        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })
        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })


        // Facts counter
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });


        // Skills
        $('.skill').waypoint(function () {
            $('.progress .progress-bar').each(function () {
                $(this).css("width", $(this).attr("aria-valuenow") + '%');
            });
        }, { offset: '80%' });


        // Portfolio isotope and filter
        var portfolioIsotope = $('.portfolio-container').isotope({
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
        });
        $('#portfolio-flters li').on('click', function () {
            $("#portfolio-flters li").removeClass('active');
            $(this).addClass('active');

            portfolioIsotope.isotope({ filter: $(this).data('filter') });
        });


        // Testimonials carousel
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: true,
            loop: true,
        });
    })(jQuery);
}

main()