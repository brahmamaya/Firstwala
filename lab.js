/* Virtual lab: turns the NCERT practical experiments into a lab notebook under the stage.
   The student sets up the simulation, presses "Record reading", and the observation table, calculations,
   graph (with a least-squares line), result with error, precautions and viva questions build themselves.
   "Lab record" opens a printable record (save as PDF from the print dialog). Readings stay on this device. */
(() => {
'use strict';
const S=window.PhysicaState,stage=document.querySelector('.below-stage');if(!S||!stage)return;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(c,x,f)=>{const b=el('button',c,x);b.type='button';b.addEventListener('click',f);return b};
const say=m=>{const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(say.t);say.t=setTimeout(()=>{t.hidden=true},3200)};
const num=s=>{s=String(s).replace(/−/g,'-').replace(/≈/g,'');const sup='⁻⁰¹²³⁴⁵⁶⁷⁸⁹',m=s.match(/(-?\d+(?:\.\d+)?)(?:\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/);if(!m)return NaN;
  let v=+m[1];if(m[2])v*=10**+[...m[2]].map(c=>'-0123456789'[sup.indexOf(c)]).join('');return v};
const PI=Math.PI,rad=d=>d*PI/180,deg=r=>r*180/PI,rnd=(v,lc)=>Math.round(v/lc)*lc;
const fx=(v,d=2)=>Number.isFinite(v)?(Math.abs(v)<1e-12?0:v).toFixed(d):'—';
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
// least squares y = a + b x (or y = b x through the origin)
function fit(P,origin){const n=P.length;if(n<2)return null;if(origin){const sxy=P.reduce((s,[x,y])=>s+x*y,0),sxx=P.reduce((s,[x])=>s+x*x,0);return sxx?{b:sxy/sxx,a:0}:null}
  const mx=mean(P.map(p=>p[0])),my=mean(P.map(p=>p[1])),sxx=P.reduce((s,[x])=>s+(x-mx)**2,0);if(!sxx)return null;const b=P.reduce((s,[x,y])=>s+(x-mx)*(y-my),0)/sxx;return{b,a:my-b*mx}}
// standard result block: mean, mean absolute error, and % error against the expected value
function stat(label,vals,unit,d,expect,expLabel){const m=mean(vals),da=mean(vals.map(v=>Math.abs(v-m)));const out=[[label,`${fx(m,d)} ± ${fx(da,d)} ${unit}`.trim()]];
  if(Number.isFinite(expect)&&expect)out.push([expLabel||'Expected value',`${fx(expect,d)} ${unit}`.trim()],['Percentage error',fx(Math.abs(m-expect)/Math.abs(expect)*100,2)+' %']);return out}

const G=9.8;
/* Each lab: name, aim, apparatus, theory (formula lines), how (what to do), cols [heading, decimals],
   read(p, m, t) -> row values or an error message, result(rows, p) -> [[label, text]], graphs, precautions,
   errors, viva [[q, a]]. m(label) reads a number from the simulation's own readout. */
const LABS={
units:{name:'Vernier callipers',aim:'To measure the diameter of a small spherical or cylindrical body using vernier callipers.',
 apparatus:['Vernier callipers','Spherical body (steel ball / glass marble) or cylinder','Magnifying lens'],
 theory:['Least count (LC) = 1 MSD − 1 VSD = 0.1 mm','Observed reading = MSR + n × LC','Corrected reading = Observed reading − zero error'],
 how:'Choose an object, close the jaws on it (drag on the stage), then press Record. Turn the object between readings.',
 cols:[['MSR (mm)',0],['Vernier division n',0],['n × LC (mm)',1],['Observed (mm)',1],['Zero error (mm)',1],['Corrected (mm)',1]],
 read(p,m){if(p.obj==='none')return'Choose an object to measure first.';if(!/✓/.test(m.txt('Jaws')))return'Close the jaws on the object first (drag on the stage).';
  const n=m('Coinciding');return[m('Main scale'),n,n*.1,m('Observed'),p.zero,m('Corrected')]},
 result:R=>stat('Mean diameter',R.map(r=>r[5]),'mm',2),
 precautions:['Close the jaws gently; do not press the body too hard.','Read the scales with the eye directly above the coinciding division to avoid parallax.','Take readings in different orientations of the body and find the mean.','Note the zero error with sign and correct every reading.'],
 errors:['Backlash or loose jaws.','Parallax while reading the vernier.'],
 viva:[['What is the least count of these vernier callipers?','LC = 1 MSD − 1 VSD = 1 mm − 0.9 mm = 0.1 mm.'],['When is the zero error positive?','When the vernier zero lies to the right of the main-scale zero with the jaws closed; it is subtracted from the reading.'],['Why take several readings?','To reduce random error; the mean is closer to the true value.']]},
'screw-gauge':{name:'Screw gauge',aim:'To measure the diameter of a given wire (or thickness of a sheet) using a screw gauge.',
 apparatus:['Screw gauge','Wire / coin / paper stack','Half-metre scale'],
 theory:['Least count = Pitch / Number of circular-scale divisions','Observed reading = PSR + n × LC','Corrected reading = Observed reading − zero error'],
 how:'Choose an object, turn the thimble until the spindle touches it (drag on the stage), then press Record. Take readings at different places.',
 cols:[['PSR (mm)',1],['Circular division n',0],['LC (mm)',2],['Observed (mm)',2],['Zero error (mm)',2],['Corrected (mm)',2]],
 read(p,m){if(p.obj==='none')return'Choose an object to measure first.';if(!/✓/.test(m.txt('Spindle')))return'Turn the thimble until the spindle touches the object.';
  return[m('Pitch scale'),m('Thimble'),m('Least count'),m('Observed'),p.zero,m('Corrected')]},
 result:R=>stat('Mean diameter',R.map(r=>r[5]),'mm',3),
 precautions:['Turn the screw only by the ratchet so that the object is not pressed too hard.','Take readings at different places and in two perpendicular directions.','Correct for zero error with the proper sign.','Avoid backlash: always move the screw in one direction while taking a reading.'],
 errors:['Backlash error in the screw.','Wire not uniform in thickness.'],
 viva:[['What is pitch?','The distance moved by the spindle in one complete rotation of the circular scale.'],['What is backlash error?','The lag between turning the screw and the spindle moving, caused by wear in the threads.'],['Why use the ratchet?','It slips once the spindle touches the object, so the pressure is always the same.']]},
spherometer:{name:'Spherometer',aim:'To determine the radius of curvature of a given spherical surface using a spherometer.',
 apparatus:['Spherometer','Convex surface (watch glass / lens)','Plane glass plate'],
 theory:['h = n × pitch + (circular division) × LC','R = l² / (6h) + h / 2, where l is the mean distance between the legs'],
 how:'Set the screw turns and circular-scale division so that the central leg just touches the surface, then press Record. Repeat with different settings.',
 cols:[['Turns',0],['Circular division',0],['Sagitta h (mm)',2],['Leg spacing l (mm)',0],['R (cm)',2]],
 read(p,m){const h=m('Sagitta');if(!(h>0))return'The sagitta h must be greater than zero.';return[p.turns,p.div,h,p.legs,(p.legs**2/(6*h)+h/2)/10]},
 result:R=>stat('Mean radius of curvature',R.map(r=>r[4]),'cm',2),
 precautions:['Raise the central screw before placing the spherometer on the surface.','Turn the screw in one direction only to avoid backlash.','Measure l as the mean of the three leg separations.'],
 errors:['Backlash in the screw.','The legs and the central screw may not all touch the surface lightly.'],
 viva:[['What is the sagitta?','The height of the central leg above (or below) the plane of the three outer legs.'],['Why three legs?','Three points always define a plane, so the instrument sits steadily.'],['Least count of a spherometer?','Pitch divided by the number of circular-scale divisions.']]},
pendulum:{name:'Simple pendulum',aim:'Using a simple pendulum, to plot the L–T² graph and hence find the acceleration due to gravity.',
 apparatus:['Clamp stand','Bob with thread','Stopwatch (LC 0.1 s)','Metre scale'],
 theory:['T = 2π √(L / g)','g = 4π² L / T²','The graph of L against T² is a straight line with slope L/T², so g = 4π² × slope'],
 how:'Keep the release angle small (≤ 10°). Set a string length, press Record (it times 20 oscillations), then change the length and record again. Take at least 5 lengths.',
 cols:[['Length L (cm)',1],['Time for 20 oscillations (s)',1],['Period T (s)',3],['T² (s²)',3],['g = 4π²L/T² (m/s²)',2]],
 read(p,m){const t=rnd(20*m('Period'),.1),T=t/20;return[p.length*100,t,T,T*T,4*PI*PI*p.length/(T*T)]},
 result(R){const out=stat('Mean g (from table)',R.map(r=>r[4]),'m/s²',2,G,'Standard value');const f=fit(R.map(r=>[r[3],r[0]/100]),true);if(f&&new Set(R.map(r=>r[0])).size>1)out.splice(1,0,['g from graph (4π² × slope)',fx(4*PI*PI*f.b,2)+' m/s²']);return out},
 graphs:[{x:r=>r[3],y:r=>r[0]/100,xl:'T² (s²)',yl:'L (m)',origin:true,slope:'slope = L/T²',sd:4}],
 warn:p=>p.amplitude>10?'Release angle is above 10°; the formula assumes small oscillations.':'',
 precautions:['Keep the angular amplitude small (less than 10°).','Measure the length from the point of suspension to the centre of the bob.','Start the stopwatch at an extreme or mean position and count oscillations carefully.','Make sure the bob swings in a vertical plane and does not spin.'],
 errors:['Reaction time while starting and stopping the stopwatch.','Air resistance and a heavy thread.'],
 viva:[['Does the period depend on the mass of the bob?','No. T = 2π√(L/g) has no mass term.'],['What is a seconds pendulum?','A pendulum of period 2 s; its length is about 99.3 cm on Earth.'],['Why time 20 oscillations instead of one?','The reaction-time error is shared by 20 oscillations, so the error in T is 20 times smaller.'],['What happens to T on the Moon?','g is about 1/6, so T becomes about √6 ≈ 2.45 times larger.']]},
hooke:{name:'Hooke’s law',aim:'To find the force constant of a helical spring by plotting a graph between load and extension.',
 apparatus:['Helical spring with pointer','Rigid support','Slotted weights','Vertical scale'],
 theory:['Within the elastic limit, F = k x (Hooke’s law)','The graph of F against x is a straight line through the origin; k = slope'],
 how:'Set a load (pulling force) and press Record. Increase the load step by step and record each time.',
 cols:[['Load F (N)',1],['Extension x (cm)',1],['k = F/x (N/m)',1]],
 read(p,m){const x=m('Extension');if(!(x>0))return'There is no extension to measure.';return[p.force,x,p.force/(x/100)]},
 result(R,p){const out=stat('Mean k (from table)',R.map(r=>r[2]),'N/m',1,p.stiffness,'Spring constant set');const f=fit(R.map(r=>[r[1]/100,r[0]]),true);if(f&&R.length>1)out.splice(1,0,['k from graph (slope)',fx(f.b,1)+' N/m']);return out},
 graphs:[{x:r=>r[1]/100,y:r=>r[0],xl:'Extension x (m)',yl:'Load F (N)',origin:true,slope:'slope = k',sd:1}],
 precautions:['Do not load the spring beyond its elastic limit.','Add and remove weights gently, waiting for the pointer to come to rest.','Read the pointer with the eye at its level.'],
 errors:['Spring not hanging vertically.','Parallax in reading the pointer.'],
 viva:[['What is the unit of the spring constant?','N/m.'],['What is the elastic limit?','The largest stress up to which a body regains its original shape when the load is removed.'],['What does a steeper F–x graph mean?','A stiffer spring (larger k).']]},
'newton-cooling':{name:'Newton’s law of cooling',aim:'To study the relationship between the temperature of a hot body and time by plotting a cooling curve.',
 apparatus:['Calorimeter with hot water','Thermometer','Stopwatch','Stand and clamp'],
 theory:['Rate of cooling ∝ (T − T₀)','T − T₀ = (Tᵢ − T₀) e^(−kt), so ln(T − T₀) against t is a straight line of slope −k'],
 how:'Press Play and record a reading every few seconds of simulated time while the body cools. Take at least 6 readings.',
 cols:[['Time t (s)',1],['Temperature T (°C)',1],['T − T₀ (°C)',1],['ln(T − T₀)',3]],
 read(p,m){const T=m('Current temperature'),d=T-p.ambient;if(!(d>0))return'The body has reached room temperature.';return[m('Simulated time'),T,d,Math.log(d)]},
 result(R,p){const f=fit(R.map(r=>[r[0],r[3]]));const out=[['Room temperature T₀',fx(p.ambient,1)+' °C']];if(f&&R.length>2){out.push(['Cooling constant k (−slope)',fx(-f.b,4)+' s⁻¹'],['Value set in simulation',fx(p.rate,4)+' s⁻¹'],['Percentage error',fx(Math.abs(-f.b-p.rate)/p.rate*100,2)+' %'])}return out},
 graphs:[{x:r=>r[0],y:r=>r[1],xl:'Time t (s)',yl:'Temperature T (°C)',curve:true},{x:r=>r[0],y:r=>r[3],xl:'Time t (s)',yl:'ln(T − T₀)',slope:'slope = −k',sd:4}],
 precautions:['Stir the water gently so that its temperature is uniform.','Keep the surroundings at a constant temperature, away from draughts.','Read the thermometer at equal time intervals.'],
 errors:['Heat loss by evaporation.','Room temperature changing during the experiment.'],
 viva:[['State Newton’s law of cooling.','The rate of loss of heat of a body is proportional to the difference between its temperature and that of the surroundings (for small differences).'],['What is the shape of the cooling curve?','An exponential decay curve that approaches room temperature.'],['Does a body cool faster at a higher temperature?','Yes, the rate of cooling is larger when the temperature difference is larger.']]},
'capillary-rise':{name:'Surface tension by capillary rise',aim:'To determine the surface tension of water by the capillary rise method.',
 apparatus:['Capillary tubes of different radii','Beaker of water','Travelling microscope','Stand'],
 theory:['h = 2T cos θ / (r ρ g)','T = r h ρ g / (2 cos θ), with ρ = 1000 kg/m³ and g = 9.8 m/s²'],
 how:'Set a tube radius and press Record. Repeat with tubes of different radii.',
 cols:[['Radius r (mm)',2],['Contact angle θ (°)',0],['Rise h (mm)',2],['T (mN/m)',1]],
 read(p,m){const h=m('Height');if(!Number.isFinite(h)||Math.abs(Math.cos(rad(p.angle)))<.02)return'Choose a contact angle away from 90°.';return[p.radius,p.angle,h,p.radius*h*1000*G/(2*Math.cos(rad(p.angle)))/1000]},
 result:(R,p)=>stat('Mean surface tension',R.map(r=>r[3]),'mN/m',1,p.tension,'Value set in simulation'),
 precautions:['The capillary tube must be clean and dry.','Keep the tube vertical.','Measure the radius at the meniscus level.'],
 errors:['Impurities change the surface tension.','The tube bore may not be uniform.'],
 viva:[['Why does water rise in a glass capillary?','Adhesion between water and glass is greater than cohesion, so the contact angle is acute.'],['Why does mercury fall?','Its contact angle with glass is obtuse (cos θ < 0).'],['How does h change if r is halved?','h doubles, because h ∝ 1/r.']]},
'specific-heat':{name:'Specific heat capacity',aim:'To determine the specific heat capacity of a given material from the heat supplied and the rise in temperature.',
 apparatus:['Calorimeter','Heater (known heat supplied)','Thermometer','Balance'],
 theory:['Q = m c ΔT','c = Q / (m ΔT)'],
 how:'Choose a material, set the mass and the heat supplied, then press Record. Change the mass or heat and record again.',
 cols:[['Mass m (kg)',2],['Heat Q (kJ)',1],['Rise ΔT (°C)',1],['c (J/kg·K)',0]],
 read(p,m){const dT=m('Temperature rise');if(!(dT>0))return'No rise in temperature to measure.';return[p.mass,p.heat,dT,p.heat*1000/(p.mass*dT)]},
 result:(R,p)=>stat('Mean specific heat',R.map(r=>r[3]),'J/kg·K',0,+p.mat,'Standard value'),
 precautions:['Stir continuously so the temperature is uniform.','Insulate the calorimeter to reduce heat loss.','Read the highest steady temperature.'],
 errors:['Heat lost to the surroundings.','Heat absorbed by the calorimeter and thermometer.'],
 viva:[['Why is water used as a coolant?','It has a very high specific heat capacity (4186 J/kg·K).'],['Define specific heat capacity.','The heat needed to raise the temperature of 1 kg of a substance by 1 K.']]},
circuit:{name:'Ohm’s law',aim:'To verify Ohm’s law and find the resistance of a given resistor by plotting a V–I graph.',
 apparatus:['Battery / power supply','Resistor','Ammeter','Voltmeter','Rheostat','Plug key','Connecting wires'],
 theory:['V = I R at constant temperature','The V–I graph is a straight line through the origin; R = slope'],
 how:'Keep the resistance fixed. Set a voltage and press Record, then change the voltage and record again (at least 5 readings).',
 cols:[['Voltage V (V)',1],['Current I (A)',2],['R = V/I (Ω)',2]],
 read(p,m){const I=m('Current');if(!(I>0))return'No current is flowing.';return[p.voltage,I,p.voltage/I]},
 result(R,p){const out=stat('Mean R (from table)',R.map(r=>r[2]),'Ω',2,p.resistance,'Resistance used');const f=fit(R.map(r=>[r[1],r[0]]),true);if(f&&R.length>1)out.splice(1,0,['R from graph (slope)',fx(f.b,2)+' Ω']);return out},
 graphs:[{x:r=>r[1],y:r=>r[0],xl:'Current I (A)',yl:'Voltage V (V)',origin:true,slope:'slope = R',sd:2}],
 warn:(p,R)=>R.length&&R.some(r=>Math.abs(r[2]-R[0][2])>.05*R[0][2])?'Keep the same resistor for every reading.':'',
 precautions:['Connections must be tight and clean.','Pass current only while taking a reading so the resistor does not heat up.','The ammeter is joined in series and the voltmeter in parallel.'],
 errors:['Heating of the resistor changes its resistance.','Zero error of the meters.'],
 viva:[['State Ohm’s law.','At constant temperature, the current through a conductor is proportional to the potential difference across it.'],['What does the slope of a V–I graph give?','The resistance.'],['Name a non-ohmic device.','A semiconductor diode (or a filament lamp).']]},
wheatstone:{name:'Wheatstone bridge',aim:'To find an unknown resistance using the balanced Wheatstone bridge.',
 apparatus:['Resistance boxes P, Q, R','Unknown resistance S','Galvanometer','Cell and key'],
 theory:['At balance (no galvanometer current): P / Q = R / S','S = R × Q / P'],
 how:'Adjust P, Q and R until the galvanometer shows no current (bridge balanced), then press Record. Repeat with other P : Q ratios.',
 cols:[['P (Ω)',0],['Q (Ω)',0],['R (Ω)',0],['S = RQ/P (Ω)',2]],
 read(p,m){if(!/^balanced/i.test(m.txt('Bridge state')))return'The bridge is not balanced yet; adjust R until the galvanometer reads zero.';return[p.p,p.q,p.r,p.r*p.q/p.p]},
 result:(R,p)=>stat('Mean unknown resistance S',R.map(r=>r[3]),'Ω',2,p.s,'Actual S'),
 precautions:['Insert the cell key before the galvanometer key.','Keep P and Q of the same order as S for good sensitivity.','Pass current only for a short time.'],
 errors:['Contact resistance at the plugs.','Galvanometer not sensitive enough near balance.'],
 viva:[['When is the bridge most sensitive?','When all four arms have resistances of the same order.'],['Is the balance affected by interchanging the cell and galvanometer?','No, the balance condition remains the same.'],['What is a metre bridge?','A practical Wheatstone bridge in which P/Q is replaced by the ratio of lengths l/(100 − l) of a uniform wire.']]},
potentiometer:{name:'Potentiometer',aim:'To compare the EMFs of two primary cells using a potentiometer.',
 apparatus:['Potentiometer wire (1 m)','Driver battery and rheostat','Two cells','Galvanometer','Jockey'],
 theory:['At the null point, E = k l, where k is the potential gradient','E₁ / E₂ = l₁ / l₂'],
 how:'Keep the driver cell and rheostat fixed. For a test-cell EMF, slide the jockey to the null point (galvanometer reads zero) and press Record. Change the test cell EMF and repeat.',
 cols:[['Test cell E (V)',2],['Balancing length l (cm)',1],['E / l (V/m)',3]],
 read(p,m){const l=m('Balancing length');if(!(l>0&&l<=100))return'The null point is off the wire; increase the driver voltage or reduce the rheostat.';if(Math.abs(p.x-l)>.5)return'Not balanced yet; slide the jockey until the galvanometer shows no deflection.';return[p.E,p.x,p.E/(p.x/100)]},
 result(R,p,m){const out=stat('Potential gradient k',R.map(r=>r[2]),'V/m',3,m('Potential gradient'),'Gradient set by driver');const a=R[0],b=R.find(r=>r[0]!==a[0]);if(b)out.unshift(['E₁/E₂ = l₁/l₂',`${fx(a[1]/b[1],3)} (true ${fx(a[0]/b[0],3)})`]);return out},
 precautions:['The EMF of the driver cell must be greater than the EMF of the test cells.','Positive terminals of all cells go to the same end of the wire.','Do not slide the jockey along the wire; touch it gently.'],
 errors:['Non-uniform wire.','Driver cell EMF drifting during the experiment.'],
 viva:[['Why is a potentiometer better than a voltmeter for measuring EMF?','At the null point it draws no current from the cell, so it measures the true EMF.'],['How can the sensitivity be increased?','By reducing the potential gradient, e.g. using a longer wire or more resistance in the driver circuit.']]},
'internal-resistance':{name:'Internal resistance of a cell',aim:'To determine the internal resistance of a cell by measuring the terminal voltage for different load currents.',
 apparatus:['Cell','Resistance box (load)','Ammeter','Voltmeter','Key'],
 theory:['V = E − I r','The V–I graph is a straight line: intercept = E, slope = −r','r = (E − V) / I'],
 how:'Keep the cell the same. Set a load resistance and press Record. Change the load and record again (at least 4 readings).',
 cols:[['Load R (Ω)',1],['Current I (A)',2],['Terminal V (V)',2],['r = (E − V)/I (Ω)',2]],
 read(p,m){const I=m('Circuit current'),V=m('Terminal');return[p.load,I,V,(p.emf-V)/I]},
 result(R,p){const out=stat('Mean internal resistance r',R.map(r=>r[3]),'Ω',2,p.internal,'Value set');const f=fit(R.map(r=>[r[1],r[2]]));if(f&&R.length>1)out.splice(1,0,['r from graph (−slope)',fx(-f.b,2)+' Ω'],['E from graph (intercept)',fx(f.a,2)+' V']);return out},
 graphs:[{x:r=>r[1],y:r=>r[2],xl:'Current I (A)',yl:'Terminal voltage V (V)',slope:'slope = −r',sd:3}],
 precautions:['Draw current only for a short time so the cell does not polarise.','Use a high-resistance voltmeter.'],
 errors:['Cell EMF falls slowly as it is used.','Meter resistances.'],
 viva:[['Why is the terminal voltage less than the EMF?','Part of the EMF is used to drive current through the internal resistance (I r).'],['When does V equal E?','When no current is drawn (open circuit).']]},
lens:{name:'Focal length of a convex lens',aim:'To find the focal length of a convex lens by plotting the graph between 1/v and 1/u.',
 apparatus:['Optical bench','Convex lens with holder','Object needle / candle','Screen'],
 theory:['Lens formula: 1/v − 1/u = 1/f (u is negative)','f = u v / (u − v)','The graph of 1/v against 1/u is a straight line of slope 1; its intercept on the 1/v axis is 1/f'],
 how:'Place the object beyond F so that a real image forms, then press Record. Move the object and record again (at least 5 readings).',
 cols:[['u (cm)',1],['v (cm)',1],['1/u (cm⁻¹)',4],['1/v (cm⁻¹)',4],['f (cm)',2]],
 read(p,m){if(!/real/i.test(m.txt('Image type')))return'The image is virtual; move the object beyond the focus to get a real image on the screen.';const u=-p.objectDistance,v=m('Image distance');return[u,v,1/u,1/v,u*v/(u-v)]},
 result(R,p){const out=stat('Mean f (from table)',R.map(r=>r[4]),'cm',2,p.focalLength,'Focal length of lens');const f=fit(R.map(r=>[r[2],r[3]]));if(f&&R.length>1)out.splice(1,0,['f from graph (1/intercept)',fx(1/f.a,2)+' cm']);return out},
 graphs:[{x:r=>r[2],y:r=>r[3],xl:'1/u (cm⁻¹)',yl:'1/v (cm⁻¹)',slope:'slope',sd:3}],
 precautions:['The lens, object and screen should be at the same height and in a line.','Remove parallax between the image and the needle tip.','Take u on both sides of 2F.'],
 errors:['Index correction of the optical bench.','Lens not thin.'],
 viva:[['Where is the image when u = 2f?','At 2f on the other side, real, inverted and of the same size.'],['What is the power of a lens?','P = 1/f with f in metres; the unit is the dioptre.'],['Can a convex lens form a virtual image?','Yes, when the object is between the optical centre and F.']]},
'concave-mirror':{name:'Focal length of a concave mirror',aim:'To find the focal length of a concave mirror by finding v for different values of u.',
 apparatus:['Optical bench','Concave mirror with holder','Object needle','Image needle'],
 theory:['Mirror formula: 1/v + 1/u = 1/f (real-is-negative, Cartesian convention)','f = u v / (u + v)'],
 how:'Place the object beyond F so that a real image forms, then press Record. Move the object and record again.',
 cols:[['u (cm)',1],['v (cm)',1],['1/u (cm⁻¹)',4],['1/v (cm⁻¹)',4],['f (cm)',2]],
 read(p,m){if(!/real/i.test(m.txt('Image')))return'The image is virtual; move the object beyond the focus.';const u=-p.u,v=-Math.abs(m('Image distance'));return[u,v,1/u,1/v,u*v/(u+v)]},
 result(R,p){const out=stat('Mean f (from table)',R.map(r=>r[4]),'cm',2,-p.f,'Focal length of mirror');const f=fit(R.map(r=>[r[2],r[3]]));if(f&&R.length>1)out.splice(1,0,['f from graph (1/intercept)',fx(1/f.a,2)+' cm']);return out},
 graphs:[{x:r=>r[2],y:r=>r[3],xl:'1/u (cm⁻¹)',yl:'1/v (cm⁻¹)',slope:'slope',sd:3}],
 precautions:['The mirror and needles should be at the same height.','Remove parallax between the image and the image needle.','The mirror aperture should be small.'],
 errors:['Index correction of the bench.','Spherical aberration of a large mirror.'],
 viva:[['Relation between f and R?','f = R/2.'],['Where should the object be for a magnified real image?','Between F and C.'],['Why is f negative here?','In the Cartesian sign convention distances measured against the incident light are negative.']]},
refraction:{name:'Refractive index (Snell’s law)',aim:'To find the refractive index of a medium by tracing the path of a ray and verifying Snell’s law.',
 apparatus:['Glass slab','Drawing board and paper','Pins','Protractor'],
 theory:['Snell’s law: n₁ sin i = n₂ sin r','Refractive index of medium 2 w.r.t. medium 1: n₂₁ = sin i / sin r','The graph of sin i against sin r is a straight line through the origin; slope = n₂₁'],
 how:'Set the first medium to air (n₁ = 1.00) and the second to glass. Set an angle of incidence and press Record; change the angle and record again.',
 cols:[['Angle of incidence i (°)',1],['Angle of refraction r (°)',1],['sin i',3],['sin r',3],['n₂₁ = sin i / sin r',3]],
 read(p,m){const r=m('Refraction');if(!(p.angle>0)||!(r>0))return'Total internal reflection or zero angle: no refracted ray to measure.';return[p.angle,r,Math.sin(rad(p.angle)),Math.sin(rad(r)),Math.sin(rad(p.angle))/Math.sin(rad(r))]},
 result(R,p){const out=stat('Mean n₂₁',R.map(r=>r[4]),'',3,p.n2/p.n1,'n₂ / n₁ set');const f=fit(R.map(r=>[r[3],r[2]]),true);if(f&&R.length>1)out.splice(1,0,['n₂₁ from graph (slope)',fx(f.b,3)]);return out},
 graphs:[{x:r=>r[3],y:r=>r[2],xl:'sin r',yl:'sin i',origin:true,slope:'slope = n₂₁',sd:3}],
 precautions:['Pins should be vertical and at least 5 cm apart.','Look at the feet of the pins to avoid parallax.','Use angles of incidence between 30° and 60°.'],
 errors:['Thick pin marks.','Errors in reading angles with a protractor.'],
 viva:[['Why does light bend?','Its speed changes when it enters a medium of different optical density.'],['What is the critical angle?','The angle of incidence in the denser medium for which the angle of refraction is 90°.']]},
'iv-curve':{name:'Diode characteristics',aim:'To draw the I–V characteristic curve of a p–n junction diode in forward and reverse bias.',
 apparatus:['p–n junction diode','Variable DC supply','Milliammeter and microammeter','Voltmeter','Resistor'],
 theory:['In forward bias the current is very small up to the knee voltage and then rises sharply.','In reverse bias only a tiny reverse saturation current flows.','Dynamic resistance r_d = ΔV / ΔI'],
 how:'Set the applied voltage and press Record. Go from −1 V to +1 V in small steps (smaller steps near the knee).',
 cols:[['Voltage V (V)',2],['Current I (mA)',2]],
 read(p,m){return[p.voltage,m('Current')]},
 result(R,p){const F=R.filter(r=>r[1]>=1).sort((a,b)=>a[0]-b[0]);const out=[['Knee voltage set',fx(p.knee,2)+' V']];if(F.length)out.push(['Voltage where I first exceeds 1 mA',fx(F[0][0],2)+' V']);if(F.length>1){const a=F[F.length-2],b=F[F.length-1];if(b[1]!==a[1])out.push(['Dynamic resistance (last two points)',fx((b[0]-a[0])/((b[1]-a[1])/1000),2)+' Ω'])}return out},
 graphs:[{x:r=>r[0],y:r=>r[1],xl:'Voltage V (V)',yl:'Current I (mA)',curve:true}],
 precautions:['Do not exceed the maximum forward current of the diode.','Use a microammeter in reverse bias.','Take closely spaced readings near the knee.'],
 errors:['Diode heating changes the curve.','Meter least counts.'],
 viva:[['What is the knee voltage?','The forward voltage beyond which the current increases rapidly (about 0.7 V for Si, 0.3 V for Ge).'],['Why is the reverse current so small?','It is due only to minority carriers.']]},
'zener-regulator':{name:'Zener diode as a voltage regulator',aim:'To study the Zener diode as a voltage regulator by plotting output voltage against input voltage.',
 apparatus:['Zener diode','Series resistor','Load resistor','Variable DC supply','Voltmeters','Milliammeter'],
 theory:['Above breakdown, the voltage across the Zener stays nearly constant at V_Z.','I_S = (V_in − V_Z) / R_S and I_Z = I_S − I_L'],
 how:'Keep the load fixed. Set the input voltage and press Record; increase the input step by step.',
 cols:[['Input V_in (V)',1],['Output V_out (V)',2],['Zener current I_Z (mA)',2]],
 read(p,m){return[p.input,m('Output voltage'),m('Zener current')]},
 result(R,p){const reg=R.filter(r=>r[2]>.5);const out=[['Zener voltage of diode',fx(+p.zener,2)+' V']];if(reg.length)out.push(...stat('Regulated output',reg.map(r=>r[1]),'V',2));return out},
 graphs:[{x:r=>r[0],y:r=>r[1],xl:'Input V_in (V)',yl:'Output V_out (V)',curve:true}],
 precautions:['The Zener must be reverse biased.','Do not exceed the maximum Zener current.'],
 errors:['Zener voltage changes with temperature.'],
 viva:[['Why is the Zener used in reverse bias?','In reverse breakdown its voltage stays almost constant over a wide range of current.'],['What is the role of the series resistor?','It drops the extra input voltage and limits the current.']]}
};

const KEY=id=>'physica-lab-'+id,load=id=>{try{const r=JSON.parse(localStorage.getItem(KEY(id))||'[]');return Array.isArray(r)?r.filter(x=>Array.isArray(x)&&x.every(Number.isFinite)):[]}catch{return[]}},
  store=(id,R)=>{try{localStorage.setItem(KEY(id),JSON.stringify(R))}catch{}};
const metrics=()=>{const sim=S.sim,p=S.params;let list=[];try{list=sim.metrics(p,S.time)||[]}catch{}const find=l=>list.find(x=>x.label===l)||list.find(x=>String(x.label).startsWith(l));const m=l=>num(find(l)?.value);m.txt=l=>String(find(l)?.value||'');return m};

/* Graph: axes with round ticks, points, and either a least-squares line or a joined curve. */
const NS='http://www.w3.org/2000/svg';
function svg(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e}
function nice(lo,hi){if(lo===hi){lo-=1;hi+=1}const step0=(hi-lo)/5,mag=10**Math.floor(Math.log10(step0)),st=[1,2,2.5,5,10].map(k=>k*mag).find(s=>s>=step0);return{lo:Math.floor(lo/st)*st,hi:Math.ceil(hi/st)*st,st}}
function graph(g,R){const P=R.map(r=>[g.x(r),g.y(r)]).filter(p=>p.every(Number.isFinite));if(P.length<2)return null;
  const W=480,H=300,L=62,B=48,T=14,Rm=28,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);
  const X=nice(Math.min(...xs,g.origin?0:Infinity),Math.max(...xs,g.origin?0:-Infinity)),Y=nice(Math.min(...ys,g.origin?0:Infinity),Math.max(...ys,g.origin?0:-Infinity));
  const sx=v=>L+(v-X.lo)/(X.hi-X.lo)*(W-L-Rm),sy=v=>H-B-(v-Y.lo)/(Y.hi-Y.lo)*(H-B-T);
  const s=svg('svg',{viewBox:`0 0 ${W} ${H}`,class:'lab-graph',role:'img','aria-label':`${g.yl} against ${g.xl}`});
  const dg=st=>Math.max(0,Math.min(4,-Math.floor(Math.log10(st)+1e-9)+(String(st).includes('.25')||String(st).includes('.5')?1:0)));
  for(let v=X.lo;v<=X.hi+X.st/2;v+=X.st){const x=sx(v);s.append(svg('line',{x1:x,y1:T,x2:x,y2:H-B,class:'lab-grid'}));const t=svg('text',{x,y:H-B+16,'text-anchor':'middle'});t.textContent=fx(v,dg(X.st));s.append(t)}
  for(let v=Y.lo;v<=Y.hi+Y.st/2;v+=Y.st){const y=sy(v);s.append(svg('line',{x1:L,y1:y,x2:W-Rm,y2:y,class:'lab-grid'}));const t=svg('text',{x:L-6,y:y+4,'text-anchor':'end'});t.textContent=fx(v,dg(Y.st));s.append(t)}
  s.append(svg('path',{d:`M${L} ${T}V${H-B}H${W-Rm}`,class:'lab-axis'}));
  const xl=svg('text',{x:(L+W-Rm)/2,y:H-8,'text-anchor':'middle',class:'lab-al'});xl.textContent=g.xl;const yl=svg('text',{x:14,y:(T+H-B)/2,'text-anchor':'middle',class:'lab-al',transform:`rotate(-90 14 ${(T+H-B)/2})`});yl.textContent=g.yl;s.append(xl,yl);
  let note='';
  if(g.curve){const Q=[...P].sort((a,b)=>a[0]-b[0]);s.append(svg('path',{d:Q.map((p,i)=>(i?'L':'M')+sx(p[0]).toFixed(1)+' '+sy(p[1]).toFixed(1)).join(''),class:'lab-fit'}))}
  else{const f=fit(P,g.origin);if(f){const x0=g.origin?Math.min(0,X.lo):X.lo,x1=X.hi,cl=v=>Math.max(Y.lo,Math.min(Y.hi,v));
    // clip the fitted line to the plot box
    const pts=[];for(const x of[x0,x1]){const y=f.a+f.b*x;pts.push([x,y])}if(f.b){for(const yb of[Y.lo,Y.hi]){const x=(yb-f.a)/f.b;if(x>=x0&&x<=x1)pts.push([x,yb])}}
    const inb=pts.filter(([x,y])=>y>=Y.lo-1e-12&&y<=Y.hi+1e-12).sort((a,b)=>a[0]-b[0]);if(inb.length>1){const a=inb[0],b=inb[inb.length-1];s.append(svg('line',{x1:sx(a[0]),y1:sy(cl(a[1])),x2:sx(b[0]),y2:sy(cl(b[1])),class:'lab-fit'}))}
    note=`${g.slope||'slope'} = ${fx(f.b,g.sd??3)}`+(g.origin?'':`, intercept = ${fx(f.a,g.sd??3)}`)}}
  for(const [x,y] of P)s.append(svg('circle',{cx:sx(x),cy:sy(y),r:4.5,class:'lab-pt'}));
  const box=el('figure','lab-fig');box.append(s);const cap=el('figcaption','',`${g.yl} vs ${g.xl}${note?' — best-fit line: '+note:''}`);box.append(cap);return box}

/* The notebook card under the stage */
const card=el('section','observe-card lab-card');card.hidden=true;card.dataset.testid='lab-card';card.setAttribute('aria-labelledby','lab-heading');
stage.append(card);
let lab=null,id='';
function rowsTable(L,R,del){const t=el('table','mock-table lab-table'),hd=el('tr');hd.append(el('th','','No.'));for(const [h] of L.cols)hd.append(el('th','',h));if(del)hd.append(el('th','mock-noprint',''));
  const th=el('thead');th.append(hd);const tb=el('tbody');R.forEach((r,i)=>{const tr=el('tr');tr.append(el('td','',String(i+1)));L.cols.forEach(([,d],j)=>tr.append(el('td','',fx(r[j],d))));
    if(del){const td=el('td','mock-noprint');td.append(btn('lab-x','×',()=>{R.splice(i,1);store(id,R);draw()}));td.lastChild.setAttribute('aria-label','Delete reading '+(i+1));tr.append(td)}tb.append(tr)});
  t.append(th,tb);const w=el('div','lab-scroll');w.append(t);return w}
function results(L,R){if(!R.length)return null;const p=S.params,m=metrics();let rs=[];try{rs=L.result(R,p,m)||[]}catch{}const box=el('div','mock-stats lab-stats');for(const [k,v] of rs){const d=el('div');d.append(el('b','',v),el('span','',k));box.append(d)}return box}
function draw(){if(!lab)return;const R=load(id);card.replaceChildren();
  const head=el('div','section-heading'),hh=el('div');hh.append(el('span','small-index','03 / VIRTUAL LAB'));const h=el('h2','',lab.name);h.id='lab-heading';hh.append(h);head.append(hh);
  card.append(head,el('p','lab-aim','Aim: '+lab.aim),el('p','lab-how',lab.how));
  const row=el('div','lab-row');
  const rec=btn('lab-rec','● Record reading',()=>{const r=lab.read(S.params,metrics(),S.time);if(typeof r==='string'){say(r);return}if(!r.every(Number.isFinite)){say('This reading cannot be measured; change the setup.');return}const R2=load(id);if(R2.length>=30){say('Up to 30 readings can be kept.');return}R2.push(r.map(v=>+(+v).toPrecision(10)));store(id,R2);draw();say('Reading '+R2.length+' recorded.')});
  rec.dataset.testid='lab-record';row.append(rec);
  if(R.length){row.append(btn('lab-btn','Undo last',()=>{R.pop();store(id,R);draw()}),btn('lab-btn','Clear table',()=>{if(confirm('Clear all readings of this experiment?')){store(id,[]);draw()}}));const pr=btn('lab-btn lab-pdf','Lab record (PDF)',openRecord);pr.dataset.testid='lab-pdf';row.append(pr)}
  card.append(row);
  const w=lab.warn?.(S.params,R);if(w)card.append(el('p','lab-warn','⚠ '+w));
  if(!R.length){card.append(el('p','lab-empty','No readings yet. Set up the experiment and press “Record reading”.'));return}
  card.append(rowsTable(lab,R,true));const rb=results(lab,R);if(rb)card.append(rb);
  for(const g of lab.graphs||[]){const f=graph(g,R);if(f)card.append(f)}}
function sync(){const nid=S.sim?.id,L=LABS[nid];lab=L||null;id=nid;card.hidden=!L;if(L)draw()}
window.addEventListener('physica-sim',sync);sync();

/* Printable lab record (uses the mock-test report styles, which already print cleanly) */
function openRecord(){const L=lab,R=load(id);if(!L||!R.length)return;let who={};try{who=JSON.parse(localStorage.getItem('physica-lab-who')||'{}')||{}}catch{}
  const wrap=el('div','mock labrec');wrap.setAttribute('role','dialog');wrap.setAttribute('aria-label','Lab record');
  const close=()=>{wrap.remove();document.body.classList.remove('mock-on');removeEventListener('keydown',esc)},esc=e=>{if(e.key==='Escape')close()};addEventListener('keydown',esc);
  const head=el('div','mock-head mock-noprint');head.append(el('div','mock-title','Lab record — '+L.name),btn('mock-go','Download PDF',()=>print()),btn('mock-nav','Close',close));
  const pal=el('div','lab-paper mock-paper');
  const form=el('div','lab-who mock-noprint'),fields=[['name','Student name'],['cls','Class / section'],['roll','Roll no.'],['school','School']],shown=el('p','lab-whoprint');
  const upd=()=>{shown.textContent=fields.map(([k,l])=>who[k]?`${l}: ${who[k]}`:'').filter(Boolean).join('   ·   ')+(fields.some(([k])=>who[k])?'   ·   ':'')+'Date: '+new Date().toLocaleDateString('en-IN')};
  for(const [k,l] of fields){const lb=el('label','lab-f');lb.append(el('span','',l));const i=el('input','mock-in');i.value=who[k]||'';i.maxLength=60;i.addEventListener('input',()=>{who[k]=i.value;try{localStorage.setItem('physica-lab-who',JSON.stringify(who))}catch{}upd()});lb.append(i);form.append(lb)}
  upd();
  const sec=(t,...c)=>{const s=el('section','lab-sec');s.append(el('h3','',t),...c.filter(Boolean));return s},list=a=>{const u=el('ul');for(const x of a)u.append(el('li','',x));return u};
  const p=S.params,m=metrics();let rs=[];try{rs=L.result(R,p,m)||[]}catch{}
  const calc=el('table','mock-table');for(const [k,v] of rs){const tr=el('tr');tr.append(el('th','',k),el('td','',v));calc.append(tr)}
  const graphs=(L.graphs||[]).map(g=>graph(g,R)).filter(Boolean);
  const viva=el('ol','lab-viva');for(const [q,a] of L.viva){const li=el('li');li.append(el('b','',q),el('span','',' '+a));viva.append(li)}
  const doc=el('div','lab-doc');pal.append(doc);
  doc.append(el('p','mock-brand','PHYSICA · VIRTUAL LAB RECORD'),el('h2','lab-title',L.name),shown,form,
    sec('Aim',el('p','',L.aim)),sec('Apparatus',list(L.apparatus)),sec('Theory and formula',list(L.theory)),
    sec('Observations',rowsTable(L,R,false)),sec('Calculations and result',calc),graphs.length?sec('Graph',...graphs):null,
    sec('Precautions',list(L.precautions)),sec('Sources of error',list(L.errors)),sec('Viva voce',viva),
    el('p','lab-foot','Readings taken in the Physica virtual lab (physica.in). Signature of teacher: ____________________'));
  wrap.append(head,pal);document.body.append(wrap);document.body.classList.add('mock-on');head.querySelector('.mock-go').focus()}
window.PhysicaLabs=Object.keys(LABS);
})();
