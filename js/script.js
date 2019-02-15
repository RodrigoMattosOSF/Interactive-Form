$(document).ready( () => {
    
    $('#other-title').hide();
    $('.payment-methods').hide();

    const color      = $('#color');    
    const activities = $('.activities');
    const nameField  = $('#name');

    nameField.focus();

    // create activities total container
    var activitiesTotal         = document.createElement('span');
    activitiesTotal.id          = 'activities-total';
    activitiesTotal.textContent = 'Total: $0';
    activities.append(activitiesTotal);


    $('#design').change( (event) => {
        let rawDesign = $(event.target).find('option:selected').html();
        color.find('option').removeClass('shown');

        // case its the default value reset the color combo
        if (rawDesign.indexOf('-') < 0) {
            color.find('option').show();
            color.val(color.find('option:first').val());
            return;
        }

        // regex to retrieve the exact theme string
        let regEx  = /Theme - (.*)/g;
        let arrEx  = regEx.exec(rawDesign);
        let design = arrEx[1];
        
        // hide and show based on the regex content
        color.find('option').hide();        
        color.find("option:contains('"+design+"')").show();
        color.find("option:contains('"+design+"')").addClass('shown');

        // display a valid option to the user
        color.val(color.find("option[class='shown']:first").val());
    });

    activities.find('input[type=checkbox]').change( (event) => {
        const activitiesLabels = $('.activities label');
        let rawActivity        = event.target.parentNode.lastChild.textContent;

        // regex to retrieve the exact day and time string
        let regEx  = / — (.*),/g;
        let arrEx  = regEx.exec(rawActivity);

        if (arrEx) {
            let dayTime  = arrEx[1]; 
            let aInRange = activitiesLabels.map( (i, label) => {
                if (label.lastChild.textContent.indexOf(dayTime) > 0 && label !== event.target.parentNode) 
                    return label;
            });

            if (event.target.checked) {
                aInRange.find('input').attr('disabled', 'true');
            } else {
                aInRange.find('input').removeAttr('disabled');
            }            
        }

        const checkedActivities = $('.activities input:checked');

        let aInValues = checkedActivities.map( (i, label) => {
            let rawValue = label.parentNode.lastChild.textContent;

            // regex to retrieve the exact day and time string
            let regEx  = /(,|—) \$(.*)/i;
            let arrEx  = regEx.exec(rawValue);

            if (arrEx)
                return arrEx[2];
        });

        let sum = (nums) => {
            return nums.reduce((a, b) => parseFloat(a) + parseFloat(b))
        };

        if (aInValues.length > 0) {
            let total = sum(aInValues.toArray());
            $('#activities-total').html('Total: $' + total);
        } else {
            $('#activities-total').html('Total: $0');
        }
        
    });

    $('#payment').change( (event) => {
        var paymentMethod = event.target.value;

        if ($('#' + paymentMethod).length > 0) {
            $('.payment-methods').hide();
            $('#' + paymentMethod).show();
        }else{
            $('.payment-methods').hide();
        }
    });

    var displayErrors = (errors) => {
        for (let ei in errors) {
            let error             = errors[ei];
            let errorSpan         = document.createElement('label');            
            errorSpan.className   = 'errors';
            errorSpan.textContent = error.msg;

            $(error.selector).after(errorSpan);

        }
    };

    $('form').submit( (event) => {
        let errors = [];
        $('.errors').remove();

        if(!$.trim(nameField.val()).length) {
            errors.push({
                'field'    : 'Name',
                'selector' : '#name',
                'msg'      : 'Name is empty!'
            });
        }

        let re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;  
        if (!re.test($('#mail').val())) {
            errors.push({
                'field'    : 'Email',
                'selector' : '#mail',
                'msg'      : 'Email is invalid!'
            });
        }

        const activitiesChecked = $('.activities label input:checked');
        if (!activitiesChecked.length) {
            errors.push({
                'field'    : 'Activities',
                'selector' : '.activities',
                'msg'      : 'You must select at least one activity!'
            });
        }

        var paymentMethod = $('#payment').val();
        if (paymentMethod == 'credit-card') {
            let ccNum = $('#cc-num').val();
            let zip   = $('#zip').val();
            let cvv   = $('#cvv').val();

            if (ccNum.length < 13 || ccNum.length > 16) {
                errors.push({
                    'field'    : 'Payment - Credit Card Number',
                    'selector' : '#cc-num',
                    'msg'      : 'The credit card number must be between 13 and 16 characters!'
                });
            }

            let re = /[^0-9]/g;
            if (!zip.match(re)) {
                errors.push({
                    'field'    : 'Payment - Credit Card Zip',
                    'selector' : '#zip',
                    'msg'      : 'The credit card zip must only contain numbers!'
                });
            }

            if (cvv.legnth != 3 || !cvv.match(re)) {
                errors.push({
                    'field'    : 'Payment - Credit Card CVV',
                    'selector' : '#cvv',
                    'msg'      : 'The credit card cvv must be a valid 3 digit number!'
                });
            }

        }


        if (errors.length > 0) {
            event.preventDefault();
            displayErrors(errors);
            return false;
        }
    });
});