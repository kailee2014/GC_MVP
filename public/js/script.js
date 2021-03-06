// true: ignore look up ,capture, validation plugin
var debugFlag = false;

var hostName = window.location.host;

jQuery(document).ready(function() {
    
    //identify code init
    
    $(function() {
        
        btnContinue.removeAttr("disabllocaled");
        
        identifyCodeInput.blur(function(){
            ifIdentifyPass();
        });

        var my_jPlayer = $("#jquery_jplayer");

        my_jPlayer.jPlayer({
            ready: function() {
                $("#jquery_jplayer").jPlayer("setMedia", {mp3: 'http://webmail.epals.com/securimage/securimage_play.php'});
            },
            timeupdate: function(event) {
                
            },
            play: function(event) {
                $('#playlink').html('Playing audio...');
            },
            pause: function(event) {

            },
            ended: function(event) {
                $('#playlink').html('Use audio verification instead');
                $("#jquery_jplayer").jPlayer("setMedia", {mp3: 'http://webmail.epals.com/securimage/securimage_play.php'});
            },
            preload: "none",
            swfPath: "/JS/",
            cssSelectorAncestor: "#jp_container",
            wmode: "window",
            errorAlerts: false,
            warningAlerts: false,
            Context: {solution:'html, flash', supplied:'mp3'}

        });
    });
   
    
    $("#getanother").live("click",function(){
        
        $('img[id=captcha]').attr('src','http://webmail.epals.com/securimage/securimage_show.php?' + Math.random());
        $('input[name=captcha_field]').val('');
        $('#join-modal .continue').attr("disabled","disabled");
        
        return false;
    });
 
    // show width ---------------------------------------- //
    var autoWidthElems = $('.calc-widths .content').filter(function(index) {
        var h2 = $(this).find('h2').text().toLowerCase();
        var skip = ['top/global nav', 'main nav', 'breadcrumb', 'footer', 'sub nav', 'pagination', 'selection breadcrumb', 'filter/sort'];
        if ($.inArray(h2, skip) >= 0) {
            return false;
        }
        return true;
    })

    var imgElems = $('img.responsive');
    var widthElems = $('.show-width').add(autoWidthElems, imgElems);

    widthElems.each(showWidth);
    $(window).resize(function() {
        widthElems.each(showWidth);
    });

    function showWidth() {
        var e = $(this).prop('tagName').toLowerCase();
        var w = $(this).outerWidth();

        var className = 'width';
        var target = $(this);
        var icon = '<span class="glyphicon glyphicon-resize-horizontal"></span> ';

        if (e == 'img') {
            className = 'img-width';
            target = $(this).parent();
            icon += 'img ';
        }

        var p = target.find('p.' + className);
        if (!p.length) {
            p = $('<p class="' + className + '">');
        }

        p.html(icon + w + 'px');

        if (e == 'img') {
            $(this).after(p);
        } else {
            target.append(p);
        }
    }

    // read query parameters
    function getParameterByName(name) {
        
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    // initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // --------------------------------------------------- //
    // challenges home                                     //
    // --------------------------------------------------- //

    // full screen hero (v4a) ---------------------------- //
    if ($('.full-screen-hero').length) {
        var jumbotronContainer = $('.jumbotron-container');
        var jumbotron = $('.jumbotron');

        // set height
        var h = $(window).height() - 80;
        var headerH = $('header').height();
        var padding = $('.jumbotron').innerHeight() - $('.jumbotron').height();

        h -= headerH;
        jumbotronContainer.height(h);
        h -= padding;
        jumbotron.height(h);


        // parallax scroll
        var scrollTop;
        $(window).scroll(function() {
            scrollTop = $(window).scrollTop() - headerH;

            if (scrollTop > 0) {
                jumbotron.css('top', scrollTop / 2)
            } else {
                jumbotron.css('top', 0)
            }
        });

    }

    // manual carousel (v5) ------------------------------ //
    var carousel = $('.carousel.manual');
    var visible = 0;
    var targetH = 0;

    if (carousel.length) {
        targetH = carousel.offset().top + carousel.height();

        // pause button
        $('a.pause-carousel').click(function(e) {
            e.preventDefault();
            var active = $(this).attr('data-active');
            if (active == 'true') {
                $(this)
                        .attr('data-active', 'false')
                        .text('play');
                carousel.carousel('pause');
            } else {
                $(this)
                        .attr('data-active', 'true')
                        .text('pause');
                carousel.carousel('cycle');
            }
        });

        // attach the start functtion to window scroll, and run it once to check if it's already visible
        $(window).on('scroll', startCarousel);
        startCarousel();
    }

    // check if carousel is visible and start it
    function startCarousel() {
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        visible = scrollTop + windowHeight;

        if (visible >= targetH) {
            $(window).off('scroll');
            $('a.pause-carousel').fadeIn().attr('data-active', 'true');
            carousel.carousel({
                interval: 1000,
                pause: "hover"
            });
        }
    }

    // upcoming challenges expand (v5a) ------------------ //
    var challenges = $('.upcoming-challenges');

    if (challenges.length) {
        var trigger = challenges.find('a.expand');
        var items = challenges.find('.items .item:gt(1)');
        var active = false;
        var showText = trigger.text();
        var hideText = trigger.attr('data-hide-text');

        trigger.click(function(e) {
            e.preventDefault();
            if (!active) {
                items.show(200);
                active = true;
                $(this).text(hideText);
            } else {
                items.hide(200);
                active = false;
                $(this).text(showText);
            }
        });
    }


    // --------------------------------------------------- //
    // join                                                //
    // --------------------------------------------------- //

    if ($('.non-auth-bck').length) {

        var currentStep = 1;
        var currentSlide;
        var role = 'all';
        var roleIndex = 0;
        var accountCreated = false;
        var alerts = $('.step .alert');
        var username = '';
        var age;
        var studentInfo;

        var btnBack = $('#join-modal .back');
        var btnContinue = $('#join-modal .continue');
        var btnCancel = $('#join-modal .cancel');
        var btnContBrowsing = $('#join-modal .continue-browsing');
        var btnUAContBrowsing = $('#join-modal .ua-continue-browsing');
        var btnDashboard = $('#join-modal .dashboard');
        var btnParentEmail = $('#join-modal .send-email-to-parent');
        var btnAddStudent = $('#join-modal .add-student');
        var btnFinish = $('#join-modal .finish');

        var btnJoin = $('header .btn-join');
        var btnComplete = $('header .btn-complete');
        var btnUser = $('header .btn-user');
        
        var identifyCodeInput = $('input[name="captcha_field"]');

        var roles = ['teacher', 'teacher_homeschool', 'parent', 'student', 'ua-student', 'mentor', 'other', 'form-demo'];
        var buttons = [btnCancel, btnContBrowsing, btnBack, btnContinue, btnAddStudent, btnFinish, btnParentEmail, btnDashboard, btnUAContBrowsing, btnJoin, btnComplete, btnUser];
        var visibleButtons = [
            [// teacher
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
                [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1]
            ],
            [// teacher_homeschool
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1]
            ],
            [// parent
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1],
                //[0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1]
            ],
            [// student
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1]
            ],
            [// ua-student
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
            ],
            [// mentor
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            [// other

            ],
            [// form-demo
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        ]

        // show modal on page load
        // $('header .btn-join').click();

        // step navigation --------------------------------- //

        // step ahead
        btnContinue.click(function() {   

            
            if (currentStep == 1) {


                role = $('input[name="role"]:checked', '#join-modal').val();
                roleIndex = $.inArray(role, roles);

                currentStep++;
                $('.step[data-step="1"]').hide();
                currentSlide = $('.step[data-step="2"][data-role="' + role + '"]');
                currentSlide.show();
                
                //alert("currentStep="+currentStep+";");
                //alert("role="+role);

            } else {
                
                // validate the page
                
                var currentForm = $("form#form-"+role+"-"+(currentStep.valueOf("int")-1));
                currentForm.submit();
                if(currentForm.find("label.error:visible").size()>0){
                    
                    if(debugFlag == false){
                        return ;
                    }
                }

                if (currentStep == 2 && role == 'student') {
                    
                    var splitArr = $('#student-birthday').val().split('-');
                    if(splitArr.length == 1){
                        splitArr = $('#student-birthday').val().split('/');
                    }
                    var now = new Date();
                    age = 1 * splitArr[0];
                    age = now.getFullYear() - age;
                    if (age < 14) {
                        $('.step').hide();
                        $('.underage').show();
                        currentStep++;
                        roleIndex = 4;
                        return;
                    }
                }

                
                if (!validateCheck(role,currentStep)){
                    
                    if(!debugFlag){
                        
                        alert("User Creation Failed, possible reason could be : The email address has been already taken ,or network problems");
                        return;
                    }
                }
                           
                currentStep++;

                currentSlide = $('.step[data-step="' + currentStep + '"][data-role="' + role + '"]');
                

                // create main account
                username = $('.step[data-role="' + role + '"] #firstname').val();
                    //username = $('.step[data-role="' + role + '"] ipnut[id="firstname"]').val();
                    if (username == '') {
                        username = '{First Name}';
                    }

                    $('.btn-user .username').text(username);
                    $('.step[data-role="' + role + '"] h4 .name').text(username);
                
                if (!accountCreated && currentSlide.attr('data-account-created') == 'main') {
                    accountCreated = true;
                    currentSlide.find('.alert-main-account').fadeIn(200);
                }

                //hide&show
                $('.step').hide();
                currentSlide.show();

                // parent flow - create student account
                if (currentSlide.attr('data-account-created') == 'student') {
                    currentSlide.find('.alert-student-account').fadeIn(200);

                    studentInfo = '';
                    tmp = $('.step[data-step="3"][data-role="parent"] input#student_first').val();
                    if (tmp == '') {
                        tmp = 'First Name';
                    }
                    studentInfo += tmp + ', ';

                    tmp = $('.step[data-step="3"][data-role="parent"] input#student_last').val();
                    if (tmp == '') {
                        tmp = 'Last Name';
                    }
                    studentInfo += tmp + '<br>';

                    tmp = $('.step[data-step="3"][data-role="parent"] #student-grade').val();
                    if (tmp == undefined || tmp == '') {
                        tmp = 'Grade';
                    }
                    studentInfo += tmp + ', ';

                    tmp = $('.step[data-step="3"][data-role="parent"] input#school_name').val();
                    if (tmp == '') {
                        tmp = 'School Name';
                    }
                    studentInfo += tmp + ', ';

                    tmp = $('.step[data-step="3"][data-role="parent"] input#school_zip').val();
                    if (tmp == '') {
                        tmp = 'School ZIP';
                    }
                    studentInfo += tmp + ', ';

                    tmp = $('.step[data-step="3"][data-role="parent"] input#school_address').val();
                    if (tmp == '') {
                        tmp = 'School Address';
                    }
                    studentInfo += tmp;

                    currentSlide
                            .find('ul.your-students')
                            .append('<li>' + studentInfo + '</li>');
                }

                // copy applicable fields to mailing address
                if (currentStep == 3 && role == 'teacher_homeschool') {
                    prevSlide = $('.step[data-step="2"][data-role="teacher_homeschool"]');
                    fieldsToCopy = ['#firstname', '#lastname', '#country'];
                    $.each(fieldsToCopy, function(index, val) {
                        $(val, currentSlide).val($(val, prevSlide).val());
                    });
                }
            }
            
            //when a new step start, test if there's a identify graph in page
            if ($('input[name="captcha_field"]').is(":visible") == true) {

                if(debugFlag){
                    return ;
                }
                //disable btnContinue
                $(this).attr("disabled","disabled");
            }
            
            if($("#students_language_div").size()>0){
                //$(this).attr("disabled","disabled");
            }
            
            //when a nuew step start , if there's a country selector in new step,ajax load it
            if($('.countrySelect').is(":visible") == true) {

                $('.countrySelect:visible').each(function() {
                    ajaxCountry($(this));
                });
            }
            
            //when a nuew step start , if there's a grade selector in new step,ajax load it
            if($('.gradeDropSelect').is(":visible") == true) {

                $('.gradeDropSelect:visible').each(function() {
                    ajaxGradeDrop($(this));
                });
            }
            
        });
        
        btnDashboard.click(function(){
            
            var username = $("input[id='username']:first").val();
            window.location.href = "http://"+hostName+"/application/Index/login?username="+username;
        });

        btnCancel.click(function() {
            $('.step').hide();
             
            role = 'all';
            currentStep='1';

            $('#join-modal .continue').removeAttr("disabled");
            currentSlide = $('.step[data-step="' + currentStep + '"][data-role="' + role + '"]');
            currentSlide.show();
            
            
            ajaxpost();
        });

        btnContBrowsing.click(function() {
            if (role == 'teacher')
            {
                switch (currentStep)
                {
                    case 3:
                        var if_close = confirm('if you discontinue the registration flow at this time your account will be allowed to login to the GC but you will not be able to interact with other users.');
                        if (if_close == false)
                        {
                            return false;
                        }
                        break;
                    case 4:
                        var if_close = confirm('if you discontinue the registration flow at this time your account will be allowed to login to the GC but you will not be able to create or join projects.');
                        if (if_close == false)
                        {
                            return false;
                        }
                        break;
                    case 5:
                        var if_close = confirm('if you discontinue the registration flow at this time your account will be fully active, however providing additional information can help in the matching process and you may visit their profile page at any time to add additional information.');
                        if (if_close == false)
                        {
                            return false;
                        }
                        break;
                }
            } else if (role == 'hs-teacher')
            {
                switch (currentStep)
                {
                    case 3:
                        var if_close = confirm('if you discontinue the registration flow at this time your account will be allowed to login to the GC but you will not be able to interact with other users.');
                        if (if_close == false)
                        {
                            return false;
                        }
                        break;
                    case 4:
                        var if_close = confirm('if you discontinue the registration flow at this time your account will be allowed to login to the GC but you will not be able to create or join projects.');
                        if (if_close == false)
                        {
                            return false;
                        }
                        break;
                }
            }
            ajaxpost();
        });

        // show thank you screen
        btnFinish.click(function() {
            
            var currentForm = $("form#form-"+role+"-"+(currentStep.valueOf("int")-1));
            currentForm.submit();
            if(currentForm.find("label.error:visible").size()>0){
                if(debugFlag == false){
                    return ;
                }
            }
            
            ajaxpost();
            //ajax request end


            currentStep++;
            $('.step').hide();

            currentSlide = $('.step[data-step="' + currentStep + '"][data-role="' + role + '"]');
            currentSlide.show();
        });

        // step back
        btnBack.click(function() {
            if (currentStep == 2) {
                role = 'all';
                accountCreated = false;
            }

            currentStep--;

            $('.step').hide();
            currentSlide = $('.step[data-step="' + currentStep + '"][data-role="' + role + '"]');
            currentSlide.show();
            
            //when step back, test if there's a identify graph in page
            if ($('input[name="captcha_field"]').is(":visible") == false) {

                //enable btnContinue
                btnContinue.attr("disabled",false);
            }
        });

        // add another student
        btnAddStudent.click(function() {
            currentStep -= 1;

            // reset form
            $('input, select', '.step[data-step="3"][data-role="parent"]').val('');

            // show slide
            $('.step').hide();
            currentSlide = $('.step[data-step="3"][data-role="parent"]');
            currentSlide.show();
        });

        // show underage student thank you screen
        btnParentEmail.click(function() {
            
            var emailInputVal = $("#uemail").val() ;

            var emailReg = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i ;
            if(emailInputVal == "" ){
                $("#sendEmailError").html("");
                $("#sendEmailError").html("please enter email address");
                return ;
            }
            if(!emailReg.test(emailInputVal)){
                $("#sendEmailError").html("");
                $("#sendEmailError").html("The email address you have entered is not in the proper format, please re-enter it.");
                return ;
            }
            
            var firstname = $('.step[data-role="' + role + '"] #firstname').val();
            var lastname = $('.step[data-role="' + role + '"] #lastname').val();
            var uemail = $('#uemail').val();
            var birthday = $('.step[data-role="' + role + '"] #student-birthday').val();

            $.ajax({
                type: 'post',
                url: 'http://'+hostName+'/provisioning/Provisioning/ajaxregist',
                dataType: 'html',
                data: {
                    role: role,
                    currentStep: currentStep,
                    //common info
                    firstname: firstname,
                    lastname: lastname,
                    birthday: birthday,
                    uemail: uemail,
                },
                success: function(msg) {
                    //alert('后台响应:' + msg);
                }
            });


            $('.step').hide();
            currentStep++;
            currentSlide = $('.email-confirmation');
            currentSlide.show();
        });

        // show buttons and fix header height
        $('.modal-footer .btn').click(function() {
            showButtons(roleIndex, currentStep - 1);
            setHeaderHeight(currentSlide);
        });

        // teacher step 4 - add new class
	$('div[data-role="teacher"]').children(".step .add-class").click(function() {
            var classDiv = $('.step[data-step="4"][data-role="teacher"] .class:first');
            classDiv
                    .clone()
                    .find('input').each(function(index) {
                $(this).val('').prop('checked', false);
            }).end()
                    .insertBefore(this);

            $('.gradeSelect').unbind().bind("click", function() {
                ajaxGradeSelect($(this).siblings(".gradeOption"));
            });
            $('.ageRangeSelect').unbind().bind("click", function() {
                ajaxAgeSelect($(this).siblings(".ageRangeOption"));
            });
            // hide error
            $('.step[data-step="4"][data-role="teacher"] .class:last').find("label.error").hide();

        });


        // home schoole teacher step 4 - add new class
        $('div[data-role="teacher_homeschool"]').children(".step .add-class").click(function() {
            var classDiv = $('.step[data-step="4"][data-role="teacher_homeschool"] .class:first');
            classDiv
                    .clone()
                    .find('input').each(function(index) {
                $(this).val('').prop('checked', false);
            }).end()
                    .insertBefore(this);

            $('.gradeSelect').unbind().bind("click", function() {
                ajaxGradeSelect($(this).siblings(".gradeOption"));
            });
            $('.ageRangeSelect').unbind().bind("click", function() {
                ajaxAgeSelect($(this).siblings(".ageRangeOption"));
            });
            // hide error
            $('.step[data-step="4"][data-role="teacher_homeschool"] .class:last').find("label.error").hide();

        });


        // checkboxes drop down
        $('.dropdown-menu *', '.school-type, .your-student-grade').click(function(e) {
            e.stopPropagation(); // don't close dropdown when user clicks on checkbox label
        });

        // select country - if it's "US" show the state select
        $('select[name="country"]').change(function() {
            if ($(this).val() == "United States") {
                $(this).next('.select-state').show();
            } else {
                $(this).next('.select-state').hide();
            }
        });

        // student grade is dropdown for the us, input for other coutries
        $('#country', '.step[data-step="4"][data-role="student"], .step[data-step="3"][data-role="parent"]').change(function() {
            if ($(this).val() == "United States") {
                $(this).parents('.step')
                        .find('.grade-us').show().end()
                        .find('.grade-other').hide();
            } else {
                $(this).parents('.step')
                        .find('.grade-us').hide().end()
                        .find('.grade-other').show();
            }
        });

        var accordionOptions = {
            heightStyle: "content",
            active: -1
        };
        var accord = $(".accordion");


        $('.add-a-student').click(function() {

            $('.accordion.ui-accordion').accordion("destroy")
            var firstName = accord.find('.panel:last #student_first').val();
            firstName = firstName != '' ? firstName : '{First Name}';
            var lastName = accord.find('.panel:last #student_last').val();
            lastName = lastName != '' ? lastName : '{Last Name}';
            var headerText = firstName + ' ' + lastName;

            accord
                    .find('h5:last').text(headerText).end()
                    .append('<h5>New Student</h5>')
                    .find('.panel:first')
                    .clone()
                    .find('input').each(function(index) {
                $(this).val('').prop('checked', false);
            }).end()
                    .find('select').each(function(index) {
                $(this).find('option:first').prop('selected', true);
            }).end()
                    .appendTo(accord)

            accord.accordion(accordionOptions);
            
            // countrygradeddd
            $('.countrySelect').unbind().bind("click",function() {
                ajaxCountry($(this));
            });
            $('.gradeDropSelect').unbind().bind("click",function() {
                ajaxGradeDrop($(this));
            });
            
            // hide error
            accord.find('.panel:last').find("label.error").hide();
        });

        /*
        // validation -------------------------------------- //
        var passwordSuggestedChars = '1|2|3|4|5|6|7|8|9|0';

        // username
        $('input[name="username"]').keyup(function() {
            if ($(this).val() == '') {
                $(this).parent()
                        .find('.notice-fail').css('display', 'none').end()
                        .find('.notice-success').css('display', 'none');
            } else if ($(this).val().toLowerCase() == 'error') {
                $(this).parent()
                        .find('.notice-fail').css('display', 'inline-block').end()
                        .find('.notice-success').css('display', 'none');
            } else {
                $(this).parent()
                        .find('.notice-fail').css('display', 'none').end()
                        .find('.notice-success').css('display', 'inline-block');
            }
        });

        // password
        $('input[name="password"]').keyup(function() {
            var val = $(this).val();

            if (val == '') {
                $(this).parent()
                        .find('.notice-fail').css('display', 'none').end()
                        .find('.notice-weak').css('display', 'none').end()
                        .find('.notice-success').css('display', 'none');
            } else if (val.length < 8) {
                $(this).parent()
                        .find('.notice-fail').css('display', 'inline-block').end()
                        .find('.notice-weak').css('display', 'none').end()
                        .find('.notice-success').css('display', 'none');
            } else if (new RegExp(passwordSuggestedChars).test(val)) {
                $(this).parent()
                        .find('.notice-fail').css('display', 'none').end()
                        .find('.notice-weak').css('display', 'none').end()
                        .find('.notice-success').css('display', 'inline-block');
            } else {
                $(this).parent()
                        .find('.notice-fail').css('display', 'none').end()
                        .find('.notice-weak').css('display', 'inline-block').end()
                        .find('.notice-success').css('display', 'none');
            }
        });
        */
        
        // open modal on step specified in query string ---- //
        //alert(window.location.search);
        var qRole = getParameterByName('role');
        var qStep = getParameterByName('step');

        roleIndex = $.inArray(qRole, roles);
        var uasIncrement = 10;

        if (roleIndex >= 0 && qStep != '') {
            $('header .btn-join').click();

            // set surrent step and role
            currentStep = 1 * qStep;
            if (qRole == 'ua-student') {
                role = 'student';

                if (currentStep > 2) {
                    currentStep += uasIncrement;
                }

            } else {
                role = qRole;
            }

            // set radio on the first slide
            $('.step[data-step="1"] input[name="role"][value="' + role + '"]').prop('checked', true);

            if (currentStep == 1) {
                role = 'all';
            }

            // show target slide
            $('.step').hide();
            currentSlide = $('.step[data-step="' + currentStep + '"][data-role="' + role + '"]');
            currentSlide.show();

            // show buttons
            showButtons(roleIndex, currentStep - 1);

            setHeaderHeight(currentSlide);
        }

    } // /join

    // set modal-header height and title position
    function setHeaderHeight(currentSlide) {
        var modalHeader = $('#join-modal .modal-header');
        var title = currentSlide.find('h4')
        title.appendTo('body');
        var titleHeight = title.height();
        currentSlide.prepend(title);
        modalHeader.height(titleHeight);
        title.css('top', -titleHeight - 16);
    }

    function showButtons(roleIndex, step) {
        $.each(buttons, function(index, val) {
            if (roleIndex == 4 && step > 10) {
                step -= 10;
            }
            if (visibleButtons[roleIndex][step][index]) {
                this.show();
            } else {
                this.hide();
            }
        });
    }

    function ajaxpost()
    {
        //step1 cu2
        var firstname = $('.step[data-role="' + role + '"] #firstname').val();
        var lastname = $('.step[data-role="' + role + '"] #lastname').val();
        var gender = $('.step[data-role="' + role + '"] #gender').val();
        var email = $('.step[data-role="' + role + '"] #email').val();
        
        var username = $('.step[data-role="' + role + '"] #username').val();
        var password = $('.step[data-role="' + role + '"] #password').val();
        var birthday = $('.step[data-role="' + role + '"] #birthday').val();
        var title = $('.step[data-role="' + role + '"] #title').val();
        var tcountry = $('.step[data-role="' + role + '"] select[name="tcountry"]').val();

        //step2 cu3
        var school_code = $('.step[data-role="' + role + '"] #school_code').val();
        var school_name = $('.step[data-role="' + role + '"] #school_name').val();
        var school_address = $('.step[data-role="' + role + '"] #school_address').val();
        var school_zip = $('.step[data-role="' + role + '"] #school_zip').val();
        var school_country = $('.step[data-role="' + role + '"] #country').val();
        var school_state = $('.step[data-role="' + role + '"] #state').val();
        var school_city = $('.step[data-role="' + role + '"] #city').val();
        var school_type = "";

        //抽取多选的school_type
        var temSelectedSchoolType = $('.step[data-role="' + role + '"] #school_type_div input:checked');
        if (temSelectedSchoolType.size() > 0) {
            temSelectedSchoolType.each(function() {
                school_type += $(this).attr("id") + ",";
            });
        }
        var school_safe_number = $('.step[data-role="' + role + '"] #school-safe-number').val();


        //step3 cu4

        var school_code = $('.step[data-role="' + role + '"] #school_code').val();

  
        var $subjectArr = $('.step[data-step="4"][data-role="' + role + '"] .dynticSub');
        //var subCount = $subjectArr.size();

        //* teacher->add sub :student age :checkbox multiple select *
        //* hs-teacher->add class : student age :select single select (diff) *
        var subArr = new Array();

        $subjectArr.each(function() {
            //如果新增的课程名称不为空，则加入jason数组
            if ($(this).find("input#class_subject").val() != "") {

                var jsonSubObj = new Object();
                
                if(role == "teacher" ){
                    
                    jsonSubObj['subjectName'] = $(this).find("input#class_subject").val();


                    if ($(this).find("input#number_of_students").val()) {
                        jsonSubObj['studentsNumber'] = $(this).find("input#number_of_students").val();
                    }

                    //如果复选了grade
                    var multiSelectedGrade = $(this).find(".student-grade ul.dropdown-menu input[type='checkbox']:checked");
                    if (multiSelectedGrade.size() > 0) {
                        jsonSubObj['grade'] = new Array();
                        multiSelectedGrade.each(function() {
                            jsonSubObj['grade'].push($(this).attr("id"));
                        });
                    }

                    //如果复选了student age
                    var multiSelectedAge = $(this).find(".student-age ul.dropdown-menu input[type='checkbox']:checked");
                    if (multiSelectedAge.size() > 0) {
                        jsonSubObj['studentAge'] = new Array();
                        multiSelectedAge.each(function() {
                            jsonSubObj['studentAge'].push($(this).attr("id"));
                        });
                    }
                    
                }else if(role == "teacher_homeschool"){
                    
                    jsonSubObj['subjectName'] = $(this).find("input#class_title").val();

                    jsonSubObj['studentAge'] = $(this).find("select#student-age").val();
                    
                    jsonSubObj['studentsNumber'] = $(this).find("input#number_of_students").val();

                }
                
                subArr.push(jsonSubObj);
                //alert($(this).find("input#number_of_students").val());
            }

        });

        var students_language = "";
        var students_language_checked = $('.step[data-role="' + role + '"] #students_language_div input:checked');
        if (students_language_checked.size() > 0) {
            students_language_checked.each(function() {
                students_language += $(this).attr("id") + ",";
            });
        }

        //step 4 cu5
        var more_about_you = $('.step[data-role="' + role + '"] #more-about-you').val();
        var years_of_xp = $('.step[data-role="' + role + '"] #years-of-xp').val();
        var degree = $('.step[data-role="' + role + '"] #degree').val();
        var match = $('.step[data-role="' + role + '"] #match').val();
        //step 3  ht               
        var teaching_environment = $('.step[data-role="' + role + '"] #teaching-environment').val();
        var mail_first_name = $('.step[data-role="' + role + '"] #mfirstname').val();
        var mail_last_name = $('.step[data-role="' + role + '"] #mlastname').val();
        var address_line_1 = $('.step[data-role="' + role + '"] #address_line_1').val();
        var address_line_2 = $('.step[data-role="' + role + '"] #address_line_2').val();
        var mail_city = $('.step[data-role="' + role + '"] #city').val();
        var mail_state = $('.step[data-role="' + role + '"] #state').val();
        var mail_zip = $('.step[data-role="' + role + '"] #zip').val();
        var mail_country = $('.step[data-role="' + role + '"] #mcountry').val();
        //step 4  ht          
        var class_title = $('.step[data-role="' + role + '"] #class_title').val();
        var student_age = $('.step[data-role="' + role + '"] #student-age').val();
        var hsstudentsNumber = $('.step[data-role="' + role + '"] #hsstudentsNumber').val();
        //step 2 student
        var grade_other = $('.step[data-role="' + role + '"] #grade_other').val();
        var your_grade = $('.step[data-role="' + role + '"] #your-grade').val();
        var sbirthday = $('.step[data-role="' + role + '"] #sbirthday').val();
        //step 3 underage
        var email = $('.step[data-role="' + role + '"] #email').val();
        var country = $('.step[data-role="' + role + '"] #country').val();
        
        //parent step3(add children)
        
        var psubArr = new Array();
        
        var accordion = $(".accordion.accord-parent");
        var panelList = accordion.find("div[id*='-panel-']"); 
        if(panelList.size() < 1){
            panelList = accordion ;
        }
        
        panelList.each(function() {

            if ($(this).find("input#student_first").val() != "") {

                var jsonSubObj = new Object();
                jsonSubObj['student_first'] = $(this).find("input#student_first").val();
                jsonSubObj['student_last'] = $(this).find("input#student_last").val();
                jsonSubObj['student_username'] = $(this).find("input#student_username").val();
                jsonSubObj['student_password'] = $(this).find("input#student_password").val();
                jsonSubObj['student_birthday'] = $(this).find("input#student_birthday").val();
                jsonSubObj['student_school_name'] = $(this).find("input#student_school_name").val();
                jsonSubObj['student_school_address'] = $(this).find("input#student_school_address").val();
                jsonSubObj['student_city'] = $(this).find("input#student_city").val();
                jsonSubObj['student_state'] = $(this).find("input#student_state").val();
                jsonSubObj['student_school_zip'] = $(this).find("input#student_school_zip").val();
                jsonSubObj['student_country'] = $(this).find("select#student_country").val();
                jsonSubObj['student_grade_other'] = $(this).find("input#student_grade_other").val();
                jsonSubObj['student_your_grade'] = $(this).find("select#student_your-grade").val();

                
                //抽取多选的school_type
                var temSelectedSchoolType = $(this).find('#school_type_div input:checked');
                if (temSelectedSchoolType.size() > 0) {
                    jsonSubObj['school_type'] = new Array();
                    temSelectedSchoolType.each(function() {
                        jsonSubObj['school_type'].push($(this).attr("id"));
            
                    });
                }

                //if ($(this).find("input#number_of_students").val()) {
                //jsonSubObj['studentsNumber'] = $(this).find("input#number_of_students").val();
                //}
                psubArr.push(jsonSubObj);
                //alert($(this).find("input#number_of_students").val());
            }

        });
        

        $.ajax({
            type: 'post',
            url: 'http://'+hostName+'/provisioning/Provisioning/ajaxregist',
            dataType: 'html',
            async: true,
            data: {
                role: role,
                currentStep: currentStep,
                //common info
                firstname: firstname,
                lastname: lastname,
                gender: gender,
                email: email,
                username: username,
                password: password,
                birthday: birthday,
                sbirthday: sbirthday,
                title: title,
                tcountry: tcountry,
                country: country,
                //tteacher step 3
                school_code: school_code,
                school_name: school_name,
                school_address: school_address,
                school_zip: school_zip,
                school_country: school_country,
                school_state: school_state,
                school_city: school_city,
                school_type: school_type,
                school_safe_number: school_safe_number,
                students_language: students_language,
                //teacher step 4
                more_about_you: more_about_you,
                years_of_xp: years_of_xp,
                degree: degree,
                match: match,
                jsonArr: subArr,
                //home teacher step 3
                teaching_environment: teaching_environment,
                mail_first_name: mail_first_name,
                mail_last_name: mail_last_name,
                address_line_1: address_line_1,
                address_line_2: address_line_2,
                mail_city: mail_city,
                mail_state: mail_state,
                mail_zip: mail_zip,
                mail_country: mail_country,
                //home teacher 4
                class_title: class_title,
                student_age: student_age,
                hsstudentsNumber: hsstudentsNumber,
                grade_other: grade_other,
                your_grade: your_grade,
                psubArr:psubArr

            },
            success: function(msg) {
                //alert('response:'+msg);
            },
            failed: function(msg) {
                //alert('failed' );
            },
        });


    }
    
    // load Roles separate
    $(function() {
        
        //template use
        
        if(debugFlag){
            
            var roles = [{"roleId":"teacher","roleName":"Teacher"},{"roleId":"teacher_homeschool","roleName":"Home-School Teacher"},{"roleId":"student","roleName":"Student"},{"roleId":"parent","roleName":"Parent \/ Guardian"},{"roleId":"mentor","roleName":"Mentor"}];
            //var roles = [{"roleId":"teacher","roleName":"Teacher"},{"roleId":"teacher_homeschool","roleName":"Home-School Teacher"},{"roleId":"student","roleName":"Student"},{"roleId":"parent","roleName":"Parent \/ Guardian"}];
            for (var i = 0; i < roles.length; i++) {
                $('.step-one').append("<div class='radio'><label><input type='radio' name='role' value='" + roles[i].roleId + "'><strong>" + roles[i].roleName + "</strong></label></div><hr style='margin:3px 0px;'>");
            }
            $('.step-one').find("input[type='radio']:first").attr("checked",true) ;
            return ;
        }
        
        var roles = new Array();
        $.ajax({
            type: 'post',
            url: 'http://'+hostName+'/provisioning/Provisioning/ajaxLoadRoles',
            dataType: 'json',
            async: false,
            success: function(data) {
                var roles = data;
                for (var i = 0; i < roles.length; i++) {
                    $('.step-one').append("<div class='radio' id='get_"+roles[i].roleName+"'><label><input type='radio' name='role' value='" + roles[i].roleId + "'><strong>" + roles[i].roleName + "</strong></label></div><hr id='hr_"+roles[i].roleName+"' style='margin:3px 0px;'>");
                }
                
                $('.step-one').find("input[type='radio']:first").attr("checked",true) ;
                $('#get_Mentor').hide();
                $('#hr_Mentor').hide();
            }
            
        });
    });
    
    
    
    // load Roles separate
     $(function() {
        $('#teacherStep4Continue').click(function() {
            
            if(debugFlag){
                
                return ;
            }
            if ($('.school_type_div').children('label').length == 0) {
                var school_types = new Array();
                $.ajax({
                    type: 'post',
                    url: 'http://'+hostName+'/provisioning/Provisioning/ajaxLoadSchoolType',
                    dataType: 'json',
                    async: false,
                    success: function(data) {
                        school_types = data;
                    }
                });
                for (var i = 0; i < school_types.length; i++) {
                    // schoolTypeId  schoolTypeName
                    $('.school_type_div').append("<label style='width: 120px;' for='" + school_types[i].schoolTypeId + "'><input type='checkbox' required='1' minlength='1' name='publictype[]' id='" + school_types[i].schoolTypeId + "'> " + school_types[i].schoolTypeName + "</label>");
                }
                $('.school_type_div').append('<label for="publictype[]" class="error" style=""></label>');
                $("#form-teacher-2").validate();
            }
        });
    });
    
    $('.ageRangeSelect').click(function() {
        ajaxAgeSelect($(this).siblings(".ageRangeOption"));
    });
    
    $('.ageDropSelect').click(function() {
        if ($(this).children("option").length <= 1) {
            // ajax
            var age_ranges = getAgeRange();
            for (var i = 0; i < age_ranges.length; i++) {
                $(this).append("<option value='" + age_ranges[i].ageId + "'>" + age_ranges[i].ageRange + "</option>");
            }
        }
    });
    
    $('.gradeSelect').unbind().bind("click",function(){
        ajaxGradeSelect($(this).siblings(".gradeOption"));
    });
    
    $('.gradeDropSelect').unbind().bind("click",function() {
        ajaxGradeDrop($(this));
    });
});

    function ajaxCountry(thisItem) {
        
        // if it has value, no ajax 
        if (thisItem.children("option").length <= 1) {
            // ajax
            var countrys = new Array();
            var selectSelf = thisItem;
            $.ajax({
                type: 'post',
                url: 'http://'+hostName+'/provisioning/Provisioning/ajaxLoadCountrys',
                dataType: 'json',
                async: true,
                success: function(data) {
                    countrys = data;
                    //thisItem.append("<option value='' selected='selected'>Please select</option>");
                    for (var i = 0; i < countrys.length; i++) {
                        selectSelf.append("<option value='" + countrys[i].countryCode + "'>" + countrys[i].countryName + "</option>");
                    }
                }
            });
            
        }
    }
    
    function getGrade() {
        var grades = new Array();
        $.ajax({
            type: 'post',
            url: 'http://'+hostName+'/provisioning/Provisioning/ajaxLoadGrade',
            dataType: 'json',
            async: false,
            success: function(data) {
                grades = data;
            }
        });
        return grades;
    }
    
    function ajaxGradeSelect(gradeOption) {
        // if it has value, no ajax
        
        //alert(ageOption.children("li").length);
        if (gradeOption.children("li").length == 0) {
            // ajax
            var grades = getGrade();
            // default value
            for (var i = 0; i < grades.length; i++) {
                //alert("<li><label for='" + grades[i].gradeId + "'><input type='checkbox' name='" + grades[i].gradeId + "' id='" + grades[i].gradeId + "'>" + grades[i].gradeName + "</label></li>");
                gradeOption.append("<li><label for='" + grades[i].gradeId + "'><input type='checkbox' name='" + grades[i].gradeId + "' id='" + grades[i].gradeId + "'>" + grades[i].gradeName + "</label></li>");
            }
        }
    }
    
    function getAgeRange() {
        var age_ranges = new Array();
        $.ajax({
            type: 'post',
            url: 'http://'+hostName+'/provisioning/Provisioning/ajaxLoadAgeRange',
            dataType: 'json',
            async: false,
            success: function(data) {
                age_ranges = data;
            }
        });
        return age_ranges;
    }
    
    function ajaxAgeSelect(ageOption) {
        // if it has value, no ajax
        if (ageOption.children("li").length == 0) {
            // ajax
            var age_ranges = getAgeRange();
            // default value
            for (var i = 0; i < age_ranges.length; i++) {
                ageOption.append("<li><label for='" + age_ranges[i].ageId + "'><input type='checkbox' name='" + age_ranges[i].ageId + "' id='" + age_ranges[i].ageId + "'>" + age_ranges[i].ageRange + "</label></li>");
            }
        }
    }
    
    function ajaxGradeDrop(thisItem) {
        if (thisItem.children("option").length <= 1) {
            // ajax
            var grades = getGrade();
            for (var i = 0; i < grades.length; i++) {
                thisItem.append("<option value='" + grades[i].gradeId + "'>" + grades[i].gradeName + "</option><li>");
            }
        }
    }

    // --------------------------------------------------- //
    // global                                              //
    // --------------------------------------------------- //


    //template usage: 
    //if identify succes,set The Continue button enable
    function ifIdentifyPass() {

        if ($('input[name="captcha_field"]').is(":visible") == false) {
            return true;
        }

        var code = $('input[name="captcha_field"]:visible').val();
        
        $.ajax({
            url: 'http://webmail.epals.com/public_rest/captcha_valid',
            dataType: 'jsonp',
            async: false,
            data: {'code': code},
            success: function(data) {
                
                if (data.passed)
                {
                    //alert("captcha passed");
                    $('#join-modal .continue').removeAttr("disabled");
                    //btnContinue.attr("disabled",false);
                    return true;
                } else {
                    //alert("captcha FAIL");
                    $('#getanother').click();
                    $('input[name="captcha_field"]').val('');
                    $('#join-modal .continue').attr("disabled","disabled");
                    
                    //alert("Capture identify error,Please re-enter it.");
                    return false;
                }
            }
        });

    }
    
    // collect base info (Fist step) save into neo4j
    function ajaxPostBaseInfo(role,currentStep){
        
        var firstname = $('.step[data-role="' + role + '"] #firstname').val();
        var lastname = $('.step[data-role="' + role + '"] #lastname').val();
        var gender = $('.step[data-role="' + role + '"] #gender').val();
        var email = $('.step[data-role="' + role + '"] #email').val();
        var username = $('.step[data-role="' + role + '"] #username').val();
        var password = $('.step[data-role="' + role + '"] #password').val();
        var birthday = $('.step[data-role="' + role + '"] #birthday').val();
        var title = $('.step[data-role="' + role + '"] #title').val();
        var tcountry = $('.step[data-role="' + role + '"] select[name="tcountry"]').val();
        
        var email_vertify = $('.step[data-role="' + role + '"] #email_vertify').val();
        var password_vertify = $('.step[data-role="' + role + '"] #password_vertify').val();
        
        var flag ;
        
        $.ajax({
            type: 'post',
            url: 'http://'+hostName+'/provisioning/Provisioning/ajaxPostBaseInfo',
            dataType: 'json',
            async: false,
            data: {
                role: role,
                currentStep: currentStep,
                //common info
                firstname: firstname,
                lastname: lastname,
                gender: gender,
                email: email,
                username: username,
                password: password,
                birthday: birthday,
                //sbirthday: sbirthday,
                title: title,
                tcountry: tcountry,
                email_vertify:email_vertify,
                password_vertify:password_vertify
                //country: country
               

            },
            success: function(msg) {
                
                flag =  msg ;
                
            },error: function(msg){
                flag =  msg ;
            }
        });
        
        if(flag == true){
            return true;
        }else{
            return false ;
        }
        
    }
    
    //form submit validation check :email ; password
    //return :true/false 
    function checkEmail(role){
        
            
        //var role = $('input[name="role"]:checked', '#join-modal').val();  
        
        //check email
        var email = $('.step[data-role="' + role + '"] #email');
        var email_vertify = $('.step[data-role="' + role + '"] #email_vertify');
        
        if(email.val() != email_vertify.val()){
            
            alert("The email addresses you have entered do not match, please re-enter them. ") ;
            email.val("");
            email_vertify.val("");
            email.focus();
            
            return false ;
        }
        
        var regEmail = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/ ;

        var emailFlag = regEmail.test(email.val());
        
        if(!emailFlag){
            
            alert("Please enter correct Email-address.");
            email.val("");
            email_vertify.val("");
            email.focus();
            
            return false ;
        }
        
        //check password 
        var password = $('.step[data-role="' + role + '"] #password');
        var email_vertify = $('.step[data-role="' + role + '"] #password_vertify');
        
        if(password.val() != email_vertify.val()){
            
            alert("The password you have entered do not match, please re-enter them. ") ;
            password.val("");
            email_vertify.val("");
            password.focus();
            
            return false ;
        }
        
        var regForASCII = /^[x00-x7f]+$/;
        
        if (! regForASCII.test(password.val())){
            
            alert("The password you've requested does not match the ePals password requirements, please choose another password.");
            
            return false;
        }
        
        var passwordLength = password.val().toString().length;
        
        if(passwordLength < 6){
            
            alert("The password you've requested does not match the ePals password requirements, please choose another password.");
            password.val("");
            email_vertify.val("");
            password.focus();
            
            return false ;
        }
        
        return true ;

    }
    
    function validateCheck(role,currentStep){

        var flag ;
        if(role != "student" && currentStep == "2"){
            flag = ajaxPostBaseInfo(role,currentStep);
             
        }else if(role =="student" && currentStep == "3"){
            
            flag =  ajaxPostBaseInfo(role,currentStep);
        }else{
            
            flag = true ;
        }
        
        return flag ;
    }
    
    function onChangeLanguageOtherCheckbox(self){
        
        if(self.checked === true){
            //user once select the checkbox
            $('#join-modal .continue').attr("disabled","disabled");
            $('#join-modal .finish').attr("disabled","disabled");
            $(self).parent().next("input").focus();
            
        }else{
            
            $('#join-modal .continue').removeAttr("disabled");
            $('#join-modal .finish').removeAttr("disabled");
        }
        
    }
    
    function onBlurLanguageOtherInput(self){
        
        if(self.value){
            $('#join-modal .continue').removeAttr("disabled");
            $('#join-modal .finish').removeAttr("disabled");
        }else{
            $('#join-modal .continue').attr("disabled","disabled");
            $('#join-modal .finish').attr("disabled","disabled");
        }
    }
