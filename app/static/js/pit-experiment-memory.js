//------------------------------------//
// Define experiment parameters.
//------------------------------------//

// Define trial structure.
runsheets = jsPsych.randomization.sampleWithoutReplacement(runsheets, 2)

// Define rune sets.
const rune_sets = ['elianto','bacs1','bacs2'];
const rune_prob = [0.33,0.33,0.33];

// Define aesthetics.
if ( Math.random() < 1 ) {
  var instr_color_win    = 'blue';
  var scanner_color_win  = '#3366ff99';
  var outcome_color_win  = '#1a3ea7';
  var instr_color_lose   = 'red';
  var scanner_color_lose = '#f73b6a7A';
  var outcome_color_lose = '#930a25';
} else {
  var instr_color_win    = 'red';
  var scanner_color_win  = '#f73b6a7A';
  var outcome_color_win  = '#930a25';
  var instr_color_lose   = 'blue';
  var scanner_color_lose = '#3366ff99';
  var outcome_color_lose = '#1a3ea7';
}

// Define go key.
const key_go_memory = 32;

// Define timings.
const trial_duration_memory = 1300;         // Duration of trial (response phase)
const feedback_duration = 1200;             // Duration of point feedback

// Define payment.
const completion_bonus = 0.00;
const performance_bonus = 1.50;

// Define pass_message function (simplified for testing)
function pass_message(message) {
  console.log('Message:', message);
}

//------------------------------------//
// Define rune order.
//------------------------------------//

// Randomly select rune set.
const rune_set = jsPsych.randomization.sampleWithReplacement(rune_sets, 1, rune_prob)[0];

// Gather rune orders.
if ( rune_set == 'elianto' ) {
  var runes_a = ['U', 'L', 'A', 'G', 'P', 'S', 'W', 'E', 'K', 'D', 'J', 'V'];
  var runes_b = ['M', 'R', 'Y', 'H', 'Z', 'C', 'B', 'T', 'X', 'F', 'N', 'Q'];
} else if ( rune_set == 'bacs1' ) {
  var runes_a = ['B', 'Z', 'J', 'R', 'V', 'E', 'T', 'F', 'A', 'C', 'L', 'Q'];
  var runes_b = ['Y', 'H', 'P', 'M', 'U', 'S', 'K', 'D', 'O', 'I', 'G', 'N'];
} else if ( rune_set == 'bacs2' ) {
  var runes_a = ['J', 'W', 'X', 'Z', 'G', 'O', 'C', 'E', 'H', 'Q', 'T', 'Y'];
  var runes_b = ['M', 'B', 'K', 'V', 'R', 'P', 'L', 'S', 'U', 'A', 'F', 'N'];
}

// Randomize presentation order.
if ( Math.random() < 0.5 ) { runes_a = runes_a.reverse(); }
if ( Math.random() < 0.5 ) { runes_b = runes_b.reverse(); }
var runes = ( Math.random() < 0.5 ) ? [runes_a, runes_b] : [runes_b, runes_a];

//------------------------------------//
// Define experiment.
//------------------------------------//
// One block of the PIT task is comprised of 8-12 exposures to 12 robots, or
// 120 total trials. 80% of trials provide correct feedback. There are 2 total
// blocks, or 240 total trials.

// Preallocate space.
var PIT = [];

// Iteratively define trials.
var n = 0;
for (let i=0; i<runsheets.length; i++) {

  for (let j=0; j<runsheets[i]['robots'].length; j++) {

    jsPsych.randomization.shuffle([0,1,2,3]).forEach(function (k) {

      // Extract trial information.
      const robot    = runsheets[i]['robots'][j][k];
      const stimulus = runsheets[i]['stimuli'][j][k];

      // Define trial metadata.
      const valence = (robot < 2) ? 'win' : 'lose';
      const action = (robot % 2 == 0) ? 'go' : 'no-go';

      // Define robot type for memory mapping
      let robot_type;
      if (valence == 'win' && action == 'go') {
        robot_type = 'GW';  // Go-Win
      } else if (valence == 'win' && action == 'no-go') {
        robot_type = 'NGW'; // No-Go-Win
      } else if (valence == 'lose' && action == 'go') {
        robot_type = 'GAL'; // Go-Avoid-Loss
      } else {
        robot_type = 'NGL'; // No-Go-Avoid-Loss
      }

      // Define point outcomes.
      const outcome_correct   = valence == 'win' ? '+10' : '0';
      const outcome_incorrect = valence == 'win' ? '0'   : '-10';

      // Define trial.
      const trial = {
        type: 'pit-trial-memory',
        robot_rune: runes[i][stimulus],
        scanner_color: valence == 'win' ? scanner_color_win : scanner_color_lose,
        outcome_color: valence == 'win' ? outcome_color_win : outcome_color_lose,
        outcome_correct: outcome_correct,
        outcome_incorrect: outcome_incorrect,
        robot_type: robot_type,
        correct: robot % 2 == 0 ? key_go_memory : -1,
        rune_set: rune_set,
        valid_responses: [key_go_memory],
        trial_duration: trial_duration_memory,
        feedback_duration: feedback_duration,
        data: {
          block: i + 1,
          trial: n + 1,
          stimulus: stimulus,
          robot: robot + 1,
          valence: valence,
          action: action,
          robot_type: robot_type,
          sham: 0
        }
      };

      // Append.
      PIT.push(trial)
      n++;

    })

  }

}

//------------------------------------//
// Define transition screens.
//------------------------------------//


// Define ready screens
var READY_01 = {
  type: 'pit-instructions',
  pages: [
    "Great job! You've passed the comprehension check.",
    "Get ready to begin <b>Block 1/2</b>. It will take ~7 minutes.<br>Press next when you're ready to start.",
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
  on_finish: function(trial) {
    pass_message('starting block 1');
  }
}

var READY_02 = {
  type: 'pit-instructions',
  pages: [
    "Take a break for a few moments and press any button when you are ready to continue.",
    "Get ready to begin <b>Block 2/2</b>. It will take ~7 minutes.<br>Press next when you're ready to start.",
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
  on_finish: function(trial) {
    resetUsedVideos();
    pass_message('starting block 2');
  }
}

// Define finish screen
var FINISHED = {
  type: 'pit-instructions',
  pages: [
    "Great job! You've finished the task.",
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
}

// Define welcome screen
var WELCOME = {
  type: 'instructions',
  pages: [
    "<b>Welcome to the Robot Points Factory experiment!</b><br><br>We will get started with some instructions.<br>Please read each instruction carefully."
  ],
  show_clickable_nav: true,
  button_label_previous: 'Prev',
  button_label_next: 'Next',
  on_finish: function(trial) {
    pass_message('starting instructions');
  }
}

// Define surveys (simplified for testing)
var SURVEYS = [];

// Define demographics
var DEMO = {
  type: 'html-keyboard-response',
  stimulus: '<h2>Demographics</h2><p>This is a simplified version for testing.</p><p>Press any key to continue.</p>',
  choices: jsPsych.ANY_KEY
}

// Define debriefing
var DEBRIEF = {
  type: 'html-keyboard-response',
  stimulus: '<h2>Debriefing</h2><p>Thank you for participating in the Robot Memory Access experiment!</p><p>Press any key to finish.</p>',
  choices: jsPsych.ANY_KEY
}

// Define feedback screen.
var FEEDBACK = {
  stimulus: '',
  type: 'html-keyboard-response',
  on_start: function(trial) {

    // Compute overall accuracy.
    var accuracy = jsPsych.data.get().filter([{Block: 1}, {Block:2}]).select('Accuracy');
    var accuracy = accuracy.mean();

    // Compute payment.
    var bonus = completion_bonus + Math.ceil(performance_bonus * accuracy * 100) / 100;
    var total = completion_bonus + performance_bonus;

    // Report accuracy to subject.
    trial.stimulus = `You accessed robot memories based on your repair decisions.<br><br>Your accuracy: ${Math.round(accuracy * 100)}%<br><br>Press any key to complete the experiment.`

  },
  on_finish: function(trial) {

    // Compute overall accuracy.
    var accuracy = jsPsych.data.get().filter([{Block: 1}, {Block:2}]).select('Accuracy');
    var accuracy = accuracy.mean();
    trial.accuracy = accuracy;

    // Compute payment.
    var bonus = completion_bonus + Math.ceil(performance_bonus * accuracy * 100) / 100;
    var total = completion_bonus + performance_bonus;
    trial.bonus = bonus;

  }
}
