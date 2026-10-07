/* Physica Exam - Board, JEE and NEET practice questions and timed mock tests for the tutor's "Exam" tab (English).
   window.PhysicaExam = practice: t '1' = 1 mark, '3' = 2-3 marks, '5' = 5 marks (board); 'jee' / 'neet' = practice for
   those exams. a = step-by-step answer; o = options and c = the correct one for MCQs; sim = the experiment to try it in.
   window.PhysicaMockBank = the timed mock tests (JEE Main and NEET pattern), separate from the practice questions so a
   student never meets a mock question beforehand. tp = topic (for the topic-wise report), o + c = MCQ, n = numerical
   answer, s = solution (shown only in the report). Chapters so far: Units and Measurements. */
(() => {
'use strict';
window.PhysicaExam={
'Units and Measurements':[
  {t:'1',q:'What is the SI unit of luminous intensity?',a:'candela (cd). It is one of the seven SI base units.'},
  {t:'1',q:'A light-year is a unit of which quantity? Give its value in metres.',a:'Distance (not time). It is the distance light travels in one year:\n1 ly = 3×10⁸ m/s × 3.156×10⁷ s ≈ 9.46×10¹⁵ m.'},
  {t:'1',q:'How many significant figures are there in 0.007 m²?',a:'One. Zeros before the first non-zero digit only fix the decimal point, so only the 7 counts.'},
  {t:'1',sim:'units',q:'Define the least count of a vernier caliper.',a:'Least count = 1 main scale division − 1 vernier scale division.\nFor 10 VSD = 9 MSD of 1 mm: LC = 1 − 0.9 = 0.1 mm.'},
  {t:'1',q:'How many dynes make one newton?',a:'1 N = 1 kg·m/s² = 1000 g × 100 cm/s² = 10⁵ dyne.'},
  {t:'1',sim:'parallax',q:'Define one parsec.',a:'The distance at which 1 AU (Earth–Sun distance) subtends an angle of 1 arcsecond.\n1 pc ≈ 3.08×10¹⁶ m ≈ 3.26 light-years.'},
  {t:'3',sim:'dimensional-analysis',q:'State the principle of homogeneity of dimensions. Use it to check v = u + at.',a:'Every term added or equated in a correct equation must have the same dimensions.\n[v] = [LT⁻¹], [u] = [LT⁻¹], [at] = [LT⁻²][T] = [LT⁻¹].\nAll three terms match, so the equation is dimensionally correct.'},
  {t:'3',q:'Find the dimensions of Planck\'s constant h, using E = hν.',a:'h = E/ν.\n[E] = [ML²T⁻²], [ν] = [T⁻¹].\n[h] = [ML²T⁻²]/[T⁻¹] = [ML²T⁻¹] - the same as angular momentum.'},
  {t:'3',q:'Round off 2.745 and 2.735 to three significant figures.',a:'When the dropped digit is exactly 5, the previous digit stays the same if it is even and goes up by 1 if it is odd.\n2.745 → 2.74 (4 is even)\n2.735 → 2.74 (3 is odd, becomes 4)'},
  {t:'3',q:'In van der Waals\' equation (P + a/V²)(V − b) = RT, find the dimensions of a and b.',a:'Only like quantities can be added or subtracted.\na/V² has the dimensions of pressure: a = [ML⁻¹T⁻²][L³]² = [ML⁵T⁻²].\nb has the dimensions of volume: b = [L³].'},
  {t:'3',sim:'screw-gauge',q:'A screw gauge has pitch 0.5 mm and 50 circular divisions. The main scale reads 3 mm and the 35th circular division is on the line. Find the reading.',a:'LC = pitch / divisions = 0.5/50 = 0.01 mm.\nReading = MSR + CSR × LC = 3 + 35 × 0.01 = 3.35 mm.'},
  {t:'3',sim:'units',q:'A vernier caliper has least count 0.1 mm. The main scale reads 12 mm and the 7th vernier division coincides. Find the length.',a:'Length = MSR + VSR × LC = 12 + 7 × 0.1 = 12.7 mm.'},
  {t:'3',sim:'screw-gauge',q:'A screw gauge has a zero error of −0.03 mm. A wire reads 2.48 mm. What is its true diameter?',a:'True reading = observed − zero error = 2.48 − (−0.03) = 2.51 mm.\n(A negative zero error is added.)'},
  {t:'3',sim:'uncertainty',q:'Distinguish between accuracy and precision.',a:'Accuracy: how close a measurement is to the true value.\nPrecision: how close repeated measurements are to each other (set by the least count).\nExample: true length 3.678 cm. Readings 3.5 cm (LC 0.1 cm) and 3.38 cm (LC 0.01 cm): the first is more accurate, the second more precise.'},
  {t:'3',sim:'error-propagation',q:'P = a²b³/(c√d). The percentage errors in a, b, c, d are 1%, 2%, 3% and 4%. Find the percentage error in P.',a:'Errors always add, each multiplied by its power:\nΔP/P = 2(1%) + 3(2%) + 1(3%) + ½(4%) = 2 + 6 + 3 + 2 = 13%.'},
  {t:'3',sim:'dimensional-analysis',q:'Write any three limitations of dimensional analysis.',a:'1. It cannot find dimensionless constants (like 2π in T = 2π√(l/g)).\n2. It cannot derive relations with sin, log or exponential terms.\n3. It cannot handle a quantity that depends on more than three others (only three equations from M, L, T).\n4. A dimensionally correct equation is not necessarily physically correct.'},
  {t:'5',sim:'dimensional-analysis',q:'The time period T of a simple pendulum depends on its length l, the mass m of the bob and g. Derive the formula using dimensions.',a:'Let T = k lᵃ mᵇ gᶜ (k has no dimensions).\n[T] = [L]ᵃ [M]ᵇ [LT⁻²]ᶜ = [Mᵇ Lᵃ⁺ᶜ T⁻²ᶜ].\nCompare powers: M: b = 0; T: −2c = 1 → c = −½; L: a + c = 0 → a = ½.\nSo T = k√(l/g). It does not depend on mass. Experiment gives k = 2π, so T = 2π√(l/g).'},
  {t:'5',q:'The force F on a body moving in a circle depends on its mass m, speed v and radius r. Derive the formula using dimensions.',a:'Let F = k mᵃ vᵇ rᶜ.\n[MLT⁻²] = [M]ᵃ [LT⁻¹]ᵇ [L]ᶜ = [Mᵃ Lᵇ⁺ᶜ T⁻ᵇ].\nCompare: a = 1; −b = −2 → b = 2; b + c = 1 → c = −1.\nSo F = k mv²/r (with k = 1: F = mv²/r).'},
  {t:'5',sim:'uncertainty',q:'The period of a pendulum is measured as 2.63 s, 2.56 s, 2.42 s, 2.71 s and 2.80 s. Find the mean value, mean absolute error, relative error and percentage error.',a:'Mean T = (2.63 + 2.56 + 2.42 + 2.71 + 2.80)/5 = 13.12/5 = 2.624 ≈ 2.62 s.\nAbsolute errors: 0.01, 0.06, 0.20, 0.09, 0.18 s.\nMean absolute error = 0.54/5 = 0.108 ≈ 0.11 s.\nResult: T = 2.62 ± 0.11 s.\nRelative error = 0.11/2.62 ≈ 0.04; percentage error ≈ 4%.'},
  {t:'neet',q:'The dimensional formula of the gravitational constant G is:',o:['[M⁻¹L³T⁻²]','[ML²T⁻²]','[M⁻¹L²T⁻¹]','[ML³T⁻²]'],c:0,a:'F = Gm²/r² → G = Fr²/m² = [MLT⁻²][L²]/[M²] = [M⁻¹L³T⁻²].'},
  {t:'neet',q:'How many significant figures are there in 6.320?',o:['2','3','4','5'],c:2,a:'Four. A trailing zero after the decimal point is significant.'},
  {t:'neet',sim:'error-propagation',q:'The radius of a sphere is measured with a 2% error. The error in its volume is:',o:['2%','4%','6%','8%'],c:2,a:'V = (4/3)πr³, so ΔV/V = 3 × Δr/r = 3 × 2% = 6%.'},
  {t:'neet',q:'Which pair has the same dimensions?',o:['Work and power','Work and torque','Force and momentum','Impulse and force'],c:1,a:'Work = F × d and torque = r × F, both [ML²T⁻²].'},
  {t:'neet',sim:'screw-gauge',q:'A screw gauge has pitch 1 mm and 100 circular divisions. Its least count is:',o:['0.1 mm','0.01 mm','0.001 mm','1 mm'],c:1,a:'LC = pitch / number of divisions = 1/100 = 0.01 mm.'},
  {t:'neet',q:'4.234 × 1.005, written to the correct significant figures, is:',o:['4.255','4.2552','4.26','4.25517'],c:0,a:'4.234 × 1.005 = 4.25517. Both numbers have 4 significant figures, so the answer keeps 4: 4.255.'},
  {t:'neet',q:'The SI unit of impulse is:',o:['N/s','N·s','N·m','kg/s'],c:1,a:'Impulse = force × time, so N·s (= kg·m/s, the unit of momentum).'},
  {t:'jee',q:'v = at + b/(t + c), where v is velocity and t is time. Find the dimensions of a, b and c.',a:'c is added to t, so [c] = [T].\nat is a velocity: [a] = [LT⁻¹]/[T] = [LT⁻²].\nb/(t + c) is a velocity: [b] = [LT⁻¹][T] = [L].'},
  {t:'jee',q:'If the units of length and force are both made four times bigger, the unit of energy becomes:',o:['4 times','8 times','16 times','1/16 times'],c:2,a:'Energy = force × length, so the new unit = 4 × 4 = 16 times the old one.'},
  {t:'jee',q:'The mass and the speed of a body are each measured with a 2% error. Find the maximum percentage error in its kinetic energy.',a:'K = ½mv², so ΔK/K = Δm/m + 2Δv/v = 2% + 2 × 2% = 6%.'},
  {t:'jee',q:'A stopwatch has a least count of 0.2 s. The time for 20 oscillations of a pendulum is 25 s. Find the percentage error in the time period.',o:['0.8%','1.8%','8%','0.2%'],c:0,a:'T = t/20, so ΔT/T = Δt/t = 0.2/25 = 0.008 = 0.8%.\n(Timing many oscillations keeps the error small.)'},
  {t:'jee',sim:'dimensional-analysis',q:'In P = (α/β) e^(−αz/kθ), P is pressure, z is distance, k is Boltzmann\'s constant and θ is temperature. Find the dimensions of β.',a:'The power of e has no dimensions, so α = kθ/z.\n[kθ] = energy = [ML²T⁻²], so [α] = [ML²T⁻²]/[L] = [MLT⁻²].\nP = α/β gives [β] = [α]/[P] = [MLT⁻²]/[ML⁻¹T⁻²] = [L²].'}
]};

window.PhysicaMockBank={
'Units and Measurements':{
  topics:{units:'Units and SI',dims:'Dimensional analysis',sig:'Significant figures',err:'Errors in measurement',inst:'Vernier and screw gauge'},
  jee:[
    {tp:'dims',q:'If velocity V, time T and force F are taken as fundamental quantities, the dimensions of mass are:',o:['[FTV⁻¹]','[FT⁻¹V]','[FV⁻¹T⁻¹]','[FVT]'],c:0,s:'F = ma = M·V/T, so M = FT/V = [FTV⁻¹].'},
    {tp:'dims',q:'The dimensions of the permittivity of free space ε₀ are:',o:['[ML³T⁻⁴A⁻²]','[M⁻¹L⁻³T⁴A²]','[M⁻¹L⁻²T⁴A²]','[M⁻¹L³T⁴A²]'],c:1,s:'From F = q²/(4πε₀r²): ε₀ = q²/(Fr²) = [A²T²]/([MLT⁻²][L²]) = [M⁻¹L⁻³T⁴A²].'},
    {tp:'dims',q:'m is a mass and k is the force constant of a spring. Which of these has the dimensions of time?',o:['√(k/m)','mk','√(m/k)','m/k'],c:2,s:'[k] = force/length = [MT⁻²]. √(m/k) = √([M]/[MT⁻²]) = [T].'},
    {tp:'dims',q:'In P = (α/β) e^(−αz/kθ), P is pressure, z distance, k Boltzmann\'s constant and θ temperature. The dimensions of α are:',o:['[L²]','[ML²T⁻²]','[MLT⁻²]','[M⁰L⁰T⁰]'],c:2,s:'The power of e is dimensionless, so α = kθ/z = [ML²T⁻²]/[L] = [MLT⁻²].'},
    {tp:'sig',q:'The number of significant figures in 0.06900 is:',o:['2','3','5','4'],c:3,s:'Leading zeros do not count; trailing zeros after the decimal do: 6, 9, 0, 0 → 4.'},
    {tp:'sig',q:'The sides of a rectangle are 2.5 cm and 1.25 cm. Its area, to the correct significant figures, is:',o:['3.125 cm²','3.13 cm²','3.1 cm²','3 cm²'],c:2,s:'2.5 × 1.25 = 3.125. The answer keeps the fewest significant figures (2.5 has two): 3.1 cm².'},
    {tp:'err',q:'V = (100 ± 5) V and I = (10 ± 0.2) A. The percentage error in R = V/I is:',o:['7%','3%','5%','10%'],c:0,s:'ΔR/R = ΔV/V + ΔI/I = 5% + 2% = 7%.'},
    {tp:'err',q:'The mass and the side of a cube are measured with errors of 3% and 2%. The maximum error in its density is:',o:['5%','9%','7%','11%'],c:1,s:'ρ = m/L³, so Δρ/ρ = Δm/m + 3ΔL/L = 3% + 6% = 9%.'},
    {tp:'inst',q:'In a vernier caliper, 1 MSD = 1 mm and 20 vernier divisions equal 19 main scale divisions. Its least count is:',o:['0.1 mm','0.01 mm','0.05 mm','0.5 mm'],c:2,s:'1 VSD = 19/20 mm, so LC = 1 MSD − 1 VSD = 1 − 0.95 = 0.05 mm.'},
    {tp:'inst',q:'A screw gauge (pitch 0.5 mm, 50 circular divisions) has a zero error of +0.02 mm. The main scale reads 2.5 mm and the 20th circular division is on the line. The corrected reading is:',o:['2.70 mm','2.72 mm','2.66 mm','2.68 mm'],c:3,s:'LC = 0.5/50 = 0.01 mm. Reading = 2.5 + 20 × 0.01 = 2.70 mm. Corrected = 2.70 − 0.02 = 2.68 mm.'},
    {tp:'err',q:'g is found from T = 2π√(l/g). The length l has a 1% error and the period T a 2% error. Find the percentage error in g.',n:5,s:'g = 4π²l/T², so Δg/g = Δl/l + 2ΔT/T = 1% + 4% = 5.'},
    {tp:'units',q:'Young\'s modulus of steel is 2 × 10¹¹ N/m². In CGS units it is 2 × 10ⁿ dyne/cm². Find n.',n:12,s:'1 N/m² = 10⁵ dyne / 10⁴ cm² = 10 dyne/cm². So 2 × 10¹¹ N/m² = 2 × 10¹² dyne/cm², n = 12.'},
    {tp:'inst',q:'A screw gauge has a pitch of 1 mm and 100 circular divisions. Find its least count in micrometres (µm).',n:10,s:'LC = 1 mm / 100 = 0.01 mm = 10 µm.'},
    {tp:'err',q:'The momentum p of a body is measured with a 3% error. Find the percentage error in its kinetic energy K = p²/2m (mass known exactly).',n:6,s:'ΔK/K = 2Δp/p = 2 × 3% = 6.'},
    {tp:'dims',q:'The period of a vibrating drop is T ∝ ρᵃ rᵇ Sᶜ (ρ density, r radius, S surface tension). If b = x/2, find x.',n:3,s:'[T] = [ML⁻³]ᵃ [L]ᵇ [MT⁻²]ᶜ. M: a + c = 0; T: −2c = 1 → c = −½, a = ½; L: −3a + b = 0 → b = 3/2. So x = 3.'}
  ],
  neet:[
    {tp:'units',q:'Which of these is NOT a fundamental SI unit?',o:['ampere','candela','newton','kelvin'],c:2,s:'The newton (kg·m/s²) is a derived unit.'},
    {tp:'units',q:'1 ångström (Å) is equal to:',o:['10⁻⁸ m','10⁻¹⁰ m','10⁻¹² m','10⁻¹⁵ m'],c:1,s:'1 Å = 10⁻¹⁰ m (10⁻¹⁵ m is a fermi).'},
    {tp:'units',q:'The parsec is a unit of:',o:['time','velocity','angle','distance'],c:3,s:'1 parsec ≈ 3.08 × 10¹⁶ m: a unit of distance.'},
    {tp:'units',q:'1 kWh is equal to:',o:['3.6 × 10⁶ J','3.6 × 10³ J','3.6 × 10⁵ J','1000 J'],c:0,s:'1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J.'},
    {tp:'dims',q:'The dimensional formula of pressure is:',o:['[MLT⁻²]','[ML⁻¹T⁻²]','[ML²T⁻²]','[ML⁻²T⁻²]'],c:1,s:'P = F/A = [MLT⁻²]/[L²] = [ML⁻¹T⁻²].'},
    {tp:'dims',q:'Which of these is dimensionless?',o:['stress','force constant','angular velocity','strain'],c:3,s:'Strain = change in length / length: no dimensions.'},
    {tp:'dims',q:'Which pair has the same dimensions?',o:['Planck\'s constant and angular momentum','Force and work','Momentum and energy','Pressure and force'],c:0,s:'Both are [ML²T⁻¹].'},
    {tp:'dims',q:'The dimensions of surface tension are:',o:['[MLT⁻²]','[ML⁻¹T⁻²]','[MT⁻²]','[MT⁻¹]'],c:2,s:'S = force/length = [MLT⁻²]/[L] = [MT⁻²].'},
    {tp:'dims',q:'E is energy and h is Planck\'s constant. E/h has the dimensions of:',o:['velocity','frequency','momentum','time'],c:1,s:'E = hν, so E/h = ν: frequency, [T⁻¹].'},
    {tp:'dims',q:'From Stokes\' law F = 6πηrv, the dimensions of the coefficient of viscosity η are:',o:['[ML⁻¹T⁻¹]','[MLT⁻¹]','[ML⁻²T⁻¹]','[ML⁻¹T⁻²]'],c:0,s:'η = F/(rv) = [MLT⁻²]/([L][LT⁻¹]) = [ML⁻¹T⁻¹].'},
    {tp:'sig',q:'The number of significant figures in 2.0500 is:',o:['3','4','5','2'],c:2,s:'All five digits count: zeros between digits and trailing zeros after the decimal are significant.'},
    {tp:'sig',q:'The number of significant figures in 3.0 × 10⁵ is:',o:['1','6','5','2'],c:3,s:'Only the digits before the power of ten count: 3 and 0 → 2.'},
    {tp:'sig',q:'12.11 + 18.0 + 1.013, to the correct significant figures, is:',o:['31.123','31.12','31.1','31'],c:2,s:'Sum = 31.123. In addition, keep the fewest decimal places (18.0 has one): 31.1.'},
    {tp:'err',q:'The side of a square is measured with a 2% error. The error in its area is:',o:['2%','4%','1%','8%'],c:1,s:'A = L², so ΔA/A = 2ΔL/L = 4%.'},
    {tp:'err',q:'A = 5.0 ± 0.1 and B = 3.0 ± 0.1. Then A − B is:',o:['2.0 ± 0','2.0 ± 0.1','2.0 ± 0.2','2.0 ± 0.05'],c:2,s:'In subtraction too, absolute errors add: 0.1 + 0.1 = 0.2.'},
    {tp:'err',q:'Three readings are 2.4 s, 2.6 s and 2.5 s. The mean absolute error is about:',o:['0.07 s','0.1 s','0.05 s','0.2 s'],c:0,s:'Mean = 2.5 s. Absolute errors: 0.1, 0.1, 0. Mean = 0.2/3 ≈ 0.07 s.'},
    {tp:'err',q:'For Z = A⁴B^(1/3)/(C·D^(3/2)), the relative error ΔZ/Z is:',o:['4ΔA/A + ⅓ΔB/B − ΔC/C − (3/2)ΔD/D','4ΔA/A + ⅓ΔB/B + ΔC/C + (3/2)ΔD/D','ΔA/A + ΔB/B + ΔC/C + ΔD/D','4ΔA/A + 3ΔB/B + ΔC/C + (2/3)ΔD/D'],c:1,s:'Each relative error is multiplied by its power, and all of them add (never subtract).'},
    {tp:'inst',q:'In a vernier caliper, 1 MSD = 0.5 mm and 10 vernier divisions equal 9 main scale divisions. Its least count is:',o:['0.5 mm','0.1 mm','0.05 mm','0.01 mm'],c:2,s:'LC = 1 MSD / number of VSD = 0.5/10 = 0.05 mm.'},
    {tp:'inst',q:'A screw gauge has pitch 0.5 mm and 50 circular divisions. The main scale reads 4 mm and the 12th circular division is on the line. The reading is:',o:['4.12 mm','4.06 mm','4.24 mm','4.012 mm'],c:0,s:'LC = 0.5/50 = 0.01 mm. Reading = 4 + 12 × 0.01 = 4.12 mm.'},
    {tp:'inst',q:'A vernier caliper has a positive zero error of 0.02 cm. A rod reads 3.25 cm. Its true length is:',o:['3.27 cm','3.25 cm','3.21 cm','3.23 cm'],c:3,s:'True = observed − zero error = 3.25 − 0.02 = 3.23 cm.'}
  ]}
};
})();
