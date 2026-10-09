export const MOOD_PLANTS = {
 happy: { name: 'Happy', emoji: '😊', label: 'feeling light today', color: '#efe0a7', plantType: 'sunflower', displayName: 'Sunflower', accent: '#e5c569', message: 'A little sunshine has taken root.' },
 loved: { name: 'Loved', emoji: '🥰', label: 'holding something close', color: '#ead0cc', plantType: 'pink-flower', displayName: 'Pink flower', accent: '#d8a2a5', message: 'Something tender is blooming.' },
 calm: { name: 'Calm', emoji: '😌', label: 'taking things slowly', color: '#d6dfc4', plantType: 'lavender', displayName: 'Lavender', accent: '#b9a3c8', message: 'A quiet little lavender is growing.' },
 okay: { name: 'Okay', emoji: '😐', label: 'just as you are', color: '#e5dfcb', plantType: 'sprout', displayName: 'Green sprout', accent: '#91a77a', message: 'A small beginning is enough.' },
 sad: { name: 'Sad', emoji: '😔', label: 'making space for the clouds', color: '#d2dce3', plantType: 'mushroom', displayName: 'Mushroom', accent: '#bc9b94', message: 'Even cloudy feelings have a home.' },
 stressed: { name: 'Stressed', emoji: '😤', label: 'a moment to exhale', color: '#e3cdbb', plantType: 'leafy-plant', displayName: 'Leafy plant', accent: '#71885d', message: 'A little room to breathe has taken root.' },
 tired: { name: 'Tired', emoji: '😴', label: 'a little gentleness today', color: '#ddd3e5', plantType: 'sleepy-flower', displayName: 'Sleepy flower', accent: '#c5b5d3', message: 'A soft bloom for a slower day.' },
};
export const MOODS = Object.keys(MOOD_PLANTS);
export const ACTIVITIES = ['work', 'study', 'family', 'friends', 'exercise', 'sleep', 'food', 'travel', 'self-care', 'other'];
export const NOTE_MAX_LENGTH = 2000;
export { GROWTH_PER_ENTRY } from "./growth.js";
export const VISIBLE_PLANT_LIMIT = 12;
