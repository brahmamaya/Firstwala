/* Physica Tutor content - written in advance (no AI service at run time), so it is free, instant and works offline.
   Answers are functions of the live slider values (p), so the tutor talks about what is on the stage right now.
   Add more simulations by adding entries keyed by simulation id. */
(() => {
'use strict';
const rad=d=>d*Math.PI/180,f1=n=>n.toFixed(1),f2=n=>n.toFixed(2);
const R=p=>p.speed**2*Math.sin(2*rad(p.angle))/p.gravity,H=p=>(p.speed*Math.sin(rad(p.angle)))**2/(2*p.gravity),T=p=>2*p.speed*Math.sin(rad(p.angle))/p.gravity;
const at=(p,o)=>({...p,...o});
window.PhysicaTutor={
projectile:{
  intro:'Ask me anything about projectiles, or press “Show me” to watch an idea in action.',
  qa:[
    {q:'Why is the range maximum at 45°?',k:['45','maximum range','max range','farthest','sabse door','best angle','greatest range'],
     a:p=>`Range R = v² sin(2θ) / g. sin(2θ) is largest (= 1) when 2θ = 90°, so θ = 45°. Right now at ${p.angle}° the range is ${f1(R(p))} m; at 45° it would be ${f1(R(at(p,{angle:45})))} m.`},
    {q:'Which two angles give the same range?',k:['same range','complementary','30 and 60','30° and 60°','equal range','two angles','barabar'],
     a:p=>`Any two angles that add up to 90° give the same range, because sin(2θ) = sin(180° − 2θ). At ${p.angle}° and ${90-p.angle}° the range is ${f1(R(p))} m both times - but the higher angle flies higher and stays longer in the air.`},
    {q:'What happens to the range if I double the speed?',k:['double','speed','velocity','faster','twice','2x','dugna','tez'],
     a:p=>`Range grows with the square of speed (R ∝ v²). Doubling the speed makes the range 4 times bigger: ${f1(R(p))} m → ${f1(R(at(p,{speed:p.speed*2})))} m.`},
    {q:'How does gravity change the path?',k:['gravity','moon','mars','planet','g ','lower gravity','weaker'],
     a:p=>`Range, height and flight time are all inversely related to g. With g = ${p.gravity} m/s² the range is ${f1(R(p))} m. On Mars (g ≈ 3.7 m/s²) the same throw would go ${f1(R(at(p,{gravity:3.7})))} m.`},
    {q:'How long does it stay in the air?',k:['time of flight','how long','time','air','flight','kitni der','samay'],
     a:p=>`Time of flight T = 2v sinθ / g = 2 × ${p.speed} × sin ${p.angle}° / ${p.gravity} = ${f2(T(p))} s.`},
    {q:'How high does it go?',k:['height','maximum height','max height','how high','highest','kitna upar','unchai'],
     a:p=>`Maximum height H = v² sin²θ / (2g) = ${f1(H(p))} m. Height depends only on the vertical part of the speed, v sinθ = ${f1(p.speed*Math.sin(rad(p.angle)))} m/s.`},
    {q:'Why does the horizontal speed stay the same?',k:['horizontal','constant','stay the same','x velocity','sideways','horizontal speed'],
     a:p=>`No force acts sideways (we ignore air resistance), so there is no horizontal acceleration. The horizontal speed stays v cosθ = ${f1(p.speed*Math.cos(rad(p.angle)))} m/s for the whole flight.`},
    {q:'What is the velocity at the highest point?',k:['highest point','top','peak','velocity at top','zero','sabse upar'],
     a:p=>`At the top the vertical velocity is zero, but it is still moving sideways at v cosθ = ${f1(p.speed*Math.cos(rad(p.angle)))} m/s. So the velocity at the top is NOT zero.`},
    {q:'Why is the path a parabola?',k:['parabola','shape','path','curve','trajectory','raasta'],
     a:()=>'x grows steadily with time (x = v cosθ · t) while y follows y = v sinθ · t − ½ g t². Put t = x / (v cosθ) into y and you get y = ax − bx², which is a parabola.'},
    {q:'Does a heavier ball go farther?',k:['mass','heavy','heavier','weight','bhari','light'],
     a:()=>'No. Without air resistance the mass cancels out - every object falls with the same acceleration g. Range depends only on speed, angle and g.'},
    {q:'Which angle gives the maximum height?',k:['angle for height','maximum height angle','90','straight up','vertical'],
     a:p=>`90° (straight up) gives the greatest height, v² / (2g) = ${f1(p.speed**2/(2*p.gravity))} m - but then the range is zero.`}
  ],
  demos:[
    {title:'Is 45° really the best angle?',predict:{q:'We will raise the angle from 20° to 70°. What happens to the range?',options:['It keeps increasing','It keeps decreasing','It increases, then decreases'],correct:2},
     steps:[{set:{angle:20},say:p=>`20°: range ${f1(R(p))} m`},{launch:1},{wait:1800},{set:{angle:45},ms:1600,say:p=>`45°: range ${f1(R(p))} m - the biggest`},{launch:1},{wait:1800},{set:{angle:70},ms:1600,say:p=>`70°: range ${f1(R(p))} m - shorter again`},{launch:1},{wait:1800}],
     explain:'Range follows sin(2θ): it rises up to 45° and then falls. 45° gives the farthest throw.'},
    {title:'30° and 60° - a surprise',predict:{q:'Same speed, angles 30° and 60°. Which goes farther?',options:['30° goes farther','60° goes farther','Both land at the same place'],correct:2},
     steps:[{set:{angle:30},ms:1000,say:p=>`30°: range ${f1(R(p))} m`},{launch:1},{wait:2200},{set:{angle:60},ms:1200,say:p=>`60°: range ${f1(R(p))} m - the same!`},{launch:1},{wait:2600}],
     explain:'30° + 60° = 90°. Complementary angles give the same range; the 60° throw just flies higher and longer.'},
    {title:'Double the speed',predict:{q:'If the launch speed doubles from 15 to 30 m/s, the range becomes…',options:['2 times','4 times','The same'],correct:1},
     steps:[{set:{speed:15,angle:45},ms:1000,say:p=>`15 m/s: range ${f1(R(p))} m`},{launch:1},{wait:1500},{set:{speed:30},ms:1600,say:p=>`30 m/s: range ${f1(R(p))} m - four times`},{launch:1},{wait:2600}],
     explain:'Range depends on v². Twice the speed → 2² = 4 times the range.'},
    {title:'Throw on Mars',predict:{q:'Gravity drops from 9.8 to 3.7 m/s² (Mars). The range…',options:['Gets shorter','Gets about 2.6 times longer','Stays the same'],correct:1},
     steps:[{set:{gravity:9.8,angle:45,speed:20},ms:1000,say:p=>`Earth: range ${f1(R(p))} m`},{launch:1},{wait:1800},{set:{gravity:3.7},ms:1600,say:p=>`Mars: range ${f1(R(p))} m`},{launch:1},{wait:3000}],
     explain:'R ∝ 1/g. Weaker gravity pulls the ball down more slowly, so it travels 9.8 / 3.7 ≈ 2.6 times farther.'}
  ],
  quiz:[
    {q:'Ignoring air resistance, which angle gives the maximum range?',options:['30°','45°','60°','75°'],correct:1,why:'sin(2θ) is largest at 2θ = 90°, i.e. θ = 45°.'},
    {q:'A ball is thrown at 30° and another at 60° with the same speed. Their ranges are…',options:['30° is larger','60° is larger','Equal','Cannot say'],correct:2,why:'Complementary angles (adding to 90°) give equal ranges.'},
    {q:'At the highest point of the path, the velocity is…',options:['Zero','Only horizontal','Only vertical','Maximum'],correct:1,why:'The vertical part becomes zero; the horizontal part v cosθ is unchanged.'}
  ]
}
};
})();
