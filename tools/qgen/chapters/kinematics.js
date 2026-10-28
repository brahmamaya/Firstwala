/* JEE Mains Physics · Kinematics. Topic keys (tp) are the Rank-mode keys used by rank-pyq-kin.js. */
'use strict';
const parts = ['pke', 'pkd', 'pkr', 'pkj', 'pkv', 'pkp', 'pkc'];
const templates = [];
for (const p of parts) { try { templates.push(...require('./kinematics/' + p)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } }
module.exports = { subject: 'physics', key: 'kinematics', name: 'Kinematics', exam: 'JEE Mains',
  topics: { pkd: 'Motion in a straight line: speed, velocity and graphs', pke: 'Equations of motion and free fall', pkv: 'Vectors', pkr: 'Relative velocity', pkp: 'Motion in a plane', pkj: 'Projectile motion', pkc: 'Circular motion' },
  templates };
