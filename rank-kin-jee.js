/* Rank mode · JEE Mains Physics · Kinematics (same page as Units and Measurements; PYQs come later).
   Loaded with the JEE pack. Plain data plus two diagrams (PhysicaFig specs). Nothing leaves the device. */
(() => {
'use strict';
const F=(g,p,n,f,how,ex,fig)=>({g,p,n,f,how,ex,...(fig?{fig}:{})});
window.PhysicaRankKinJee={
chapter:'Kinematics',
secs:['Basics','Equations of motion','Free fall','Projectile','Relative motion','Graphs'],
table:[['Displacement','L'],['Velocity','LT⁻¹'],['Acceleration','LT⁻²'],['Time','T'],['Angle','none (radian)'],['Force','MLT⁻²'],['Momentum','MLT⁻¹'],['Work or energy','ML²T⁻²']],
formulas:[
F('Basics',1,"Velocity and acceleration",'v = dx/dt · a = dv/dt · average velocity = total displacement ÷ total time','Velocity is the rate of change of position. Acceleration is the rate of change of velocity. Average velocity uses displacement, not distance.','A car goes 40 m east, then 40 m west in 20 s. Displacement 0, so average velocity 0, though the distance is 80 m.'),
F('Equations of motion',1,"Equations of motion (constant acceleration)",'v = u + at · s = ut + ½at² · v² = u² + 2as · s(nth) = u + a(2n − 1)/2','Write what is given: u, v, a, s, t. Pick the equation that has the unknown and none of the missing quantities. Check the signs: take the initial direction as positive.','u = 4 m/s, a = 2 m/s², t = 5 s. s = 4(5) + ½(2)(25) = 45 m, v = 4 + 10 = 14 m/s.'),
F('Equations of motion',0,"Displacement in the nth second",'s(nth) = u + a(2n − 1)/2','Use it when a question asks for the distance covered in one particular second, not the total.','Starts from rest with a = 10 m/s². Distance in the 5th second = 10(9)/2 = 45 m.'),
F('Free fall',0,"Free fall and vertical motion",'h = ½gt² · v = gt · v² = 2gh · time up = u/g · max height H = u²/(2g)','Take g = 10 m/s² for JEE unless told otherwise. Upward is positive, so g is negative for an object that is thrown up.','Dropped from 80 m: t = √(2·80/10) = 4 s, v = 40 m/s. Thrown up at 30 m/s: time up 3 s, H = 900/20 = 45 m.'),
F('Projectile',1,"Projectile on level ground",'T = 2u sinθ/g · H = u² sin²θ/(2g) · R = u² sin2θ/g · R(max) at θ = 45°','Split the velocity into horizontal (u cosθ, constant) and vertical (u sinθ, changes with g). Use the vertical part for time and height, and the horizontal part for range.','u = 20 m/s, θ = 30°: T = 2 s, H = 5 m, R = 34.6 m. At 45° the range is 40 m, the largest possible.'),
F('Projectile',0,"Path of a projectile",'y = x tanθ − gx²/(2u²cos²θ)','The path is a parabola. Use it to find the height at a given horizontal distance, or the point where the projectile is at a given height.','Two projectiles with the same speed and complementary angles (θ and 90° − θ) have the same range.','proj'),
F('Relative motion',1,"Relative velocity",'v(A wrt B) = v(A) − v(B) · the magnitude of v(rel) = √(v1² + v2² − 2v1v2 cosθ)','Relative velocity is the velocity of one object as seen by another. Subtract vectors, do not add speeds. For rain, subtract the man’s velocity from the rain’s velocity.','Rain falls vertically at 8 m/s, a man walks at 6 m/s. Rain relative to the man is 10 m/s at tanθ = 6/8, about 37° from the vertical.'),
F('Relative motion',0,"River and boat",'Shortest time = width ÷ v(boat) · to reach straight across: v(boat) sinθ = v(river) · time = width ÷ (v(boat) cosθ)','To cross in the least time, point the boat straight across. To go straight across, point it upstream at an angle θ with sinθ = v(river)/v(boat).','River 4 km/h, boat 5 km/h, width 1 km. Least time = 1/5 h = 12 min. Straight across: sinθ = 4/5, cosθ = 3/5, time = 1/(5 × 3/5) = 20 min.'),
F('Graphs',1,"Motion graphs",'slope of x–t = velocity · slope of v–t = acceleration · area under v–t = displacement · area under a–t = change in velocity','Read the graph before the formula. A flat v–t line means zero acceleration. A v–t graph below the time axis means motion in the negative direction.','v rises from 0 to 10 m/s in 4 s on a straight line. Area = ½ × 10 × 4 = 20 m.','vt'),
F('Basics',0,"Vectors in kinematics",'v = u + at as vectors · magnitude = √(vx² + vy²) · angle θ: tanθ = vy/vx','Motion in two directions is independent. Solve each direction on its own, then combine with Pythagoras.','A body has vx = 3 m/s and vy = 4 m/s. Speed = 5 m/s, at tanθ = 4/3, about 53° from the x-axis.')
],
look:['v = u + at, s = ut + ½at², v² = u² + 2as','Slope of x–t = velocity; slope of v–t = acceleration','Area under v–t = displacement','Projectile: horizontal speed stays u cosθ','Range R = u² sin2θ / g, largest at 45°','Shortest crossing: width ÷ v(boat)','Relative velocity: subtract, never add'],
notes:[
{h:'Equations of motion',items:['Write u, v, a, s, t before choosing a formula.','Use the equation with no unknown you do not need.','Upward or the direction of motion is positive; be consistent.','Starting from rest: u = 0.']},
{h:'Projectiles',items:['Horizontal velocity is constant; vertical velocity changes at g.','Time of flight depends only on the vertical component.','At the top, vertical velocity is zero, speed is u cosθ.','Equal angles above and below the horizontal: same range, different times.']},
{h:'Graphs',items:['x–t: slope is velocity.','v–t: slope is acceleration; area is displacement.','a–t: area is change in velocity.','A curved x–t graph means changing velocity.']},
{h:'Relative motion',items:['v(A wrt B) = v(A) − v(B).','Draw the vectors head to tail.','Rain and umbrella: the umbrella is tilted towards the relative velocity of rain.']}],
asked:[
{t:'Equations of motion with given data',what:'A body moves with constant acceleration. Two of u, v, a, s, t are given. Find one of the others.',steps:['List u, v, a, s, t, and mark the unknown.','Choose the equation that contains the unknown and only the given quantities.','Solve, then check the sign and the units.'],ex:'u = 0, a = 5 m/s², s = 90 m. v² = 0 + 2(5)(90) = 900, so v = 30 m/s.',tp:'eq'},
{t:'Distance in the nth second',what:'Find the distance covered in one particular second, starting from rest or with a given velocity.',steps:['Write s(nth) = u + a(2n − 1)/2.','Put in u, a and n.','Give the answer with the unit m.'],ex:'u = 2 m/s, a = 4 m/s², n = 3: s = 2 + 4(5)/2 = 12 m.',tp:'eq'},
{t:'Graph-based questions',what:'Given an x–t, v–t or a–t graph, find velocity, acceleration, displacement or distance.',steps:['Read the axes and units first.','Use the slope for the rate, the area for the total.','Note the sign: below the axis means negative.'],ex:'A v–t graph is a triangle from 0 to 6 s, peak 12 m/s. Displacement = ½ × 6 × 12 = 36 m.',tp:'graph'},
{t:'Projectile from ground level',what:'Find time of flight, maximum height or range for a projectile launched from the ground.',steps:['Split u into u cosθ and u sinθ.','Use the vertical part for T and H.','Use R = u² sin2θ / g, and check whether θ = 45° gives the maximum.'],ex:'u = 40 m/s, θ = 60°: T = 2(40)(0.866)/10 = 6.9 s, R = 1600 × 0.866/10 = 139 m.',tp:'kin'},
{t:'Free fall and vertical motion',what:'A body is dropped, or thrown up or down. Find the time, velocity or height.',steps:['Choose the direction of positive.','Set a = +g or −g according to that.','Use v = u + at and v² = u² + 2as.'],ex:'Thrown up at 20 m/s: time to top = 2 s, H = 20 m, total time in air 4 s.',tp:'grav'},
{t:'Relative velocity: rain, wind and boats',what:'Find the velocity of one body as seen from another, or the shortest time to cross a river.',steps:['Write both velocities as vectors.','Subtract the one you are looking from.','For the river, use width ÷ v(boat) for the least time.'],ex:'Wind blows east at 10 m/s, a plane flies north at 40 m/s relative to the air. Its ground velocity is √(10²+40²) = 41.2 m/s.',tp:'rel'}],
guide:{
intro:'Kinematics is the base for Laws of Motion, Work, Energy and many JEE questions. JEE Mains gives about 2 to 3 questions from it, and many need graphs or two-direction working. Aim for 90 seconds per question. About 6 hours in total is enough.',
plan:[
['Day 1 · 90 min','Basics, the equations of motion, free fall, and the nth-second formula.'],
['Day 2 · 90 min','Projectile on level ground, the path, and the range and height formulas.'],
['Day 3 · 90 min','Relative velocity (rain, boats) and motion graphs. Learn the area and slope rules.'],
['Day 4 · 90 min','Practice by question type against the clock. Fix the types where you lose time.'],
['Before the exam · 20 min','Read the Revise tab once and take one mock test.']],
basics:['Vectors: add and subtract, Pythagoras, and the angle with tanθ.','Trigonometry: sin, cos, tan, and sin2θ = 2 sinθ cosθ.','Quadratic equations (for solving t in s = ut + ½at²).','The four standard values of g: 9.8 or 10 m/s².','Reading a graph: axes, units and sign.'],
path:[
{t:'Step 1 · Equations of motion (Day 1)',d:'Learn the four equations and the nth-second formula. Know when each one fits.',ready:'you can pick the right equation for any given set of 3 quantities in under 30 seconds.',go:'formulas'},
{t:'Step 2 · Projectile (Day 2)',d:'Split the velocity, then use the time, height and range formulas.',ready:'you can find T, H and R for any angle without looking.',go:'formulas'},
{t:'Step 3 · Relative velocity and graphs (Day 3)',d:'Subtract vectors for relative velocity. Read slope and area on graphs.',ready:'you can solve the rain and river questions without a diagram.',go:'asked'},
{t:'Step 4 · Practise, then test (Day 4)',d:'Practise by question type first, then take the mock test.',ready:'you score 8 out of 10 in practice twice in a row.',go:'practice',go2:'mock'}],
think:['Read once and name the type: equations, projectile, graph, relative motion or free fall.','Write the given values with units and the sign of the direction.','Choose the equation or the split. Do not start with numbers.','For a projectile, split the velocity first.','For graphs, read the axes before reading the shape.','Check the answer with units and a quick sense check: a 40 m/s projectile cannot land at 2 m.','MCQs have negative marking: remove two wrong options before guessing.'],
watch:['Sign: take one direction as positive and keep it.','At the top of a projectile’s path the vertical velocity is zero, but the acceleration is still g downward. The horizontal acceleration is always zero.','Angle with the horizontal, not the vertical, unless told.','Average speed is distance ÷ time; average velocity is displacement ÷ time.','In relative velocity, the subtraction order matters: v(A wrt B) = v(A) − v(B).','When an object is thrown up, the time up is u/g; the total time in the air is 2u/g.'],
myths:[
['Myth: Average speed equals the magnitude of average velocity.','Truth: They are equal only when the motion is in one direction. Average speed uses distance, average velocity uses displacement.'],
['Myth: A projectile has zero acceleration at its highest point.','Truth: Vertical velocity is zero there, but the acceleration is still g downward.'],
['Myth: The horizontal range is maximum at 90°.','Truth: The range is maximum at 45°. At 90° the projectile goes straight up and the range is zero.'],
['Myth: A body thrown up and falling back has the same speed at the same height.','Truth: Yes, it does (ignoring air). The speed is the same, but the velocity is opposite in direction.'],
['Myth: Relative velocity is found by adding speeds.','Truth: Subtract vectors. Two equal speeds in opposite directions have relative speed 2v, but in the same direction it is zero.'],
['Myth: The area under a–t gives displacement.','Truth: The area under a–t gives the change in velocity. The area under v–t gives displacement.'],
['Myth: A curved x–t graph means constant acceleration.','Truth: A curved x–t graph means changing velocity. Constant acceleration gives a curved x–t graph, but only a straight line in v–t.'],
['Myth: In a graph, a line below the time axis means the object is slowing down.','Truth: It means the velocity is negative. Slowing down depends on the sign of acceleration relative to velocity.']]},
extra:[]
};
})();
