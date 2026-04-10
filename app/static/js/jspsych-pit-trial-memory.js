/**
 * jspsych-pit-trial-memory
 * 
 * Modified version of pit-trial plugin that integrates robot memory access
 * instead of point-based feedback
 *
 **/

jsPsych.plugins["pit-trial-memory"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'pit-trial-memory',
    description: 'One trial of the robot factory PIT task with memory access',
    parameters: {
      robot_rune: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Robot rune',
        description: 'Filename of rune image in static folder.'
      },
      scanner_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Scanner color',
        description: 'Color of scanner light.'
      },
      robot_type: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Robot Type',
        default: 'GW',
        description: 'Robot type (GW, NGW, GAL, NGL) for memory mapping.'
      },
      correct: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Correct response',
        description: 'Correct response for trial.'
      },
      rune_set: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rune font',
        default: 'elianto',
        description: 'Rune font style [elianto, bacs1, bacs2].'
      },
      valid_responses: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: [32],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      animation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Animation duration',
        default: 1500,
        description: 'How long before keyboard listener should start.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 1500,
        description: 'How long to show trial before it ends.'
      },
      memory_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Memory duration',
        default: 3000,
        description: 'How long to show memory video.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    //---------------------------------------//
    // Define HTML.
    //---------------------------------------//

    // Initialize HTML.
    var new_html = '';

    // Insert CSS (window animation).
    new_html += `<style>
    body {
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
      position: fixed;
      background: -webkit-gradient(linear, left bottom, left top, from(#808080), color-stop(50%, #606060), color-stop(50%, rgba(28, 25, 23, 0.5)), to(rgba(179, 230, 230, 0.5)));
      background: linear-gradient(0deg, #808080 0%, #606060 50%, #A0A0A0 50%, #D3D3D3 100%);
    }
    .jspsych-content-wrapper {
      overflow: hidden;
    }
    @-webkit-keyframes pavlovian {
      0%    {border-bottom-color: rgba(0, 0, 0, 0);}
      90%   {border-bottom-color: rgba(0, 0, 0, 0);}
      100%  {border-bottom-color: ${trial.scanner_color};}
    }
    @keyframes pavlovian {
      0%    {border-bottom-color: rgba(0, 0, 0, 0);}
      90%   {border-bottom-color: rgba(0, 0, 0, 0);}
      100%  {border-bottom-color: ${trial.scanner_color};}
    }
     </style>`;

    // Add robot factor wrapper.
    new_html += '<div class="factory-wrap">';

    // Add factory machine parts (back).
    new_html += '<div class="machine-back"></div>';
    new_html += '<div class="conveyor"></div>';
    new_html += '<div class="shadows"></div>';

    // Add robot 1 (active).
    new_html += '<div class="robot" status="active">';
    new_html += '<div class="antenna"></div>';
    new_html += '<div class="head"></div>';
    new_html += '<div class="torso">';
    new_html += '<div class="left"></div>';
    new_html += '<div class="right"></div>';
    new_html += `<div class="rune" set="${trial.rune_set}">${trial.robot_rune}</div></div>`;
    new_html += '<div class="foot"></div></div>';

    // Add robot 2 (hidden).
    new_html += '<div class="robot" status="hidden">';
    new_html += '<div class="antenna"></div>';
    new_html += '<div class="head"></div>';
    new_html += '<div class="torso">';
    new_html += '<div class="left"></div>';
    new_html += '<div class="right"></div>';
    new_html += `<div class="rune"></div></div>`;
    new_html += '<div class="foot"></div></div>';

    // Add factory window.
    new_html += `<div class="scanner-light" style="border-bottom-color: ${trial.scanner_color}"></div>`;

    // Add factory machine parts (front).
    new_html += '<div class="machine-front">';
    new_html += '<div class="score-container">';
    new_html += '<div class="score" id="outcome"></div>';
    new_html += '</div></div>';
    new_html += '<div class="machine-top"></div>';

    // Close wrapper.
    new_html += '</div>';

    // Display HTML
    display_element.innerHTML = new_html;

    //---------------------------------------//
    // Response handling.
    //---------------------------------------//

    // Initialize response
    var all_responses = [];
    var response = {
      rt: -1,
      key: -1
    };

    // Video info (set in show_memory, saved in end_trial)
    var memory_category = null;
    var video_file = null;

    // Record any response
    var any_response = function(info) {
      all_responses.push(info.rt);
    }

    // Feedback phase
    var after_response = function(info) {

      // Kill any timeout handlers / keyboard listeners
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardSuperListener);

      // Record response (if any made)
      if (info != null) {
        response = info;
      }

      // Define accuracy
      if (trial.correct == response.key) {
        response.accuracy = 1;
      } else {
        response.accuracy = 0;
      };

      // Show memory access feedback
      var memory_feedback = '';
      if (response.accuracy == 1) {
        memory_feedback = 'Accessing Robot Memory...';
      } else {
        memory_feedback = 'Accessing Robot Memory...';
      }

      // Present outcome
      document.getElementById("outcome").innerHTML = memory_feedback;
      document.getElementById("outcome").style['color'] = '#4CAF50';

      // After brief feedback, show memory
      jsPsych.pluginAPI.setTimeout(function() {
        show_memory();
      }, 1000);

    };

    // Show memory video
    var show_memory = function() {
      
      // Determine memory category (for label/color) based on accuracy
      var isCorrect = response.accuracy == 1;
      memory_category = getMemoryCategory(trial.robot_type, isCorrect);
      video_file = selectRandomVideo(memory_category);
      var memory_info = getMemoryInfo(memory_category);
      
      // Create memory display directly
      var memory_html = '';
      
      // Add CSS for memory display
      memory_html += `<style>
      .memory-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(0deg, #808080 0%, #606060 50%, #A0A0A0 50%, #D3D3D3 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .memory-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      }
      .memory-video {
        max-width: 80vw;
        max-height: 60vh;
        border: 3px solid #333;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }
      .memory-category {
        color: ${memory_info.color};
        font-size: 18px;
        margin-top: 10px;
        font-style: italic;
      }
      </style>`;

      // Add memory container
      memory_html += '<div class="memory-container">';
      memory_html += `<div class="memory-title">Accessing Memory...</div>`;
      memory_html += '<video class="memory-video" id="memory-video">';
      memory_html += 'Your browser does not support the video tag.';
      memory_html += '</video>';
      memory_html += `<div class="memory-category"></div>`;
      memory_html += '</div>';

      // Display memory
      display_element.innerHTML = memory_html;

      // Set video source
      var videoElement = document.getElementById('memory-video');
      var videoPath = `app/static/videos/${memory_category}/${video_file}`;
      videoElement.src = videoPath;

      // Video event handlers
      videoElement.addEventListener('ended', function() {
        end_trial();
      });

      videoElement.addEventListener('error', function() {
        console.log('Video error, ending trial');
        end_trial();
      });

      // Cut off video at memory_duration
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.memory_duration);

      // Start playing video
      videoElement.play().catch(function(error) {
        console.log('Video autoplay failed:', error);
      });

    };

    // End trial
    var end_trial = function() {

      // Kill any timeout handlers / keyboard listeners
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardSuperListener);
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // Store data
      var trial_data = {
        "rune": trial.robot_rune,
        "rune_set": trial.rune_set,
        "hex": trial.scanner_color,
        "correct": trial.correct,
        "choice": response.key,
        "rt": response.rt,
        "accuracy": response.accuracy,
        "robot_type": trial.robot_type,
        "keys": all_responses,
        "total_keys": all_responses.length,
        "video_category": memory_category,
        "video_file": video_file
      };

      // Clear the display
      display_element.innerHTML = '';

      // End trial
      jsPsych.finishTrial(trial_data);

    };

    // Start the response listener
    if (trial.valid_responses != jsPsych.NO_KEYS) {

      // Task keyboardListener
      var keyboardListener = "";
      jsPsych.pluginAPI.setTimeout(function() {
        keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.valid_responses,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      }, trial.animation_duration);

      // Universal keyboardListener
      var keyboardSuperListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: any_response,
          valid_responses: trial.valid_responses,
          rt_method: 'performance',
          persist: true,
          allow_held_key: false
        });

    }

    // End trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        after_response();
      }, trial.animation_duration + trial.trial_duration);
    }

  };

  return plugin;
})();
