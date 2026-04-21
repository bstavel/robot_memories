//------------------------------------//
// Define instructions parameters.
//------------------------------------//

// Define practice trial counts.
const practice_thresh = 60;
var practice_count = 0;

// Define practice block parameters.
const min_practice = 3;

// Define color variables (needed for instructions)
if (typeof instr_color_win === 'undefined') {
  var instr_color_win = 'blue';
  var scanner_color_win = '#3366ff99';
  var outcome_color_win = '#1a3ea7';
  var instr_color_lose = 'red';
  var scanner_color_lose = '#f73b6a7A';
  var outcome_color_lose = '#930a25';
}

// Define go key
if (typeof key_go === 'undefined') {
  var key_go = 32;
}

// Define trial duration
if (typeof trial_duration === 'undefined') {
  var trial_duration = 1300;
}

//------------------------------------//
// Define instructions text.
//------------------------------------//

var instructions_01 = {
  type: 'pit-instructions',
  pages: [
    "Welcome to the <b>Robot Factory</b> game!",
    "This game is very similar to the last game you just played, but instead inspecting memories, you will be collecting points.",
    "As before, you will be inspecting robots as they move down the assembly line into the <b>scanner</b>.",
    "Sometimes a robot in the factory will need repair.<br>How often a robot will need repair <b>depends on its type.</b>",
    "There are many different types of robots. Each type of robot<br>can be identified by the <b>unique symbol</b> on its chestplate.",
    "When a robot enters the scanner, you must decide whether to:<br><b>Repair</b> the robot (press SPACE) <br><b>Ignore</b> the robot (do nothing)",
    "By making correct decisions, you can <b>earn points</b>.",
    `Importantly, the points you earn depend<br>on whether the robot is <b><font color=${outcome_color_win}>SAFE</font></b> or <b><font color=${outcome_color_lose}>DANGEROUS</font></b>.`,
    `If the scanner is <b><font color=${outcome_color_win}>${instr_color_win}</font></b>, the robot is <b><font color=${outcome_color_win}>SAFE</font></b>.<br>Correct actions earn you <b><font color=${outcome_color_win}>+10 points</font></b>.<br>Incorrect actions earn you <b>0 points</b>.`
  ],
  robot_runes: [
    '', '', '', 'O', '', '', '', '', ''
  ],
  scanner_colors: [
    '#FFFFFF00', '#FFFFFF00', '#FFFFFF00', '#FFFFF080', '#FFFFFF00', '#FFFFFF00',
    '#FFFFFF00', scanner_color_win, scanner_color_win
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
  on_start: function(trial) {
    pass_message('starting instructions');
  }
}

var instructions_02 = {
  type: 'pit-instructions',
  pages: [
    "Now let's practice for another type of safe robot.<br>Try to learn if you should repair this robot (press SPACE)<br>or ignore it (do nothing).",
    "<b>Remember:</b> not every robot will need repair, and<br>correct actions earn you +10 points."
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next"
}

var instructions_03 = {
  type: 'pit-instructions',
  pages: [
    `If the scanner is <b><font color=${outcome_color_lose}>${instr_color_lose}</font></b>, the robot is <b><font color=${outcome_color_lose}>DANGEROUS</font></b>.<br>Correct actions keep you at <b>0 points</b>.<br>Incorrect actions cost you <b><font color=${outcome_color_lose}>-10 points</font></b>.`,
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
}

var instructions_04 = {
  type: 'pit-instructions',
  pages: [
    "Now let's practice for another type of dangerous robot.<br>Try to learn if you should repair this robot (press SPACE)<br>or ignore it (do nothing).",
    "<b>Remember:</b> some dangerous robots need repair, and<br>correct actions help you avoid losing 10 points."
  ],
  show_clickable_nav: true,
  button_label_previous: "Prev",
  button_label_next: "Next",
}

var instructions_05 = {
  type: 'pit-instructions',
  pages: [
    "Great job! We're almost ready to begin the game.",
    "<b>Remember:</b> Not all robots of the same type will need repair, but<br>some types of robots will need repair more often than others.",
    "Pay close attention to the robot's symbol as it will help you<br>decide whether to repair the robot (press SPACE)<br>or ignore the robot (do nothing).",
    "Next, we will ask you some questions about the task."
  ]
}

//------------------------------------//
// Define practice blocks.
//------------------------------------//

// Function to end experiment if maximum practice trials
// have been reached
var attention_check = {
  type: 'call-function',
  func: function(){},
  on_finish: function(trial) {
    if (low_quality) { jsPsych.endExperiment(); }
  }
}

// Practice block (GW robot)
const practice_01_trial = {
  type: 'pit-trial-memory',
  robot_rune: 'A',
  scanner_color: '#3366ff99',
  outcome_color: outcome_color_win,
  outcome_correct: '+10',
  outcome_incorrect: '0',
  robot_type: 'GW',
  correct: 32,
  valid_responses: [32],
  trial_duration: 1300,
  feedback_duration: 1200,
  data: {block: 0, practice: 1}
}

var practice_01 = {
  timeline: [practice_01_trial],
  loop_function: function(data) {

    // Increment counter. Check for experiment termination.
    practice_count++;
    if ( practice_count > practice_thresh ) {
      low_quality = true;
      return false;
    }

    // Extract accuracy from practice trials (type 1).
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const practice = jsPsych.data.get().filter({practice: 1}).select('accuracy').values;
    const score = practice.reduce(reducer, 0);

    // If fewer than 3 correct: loop.
    if ( score < min_practice ) {
      return true;

    // Otherwise: end practice.
    } else {
      return false;
    }

  }
}

// Practice block (NGW robot)
const practice_02_trial = {
  type: 'pit-trial-memory',
  robot_rune: 'B',
  scanner_color: '#3366ff99',
  outcome_color: outcome_color_win,
  outcome_correct: '+10',
  outcome_incorrect: '0',
  robot_type: 'NGW',
  correct: -1,
  valid_responses: [32],
  trial_duration: 1300,
  feedback_duration: 1200,
  data: {block: 0, practice: 2}
}

var practice_02 = {
  timeline: [practice_02_trial],
  loop_function: function(data) {

    // Increment counter. Check for experiment termination.
    practice_count++;
    if ( practice_count > practice_thresh ) {
      low_quality = true;
      return false;
    }

    // Extract accuracy from practice trials (type 2).
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const practice = jsPsych.data.get().filter({practice: 2}).select('accuracy').values;
    const score = practice.reduce(reducer, 0);

    // If fewer than 3 correct: loop.
    if ( score < min_practice ) {
      return true;

    // Otherwise: end practice.
    } else {
      return false;
    }

  }
}

// Practice block (GAL robot)
const practice_03_trial = {
  type: 'pit-trial-memory',
  robot_rune: 'C',
  scanner_color: '#f73b6a7A',
  outcome_color: outcome_color_lose,
  outcome_correct: '0',
  outcome_incorrect: '-10',
  robot_type: 'GAL',
  correct: 32,
  valid_responses: [32],
  trial_duration: 1300,
  feedback_duration: 1200,
  data: {block: 0, practice: 3}
}

var practice_03 = {
  timeline: [practice_03_trial],
  loop_function: function(data) {

    // Increment counter. Check for experiment termination.
    practice_count++;
    if ( practice_count > practice_thresh ) {
      low_quality = true;
      return false;
    }

    // Extract accuracy from practice trials (type 3).
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const practice = jsPsych.data.get().filter({practice: 3}).select('accuracy').values;
    const score = practice.reduce(reducer, 0);

    // If fewer than 3 correct: loop.
    if ( score < min_practice ) {
      return true;

    // Otherwise: end practice.
    } else {
      return false;
    }

  }
}

// Practice block (NGL robot)
const practice_04_trial = {
  type: 'pit-trial-memory',
  robot_rune: 'D',
  scanner_color: '#f73b6a7A',
  outcome_color: outcome_color_lose,
  outcome_correct: '0',
  outcome_incorrect: '-10',
  robot_type: 'NGL',
  correct: -1,
  valid_responses: [32],
  trial_duration: 1300,
  feedback_duration: 1200,
  data: {block: 0, practice: 4}
}

var practice_04 = {
  timeline: [practice_04_trial],
  loop_function: function(data) {

    // Increment counter. Check for experiment termination.
    practice_count++;
    if ( practice_count > practice_thresh ) {
      low_quality = true;
      return false;
    }

    // Extract accuracy from practice trials (type 4).
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const practice = jsPsych.data.get().filter({practice: 4}).select('accuracy').values;
    const score = practice.reduce(reducer, 0);

    // If fewer than 3 correct: loop.
    if ( score < min_practice ) {
      return true;

    // Otherwise: end practice.
    } else {
      return false;
    }

  }
}

//------------------------------------//
// Define comprehension check.
//------------------------------------//

var quiz = {
  type: 'pit-comprehension',
  prompts: [
    "To <b>repair</b> a robot, what do you do?",
    `When the scanner light is <b><font color=${outcome_color_win}>${instr_color_win}</font></b>, what points do you earn for a correct action?`,
    `When the scanner light is <b><font color=${outcome_color_lose}>${instr_color_lose}</font></b>, what happens if you make a correct action?`,
    "<i>True</i> or <i>False</i>: Some robots will need repair more often than others.",
    "<i>True</i> or <i>False</i>: Making correct decisions helps you earn more points."
  ],
  options: [
    ["Press SPACE", "Do nothing", "Press ENTER"],
    ["+10 points", "0 points", "-10 points"],
    ["Lose 10 points", "Gain 10 points", "Lose 0 points"],
    ["True", "False"],
    ["True", "False"]
  ],
  correct: [
    "Press SPACE",
    "+10 points",
    "Lose 0 points",
    "True",
    "True"
  ]
}

//------------------------------------//
// Define instructions block.
//------------------------------------//

var INSTRUCTIONS = {
  timeline: [
    instructions_01,
    instructions_03,
    instructions_05,
    quiz
  ]
}
