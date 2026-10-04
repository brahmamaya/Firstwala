/* Physica Tutor - answers learned from real student questions.
   Questions the tutor could not answer reach the Physica team (Google Form responses sheet);
   their answers are added here, chapter by chapter: [question, [keywords], answer]. */
(() => {
'use strict';
const L={
'Units and Measurements':[
  ['Why do we need standard units?',['standard unit','why units','need units','unit kyu','units kyun'],'Without a common standard, "5 hand-spans" means different lengths for different people. SI units (metre, kilogram, second...) are defined using constants of nature, so a measurement means exactly the same thing everywhere in the world.'],
  ['What is the difference between accuracy and precision?',['accuracy','precision','accurate','precise'],'Accuracy is how close a measurement is to the true value; precision is how close repeated measurements are to each other (and how fine the instrument reads). A badly zeroed vernier can be very precise (readings agree) but not accurate (all shifted by the zero error).'],
  ['What is zero error?',['zero error','negative zero','positive zero'],'Zero error is the reading an instrument shows when it should read zero (jaws closed). If the vernier zero is to the right of the main-scale zero, the error is positive and you subtract it; if it is to the left, the error is negative and you add its magnitude. Corrected reading = observed reading − zero error.']
]};
const CH=window.PhysicaTutorChapters=window.PhysicaTutorChapters||{};
for(const [name,list] of Object.entries(L)){const c=CH[name]||(CH[name]={qa:[],quiz:[]});for(const [q,k,a] of list)c.qa.push({q,k,a:()=>a})}
})();
