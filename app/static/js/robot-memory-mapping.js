/**
 * Robot Memory Mapping System
 * 
 * Maps robot types and accuracy to appropriate memory categories
 * 
 **/

// Define memory categories and their properties
const MEMORY_CATEGORIES = {
  'most_good': { 
    name: 'Excellent Memory', 
    color: '#4CAF50',
    description: 'The robot\'s best memories'
  },
  'less_good': { 
    name: 'Good Memory', 
    color: '#8BC34A',
    description: 'The robot\'s pleasant memories'
  },
  'less_bad': { 
    name: 'Unpleasant Memory', 
    color: '#FF9800',
    description: 'The robot\'s somewhat bad memories'
  },
  'most_bad': { 
    name: 'Disturbing Memory', 
    color: '#F44336',
    description: 'The robot\'s worst memories'
  }
};

// Define video lists for each category (using actual filenames)
const VIDEO_LISTS = {
  'most_good': [
    '0094.mp4', '0100.mp4', '0110.mp4', '0113.mp4', '0146.mp4',
    '0237.mp4', '0357.mp4', '0366.mp4', '0392.mp4', '0553.mp4',
    '0741.mp4', '0996.mp4', '1249.mp4', '1363.mp4', '1439.mp4',
    '1620.mp4', '1628.mp4', '1660.mp4', '1692.mp4', '1715.mp4',
    '1723.mp4', '1826.mp4', '1839.mp4', '1963.mp4', '2102.mp4',
    '2131.mp4', '2182.mp4'
  ],
  'less_good': [
    '3_F_035_edited.mp4', '3_F_044_edited.mp4', '3_F_046_edited.mp4',
    '3_F_062_edited.mp4', '3_F_065_edited.mp4', '3_F_071_edited.mp4',
    '3_F_079_edited.mp4', '3_F_087_edited.mp4', '3_M_032_edited.mp4',
    '3_M_049_edited.mp4', '3_M_067_edited.mp4', '3_M_068_edited.mp4',
    '3_M_075_edited.mp4', '3_M_081_edited.mp4', '3_M_086_edited.mp4'
  ],
  'less_bad': [
    '1_F_033_edited.mp4', '1_F_054_edited.mp4', '1_F_056_edited.mp4',
    '1_F_057_edited.mp4', '1_F_066_edited.mp4', '1_F_069_edited.mp4',
    '1_F_077_edited.mp4', '1_F_088_edited.mp4', '1_M_031_edited.mp4',
    '1_M_038_edited.mp4', '1_M_051_edited.mp4', '1_M_061_edited.mp4',
    '1_M_066_edited.mp4', '1_M_073_edited.mp4', '1_M_080_edited.mp4',
    '1_M_082_edited.mp4'
  ],
  'most_bad': [
    '0197.mp4', '0218.mp4', '0226.mp4', '0513.mp4', '0611.mp4',
    '0756.mp4', '0839.mp4', '0861.mp4', '1101.mp4', '1169.mp4',
    '1222.mp4', '1238.mp4', '1303.mp4', '1434.mp4', '1473.mp4',
    '1485.mp4', '1623.mp4', '1654.mp4', '1771.mp4', '1776.mp4',
    '1858.mp4', '1933.mp4', '2122.mp4'
  ]
};

// Memory mapping based on robot type and accuracy
const MEMORY_MAPPING = {
  'GW': {  // Go-Win (Safe robot, needs repair)
    correct: 'most_good',    // Access best memories
    incorrect: 'less_good'   // Access decent memories
  },
  'NGW': { // No-Go-Win (Safe robot, ignore)
    correct: 'most_good',    // Access best memories  
    incorrect: 'less_good'   // Access decent memories
  },
  'GAL': { // Go-Avoid-Loss (Dangerous robot, needs repair)
    correct: 'less_bad',     // Access less bad memories
    incorrect: 'most_bad'    // Access worst memories
  },
  'NGL': { // No-Go-Avoid-Loss (Dangerous robot, ignore)
    correct: 'less_bad',     // Access less bad memories
    incorrect: 'most_bad'    // Access worst memories
  }
};

// Track which videos have been used within the current block
let usedVideos = {
  'most_good': new Set(),
  'less_good': new Set(),
  'less_bad': new Set(),
  'most_bad': new Set()
};

/**
 * Get memory category based on robot type and accuracy
 * @param {string} robotType - Robot type (GW, NGW, GAL, NGL)
 * @param {boolean} isCorrect - Whether the action was correct
 * @returns {string} Memory category
 */
function getMemoryCategory(robotType, isCorrect) {
  const mapping = MEMORY_MAPPING[robotType];
  if (!mapping) {
    console.warn(`Unknown robot type: ${robotType}`);
    return 'less_good'; // Default fallback
  }
  
  return isCorrect ? mapping.correct : mapping.incorrect;
}

/**
 * Select a random video from the specified category
 * @param {string} category - Memory category
 * @returns {string|null} Video filename or null if no videos available
 */
function selectRandomVideo(category) {
  const videos = VIDEO_LISTS[category];
  if (!videos || videos.length === 0) {
    console.warn(`No videos available for category: ${category}`);
    return null;
  }
  
  // Filter out already used videos
  const availableVideos = videos.filter(video => !usedVideos[category].has(video));
  
  // If all videos have been used, reset the used list for this category
  if (availableVideos.length === 0) {
    console.log(`All videos used for category ${category}, resetting...`);
    usedVideos[category].clear();
    return selectRandomVideo(category); // Recursive call with reset list
  }
  
  // Select random video
  const randomIndex = Math.floor(Math.random() * availableVideos.length);
  const selectedVideo = availableVideos[randomIndex];
  
  // Mark as used
  usedVideos[category].add(selectedVideo);
  
  return selectedVideo;
}

/**
 * Get memory information for display
 * @param {string} category - Memory category
 * @returns {object} Memory info object
 */
function getMemoryInfo(category) {
  return MEMORY_CATEGORIES[category] || {
    name: 'Unknown Memory',
    color: '#666666',
    description: 'Unknown memory type'
  };
}

/**
 * Create memory trial configuration
 * @param {string} robotType - Robot type (GW, NGW, GAL, NGL)
 * @param {boolean} isCorrect - Whether the action was correct
 * @param {object} options - Additional options
 * @returns {object} Memory trial configuration
 */
function createMemoryTrial(robotType, isCorrect, options = {}) {
  const category = getMemoryCategory(robotType, isCorrect);
  const videoFile = selectRandomVideo(category);
  const memoryInfo = getMemoryInfo(category);
  
  return {
    type: 'robot-memory',
    memory_category: category,
    video_filename: videoFile,
    memory_title: `Accessing ${memoryInfo.name}...`,
    memory_duration: options.duration || 3000,
    auto_advance: options.auto_advance !== false,
    show_controls: options.show_controls !== false,
    data: {
      robot_type: robotType,
      action_correct: isCorrect,
      memory_category: category,
      video_filename: videoFile
    }
  };
}

/**
 * Reset used videos — call this between blocks so videos can repeat across blocks
 * but not within a block.
 */
function resetUsedVideos() {
  Object.keys(usedVideos).forEach(category => {
    usedVideos[category].clear();
  });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMemoryCategory,
    selectRandomVideo,
    getMemoryInfo,
    createMemoryTrial,
    resetUsedVideos,
    MEMORY_CATEGORIES,
    MEMORY_MAPPING
  };
}
