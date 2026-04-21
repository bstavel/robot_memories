/**
 * jspsych-pit-comprehension
 * Sam Zorowitz
 *
 * plugin for running the comprehension check for the PIT task
 *
 **/

jsPsych.plugins['pit-comprehension'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'pit-comprehension',
    description: '',
    parameters: {
      prompts: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Prompts',
        description: 'Comprehension check questions'
      },
      options: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Options',
        description: 'Comprehension check question options'
      },
      correct: {
        type: jsPsych.plugins.parameterType.STRING,
        array: true,
        pretty_name: 'Correct',
        description: 'Answers to comprehension check questions'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      }
    }
  }
  plugin.trial = function(display_element, trial) {

    // Plug-in setup
    var plugin_id_name = "jspsych-survey-multi-choice";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // ---------------------------------- //
    // Section 1: Define HTML             //
    // ---------------------------------- //

    // Initialize HTML
    var html = "";

    // inject CSS for trial
    html += `<style>
    body {
      background: -webkit-gradient(linear, left bottom, left top, from(#808080), color-stop(50%, #606060), color-stop(50%, rgba(28, 25, 23, 0.5)), to(rgba(179, 230, 230, 0.5)));
      background: linear-gradient(0deg, #808080 0%, #606060 50%, #A0A0A0 50%, #D3D3D3 100%);
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
      position: fixed;
    }
    .jspsych-content-wrapper {
      overflow: hidden;
    }
    .conveyor:after {-webkit-animation: none; animation: none;}
     </style>`;

    // Add factory machine parts (back).
    html += '<div class="factory-wrap">';
    html += '<div class="machine-back"></div>';
    html += '<div class="conveyor"></div>';
    html += '<div class="shadows"></div>';
    html += `<div class="machine-front"></div>`;
    html += '<div class="machine-top"></div>';

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="'+trial_form_id+'"></form>';

    // Show preamble text
    html += '<div class="comprehension-box">'
    html += '<div class="jspsych-survey-multi-choice-preamble"><h4>To continue, please answer the questions below:</h4></div>';

    // Initialize form element
    html += '<form id="jspsych-survey-multi-choice-form">';

    // Iteratively add comprehension questions.
    for (i = 0; i < trial.prompts.length; i++) {

      // Initialize item
      html += `<div id="jspsych-survey-multi-choice-${i}" class="jspsych-survey-multi-choice-question jspsych-survey-multi-choice-horizontal" data-name="Q${i}">`;

      // Add question text
      html += `<p class="jspsych-survey-multi-choice-text survey-multi-choice">${trial.prompts[i]}</p>`;

      // Iteratively add options.
      for (j = 0; j < trial.options[i].length; j++) {

        // Option 1: True
        html += `<div id="jspsych-survey-multi-choice-option-${i}-${j}" class="jspsych-survey-multi-choice-option">`;
        html += `<input type="radio" name="jspsych-survey-multi-choice-response-${i}" id="jspsych-survey-multi-choice-response-${i}-${j}" value="${trial.options[i][j]}" required>`;
        html += `<label class="jspsych-survey-multi-choice-text" for="jspsych-survey-multi-choice-response-${i}-${j}">${trial.options[i][j]}</label>`;
        html += '</div>';

      }

      // Close item
      html += '<br></div>';

    }

    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '"></input>';

    // End HTML
    html += '</form>';
    html += '</div></div>';

    // Display HTML
    display_element.innerHTML = html;

    // ---------------------------------- //
    // Section 2: jsPsych Functions       //
    // ---------------------------------- //

    // Detect submit button press
    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();

      // Measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // Gather responses
      var responses = [];
      var num_errors = 0;
      for (var i=0; i<trial.prompts.length; i++) {

        // Find matching question.
        var match = display_element.querySelector('#jspsych-survey-multi-choice-'+i);
        var val = match.querySelector("input[type=radio]:checked").value;

        // Store response
        responses.push(val)

        // Check accuracy
        if ( trial.correct[i] != val ) {
          num_errors++;
        }

      }

      // If any errors, highlight wrong answers and prompt retry.
      if (num_errors > 0) {
        // Remove any previous error message.
        var prev_msg = display_element.querySelector('#comprehension-error-msg');
        if (prev_msg) prev_msg.remove();

        // Highlight incorrect questions in red.
        for (var k = 0; k < trial.prompts.length; k++) {
          var q = display_element.querySelector('#jspsych-survey-multi-choice-' + k);
          var val = q.querySelector("input[type=radio]:checked").value;
          q.style.borderLeft = (trial.correct[k] != val) ? '3px solid #f73b6a' : '';
        }

        // Show error message below the preamble heading.
        var msg = document.createElement('p');
        msg.id = 'comprehension-error-msg';
        msg.style.cssText = 'color:#f73b6a; font-weight:bold; margin:0 0 12px 0;';
        msg.textContent = 'Some answers were incorrect. Please review and try again.';
        var preamble = display_element.querySelector('.jspsych-survey-multi-choice-preamble');
        preamble.parentNode.insertBefore(msg, preamble.nextSibling);
        return;
      }

      // store data
      var trial_data = {
        "responses": responses,
        "num_errors": num_errors,
        "rt": response_time
      };

      // next trial
      jsPsych.finishTrial(trial_data);

    });

    var startTime = performance.now();
  };

  return plugin;
})();
