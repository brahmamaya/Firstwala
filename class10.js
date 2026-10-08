/* Class 10 (NCERT Science, 13 chapters). Most Class 10 topics are already built as Class 11/12 experiments, so
   a Class 10 entry is an alias: its own id, class and chapter, but the original's drawing, 3D scene, hands-on
   controls and lesson (app.js resolves alias ids through window.PhysicaAliasOf). New Class 10-only experiments
   are added by class10-*.js packs with grade 10. */
(() => {
'use strict';
const P='physics',C='chemistry',B='botany',Z='zoology';
// [chapter no, chapter, subject, group, [original ids]]
const CH=[
 [1,'Chemical Reactions and Equations',C,'CHEMICAL SUBSTANCES',['chem-redox-displacement','chem-oxidation-number']],
 [2,'Acids, Bases and Salts',C,'CHEMICAL SUBSTANCES',['chem-ph','chem-buffer']],
 [3,'Metals and Non-metals',C,'CHEMICAL SUBSTANCES',['chem-electron-configuration','chem-faraday-electrolysis']],
 [4,'Carbon and its Compounds',C,'CHEMICAL SUBSTANCES',['chem-hybridisation','chem-chain-isomers','chem-alcohol-hbond']],
 [5,'Life Processes',Z,'THE WORLD OF THE LIVING',['bio-limiting-factors','bio-stomata','bio-enzyme-conditions','bio-breathing-mechanism','bio-respiration-atp','bio-double-circulation','bio-cardiac-cycle','bio-nephron']],
 [6,'Control and Coordination',Z,'THE WORLD OF THE LIVING',['bio-reflex-arc','bio-synapse','bio-action-potential','bio-endocrine-glands','bio-glucose-homeostasis','bio-thyroid-feedback','bio-phototropism']],
 [7,'How do Organisms Reproduce?',B,'THE WORLD OF THE LIVING',['bio-bacterial-growth','bio-mitosis','bio-pollination','bio-double-fertilisation','bio-menstrual-cycle']],
 [8,'Heredity',B,'THE WORLD OF THE LIVING',['bio-monohybrid-cross','bio-dihybrid-cross','bio-sex-linked','bio-natural-selection']],
 [9,'Light – Reflection and Refraction',P,'NATURAL PHENOMENA',['spherical-mirrors','concave-mirror','mirror-images','refraction','apparent-depth','lens','contact-lens-pair']],
 [10,'The Human Eye and the Colourful World',P,'NATURAL PHENOMENA',['prism-dispersion','total-internal-reflection']],
 [11,'Electricity',P,'EFFECTS OF CURRENT',['circuit','resistor-network','electron-drift','cells-combination']],
 [12,'Magnetic Effects of Electric Current',P,'EFFECTS OF CURRENT',['magnet','solenoid','loop-axis-field','force-on-wire']],
 [13,'Our Environment',B,'NATURAL RESOURCES',['bio-energy-pyramid','bio-decomposition','bio-productivity']]
];
const list=[];
for(const [no,chapter,subject,group,ids] of CH)for(const of of ids)list.push({id:'c10-'+of,of,grade:10,chapterNo:no,chapter,subject,group});
window.PhysicaClass10=list;
window.PhysicaAliasOf=Object.assign(window.PhysicaAliasOf||{},Object.fromEntries(list.map(a=>[a.id,a.of])));
})();
